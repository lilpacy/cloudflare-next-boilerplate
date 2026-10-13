"use server";

import { revalidatePath } from "next/cache";
import { removeProfileImage, replaceProfileImage } from "@/application/profile";
import { runAction, type ActionResult } from "@/app/_lib/action-result";

export async function uploadProfileImageAction(formData: FormData): Promise<ActionResult> {
  const file = formData.get("image");
  if (!(file instanceof File)) return { ok: false, error: "No file provided" };

  return runAction(async () => {
    await replaceProfileImage(file);
    revalidatePath("/profile");
  });
}

export async function deleteProfileImageAction(): Promise<ActionResult> {
  return runAction(async () => {
    await removeProfileImage();
    revalidatePath("/profile");
  });
}
