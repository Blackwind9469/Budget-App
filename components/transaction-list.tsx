"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import {
  AlertTriangle,
  ArrowDownIcon,
  ArrowUpIcon,
  MoreHorizontal,
  Trash,
  Pencil,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TransactionListProps {
  limit?: number;
  filters?: {
    type?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
  };
}

interface Transaction {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  description?: string;
  date: string | Date;
  categoryId: string;
  userId: string;
  categoryName?: string;
  categoryIcon?: string;
}

export function TransactionList({ limit, filters }: TransactionListProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!session?.user?.id) return;

      setLoading(true);
      setError(null);

      try {
        // Sorgu parametrelerini oluştur
        const params = new URLSearchParams();
        if (limit) params.append("limit", limit.toString());
        if (filters?.type) params.append("type", filters.type);
        if (filters?.categoryId)
          params.append("categoryId", filters.categoryId);
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);

        // API üzerinden işlemleri getir
        const response = await fetch(`/api/transactions?${params.toString()}`);

        if (!response.ok) {
          throw new Error("İşlemler yüklenirken bir hata oluştu");
        }

        const data = await response.json();
        setTransactions(data);
      } catch (error: any) {
        console.error("İşlem yükleme hatası:", error);
        setError(error.message || "İşlemler yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [session?.user?.id, limit, filters]);

  const handleEditTransaction = (transactionId: string) => {
    router.push(`/transactions/edit/${transactionId}`);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!session?.user?.id) {
      toast.error("Oturum açmanız gerekiyor");
      return;
    }

    setIsDeleting(true);

    try {
      // API üzerinden işlemi sil
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "İşlem silinirken bir hata oluştu");
      }

      // Başarılı silme işleminden sonra işlemi listeden kaldır
      setTransactions((prevTransactions) =>
        prevTransactions.filter(
          (transaction) => transaction.id !== transactionId
        )
      );

      toast.success("İşlem başarıyla silindi");
      setDeleteTransactionId(null);
    } catch (error: any) {
      console.error("İşlem silme hatası:", error);
      toast.error(error.message || "İşlem silinirken bir hata oluştu");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-10'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center py-10 text-center'>
        <AlertTriangle className='h-10 w-10 text-destructive mb-4' />
        <h3 className='text-lg font-medium'>Hata oluştu</h3>
        <p className='text-sm text-muted-foreground mt-1'>{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-10 text-center'>
        <AlertTriangle className='h-10 w-10 text-muted-foreground mb-4' />
        <h3 className='text-lg font-medium'>İşlem bulunamadı</h3>
        <p className='text-sm text-muted-foreground mt-1'>
          Seçilen dönem için işlem bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Açıklama</TableHead>
            <TableHead className='text-right'>Tutar</TableHead>
            <TableHead className='w-[50px]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className='font-medium'>
                {format(new Date(transaction.date), "dd MMM yyyy")}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    transaction.type === "INCOME" ? "outline" : "secondary"
                  }
                >
                  {transaction.categoryName}
                </Badge>
              </TableCell>
              <TableCell className='max-w-[200px] truncate'>
                {transaction.description || "-"}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium",
                  transaction.type === "INCOME"
                    ? "text-green-500"
                    : "text-destructive"
                )}
              >
                {transaction.type === "INCOME" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      onClick={() => handleEditTransaction(transaction.id)}
                    >
                      <Pencil className='mr-2 h-4 w-4' />
                      Düzenle
                    </DropdownMenuItem>
                    <AlertDialog
                      open={deleteTransactionId === transaction.id}
                      onOpenChange={(open) =>
                        !open && setDeleteTransactionId(null)
                      }
                    >
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className='text-destructive'
                          onClick={() => setDeleteTransactionId(transaction.id)}
                        >
                          <Trash className='mr-2 h-4 w-4' />
                          Sil
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Bu işlemi silmek istediğinizden emin misiniz?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu işlem geri alınamaz. Bu işlem kalıcı olarak
                            silinecektir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteTransaction(transaction.id)
                            }
                            disabled={isDeleting}
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Siliniyor...
                              </>
                            ) : (
                              "Sil"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
