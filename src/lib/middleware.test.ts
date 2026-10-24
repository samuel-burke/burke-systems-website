// @vitest-environment node
import { describe, expect, it } from "vitest";
import { onRequest } from "../../functions/_middleware";

const passThrough = new Response("page");
const run = (url: string) =>
  onRequest({ request: new Request(url), next: async () => passThrough });

describe("pages.dev redirect", () => {
  it("sends the production pages.dev address to burke.systems, keeping the path", async () => {
    const response = await run(
      "https://burke-systems-website.pages.dev/thanks?x=1",
    );
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "https://burke.systems/thanks?x=1",
    );
  });

  it("leaves branch previews and the real domain alone", async () => {
    expect(await run("https://site-foo.burke-systems-website.pages.dev/")).toBe(
      passThrough,
    );
    expect(await run("https://burke.systems/")).toBe(passThrough);
  });
});
