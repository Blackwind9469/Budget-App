import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetPassword } from "@/lib/user";

// Şifre sıfırlama şeması
const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token gereklidir" }),
  password: z.string().min(8, { message: "Şifre en az 8 karakter olmalıdır" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
  try {
    // İstek gövdesini al
    const body = await req.json();

    // İstek verilerini doğrula
    const validationResult = resetPasswordSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: "Geçersiz şifre sıfırlama isteği.",
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Şifreyi sıfırla
    const result = await resetPassword(
      validationResult.data.token,
      validationResult.data.password
    );

    return NextResponse.json(
      { message: result.message },
      { status: result.success ? 200 : 400 }
    );
  } catch (error: any) {
    console.error("Şifre sıfırlama hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." },
      { status: 500 }
    );
  }
} 