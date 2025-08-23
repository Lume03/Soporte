export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F1F4F8] p-4">
      {children}
    </main>
  );
}

