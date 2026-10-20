import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShoppingBag, Phone, MessageCircle, MapPin, Clock, 
  Sparkles, CheckCircle2, ChevronRight, AlertCircle, Plus, Minus,
  Navigation, Bike, RefreshCw, Send, Check, Copy, ExternalLink,
  ChefHat, Compass, ShieldCheck, UserCheck, Play, Pause, Layers,
  Package, PhoneCall, Trash2, Edit3, Save, Share2, Flame, Gift
} from 'lucide-react';
import { Business, SupportedLang } from '../types';
import { calculateDistanceKm } from '../utils/distance';
import { ProgramLogo } from './ProgramLogo';

export type DeliveryOrderStatus = 'preparing' | 'on_the_way' | 'delivered';

export interface DeliveryOrderData {
  orderId: string;
  orderType?: 'menu' | 'custom_collection';
  status: DeliveryOrderStatus;
  customerName: string;
  customerPhone?: string;
  customerAddress: string;
  customNote: string;
  items: Array<{ name: string; price: string; quantity: number }>;
  courierType?: 'store_rider' | 'dedicated_courier';
  paymentMethod?: 'cash' | 'vodafone_cash' | 'instapay';
  riderName: string;
  riderPhone: string;
  riderVehicle: string;
  etaMinutes: number;
  createdAt: number;
  updatedAt: number;
  progressPercent: number; // 0 to 100
  programName?: string;
}

interface CustomItemRow {
  id: string;
  title: string;
  quantity: number;
  estimatedPrice: string;
  notes: string;
}

interface BusinessDirectDeliveryModalProps {
  business: Business;
  businesses?: Business[];
  onSelectBusiness?: (b: Business) => void;
  onClose: () => void;
  lang: SupportedLang;
  onUpdateBusiness?: (updated: Business) => void;
  userCoords?: { lat: number; lng: number } | null;
  initialTab?: 'order' | 'tracking' | 'phones';
}

