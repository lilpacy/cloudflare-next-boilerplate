// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { NotFoundError, UnauthorizedError } from "@/app/_domain/errors";
import { readProfileImage } from "@/app/_application/profile";
import { GET } from "@/app/api/images/[...key]/route";

vi.mock("@/app/_application/profile", () => ({ readProfileImage: vi.fn() }));

const get = (...key: string[]) =>
  GET(new NextRequest("http://localhost/api/images/" + key.join("/")), {
    params: Promise.resolve({ key }),
  });

beforeEach(() => {
  vi.resetAllMocks();
});

describe("画像 API", () => {
  it("正常系: 自分の画像は元の Content-Type で返り、共有キャッシュには保存させない", async () => {
    vi.mocked(readProfileImage).mockResolvedValue({
      contentType: "image/png",
      body: new Blob(["png-bytes"]).stream(),
    });

    const response = await get("profiles", "user-1", "a.png");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("cache-control")).not.toContain("public");
    await expect(response.text()).resolves.toBe("png-bytes");
    expect(readProfileImage).toHaveBeenCalledWith("profiles/user-1/a.png");
  });

  it.each([
    ["未認証", new UnauthorizedError(), 401],
    ["自分の画像ではない、または存在しない", new NotFoundError(), 404],
  ])("異常系: %s の場合は %i を返す", async (_, error, status) => {
    vi.mocked(readProfileImage).mockRejectedValue(error);

    const response = await get("profiles", "user-2", "b.png");

    expect(response.status).toBe(status);
  });

  it("異常系: 想定外のエラーはそのまま投げ直される", async () => {
    const unexpected = new Error("boom");
    vi.mocked(readProfileImage).mockRejectedValue(unexpected);

    await expect(get("profiles", "user-1", "a.png")).rejects.toBe(unexpected);
  });
});
