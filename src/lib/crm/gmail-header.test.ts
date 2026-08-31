import { describe, expect, it } from "vitest";
import { mimeHeaderValue } from "./gmail";

describe("Gmail MIME-rubriker", () => {
  it("RFC 2047-kodar svenska och polska ämnesrader", () => {
    const subject = "Boende i Stockholm – några snabba frågor";
    const encoded = mimeHeaderValue(subject);

    expect(encoded).toMatch(/^=\?UTF-8\?B\?.+\?=$/);
    expect(Buffer.from(encoded.slice(10, -2), "base64").toString("utf8")).toBe(subject);
  });

  it("behåller säkra ASCII-rubriker och stoppar headerinjektion", () => {
    expect(mimeHeaderValue("Accommodation in Boden"))
      .toBe("Accommodation in Boden");
    expect(mimeHeaderValue("Safe\r\nBcc: attacker@example.com"))
      .toBe("Safe Bcc: attacker@example.com");
  });
});
