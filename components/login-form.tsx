"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { FaApple, FaGoogle, FaGithub } from "react-icons/fa";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });

      // redirect: true olduğu için aşağıdaki kod çalışmayacak
      // ancak redirect: false yaparsanız bu kodları kullanabilirsiniz
      /*
      if (result?.error) {
        if (
          result.error.includes("E-posta adresinizi doğrulamanız gerekiyor")
        ) {
          toast.error(
            "E-posta adresiniz henüz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin.",
            {
              action: {
                label: "Doğrulama Sayfasına Git",
                onClick: () =>
                  router.push(
                    `/verify-email?email=${encodeURIComponent(email)}`
                  ),
              },
              duration: 6000,
            }
          );
        } else {
          toast.error(result.error || "Giriş yapılamadı");
        }
      } else {
        toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
        router.push("/dashboard");
      }
      */
    } catch (error) {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Hoşgeldiniz</CardTitle>
          <CardDescription>Hesabınıza giriş yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className='grid gap-4'>
              <div className='flex flex-col gap-2'>
                <Button
                  type='button'
                  className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                  onClick={() =>
                    (window.location.href =
                      "/api/auth/signin/apple?callbackUrl=%2Fdashboard")
                  }
                >
                  <FaApple className='h-4 w-4' />
                  Apple ile Giriş Yap
                </Button>
                <Button
                  type='button'
                  className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                  onClick={() =>
                    (window.location.href =
                      "/api/auth/signin/google?callbackUrl=%2Fdashboard")
                  }
                >
                  <FaGoogle className='h-4 w-4' />
                  Google ile Giriş Yap
                </Button>
                <Button
                  type='button'
                  className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                  onClick={() =>
                    (window.location.href =
                      "/api/auth/signin/github?callbackUrl=%2Fdashboard")
                  }
                >
                  <FaGithub className='h-4 w-4' />
                  GitHub ile Giriş Yap
                </Button>
              </div>
              <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
                <span className='relative z-10 bg-background px-2 text-muted-foreground'>
                  Veya e-posta ile devam edin
                </span>
              </div>
              <div className='grid gap-2'>
                <div className='grid gap-2'>
                  <Label htmlFor='email'>E-posta</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='mail@ornek.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className='grid gap-2'>
                  <div className='flex items-center'>
                    <Label htmlFor='password'>Şifre</Label>
                    <a
                      href='/forgot-password'
                      className='ml-auto text-sm text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline'
                    >
                      Şifrenizi mi unuttunuz?
                    </a>
                  </div>
                  <Input
                    id='password'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type='submit'
                  disabled={loading}
                  className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 w-full disabled:opacity-50 disabled:pointer-events-none'
                >
                  {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                </Button>
              </div>
              <div className='text-center text-sm'>
                Hesabınız yok mu?{" "}
                <a
                  href='/sign-up'
                  className='text-blue-600 hover:text-blue-800 underline underline-offset-4'
                >
                  Kayıt Ol
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className='text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  '>
        Devam ederek, <a href='/terms'>Hizmet Koşullarımızı</a> ve{" "}
        <a href='/privacy'>Gizlilik Politikamızı</a> kabul etmiş olursunuz.
      </div>
    </div>
  );
}
