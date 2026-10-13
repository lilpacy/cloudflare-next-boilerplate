// @vitest-environment node
import { describe, expect, it } from "vitest";
import { ValidationError } from "@/app/_domain/errors";
import { MAX_IMAGE_SIZE, validateImageFile } from "@/app/_domain/profile-image";

function fileOf(size: number, type = "image/png"): File {
  return new File([new Uint8Array(size)], "avatar.png", { type });
}

describe("プロフィール画像の検証", () => {
  it("正常系: 上限サイズちょうどの画像ファイルは受け付けられる", () => {
    expect(() => validateImageFile(fileOf(MAX_IMAGE_SIZE))).not.toThrow();
  });

  it.each([
    ["上限サイズを 1 バイト超える", fileOf(MAX_IMAGE_SIZE + 1), "File size must be less than 5MB"],
    ["画像以外のファイル", fileOf(10, "text/plain"), "File must be an image"],
    ["空のファイル", fileOf(0), "No file provided"],
  ])("異常系: %s は理由付きで拒否される", (_, file, message) => {
    expect(() => validateImageFile(file)).toThrow(ValidationError);
    expect(() => validateImageFile(file)).toThrow(message);
  });
});
