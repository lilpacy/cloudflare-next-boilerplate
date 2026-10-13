// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { notFound, redirect } from "next/navigation";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/app/_domain/errors";
import { handlePageError } from "@/app/_lib/page-errors";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("notFound");
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ページでのドメインエラーの扱い", () => {
  it.each([
    ["未認証", new UnauthorizedError(), "redirect:/sign-in"],
    ["権限なし", new ForbiddenError(), "redirect:/"],
    ["対象なし", new NotFoundError(), "notFound"],
  ])("正常系: %s のエラーは対応する画面遷移に変換される", (_, error, outcome) => {
    expect(() => handlePageError(error)).toThrow(outcome);
  });

  it("異常系: ドメインエラー以外はそのまま投げ直され、画面遷移は起きない", () => {
    const unexpected = new Error("boom");

    expect(() => handlePageError(unexpected)).toThrow(unexpected);
    expect(redirect).not.toHaveBeenCalled();
    expect(notFound).not.toHaveBeenCalled();
  });
});