export const BusinessDirectDeliveryModal: React.FC<BusinessDirectDeliveryModalProps> = ({
  business,
  businesses,
  onSelectBusiness,
  onClose,
  lang,
  onUpdateBusiness,
  userCoords,
  initialTab = 'order',
}) => {
  // Storage key for saving delivery phone numbers per business
  const phonesStorageKey = `e3lanak_biz_delivery_phones_${business.id}`;
  
  // Initial delivery phones from localStorage or business model
  const loadSavedPhones = (bizId: string | number) => {
    try {
      const raw = localStorage.getItem(`e3lanak_biz_delivery_phones_${String(bizId)}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  };

  const initialSavedPhones = loadSavedPhones(business.id);

  const [deliveryPhone, setDeliveryPhone] = useState<string>(
    initialSavedPhones?.primary || business.deliveryInfo?.phone || business.phone || '01006656669'
  );
  const [deliveryWhatsapp, setDeliveryWhatsapp] = useState<string>(
    initialSavedPhones?.whatsapp || business.deliveryInfo?.deliveryWhatsapp || business.phone || '01006656669'
  );
  const [deliveryHotline, setDeliveryHotline] = useState<string>(
    initialSavedPhones?.hotline || business.deliveryInfo?.deliveryHotline || business.phone || '01006656669'
  );
  const [captainPhones, setCaptainPhones] = useState<string[]>(() => {
    if (initialSavedPhones?.captains && Array.isArray(initialSavedPhones.captains)) {
      return initialSavedPhones.captains;
    }
    if (business.deliveryInfo?.deliveryPhones && Array.isArray(business.deliveryInfo.deliveryPhones)) {
      return business.deliveryInfo.deliveryPhones;
    }
    return [business.phone || '01006656669'];
  });

  // Re-sync when business changes via activity selector
  useEffect(() => {
    const saved = loadSavedPhones(business.id);
    setDeliveryPhone(saved?.primary || business.deliveryInfo?.phone || business.phone || '01006656669');
    setDeliveryWhatsapp(saved?.whatsapp || business.deliveryInfo?.deliveryWhatsapp || business.phone || '01006656669');
    setDeliveryHotline(saved?.hotline || business.deliveryInfo?.deliveryHotline || business.phone || '01006656669');
    if (saved?.captains && Array.isArray(saved.captains)) {
      setCaptainPhones(saved.captains);
    } else if (business.deliveryInfo?.deliveryPhones && Array.isArray(business.deliveryInfo.deliveryPhones)) {
      setCaptainPhones(business.deliveryInfo.deliveryPhones);
    } else {
      setCaptainPhones([business.phone || '01006656669']);
    }
  }, [business.id]);

  // Numbers editor state
  const [newCaptainInput, setNewCaptainInput] = useState('');
  const [isEditingNumbers, setIsEditingNumbers] = useState(false);
  const [saveNumbersSuccess, setSaveNumbersSuccess] = useState(false);

  // Delivery metadata
  const deliveryAreas = business.deliveryInfo?.areas || 'داخل نطاق المدينة والمناطق المجاورة';
  const deliveryFee = business.deliveryInfo?.fee || 'حسب العنوان والمسافة';
  const deliveryTime = business.deliveryInfo?.estimatedTime || '25 - 40 دقيقة';
  const deliveryNotes = business.deliveryInfo?.notes || 'خدمة التوصيل مفعلة ومباشرة من النشاط';

  // Distance calculation for "اطلب الأقرب ليك"
  const distanceKm = userCoords && business.lat && business.lng
    ? calculateDistanceKm(userCoords.lat, userCoords.lng, business.lat, business.lng)
    : (business.distanceKm || null);

  // Active tab: 'order' (create order) | 'tracking' (live map & status) | 'phones' (manage / view phones)
  const [activeTab, setActiveTab] = useState<'order' | 'tracking' | 'phones'>(initialTab);

  // Role toggle: 'customer' | 'owner'
  const [roleMode, setRoleMode] = useState<'customer' | 'owner'>('customer');

  // Order mode inside 'order' tab: 'menu' (أصناف المنيو) | 'custom_collect' (جمع طلبك دليفري خاص)
  const [orderMode, setOrderMode] = useState<'menu' | 'custom_collect'>('custom_collect');

  // Menu item quantities
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Custom Delivery Collection Items ("جمع طلبك دليفري خاص")
  const [customItems, setCustomItems] = useState<CustomItemRow[]>([
    { id: '1', title: 'طلب خاص / وجبة أو مشتريات محددة', quantity: 1, estimatedPrice: 'حسب الفاتورة', notes: 'يرجى التأكد من السعر قبل التوصيل' }
  ]);
  const [customCollectionNotes, setCustomCollectionNotes] = useState('');
  const [courierType, setCourierType] = useState<'store_rider' | 'dedicated_courier'>('store_rider');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'vodafone_cash' | 'instapay'>('cash');

  // Customer form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customNote, setCustomNote] = useState('');

  // Active tracking order state
  const orderStorageKey = `dalilk_delivery_order_${business.id}`;
  const [currentOrder, setCurrentOrder] = useState<DeliveryOrderData | null>(() => {
    try {
      const saved = localStorage.getItem(orderStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Rider live simulation state
  const [riderProgress, setRiderProgress] = useState<number>(() => {
    return currentOrder?.progressPercent || 35;
  });
  const [isSimulatingLive, setIsSimulatingLive] = useState<boolean>(true);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [copiedAllPhones, setCopiedAllPhones] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');

  // Auto-jump to tracking if order is active
  useEffect(() => {
    if (currentOrder && currentOrder.status !== 'delivered' && initialTab !== 'phones') {
      setActiveTab('tracking');
    }
  }, []);

  const saveOrder = (order: DeliveryOrderData | null) => {
    setCurrentOrder(order);
    try {
      if (order) {
        localStorage.setItem(orderStorageKey, JSON.stringify(order));
      } else {
        localStorage.removeItem(orderStorageKey);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Live simulation tick when order is "on_the_way"
  useEffect(() => {
    if (!currentOrder || currentOrder.status !== 'on_the_way' || !isSimulatingLive) return;

    const interval = setInterval(() => {
      setRiderProgress((prev) => {
        if (prev >= 98) {
          const updated: DeliveryOrderData = {
            ...currentOrder,
            status: 'delivered',
            progressPercent: 100,
            etaMinutes: 0,
            updatedAt: Date.now(),
          };
          saveOrder(updated);
          return 100;
        }
        return Math.min(98, prev + 1.2);
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [currentOrder?.status, isSimulatingLive]);

  // Handle menu item quantities
  const handleUpdateQty = (idx: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[idx] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      }
      return { ...prev, [idx]: next };
    });
  };

  // Add / remove item in "جمع طلبك دليفري خاص"
  const handleAddCustomItem = () => {
    const newItem: CustomItemRow = {
      id: `${Date.now()}-${Math.random()}`,
      title: '',
      quantity: 1,
      estimatedPrice: 'حسب الفاتورة',
      notes: ''
    };
    setCustomItems((prev) => [...prev, newItem]);
  };

  const handleRemoveCustomItem = (id: string) => {
    setCustomItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateCustomItem = (id: string, field: keyof CustomItemRow, value: any) => {
    setCustomItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Save updated delivery phone numbers (ادخال ارقام الدليفري في صفحة الدليفري الخاصة بالنشاط)
  const handleSaveDeliveryNumbers = () => {
    const payload = {
      primary: deliveryPhone.trim(),
      whatsapp: deliveryWhatsapp.trim(),
      hotline: deliveryHotline.trim(),
      captains: captainPhones.map((p) => p.trim()).filter(Boolean),
    };

    try {
      localStorage.setItem(phonesStorageKey, JSON.stringify(payload));
    } catch {}

    if (onUpdateBusiness) {
      const updatedBusiness: Business = {
        ...business,
        phone: payload.primary || business.phone,
        deliveryInfo: {
          available: true,
          phone: payload.primary,
          deliveryWhatsapp: payload.whatsapp,
          deliveryHotline: payload.hotline,
          deliveryPhones: payload.captains,
          areas: deliveryAreas,
          fee: deliveryFee,
          estimatedTime: deliveryTime,
          notes: deliveryNotes,
          programName: 'اطلب الأقرب ليك',
          customDeliveryActive: true,
        }
      };
      onUpdateBusiness(updatedBusiness);
    }

    setSaveNumbersSuccess(true);
    setTimeout(() => setSaveNumbersSuccess(false), 3000);
    setIsEditingNumbers(false);
  };

  // Add new captain phone to list
  const handleAddCaptainPhone = () => {
    if (!newCaptainInput.trim()) return;
    setCaptainPhones((prev) => [...prev, newCaptainInput.trim()]);
    setNewCaptainInput('');
  };

  const handleRemoveCaptainPhone = (idx: number) => {
    setCaptainPhones((prev) => prev.filter((_, i) => i !== idx));
  };

  // Copy all delivery numbers
  const handleCopyAllDeliveryNumbers = () => {
    const lines = [
      `🛵 أرقام دليفري نشاط: ${business.name}`,
      `برنامج: اطلب الأقرب ليك (جمع طلبك دليفري خاص)`,
      `📞 رقم الدليفري الأساسي: ${deliveryPhone}`,
      `💬 واتساب الدليفري: ${deliveryWhatsapp}`,
      deliveryHotline ? `☎️ الخط الساخن: ${deliveryHotline}` : null,
      captainPhones.length > 0 ? `🛵 كباتن التوصيل: ${captainPhones.join(' - ')}` : null,
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(lines);
    setCopiedAllPhones(true);
    setTimeout(() => setCopiedAllPhones(false), 2500);
  };

  // Submit and create order
  const handleCreateOrder = (isCustomCollection: boolean = false, sendWhatsApp: boolean = true) => {
    let selectedItems: Array<{ name: string; price: string; quantity: number }> = [];

    if (isCustomCollection) {
      selectedItems = customItems
        .filter((it) => it.title.trim() !== '')
        .map((it) => ({
          name: it.title.trim(),
          price: it.estimatedPrice.trim() || 'حسب الفاتورة',
          quantity: it.quantity,
        }));
      if (selectedItems.length === 0) {
        selectedItems.push({
          name: customCollectionNotes.trim() || 'طلب دليفري خاص ومشتريات مجمعة',
          price: 'حسب الفاتورة',
          quantity: 1,
        });
      }
    } else {
      selectedItems = Object.entries(quantities)
        .map(([idxStr, qty]) => {
          const item = business.services?.[parseInt(idxStr, 10)];
          return item ? { name: item.n, price: item.p, quantity: qty } : null;
        })
        .filter((i): i is { name: string; price: string; quantity: number } => i !== null);
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `DLV-${randomDigits}`;

    const newOrder: DeliveryOrderData = {
      orderId: newOrderId,
      orderType: isCustomCollection ? 'custom_collection' : 'menu',
      status: 'preparing',
      customerName: customerName.trim() || 'عميل إعلانك الكريم',
      customerPhone: customerPhone.trim() || '',
      customerAddress: customerAddress.trim() || business.addr || 'العنوان المسجل',
      customNote: (isCustomCollection ? `${customCollectionNotes} | ${customNote}` : customNote).trim(),
      items: selectedItems,
      courierType: isCustomCollection ? courierType : 'store_rider',
      paymentMethod: paymentMethod,
      riderName: 'كابتن محمود السيد (طيار الأقرب ليك)',
      riderPhone: captainPhones[0] || deliveryPhone,
      riderVehicle: courierType === 'store_rider' ? 'موتوسيكل المحل التابع للنشاط 🛵' : 'كابتن دليفري خارجي خاص ⚡',
      etaMinutes: 30,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      progressPercent: 20,
      programName: 'اطلب الأقرب ليك',
    };

    saveOrder(newOrder);
    setRiderProgress(20);
    setActiveTab('tracking');

    if (sendWhatsApp) {
      const distInfo = distanceKm ? `${distanceKm.toFixed(1)} كم` : 'أقرب مسافة';
      let message = `🛵 *برنامج: اطلب الأقرب ليك*\n`;
      message += isCustomCollection
        ? `📦 *طلب جديد: جمع طلبك دليفري خاص*\n`
        : `🛍️ *طلب دليفري جديد من منيو النشاط*\n`;
      message += `━━━━━━━━━━━━━━━━━\n`;
      message += `🔖 *رقم الطلب:* #${newOrderId}\n`;
      message += `🏪 *النشاط:* ${business.name}\n`;
      message += `📍 *المسافة من موقعك:* ${distInfo}\n`;
      if (customerName.trim()) message += `👤 *العميل:* ${customerName.trim()}\n`;
      if (customerPhone.trim()) message += `📱 *هاتف العميل:* ${customerPhone.trim()}\n`;
      if (customerAddress.trim()) message += `📍 *عنوان التوصيل:* ${customerAddress.trim()}\n`;
      message += `🛵 *نوع التوصيل:* ${courierType === 'store_rider' ? 'دليفري خاص بالنشاط (طيار المحل)' : 'طيار دليفري خارجي خاص'}\n`;
      message += `💵 *طريقة الدفع:* ${paymentMethod === 'cash' ? 'كاش عند الاستلام' : paymentMethod === 'vodafone_cash' ? 'فودافون كاش' : 'إنستاباي'}\n`;

      if (selectedItems.length > 0) {
        message += `\n📦 *الأصناف والطلبات المجمعة:*\n`;
        selectedItems.forEach((it, idx) => {
          message += `${idx + 1}. ${it.name} (${it.price}) × ${it.quantity}\n`;
        });
      }

      if (newOrder.customNote) {
        message += `\n📝 *ملاحظات خاصة بالتجهيز:* ${newOrder.customNote}\n`;
      }

      message += `\n🛰️ *رابط التتبع المباشر للخريطة والحالة:*\n${window.location.origin}/#track-${newOrderId}\n`;
      message += `━━━━━━━━━━━━━━━━━\n`;
      message += `✨ مرسل عبر برنامج "اطلب الأقرب ليك" • منصة إعلانك E3lanak`;

      const targetClean = (deliveryWhatsapp || deliveryPhone).replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${targetClean}?text=${encodeURIComponent(message)}`;
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    }
  };

  // Status updates by Owner
  const handleUpdateStatus = (newStatus: DeliveryOrderStatus) => {
    if (!currentOrder) return;
    let newProgress = currentOrder.progressPercent;
    let newEta = currentOrder.etaMinutes;

    if (newStatus === 'preparing') {
      newProgress = 25;
      newEta = 25;
    } else if (newStatus === 'on_the_way') {
      newProgress = 60;
      newEta = 12;
    } else if (newStatus === 'delivered') {
      newProgress = 100;
      newEta = 0;
    }

    const updated: DeliveryOrderData = {
      ...currentOrder,
      status: newStatus,
      progressPercent: newProgress,
      etaMinutes: newEta,
      updatedAt: Date.now(),
    };
    saveOrder(updated);
    setRiderProgress(newProgress);
  };

  const handleUpdateEta = (minutes: number) => {
    if (!currentOrder) return;
    const updated: DeliveryOrderData = {
      ...currentOrder,
      etaMinutes: minutes,
      updatedAt: Date.now(),
    };
    saveOrder(updated);
  };

  const handleCopyTrackingLink = () => {
    if (!currentOrder) return;
    const url = `${window.location.origin}/?order=${currentOrder.orderId}#track`;
    navigator.clipboard.writeText(url);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  const handleShareTrackingWhatsApp = () => {
    if (!currentOrder) return;
    const statusText = 
      currentOrder.status === 'preparing' ? '👨‍🍳 قيد التجهيز والتحضير' :
      currentOrder.status === 'on_the_way' ? '🛵 في الطريق مع المندوب' : '✅ تم التوصيل بنجاح';

    const msg = `📍 تتبع مباشر لطلب التوصيل من *${business.name}*\n` +
      `برنامج: *اطلب الأقرب ليك 🛵*\n` +
      `رقم الطلب: *#${currentOrder.orderId}*\n` +
      `الحالة الحالية: *${statusText}*\n` +
      `الوقت المتبقي: *${currentOrder.etaMinutes} دقيقة*\n\n` +
      `رابط الخريطة المباشر:\n${window.location.origin}/?order=${currentOrder.orderId}#track`;

    const targetPhone = (roleMode === 'owner' ? currentOrder.customerPhone : deliveryWhatsapp) || deliveryPhone;
    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const link = document.createElement('a');
    link.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  const handleDirectCall = (phoneToCall?: string) => {
    const num = phoneToCall || deliveryPhone;
    window.location.href = `tel:${num}`;
  };

  const handleClearOrder = () => {
    saveOrder(null);
    setQuantities({});
    setActiveTab('order');
  };

  // Bezier curve points for mock map tracking
  const riderT = riderProgress / 100;
  const p0 = { x: 20, y: 75 };
  const p1 = { x: 45, y: 15 };
  const p2 = { x: 82, y: 32 };
  const riderX = (1 - riderT) * (1 - riderT) * p0.x + 2 * (1 - riderT) * riderT * p1.x + riderT * riderT * p2.x;
  const riderY = (1 - riderT) * (1 - riderT) * p0.y + 2 * (1 - riderT) * riderT * p1.y + riderT * riderT * p2.y;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-neutral-950 border border-amber-500/30 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header - برنامج اطلب الأقرب ليك */}
        <div className="bg-gradient-to-r from-amber-950/80 via-neutral-900 to-orange-950/80 border-b border-amber-500/30 p-3 sm:p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ProgramLogo variant="compact" showSubtitle={false} />
            <div className="border-s border-white/15 ps-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentOrder ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    طلب #{currentOrder.orderId}
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-black">
                    جمع طلبك دليفري خاص ⚡
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-200 font-bold truncate max-w-[240px] sm:max-w-[300px]">
                {business.name} • {deliveryAreas}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Button to Enter/Edit Delivery Numbers */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('phones');
                setIsEditingNumbers(true);
              }}
              className="bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-black border border-sky-400/30 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black transition flex items-center gap-1 cursor-pointer"
              title="إدخال وتعديل أرقام الدليفري الخاصة بالنشاط"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">إدخال أرقام الدليفري 📞</span>
              <span className="xs:hidden">أرقام الدليفري</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Proximity Distance Banner for "اطلب الأقرب ليك" */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-teal-950/60 border-b border-emerald-500/20 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-emerald-200 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden truncate">
            <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-bold text-white truncate">
              {distanceKm ? (
                <>📍 المسافة التقريبية: <strong className="text-amber-300">{distanceKm.toFixed(1)} كم</strong> من موقعك الحالي (اطلب الأقرب ليك)</>
              ) : (
                <>📍 برنامج اطلب الأقرب ليك: توصيل مباشر وسريع من نفس منطقتك</>
              )}
            </span>
          </div>
          <span className="text-[10px] text-amber-300 font-black shrink-0 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/20">
            ⏱️ {deliveryTime}
          </span>
        </div>

        {/* Business Selector Carousel if businesses list provided */}
        {businesses && businesses.length > 1 && (
          <div className="bg-black/60 border-b border-white/10 px-3.5 py-1.5 flex items-center justify-between gap-2 text-[11px] shrink-0">
            <span className="text-[10px] text-amber-300 font-bold shrink-0 flex items-center gap-1">
              <span>🏪</span>
              <span>النشاط (الأقرب ليك):</span>
            </span>
            <select
              value={business.id}
              onChange={(e) => {
                const target = businesses.find((b) => b.id === e.target.value);
                if (target && onSelectBusiness) {
                  onSelectBusiness(target);
                }
              }}
              className="bg-neutral-900 border border-white/15 rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none focus:border-amber-400 flex-1 truncate max-w-xs"
            >
              {businesses
                .filter((b) => b.hasDelivery || b.deliveryInfo?.available || b.services?.length || b.cat === 'مطاعم وكافيهات' || b.cat === 'خدمات ومهن' || b.cat === 'سوبر ماركت')
                .map((b) => {
                  const dist = userCoords && b.lat && b.lng ? calculateDistanceKm(userCoords.lat, userCoords.lng, b.lat, b.lng) : b.distanceKm;
                  return (
                    <option key={b.id} value={b.id} className="bg-neutral-900 text-white">
                      {b.name} {dist ? `(${dist.toFixed(1)} كم - الأقرب ليك)` : ''}
                    </option>
                  );
                })}
            </select>
          </div>
        )}

        {/* 3 Main Tabs: (طلب دليفري / جمع طلبك خاص | تتبع الخريطة | أرقام الدليفري والطيارين) */}
        <div className="bg-neutral-900/90 px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 flex-1 overflow-x-auto hide-scroll">
            <button
              type="button"
              onClick={() => setActiveTab('order')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                activeTab === 'order'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-black'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>طلب دليفري</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!currentOrder) {
                  handleCreateOrder(orderMode === 'custom_collect', false);
                } else {
                  setActiveTab('tracking');
                }
              }}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer relative whitespace-nowrap ${
                activeTab === 'tracking'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md font-black'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>تتبع الطلب</span>
              {currentOrder && currentOrder.status !== 'delivered' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('phones')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                activeTab === 'phones'
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md font-black'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
              <span>أرقام الدليفري 📞</span>
            </button>
          </div>

          {/* Role Mode: Customer vs Owner / المشترك */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setRoleMode('customer')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                roleMode === 'customer'
                  ? 'bg-white/20 text-white shadow font-black'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <UserCheck className="w-3 h-3 text-sky-400" />
              <span className="hidden xs:inline">العميل</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleMode('owner')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                roleMode === 'owner'
                  ? 'bg-amber-500 text-black shadow font-black'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-amber-300" />
              <span className="hidden xs:inline">المشترك</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-4 space-y-4 overflow-y-auto flex-1 text-xs">

          {/* QUICK DIRECT CALL CARDS (Available at top of all tabs) */}
          <div className="bg-gradient-to-r from-black/80 via-neutral-900 to-black/80 border border-white/10 rounded-2xl p-2.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/60">تواصل فوري مع الدليفري:</span>
              <button
                type="button"
                onClick={() => handleDirectCall(deliveryPhone)}
                className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-400/30 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition"
                title="اتصال مباشر برقم الدليفري"
              >
                <Phone className="w-3 h-3" />
                <span className="font-mono">{deliveryPhone}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const clean = (deliveryWhatsapp || deliveryPhone).replace(/[^0-9]/g, '');
                  window.open(`https://wa.me/${clean}?text=${encodeURIComponent('مرحباً، أود طلب دليفري من برنامج اطلب الأقرب ليك')}`, '_blank');
                }}
                className="bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/40 px-2 py-1 rounded-full text-[10px] font-black flex items-center gap-1 transition"
                title="محادثة واتساب سريعة"
              >
                <MessageCircle className="w-3 h-3" />
                <span>واتساب 💬</span>
              </button>

              {deliveryHotline && (
                <button
                  type="button"
                  onClick={() => handleDirectCall(deliveryHotline)}
                  className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 px-2 py-1 rounded-full text-[10px] font-black flex items-center gap-1 transition"
                  title="الخط الساخن"
                >
                  <span>☎️ الخط الساخن: {deliveryHotline}</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: ORDER CREATION & جمع طلبك دليفري خاص */}
          {activeTab === 'order' && (
            <div className="space-y-3.5">
              
              {/* Order Mode Switch: "جمع طلبك دليفري خاص" VS "منيو المحل" */}
              <div className="bg-gradient-to-r from-orange-950/40 via-neutral-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-2.5 flex items-center justify-between gap-2">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>طريقة الطلب:</span>
                </span>

                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setOrderMode('custom_collect')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                      orderMode === 'custom_collect'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-md'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>جمع طلبك دليفري خاص 📦</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderMode('menu')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                      orderMode === 'menu'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>أصناف المنيو 📋</span>
                  </button>
                </div>
              </div>

              {/* MODE A: "جمع طلبك دليفري خاص" */}
              {orderMode === 'custom_collect' && (
                <div className="bg-gradient-to-b from-amber-950/30 to-neutral-900 border-2 border-amber-400/40 rounded-2xl p-3.5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-400 text-black flex items-center justify-center font-black">
                        📦
                      </div>
                      <div>
                        <h4 className="font-black text-white text-xs sm:text-sm">
                          جمع طلبك دليفري خاص (مشتريات وطلبات خاصة)
                        </h4>
                        <p className="text-[10px] text-amber-200">
                          اكتب كل ما تحتاجه وسيتولى أقرب طيار دليفري جمعه وتوصيله فوراً لبابك
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCustomItem}
                      className="bg-amber-400 hover:bg-amber-300 text-black px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>إضافة صنف</span>
                    </button>
                  </div>

                  {/* Quick Preset Buttons for "جمع طلبك دليفري خاص" */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 bg-black/40 p-2 rounded-xl border border-white/10">
                    <span className="text-[10px] text-amber-300 font-bold">إضافة صنف سريع:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomItems((prev) => [
                          ...prev,
                          { id: `${Date.now()}-food`, title: 'وجبة طعام / ساندوتشات جاهزة', quantity: 1, estimatedPrice: 'حسب المنيو', notes: 'طازجة وساخنة' }
                        ]);
                      }}
                      className="bg-white/10 hover:bg-amber-400 hover:text-black text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/15 transition cursor-pointer"
                    >
                      🍔 وجبة أو طعام
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomItems((prev) => [
                          ...prev,
                          { id: `${Date.now()}-groceries`, title: 'مشتريات سوبر ماركت وبقالة', quantity: 1, estimatedPrice: 'حسب الفاتورة', notes: 'إحضار إيصال الشراء' }
                        ]);
                      }}
                      className="bg-white/10 hover:bg-amber-400 hover:text-black text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/15 transition cursor-pointer"
                    >
                      🛒 سوبر ماركت
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomItems((prev) => [
                          ...prev,
                          { id: `${Date.now()}-pharmacy`, title: 'أدوية ومستلزمات صيدلية', quantity: 1, estimatedPrice: 'حسب الفاتورة', notes: 'إحضار إيصال الصيدلية' }
                        ]);
                      }}
                      className="bg-white/10 hover:bg-amber-400 hover:text-black text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/15 transition cursor-pointer"
                    >
                      💊 صيدلية وعلاج
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomItems((prev) => [
                          ...prev,
                          { id: `${Date.now()}-parcel`, title: 'طرد أو أمانة خاصة للتوصيل', quantity: 1, estimatedPrice: 'مشوار دليفري خاص', notes: 'تسليم يد ليد' }
                        ]);
                      }}
                      className="bg-white/10 hover:bg-amber-400 hover:text-black text-white text-[10px] font-bold px-2 py-0.5 rounded-lg border border-white/15 transition cursor-pointer"
                    >
                      📦 طرد خاص
                    </button>
                  </div>

                  {/* Custom Items List */}
                  <div className="space-y-2">
                    {customItems.map((item, index) => (
                      <div 
                        key={item.id}
                        className="bg-black/60 border border-white/10 rounded-xl p-2.5 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md shrink-0">
                            صنف #{index + 1}
                          </span>

                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateCustomItem(item.id, 'title', e.target.value)}
                            placeholder="اكتب اسم الصنف أو الوجبة أو المشتريات المطلوبة..."
                            className="flex-1 bg-neutral-900 border border-white/15 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                          />

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdateCustomItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                              className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-black text-xs text-amber-300">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCustomItem(item.id, 'quantity', item.quantity + 1)}
                              className="w-6 h-6 rounded bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>

                          {customItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomItem(item.id)}
                              className="p-1 text-rose-400 hover:text-rose-300 transition shrink-0"
                              title="حذف هذا الصنف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          <input
                            type="text"
                            value={item.estimatedPrice}
                            onChange={(e) => handleUpdateCustomItem(item.id, 'estimatedPrice', e.target.value)}
                            placeholder="السعر التقديري (مثال: 120 ج.م / حسب الفاتورة)"
                            className="bg-neutral-900 border border-white/10 rounded-lg px-2 py-1 text-white/80 focus:outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => handleUpdateCustomItem(item.id, 'notes', e.target.value)}
                            placeholder="ملاحظات الصنف (مثل: حار، حجم كبير، نوع محدد...)"
                            className="bg-neutral-900 border border-white/10 rounded-lg px-2 py-1 text-white/80 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Free-text overall custom notes */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-white/80 block">
                      تعليمات إضافية لجمع وتجهيز الطلب الخاص:
                    </label>
                    <textarea
                      rows={2}
                      value={customCollectionNotes}
                      onChange={(e) => setCustomCollectionNotes(e.target.value)}
                      placeholder="اكتب أي مشتريات إضافية من المنطقة، مواصفات التسليم، أو تعليمات للطيار..."
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Courier Selection: Store Rider VS Dedicated Pilot */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold text-white block">
                      اختر كابتن التوصيل:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCourierType('store_rider')}
                        className={`p-2.5 rounded-xl border text-start transition cursor-pointer flex items-center gap-2 ${
                          courierType === 'store_rider'
                            ? 'bg-amber-400/20 border-amber-400 text-white'
                            : 'bg-black/40 border-white/10 text-white/70 hover:border-white/30'
                        }`}
                      >
                        <Bike className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <div className="font-bold text-xs">دليفري خاص بالنشاط (طيار المحل)</div>
                          <div className="text-[10px] text-white/50">طيار المحل المعتمد للمتابعة المباشرة</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCourierType('dedicated_courier')}
                        className={`p-2.5 rounded-xl border text-start transition cursor-pointer flex items-center gap-2 ${
                          courierType === 'dedicated_courier'
                            ? 'bg-emerald-400/20 border-emerald-400 text-white'
                            : 'bg-black/40 border-white/10 text-white/70 hover:border-white/30'
                        }`}
                      >
                        <Navigation className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-bold text-xs">طيار دليفري خارجي خاص ⚡</div>
                          <div className="text-[10px] text-white/50">أقرب طيار متاح في منطقتك بسرعة فائقة</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE B: "أصناف المنيو والقائمة" */}
              {orderMode === 'menu' && (
                <div className="space-y-2 bg-neutral-900/60 border border-white/10 rounded-2xl p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <span>قائمة الأصناف والخدمات المتوفرة:</span>
                    </h4>
                    <span className="text-[10px] text-white/50">حدد الكميات المطلوبة</span>
                  </div>

                  {business.services && business.services.length > 0 ? (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {business.services.map((item, idx) => {
                        const qty = quantities[idx] || 0;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition"
                          >
                            <div className="flex-1 pr-1 truncate">
                              <div className="font-bold text-white text-[11px] truncate">{item.n}</div>
                              <div className="text-[10px] text-amber-300 font-bold">{item.p}</div>
                            </div>

                            <div className="flex items-center gap-2">
                              {qty > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(idx, -1)}
                                  className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                              )}
                              {qty > 0 && (
                                <span className="text-xs font-black text-amber-300 w-4 text-center">
                                  {qty}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(idx, 1)}
                                className="w-6 h-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-bold"
                              >
                                <Plus className="w-3 h-3 stroke-[3]" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-white/60 text-xs">
                      لا توجد قائمة أسعار مسبقة، يرجى استخدام تبويب <strong>"جمع طلبك دليفري خاص"</strong> أعلاه لكتابة الأصناف!
                    </div>
                  )}
                </div>
              )}

              {/* Customer Delivery Details Form */}
              <div className="space-y-2.5 bg-neutral-900/60 border border-white/10 rounded-2xl p-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>بيانات العميل وعنوان التوصيل:</span>
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="اسم العميل (مثال: أحمد عبد الله)"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="رقم الهاتف / الواتساب للتواصل"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 dir-ltr text-right"
                    />
                  </div>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="عنوان التوصيل بالتفصيل (الشارع، رقم العمارة، الطابق، الشقة)"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="ملاحظات عامة للسائق أو كابتن التوصيل..."
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Payment Method Selector */}
                <div className="pt-1">
                  <label className="text-[11px] font-bold text-white/80 block mb-1">
                    طريقة دفع الرحلة والتوصيل:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition text-center ${
                        paymentMethod === 'cash'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-black/40 border-white/10 text-white/60'
                      }`}
                    >
                      💵 كاش عند الاستلام
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('vodafone_cash')}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition text-center ${
                        paymentMethod === 'vodafone_cash'
                          ? 'bg-red-500/20 border-red-400 text-red-300'
                          : 'bg-black/40 border-white/10 text-white/60'
                      }`}
                    >
                      📱 فودافون كاش
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('instapay')}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition text-center ${
                        paymentMethod === 'instapay'
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                          : 'bg-black/40 border-white/10 text-white/60'
                      }`}
                    >
                      ⚡ إنستاباي
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Order Tab */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCreateOrder(orderMode === 'custom_collect', true)}
                  className="flex-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>
                    {orderMode === 'custom_collect'
                      ? 'تأكيد وإرسال جمع طلبك دليفري خاص 🚀'
                      : 'تأكيد طلب المنيو وتتبع مباشر 🚀'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE TRACKING & MAP */}
          {activeTab === 'tracking' && currentOrder && (
            <div className="space-y-3.5">
              {/* Order Status Timeline Cards (3 Stages) */}
              <div className="bg-neutral-900/90 border border-white/15 rounded-2xl p-3.5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-white bg-white/10 px-2 py-0.5 rounded-lg font-mono">
                      #{currentOrder.orderId}
                    </span>
                    <span className="text-[11px] text-white/70">
                      برنامج: اطلب الأقرب ليك
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{currentOrder.etaMinutes > 0 ? `${currentOrder.etaMinutes} دقيقة للوصول` : 'تم الوصول'}</span>
                    </span>
                  </div>
                </div>

                {/* Status Indicator Steps */}
                <div className="grid grid-cols-3 gap-2 text-center relative pt-1">
                  <div 
                    onClick={() => roleMode === 'owner' && handleUpdateStatus('preparing')}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col items-center gap-1 ${
                      currentOrder.status === 'preparing'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                        : currentOrder.status === 'on_the_way' || currentOrder.status === 'delivered'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-white/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentOrder.status === 'preparing' 
                        ? 'bg-amber-500 text-black animate-pulse font-black' 
                        : currentOrder.status === 'on_the_way' || currentOrder.status === 'delivered'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/10 text-white/40'
                    }`}>
                      <ChefHat className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-black">1. قيد التحضير</span>
                    <span className="text-[9px] opacity-70">في التجهيز</span>
                  </div>

                  <div 
                    onClick={() => roleMode === 'owner' && handleUpdateStatus('on_the_way')}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col items-center gap-1 ${
                      currentOrder.status === 'on_the_way'
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300 ring-2 ring-sky-400/30'
                        : currentOrder.status === 'delivered'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-white/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentOrder.status === 'on_the_way' 
                        ? 'bg-sky-500 text-black animate-bounce font-black' 
                        : currentOrder.status === 'delivered'
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/10 text-white/40'
                    }`}>
                      <Bike className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-black">2. في الطريق</span>
                    <span className="text-[9px] opacity-70">مع الطيار</span>
                  </div>

                  <div 
                    onClick={() => roleMode === 'owner' && handleUpdateStatus('delivered')}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col items-center gap-1 ${
                      currentOrder.status === 'delivered'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/30'
                        : 'bg-white/5 border-white/10 text-white/50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentOrder.status === 'delivered' 
                        ? 'bg-emerald-500 text-black font-black' 
                        : 'bg-white/10 text-white/40'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-black">3. تم التوصيل</span>
                    <span className="text-[9px] opacity-70">بالهناء والشفاء</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${riderProgress}%` }}
                  />
                </div>
              </div>

              {/* Simulated Map Canvas */}
              <div className="relative w-full h-64 bg-neutral-900 border border-white/15 rounded-2xl overflow-hidden shadow-inner">
                {/* Simulated Street Grid or Satellite */}
                <div 
                  className={`absolute inset-0 opacity-40 ${
                    mapStyle === 'satellite' ? 'bg-[#0f1d1a]' : 'bg-[#18181b]'
                  }`} 
                >
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                    {/* Simulated River / Roads */}
                    <path d="M -10 120 Q 150 40 350 180 T 700 90" fill="none" stroke="rgba(56,189,248,0.25)" strokeWidth="8" />
                    <path d="M 50 -20 Q 200 180 300 300" fill="none" stroke="rgba(251,191,36,0.2)" strokeWidth="6" />
                    {/* Active Route Path */}
                    <path 
                      d={`M ${p0.x * 6} ${p0.y * 2.5} Q ${p1.x * 6} ${p1.y * 2.5} ${p2.x * 6} ${p2.y * 2.5}`}
                      fill="none" 
                      stroke="#38BDF8" 
                      strokeWidth="4" 
                      strokeDasharray="6,4"
                      className="animate-pulse"
                    />
                  </svg>
                </div>

                {/* Map style toggle */}
                <div className="absolute top-2.5 end-2.5 z-10 flex gap-1 bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => setMapStyle('streets')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      mapStyle === 'streets' ? 'bg-white/20 text-white' : 'text-white/50'
                    }`}
                  >
                    شوارع
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapStyle('satellite')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      mapStyle === 'satellite' ? 'bg-white/20 text-white' : 'text-white/50'
                    }`}
                  >
                    قمر صناعي
                  </button>
                </div>

                {/* Point 1: Store Marker */}
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                  style={{ left: `${p0.x}%`, top: `${p0.y}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-amber-400/30">
                    🏪
                  </div>
                  <span className="text-[9px] bg-black/80 px-1.5 py-0.5 rounded text-amber-300 font-bold mt-1 whitespace-nowrap">
                    {business.name}
                  </span>
                </div>

                {/* Point 2: Animated Rider Marker */}
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300"
                  style={{ left: `${riderX}%`, top: `${riderY}%` }}
                >
                  <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-2xl ring-4 ring-sky-400/50 animate-bounce">
                    <Bike className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] bg-sky-950/90 border border-sky-400/40 text-sky-200 px-1.5 py-0.5 rounded-full font-bold mt-1 whitespace-nowrap shadow">
                    🛵 {currentOrder.riderName}
                  </span>
                </div>

                {/* Point 3: Customer Marker */}
                <div 
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
                  style={{ left: `${p2.x}%`, top: `${p2.y}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-emerald-500/30">
                    📍
                  </div>
                  <span className="text-[9px] bg-black/80 px-1.5 py-0.5 rounded text-emerald-300 font-bold mt-1 whitespace-nowrap">
                    {currentOrder.customerAddress || 'عنوانك'}
                  </span>
                </div>
              </div>

              {/* Order Info & Courier Card */}
              <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                      🛵
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{currentOrder.riderName}</div>
                      <div className="text-[10px] text-white/50">{currentOrder.riderVehicle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDirectCall(currentOrder.riderPhone || deliveryPhone)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                      <Phone className="w-3 h-3" />
                      <span>اتصال</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareTrackingWhatsApp}
                      className="bg-[#25D366] hover:bg-[#20bd5a] text-black px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    >
                      <MessageCircle className="w-3 h-3 fill-black" />
                      <span>واتساب</span>
                    </button>
                  </div>
                </div>

                {/* Items Summary in tracking */}
                <div className="space-y-1 text-[11px]">
                  <span className="text-white/60 font-bold">الأصناف المطلوبة:</span>
                  <div className="space-y-0.5 max-h-24 overflow-y-auto bg-black/40 p-2 rounded-xl border border-white/5">
                    {currentOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-white/90">
                        <span>• {it.name} × {it.quantity}</span>
                        <span className="text-amber-300">{it.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Owner controls when roleMode is owner */}
                {roleMode === 'owner' && (
                  <div className="p-2.5 bg-amber-950/40 border border-amber-400/40 rounded-xl space-y-2 pt-2">
                    <div className="text-xs font-black text-amber-300 flex items-center justify-between">
                      <span>لوحة تحكم المشترك / صاحب النشاط:</span>
                      <button
                        type="button"
                        onClick={handleClearOrder}
                        className="text-rose-400 hover:text-rose-300 text-[10px] underline"
                      >
                        إنهاء الطلب
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('preparing')}
                        className={`py-1.5 rounded-lg text-[10px] font-bold ${
                          currentOrder.status === 'preparing' ? 'bg-amber-400 text-black' : 'bg-white/10 text-white'
                        }`}
                      >
                        قيد التحضير
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('on_the_way')}
                        className={`py-1.5 rounded-lg text-[10px] font-bold ${
                          currentOrder.status === 'on_the_way' ? 'bg-sky-400 text-black' : 'bg-white/10 text-white'
                        }`}
                      >
                        في الطريق
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus('delivered')}
                        className={`py-1.5 rounded-lg text-[10px] font-bold ${
                          currentOrder.status === 'delivered' ? 'bg-emerald-400 text-black' : 'bg-white/10 text-white'
                        }`}
                      >
                        تم التوصيل
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Share & Copy tracking link */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleShareTrackingWhatsApp}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 active:scale-95 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>مشاركة رابط التتبع عبر الواتساب</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyTrackingLink}
                  className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-white/20"
                >
                  {copiedShareLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedShareLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: أرقام الدليفري والطيارين الخاصة بالنشاط (ادخال ارقام الدليفري وتعديلها) */}
          {activeTab === 'phones' && (
            <div className="space-y-3.5">
              
              {/* Header Info */}
              <div className="bg-gradient-to-r from-sky-950/50 via-neutral-900 to-blue-950/50 border border-sky-500/30 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-sky-400" />
                    <h4 className="font-black text-white text-xs sm:text-sm">
                      أرقام الدليفري والطيارين التابعين للنشاط
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingNumbers(!isEditingNumbers)}
                    className="bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-black border border-sky-400/30 px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingNumbers ? 'إلغاء التعديل' : 'إدخال وتعديل الأرقام'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  هنا تجد جميع أرقام هواتف الدليفري، الخط الساخن، ورقم الواتساب، وأرقام كباتن وطياري التوصيل التابعين لـ ({business.name}).
                </p>
              </div>

              {/* Success Notification */}
              {saveNumbersSuccess && (
                <div className="bg-emerald-950/80 border border-emerald-500/60 rounded-xl p-3 text-center text-xs font-black text-emerald-300 animate-in fade-in">
                  ✅ تم حفظ وتحديث أرقام الدليفري بنجاح في صفحة النشاط!
                </div>
              )}

              {/* EDITING FORM FOR OWNER / المشترك */}
              {isEditingNumbers ? (
                <div className="bg-black/60 border-2 border-sky-500/40 rounded-2xl p-3.5 space-y-3 shadow-2xl">
                  <div className="text-xs font-black text-sky-300 flex items-center gap-1.5 border-b border-white/10 pb-2">
                    <span>✏️ إدخال وتعديل أرقام الدليفري يدوياً:</span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-white/80 block mb-1">
                        📞 رقم الدليفري الأساسي (Primary Phone):
                      </label>
                      <input
                        type="tel"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        placeholder="01006656669"
                        className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 dir-ltr text-right font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-white/80 block mb-1">
                        💬 رقم واتساب الدليفري الفوري (WhatsApp):
                      </label>
                      <input
                        type="tel"
                        value={deliveryWhatsapp}
                        onChange={(e) => setDeliveryWhatsapp(e.target.value)}
                        placeholder="01006656669"
                        className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 dir-ltr text-right font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-white/80 block mb-1">
                        ☎️ الخط الساخن السريع للدليفري (Hotline):
                      </label>
                      <input
                        type="tel"
                        value={deliveryHotline}
                        onChange={(e) => setDeliveryHotline(e.target.value)}
                        placeholder="19xxx أو رقم مباشر"
                        className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 dir-ltr text-right font-mono"
                      />
                    </div>

                    {/* Captain Phones Dynamic Array */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-[11px] font-bold text-white/80 block">
                        🛵 أرقام طياري وكباتن الدليفري التابعين للنشاط:
                      </label>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="tel"
                          value={newCaptainInput}
                          onChange={(e) => setNewCaptainInput(e.target.value)}
                          placeholder="أدخل رقم كابتن أو طيار دليفري جديد..."
                          className="flex-1 bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400 dir-ltr text-right font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleAddCaptainPhone}
                          className="bg-sky-500 hover:bg-sky-400 text-black px-3 py-2 rounded-xl text-xs font-black shrink-0 transition"
                        >
                          + إضافة
                        </button>
                      </div>

                      <div className="space-y-1 max-h-36 overflow-y-auto pt-1">
                        {captainPhones.map((phoneNum, idx) => (
                          <div 
                            key={idx}
                            className="bg-neutral-900/90 border border-white/10 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs font-mono"
                          >
                            <span className="text-sky-300 font-bold">كابتن #{idx + 1}: {phoneNum}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCaptainPhone(idx)}
                              className="text-rose-400 hover:text-rose-300 p-1"
                              title="حذف الرقم"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveDeliveryNumbers}
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-95 text-black font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>💾 حفظ وتحديث أرقام الدليفري فوراً</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* READ-ONLY DISPLAY DIRECTORY FOR CUSTOMER */
                <div className="space-y-2.5">
                  {/* Primary Phone */}
                  <div className="bg-neutral-900/80 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-3 flex items-center justify-between transition">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">رقم الدليفري الأساسي</div>
                        <div className="text-[11px] font-mono text-emerald-300 font-bold">{deliveryPhone}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDirectCall(deliveryPhone)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1"
                      >
                        <span>اتصال 📞</span>
                      </button>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="bg-neutral-900/80 border border-white/10 hover:border-[#25D366]/40 rounded-2xl p-3 flex items-center justify-between transition">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 text-[#25D366] flex items-center justify-center font-bold">
                        <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">واتساب الدليفري الفوري</div>
                        <div className="text-[11px] font-mono text-[#25D366] font-bold">{deliveryWhatsapp}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const clean = deliveryWhatsapp.replace(/[^0-9]/g, '');
                          const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent('مرحباً، أود طلب دليفري من برنامج اطلب الأقرب ليك')}`;
                          const a = document.createElement('a');
                          a.href = waUrl;
                          a.target = '_blank';
                          a.rel = 'noopener noreferrer';
                          a.click();
                        }}
                        className="bg-[#25D366] hover:bg-[#20bd5a] text-black px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer"
                      >
                        <span>محادثة 💬</span>
                      </button>
                    </div>
                  </div>

                  {/* Hotline */}
                  {deliveryHotline && (
                    <div className="bg-neutral-900/80 border border-white/10 hover:border-red-500/40 rounded-2xl p-3 flex items-center justify-between transition">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                          <PhoneCall className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">الخط الساخن السريع</div>
                          <div className="text-[11px] font-mono text-red-300 font-bold">{deliveryHotline}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDirectCall(deliveryHotline)}
                          className="bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>اتصال ☎️</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Captains List */}
                  {captainPhones.length > 0 && (
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-3 space-y-2">
                      <div className="text-[11px] font-black text-amber-300 flex items-center gap-1.5">
                        <Bike className="w-4 h-4 text-amber-400" />
                        <span>أرقام طياري وكباتن التوصيل المباشرين:</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {captainPhones.map((phoneNum, idx) => (
                          <div
                            key={idx}
                            className="bg-neutral-900/90 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-1"
                          >
                            <div>
                              <div className="text-[10px] text-white/60">كابتن #{idx + 1}</div>
                              <div className="text-xs font-mono text-sky-300 font-bold">{phoneNum}</div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDirectCall(phoneNum)}
                                className="bg-white/10 hover:bg-emerald-500 hover:text-black text-white p-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-0.5 cursor-pointer"
                                title="اتصال بكابتن الدليفري"
                              >
                                <Phone className="w-3 h-3 text-emerald-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const clean = phoneNum.replace(/[^0-9]/g, '');
                                  const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(`مرحباً يا كابتن، بخصوص طلب دليفري من ${business.name}`)}`;
                                  const a = document.createElement('a');
                                  a.href = waUrl;
                                  a.target = '_blank';
                                  a.rel = 'noopener noreferrer';
                                  a.click();
                                }}
                                className="bg-white/10 hover:bg-[#25D366] hover:text-black text-white p-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-0.5 cursor-pointer"
                                title="واتساب كابتن الدليفري"
                              >
                                <MessageCircle className="w-3 h-3 text-[#25D366]" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Copy All & Quick Edit Actions */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={handleCopyAllDeliveryNumbers}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-white/15 cursor-pointer"
                    >
                      {copiedAllPhones ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-sky-400" />}
                      <span>{copiedAllPhones ? 'تم نسخ جميع الأرقام!' : '📋 نسخ جميع أرقام الدليفري'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditingNumbers(true)}
                      className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-sky-500/20 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>✏️ إدخال وتعديل الأرقام لهذا النشاط</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer Actions */}
        {activeTab === 'order' && (
          <div className="p-3 bg-neutral-950 border-t border-white/10 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleDirectCall()}
              className="flex-1 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-white/20 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>اتصال تليفوني</span>
            </button>

            <button
              type="button"
              onClick={() => handleCreateOrder(orderMode === 'custom_collect', true)}
              className="flex-[1.5] bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500 hover:brightness-110 active:scale-95 text-black font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25 transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-black" />
              <span>
                {orderMode === 'custom_collect' ? 'تأكيد جمع طلبك دليفري خاص 🛵' : 'تأكيد وتتبع مباشر 🛵'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
