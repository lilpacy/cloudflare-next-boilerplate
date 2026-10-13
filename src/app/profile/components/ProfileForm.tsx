"use client";

import { useState, useTransition, useRef } from "react";
import { PrimaryButton } from "@cf-next/ui";
import Image from "next/image";
import type { Profile } from "@/domain/profile";
import { validateImageFile } from "@/domain/profile-image";
import { deleteProfileImageAction, uploadProfileImageAction } from "@/app/profile/actions";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        validateImageFile(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid image file");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await uploadProfileImageAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("Profile image updated successfully!");
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Reload page to show updated image
      window.location.reload();
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete your profile image?")) {
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await deleteProfileImageAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("Profile image deleted successfully!");
      // Reload page to show changes
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Profile Image</h2>

        {/* Current Profile Image */}
        {profile.imageKey && !previewUrl && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Current image:</p>
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 relative">
              <Image
                src={`/api/images/${profile.imageKey}`}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Preview */}
        {previewUrl && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 relative">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload new image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isPending}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max file size: 5MB. Supported formats: JPG, PNG, GIF
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              {success}
            </div>
          )}

          <div className="flex gap-3">
            <PrimaryButton
              type="submit"
              disabled={isPending || !previewUrl}
            >
              {isPending ? "Uploading..." : "Upload Image"}
            </PrimaryButton>

            {profile.imageKey && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
              >
                Delete Current Image
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Info */}
      <div className="pt-6 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Storage Information
        </h3>
        <p className="text-sm text-gray-600">
          Your profile images are securely stored in Cloudflare R2 object
          storage. Images are automatically optimized and served globally
          through Cloudflare&apos;s CDN.
        </p>
      </div>
    </div>
  );
}
