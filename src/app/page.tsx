import { HydrateClient } from "@/trpc/server";
import { getServerAuthSession } from "@/server/auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <HydrateClient>
      <main className="flex items-center justify-center">
        {session ? (
          <div>
            Logged in as {session.user.email}
            <Link href="/logout">Logout</Link>
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
