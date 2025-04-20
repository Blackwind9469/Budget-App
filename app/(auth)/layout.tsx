export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary/10 to-secondary/10">
      <div className="w-full max-w-md p-8 mx-auto">
        {children}
      </div>
    </div>
  );
}