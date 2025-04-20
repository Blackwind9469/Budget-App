import { MainNav } from "@/components/main-nav";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className='min-h-screen flex flex-col'>
      <MainNav />
      <main className='flex-1 container py-6'>{children}</main>
    </div>
  );
}
