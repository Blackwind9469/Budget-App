"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heading } from "@/components/ui/heading";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().positive({ message: "Tutar pozitif olmalıdır" }),
  categoryId: z.string().min(1, { message: "Lütfen bir kategori seçin" }),
  description: z.string().optional(),
  date: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    { id: string; name: string; type: string }[]
  >([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: undefined,
      categoryId: "",
      description: "",
      date: new Date(),
    },
  });

  const transactionType = form.watch("type");
  const filteredCategories = categories.filter(
    (cat) => cat.type === transactionType
  );

  // İşlem verilerini yükle
  useEffect(() => {
    const fetchTransaction = async () => {
      if (!session?.user?.id || !params.id) return;

      setLoading(true);
      setError(null);

      try {
        // İşlem verilerini getir
        const response = await fetch(`/api/transactions/${params.id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "İşlem bulunamadı");
        }

        const transaction = await response.json();

        // Formu doldur
        form.reset({
          type: transaction.type,
          amount: transaction.amount,
          categoryId: transaction.categoryId.toString(),
          description: transaction.description || "",
          date: new Date(transaction.date),
        });
      } catch (error: any) {
        console.error("İşlem yükleme hatası:", error);
        setError(error.message || "İşlem yüklenemedi");
        toast.error(error.message || "İşlem yüklenemedi");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [session?.user?.id, params.id, form]);

  // Kategorileri yükle
  useEffect(() => {
    const fetchCategories = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch(`/api/categories`);
        if (!response.ok) {
          throw new Error("Kategoriler yüklenirken bir hata oluştu");
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Kategori yükleme hatası:", error);
      }
    };

    fetchCategories();
  }, [session?.user]);

  async function onSubmit(values: FormValues) {
    if (!session?.user?.id || !params.id) {
      toast.error("Oturum açmanız gerekiyor");
      return;
    }

    setSubmitting(true);

    try {
      // API ile işlemi güncelle
      const response = await fetch(`/api/transactions/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "İşlem güncellenirken bir hata oluştu"
        );
      }

      toast.success("İşlem başarıyla güncellendi");

      // İşlemler sayfasına yönlendir
      router.push("/transactions");
      router.refresh();
    } catch (error: any) {
      console.error("İşlem güncelleme hatası:", error);
      toast.error(error.message || "İşlem güncellenirken bir hata oluştu");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-2xl mx-auto mt-10 text-center'>
        <h2 className='text-xl font-bold mb-4'>Hata</h2>
        <p className='text-muted-foreground mb-6'>{error}</p>
        <Button onClick={() => router.push("/transactions")}>
          İşlemler Sayfasına Dön
        </Button>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='mb-6'>
        <Heading
          title='İşlemi Düzenle'
          description='İşlem bilgilerini güncelleyin'
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İşlem Detayları</CardTitle>
          <CardDescription>İşleminizin detaylarını güncelleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem className='space-y-3'>
                    <FormLabel>İşlem Türü</FormLabel>
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

              <div className='grid gap-6 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tutar</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                            ₺
                          </span>
                          <Input
                            type='number'
                            step='0.01'
                            placeholder='0.00'
                            className='pl-7'
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='date'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarih</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Bir tarih seçin</span>
                              )}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='categoryId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Bir kategori seçin' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama (İsteğe bağlı)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Bu işlem hakkında notlar ekleyin'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Bu işlemi hatırlamanıza yardımcı olacak detaylar ekleyin
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-end gap-4'>
                <Button
                  className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                  type='button'
                  variant='outline'
                  onClick={() => router.back()}
                >
                  İptal
                </Button>
                <Button
                  type='submit'
                  disabled={submitting}
                  className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                >
                  {submitting ? "Güncelleniyor..." : "Güncelle"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
