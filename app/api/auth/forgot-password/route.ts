import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/user";

// Şifre sıfırlama şeması
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
});

export async function POST(req: NextRequest) {
  try {
    // İstek gövdesini al
    const body = await req.json();

    // İstek verilerini doğrula
    const validationResult = forgotPasswordSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: "Geçersiz e-posta adresi.",
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Şifre sıfırlama isteği gönder
    const result = await requestPasswordReset(validationResult.data.email);

    return NextResponse.json(
      { message: result.message },
      { status: result.success ? 200 : 400 }
    );
  } catch (error: any) {
    console.error("Şifre sıfırlama isteği hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." },
      { status: 500 }
    );
  }
} 