import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, ShoppingBag, MessageCircle, Search, 
  Trash2, Tag, Sparkles, Edit3, Save, Camera, LayoutGrid, List, Eye, Layers
} from 'lucide-react';
import { Business, ServiceItem, SupportedCurrency, SupportedLang } from '../types';
import { formatServicePrice } from '../utils/currency';
import { compressImageFile } from '../utils/mediaCompressor';

interface BusinessPriceListModalProps {
  business: Business;
  onClose: () => void;
  onOpenDeliveryOrder?: (business: Business, selectedItems?: { name: string; price: string; qty: number }[]) => void;
  currentCurrency: SupportedCurrency;
  lang: SupportedLang;
  isOwner?: boolean;
  onUpdateServices?: (services: ServiceItem[]) => void;
}

const MAX_PRICE_LIST_ITEMS = 100;

const ACTIVITY_SAMPLE_IMAGES: Record<string, string[]> = {
  food: [
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=70',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=70',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=70',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&q=70',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=70',
    'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=300&q=70',
  ],
  medical: [
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&q=70',
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300&q=70',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300&q=70',
  ],
  transport: [
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&q=70',
    'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=300&q=70',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=300&q=70',
  ],
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=70',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&q=70',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&q=70',
  ],
  general: [
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&q=70',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=70',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=70',
  ],
};

const getActivityImagePool = (cat: string): string[] => {
  if (cat.includes('مطاعم') || cat.includes('سندوتشات') || cat.includes('كافيهات') || cat.includes('خضروات')) {
    return ACTIVITY_SAMPLE_IMAGES.food;
  }
  if (cat.includes('أطباء') || cat.includes('عيادات') || cat.includes('مستشفيات') || cat.includes('صيدليات')) {
    return ACTIVITY_SAMPLE_IMAGES.medical;
  }
  if (cat.includes('تاكسي') || cat.includes('ليموزين') || cat.includes('موتوسيكل') || cat.includes('أتوبيسات') || cat.includes('شحن')) {
    return ACTIVITY_SAMPLE_IMAGES.transport;
  }
  if (cat.includes('فنادق') || cat.includes('منتجعات') || cat.includes('سياحة')) {
    return ACTIVITY_SAMPLE_IMAGES.hotel;
  }
  return ACTIVITY_SAMPLE_IMAGES.general;
};

