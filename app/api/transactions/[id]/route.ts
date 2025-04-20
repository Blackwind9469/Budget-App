import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTransactions, updateTransaction, deleteTransaction } from "@/lib/transactions";
import { TransactionType } from "@/lib/categories";

// GET /api/transactions/[id] - Belirli bir işlemi getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // İşlem ID'sini al
    const id = params.id;
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: "İşlem ID'si gerekli" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Kullanıcının işlemlerini getir
    const transactions = await getTransactions(session.user.id);
    
    // ID'ye göre filtrele
    const transaction = transactions.find(t => t.id.toString() === id);

    // İşlem bulunamadı ise
    if (!transaction) {
      return new NextResponse(
        JSON.stringify({ error: "İşlem bulunamadı" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Kullanıcı yalnızca kendi işlemlerini görebilmeli
    if (transaction.userId !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error("İşlem getirilirken hata:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Bir hata oluştu" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// PUT /api/transactions/[id] - Belirli bir işlemi güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // İşlem ID'sini al
    const id = params.id;
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: "İşlem ID'si gerekli" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Kullanıcının işlemlerini getir
    const transactions = await getTransactions(session.user.id);
    
    // ID'ye göre filtrele
    const transaction = transactions.find(t => t.id.toString() === id);

    // İşlem bulunamadı ise
    if (!transaction) {
      return new NextResponse(
        JSON.stringify({ error: "İşlem bulunamadı" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Kullanıcı yalnızca kendi işlemlerini güncelleyebilmeli
    if (transaction.userId !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // İstek gövdesini al
    const body = await request.json();
    const { amount, type, description, date, categoryId } = body;

    // Güncelleme verilerini hazırla
    const updateData: any = {};
    if (amount !== undefined) {
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return new NextResponse(
          JSON.stringify({ error: "Geçersiz tutar. Pozitif bir sayı olmalı" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      updateData.amount = Number(amount);
    }

    if (type !== undefined) {
      if (type !== TransactionType.INCOME && type !== TransactionType.EXPENSE) {
        return new NextResponse(
          JSON.stringify({ error: "Geçersiz işlem türü. INCOME veya EXPENSE olmalı" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      updateData.type = type;
    }

    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    // İşlemi güncelle - userId parametresiyle birlikte
    const updatedTransaction = await updateTransaction(id, session.user.id, updateData);

    return NextResponse.json(updatedTransaction);
  } catch (error: any) {
    console.error("İşlem güncellenirken hata:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Bir hata oluştu" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// DELETE /api/transactions/[id] - Belirli bir işlemi sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // İşlem ID'sini al
    const id = params.id;
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: "İşlem ID'si gerekli" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Kullanıcının işlemlerini getir
    const transactions = await getTransactions(session.user.id);
    
    // ID'ye göre filtrele
    const transaction = transactions.find(t => t.id.toString() === id);

    // İşlem bulunamadı ise
    if (!transaction) {
      return new NextResponse(
        JSON.stringify({ error: "İşlem bulunamadı" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Kullanıcı yalnızca kendi işlemlerini silebilmeli
    if (transaction.userId !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // İşlemi sil - kullanıcı ID'sini de sağlayarak
    await deleteTransaction(id, session.user.id);

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("İşlem silinirken hata:", error);
    return new NextResponse(
      JSON.stringify({ error: error.message || "Bir hata oluştu" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}