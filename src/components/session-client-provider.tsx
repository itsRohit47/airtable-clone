"use client";
import { SessionProvider } from "next-auth/react";

export default function SessionProviderClientComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
