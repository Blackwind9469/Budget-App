"use client";

import { Heading } from "@/components/ui/heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionFilters } from "@/components/transaction-filters";
import { TransactionList } from "@/components/transaction-list";
import { Wallet } from "lucide-react";

export default function TransactionsPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Heading
          title='Transactions'
          description='Manage your financial activities'
        />
        <TransactionFilters />
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center space-x-2'>
            <Wallet className='h-5 w-5 text-muted-foreground' />
            <CardTitle>All Transactions</CardTitle>
          </div>
          <CardDescription>
            View, filter, and manage your transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionList />
        </CardContent>
      </Card>
    </div>
  );
}
