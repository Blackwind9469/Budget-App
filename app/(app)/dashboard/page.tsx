import { BalanceCard } from "@/components/balance-card";
import { TransactionList } from "@/components/transaction-list";
import { ExpensesByCategoryChart } from "@/components/expenses-by-category-chart";
import { MonthlyTrendsChart } from "@/components/monthly-trends-chart";
import { DateRangePicker } from "@/components/date-range-picker";
import { DashboardFilters } from "@/components/dashboard-filters";
import { Heading } from "@/components/ui/heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, CircleDollarSign, Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Heading title='Dashboard' description='View your financial overview' />
        <div className='flex items-center gap-2'>
          <Link href='/transactions/new'>
            <button className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'>
              <Plus className='h-4 w-4' />
              <span>Yeni İşlem Ekle</span>
            </button>
          </Link>
          <DateRangePicker />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <BalanceCard type='income' />
        <BalanceCard type='expense' />
        <BalanceCard type='net' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <CircleDollarSign className='h-5 w-5 text-muted-foreground' />
                <CardTitle>Monthly Trends</CardTitle>
              </div>
              <DashboardFilters />
            </div>
            <CardDescription>
              Income vs expenses over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyTrendsChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center space-x-2'>
              <BarChart3 className='h-5 w-5 text-muted-foreground' />
              <CardTitle>Expenses by Category</CardTitle>
            </div>
            <CardDescription>Your top spending categories</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='chart'>
              <TabsList className='mb-4'>
                <TabsTrigger value='chart'>Chart</TabsTrigger>
                <TabsTrigger value='list'>List</TabsTrigger>
              </TabsList>
              <TabsContent value='chart'>
                <ExpensesByCategoryChart />
              </TabsContent>
              <TabsContent value='list'>
                <ExpensesByCategoryChart showList />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Wallet className='h-5 w-5 text-muted-foreground' />
              <CardTitle>Recent Transactions</CardTitle>
            </div>
            <Link href='/transactions/new'>
              <button className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'>
                <Plus className='h-4 w-4' />
                <span>Yeni İşlem Ekle</span>
              </button>
            </Link>
          </div>
          <CardDescription>Your latest financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList limit={5} />
        </CardContent>
        <CardFooter className='flex justify-center pt-2 pb-4'>
          <Link href='/transactions'>
            <button className='h-9 rounded-md px-3 text-sm font-medium border border-gray-300 bg-transparent hover:bg-gray-100'>
              Tüm İşlemleri Görüntüle
            </button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
