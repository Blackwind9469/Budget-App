"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Form doğrulama şeması
const formSchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Bir hata oluştu");
      }

      setIsSubmitted(true);
      toast.success(
        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
      );
    } catch (error: any) {
      toast.error(error.message || "İşlem sırasında bir hata oluştu");
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
            <CardTitle className='text-xl'>Şifrenizi mi unuttunuz?</CardTitle>
            <CardDescription>
              {isSubmitted
                ? "E-posta adresinize şifre sıfırlama bağlantısı gönderdik"
                : "Şifrenizi sıfırlamak için e-posta adresinizi girin"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className='text-center space-y-4'>
                <p className='text-muted-foreground'>
                  Lütfen e-posta kutunuzu kontrol edin ve şifrenizi sıfırlamak
                  için gönderilen bağlantıya tıklayın.
                </p>
                <p className='text-sm text-muted-foreground'>
                  E-posta 5-10 dakika içinde gelmezse, spam klasörünü kontrol
                  edin veya tekrar deneyin.
                </p>
                <div className='flex flex-col space-y-2 mt-4'>
                  <Button
                    onClick={() => router.push("/sign-in")}
                    className='w-full'
                  >
                    Giriş Sayfasına Dön
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsSubmitted(false);
                      form.reset();
                    }}
                  >
                    Farklı Bir E-posta Adresi Dene
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-4'
                >
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='mail@ornek.com'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Kayıt olduğunuz e-posta adresinizi girin
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='flex flex-col space-y-2'>
                    <Button
                      type='submit'
                      disabled={isSubmitting}
                      className='w-full'
                    >
                      {isSubmitting
                        ? "Gönderiliyor..."
                        : "Şifre Sıfırlama Bağlantısı Gönder"}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => router.push("/sign-in")}
                    >
                      Giriş Sayfasına Dön
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
