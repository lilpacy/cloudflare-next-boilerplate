// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, UnauthorizedError, ValidationError } from "@/domain/errors";
import { readProfileImage, removeProfileImage, replaceProfileImage } from "@/application/profile";
import { getCurrentUserId } from "@/infrastructure/auth";
import { deleteObject, getObject, putObject } from "@/infrastructure/storage";
import { findProfile, setProfileImageKey } from "@/infrastructure/users";

vi.mock("@/infrastructure/auth", () => ({ getCurrentUserId: vi.fn(), isAdmin: vi.fn() }));
vi.mock("@/infrastructure/storage", () => ({
  deleteObject: vi.fn(),
  getObject: vi.fn(),
  putObject: vi.fn(),
}));
vi.mock("@/infrastructure/users", () => ({ findProfile: vi.fn(), setProfileImageKey: vi.fn() }));

const image = () => new File([new Uint8Array(16)], "avatar.png", { type: "image/png" });

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCurrentUserId).mockResolvedValue("user-1");
});

describe("プロフィール画像の置き換え", () => {
  it("正常系: 新しい画像を保存してから本人のキーを更新し、古い画像を削除する", async () => {
    vi.mocked(findProfile).mockResolvedValue({ imageKey: "profiles/user-1/old.png" });

    const profile = await replaceProfileImage(image());

    expect(profile.imageKey).toMatch(/^profiles\/user-1\/\d+-avatar\.png$/);
    expect(putObject).toHaveBeenCalledWith(profile.imageKey, expect.any(ArrayBuffer), "image/png");
    expect(setProfileImageKey).toHaveBeenCalledWith("user-1", profile.imageKey);
    expect(deleteObject).toHaveBeenCalledWith("profiles/user-1/old.png");
    expect(vi.mocked(setProfileImageKey).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(deleteObject).mock.invocationCallOrder[0]
    );
  });

  it("正常系: 以前の画像がなければ削除は行われない", async () => {
    vi.mocked(findProfile).mockResolvedValue({ imageKey: null });

    await replaceProfileImage(image());

    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("異常系: 画像でないファイルは検証エラーになり、ストレージには触れない", async () => {
    await expect(
      replaceProfileImage(new File(["text"], "note.txt", { type: "text/plain" }))
    ).rejects.toBeInstanceOf(ValidationError);
    expect(putObject).not.toHaveBeenCalled();
    expect(setProfileImageKey).not.toHaveBeenCalled();
  });

  it("異常系: 未認証では検証より先に認証エラーになる", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue(null);

    await expect(replaceProfileImage(image())).rejects.toBeInstanceOf(UnauthorizedError);
    expect(putObject).not.toHaveBeenCalled();
  });
});

describe("プロフィール画像の削除", () => {
  it("正常系: 現在の画像を削除してキーを空にする", async () => {
    vi.mocked(findProfile).mockResolvedValue({ imageKey: "profiles/user-1/a.png" });

    await expect(removeProfileImage()).resolves.toEqual({ imageKey: null });
    expect(deleteObject).toHaveBeenCalledWith("profiles/user-1/a.png");
    expect(setProfileImageKey).toHaveBeenCalledWith("user-1", null);
  });

  it("異常系: 画像がない状態での削除は存在しない扱いになる", async () => {
    vi.mocked(findProfile).mockResolvedValue({ imageKey: null });

    await expect(removeProfileImage()).rejects.toBeInstanceOf(NotFoundError);
    expect(deleteObject).not.toHaveBeenCalled();
  });
});

describe("プロフィール画像の読み出し", () => {
  it("正常系: 自分の画像キーなら画像が返る", async () => {
    const stored = { contentType: "image/png", body: new Blob(["x"]).stream() };
    vi.mocked(findProfile).mockResolvedValue({ imageKey: "profiles/user-1/a.png" });
    vi.mocked(getObject).mockResolvedValue(stored);

    await expect(readProfileImage("profiles/user-1/a.png")).resolves.toBe(stored);
  });

  it("異常系: 自分の画像キーと異なるキーは存在しない扱いになり、ストレージは読まれない", async () => {
    vi.mocked(findProfile).mockResolvedValue({ imageKey: "profiles/user-1/a.png" });

    await expect(readProfileImage("profiles/user-2/b.png")).rejects.toBeInstanceOf(NotFoundError);
    expect(getObject).not.toHaveBeenCalled();
  });

  it("異常系: キーは一致するがストレージに実体がなければ存在しない扱いになる", async () => {
    vi.mocked(findProfile).mockResolvedValue({ imageKey: "profiles/user-1/a.png" });
    vi.mocked(getObject).mockResolvedValue(null);

    await expect(readProfileImage("profiles/user-1/a.png")).rejects.toBeInstanceOf(NotFoundError);
  });
});