const getDefaultServicesForActivity = (business: Business): ServiceItem[] => {
  const cat = business.cat || '';
  const pool = getActivityImagePool(cat);
  if (cat.includes('أطباء') || cat.includes('عيادات') || cat.includes('مستشفيات') || cat.includes('صيدليات')) {
    return [
      { n: `كشف طبي واستشارة - ${business.name}`, p: '200 ج.م', priceEgp: 200, imageUrl: pool[0], compressedKb: 18 },
      { n: 'متابعة وفحص شامل بالعيادة', p: '100 ج.م', priceEgp: 100, imageUrl: pool[1 % pool.length], compressedKb: 16 },
      { n: 'زيارة واستشارة طبية طارئة', p: '350 ج.م', priceEgp: 350, imageUrl: pool[2 % pool.length], compressedKb: 19 },
    ];
  }
  if (cat.includes('فنادق') || cat.includes('منتجعات') || cat.includes('سياحة')) {
    return [
      { n: `حجز غرفة مزدوجة شاملة الإفطار - ${business.name}`, p: '1850 ج.م', priceEgp: 1850, imageUrl: pool[0], compressedKb: 22 },
      { n: 'جناح عائلي مطل مباشر VIP', p: '2900 ج.م', priceEgp: 2900, imageUrl: pool[1 % pool.length], compressedKb: 24 },
      { n: 'باقة إقامة يوم كامل (Day Use)', p: '950 ج.م', priceEgp: 950, imageUrl: pool[2 % pool.length], compressedKb: 20 },
    ];
  }
  if (cat.includes('تاكسي') || cat.includes('ليموزين') || cat.includes('موتوسيكل') || cat.includes('أتوبيسات') || cat.includes('شحن')) {
    return [
      { n: `مشوار داخل المدينة - ${business.name}`, p: '65 ج.م', priceEgp: 65, imageUrl: pool[0], compressedKb: 17 },
      { n: 'توصيلة مطار / سفر بين المحافظات', p: '450 ج.م', priceEgp: 450, imageUrl: pool[1 % pool.length], compressedKb: 21 },
      { n: 'توصيل طلب خاص سريع لباب المنزل', p: '35 ج.م', priceEgp: 35, imageUrl: pool[2 % pool.length], compressedKb: 15 },
    ];
  }
  if (cat.includes('محامين') || cat.includes('محاسبين')) {
    return [
      { n: `استشارة متخصصة ومراجعة مستندات - ${business.name}`, p: '300 ج.م', priceEgp: 300, imageUrl: pool[0], compressedKb: 16 },
      { n: 'تأسيس شركة / صياغة عقود رسمية', p: '1500 ج.م', priceEgp: 1500, imageUrl: pool[1 % pool.length], compressedKb: 19 },
      { n: 'متابعة ملف شهري كامل للنشاط', p: '900 ج.م', priceEgp: 900, imageUrl: pool[2 % pool.length], compressedKb: 18 },
    ];
  }
  if (cat.includes('صيانة') || cat.includes('سباكة') || cat.includes('حرفيين') || cat.includes('سيارات')) {
    return [
      { n: `معاينة وفحص فني شامل - ${business.name}`, p: '150 ج.م', priceEgp: 150, imageUrl: pool[0], compressedKb: 18 },
      { n: 'صيانة دورية وإصلاح فوري بالضمان', p: '350 ج.م', priceEgp: 350, imageUrl: pool[1 % pool.length], compressedKb: 20 },
      { n: 'خدمة طوارئ منزلية سريعة', p: '250 ج.م', priceEgp: 250, imageUrl: pool[2 % pool.length], compressedKb: 17 },
    ];
  }
  if (cat.includes('كوافير') || cat.includes('تجميل')) {
    return [
      { n: `جلسة عناية وتصفيف كاملة - ${business.name}`, p: '250 ج.م', priceEgp: 250, imageUrl: pool[0], compressedKb: 19 },
      { n: 'باقة العروسة والمناسبات الخاصة VIP', p: '1200 ج.م', priceEgp: 1200, imageUrl: pool[1 % pool.length], compressedKb: 22 },
      { n: 'جلسة تنظيف بشرة وعناية متكاملة', p: '350 ج.م', priceEgp: 350, imageUrl: pool[2 % pool.length], compressedKb: 18 },
    ];
  }
  return [
    { n: `العرض الأساسي المميز - ${business.name}`, p: '120 ج.م', priceEgp: 120, imageUrl: pool[0], compressedKb: 18 },
    { n: `باقة التوفير الخاصة (${business.cat})`, p: '220 ج.م', priceEgp: 220, imageUrl: pool[1 % pool.length], compressedKb: 19 },
    { n: `طلب خاص VIP من ${business.name}`, p: '320 ج.م', priceEgp: 320, imageUrl: pool[2 % pool.length], compressedKb: 21 },
  ];
};

