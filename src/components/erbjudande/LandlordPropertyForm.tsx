"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { LandlordProperty, LandlordPropertyInput } from "@/lib/crm/landlord-property-input";
import { compressImage } from "@/lib/image-compress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Photo = { id: string; fileName: string | null; url: string };
const numberFields = [
  ["rentIn", "Önskad hyra (kr/månad)", 10000000, "0.01"],
  ["squareMeters", "Boyta (m²)", 1000000, "0.01"],
  ["bedrooms", "Antal sovrum", 10000, "1"],
  ["beds", "Antal bäddar", 10000, "1"],
] as const;

export function LandlordPropertyForm({ token, property }: { token: string; property: LandlordProperty }) {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [fileKey, setFileKey] = useState(0);
  const base = `/api/share/${token}/properties/${property.id}`;

  useEffect(() => {
    let active = true;
    fetch(`${base}/images`, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error();
      const result: Photo[] = await response.json();
      if (active) setPhotos(result);
    }).catch(() => { if (active) setPhotoError("Bilderna kunde inte hämtas. Ladda om sidan för att försöka igen."); });
    return () => { active = false; };
  }, [base]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nullable = (name: string) => String(data.get(name) ?? "").trim() || null;
    const body: LandlordPropertyInput = {
      publicDescription: nullable("publicDescription"), availability: nullable("availability"),
      moveInFrom: nullable("moveInFrom"), availableTo: nullable("availableTo"),
    };
    for (const [name] of numberFields) body[name] = nullable(name) === null ? null : Number(data.get(name));
    setBusy(true); setError(""); setSaved(false);
    try {
      const response = await fetch(base, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "Uppgifterna kunde inte sparas. Försök igen.");
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uppgifterna kunde inte sparas. Försök igen.");
    } finally { setBusy(false); }
  }

  async function upload() {
    setUploading(true); setPhotoError(""); setUploadMessage("");
    const failed: File[] = [];
    const errors: string[] = [];
    let added = 0;
    for (const raw of files) {
      try {
        const file = await compressImage(raw, { maxDim: 1400, quality: 0.72 });
        if (file.size > 4 * 1024 * 1024) throw new Error("Bilden är för stor. Välj en mindre bild.");
        const data = new FormData(); data.append("file", file);
        data.append("sortOrder", String(photos.length + added));
        const response = await fetch(`${base}/images`, { method: "POST", body: data });
        const result = await response.json().catch(() => ({}));
        // Duplicate means it is already saved; don't keep retrying it.
        if (!response.ok && response.status !== 409) throw new Error(result.error || "Uppladdningen misslyckades.");
        if (response.ok) added++;
      } catch (err) {
        failed.push(raw);
        errors.push(`${raw.name}: ${err instanceof Error ? err.message : "Uppladdningen misslyckades."}`);
      }
    }
    setFiles(failed); setFileKey((key) => key + 1);
    setUploadMessage(added ? `${added} ${added === 1 ? "bild sparad" : "bilder sparade"}.` : "");
    try {
      const response = await fetch(`${base}/images`, { cache: "no-store" });
      if (!response.ok) throw new Error();
      setPhotos(await response.json());
    } catch { errors.push("Kunde inte uppdatera bildlistan. Ladda om sidan för att se sparade bilder."); }
    setPhotoError(errors.join(" "));
    setUploading(false);
  }

  return (
    <section className="space-y-6 rounded-2xl border bg-white p-5 sm:p-8" aria-labelledby={`${property.id}-heading`}>
      <div>
        <h2 id={`${property.id}-heading`} className="text-xl font-semibold text-nordic-900">{property.address || "Min bostad"}</h2>
        {property.city && <p className="mt-1 text-sm text-nordic-700">{property.city}</p>}
      </div>
      <form onSubmit={save} onChange={() => setSaved(false)} className="space-y-5">
        <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
          <label className="block space-y-2 text-sm font-medium">
            <span>Beskrivning av bostaden</span>
            <Textarea name="publicDescription" defaultValue={property.publicDescription ?? ""} maxLength={5000} rows={5} />
            <span className="block text-xs font-normal text-muted-foreground">Beskriv bostaden och vad som ingår. Texten kan visas i annonsen — skriv inte kontaktuppgifter eller exakt adress här.</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            {numberFields.map(([name, label, max, step]) => (
              <label key={name} className="block space-y-2 text-sm font-medium">
                <span>{label}</span>
                <Input name={name} type="number" min={0} max={max} step={step} defaultValue={property[name] ?? ""} />
              </label>
            ))}
            <label className="block space-y-2 text-sm font-medium">
              <span>Ledig från</span><Input name="moveInFrom" type="date" defaultValue={property.moveInFrom ?? ""} />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Ledig till (lämna tomt för tills vidare)</span><Input name="availableTo" type="date" defaultValue={property.availableTo ?? ""} />
            </label>
          </div>
          <label className="block space-y-2 text-sm font-medium">
            <span>Övrigt om tillgängligheten</span>
            <Textarea name="availability" defaultValue={property.availability ?? ""} maxLength={1000} rows={2} placeholder="Till exempel flexibel inflyttning eller redan bokade perioder" />
          </label>
          <p className="text-xs text-muted-foreground">Önskad hyra och tillgänglighet gäller kommande uthyrningar. Redan överenskomna villkor ändras inte.</p>
          <Button type="submit" className="w-full rounded-full bg-[#ff6300] text-white hover:bg-[#e65800] sm:w-auto">
            {busy ? "Sparar…" : "Spara uppgifter"}
          </Button>
        </fieldset>
        {saved && <p role="status" className="text-sm font-medium text-green-800">Dina uppgifter är sparade. Du kan komma tillbaka via samma länk när du vill uppdatera dem.</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </form>
      <div className="space-y-4 border-t pt-6">
        <h3 className="font-semibold text-nordic-900">Bilder på bostaden</h3>
        {photos.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => <img key={photo.id} src={photo.url} alt={photo.fileName || "Bild på bostaden"} className="aspect-[4/3] w-full rounded-lg object-cover" loading="lazy" />)}
        </div>}
        <label className="block space-y-2 text-sm font-medium">
          <span>Lägg till bilder (upp till 10 åt gången)</span>
          <Input key={fileKey} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic" multiple disabled={uploading}
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              setUploadMessage("");
              if (selected.length > 10 || selected.reduce((sum, file) => sum + file.size, 0) > 60 * 1024 * 1024) {
                setPhotoError("Välj högst 10 bilder och sammanlagt högst 60 MB."); setFiles([]); return;
              }
              setPhotoError(""); setFiles(selected);
            }} />
        </label>
        {files.length > 0 && <p className="break-words text-xs text-muted-foreground">Valda bilder: {files.map((file) => file.name).join(", ")}</p>}
        <Button type="button" variant="outline" disabled={uploading || files.length === 0} onClick={upload}>
          {uploading ? "Laddar upp…" : "Ladda upp bilder"}
        </Button>
        {uploadMessage && <p role="status" className="text-sm text-green-800">{uploadMessage}</p>}
        {photoError && <p role="alert" className="text-sm text-red-700">{photoError}</p>}
      </div>
    </section>
  );
}
