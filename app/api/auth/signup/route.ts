import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "@/lib/user";

// Kullanıcı kayıt şeması
const signUpSchema = z.object({
  name: z.string().min(2),
  surname: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().min(5),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    // İstek gövdesini al
    const body = await req.json();

    // İstek verilerini doğrula
    const validationResult = signUpSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          message: "Geçersiz bilgiler. Lütfen tüm alanları doğru şekilde doldurun.",
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Kullanıcıyı oluştur
    const result = await createUser(validationResult.data);

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: result.message,
        userId: result.userId
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Kullanıcı kaydı hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." },
      { status: 500 }
    );
  }
} 