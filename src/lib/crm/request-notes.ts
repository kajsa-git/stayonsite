export type ParsedWebRequestNote = {
  formType: string | null;
  source: string | null;
  page: string | null;
  locale: string | null;
  utm: string | null;
  message: string | null;
  email: string | null;
  phone: string | null;
  remainingNote: string | null;
};

type KnownLabel = "source" | "page" | "locale" | "utm" | "message" | "email" | "phone";

const FIELD_RE = /^(Källa|Sida|Språk|UTM|Meddelande|E-post|Telefon):\s*(.*)$/i;

function cleanMultiline(value: string): string | null {
  const text = value
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
  return text || null;
}

function normalizeLabel(label: string): KnownLabel {
  switch (label.toLowerCase()) {
    case "källa":
      return "source";
    case "sida":
      return "page";
    case "språk":
      return "locale";
    case "utm":
      return "utm";
    case "meddelande":
      return "message";
    case "e-post":
      return "email";
    case "telefon":
      return "phone";
    default:
      return "message";
  }
}

export function parseWebRequestNote(raw: string | null | undefined): ParsedWebRequestNote | null {
  const text = cleanMultiline(raw ?? "");
  if (!text) return null;

  const lines = text.split("\n");
  const firstTextIndex = lines.findIndex((line) => line.trim());
  const firstLine = lines[firstTextIndex]?.trim();
  const header = firstLine?.match(/^Inkommen från webb(?:\s*\(([^)]+)\))?$/i);
  if (!header) return null;

  const parsed: ParsedWebRequestNote = {
    formType: header[1] ?? null,
    source: null,
    page: null,
    locale: null,
    utm: null,
    message: null,
    email: null,
    phone: null,
    remainingNote: null,
  };

  const messageLines: string[] = [];
  const remainingLines: string[] = [];
  let activeMultiline: "message" | null = null;

  for (let i = firstTextIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    const field = line.trim().match(FIELD_RE);

    if (field) {
      const label = normalizeLabel(field[1]);
      const value = field[2].trim();
      activeMultiline = null;

      if (label === "message") {
        if (value) messageLines.push(value);
        activeMultiline = "message";
      } else if (value) {
        parsed[label] = value;
      }
      continue;
    }

    if (activeMultiline === "message") {
      messageLines.push(line);
    } else if (line.trim()) {
      remainingLines.push(line);
    }
  }

  parsed.message = cleanMultiline(messageLines.join("\n"));
  parsed.remainingNote = cleanMultiline(remainingLines.join("\n"));

  return parsed;
}
