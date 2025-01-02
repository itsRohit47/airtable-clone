'use client';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
export default function Home() {
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/dashboard");
    }
  }, [session, router]);
  return (
    <main className="">
      <Image src="/hero12.png" fill alt="Airtable logo" className="object-cover object-top hidden 2xl:block" />
      <Image src="/hero1.png" fill alt="Airtable logo" className="object-cover object-top 2xl:hidden block" />
      <Link href="/login" className="bg-transparent text-black z-10 absolute w-screen h-96 top-10 right-8 text-transparent">Sign in</Link>
    </main>
  );
}
