import { NextRequest, NextResponse } from "next/server";
import { readProfileImage } from "@/application/profile";
import { NotFoundError, UnauthorizedError } from "@/domain/errors";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key: keyArray } = await params;
  const key = keyArray.join("/");

  try {
    const image = await readProfileImage(key);
    return new NextResponse(image.body, {
      headers: {
        "Content-Type": image.contentType,
        // The response is authorized per user; shared caches must not reuse it.
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return new NextResponse("Unauthorized", { status: 401 });
    if (error instanceof NotFoundError) return new NextResponse("Image not found", { status: 404 });
    throw error;
  }
}
