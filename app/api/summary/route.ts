import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTransactionSummary } from "@/lib/transactions";

// GET /api/summary - Finansal özet bilgilerini getir
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

    // URL'den parametreleri al
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    
    // Özet bilgilerini getir
    const summary = await getTransactionSummary(session.user.id, {
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined
    });

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Özet bilgisi getirilirken hata:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Bir hata oluştu" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
} 