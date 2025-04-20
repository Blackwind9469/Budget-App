import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteCategory } from "@/lib/categories";

// Kategori silme endpoint'i
export const dynamic = 'force-dynamic'; // Zorunlu olarak dinamik route olarak işaretliyoruz

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Kategori ID'sini al
    const id = params.id;
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: "Kategori ID'si gerekli" }),
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

    // Kullanıcı ID'sini oturumdan al
    const userId = session.user.id;

    // Kategoriyi sil
    await deleteCategory(id);

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Kategori silinirken hata:", error);
    
    // Kategori bulunamadı hatası ise
    if (error.message.includes("bulunamadı")) {
      return new NextResponse(
        JSON.stringify({ error: error.message }),
        {
          status: 404, // Not Found
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