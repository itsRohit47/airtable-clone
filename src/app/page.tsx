import { HydrateClient } from "@/trpc/server";
import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";
import { SignOut } from "@/lib/actions/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <HydrateClient>
      <main className="flex items-center justify-center">
        {session ? (
          <div className="flex flex-col items-center justify-center text-gray-600 h-screen">
            Logged in as <strong>{session.user.email}</strong>
            <Link href="/dashboard" className="text-blue-500">
              Dashboard
            </Link>
            <button className="text-blue-500" onClick={SignOut}>
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-screen">
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
