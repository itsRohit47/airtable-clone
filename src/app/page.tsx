import { HydrateClient } from "@/trpc/server";
import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <HydrateClient>
      <main className="flex items-center justify-center">
        {session ? (
          <div>
            Logged in as {session.user.email}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-md bg-[#3b49df] px-4 py-2 text-base text-white"
            >
              <div className=""> Yes, sign out</div>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            Not logged in
            <Link href="/login" className="text-blue-500">
              Login
            </Link>
          </div>
        )}
      </main>
    </HydrateClient>
  );
}
