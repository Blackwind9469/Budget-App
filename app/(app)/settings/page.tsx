"use client";

import { Heading } from "@/components/ui/heading";
import { CategorySettings } from "@/components/category-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cog, CreditCard, UserIcon } from "lucide-react";
import { ProfileSettings } from "@/components/profile-settings";

export default function SettingsPage() {
  return (
    <div className='space-y-6'>
      <Heading
        title='Settings'
        description='Manage your account and preferences'
      />

      <Tabs defaultValue='profile' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='categories'>Categories</TabsTrigger>
          <TabsTrigger value='preferences'>Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value='profile'>
          <Card>
            <CardHeader>
              <div className='flex items-center space-x-2'>
                <UserIcon className='h-5 w-5 text-muted-foreground' />
                <CardTitle>Profile Settings</CardTitle>
              </div>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='categories'>
          <Card>
            <CardHeader>
              <div className='flex items-center space-x-2'>
                <CreditCard className='h-5 w-5 text-muted-foreground' />
                <CardTitle>Categories</CardTitle>
              </div>
              <CardDescription>Manage transaction categories</CardDescription>
            </CardHeader>
            <CardContent>
              <CategorySettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='preferences'>
          <Card>
            <CardHeader>
              <div className='flex items-center space-x-2'>
                <Cog className='h-5 w-5 text-muted-foreground' />
                <CardTitle>App Preferences</CardTitle>
              </div>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-6'>
              <p className='text-muted-foreground text-center py-8'>
                Preference settings will be available in future updates
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
