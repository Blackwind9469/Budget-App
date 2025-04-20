import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCategories, createCategory, TransactionType } from "@/lib/categories";

// GET /api/categories - Tüm kategorileri getir
export async function GET(request: NextRequest) {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Kategorileri getir
    const categories = await getCategories();

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
export async function POST(request: NextRequest) {
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
    const { name, type, icon } = body;

    // Gerekli alanları kontrol et
    if (!name || !type) {
      return new NextResponse(
        JSON.stringify({ error: "Eksik alanlar: İsim ve tür gerekli" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
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
      icon
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