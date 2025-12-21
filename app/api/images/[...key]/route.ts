import { NextRequest, NextResponse } from "next/server";
import { getR2Bucket } from "@/lib/r2/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: keyArray } = await params;
    const key = keyArray.join("/");

    if (!key) {
      return new NextResponse("Missing key", { status: 400 });
    }

    const bucket = getR2Bucket();
    const object = await bucket.get(key);

    if (!object) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const blob = await object.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
