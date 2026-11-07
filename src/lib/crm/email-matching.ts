// Ren matchningslogik för Gmail-synken: vilka mejl hör till vilket företag eller
// vilken uthyrare, och vilka okända avsändare är värda att föreslå som nya kontakter.
// Inga databas- eller nätverksanrop här, så att reglerna kan testas isolerat.

// Gratis-/privatadresser: en domän här säger ingenting om vilket företag avsändaren
// tillhör, så den används aldrig för domänmatchning.
const FREEMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "hotmail.com", "hotmail.se", "hotmail.co.uk", "outlook.com", "outlook.se",
  "live.com", "live.se", "msn.com", "yahoo.com", "yahoo.se", "yahoo.co.uk", "ymail.com", "icloud.com",
  "me.com", "mac.com", "aol.com", "proton.me", "protonmail.com", "pm.me", "gmx.com", "gmx.de", "gmx.net",
  "web.de", "t-online.de", "mail.com", "zoho.com", "yandex.com", "yandex.ru", "mail.ru",
  "telia.com", "telia.se", "bredband.net", "bredband2.com", "spray.se", "tele2.se", "comhem.se",
  "bahnhof.se", "ownit.se", "passagen.se", "glocalnet.net", "home.se",
  "wp.pl", "o2.pl", "onet.pl", "op.pl", "interia.pl", "interia.eu", "poczta.fm", "tlen.pl", "gazeta.pl",
  "seznam.cz", "centrum.cz", "libero.it", "free.fr", "orange.fr", "laposte.net", "inbox.lv", "inbox.lt",
]);

// Egna domäner: adresser här är Kajsa/StayOnSite själva, aldrig en motpart.
const OWN_DOMAINS = new Set(["stayonsite.se", "hyrutsmart.se"]);

export interface Address {
  email: string;
  name: string | null;
}

