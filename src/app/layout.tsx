import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";
import SessionProviderClientComponent from "@/components/session-client-provider";
import AppContextProvider, { useAppContext } from "@/components/context";

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
        className={`${GeistSans.variable} flex h-screen w-full flex-col bg-[#F9FAFB] font-sans`}
      >
        <Toaster />
        <SessionProviderClientComponent>
          <AppContextProvider>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </AppContextProvider>
        </SessionProviderClientComponent>
      </body>
    </html>
  );
}
