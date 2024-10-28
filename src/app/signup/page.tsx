"use client";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignUpPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto flex h-screen w-full max-w-xl flex-col items-start justify-center gap-y-3 p-4 text-center leading-6">
        <Link href="/" className="w-full">
          <Image
            src="/logo.jpg"
            width={136}
            height={29}
            alt="Airtable logo"
            className="mx-auto"
          />
        </Link>
        <h1 className="text-2xl font-medium">Create your free account</h1>
        <div className="w-full text-center font-normal text-gray-500">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="mt-4 flex w-full cursor-pointer items-center justify-between rounded-2xl border-2 p-3 text-sm font-medium hover:border-2 hover:border-black hover:bg-gray-50"
          >
            <Image
              src="/google.png"
              width={60}
              height={48}
              alt="google logo"
              className="h-4 w-4"
            />
            <div className="w-full text-center">Continue with Google</div>
          </button>
          <p className="mx-auto mt-4 text-center text-sm lg:w-96">
            By creating an account, you agree to{" "}
            <span className="border-b pb-1 font-medium text-gray-600">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="border-b pb-1 font-medium text-gray-600">
              Privacy Policy.
            </span>
          </p>
          <hr className="my-4 w-full border-gray-200" />
          <p className="text-center text-base">
            Already have an account?{" "}
            <Link
              href="/login"
              className="border-b border-b-blue-500 pb-1 font-normal text-blue-500 hover:no-underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }
}
