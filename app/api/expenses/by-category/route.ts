import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getExpensesByCategory } from "@/lib/transactions";

// GET /api/expenses/by-category - Kategorilere göre harcama verilerini getir
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

    // URL'den parametreleri al
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    
    // Kategorilere göre harcama verilerini getir
    const expenses = await getExpensesByCategory(session.user.id, {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined
    });

    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error("Kategori harcamaları getirilirken hata:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Bir hata oluştu" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
} 