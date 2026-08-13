import { PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { loadLandlordStanding } from "@/lib/crm/deal-projection";
import { buildIntakeConfirmationEmail, buildIntakeNotificationEmail } from "@/lib/crm/intake-emails";
import { appendPropertyIntakeImageSummary, createPropertyIntake, propertyIntakeSchema } from "@/lib/crm/property-intake";
import { db } from "@/lib/crm/db";
import { imageContentHash } from "@/lib/crm/image-dedup";
import { sniffImageType } from "@/lib/crm/image-type";
import { normalizePhoneE164 } from "@/lib/crm/phone-links";
import { R2_BUCKET, r2 } from "@/lib/crm/r2";
import { outboxMessages, propertyImages } from "@/lib/crm/schema";
import { ensureShareLink } from "@/lib/crm/share-links";
import { intakeConfirmSms } from "@/lib/crm/sms-templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 60 * 1024 * 1024;

function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

function filesFrom(formData: FormData) {
  return formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
}

async function uploadImage(propertyId: string, file: File, sortOrder: number, isPrimary: boolean, seenHashes: Set<string>) {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("image_too_large");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageType(bytes);
  if (!sniffed) {
    throw new Error("invalid_image_type");
  }

  // Innehålls-dedup: samma foto bifogat två gånger i samma inskick lagras en gång.
  const hash = imageContentHash(bytes);
  if (seenHashes.has(hash)) {
    throw new Error("duplicate_image");
  }
  seenHashes.add(hash);

  const key = `properties/${propertyId}/${nanoid()}.${sniffed.ext}`;
  await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: bytes, ContentType: sniffed.mime }));

  const [row] = await db
    .insert(propertyImages)
    .values({
      id: nanoid(),
      propertyId,
      key,
      fileName: file.name,
      sortOrder,
      isPrimary,
    })
    .returning();

  return row;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return fail("expected_multipart_form_data", 415);
    }

    const formData = await req.formData();
    const rawPayload = formData.get("payload");
    if (typeof rawPayload !== "string") {
      return fail("missing_payload");
    }

    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(rawPayload);
    } catch {
      return fail("invalid_payload_json");
    }

    const parsed = propertyIntakeSchema.safeParse(parsedPayload);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "invalid_property_intake", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (parsed.data.website?.trim()) {
      // Låtsas-lyckat svar med samma form som det riktiga — klienten kräver
      // propertyId och kastade annars, vilket avslöjade honeypoten för botten.
      return NextResponse.json({ success: true, skipped: true, propertyId: nanoid(), imageCount: 0, imageErrors: [], agreement: null });
    }

    const files = filesFrom(formData);
    if (files.length > MAX_IMAGES) {
      return fail("too_many_images");
    }
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_IMAGE_BYTES) {
      return fail("images_too_large");
    }

    const { property, owner } = await createPropertyIntake(parsed.data);

    let imageCount = 0;
    const imageErrors: string[] = [];
    const seenHashes = new Set<string>();
    for (const [index, file] of files.entries()) {
      try {
        await uploadImage(property.id, file, index, imageCount === 0, seenHashes);
        imageCount += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : "image_upload_failed";
        imageErrors.push(`${file.name || `bild ${index + 1}`}: ${message}`);
      }
    }

    await appendPropertyIntakeImageSummary(property.id, imageCount, imageErrors.length);

    // Del 2 av registreringen: uthyrarens egen sida (publiceringsgodkännande +
    // uppdragssignering). Fristående uthyrarlänk (ownerId, createdBy null =
    // intagsflödet). Skapas för ALLA ägartyper — även företag ska kunna godkänna
    // publicering; påminnelse-cronen filtrerar fortfarande på privatperson.
    // Får aldrig fälla intaget — bostaden är redan sparad.
    const ownerId = owner?.id ?? property.ownerId ?? null;
    let agreement: { token: string; alreadySigned: boolean } | null = null;
    if (ownerId) {
      try {
        const [standing, link] = await Promise.all([
          loadLandlordStanding(ownerId),
          ensureShareLink({ audience: "landlord", ownerId }),
        ]);
        agreement = { token: link.token, alreadySigned: standing?.agreementAccepted ?? false };
      } catch (error) {
        console.error("Intake agreement link failed", error);
      }
    }

    // Automatiska kvitton — husägaren ska känna sig sedd direkt, utan att Kajsa
    // handlägger något. E-post om adress finns; annars SMS via Mac-agenten
    // (transaktionskvitto på husägarens eget inskick — köas direkt, inte utkast).
    // Kajsa får alltid en notis. Inget av detta får fälla intaget.
    const ownerEmail = parsed.data.ownerEmail?.trim() || null;
    const ownerPhone = normalizePhoneE164(parsed.data.ownerPhone ?? null);
    const ownerName = parsed.data.ownerName?.trim() || null;

    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM || "StayOnSite <onboarding@resend.dev>";

      const notification = buildIntakeNotificationEmail({
        propertyId: property.id,
        ownerName,
        ownerPhone,
        ownerEmail,
        ownerType: parsed.data.ownerType ?? null,
        address: property.address,
        city: property.city,
        imageCount,
        imageErrors,
      });
      // OBS: Resend kastar inte vid API-fel utan returnerar { error } — båda
      // vägarna måste loggas, annars försvinner misslyckade kvitton tyst.
      const logSend = (label: string) => (result: { error?: unknown } | void) => {
        if (result && result.error) console.error(`${label} failed`, result.error);
      };
      const sends: Promise<unknown>[] = [
        resend.emails
          .send({
            from,
            to: process.env.CONTACT_FORM_TO || "kajsa@stayonsite.se",
            subject: notification.subject,
            text: notification.text,
            html: notification.html,
          })
          .then(logSend("Intake notification email"))
          .catch((e) => console.error("Intake notification email failed", e)),
      ];

      if (ownerEmail) {
        const confirmation = buildIntakeConfirmationEmail({
          ownerName,
          address: property.address,
          city: property.city,
          imageCount,
          token: agreement?.token ?? null,
        });
        sends.push(
          resend.emails
            .send({
              from,
              to: ownerEmail,
              replyTo: "kajsa@stayonsite.se",
              subject: confirmation.subject,
              text: confirmation.text,
              html: confirmation.html,
            })
            .then(logSend("Intake confirmation email"))
            .catch((e) => console.error("Intake confirmation email failed", e)),
        );
      }
      await Promise.all(sends);
    } catch (error) {
      console.error("Intake emails failed", error);
    }

    if (!ownerEmail && ownerPhone) {
      try {
        await db.insert(outboxMessages).values({
          id: nanoid(),
          toPhone: ownerPhone,
          body: intakeConfirmSms(ownerName, agreement?.token ?? null),
          status: "queued",
          ownerId,
          source: "intake",
        });
      } catch (error) {
        console.error("Intake confirmation SMS queue failed", error);
      }
    }

    return NextResponse.json({
      success: true,
      propertyId: property.id,
      ownerId,
      imageCount,
      imageErrors,
      agreement,
    }, { status: 201 });
  } catch (error) {
    console.error("Property intake failed", error);
    return NextResponse.json({ success: false, error: "property_intake_failed" }, { status: 500 });
  }
}
