"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Kategori adı en az 2 karakter olmalıdır" }),
  type: z.enum(["INCOME", "EXPENSE"]),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryCreatorProps {
  initialType: "INCOME" | "EXPENSE";
  onCategoryCreated?: (category: {
    id: string;
    name: string;
    type: string;
  }) => void;
}

export function CategoryCreator({
  initialType,
  onCategoryCreated,
}: CategoryCreatorProps) {
  const { data: session } = useSession();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      type: initialType,
    },
  });

  // İşlem türü değiştiğinde güncelle
  useEffect(() => {
    form.setValue("type", initialType);
  }, [initialType, form]);

  async function onSubmit(values: CategoryFormValues) {
    if (!session?.user?.id) {
      toast.error("Oturum açmanız gerekiyor");
      return;
    }

    setLoading(true);

    try {
      // API'ye kategori oluşturma isteği gönder
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Kategori oluşturulurken bir hata oluştu"
        );
      }

      const newCategory = await response.json();

      toast.success("Kategori başarıyla oluşturuldu");

      // Callback ile kategori oluşturulduğunu bildir
      if (onCategoryCreated) {
        onCategoryCreated(newCategory);
      }

      // Diyaloğu kapat
      setDialogOpen(false);
      form.reset({ name: "", type: initialType });
    } catch (error: any) {
      console.error("Kategori oluşturma hatası:", error);
      toast.error(error.message || "Kategori oluşturulurken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <button
          type='button'
          className='inline-flex items-center justify-center gap-1 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded px-2 py-1'
          onClick={() => form.setValue("type", initialType)}
        >
          <Plus className='h-3 w-3' />
          Yeni Kategori Ekle
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Kategori Ekle</DialogTitle>
          <DialogDescription>
            {initialType === "INCOME" ? "Gelir" : "Gider"} kategorisi ekleyin
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori Adı</FormLabel>
                  <FormControl>
                    <Input placeholder='Kategori adı...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori Türü</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className='flex space-x-4'
                    >
                      <FormItem className='flex items-center space-x-2 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='INCOME' />
                        </FormControl>
                        <FormLabel className='text-base font-normal'>
                          Gelir
                        </FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-2 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value='EXPENSE' />
                        </FormControl>
                        <FormLabel className='text-base font-normal'>
                          Gider
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <button
                type='button'
                onClick={() => setDialogOpen(false)}
                className='h-9 rounded-md px-3 text-sm font-medium border border-gray-300 bg-transparent hover:bg-gray-100'
              >
                İptal
              </button>
              <button
                type='submit'
                disabled={loading}
                className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none'
              >
                {loading ? "Ekleniyor..." : "Kategori Ekle"}
              </button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
