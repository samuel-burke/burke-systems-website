import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps a brand text color next to a font size", () => {
    expect(cn("text-primary-foreground", "text-[17px] text-night")).toBe(
      "text-[17px] text-night",
    );
  });

  it("lets a later brand background win", () => {
    expect(cn("bg-primary", "bg-night")).toBe("bg-night");
  });
});
