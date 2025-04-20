"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { CategoryCreator } from "@/components/category-creator";

const formSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z
    .union([
      z.literal(""),
      z.coerce.number().positive({ message: "Tutar pozitif olmalıdır" }),
    ])
    .refine((val) => val !== "", {
      message: "Tutar girilmelidir",
    }),
  categoryId: z.string().min(1, { message: "Lütfen bir kategori seçin" }),
  description: z.string().optional(),
  date: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewTransactionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<
    { id: string; name: string; type: string }[]
  >([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      categoryId: "",
      description: "",
      date: new Date(),
    },
  });

  const transactionType = form.watch("type");

  // Kategorileri API'den çek
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
      toast.error("Kategoriler yüklenemedi");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [session?.user]);

  // Kategori eklendiğinde seçim yapmak için
  const handleCategoryCreated = (newCategory: {
    id: string;
    name: string;
    type: string;
  }) => {
    fetchCategories();
    form.setValue("categoryId", newCategory.id.toString());
  };

  async function onSubmit(values: FormValues) {
    if (!session?.user?.id) {
      toast.error("Oturum açmanız gerekiyor");
      return;
    }

    setLoading(true);

    try {
      // API'ye işlem oluşturma isteği gönder
      const response = await fetch("/api/transactions", {
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
          errorData.error || "İşlem oluşturulurken bir hata oluştu"
        );
      }

      toast.success("İşlem başarıyla oluşturuldu");

      // Başarılı işlemden sonra işlemler sayfasına yönlendir
      router.push("/transactions");
      router.refresh();
    } catch (error: any) {
      console.error("İşlem oluşturma hatası:", error);
      toast.error(error.message || "İşlem oluşturulurken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  const filteredCategories = categories.filter(
    (cat) => cat.type === transactionType
  );

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='mb-6'>
        <Heading
          title='Yeni İşlem'
          description='Yeni bir gelir veya gider işlemi ekleyin'
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İşlem Detayları</CardTitle>
          <CardDescription>
            İşleminizin detaylarını aşağıya girin
          </CardDescription>
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
                        defaultValue={field.value}
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
                            value={
                              field.value === undefined || field.value === 0
                                ? ""
                                : field.value
                            }
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? ""
                                  : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
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
                    <div className='flex items-center justify-between'>
                      <FormLabel>Kategori</FormLabel>
                      <CategoryCreator
                        initialType={transactionType}
                        onCategoryCreated={handleCategoryCreated}
                      />
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Bir kategori seçin' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCategories.length === 0 ? (
                          <div className='p-2 text-center text-sm text-gray-500'>
                            Kategori bulunamadı. Yeni bir kategori ekleyin.
                          </div>
                        ) : (
                          filteredCategories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))
                        )}
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
                <button
                  type='button'
                  onClick={() => router.back()}
                  className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700'
                >
                  İptal
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none'
                >
                  {loading ? "Kaydediliyor..." : "İşlemi Kaydet"}
                </button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
