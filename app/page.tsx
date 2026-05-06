'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Heart, Star, Filter, Search, Minus, Plus, Trash2 } from 'lucide-react';
import { createOrder, fetchProducts, type CartItem, type Product } from '@/lib/supabase';

const fallbackProducts: Product[] = [
  { id: 'demo-1', name: 'خاتم الزفاف الذهبي', name_en: 'Golden Wedding Ring', description: 'خاتم فاخر بتصميم أنيق.', price: 1500, image_url: '/placeholder.svg?height=300&width=300', stock: 5, rating: 4.8, reviews: 128, category: 'خواتم', is_active: true },
  { id: 'demo-2', name: 'عقد الأميرة', name_en: 'Princess Necklace', description: 'عقد أنيق مستوحى من التصاميم الملكية.', price: 2800, image_url: '/placeholder.svg?height=300&width=300', stock: 3, rating: 4.9, reviews: 95, category: 'عقود', is_active: true },
  { id: 'demo-3', name: 'أساور الماس', name_en: 'Diamond Bracelets', description: 'أساور براقة للمناسبات.', price: 3200, image_url: '/placeholder.svg?height=300&width=300', stock: 2, rating: 4.7, reviews: 67, category: 'أساور', is_active: true },
  { id: 'demo-4', name: 'أقراط الفضة', name_en: 'Silver Earrings', description: 'أقراط فضية خفيفة وعملية.', price: 800, image_url: '/placeholder.svg?height=300&width=300', stock: 8, rating: 4.6, reviews: 142, category: 'أقراط', is_active: true },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [query, setQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [orderMessage, setOrderMessage] = useState('');

  useEffect(() => {
    fetchProducts()
      .then((items) => {
        if (items.length > 0) setProducts(items);
      })
      .catch((error) => {
        console.warn('Using fallback products:', error.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))).filter(Boolean),
    [products]
  );

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = normalizedQuery
      ? `${product.name} ${product.name_en || ''} ${product.category}`.toLowerCase().includes(normalizedQuery)
      : true;
    return matchesCategory && matchesQuery;
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]));
  };

  const addToCart = (product: Product) => {
    if (product.stock === 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, Math.min(quantity, item.stock)) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const submitOrder = async () => {
    setOrderMessage('');
    if (cart.length === 0) return setOrderMessage('السلة فارغة.');
    if (!customerName.trim() || !customerPhone.trim()) {
      return setOrderMessage('أدخل الاسم ورقم الهاتف لإتمام الطلب.');
    }

    try {
      await createOrder({
        customer_name: customerName,
        customer_phone: `${customerPhone}${note ? ` | ملاحظة: ${note}` : ''}`,
        total,
        items: cart.map((item) => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      });
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setNote('');
      setOrderMessage('تم إرسال الطلب بنجاح. سنتواصل معك قريبًا.');
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : 'تعذر إرسال الطلب.');
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary">Bijoux Fati</h1>
            <p className="text-xs text-muted-foreground">المجوهرات الفاخرة على Pi Network</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-muted rounded-lg transition" aria-label="المفضلات">
              <Heart size={20} className={favorites.length > 0 ? 'fill-red-500 text-red-500' : ''} />
            </button>
            <button onClick={() => setIsCartOpen(true)} className="p-2 hover:bg-muted rounded-lg transition relative" aria-label="السلة">
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center bg-muted rounded-lg px-3 py-2">
            <Search size={18} className="text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} type="text" placeholder="ابحث عن المجوهرات..." className="flex-1 bg-transparent outline-none mr-2 text-sm" />
          </div>
        </div>
      </header>

      <div className="px-4 py-3 border-b border-border overflow-x-auto">
        <div className="flex gap-2">
          <Button onClick={() => setSelectedCategory('')} variant={selectedCategory === '' ? 'default' : 'outline'} className="whitespace-nowrap text-sm h-8">الكل</Button>
          {categories.map((cat) => (
            <Button key={cat} onClick={() => setSelectedCategory(cat)} variant={selectedCategory === cat ? 'default' : 'outline'} className="whitespace-nowrap text-sm h-8">{cat}</Button>
          ))}
        </div>
      </div>

      <main className="px-4 py-6 pb-24">
        <div className="mb-8 rounded-xl overflow-hidden bg-gradient-to-r from-primary/10 to-accent/10 p-6 border border-border">
          <Badge className="mb-3">{isLoading ? 'جاري التحميل...' : 'متجر متصل بقاعدة البيانات'}</Badge>
          <h2 className="text-xl font-semibold mb-2">تشكيلة Bijoux Fati</h2>
          <p className="text-sm text-muted-foreground mb-4">اختاري القطعة المناسبة وأرسلي الطلب مباشرة من التطبيق.</p>
          <Button onClick={() => setSelectedCategory('')} className="w-full">تصفح المجموعة</Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              <div className="relative aspect-square bg-muted overflow-hidden">
                <img src={product.image_url || '/placeholder.svg?height=300&width=300'} alt={product.name} className="w-full h-full object-cover" />
                {product.stock === 0 ? <Badge className="absolute top-2 right-2 bg-destructive text-white">نفذ</Badge> : product.stock < 3 ? <Badge className="absolute top-2 right-2 bg-amber-500 text-white">متبقي {product.stock}</Badge> : <Badge className="absolute top-2 right-2 bg-green-600 text-white">متوفر</Badge>}
                <button onClick={() => toggleFavorite(product.id)} className="absolute bottom-2 left-2 bg-white rounded-full p-2 hover:bg-gray-100 transition shadow-md" aria-label="إضافة للمفضلة">
                  <Heart size={18} className={favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-foreground'} />
                </button>
              </div>

              <div className="flex-1 p-3 flex flex-col">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{product.name_en}</p>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < Math.floor(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />)}
                  <span className="text-xs text-muted-foreground">({product.reviews || 0})</span>
                </div>
                <p className="text-lg font-bold text-primary mb-3">{product.price.toLocaleString('ar-MA')} Pi</p>
                <Button onClick={() => addToCart(product)} disabled={product.stock === 0} className="w-full text-sm h-8" variant={product.stock === 0 ? 'outline' : 'default'}>{product.stock === 0 ? 'غير متوفر' : 'أضف للسلة'}</Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && <div className="text-center py-12"><Filter size={48} className="mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">لا توجد منتجات مطابقة</p></div>}
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">السلة</h2>
              <Button variant="outline" onClick={() => setIsCartOpen(false)}>إغلاق</Button>
            </div>

            {cart.length === 0 ? <p className="text-muted-foreground py-8 text-center">السلة فارغة</p> : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="border rounded-xl p-3 flex gap-3 items-center">
                    <img src={item.image_url || '/placeholder.svg'} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-muted" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-sm text-primary font-bold">{item.price.toLocaleString('ar-MA')} Pi</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={14} /></Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={14} /></Button>
                        <Button size="sm" variant="ghost" onClick={() => updateQuantity(item.id, 0)}><Trash2 size={14} /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t mt-4 pt-4 space-y-3">
              <div className="flex justify-between font-bold text-lg"><span>المجموع</span><span>{total.toLocaleString('ar-MA')} Pi</span></div>
              <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="الاسم الكامل" />
              <Input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="رقم الهاتف أو واتساب" />
              <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="ملاحظة اختيارية" />
              {orderMessage && <p className="text-sm text-center text-muted-foreground">{orderMessage}</p>}
              <Button onClick={submitOrder} className="w-full" disabled={cart.length === 0}>إرسال الطلب</Button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-2 flex justify-around">
        <button className="p-3 rounded-lg hover:bg-muted transition flex flex-col items-center gap-1 flex-1"><Search size={20} /><span className="text-xs">بحث</span></button>
        <button className="p-3 rounded-lg hover:bg-muted transition flex flex-col items-center gap-1 flex-1"><Filter size={20} /><span className="text-xs">فلتر</span></button>
        <button className="p-3 rounded-lg hover:bg-muted transition flex flex-col items-center gap-1 flex-1"><Heart size={20} /><span className="text-xs">مفضلاتي</span></button>
        <button onClick={() => setIsCartOpen(true)} className="p-3 rounded-lg hover:bg-muted transition flex flex-col items-center gap-1 flex-1 relative"><ShoppingCart size={20} /><span className="text-xs">السلة</span>{cartCount > 0 && <span className="absolute top-1 right-1 bg-destructive text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}</button>
      </nav>
    </div>
  );
}
