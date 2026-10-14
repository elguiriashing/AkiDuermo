import { describe, expect, it } from "vitest";
import config from "../next.config";
describe("existing shared Supabase image/auth origins", () => {
  it("allows only the two known exact storage image hosts", () => {
    const patterns = config.images?.remotePatterns;
    expect(patterns).toEqual([
      {
        protocol: "https",
        hostname: "akipasa.supabase.co",
        pathname: "/storage/v1/object/sign/event-media/**",
      },
      {
        protocol: "https",
        hostname: "vhpbvcfkcteswlsdjrfl.supabase.co",
        pathname: "/storage/v1/object/sign/event-media/**",
      },
    ]);
  });
  it("allows authenticated browser traffic to both known hosts without broad Supabase wildcards", async () => {
    const rules = await config.headers!();
    const csp = rules
      .flatMap((rule) => rule.headers)
      .find((header) => header.key === "Content-Security-Policy")!.value;
    const connect = csp
      .split(";")
      .find((value) => value.trim().startsWith("connect-src"))!;
    const images = csp
      .split(";")
      .find((value) => value.trim().startsWith("img-src"))!;
    for (const host of [
      "akipasa.supabase.co",
      "vhpbvcfkcteswlsdjrfl.supabase.co",
    ]) {
      expect(connect).toContain(`https://${host}`);
      expect(connect).toContain(`wss://${host}`);
      expect(images).toContain(`https://${host}`);
    }
    expect(csp).not.toContain("*.supabase.co");
  });
});
