"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface BalanceCardProps {
  type: "income" | "expense" | "net";
  startDate?: string;
  endDate?: string;
}

export function BalanceCard({ type, startDate, endDate }: BalanceCardProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      if (!session?.user?.id) return;

      setLoading(true);
      setError(null);

      try {
        // Sorgu parametrelerini oluştur
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        // API üzerinden finansal özeti getir
        const response = await fetch(`/api/summary?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "API yanıt vermedi");
        }

        const data = await response.json();
        setSummary(data);
      } catch (err: any) {
        console.error("Özet bilgisi yüklenirken hata:", err);
        setError(err.message || "Veriler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [session?.user?.id, startDate, endDate]);

  // Kart içeriğini, başlığını ve ikonunu belirle
  let title = "";
  let value = 0;
  let icon = null;
  let description = "";
  let colorClass = "";

  switch (type) {
    case "income":
      title = "Toplam Gelir";
      value = summary.income;
      icon = <TrendingUp className='h-4 w-4 text-emerald-500' />;
      description = "Bu dönemdeki toplam gelirleriniz";
      colorClass = "text-emerald-500";
      break;
    case "expense":
      title = "Toplam Gider";
      value = summary.expense;
      icon = <TrendingDown className='h-4 w-4 text-rose-500' />;
      description = "Bu dönemdeki toplam giderleriniz";
      colorClass = "text-rose-500";
      break;
    case "net":
      title = "Net Bakiye";
      value = summary.balance;
      icon = <Wallet className='h-4 w-4 text-blue-500' />;
      description = "Gelir ve gider arasındaki fark";
      colorClass = value >= 0 ? "text-emerald-500" : "text-rose-500";
      break;
  }

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm font-medium'>{title}</CardTitle>
          {icon}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className='h-6 animate-pulse bg-muted rounded'></div>
        ) : error ? (
          <div className='text-sm text-destructive'>Hata: {error}</div>
        ) : (
          <div className={`text-2xl font-bold ${colorClass}`}>
            {value.toFixed(2)} TL
          </div>
        )}
      </CardContent>
    </Card>
  );
}
