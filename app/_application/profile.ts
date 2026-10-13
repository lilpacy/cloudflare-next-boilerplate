import "server-only";

import { NotFoundError } from "@/app/_domain/errors";
import type { Profile } from "@/app/_domain/profile";
import { validateImageFile, type ProfileImage } from "@/app/_domain/profile-image";
import { deleteObject, getObject, putObject } from "@/app/_infrastructure/storage";
import { findProfile, setProfileImageKey } from "@/app/_infrastructure/users";
import { requireUserId } from "./auth";

export async function getProfile(): Promise<Profile> {
  const userId = await requireUserId();
  return findProfile(userId);
}

export async function replaceProfileImage(file: File): Promise<Profile> {
  const userId = await requireUserId();
  validateImageFile(file);

  const key = `profiles/${userId}/${Date.now()}-${file.name}`;
  await putObject(key, await file.arrayBuffer(), file.type);

  const previous = await findProfile(userId);
  await setProfileImageKey(userId, key);
  if (previous.imageKey) await deleteObject(previous.imageKey);

  return { imageKey: key };
}

export async function removeProfileImage(): Promise<Profile> {
  const userId = await requireUserId();
  const { imageKey } = await findProfile(userId);
  if (!imageKey) throw new NotFoundError("No profile image to delete");

  await deleteObject(imageKey);
  await setProfileImageKey(userId, null);

  return { imageKey: null };
}

export async function readProfileImage(key: string): Promise<ProfileImage> {
  const userId = await requireUserId();
  const { imageKey } = await findProfile(userId);
  if (imageKey !== key) throw new NotFoundError("Image not found");

  const image = await getObject(key);
  if (!image) throw new NotFoundError("Image not found");
  return image;
}
