import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMonthlyTrends } from "@/lib/transactions";

// GET /api/trends/monthly - Aylık finansal trend verilerini getir
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
    const months = searchParams.get("months") ? parseInt(searchParams.get("months") as string) : 6;
    
    // Aylık trend verilerini getir
    const trends = await getMonthlyTrends(session.user.id, { months });

    return NextResponse.json(trends);
  } catch (error: any) {
    console.error("Aylık trend verileri getirilirken hata:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Bir hata oluştu" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
} 