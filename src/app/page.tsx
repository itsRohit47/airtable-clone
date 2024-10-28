import { HydrateClient } from "@/trpc/server";
import { getServerAuthSession } from "@/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <HydrateClient>
      <main className="flex h-full w-full items-center justify-center">
        {session ? (
          <div>Logged in as {session.user.email}</div>
        ) : (
          <div>Not logged in</div>
        )}
      </main>
    </HydrateClient>
  );
}
