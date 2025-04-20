"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  CreditCard,
  Home,
  LogOut,
  PiggyBank,
  Plus,
  Settings,
  User,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <header className='border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40'>
      <div className='container flex h-16 items-center'>
        <div className='mr-8 flex items-center gap-2'>
          <PiggyBank className='h-6 w-6 text-primary' />
          <span className='text-xl font-bold hidden md:inline-block'>
            Budget Tracker
          </span>
        </div>
        <nav className='flex-1 flex items-center space-x-1'>
          <Link href='/dashboard'>
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              size='sm'
              className='gap-2'
            >
              <Home className='h-4 w-4' />
              <span className='hidden md:inline-block'>Dashboard</span>
            </Button>
          </Link>
          <Link href='/transactions'>
            <Button
              variant={pathname === "/transactions" ? "secondary" : "ghost"}
              size='sm'
              className='gap-2'
            >
              <CreditCard className='h-4 w-4' />
              <span className='hidden md:inline-block'>Transactions</span>
            </Button>
          </Link>
          <Link href='/analytics'>
            <Button
              variant={pathname === "/analytics" ? "secondary" : "ghost"}
              size='sm'
              className='gap-2'
            >
              <BarChart3 className='h-4 w-4' />
              <span className='hidden md:inline-block'>Analytics</span>
            </Button>
          </Link>
          <Link href='/settings'>
            <Button
              variant={pathname === "/settings" ? "secondary" : "ghost"}
              size='sm'
              className='gap-2'
            >
              <Settings className='h-4 w-4' />
              <span className='hidden md:inline-block'>Settings</span>
            </Button>
          </Link>
        </nav>
        <div className='flex items-center space-x-2'>
          <Link href='/transactions/new'>
            <button className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'>
              <Plus className='h-4 w-4' />
              <span className='inline-block'>Yeni İşlem</span>
            </button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 rounded-full p-0'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || "User"}
                  />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className='mr-2 h-4 w-4' />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className='mr-2 h-4 w-4' />
                  <span>Ayarlar</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className='mr-2 h-4 w-4' />
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
