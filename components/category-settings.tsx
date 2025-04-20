"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Plus, Trash } from "lucide-react";
import { Category, TransactionType } from "@/lib/categories";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

// Lucide ikon listesi
const lucideIcons = [
  "banknote",
  "trending-up",
  "briefcase",
  "gift",
  "plus-circle",
  "home",
  "utensils",
  "car",
  "zap",
  "heart-pulse",
  "film",
  "shopping-bag",
  "book",
  "plane",
  "repeat",
  "minus-circle",
];

export function CategorySettings() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TransactionType>(
    TransactionType.INCOME
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Kategori verileri
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);

  // Yeni kategori bilgileri
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "banknote",
  });

  // Kategorileri yükle
  const fetchCategories = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/categories?userId=${session.user.id}`);

      if (!response.ok) {
        throw new Error("Kategoriler getirilemedi");
      }

      const data = await response.json();

      setIncomeCategories(
        data.filter((cat: Category) => cat.type === TransactionType.INCOME)
      );
      setExpenseCategories(
        data.filter((cat: Category) => cat.type === TransactionType.EXPENSE)
      );
    } catch (err) {
      console.error("Kategori yüklenirken hata:", err);
      setError("Kategoriler yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  // Sayfa yüklendiğinde kategorileri getir
  useEffect(() => {
    if (session?.user?.id) {
      fetchCategories();
    }
  }, [session?.user?.id]);

  // Yeni kategori ekle
  const handleAddCategory = async () => {
    if (!session?.user?.id) return;
    if (newCategory.name.trim() === "") {
      toast({
        title: "Hata",
        description: "Kategori adı boş olamaz",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategory.name,
          type: selectedTab,
          icon: newCategory.icon,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Kategori eklenirken bir hata oluştu");
      }

      const newCategoryData = await response.json();

      // Kategorileri güncelle
      if (selectedTab === TransactionType.INCOME) {
        setIncomeCategories([...incomeCategories, newCategoryData]);
      } else {
        setExpenseCategories([...expenseCategories, newCategoryData]);
      }

      // Formu temizle ve dialogu kapat
      setNewCategory({ name: "", icon: "banknote" });
      setIsAddDialogOpen(false);

      toast({
        title: "Başarılı",
        description: "Yeni kategori eklendi",
      });
    } catch (err: any) {
      console.error("Kategori eklenirken hata:", err);
      toast({
        title: "Hata",
        description: err.message || "Kategori eklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Kategori sil
  const handleDeleteCategory = async (
    id: string | number,
    type: TransactionType
  ) => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Kategori silinirken bir hata oluştu");
      }

      // Kategorileri güncelle
      if (type === TransactionType.INCOME) {
        setIncomeCategories(incomeCategories.filter((cat) => cat.id !== id));
      } else {
        setExpenseCategories(expenseCategories.filter((cat) => cat.id !== id));
      }

      toast({
        title: "Başarılı",
        description: "Kategori silindi",
      });
    } catch (err) {
      console.error("Kategori silinirken hata:", err);
      toast({
        title: "Hata",
        description: "Kategori silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <p className='text-sm text-muted-foreground'>
          İşlemlerinizi daha iyi organize etmek için kategorileri özelleştirin
        </p>
        <Button onClick={() => setIsAddDialogOpen(true)} size='sm'>
          <Plus className='h-4 w-4 mr-2' />
          Kategori Ekle
        </Button>
      </div>

      {error && (
        <div className='bg-destructive/10 text-destructive p-3 rounded-md'>
          {error}
        </div>
      )}

      <Tabs
        defaultValue={TransactionType.INCOME}
        className='w-full'
        onValueChange={(value) => setSelectedTab(value as TransactionType)}
      >
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value={TransactionType.INCOME}>
            Gelir Kategorileri
          </TabsTrigger>
          <TabsTrigger value={TransactionType.EXPENSE}>
            Gider Kategorileri
          </TabsTrigger>
        </TabsList>
        <TabsContent value={TransactionType.INCOME}>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>İkon</TableHead>
                  <TableHead className='w-[100px]'>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className='text-center h-24'>
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : incomeCategories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className='text-center h-24 text-muted-foreground'
                    >
                      Gelir kategorisi bulunamadı. Eklemek için "Kategori Ekle"
                      butonunu kullanın.
                    </TableCell>
                  </TableRow>
                ) : (
                  incomeCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className='font-medium'>
                        {category.name}
                      </TableCell>
                      <TableCell>{category.icon}</TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-destructive'
                            onClick={() =>
                              handleDeleteCategory(
                                category.id,
                                TransactionType.INCOME
                              )
                            }
                          >
                            <Trash className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value={TransactionType.EXPENSE}>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>İkon</TableHead>
                  <TableHead className='w-[100px]'>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className='text-center h-24'>
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : expenseCategories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className='text-center h-24 text-muted-foreground'
                    >
                      Gider kategorisi bulunamadı. Eklemek için "Kategori Ekle"
                      butonunu kullanın.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenseCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className='font-medium'>
                        {category.name}
                      </TableCell>
                      <TableCell>{category.icon}</TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-destructive'
                            onClick={() =>
                              handleDeleteCategory(
                                category.id,
                                TransactionType.EXPENSE
                              )
                            }
                          >
                            <Trash className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Yeni Kategori Ekle</DialogTitle>
            <DialogDescription>
              {selectedTab === TransactionType.INCOME ? "Gelir" : "Gider"}{" "}
              kategorisi oluşturun.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Kategori Adı</Label>
              <Input
                id='name'
                placeholder='Örn: Maaş, Market'
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='icon'>İkon</Label>
              <Select
                value={newCategory.icon}
                onValueChange={(icon) =>
                  setNewCategory({ ...newCategory, icon })
                }
              >
                <SelectTrigger id='icon'>
                  <SelectValue placeholder='Bir ikon seçin' />
                </SelectTrigger>
                <SelectContent>
                  {lucideIcons.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsAddDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddCategory}>Kategori Ekle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
