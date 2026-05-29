import { describe, expect, it } from "vitest";
import { isPrivateIp } from "./safe-fetch";

describe("isPrivateIp", () => {
  it("flaggar privata/loopback/link-local/reserverade IPv4", () => {
    for (const ip of [
      "127.0.0.1",
      "10.0.0.1",
      "10.255.255.255",
      "172.16.0.1",
      "172.31.255.255",
      "192.168.1.1",
      "169.254.169.254", // molnmetadata
      "100.64.0.1", // CGNAT
      "0.0.0.0",
      "224.0.0.1", // multicast
      "240.0.0.1", // reserverat
    ]) {
      expect(isPrivateIp(ip), ip).toBe(true);
    }
  });

  it("släpper igenom publika IPv4", () => {
    for (const ip of ["8.8.8.8", "1.1.1.1", "93.184.216.34", "172.15.255.255", "172.32.0.1"]) {
      expect(isPrivateIp(ip), ip).toBe(false);
    }
  });

  it("flaggar privata IPv6 inkl. IPv4-mappade", () => {
    for (const ip of ["::1", "::", "fe80::1", "fc00::1", "fd12:3456::1", "::ffff:127.0.0.1", "::ffff:10.0.0.1"]) {
      expect(isPrivateIp(ip), ip).toBe(true);
    }
  });

  it("släpper igenom publika IPv6 och behandlar okänt format som osäkert", () => {
    expect(isPrivateIp("2606:4700:4700::1111")).toBe(false); // Cloudflare DNS
    expect(isPrivateIp("inte-en-ip")).toBe(true); // okänt → osäkert
  });
});
