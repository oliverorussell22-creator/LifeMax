import { describe, expect, test } from "vitest";
import manifest from "../../app/manifest";

describe("PWA manifest", () => {
  test("contains installable scaffold fields", () => {
    const value = manifest();

    expect(value.name).toBe("LifeMax");
    expect(value.short_name).toBe("LifeMax");
    expect(value.start_url).toBe("/");
    expect(value.display).toBe("standalone");
    expect(value.background_color).toBe("#eff7f1");
    expect(value.theme_color).toBe("#1d6b4f");
    expect(value.icons).toEqual([
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]);
  });
});
