import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";
import SessionProviderClientComponent from "@/components/session-client-provider";

export const metadata: Metadata = {
  title: "The Platform to build next-gen apps - Airtable",
  description: "Airtable Clone by Rohit Bajaj",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} flex min-h-screen w-full flex-col items-center justify-center font-sans`}
      >
        <Toaster />
        <SessionProviderClientComponent>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </SessionProviderClientComponent>
      </body>
    </html>
  );
}
