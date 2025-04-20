import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteCategory } from "@/lib/categories";

// Kategori silme endpoint'i
export async function DELETE(
  request: Request,
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

    // İstek gövdesini al (userId'yi içeriyor)
    const body = await request.json();
    const { userId } = body;

    // Kullanıcı yalnızca kendi kategorilerini silebilmeli
    if (userId !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: "Yetkisiz erişim" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Kategoriyi sil
    await deleteCategory(id, userId);

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