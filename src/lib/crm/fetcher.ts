// Klient-fetch för CRM-mutationer. Kastar på icke-2xx så att anropare aldrig
// visar en "Sparat"-toast för ett misslyckat anrop. Plockar serverns felmeddelande
// och översätter 401 (utgången session) till något begripligt.

export class CrmFetchError extends Error {
  status: number;
  data?: unknown; // serverns JSON-kropp (t.ex. { existing } vid 409-dubblett)
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "CrmFetchError";
    this.status = status;
    this.data = data;
  }
}

export async function crmFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);
  if (!res.ok) {
    let message = `Något gick fel (${res.status})`;
    let data: unknown;
    try {
      data = await res.clone().json();
      const d = data as { message?: string; error?: string };
      if (d?.message) message = d.message;
      else if (d?.error) message = d.error;
    } catch {
      /* svaret var inte JSON */
    }
    if (res.status === 401) message = "Du verkar vara utloggad – logga in igen.";
    throw new CrmFetchError(message, res.status, data);
  }
  return res;
}

export async function crmFetchJson<T = unknown>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await crmFetch(input, init);
  return (await res.json()) as T;
}

// Felmeddelande för en toast, oavsett feltyp.
export function crmErrorMessage(e: unknown): string {
  if (e instanceof CrmFetchError) return e.message;
  if (e instanceof Error && e.message) return e.message;
  return "Något gick fel";
}

// Läs-fetch för SWR. Kastar på icke-2xx så att SWR sätter `error` i stället för att
// rendera serverns felobjekt ({error:"Unauthorized"}) som om det vore giltig data —
// en utgången session visade tidigare tysta nollor i hela gränssnittet.
export async function swrFetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    let message = res.status === 401 ? "Du verkar vara utloggad – logga in igen." : `Kunde inte hämta data (${res.status})`;
    if (res.status !== 401) {
      try {
        const data = await res.clone().json();
        if (data?.message) message = data.message;
        else if (data?.error) message = data.error;
      } catch {
        /* svaret var inte JSON */
      }
    }
    throw new CrmFetchError(message, res.status);
  }
  return (await res.json()) as T;
}
