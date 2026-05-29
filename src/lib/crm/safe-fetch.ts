import dns from "node:dns/promises";
import net from "node:net";

// SSRF-skydd för utgående fetch mot URL:er som härrör från användarinput
// (t.ex. att skrapa företagsnamn från en e-postdomän i kontaktformuläret).
// Stänger: bara-IP, localhost/.local/.internal, privata/loopback/link-local-adresser,
// icke-https, och redirect-till-intern (varje hopp omvalideras).

function ipv4ToInt(ip: string): number {
  const p = ip.split(".").map(Number);
  return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3];
}

function inV4Range(ipInt: number, base: string, bits: number): boolean {
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipInt & mask) === (ipv4ToInt(base) & mask);
}

function isPrivateIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  return (
    inV4Range(n, "0.0.0.0", 8) || // "this network"
    inV4Range(n, "10.0.0.0", 8) || // privat
    inV4Range(n, "100.64.0.0", 10) || // CGNAT
    inV4Range(n, "127.0.0.0", 8) || // loopback
    inV4Range(n, "169.254.0.0", 16) || // link-local (molnmetadata)
    inV4Range(n, "172.16.0.0", 12) || // privat
    inV4Range(n, "192.0.0.0", 24) ||
    inV4Range(n, "192.0.2.0", 24) || // TEST-NET-1
    inV4Range(n, "192.168.0.0", 16) || // privat
    inV4Range(n, "198.18.0.0", 15) || // benchmarking
    inV4Range(n, "198.51.100.0", 24) || // TEST-NET-2
    inV4Range(n, "203.0.113.0", 24) || // TEST-NET-3
    inV4Range(n, "224.0.0.0", 4) || // multicast
    inV4Range(n, "240.0.0.0", 4) // reserverat
  );
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true; // loopback / ospecificerad
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); // IPv4-mappad
  if (mapped) return isPrivateIPv4(mapped[1]);
  const hi = parseInt(lower.split(":")[0] || "0", 16);
  if ((hi & 0xfe00) === 0xfc00) return true; // fc00::/7 (ULA)
  if ((hi & 0xffc0) === 0xfe80) return true; // fe80::/10 (link-local)
  return false;
}

export function isPrivateIp(ip: string): boolean {
  const v = net.isIP(ip);
  if (v === 4) return isPrivateIPv4(ip);
  if (v === 6) return isPrivateIPv6(ip);
  return true; // okänt format → behandla som osäkert
}

function isDisallowedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, "");
  if (!h) return true;
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h.endsWith(".local") || h.endsWith(".internal")) return true;
  if (net.isIP(h) !== 0) return true; // bara-IP tillåts inte (måste vara hostname)
  if (!h.includes(".")) return true; // måste ha en publik TLD
  return false;
}

async function resolvesToPublicIp(host: string): Promise<boolean> {
  try {
    const addrs = await dns.lookup(host, { all: true });
    return addrs.length > 0 && addrs.every((a) => !isPrivateIp(a.address));
  } catch {
    return false;
  }
}

/**
 * fetch() begränsad till publika https-värdar. Validerar protokoll, värdnamn och
 * att DNS resolverar till en publik adress — för varje omdirigering. Kastar vid
 * otillåtet mål. Restриsk: DNS-rebinding mellan kontroll och anrop (acceptabelt
 * för lågvärdes-skrapning med kort timeout).
 */
export async function safeFetchPublic(
  rawUrl: string,
  init: RequestInit = {},
  maxRedirects = 3,
): Promise<Response> {
  let url = rawUrl;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error("ogiltig URL");
    }
    if (parsed.protocol !== "https:") throw new Error("endast https tillåts");
    if (parsed.port && parsed.port !== "443") throw new Error("endast standardport (443) tillåts");
    if (isDisallowedHost(parsed.hostname)) throw new Error("otillåten värd");
    if (!(await resolvesToPublicIp(parsed.hostname))) throw new Error("värd pekar på privat/okänd adress");

    const res = await fetch(url, { ...init, redirect: "manual" });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      url = new URL(location, parsed).toString();
      continue;
    }
    return res;
  }
  throw new Error("för många omdirigeringar");
}
