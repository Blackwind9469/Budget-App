import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCategories, createCategory, TransactionType } from "@/lib/categories";

// GET /api/categories - Kullanıcının kategorilerini getir
export async function GET(request: Request) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // URL'den userId parametresini al
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;

    // Kullanıcı yalnızca kendi kategorilerini görebilmeli
    if (userId !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Kategorileri getir
    const categories = await getCategories(userId);

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Kategoriler getirilirken hata:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Bir hata oluştu" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// POST /api/categories - Yeni kategori oluştur
export async function POST(request: Request) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // İstek gövdesini al
    const body = await request.json();
    const { name, type, icon, userId } = body;

    // Gerekli alanları kontrol et
    if (!name || !type || !userId) {
      return new NextResponse(
        JSON.stringify({ error: "Eksik alanlar: İsim, tür ve kullanıcı ID gerekli" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Kullanıcı yalnızca kendi adına kategori oluşturabilmeli
    if (userId !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Kategori türünü kontrol et
    if (type !== TransactionType.INCOME && type !== TransactionType.EXPENSE) {
      return new NextResponse(
        JSON.stringify({ error: "Geçersiz kategori türü. INCOME veya EXPENSE olmalı" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Yeni kategori oluştur
    const newCategory = await createCategory({
      name,
      type,
      icon,
      userId,
    });

    return new NextResponse(JSON.stringify(newCategory), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Kategori oluşturulurken hata:", error);
    
    // Eğer zaten var hatası ise
    if (error.message.includes("zaten var")) {
      return new NextResponse(
        JSON.stringify({ error: error.message }),
        {
          status: 409, // Conflict
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    return new NextResponse(
      JSON.stringify({ error: error.message || "Bir hata oluştu" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
} 