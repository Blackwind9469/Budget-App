"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Form doğrulama şeması
const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Şifre en az 8 karakter olmalıdır" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      toast.error("Geçersiz veya eksik şifre sıfırlama bağlantısı");
      router.push("/forgot-password");
      return;
    }
    setToken(tokenParam);
  }, [searchParams, router]);

  async function onSubmit(values: FormValues) {
    if (!token) {
      toast.error("Geçersiz token");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Bir hata oluştu");
      }

      setIsSuccess(true);
      toast.success("Şifreniz başarıyla sıfırlandı");
    } catch (error: any) {
      toast.error(error.message || "Şifre sıfırlama sırasında bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
      <div className='flex w-full max-w-md flex-col gap-6'>
        <a href='/' className='flex items-center gap-2 self-center font-medium'>
          <div className='flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground'>
            <GalleryVerticalEnd className='size-4' />
          </div>
          BUDGET TRACKER
        </a>

        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>Şifre Sıfırlama</CardTitle>
            <CardDescription>
              {isSuccess
                ? "Şifreniz başarıyla sıfırlandı"
                : "Yeni şifrenizi belirleyin"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className='text-center space-y-4'>
                <p className='text-muted-foreground'>
                  Şifreniz güncellendi. Artık yeni şifrenizle giriş
                  yapabilirsiniz.
                </p>
                <Button
                  onClick={() => router.push("/sign-in")}
                  className='w-full mt-4'
                >
                  Giriş Yap
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-4'
                >
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yeni Şifre</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder='********'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifreyi Doğrulayın</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder='********'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full'
                  >
                    {isSubmitting ? "İşleniyor..." : "Şifremi Sıfırla"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
