export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`flex h-screen w-full flex-col bg-[#F9FAFB] font-sans`}>
        {children}
      </body>
    </html>
  );
}
