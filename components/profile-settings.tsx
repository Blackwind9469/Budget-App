"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileSettings() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className='space-y-6'>
      <Card className='w-full'>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarImage
                src={session.user.image || ""}
                alt={session.user.name || "User"}
              />
              <AvatarFallback>
                {session.user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{session.user.name}</CardTitle>
              <CardDescription>{session.user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className='flex flex-col sm:flex-row gap-4 items-start'>
        <Card className='flex-1 w-full'>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium'>Email</p>
                <p className='text-sm text-muted-foreground'>
                  {session.user.email}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium'>Name</p>
                <p className='text-sm text-muted-foreground'>
                  {session.user.name || "Not provided"}
                </p>
              </div>
              <Button variant='outline' size='sm'>
                Update Account
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className='flex-1 w-full'>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium'>Authentication</p>
                <p className='text-sm text-muted-foreground'>GitHub OAuth</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Last Sign In</p>
                <p className='text-sm text-muted-foreground'>
                  {new Date().toLocaleString()}
                </p>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  window.open("https://github.com/settings/profile", "_blank")
                }
              >
                Manage GitHub Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