export function normalizeEmail(value: string | null | undefined): string | null {
  const v = (value ?? "").trim().toLowerCase().replace(/^mailto:/, "");
  return /^[^\s@<>,;"']+@[^\s@<>,;"']+\.[a-z0-9-]{2,}$/.test(v) ? v : null;
}

export function emailDomain(email: string): string {
  return email.slice(email.lastIndexOf("@") + 1);
}

export function isFreemailDomain(domain: string): boolean {
  return FREEMAIL_DOMAINS.has(domain);
}

export function isOwnDomain(domain: string): boolean {
  return [...OWN_DOMAINS].some((own) => domain === own || domain.endsWith(`.${own}`));
}

// Ett CRM-fält kan innehålla flera adresser ("a@x.se; b@x.se") — dela upp dem.
export function splitStoredEmails(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(/[\s,;]+/)
    .map((part) => normalizeEmail(part))
    .filter((e): e is string => Boolean(e));
}

// Tolkar en adressrubrik (From/To/Cc). Klarar visningsnamn med komma inom citat,
// t.ex. "Svensson, Anna" <anna@bygg.se>, och adresser utan visningsnamn.
export function parseAddressList(headerValue: string | null | undefined): Address[] {
  const value = headerValue ?? "";
  const result: Address[] = [];
  const seen = new Set<string>();
  const pattern = /(?:"((?:[^"\\]|\\.)*)"|([^,<>"]*?))\s*<([^<>]+)>|([^\s<>,;"']+@[^\s<>,;"']+)/g;
  for (const match of value.matchAll(pattern)) {
    const email = normalizeEmail(match[3] ?? match[4]);
    if (!email || seen.has(email)) continue;
    seen.add(email);
    const rawName = (match[1] ?? match[2] ?? "").replace(/\\"/g, '"').trim();
    result.push({ email, name: rawName && rawName.toLowerCase() !== email ? rawName : null });
  }
  return result;
}

// Webbplats → domän: "https://www.peab.se/om-oss" → "peab.se".
export function websiteDomain(website: string | null | undefined): string | null {
  const raw = (website ?? "").trim().toLowerCase();
  if (!raw) return null;
  try {
    const host = new URL(/^[a-z]+:\/\//.test(raw) ? raw : `https://${raw}`).hostname.replace(/^www\./, "");
    return host.includes(".") ? host : null;
  } catch {
    return null;
  }
}

// ─── Adressboken: alla kända adresser och företagsdomäner ────────────────────

export interface AddressBookInput {
  contacts: { id: string; companyId: string; email: string | null }[];
  companies: { id: string; website: string | null; invoiceEmail: string | null }[];
  owners: { id: string; email: string | null }[];
}

export interface AddressEntry {
  companies: { companyId: string; contactId: string | null }[];
  ownerIds: string[];
}

export interface AddressBook {
  byEmail: Map<string, AddressEntry>;
  // Domän → företag som har en kontakt, fakturaadress eller webbplats på domänen.
  companiesByDomain: Map<string, Set<string>>;
}

export function buildAddressBook(input: AddressBookInput): AddressBook {
  const byEmail = new Map<string, AddressEntry>();
  const companiesByDomain = new Map<string, Set<string>>();
  const entry = (email: string) => {
    let e = byEmail.get(email);
    if (!e) byEmail.set(email, (e = { companies: [], ownerIds: [] }));
    return e;
  };
  const addDomain = (domain: string | null, companyId: string) => {
    if (!domain || isFreemailDomain(domain) || isOwnDomain(domain)) return;
    let set = companiesByDomain.get(domain);
    if (!set) companiesByDomain.set(domain, (set = new Set()));
    set.add(companyId);
  };

  for (const c of input.contacts) {
    for (const email of splitStoredEmails(c.email)) {
      if (isOwnDomain(emailDomain(email))) continue;
      const e = entry(email);
      if (!e.companies.some((x) => x.companyId === c.companyId && x.contactId === c.id)) {
        e.companies.push({ companyId: c.companyId, contactId: c.id });
      }
      addDomain(emailDomain(email), c.companyId);
    }
  }
  for (const co of input.companies) {
    for (const email of splitStoredEmails(co.invoiceEmail)) {
      if (isOwnDomain(emailDomain(email))) continue;
      const e = entry(email);
      if (!e.companies.some((x) => x.companyId === co.id)) e.companies.push({ companyId: co.id, contactId: null });
      addDomain(emailDomain(email), co.id);
    }
    addDomain(websiteDomain(co.website), co.id);
  }
  for (const o of input.owners) {
    for (const email of splitStoredEmails(o.email)) {
      if (isOwnDomain(emailDomain(email))) continue;
      const e = entry(email);
      if (!e.ownerIds.includes(o.id)) e.ownerIds.push(o.id);
    }
  }
  return { byEmail, companiesByDomain };
}

// ─── Matchning av ett meddelande ─────────────────────────────────────────────

export interface MessageHeaders {
  from: string;
  to: string;
  cc: string;
  autoSubmitted?: string;
  precedence?: string;
  listUnsubscribe?: string;
}

export interface MessageLinks {
  companyId: string | null;
  contactId: string | null;
  ownerId: string | null;
}

export interface ThreadLinks {
  companyId: string | null;
  ownerId: string | null;
}

export function isOwnAddress(email: string, mailbox: string): boolean {
  return email === mailbox || isOwnDomain(emailDomain(email));
}

// Utgående = skickat från den egna brevlådan (eller annan egen adress).
export function isOutgoing(headers: Pick<MessageHeaders, "from">, mailbox: string): boolean {
  const from = parseAddressList(headers.from)[0];
  return Boolean(from && isOwnAddress(from.email, mailbox));
}

// Motparterna: alla adresser i From/To/Cc utom de egna. Avsändaren först, så att
// den som faktiskt skrev avgör vid oklarheter.
export function counterpartAddresses(headers: MessageHeaders, mailbox: string): Address[] {
  const all = [
    ...parseAddressList(headers.from),
    ...parseAddressList(headers.to),
    ...parseAddressList(headers.cc),
  ];
  const seen = new Set<string>();
  return all.filter((a) => {
    if (seen.has(a.email) || isOwnAddress(a.email, mailbox)) return false;
    seen.add(a.email);
    return true;
  });
}

// Automatiska utskick (autosvar, nyhetsbrev, studsar) importeras bara när de redan
// hör till en känd tråd, och föreslås aldrig som nya kontakter.
export function isAutomaticMessage(headers: MessageHeaders): boolean {
  const from = headers.from.toLowerCase();
  return Boolean(headers.autoSubmitted && headers.autoSubmitted.trim().toLowerCase() !== "no")
    || /\b(bulk|list|junk)\b/i.test(headers.precedence ?? "")
    || Boolean(headers.listUnsubscribe?.trim())
    || /no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounce|notifications?@|noreply/i.test(from);
}

// Vilket företag/vilken uthyrare ett meddelande hör till.
// 1) Tråden är redan knuten i CRM:et → samma koppling (fångar kollegor som svarar
//    i en befintlig tråd från en ny adress).
// 2) Någon motpart är en känd kontakt, fakturaadress eller uthyrare.
// Ett meddelande kan höra till både ett företag och en uthyrare samtidigt.
export function resolveMessageLinks(
  headers: MessageHeaders,
  book: AddressBook,
  mailbox: string,
  thread?: ThreadLinks | null,
): MessageLinks {
  let companyId = thread?.companyId ?? null;
  let contactId: string | null = null;
  let ownerId = thread?.ownerId ?? null;

  for (const addr of counterpartAddresses(headers, mailbox)) {
    const hit = book.byEmail.get(addr.email);
    if (!hit) continue;
    if (!ownerId && hit.ownerIds.length) ownerId = hit.ownerIds[0];
    if (hit.companies.length) {
      // Finns tråden redan på ett företag tar vi kontakten därifrån; annars första träffen.
      const preferred = companyId ? hit.companies.find((c) => c.companyId === companyId) : hit.companies[0];
      if (preferred) {
        companyId ??= preferred.companyId;
        contactId ??= preferred.contactId;
      }
    }
  }
  return { companyId, contactId, ownerId };
}

export function hasLinks(links: MessageLinks): boolean {
  return Boolean(links.companyId || links.ownerId);
}

export interface SenderSuggestion {
  email: string;
  name: string | null;
  domain: string;
  companyIds: string[];
}

// Inkommande mejl från en okänd adress på en domän som hör till ett eller flera
// kända företag → förslag att koppla avsändaren som ny kontakt. Kopplas aldrig
// automatiskt: stora koncerner finns ofta som flera separata kunder.
export function suggestSender(
  headers: MessageHeaders,
  book: AddressBook,
  mailbox: string,
): SenderSuggestion | null {
  if (isOutgoing(headers, mailbox) || isAutomaticMessage(headers)) return null;
  const sender = parseAddressList(headers.from)[0];
  if (!sender || isOwnAddress(sender.email, mailbox) || book.byEmail.has(sender.email)) return null;
  const domain = emailDomain(sender.email);
  if (isFreemailDomain(domain)) return null;
  // Exakt domän, annars överordnad domän (mail.peab.se → peab.se).
  const parts = domain.split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    const candidate = parts.slice(i).join(".");
    const companies = book.companiesByDomain.get(candidate);
    if (companies?.size) return { email: sender.email, name: sender.name, domain: candidate, companyIds: [...companies].sort() };
  }
  return null;
}
