import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/actions/profile";
import { ProfileForm } from "./components/ProfileForm";

export const metadata = {
  title: "Profile",
  description: "Manage your profile",
};

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const profile = await getProfile();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-gray-600">Manage your profile settings</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <Suspense fallback={<div>Loading profile...</div>}>
          <ProfileForm profile={profile} />
        </Suspense>
      </div>
    </div>
  );
}
