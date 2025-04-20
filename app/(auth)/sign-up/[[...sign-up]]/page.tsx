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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Form doğrulama şeması
const signUpSchema = z
  .object({
    name: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır" }),
    surname: z
      .string()
      .min(2, { message: "Soyisim en az 2 karakter olmalıdır" }),
    email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
    phone: z
      .string()
      .min(10, { message: "Geçerli bir telefon numarası giriniz" }),
    address: z.string().min(5, { message: "Adres en az 5 karakter olmalıdır" }),
    password: z
      .string()
      .min(8, { message: "Şifre en az 8 karakter olmalıdır" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: SignUpFormValues) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          surname: data.surname,
          email: data.email,
          phone: data.phone,
          address: data.address,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Bir hata oluştu");
      }

      toast.success(
        "Kayıt işlemi başarılı! Lütfen e-posta adresinizi doğrulayın."
      );
      router.push("/verify-email?email=" + encodeURIComponent(data.email));
    } catch (error: any) {
      toast.error(error.message || "Kayıt olurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
      <div className='flex w-full max-w-lg flex-col gap-6'>
        <a href='/' className='flex items-center gap-2 self-center font-medium'>
          <div className='flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground'>
            <GalleryVerticalEnd className='size-4' />
          </div>
          BUDGET TRACKER
        </a>

        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>Hesap Oluştur</CardTitle>
            <CardDescription>
              Kişisel ve iletişim bilgilerinizi girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İsim</FormLabel>
                        <FormControl>
                          <Input placeholder='İsminiz' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='surname'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soyisim</FormLabel>
                        <FormControl>
                          <Input placeholder='Soyisminiz' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                        Bu e-posta adresi hesabınızı doğrulamak için
                        kullanılacaktır
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder='5XX XXX XX XX' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adres</FormLabel>
                      <FormControl>
                        <Textarea placeholder='Adresiniz' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre</FormLabel>
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
                        <FormLabel>Şifre Tekrar</FormLabel>
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
                </div>

                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='inline-flex w-full items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none'
                >
                  {isSubmitting ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
                </button>

                <div className='text-center text-sm mt-4'>
                  Zaten bir hesabınız var mı?{" "}
                  <a
                    href='/sign-in'
                    className='text-blue-600 hover:text-blue-800 underline underline-offset-4'
                  >
                    Giriş Yap
                  </a>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
