"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  // useEffect(() => {
  //   // If user is already authenticated, redirect to dashboard
  //   const accessToken = authStorage.getAccessToken();
  //   if (accessToken) {
  //     router.push("/dashboard");
  //   }
  // }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="w-full max-w-4xl text-center">
        <div className="flex flex-col items-center gap-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-black dark:text-white">
              Welcome to AppointMe
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Manage your appointments and organizations with ease. Schedule meetings, track resources, and collaborate with your team.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 mt-8">
            <Link href="/login">
              <Button size="lg" className="flex items-center gap-2">
                Sign In
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                Easy Scheduling
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Create and manage appointments with flexible scheduling options
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                Organization Management
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Manage your organization, members, and resources in one place
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                Team Collaboration
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Work together with your team to schedule and manage appointments
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
