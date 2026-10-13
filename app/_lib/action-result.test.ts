// @vitest-environment node
import { describe, expect, it } from "vitest";
import { ValidationError } from "@/app/_domain/errors";
import { runAction } from "@/app/_lib/action-result";

describe("Server Action の結果変換", () => {
  it("正常系: 成功した処理の戻り値は結果として返る", async () => {
    await expect(runAction(async () => 42)).resolves.toEqual({ ok: true, data: 42 });
  });

  it("異常系: ドメインエラーは画面に表示できる失敗結果になる", async () => {
    await expect(
      runAction(async () => {
        throw new ValidationError("Title is required");
      })
    ).resolves.toEqual({ ok: false, error: "Title is required" });
  });

  it("異常系: 想定外のエラーはそのまま投げ直される", async () => {
    const unexpected = new Error("boom");

    await expect(
      runAction(async () => {
        throw unexpected;
      })
    ).rejects.toBe(unexpected);
  });
});