export const BusinessPriceListModal: React.FC<BusinessPriceListModalProps> = ({
  business,
  onClose,
  onOpenDeliveryOrder,
  currentCurrency,
  onUpdateServices,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [displayMode, setDisplayMode] = useState<'compressed_grid' | 'list'>('compressed_grid');
  const [previewPhotoItem, setPreviewPhotoItem] = useState<ServiceItem | null>(null);

  // Add / Edit Service Item State specific to this business (up to 100 items with compressed photos)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemCompressedKb, setNewItemCompressedKb] = useState<number>(18);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [editItemImage, setEditItemImage] = useState('');

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const bulkPhotosInputRef = useRef<HTMLInputElement>(null);

  const pool = getActivityImagePool(business.cat || '');

  const [servicesList, setServicesList] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(`dalilk_services_${business.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    if (business.services && business.services.length > 0) {
      return business.services.map((s, idx) => ({
        ...s,
        imageUrl: s.imageUrl || business.images?.[idx % (business.images?.length || 1)] || pool[idx % pool.length],
        compressedKb: s.compressedKb || 18,
      }));
    }
    return getDefaultServicesForActivity(business);
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`dalilk_services_${business.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setServicesList(parsed);
          return;
        }
      }
    } catch {}
    if (business.services && business.services.length > 0) {
      setServicesList(
        business.services.map((s, idx) => ({
          ...s,
          imageUrl: s.imageUrl || business.images?.[idx % (business.images?.length || 1)] || pool[idx % pool.length],
          compressedKb: s.compressedKb || 18,
        }))
      );
    } else {
      setServicesList(getDefaultServicesForActivity(business));
    }
  }, [business]);

  const persistUpdatedServices = (updated: ServiceItem[]) => {
    const capped = updated.slice(0, MAX_PRICE_LIST_ITEMS);
    setServicesList(capped);
    if (onUpdateServices) onUpdateServices(capped);
    try {
      localStorage.setItem(`dalilk_services_${business.id}`, JSON.stringify(capped));
    } catch (e) {
      console.warn(e);
    }
  };

  // Compress uploaded photo automatically for price list item
  const handleCompressItemPhoto = async (file: File, target: 'new' | 'edit') => {
    setIsCompressingPhoto(true);
    try {
      const compressed = await compressImageFile(file, 420, 420, 0.72);
      const kb = Math.max(8, Math.round((compressed.compressedSizeMb || 0.018) * 1024));
      if (target === 'new') {
        setNewItemImage(compressed.url);
        setNewItemCompressedKb(kb);
      } else {
        setEditItemImage(compressed.url);
      }
    } catch {
      const fallbackUrl = URL.createObjectURL(file);
      if (target === 'new') setNewItemImage(fallbackUrl);
      else setEditItemImage(fallbackUrl);
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // Bulk upload multiple photos to create compressed items up to 100
  const handleBulkUploadPhotosAsItems = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remainingSlots = MAX_PRICE_LIST_ITEMS - servicesList.length;
    if (remainingSlots <= 0) return;

    setIsCompressingPhoto(true);
    try {
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const newItems: ServiceItem[] = [];
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        try {
          const comp = await compressImageFile(file, 420, 420, 0.72);
          const kb = Math.max(8, Math.round((comp.compressedSizeMb || 0.018) * 1024));
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          newItems.push({
            n: cleanName || `صنف رقم ${servicesList.length + i + 1} - ${business.name}`,
            p: '100 ج.م',
            priceEgp: 100,
            imageUrl: comp.url,
            compressedKb: kb,
          });
        } catch {
          newItems.push({
            n: `صنف رقم ${servicesList.length + i + 1}`,
            p: '100 ج.م',
            priceEgp: 100,
            imageUrl: URL.createObjectURL(file),
            compressedKb: 18,
          });
        }
      }
      persistUpdatedServices([...servicesList, ...newItems]);
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // Generate compressed items with photos up to target count (e.g. 25, 50, or 100 items)
  const handlePopulateUpToCount = (targetCount: number) => {
    const cappedTarget = Math.min(MAX_PRICE_LIST_ITEMS, targetCount);
    if (servicesList.length >= cappedTarget) return;

    const needed = cappedTarget - servicesList.length;
    const generated: ServiceItem[] = [];
    for (let i = 0; i < needed; i++) {
      const num = servicesList.length + i + 1;
      const priceVal = 50 + ((num * 15) % 450);
      const img =
        business.images?.[num % (business.images?.length || 1)] ||
        pool[num % pool.length];
      generated.push({
        n: `صنف مضغوط #${num} - ${business.cat} (${business.name})`,
        p: `${priceVal} ج.م`,
        priceEgp: priceVal,
        imageUrl: img,
        compressedKb: 14 + (num % 9),
      });
    }
    persistUpdatedServices([...servicesList, ...generated]);
  };

  const filteredServices = servicesList.filter((s) => 
    s.n.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.p.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateQty = (itemName: string, delta: number) => {
    setCart((prev) => {
      const current = prev[itemName] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[itemName];
        return copy;
      }
      return { ...prev, [itemName]: next };
    });
  };

  const cartTotalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  const calculateTotalPriceEgp = () => {
    let total = 0;
    Object.entries(cart).forEach(([name, qty]) => {
      const item = servicesList.find((s) => s.n === name);
      if (item) {
        const numeric = item.priceEgp || parseInt(item.p.replace(/[^0-9]/g, '')) || 0;
        total += numeric * qty;
      }
    });
    return total;
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice.trim()) return;
    if (servicesList.length >= MAX_PRICE_LIST_ITEMS) return;

    const priceNum = parseInt(newItemPrice.replace(/[^0-9]/g, '')) || 0;
    const formattedPrice = newItemPrice.includes('ج.م') || newItemPrice.includes('EGP')
      ? newItemPrice.trim()
      : `${newItemPrice.trim()} ج.م`;

    const chosenImg =
      newItemImage.trim() ||
      business.images?.[servicesList.length % (business.images?.length || 1)] ||
      pool[servicesList.length % pool.length];

    const updated: ServiceItem[] = [
      ...servicesList,
      {
        n: newItemName.trim(),
        p: formattedPrice,
        priceEgp: priceNum,
        imageUrl: chosenImg,
        compressedKb: newItemCompressedKb || 18,
      },
    ];
    persistUpdatedServices(updated);

    setNewItemName('');
    setNewItemPrice('');
    setNewItemImage('');
    setShowAddForm(false);
  };

  const handleStartEditItem = (idx: number, item: ServiceItem) => {
    setEditingIndex(idx);
    setEditItemName(item.n);
    setEditItemPrice(String(item.priceEgp || item.p.replace(/[^0-9]/g, '') || item.p));
    setEditItemImage(item.imageUrl || pool[idx % pool.length]);
  };

  const handleSaveEditItem = (idx: number) => {
    if (!editItemName.trim() || !editItemPrice.trim()) return;
    const priceNum = parseInt(editItemPrice.replace(/[^0-9]/g, '')) || 0;
    const formattedPrice = editItemPrice.includes('ج.م') || editItemPrice.includes('EGP')
      ? editItemPrice.trim()
      : `${editItemPrice.trim()} ج.م`;

    const updated = servicesList.map((item, i) =>
      i === idx
        ? {
            ...item,
            n: editItemName.trim(),
            p: formattedPrice,
            priceEgp: priceNum,
            imageUrl: editItemImage.trim() || item.imageUrl || pool[idx % pool.length],
            compressedKb: item.compressedKb || 18,
          }
        : item
    );
    persistUpdatedServices(updated);
    setEditingIndex(null);
  };

  const handleDeleteItem = (idx: number) => {
    const updated = servicesList.filter((_, i) => i !== idx);
    persistUpdatedServices(updated);
  };

  const handleSendWhatsAppOrder = () => {
    if (cartTotalItems === 0) return;
    const cleanPhone = (business.phone || '').replace(/[^0-9]/g, '');
    const phoneToUse = cleanPhone.startsWith('01') ? `2${cleanPhone}` : cleanPhone || '201006656669';

    let orderDetails = `مرحباً (${business.name}) 🌟،\nأود طلب الأصناف التالية من قائمة أسعار نشاطكم على إعلانك:\n\n`;
    Object.entries(cart).forEach(([name, qty]) => {
      const item = servicesList.find((s) => s.n === name);
      orderDetails += `• ${name} (عدد: ${qty}) - بسعر: ${item?.p || ''}\n`;
    });
    orderDetails += `\n💰 الإجمالي التقريبي: ${calculateTotalPriceEgp()} ج.م\n📍 العنوان للتوصيل:\n⏰ يرجى التأكيد وميعاد التوصيل.`;

    const url = `https://wa.me/${phoneToUse}?text=${encodeURIComponent(orderDetails)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleProceedToDelivery = () => {
    const selectedItems = Object.entries(cart).map(([name, qty]) => {
      const item = servicesList.find((s) => s.n === name);
      return {
        name,
        qty,
        price: item?.p || `${item?.priceEgp || 0} ج.م`,
      };
    });
    if (onOpenDeliveryOrder) {
      onOpenDeliveryOrder(business, selectedItems);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[160] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="bg-[#12131d] border border-amber-400/30 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-neutral-900 via-amber-950/60 to-neutral-900 p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-black text-lg shadow-md shadow-amber-400/20 shrink-0">
              📋
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-black text-xs sm:text-base text-white truncate">
                  قائمة الأسعار المضغوطة بالصور: {business.name}
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                  {servicesList.length} / {MAX_PRICE_LIST_ITEMS} صنف مضغوط بالصور 📸
                </span>
              </div>
              <p className="text-[10px] text-white/60">
                سعة حتى 100 صنف مضغوط بالصور • ضغط تلقائي سريع للصور • العملة ({currentCurrency})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center transition cursor-pointer shrink-0"
            title="غلق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden file inputs for single & bulk compressed photo upload */}
        <input
          ref={addFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleCompressItemPhoto(f, 'new');
          }}
        />
        <input
          ref={editFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleCompressItemPhoto(f, 'edit');
          }}
        />
        <input
          ref={bulkPhotosInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleBulkUploadPhotosAsItems(e.target.files)}
        />

        {/* Search, View Mode & 100-Item Compressed Controls Bar */}
        <div className="p-2.5 bg-black/50 border-b border-white/10 space-y-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="w-3.5 h-3.5 text-amber-400 absolute start-3 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`ابحث في الـ ${servicesList.length} صنف بالصور...`}
                className="w-full bg-white/5 border border-white/15 rounded-xl ps-8 pe-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Toggle Compressed Grid vs List */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setDisplayMode('compressed_grid')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition ${
                  displayMode === 'compressed_grid'
                    ? 'bg-amber-400 text-black'
                    : 'text-white/60 hover:text-white'
                }`}
                title="عرض شبكي مضغوط بالصور (حتى 100 صنف)"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>مضغوط بالصور</span>
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('list')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition ${
                  displayMode === 'list'
                    ? 'bg-amber-400 text-black'
                    : 'text-white/60 hover:text-white'
                }`}
                title="عرض قائمة تفصيلية بالصور"
              >
                <List className="w-3 h-3" />
                <span>قائمة</span>
              </button>
            </div>

            <button
              type="button"
              disabled={servicesList.length >= MAX_PRICE_LIST_ITEMS}
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black font-black text-[11px] px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>إضافة صنف بصورة</span>
            </button>
          </div>

          {/* Quick Bulk Actions for 100 Compressed Items */}
          <div className="flex items-center justify-between flex-wrap gap-1.5 text-[10px] bg-white/[0.03] border border-white/10 rounded-xl px-2.5 py-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-amber-300 font-black flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>إدارة الـ 100 صنف بالصور:</span>
              </span>

              <button
                type="button"
                onClick={() => bulkPhotosInputRef.current?.click()}
                className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-400/40 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Camera className="w-3 h-3" />
                <span>رفع مجموعة صور أصناف دفعة واحدة 📸</span>
              </button>

              {servicesList.length < 25 && (
                <button
                  type="button"
                  onClick={() => handlePopulateUpToCount(25)}
                  className="bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-black border border-sky-400/30 px-2 py-0.5 rounded-lg font-bold transition cursor-pointer"
                >
                  + تعبئة 25 صنف بالصور
                </button>
              )}

              {servicesList.length < 100 && (
                <button
                  type="button"
                  onClick={() => handlePopulateUpToCount(100)}
                  className="bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-400/40 px-2 py-0.5 rounded-lg font-black flex items-center gap-1 transition cursor-pointer"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>تعبئة حتى 100 صنف مضغوط بالصور ⚡</span>
                </button>
              )}
            </div>

            {servicesList.length > 3 && (
              <button
                type="button"
                onClick={() => persistUpdatedServices(getDefaultServicesForActivity(business))}
                className="text-red-300 hover:text-red-400 underline font-bold cursor-pointer"
              >
                إعادة ضبط القائمة (3 أصناف)
              </button>
            )}
          </div>
        </div>

        {/* Add Form (Expandable with Compressed Photo Upload) */}
        {showAddForm && (
          <form onSubmit={handleAddNewItem} className="bg-neutral-950 p-3.5 border-b border-amber-400/30 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                <Plus className="w-3 h-3" />
                <span>إضافة صنف جديد بالصورة المضغوطة ({servicesList.length + 1} / {MAX_PRICE_LIST_ITEMS}):</span>
              </div>
              {isCompressingPhoto && (
                <span className="text-[10px] text-emerald-400 animate-pulse font-black">
                  ⚡ جاري ضغط الصورة تلقائياً...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="اسم الصنف / الخدمة / المنتج *"
                className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white placeholder:text-white/40"
              />
              <input
                type="text"
                required
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="السعر (مثال: 150 ج.م) *"
                className="bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono placeholder:text-white/40"
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => addFileInputRef.current?.click()}
                  className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 rounded-xl px-2.5 py-2 text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{newItemImage ? 'تغيير الصورة ✓' : 'رفع صورة مضغوطة 📸'}</span>
                </button>
                {newItemImage && (
                  <img
                    src={newItemImage}
                    alt="preview"
                    className="w-9 h-9 rounded-lg object-cover border border-amber-400 shrink-0"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-white/60 hover:text-white cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs px-4 py-1.5 rounded-xl shadow cursor-pointer"
              >
                حفظ الصنف بالصورة ✓
              </button>
            </div>
          </form>
        )}

        {/* Price List Items (Compressed Grid or Detailed List) */}
        <div className="flex-1 overflow-y-auto p-3 text-xs">
          {filteredServices.length === 0 ? (
            <div className="py-10 text-center text-white/50 space-y-2">
              <Tag className="w-8 h-8 mx-auto text-white/20" />
              <p>لا توجد أصناف مطابقة للبحث في قائمة أسعار هذا النشاط</p>
            </div>
          ) : displayMode === 'compressed_grid' ? (
            /* COMPRESSED GRID VIEW (supports up to 100 items with photos smoothly) */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredServices.map((item, idx) => {
                const qty = cart[item.n] || 0;
                const itemImg = item.imageUrl || pool[idx % pool.length];
                const isEditingThis = editingIndex === idx;

                if (isEditingThis) {
                  return (
                    <div key={idx} className="col-span-2 bg-black/80 border border-amber-400 rounded-2xl p-2.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={editItemImage || itemImg}
                          alt={item.n}
                          className="w-12 h-12 rounded-xl object-cover border border-amber-400/50 cursor-pointer"
                          onClick={() => editFileInputRef.current?.click()}
                        />
                        <div className="flex-1 space-y-1">
                          <input
                            type="text"
                            value={editItemName}
                            onChange={(e) => setEditItemName(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-[11px] text-white"
                            placeholder="اسم الصنف"
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={editItemPrice}
                              onChange={(e) => setEditItemPrice(e.target.value)}
                              className="w-24 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-[11px] text-amber-300 font-mono"
                              placeholder="السعر"
                            />
                            <button
                              type="button"
                              onClick={() => editFileInputRef.current?.click()}
                              className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <Camera className="w-3 h-3 text-amber-300" />
                              <span>صورة</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleSaveEditItem(idx)}
                          className="bg-emerald-500 text-black font-black px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          <span>حفظ</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingIndex(null)}
                          className="bg-white/10 text-white px-2 py-1 rounded-lg text-[10px] cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="bg-black/50 hover:bg-white/[0.06] border border-white/10 hover:border-amber-400/40 rounded-2xl overflow-hidden flex flex-col justify-between transition group"
                  >
                    {/* Compressed Item Thumbnail Photo */}
                    <div
                      onClick={() => setPreviewPhotoItem({ ...item, imageUrl: itemImg })}
                      className="relative h-24 w-full bg-neutral-900 overflow-hidden cursor-pointer"
                      title="اضغط لفتح وتكبير صورة الصنف"
                    >
                      <img
                        src={itemImg}
                        alt={item.n}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                      <span className="absolute top-1.5 right-1.5 bg-black/75 text-amber-300 text-[8.5px] font-mono font-black px-1.5 py-0.5 rounded-md border border-amber-400/30">
                        #{idx + 1}
                      </span>
                      <span className="absolute top-1.5 left-1.5 bg-emerald-500/80 text-black text-[8px] font-black px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5" />
                        <span>{item.compressedKb || 18}KB</span>
                      </span>
                      <span className="absolute bottom-1 right-1.5 font-mono font-black text-[11px] text-emerald-300 bg-black/80 px-1.5 py-0.2 rounded">
                        {item.p}
                      </span>
                    </div>

                    {/* Item Title & Compact Actions */}
                    <div className="p-2 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div className="font-bold text-white text-[10.5px] leading-snug line-clamp-2" title={item.n}>
                        {item.n}
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEditItem(idx, item)}
                            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-amber-400/20 text-white/60 hover:text-amber-300 flex items-center justify-center transition cursor-pointer"
                            title="تعديل الصنف والصورة"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            className="w-6 h-6 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 flex items-center justify-center transition cursor-pointer"
                            title="حذف الصنف"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {qty > 0 ? (
                          <div className="flex items-center bg-black/80 border border-amber-400/50 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.n, -1)}
                              className="w-5 h-5 rounded bg-white/10 text-white flex items-center justify-center font-bold text-[10px] cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-bold font-mono text-amber-300 text-[10px]">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.n, 1)}
                              className="w-5 h-5 rounded bg-amber-400 text-black flex items-center justify-center font-black text-[10px] cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.n, 1)}
                            className="bg-amber-400 hover:bg-amber-300 text-black px-2 py-1 rounded-lg font-black text-[9.5px] flex items-center gap-0.5 transition cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5 stroke-[3]" />
                            <span>طلب</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* DETAILED LIST VIEW WITH PHOTOS */
            <div className="space-y-2 divide-y divide-white/5">
              {filteredServices.map((item, idx) => {
                const qty = cart[item.n] || 0;
                const numericEgp = item.priceEgp || parseInt(item.p.replace(/[^0-9]/g, '')) || 0;
                const isEditingThis = editingIndex === idx;
                const itemImg = item.imageUrl || pool[idx % pool.length];

                return (
                  <div 
                    key={idx}
                    className="pt-2 pb-1 flex flex-col gap-2 group hover:bg-white/5 p-2 rounded-xl transition"
                  >
                    {isEditingThis ? (
                      <div className="flex flex-col sm:flex-row items-center gap-2 bg-black/60 p-2 rounded-xl border border-amber-400/40">
                        <input
                          type="text"
                          value={editItemName}
                          onChange={(e) => setEditItemName(e.target.value)}
                          className="flex-1 w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          placeholder="اسم الصنف أو الخدمة"
                        />
                        <input
                          type="text"
                          value={editItemPrice}
                          onChange={(e) => setEditItemPrice(e.target.value)}
                          className="w-full sm:w-28 bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono"
                          placeholder="السعر"
                        />
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          className="bg-white/10 hover:bg-white/20 text-amber-300 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Camera className="w-3 h-3" />
                          <span>تغيير الصورة</span>
                        </button>
                        <div className="flex items-center gap-1 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleSaveEditItem(idx)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Save className="w-3 h-3" />
                            <span>حفظ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            className="bg-white/10 hover:bg-white/20 text-white px-2 py-1.5 rounded-lg text-[11px] cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2.5">
                        <div
                          onClick={() => setPreviewPhotoItem({ ...item, imageUrl: itemImg })}
                          className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-900 border border-white/15 shrink-0 cursor-pointer relative group/img"
                          title="اضغط لفتح الصورة"
                        >
                          <img src={itemImg} alt={item.n} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[7px] text-center text-amber-300 font-mono">
                            #{idx + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white text-xs group-hover:text-amber-300 transition truncate">
                            {item.n}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-emerald-400 font-bold text-xs">
                              {item.p}
                            </span>
                            {currentCurrency !== 'EGP' && numericEgp > 0 && (
                              <span className="text-[10px] text-white/40 font-mono">
                                (~ {formatServicePrice(String(numericEgp), currentCurrency)})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Edit, Delete & Quantity Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditItem(idx, item)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-amber-400/20 text-white/60 hover:text-amber-300 border border-white/10 flex items-center justify-center transition cursor-pointer"
                            title="تعديل سعر أو اسم أو صورة هذا الصنف"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 border border-white/10 flex items-center justify-center transition cursor-pointer"
                            title="حذف هذا الصنف من القائمة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {qty > 0 ? (
                            <div className="flex items-center bg-black/60 border border-amber-400/40 rounded-xl p-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.n, -1)}
                                className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-6 text-center font-bold font-mono text-amber-300 text-xs">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.n, 1)}
                                className="w-6 h-6 rounded-lg bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center font-black text-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.n, 1)}
                              className="bg-white/10 hover:bg-amber-400 hover:text-black text-white px-2.5 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" />
                              <span>طلب</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Order Summary & Action Buttons */}
        <div className="p-3 bg-neutral-950 border-t border-white/10 space-y-2">
          {cartTotalItems > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="text-white/60 text-[10px] block">إجمالي الأصناف المحددة:</span>
                <span className="font-black text-white">
                  {cartTotalItems} صنف • الإجمالي: <b className="text-amber-300 font-mono">{calculateTotalPriceEgp()} ج.م</b>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCart({})}
                className="text-[10px] text-white/40 hover:text-red-400 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>تفريغ</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleSendWhatsAppOrder}
              disabled={cartTotalItems === 0}
              className={`py-2.5 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition ${
                cartTotalItems > 0
                  ? 'bg-[#25D366] hover:bg-[#20ba59] text-black shadow cursor-pointer'
                  : 'bg-white/5 text-white/30 cursor-not-allowed'
              }`}
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>إرسال واتساب للمحل</span>
            </button>

            <button
              type="button"
              onClick={handleProceedToDelivery}
              className="bg-gradient-to-r from-amber-400 to-[#FFD700] hover:brightness-110 active:scale-95 text-black py-2.5 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/20 transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>طلب دليفري وتوصيل 🛵</span>
            </button>
          </div>
        </div>

        {/* Full-Size Photo Lightbox when clicking an item's image */}
        {previewPhotoItem && (
          <div
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewPhotoItem(null)}
          >
            <div
              className="bg-neutral-950 border border-amber-400/50 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-3 p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 truncate">{previewPhotoItem.n}</span>
                <button
                  type="button"
                  onClick={() => setPreviewPhotoItem(null)}
                  className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full h-64 rounded-2xl overflow-hidden bg-black">
                <img
                  src={previewPhotoItem.imageUrl}
                  alt={previewPhotoItem.n}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="font-mono font-black text-sm text-emerald-400">{previewPhotoItem.p}</span>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateQty(previewPhotoItem.n, 1);
                    setPreviewPhotoItem(null);
                  }}
                  className="bg-amber-400 text-black font-black text-xs px-4 py-1.5 rounded-xl cursor-pointer"
                >
                  + إضافة للطلب
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
