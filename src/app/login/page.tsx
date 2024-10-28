"use client";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto flex h-screen w-full max-w-2xl flex-col items-start justify-center gap-y-3 p-4 text-center leading-6">
        <Link href="/" className="w-full">
          <Image
            src="/logo.jpg"
            width={136}
            height={29}
            alt="Airtable logo"
            className="mx-auto"
          />
        </Link>
        <h1 className="mx-auto text-2xl">
          Sign in{" "}
          <p className="text-center text-sm">
            or{" "}
            <Link
              href="/signup"
              className="border-b border-b-blue-500 pb-1 font-normal text-blue-500 hover:no-underline"
            >
              Create an account
            </Link>
          </p>
        </h1>
        <div className="w-full text-center font-normal">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-x-3 rounded-2xl border-2 p-3 text-sm font-medium hover:border-black hover:bg-gray-50"
          >
            <Image
              src="/google.png"
              width={60}
              height={48}
              alt="google logo"
              className="h-4 w-4"
            />
            <div className="text-center font-normal">
              <span className="font-semibold">Sign in with</span> Google
            </div>
          </button>
        </div>
      </div>
    );
  }
}
