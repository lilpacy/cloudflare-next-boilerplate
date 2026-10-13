import { ValidationError } from "./errors";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateImageFile(file: File): void {
  if (file.size === 0) throw new ValidationError("No file provided");
  if (!file.type.startsWith("image/")) throw new ValidationError("File must be an image");
  if (file.size > MAX_IMAGE_SIZE) throw new ValidationError("File size must be less than 5MB");
}

export type ProfileImage = {
  contentType: string;
  body: ReadableStream;
};
