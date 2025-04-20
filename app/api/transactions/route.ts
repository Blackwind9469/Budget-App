import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  getTransactions, 
  getFilteredTransactions, 
  createTransaction,
  Transaction
} from "@/lib/transactions";
import { TransactionType } from "@/lib/categories";

// GET /api/transactions - Kullanıcının işlemlerini getir
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
    const userId = searchParams.get("userId") || session.user.id;
    
    // Kullanıcı yalnızca kendi işlemlerini görebilmeli
    if (userId !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Filtreleme parametrelerini al
    const type = searchParams.get("type") as TransactionType | null;
    const categoryId = searchParams.get("categoryId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset") as string) : undefined;

    // Filtreleme varsa filtrelenmiş işlemleri, yoksa tüm işlemleri getir
    let transactions;
    if (type || categoryId || startDate || endDate || limit || offset) {
      // Filtreleme parametrelerini topla
      const filters: any = { userId };
      if (type) filters.type = type;
      if (categoryId) filters.categoryId = categoryId;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (limit) filters.limit = limit;
      if (offset) filters.offset = offset;

      transactions = await getFilteredTransactions(userId, filters);
    } else {
      transactions = await getTransactions(userId);
    }

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("İşlemler getirilirken hata:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Bir hata oluştu" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// POST /api/transactions - Yeni işlem oluştur
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
    const { amount, type, description, date, categoryId, userId } = body;

    // Gerekli alanları kontrol et
    if (!amount || !type || !categoryId || !userId) {
      return new NextResponse(
        JSON.stringify({ error: "Eksik alanlar: Tutar, tür, kategori ID ve kullanıcı ID gerekli" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Tutar sayısal olmalı
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return new NextResponse(
        JSON.stringify({ error: "Geçersiz tutar. Pozitif bir sayı olmalı" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Kullanıcı yalnızca kendi adına işlem oluşturabilmeli
    if (userId !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // İşlem türünü kontrol et
    if (type !== TransactionType.INCOME && type !== TransactionType.EXPENSE) {
      return new NextResponse(
        JSON.stringify({ error: "Geçersiz işlem türü. INCOME veya EXPENSE olmalı" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Yeni işlem oluştur
    const newTransaction = await createTransaction({
      amount: Number(amount),
      type,
      description,
      date: date || new Date(),
      categoryId,
      userId,
    });

    return new NextResponse(JSON.stringify(newTransaction), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("İşlem oluşturulurken hata:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Bir hata oluştu" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
} 