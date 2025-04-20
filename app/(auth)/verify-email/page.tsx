"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  CheckCircle,
  XCircle,
  GalleryVerticalEnd,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Params bileşeni, useSearchParams'ı Suspense içinde kullanmak için
function EmailVerificationParams({
  onParamsLoaded,
}: {
  onParamsLoaded: (token: string | null, email: string | null) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    onParamsLoaded(token, email);
  }, [searchParams, onParamsLoaded]);

  return null;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  const handleParamsLoaded = (token: string | null, email: string | null) => {
    setToken(token);
    setEmail(email);
  };

  useEffect(() => {
    // Token varsa doğrulamayı yap
    if (token) {
      verifyEmail();
    }
  }, [token]);

  async function verifyEmail() {
    try {
      const response = await fetch(`/api/auth/verify?token=${token}`, {
        method: "GET",
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message);
      } else {
        setStatus("error");
        setMessage(data.message || "Doğrulama başarısız oldu");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.");
    }
  }

  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
      <Suspense fallback={null}>
        <EmailVerificationParams onParamsLoaded={handleParamsLoaded} />
      </Suspense>

      <div className='flex w-full max-w-md flex-col gap-6'>
        <a href='/' className='flex items-center gap-2 self-center font-medium'>
          <div className='flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground'>
            <GalleryVerticalEnd className='size-4' />
          </div>
          BUDGET TRACKER
        </a>

        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-xl'>E-posta Doğrulama</CardTitle>
            <CardDescription>
              {token
                ? "E-posta adresiniz doğrulanıyor"
                : `Lütfen ${email} adresine gönderilen e-postadaki doğrulama bağlantısına tıklayın`}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center justify-center py-8'>
            {token ? (
              <>
                {status === "loading" && (
                  <div className='flex flex-col items-center gap-4'>
                    <Loader2 className='h-12 w-12 animate-spin text-primary' />
                    <p className='text-center text-muted-foreground'>
                      E-posta adresiniz doğrulanıyor...
                    </p>
                  </div>
                )}

                {status === "success" && (
                  <div className='flex flex-col items-center gap-4'>
                    <CheckCircle className='h-12 w-12 text-green-500' />
                    <p className='text-center font-medium'>{message}</p>
                    <button
                      onClick={() => router.push("/sign-in")}
                      className='mt-4 inline-flex items-center justify-center gap-2 h-9 rounded-md px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                    >
                      Giriş Sayfasına Git
                    </button>
                  </div>
                )}

                {status === "error" && (
                  <div className='flex flex-col items-center gap-4'>
                    <XCircle className='h-12 w-12 text-destructive' />
                    <p className='text-center font-medium text-destructive'>
                      {message}
                    </p>
                    <button
                      onClick={() => router.push("/")}
                      className='mt-2 inline-flex items-center justify-center gap-2 h-9 rounded-md px-4 text-sm font-medium border border-gray-300 bg-transparent hover:bg-gray-100'
                    >
                      Ana Sayfaya Dön
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className='flex flex-col items-center gap-4 text-center'>
                <p className='text-muted-foreground'>
                  E-posta adresinize bir doğrulama bağlantısı gönderdik. Lütfen
                  gelen kutunuzu kontrol edin.
                </p>
                <p className='text-sm text-muted-foreground'>
                  E-posta 5-10 dakika içinde gelmezse, spam klasörünü kontrol
                  edin veya tekrar kayıt olmayı deneyin.
                </p>
                <div className='flex gap-4 mt-4'>
                  <button
                    onClick={() => router.push("/")}
                    className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-4 text-sm font-medium border border-gray-300 bg-transparent hover:bg-gray-100'
                  >
                    Ana Sayfaya Dön
                  </button>
                  <button
                    onClick={() => router.push("/sign-up")}
                    className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-4 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                  >
                    Tekrar Kayıt Ol
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
