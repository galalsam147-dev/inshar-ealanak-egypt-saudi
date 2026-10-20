import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, MapPin, Phone, User, Clock, 
  CheckCircle2, AlertCircle, Plus, Trash2, Motorbike, 
  MessageCircle, Navigation, ShieldCheck, ChevronDown, 
  Sparkles, FileText, Utensils, Store, Pill, Package,
  Search, Tag, Star, Award, Wallet, ArrowRight, Check,
  Percent, RefreshCw, Printer, ExternalLink, HelpCircle,
  TrendingUp, Compass, Calendar, Coffee, Wrench, Users,
  Car, FileCheck, PhoneCall, Filter, Edit3, Folder, FolderOpen, Gift, Carrot, Sandwich
} from 'lucide-react';
import { Business, DeliveryOrder, DeliveryCategory, DeliveryOrderItem, SupportedLang, UserProfile, DeliveryDriver } from '../types';
import { isDeliveryEligible, getDeliveryEligibility } from '../utils/deliveryEligibility';
import { INITIAL_DRIVERS } from '../data/driversData';
import { OFFICIAL_PAYMENT_CONFIG } from '../utils/bankPaymentConfig';
import { DeliveryCaptainRegisterModal } from './DeliveryCaptainRegisterModal';
import { LiveOrderTrackingMap } from './LiveOrderTrackingMap';
import { TripPaymentMethodsManager } from './TripPaymentMethodsManager';

export type TalabatyTab = 'my_orders' | 'new_order' | 'menus' | 'drivers' | 'orders_data' | 'wallet';

interface DeliveryOrderModalProps {
  initialBusiness?: Business | null;
  businesses: Business[];
  userProfile?: UserProfile;
  activeOrder?: DeliveryOrder | null;
  orders?: DeliveryOrder[];
  initialTab?: TalabatyTab;
  onUpdateOrders?: (orders: DeliveryOrder[]) => void;
  onClose: () => void;
  onSubmitOrder: (order: DeliveryOrder) => void;
  lang: SupportedLang;
}

export const DeliveryOrderModal: React.FC<DeliveryOrderModalProps> = ({
  initialBusiness,
  businesses,
  userProfile,
  activeOrder: initialActiveOrder,
  orders = [],
  initialTab,
  onUpdateOrders,
  onClose,
  onSubmitOrder,
  lang,
}) => {
  // Only businesses eligible for delivery: Stores, Restaurants, Professions (Hotels and Entertainment excluded)
  const eligibleBusinesses = businesses.filter(isDeliveryEligible);

  // Active tab inside "برنامج طلباتي"
  const [activeTab, setActiveTab] = useState<TalabatyTab>(() => {
    if (initialTab) return initialTab;
    if (initialActiveOrder) return 'my_orders';
    if (orders.length > 0 && !initialBusiness) return 'my_orders';
    return 'new_order';
  });

  // Selected order being tracked
  const [trackedOrder, setTrackedOrder] = useState<DeliveryOrder | null>(() => {
    if (initialActiveOrder) return initialActiveOrder;
    if (orders.length > 0) return orders[0];
    return null;
  });

  // Local list of orders to allow live simulated state advancement
  const [localOrders, setLocalOrders] = useState<DeliveryOrder[]>(orders);

  useEffect(() => {
    if (orders && orders.length > 0) {
      setLocalOrders(orders);
    }
  }, [orders]);

  // Drivers State (Loaded from localStorage or initial certified fleet)
  const [drivers, setDrivers] = useState<DeliveryDriver[]>(() => {
    try {
      const stored = localStorage.getItem('dalilk_delivery_drivers');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_DRIVERS;
  });

  const saveDrivers = (newDrivers: DeliveryDriver[]) => {
    setDrivers(newDrivers);
    try {
      localStorage.setItem('dalilk_delivery_drivers', JSON.stringify(newDrivers));
    } catch {}
  };

  // Drivers Filter & Search
  const [driverSearch, setDriverSearch] = useState('');
  const [driverStatusFilter, setDriverStatusFilter] = useState<'all' | 'available' | 'on_delivery'>('all');
  const [showAddDriverForm, setShowAddDriverForm] = useState(false);
  const [showCaptainRegisterModal, setShowCaptainRegisterModal] = useState(false);
  const [expandedDriverPaymentId, setExpandedDriverPaymentId] = useState<string | null>(null);

  // New Driver Form States
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('01006656669');
  const [newDriverVehicle, setNewDriverVehicle] = useState('موتوسيكل سريع مع صندوق حفظ حراري 🛵');
  const [newDriverPlate, setNewDriverPlate] = useState('');
  const [newDriverCity, setNewDriverCity] = useState('القاهرة');
  const [newDriverZones, setNewDriverZones] = useState('مدينة نصر، المعادي، التجمع');

  const handleRegisterDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim()) return;

    const newDrv: DeliveryDriver = {
      id: `drv-${Date.now()}`,
      name: newDriverName.trim(),
      phone: newDriverPhone.trim() || '01006656669',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      vehicleType: newDriverVehicle,
      plateNumber: newDriverPlate.trim() || 'ط س م 1234',
      city: newDriverCity,
      coverageZones: newDriverZones.split(/[,،]/).map((z) => z.trim()).filter(Boolean),
      rating: 5.0,
      completedOrdersCount: 0,
      status: 'available',
      isVerified: true,
      joinedDate: Date.now(),
    };

    const updated = [newDrv, ...drivers];
    saveDrivers(updated);
    setShowAddDriverForm(false);
    setNewDriverName('');
    alert(`🎉 تم إضافة وتسجيل ${newDrv.name} في أسطول كباتن إعلانك إكسبريس بنجاح!`);
  };

  // Filtered drivers list
  const filteredDrivers = drivers.filter((drv) => {
    if (driverStatusFilter !== 'all' && drv.status !== driverStatusFilter) return false;
    if (driverSearch.trim()) {
      const q = driverSearch.toLowerCase();
      return (
        drv.name.toLowerCase().includes(q) ||
        drv.phone.includes(q) ||
        drv.city.toLowerCase().includes(q) ||
        drv.coverageZones.some((z) => z.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Orders Database Search & Filters
  const [orderDbSearch, setOrderDbSearch] = useState('');
  const [orderDbStatusFilter, setOrderDbStatusFilter] = useState<'all' | 'received' | 'preparing' | 'on_the_way' | 'delivered'>('all');

  const filteredOrdersDb = localOrders.filter((ord) => {
    if (orderDbStatusFilter !== 'all' && ord.status !== orderDbStatusFilter) return false;
    if (orderDbSearch.trim()) {
      const q = orderDbSearch.toLowerCase();
      return (
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.customerPhone.includes(q) ||
        ord.businessName.toLowerCase().includes(q) ||
        ord.deliveryAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sector filter for new order
  const [selectedSector, setSelectedSector] = useState<'all' | 'restaurant' | 'store' | 'profession'>('all');

  // Filtered businesses based on sector
  const filteredBusinesses = eligibleBusinesses.filter((b) => {
    if (selectedSector === 'all') return true;
    const { sector } = getDeliveryEligibility(b);
    return sector === selectedSector;
  });

  // Category state
  const [category, setCategory] = useState<DeliveryCategory>(() => {
    if (initialBusiness) {
      const { sector } = getDeliveryEligibility(initialBusiness);
      if (sector === 'restaurant') return 'restaurant';
      if (sector === 'store') return 'grocery';
      if (sector === 'profession') return 'documents';
    }
    return 'restaurant';
  });

  const [selectedBizId, setSelectedBizId] = useState<string | number>(initialBusiness?.id || '');
  const [customBizName, setCustomBizName] = useState(initialBusiness?.name || '');
  const [pickupAddress, setPickupAddress] = useState(initialBusiness?.addr || '');
  const [deliveryAddress, setDeliveryAddress] = useState(userProfile?.city ? `${userProfile.city} - منزلي` : '');
  const [customerName, setCustomerName] = useState(userProfile?.displayName || 'عميل إعلانك');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '01006656669');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet' | 'vodafone_cash' | 'instapay' | 'visa'>('cash');

  // Promo code
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountEgp: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  // Cart Items for New Order
  const [items, setItems] = useState<DeliveryOrderItem[]>(() => {
    if (initialBusiness && initialBusiness.services && initialBusiness.services.length > 0) {
      return [{
        name: initialBusiness.services[0].n,
        quantity: 1,
        estimatedPriceEgp: initialBusiness.services[0].priceEgp || 120,
      }];
    }
    return [{ name: 'طلب مأكولات / مشتريات / مستندات', quantity: 1, estimatedPriceEgp: 150 }];
  });

  // Auto-fill when store is selected
  useEffect(() => {
    if (selectedBizId) {
      const b = eligibleBusinesses.find((biz) => String(biz.id) === String(selectedBizId));
      if (b) {
        setCustomBizName(b.name);
        setPickupAddress(b.addr || b.city);
        const { sector } = getDeliveryEligibility(b);
        if (sector === 'restaurant') setCategory('restaurant');
        else if (sector === 'profession') setCategory('documents');
        else setCategory('grocery');

        if (b.services && b.services.length > 0 && items.length === 1 && items[0].name.includes('مأكولات')) {
          setItems([{
            name: b.services[0].n,
            quantity: 1,
            estimatedPriceEgp: b.services[0].priceEgp || 100,
          }]);
        }
      }
    }
  }, [selectedBizId, eligibleBusinesses]);

  // Dynamic Item actions
  const handleAddItem = (customItem?: Partial<DeliveryOrderItem>) => {
    setItems((prev) => [
      ...prev,
      {
        name: customItem?.name || '',
        quantity: customItem?.quantity || 1,
        estimatedPriceEgp: customItem?.estimatedPriceEgp || 50,
        notes: customItem?.notes || '',
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdateItem = (index: number, field: keyof DeliveryOrderItem, val: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleSelectServiceQuick = (sName: string, sPrice?: number) => {
    if (items.length === 1 && items[0].name === 'طلب مأكولات / مشتريات / مستندات') {
      setItems([{ name: sName, quantity: 1, estimatedPriceEgp: sPrice || 50 }]);
    } else {
      setItems((prev) => [...prev, { name: sName, quantity: 1, estimatedPriceEgp: sPrice || 50 }]);
    }
  };

  // Geolocation detection
  const handleDetectAddress = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDeliveryAddress(`موقعي الجغرافي (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        () => {
          alert('يرجى تفعيل صلاحية الـ GPS لتحديد موقعك تلقائياً');
        }
      );
    }
  };

  // Coupon apply
  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'TALABATY10' || code === 'DALILAK10') {
      setAppliedPromo({ code, discountEgp: 30 });
      setPromoInput('');
    } else if (code === 'FREEDEL' || code === 'FREE') {
      setAppliedPromo({ code, discountEgp: category === 'documents' ? 35 : 25 });
      setPromoInput('');
    } else if (code === 'WELCOME20') {
      setAppliedPromo({ code, discountEgp: 20 });
      setPromoInput('');
    } else {
      setPromoError('كود الخصم غير صالح أو منتهي الصلاحية');
    }
  };

  // Calculations
  const deliveryFee = category === 'documents' ? 35 : 25;
  const itemsSubtotal = items.reduce((acc, curr) => acc + ((curr.estimatedPriceEgp || 0) * (curr.quantity || 1)), 0);
  const discountVal = appliedPromo ? appliedPromo.discountEgp : 0;
  const totalAmount = Math.max(0, itemsSubtotal + deliveryFee - discountVal);

  // Submit Order
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Assign available driver if any
    const availableDriver = drivers.find((d) => d.status === 'available') || drivers[0];

    const orderNumber = `E3L-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: DeliveryOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      businessId: selectedBizId || undefined,
      businessName: customBizName.trim() || 'متجر من منصة إعلانك',
      category,
      items: items.filter((i) => i.name.trim() !== ''),
      pickupAddress: pickupAddress.trim() || 'عنوان المتجر',
      deliveryAddress: deliveryAddress.trim() || 'عنوان العميل',
      customerName: customerName.trim() || 'عميل إعلانك',
      customerPhone: customerPhone.trim() || '01006656669',
      captainName: availableDriver ? availableDriver.name : 'كابتن وليد المصري',
      captainPhone: availableDriver ? availableDriver.phone : '01006656669',
      deliveryFeeEgp: deliveryFee,
      itemsSubtotalEgp: itemsSubtotal,
      totalEgp: totalAmount,
      paymentMethod,
      status: 'received',
      statusUpdates: [
        { status: 'received', time: Date.now(), note: 'تم استلام طلبك وتأكيده مع المتجر' },
        { status: 'preparing', time: Date.now() + 180000, note: 'المحل يقوم بتجهيز وتغليف الطلب' },
        { status: 'on_the_way', time: Date.now() + 600000, note: 'الكابتن استلم الطلب وهو في الطريق إليك' },
      ],
      notes: orderNotes.trim() || undefined,
      createdAt: Date.now(),
      estimatedMinutes: 25,
    };

    onSubmitOrder(newOrder);
    setLocalOrders((prev) => [newOrder, ...prev]);
    setTrackedOrder(newOrder);
    setActiveTab('my_orders');
  };

  // Re-order past order in 1 click
  const handleReorder = (ord: DeliveryOrder) => {
    if (ord.items && ord.items.length > 0) {
      setItems(ord.items);
    }
    setCustomBizName(ord.businessName);
    setSelectedBizId(ord.businessId || '');
    setPickupAddress(ord.pickupAddress);
    setDeliveryAddress(ord.deliveryAddress);
    setCategory(ord.category);
    setActiveTab('new_order');
  };

  // Change order status
  const handleAdvanceOrderStatus = (ordId: string, nextStatus: DeliveryOrder['status']) => {
    const updated = localOrders.map((o) => {
      if (o.id === ordId) {
        const nextNotes = {
          received: 'تم استلام الطلب',
          preparing: 'جاري التجهيز بالمحل',
          on_the_way: 'الكابتن استلم الطلب وفي الطريق للعميل',
          delivered: 'تم تسليم الطلب للعميل واستلام الحساب',
          cancelled: 'تم إلغاء الطلب',
        };
        const newUpdates = [
          ...o.statusUpdates,
          { status: nextStatus, time: Date.now(), note: nextNotes[nextStatus] },
        ];
        return { ...o, status: nextStatus, statusUpdates: newUpdates };
      }
      return o;
    });

    setLocalOrders(updated);
    onUpdateOrders?.(updated);
    if (trackedOrder && trackedOrder.id === ordId) {
      const match = updated.find((o) => o.id === ordId);
      if (match) setTrackedOrder(match);
    }
  };

  // Search in menus
  const [menuSearch, setMenuSearch] = useState('');
  const [menuSectorFilter, setMenuSectorFilter] = useState<'all' | 'restaurant' | 'sandwiches' | 'vegetables' | 'store' | 'profession'>('all');

  // Aggregated dishes/services from all eligible businesses
  const allCatalogItems = eligibleBusinesses.flatMap((biz) => {
    const { sector, sectorLabel } = getDeliveryEligibility(biz);
    if (!biz.services) return [];
    return biz.services.map((s, idx) => ({
      id: `${biz.id}-${idx}`,
      businessId: biz.id,
      businessName: biz.name,
      businessCity: biz.city,
      businessCat: biz.cat,
      sector,
      sectorLabel,
      name: s.n,
      priceEgp: s.priceEgp || parseInt(s.p.replace(/[^0-9]/g, '')) || 75,
      priceFormatted: s.p,
      image: biz.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
    }));
  });

  const filteredCatalogItems = allCatalogItems.filter((item) => {
    if (menuSectorFilter !== 'all') {
      if (menuSectorFilter === 'restaurant') {
        const isRest = item.sector === 'restaurant' || item.businessCat.includes('مطاعم');
        if (!isRest) return false;
      } else if (menuSectorFilter === 'sandwiches') {
        const isSandwich = item.businessCat.includes('سندوتشات') || 
          item.name.includes('سندوتش') || item.name.includes('شاورما') || 
          item.name.includes('برجر') || item.name.includes('كريب') || item.name.includes('حواوشي') || item.name.includes('كبدة');
        if (!isSandwich) return false;
      } else if (menuSectorFilter === 'vegetables') {
        const isVeg = item.businessCat.includes('خضروات') || 
          item.name.includes('خضار') || item.name.includes('طماطم') || item.name.includes('بطاطس') ||
          item.name.includes('فاكهة') || item.name.includes('برتقال') || item.name.includes('موز') || item.name.includes('تفاح');
        if (!isVeg) return false;
      } else if (item.sector !== menuSectorFilter) {
        return false;
      }
    }
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.businessName.toLowerCase().includes(q) ||
        item.businessCat.toLowerCase().includes(q) ||
        item.businessCity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Selected store details
  const selectedBiz = eligibleBusinesses.find((b) => String(b.id) === String(selectedBizId));

  // Determine active step for tracked order
  const getOrderStep = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'received': return 1;
      case 'preparing': return 2;
      case 'on_the_way': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-neutral-900 border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[94vh] sm:max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-neutral-950 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 text-black">
              🛵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>برنامج طلباتي وبيانات السائقين</span>
                  <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                    أسطول كباتن إعلانك ⚡
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-amber-300/90 font-medium">
                دليفري وتوصيل للمتاجر والمطاعم والمهن فقط 🍔 🛒 📄 (دون الفنادق والترفيه)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clear Policy Notice Banner: Hotels & Entertainment Excluded */}
        <div className="bg-amber-950/40 border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-between text-[11px] text-amber-200">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-xs">ℹ️</span>
            <span>
              <strong>بيانات السائقين والطلبات:</strong> متاح للمتاجر والمطاعم والمهن. الفنادق والترفيه للحجز المباشر والدفع في المكان.
            </span>
          </div>
          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 shrink-0">
            {drivers.length} كابتن معتمد 🛵
          </span>
        </div>

        {/* 4 Folder Buttons Bar (شبكة تجميع الأوامر في أربع زراير فولدر) */}
        <div className="p-2 sm:p-3 bg-neutral-950 border-b border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            
            {/* Folder 1: تجميع الأوامر والطلبات النشطة */}
            <button
              type="button"
              onClick={() => setActiveTab('orders_data')}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-start relative overflow-hidden group cursor-pointer ${
                activeTab === 'orders_data' || activeTab === 'my_orders' || activeTab === 'new_order'
                  ? 'bg-gradient-to-br from-blue-950/80 via-blue-900/40 to-neutral-900 border-blue-400/80 shadow-lg shadow-blue-500/20 ring-1 ring-blue-400'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                  activeTab === 'orders_data' || activeTab === 'my_orders' || activeTab === 'new_order'
                    ? 'bg-blue-400 text-black shadow-md'
                    : 'bg-white/10 text-white/70'
                }`}>
                  📁
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  {localOrders.length} طلب
                </span>
              </div>
              <div className="font-black text-xs text-white group-hover:text-blue-300 transition">
                فولدر 1: تجميع الأوامر
              </div>
              <div className="text-[10px] text-white/50 truncate">
                شبكة الطلبات النشطة والتتبع
              </div>
            </button>

            {/* Folder 2: كباتن الدليفري (3 شهور مجاناً) */}
            <button
              type="button"
              onClick={() => setActiveTab('drivers')}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-start relative overflow-hidden group cursor-pointer ${
                activeTab === 'drivers'
                  ? 'bg-gradient-to-br from-emerald-950/80 via-emerald-900/40 to-neutral-900 border-emerald-400/80 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                  activeTab === 'drivers'
                    ? 'bg-emerald-400 text-black shadow-md'
                    : 'bg-white/10 text-white/70'
                }`}>
                  🛵
                </div>
                <span className="text-[9px] font-black bg-amber-400 text-black px-1.5 py-0.5 rounded-full shadow animate-pulse">
                  3 شهور مجاناً 🎁
                </span>
              </div>
              <div className="font-black text-xs text-white group-hover:text-emerald-300 transition">
                فولدر 2: كباتن الدليفري
              </div>
              <div className="text-[10px] text-white/50 truncate">
                {drivers.length} كابتن • تسجيل معتمد
              </div>
            </button>

            {/* Folder 3: قوائم الأسعار والمنيو (مطاعم، خضروات، سندوتشات) */}
            <button
              type="button"
              onClick={() => setActiveTab('menus')}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-start relative overflow-hidden group cursor-pointer ${
                activeTab === 'menus'
                  ? 'bg-gradient-to-br from-amber-950/80 via-amber-900/40 to-neutral-900 border-amber-400/80 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                  activeTab === 'menus'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'bg-white/10 text-white/70'
                }`}>
                  📋
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  مطاعم وخضار
                </span>
              </div>
              <div className="font-black text-xs text-white group-hover:text-amber-300 transition">
                فولدر 3: قوائم الأسعار
              </div>
              <div className="text-[10px] text-white/50 truncate">
                مطاعم، خضروات، سندوتشات
              </div>
            </button>

            {/* Folder 4: سجل الحجوزات والعملاء والمحفظة */}
            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-start relative overflow-hidden group cursor-pointer ${
                activeTab === 'wallet'
                  ? 'bg-gradient-to-br from-purple-950/80 via-purple-900/40 to-neutral-900 border-purple-400/80 shadow-lg shadow-purple-500/20 ring-1 ring-purple-400'
                  : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                  activeTab === 'wallet'
                    ? 'bg-purple-400 text-black shadow-md'
                    : 'bg-white/10 text-white/70'
                }`}>
                  📅
                </div>
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  المشتركين
                </span>
              </div>
              <div className="font-black text-xs text-white group-hover:text-purple-300 transition">
                فولدر 4: الحجوزات والمحفظة
              </div>
              <div className="text-[10px] text-white/50 truncate">
                حجوزات العملاء والنقاط
              </div>
            </button>
          </div>

          {/* Sub Navigation Bar for Folder 1 (Order Actions) */}
          {(activeTab === 'orders_data' || activeTab === 'my_orders' || activeTab === 'new_order') && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-xs flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('orders_data')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                  activeTab === 'orders_data' ? 'bg-blue-500 text-white font-black' : 'text-white/60 hover:text-white'
                }`}
              >
                📋 شبكة تجميع الأوامر ({localOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('my_orders')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                  activeTab === 'my_orders' ? 'bg-blue-500 text-white font-black' : 'text-white/60 hover:text-white'
                }`}
              >
                📍 تتبع الطلب الحالي
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('new_order')}
                className={`px-3 py-1 rounded-xl transition cursor-pointer ${
                  activeTab === 'new_order' ? 'bg-amber-400 text-black font-black' : 'text-amber-300/80 hover:text-amber-300'
                }`}
              >
                + طلب دليفري جديد
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

          {/* TAB 4: DRIVERS DIRECTORY & FLEET DATA (بيانات السائقين والكباتن) */}
          {activeTab === 'drivers' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Header Hero Banner for Fleet */}
              <div className="bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-neutral-900 border border-emerald-500/40 p-4 rounded-3xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold border border-emerald-500/30">
                      👨‍✈️
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white flex items-center gap-2">
                        <span>أسطول كباتن وسائقي إعلانك إكسبريس</span>
                        <span className="text-[10px] bg-emerald-500 text-black font-black px-2 py-0.5 rounded-full">
                          مفحوصين ومعتمدين ✓
                        </span>
                      </h4>
                      <p className="text-[11px] text-white/60">
                        سائقين محترفين لتوصيل طلبات المطاعم والمتاجر والمستندات في ثوانٍ
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCaptainRegisterModal(true)}
                      className="bg-gradient-to-r from-amber-400 to-[#FFD700] hover:brightness-110 active:scale-95 text-black font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-400/20"
                    >
                      <Gift className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>تسجيل كابتن (مجاناً 3 شهور 🎁)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddDriverForm(!showAddDriverForm)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة سريعة</span>
                    </button>
                  </div>
                </div>

                {/* Search & Filter Drivers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/10">
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/40 absolute start-3 top-2.5" />
                    <input
                      type="text"
                      value={driverSearch}
                      onChange={(e) => setDriverSearch(e.target.value)}
                      placeholder="ابحث باسم الكابتن، الهاتف، المحافظة أو المنطقة..."
                      className="w-full bg-neutral-900 border border-white/15 rounded-xl ps-9 pe-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="flex gap-1.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setDriverStatusFilter('all')}
                      className={`flex-1 py-1.5 rounded-xl border transition ${
                        driverStatusFilter === 'all'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                          : 'bg-white/5 border-white/10 text-white/60'
                      }`}
                    >
                      الكل ({drivers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDriverStatusFilter('available')}
                      className={`flex-1 py-1.5 rounded-xl border transition ${
                        driverStatusFilter === 'available'
                          ? 'bg-emerald-500 text-black font-black border-emerald-400'
                          : 'bg-white/5 border-white/10 text-white/60'
                      }`}
                    >
                      🟢 متاح للطلب
                    </button>
                    <button
                      type="button"
                      onClick={() => setDriverStatusFilter('on_delivery')}
                      className={`flex-1 py-1.5 rounded-xl border transition ${
                        driverStatusFilter === 'on_delivery'
                          ? 'bg-amber-400 text-black font-black border-amber-400'
                          : 'bg-white/5 border-white/10 text-white/60'
                      }`}
                    >
                      🛵 في مشوار
                    </button>
                  </div>
                </div>
              </div>

              {/* Add New Driver Form Modal/Accordion */}
              {showAddDriverForm && (
                <form onSubmit={handleRegisterDriver} className="bg-neutral-950 border border-emerald-500/40 p-4 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h5 className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>تسجيل وإضافة كابتن توصيل جديد:</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowAddDriverForm(false)}
                      className="text-white/40 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-white/70">اسم الكابتن الرباعي *</label>
                      <input
                        type="text"
                        required
                        value={newDriverName}
                        onChange={(e) => setNewDriverName(e.target.value)}
                        placeholder="مثال: كابتن أحمد محمد علي"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-white/70">رقم الهاتف (واتساب) *</label>
                      <input
                        type="tel"
                        required
                        value={newDriverPhone}
                        onChange={(e) => setNewDriverPhone(e.target.value)}
                        placeholder="010XXXXXXXX"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-white/70">نوع وسيلة التوصيل</label>
                      <select
                        value={newDriverVehicle}
                        onChange={(e) => setNewDriverVehicle(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="موتوسيكل سريع مع صندوق حفظ حراري 🛵" className="bg-neutral-900">موتوسيكل سريع مع صندوق حفظ حراري 🛵</option>
                        <option value="سكوتر دليفري إكسبريس 🛵" className="bg-neutral-900">سكوتر دليفري إكسبريس 🛵</option>
                        <option value="سيارة طرود ومستندات مؤمنة 🚗" className="bg-neutral-900">سيارة طرود ومستندات مؤمنة 🚗</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-white/70">رقم اللوحة المعدنية</label>
                      <input
                        type="text"
                        value={newDriverPlate}
                        onChange={(e) => setNewDriverPlate(e.target.value)}
                        placeholder="مثال: ط س ع 8492"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-white/70">المحافظة الرئيسية</label>
                      <input
                        type="text"
                        value={newDriverCity}
                        onChange={(e) => setNewDriverCity(e.target.value)}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-white/70">مناطق التغطية والعمل</label>
                      <input
                        type="text"
                        value={newDriverZones}
                        onChange={(e) => setNewDriverZones(e.target.value)}
                        placeholder="مثال: مدينة نصر، المعادي، التجمع"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs py-2.5 rounded-xl shadow-lg transition cursor-pointer"
                  >
                    حفظ واعتماد الكابتن فوراً ✓
                  </button>
                </form>
              )}

              {/* Drivers Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredDrivers.map((drv) => (
                  <div
                    key={drv.id}
                    className="bg-neutral-950 border border-white/10 hover:border-emerald-500/40 p-3.5 rounded-2xl space-y-3 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10 border border-white/15 shrink-0">
                          <img
                            src={drv.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                            alt={drv.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-black text-white">{drv.name}</h5>
                            {drv.isVerified && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                          <span className="text-[10px] text-amber-300 font-bold block">
                            ⭐ {drv.rating} ({drv.completedOrdersCount} طلب منجز)
                          </span>
                          <span className="text-[10px] text-white/50 block font-mono">
                            {drv.phone}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        drv.status === 'available'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-400 text-black'
                      }`}>
                        {drv.status === 'available' ? '🟢 متاح الآن' : '🛵 في مشوار'}
                      </span>
                    </div>

                    {/* Vehicle & Plate details */}
                    <div className="bg-white/5 p-2 rounded-xl text-[11px] text-white/80 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-white/50">المركبة:</span>
                        <span className="font-bold text-white">{drv.vehicleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">رقم اللوحة:</span>
                        <span className="font-mono font-bold text-amber-300">{drv.plateNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">المحافظة والمناطق:</span>
                        <span className="font-semibold text-white/90">{drv.city} ({drv.coverageZones.join('، ')})</span>
                      </div>
                      <div className="flex justify-between items-center bg-black/40 p-1.5 rounded-lg border border-amber-400/20 text-[10px] flex-wrap gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-300 font-bold">💳 أرقام دفع وتحويل الرحلة:</span>
                          <span className="font-mono text-emerald-300 font-black">{drv.phone}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedDriverPaymentId(expandedDriverPaymentId === drv.id ? null : drv.id)}
                          className="text-[10px] bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-400/30 transition cursor-pointer"
                        >
                          {expandedDriverPaymentId === drv.id ? 'إخفاء الأرقام ▲' : 'إدارة وتعديل الأرقام يدوي ✏️'}
                        </button>
                      </div>

                      {/* Expanded Trip Payment Numbers Manager for this driver */}
                      {expandedDriverPaymentId === drv.id && (
                        <div className="pt-2 animate-in fade-in">
                          <TripPaymentMethodsManager
                            storageKey={drv.phone}
                            captainName={drv.name}
                            captainPhone={drv.phone}
                            currentFareEgp={30}
                            allowFareEdit={true}
                          />
                        </div>
                      )}

                      <div className="text-[10px] text-emerald-400/90 font-bold flex items-center justify-between">
                        <span>🎁 الاشتراك: باقة 3 شهور مجاناً على إعلانك</span>
                        <span className="text-white/50">بدون عمولة</span>
                      </div>
                    </div>

                    {/* Direct Contact & Action Bar */}
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                      <a
                        href={`https://wa.me/${drv.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `مرحباً كابتن ${drv.name}، تواصل من إدارة إعلانك إكسبريس بخصوص رحلات وطلبات التوصيل اليوم.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-black" />
                        <span>محادثة واتساب</span>
                      </a>

                      <a
                        href={`tel:${drv.phone}`}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs p-2 rounded-xl transition flex items-center justify-center"
                        title="اتصال هاتفي مباشر"
                      >
                        <Phone className="w-4 h-4 text-emerald-400" />
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          alert(`تم تعيين الكابتن ${drv.name} لطلبك القادم بنجاح!`);
                        }}
                        className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs px-3 py-2 rounded-xl transition cursor-pointer"
                        title="تعيين هذا الكابتن للطلب"
                      >
                        اختيار
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ALL ORDERS DATABASE (قاعدة بيانات وإدارة كافة الطلبات) */}
          {activeTab === 'orders_data' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Database Overview Card */}
              <div className="bg-gradient-to-r from-blue-950/60 via-neutral-900 to-neutral-900 border border-blue-500/40 p-4 rounded-3xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-bold border border-blue-500/30">
                      📋
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">قاعدة بيانات وسجل طلبات إعلانك إكسبريس</h4>
                      <p className="text-[11px] text-white/60">
                        استعراض كافة تفاصيل وسجلات الطلبات، الفواتير، بيانات المستلمين، والأسعار
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                    {localOrders.length} طلب مسجل
                  </span>
                </div>

                {/* Search & Status Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-white/10">
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/40 absolute start-3 top-2.5" />
                    <input
                      type="text"
                      value={orderDbSearch}
                      onChange={(e) => setOrderDbSearch(e.target.value)}
                      placeholder="ابحث برقم الطلب (DLK-...)، اسم العميل، الهاتف، أو المتجر..."
                      className="w-full bg-neutral-900 border border-white/15 rounded-xl ps-9 pe-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div className="flex gap-1 text-[11px] font-bold overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setOrderDbStatusFilter('all')}
                      className={`px-2.5 py-1.5 rounded-xl transition ${
                        orderDbStatusFilter === 'all'
                          ? 'bg-blue-500 text-white font-black'
                          : 'bg-white/5 text-white/60'
                      }`}
                    >
                      الكل
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderDbStatusFilter('received')}
                      className={`px-2.5 py-1.5 rounded-xl transition ${
                        orderDbStatusFilter === 'received'
                          ? 'bg-blue-500 text-white font-black'
                          : 'bg-white/5 text-white/60'
                      }`}
                    >
                      تم الاستلام
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderDbStatusFilter('on_the_way')}
                      className={`px-2.5 py-1.5 rounded-xl transition ${
                        orderDbStatusFilter === 'on_the_way'
                          ? 'bg-amber-400 text-black font-black'
                          : 'bg-white/5 text-white/60'
                      }`}
                    >
                      في الطريق 🛵
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderDbStatusFilter('delivered')}
                      className={`px-2.5 py-1.5 rounded-xl transition ${
                        orderDbStatusFilter === 'delivered'
                          ? 'bg-emerald-500 text-black font-black'
                          : 'bg-white/5 text-white/60'
                      }`}
                    >
                      مكتمل ✓
                    </button>
                  </div>
                </div>
              </div>

              {/* Orders Detailed Table / List */}
              <div className="space-y-3">
                {filteredOrdersDb.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-neutral-950 border border-white/10 hover:border-blue-500/40 p-4 rounded-2xl space-y-3 transition"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-amber-400 text-sm">{ord.orderNumber}</span>
                        <span className="text-xs font-black text-white">{ord.businessName}</span>
                        <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-md">
                          {ord.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-emerald-400 font-mono">
                          {ord.totalEgp} ج.م
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-400 text-black animate-pulse'
                        }`}>
                          {ord.status === 'delivered' ? 'مكتمل بنجاح ✓' : 'جاري التوصيل 🛵'}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/80">
                      <div className="space-y-1">
                        <p><strong>اسم العميل:</strong> {ord.customerName}</p>
                        <p><strong>رقم هاتف العميل:</strong> <span className="font-mono text-amber-300">{ord.customerPhone}</span></p>
                        <p><strong>طريقة الدفع:</strong> {ord.paymentMethod === 'cash' ? '💵 كاش عند الاستلام' : ord.paymentMethod}</p>
                      </div>
                      <div className="space-y-1">
                        <p><strong>عنوان المتجر:</strong> {ord.pickupAddress}</p>
                        <p><strong>عنوان التوصيل:</strong> {ord.deliveryAddress}</p>
                        <p><strong>الكابتن المسند:</strong> <span className="text-emerald-300 font-bold">{ord.captainName || 'كابتن وليد المصري'}</span></p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-white/5 p-2.5 rounded-xl space-y-1 text-xs">
                      <span className="text-[10px] text-white/50 font-bold block">محتويات الطلب:</span>
                      {ord.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between text-white/90">
                          <span>{i.name} × {i.quantity}</span>
                          <span className="font-mono text-amber-300 font-bold">{(i.estimatedPriceEgp || 0) * i.quantity} ج.م</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setTrackedOrder(ord);
                            setActiveTab('my_orders');
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          تتبع حي 🛵
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            alert(`تم تجهيز وطباعة الفاتورة الرقمية للطلب ${ord.orderNumber}!`);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>الفاتورة 🧾</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://wa.me/${ord.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `مرحباً ${ord.customerName}، تواصل بخصوص طلبك رقم ${ord.orderNumber} من (${ord.businessName}). هل وصلك الطلب بكل جودة؟`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5 fill-black" />
                          <span>واتساب للعميل</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleAdvanceOrderStatus(ord.id, 'delivered')}
                          className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          ✓ تأكيد التسليم
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: MY ORDERS & TRACKING */}
          {activeTab === 'my_orders' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {localOrders.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-white/5 border border-white/10 rounded-3xl p-6">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-3xl">
                    🛵
                  </div>
                  <h4 className="text-sm font-black text-white">لا توجد لديك طلبات حالية في برنامج طلباتي</h4>
                  <p className="text-xs text-white/60 max-w-sm mx-auto">
                    اطلب الآن وجبتك المفضلة من مطاعم الدليل، أو مشترياتك من السوبر ماركت والصيدلية، أو توصيل مستندات مهنية وأوراق رسمية!
                  </p>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => setActiveTab('new_order')}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-lg cursor-pointer"
                    >
                      + إنشاء أول طلب دليفري الآن
                    </button>
                    <button
                      onClick={() => setActiveTab('menus')}
                      className="bg-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                    >
                      🍽️ تصفح منيو المطاعم
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* If tracked order exists, show Interactive Live Map and live details */}
                  {trackedOrder && (
                    <>
                      {/* Live Interactive GPS Map tracking captain from restaurant to customer */}
                      <LiveOrderTrackingMap
                        order={trackedOrder}
                        lang={lang}
                        onUpdateStatus={(newStatus) => {
                          const updated = { ...trackedOrder, status: newStatus };
                          setTrackedOrder(updated);
                          setLocalOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
                        }}
                      />

                      <div className="bg-gradient-to-br from-amber-950/60 via-neutral-900 to-neutral-900 border border-amber-500/50 p-4 sm:p-5 rounded-3xl space-y-4 shadow-xl">
                      {/* Tracker Top Status */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-300">
                            رقم الطلب: <span className="font-mono">{trackedOrder.orderNumber}</span>
                          </span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            trackedOrder.status === 'delivered'
                              ? 'bg-emerald-500 text-black'
                              : 'bg-amber-400 text-black animate-pulse'
                          }`}>
                            {trackedOrder.status === 'received' && 'تم الاستلام 📋'}
                            {trackedOrder.status === 'preparing' && 'المحل يجهز الطلب 👨‍🍳'}
                            {trackedOrder.status === 'on_the_way' && 'الكابتن في الطريق 🛵'}
                            {trackedOrder.status === 'delivered' && 'تم التسليم بنجاح ✓'}
                          </span>
                        </div>

                        <span className="text-[11px] text-white/60">
                          {new Date(trackedOrder.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Visual 4-Step Progress Bar */}
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-4 gap-1.5">
                          <div className={`h-2.5 rounded-full transition-all duration-500 ${getOrderStep(trackedOrder.status) >= 1 ? 'bg-emerald-500' : 'bg-white/20'}`} />
                          <div className={`h-2.5 rounded-full transition-all duration-500 ${getOrderStep(trackedOrder.status) >= 2 ? 'bg-emerald-500' : 'bg-white/20'}`} />
                          <div className={`h-2.5 rounded-full transition-all duration-500 ${getOrderStep(trackedOrder.status) >= 3 ? (trackedOrder.status === 'on_the_way' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500') : 'bg-white/20'}`} />
                          <div className={`h-2.5 rounded-full transition-all duration-500 ${getOrderStep(trackedOrder.status) >= 4 ? 'bg-emerald-500' : 'bg-white/20'}`} />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-white/70 px-1">
                          <span className={getOrderStep(trackedOrder.status) >= 1 ? 'text-emerald-400' : ''}>1. تم الاستلام</span>
                          <span className={getOrderStep(trackedOrder.status) >= 2 ? 'text-emerald-400' : ''}>2. التجهيز</span>
                          <span className={getOrderStep(trackedOrder.status) >= 3 ? 'text-amber-300' : ''}>3. في الطريق</span>
                          <span className={getOrderStep(trackedOrder.status) >= 4 ? 'text-emerald-400' : ''}>4. تم التسليم</span>
                        </div>
                      </div>

                      {/* Captain Dispatch Card */}
                      <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30">
                            🛵
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-white">{trackedOrder.captainName || 'كابتن وليد المصري'}</h5>
                            <span className="text-[10px] text-emerald-400 font-bold block">⭐ 4.9 (مندوب معتمد إعلانك إكسبريس)</span>
                            <span className="text-[10px] text-white/50 block">موتوسيكل سريع مزود بحقيبة حفظ حرارية</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/201006656669?text=${encodeURIComponent(
                              `مرحباً كابتن، أتابع طلبي رقم ${trackedOrder.orderNumber} من (${trackedOrder.businessName}) إلى (${trackedOrder.deliveryAddress})`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-black" />
                            <span className="hidden sm:inline">واتساب</span>
                          </a>
                          <a
                            href="tel:01006656669"
                            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs p-2 rounded-xl transition"
                            title="اتصال هاتف بالكابتن"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Items & Digital Invoice */}
                      <div className="bg-neutral-950/80 border border-white/10 p-3.5 rounded-2xl space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                            <span>المشتريات من: <span className="text-amber-300 font-bold">{trackedOrder.businessName}</span></span>
                          </h5>
                          <span className="text-[10px] text-white/50">فاتورة إلكترونية معتمدة</span>
                        </div>

                        <div className="space-y-1.5 divide-y divide-white/5">
                          {trackedOrder.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center pt-1.5 text-xs text-white/80">
                              <span>{item.name} × {item.quantity}</span>
                              <span className="font-bold text-white">{(item.estimatedPriceEgp || 0) * item.quantity} ج.م</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-white/10 pt-2 space-y-1 text-xs">
                          <div className="flex justify-between text-white/60">
                            <span>قيمة الطلبات:</span>
                            <span>{trackedOrder.itemsSubtotalEgp} ج.م</span>
                          </div>
                          <div className="flex justify-between text-white/60">
                            <span>رسوم التوصيل السريع:</span>
                            <span>{trackedOrder.deliveryFeeEgp} ج.م</span>
                          </div>
                          <div className="flex justify-between text-white font-black text-sm pt-1 border-t border-white/5">
                            <span>الإجمالي المستحق عند الاستلام:</span>
                            <span className="text-amber-400 font-mono text-base">{trackedOrder.totalEgp} ج.م</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[11px] text-white/60">
                          <span>طريقة الدفع:</span>
                          <span className="font-bold text-amber-300">
                            {trackedOrder.paymentMethod === 'cash' ? '💵 كاش عند الاستلام' : trackedOrder.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Address card */}
                      <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-xs space-y-1 text-white/80">
                        <div className="flex items-center gap-2">
                          <span className="text-red-400">📍</span>
                          <span><strong>من:</strong> {trackedOrder.pickupAddress}</span>
                        </div>
                        <div className="flex items-center gap-2 border-t border-white/5 pt-1">
                          <span className="text-emerald-400">🏠</span>
                          <span><strong>إلى:</strong> {trackedOrder.deliveryAddress}</span>
                        </div>
                      </div>

                      {/* Action buttons on active order */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleReorder(trackedOrder)}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                          <span>إعادة هذا الطلب 🔁</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            alert(`تم تحميل وإرسال إيصال الفاتورة الرقمية للطلب ${trackedOrder.orderNumber} بنجاح!`);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>طباعة الفاتورة</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                  {/* All Orders List */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-black text-white/60 uppercase tracking-wider">
                      سجل كافة طلباتي السابقة:
                    </h5>
                    {localOrders.map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => setTrackedOrder(ord)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          trackedOrder?.id === ord.id
                            ? 'bg-amber-500/15 border-amber-400/60'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                            {ord.category === 'restaurant' ? '🍔' : ord.category === 'documents' ? '📄' : '🛒'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white">{ord.businessName}</span>
                              <span className="text-[10px] text-amber-400 font-mono">({ord.orderNumber})</span>
                            </div>
                            <span className="text-[10px] text-white/50 block">
                              {ord.items.length} صنف • الإجمالي: {ord.totalEgp} ج.م • {ord.deliveryAddress}
                            </span>
                          </div>
                        </div>

                        <div className="text-end shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          }`}>
                            {ord.status === 'delivered' ? 'مكتمل ✓' : 'جاري التوصيل 🛵'}
                          </span>
                          <span className="text-[9px] text-white/40 block mt-1">اضغط للتتبع</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE NEW DELIVERY ORDER */}
          {activeTab === 'new_order' && (
            <form onSubmit={handlePlaceOrder} className="space-y-4 animate-in fade-in duration-200">
              {/* Sector selector: Restaurants, Stores, Professions */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-white/90 flex items-center justify-between">
                  <span>القطاع المطلوب (المتاجر والمطاعم والمهن فقط):</span>
                  <span className="text-[10px] text-amber-400 font-normal">إعلانك إكسبريس ⚡</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSector('restaurant');
                      setCategory('restaurant');
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      selectedSector === 'restaurant'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-black shadow-md'
                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <Utensils className="w-5 h-5 text-amber-400" />
                    <span className="text-xs">المطاعم والكافيهات</span>
                    <span className="text-[9px] text-white/40">مندي، مشويات، بيتزا</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSector('store');
                      setCategory('grocery');
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      selectedSector === 'store'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-black shadow-md'
                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <Store className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs">المتاجر والسوبرماركت</span>
                    <span className="text-[9px] text-white/40">صيدليات، خضار، قطع غيار</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSector('profession');
                      setCategory('documents');
                    }}
                    className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                      selectedSector === 'profession'
                        ? 'bg-blue-500/20 border-blue-400 text-blue-300 font-black shadow-md'
                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="text-xs">المهن والمستندات</span>
                    <span className="text-[9px] text-white/40">محامين، محاسبين، عيادات</span>
                  </button>
                </div>
              </div>

              {/* Select Business from Directory */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white/90">
                    اختر المتجر أو النشاط من الدليل:
                  </label>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    ✓ {filteredBusinesses.length} مكان متاح للدليفري
                  </span>
                </div>

                <select
                  value={selectedBizId}
                  onChange={(e) => setSelectedBizId(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="" className="bg-neutral-900 text-white">اختر متجر أو مطعم أو مهني من الدليل...</option>
                  {filteredBusinesses.map((b) => (
                    <option key={b.id} value={b.id} className="bg-neutral-900 text-white">
                      {b.name} ({b.cat} - {b.city})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={customBizName}
                  onChange={(e) => setCustomBizName(e.target.value)}
                  placeholder="أو اكتب اسم المتجر / المطعم / المكتب المراد الطلب منه..."
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Quick Picks from Selected Store Menu */}
              {selectedBiz && selectedBiz.services && selectedBiz.services.length > 0 && (
                <div className="p-3 bg-neutral-950/80 border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-amber-300 font-black flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>قائمة أصناف {selectedBiz.name} (اضغط للإضافة الفورية):</span>
                    </span>
                    <span className="text-[10px] text-white/50">أسعار معتمدة</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {selectedBiz.services.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectServiceQuick(s.n, s.priceEgp)}
                        className="bg-white/10 hover:bg-amber-400 hover:text-black text-white text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-white/10 font-bold"
                      >
                        <Plus className="w-3 h-3 text-amber-400 group-hover:text-black" />
                        <span>{s.n}</span>
                        {s.p && <span className="opacity-80 font-mono">({s.p})</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Items List in Cart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white/90">
                    أصناف وسلة الطلب:
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddItem()}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة صنف آخر</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-white/5 p-2 rounded-xl border border-white/10">
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                        placeholder="اسم الوجبة، المشتريات، أو المستند المطلوب..."
                        className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder:text-white/40"
                      />
                      
                      {/* Quantity */}
                      <div className="flex items-center bg-black/40 rounded-lg border border-white/10 px-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateItem(idx, 'quantity', Math.max(1, item.quantity - 1))}
                          className="px-1.5 py-0.5 text-white/70 hover:text-white"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold px-1.5 text-amber-300">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItem(idx, 'quantity', item.quantity + 1)}
                          className="px-1.5 py-0.5 text-white/70 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      {/* Estimated Price */}
                      <div className="flex items-center gap-1 bg-black/40 rounded-lg border border-white/10 px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          value={item.estimatedPriceEgp || ''}
                          onChange={(e) => handleUpdateItem(idx, 'estimatedPriceEgp', parseFloat(e.target.value) || 0)}
                          placeholder="السعر"
                          className="w-14 bg-transparent text-xs text-amber-300 font-bold font-mono text-center focus:outline-none"
                        />
                        <span className="text-[10px] text-white/50">ج.م</span>
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pickup & Delivery Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-white/70">عنوان المتجر / الاستلام</label>
                  <input
                    type="text"
                    required
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="عنوان أو منطقة المتجر..."
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-white/70">عنوان التوصيل إليك</label>
                    <button
                      type="button"
                      onClick={handleDetectAddress}
                      className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>موقعي GPS 📍</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="الشارع، رقم العمارة، رقم الشقة أو المكتب..."
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-white/70">اسم المستلم</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-white/70">رقم الهاتف للتواصل (واتساب)</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Notes for Courier */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/70">تعليمات وملاحظات للكابتن (اختياري)</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="مثال: المستندات هامة يرجى عدم طيها، بدون كاتشب، رن الجرس بهدوء..."
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Promo Code Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/70">كوبون خصم دليفري (Promo Code)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="جرب كود: TALABATY10 أو FREEDEL أو WELCOME20"
                    className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder:normal-case font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    تطبيق
                  </button>
                </div>
                {appliedPromo && (
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    ✓ تم تطبيق كود الخصم {appliedPromo.code} (-{appliedPromo.discountEgp} ج.م)
                  </span>
                )}
                {promoError && (
                  <span className="text-[10px] text-rose-400 font-bold block">{promoError}</span>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/80 block">طريقة الدفع:</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    <span>💵 كاش</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('visa')}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'visa'
                        ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                        : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    <span>💳 فيزا / بنك</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('vodafone_cash')}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'vodafone_cash'
                        ? 'bg-red-500/20 border-red-400 text-red-300'
                        : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    <span>📱 فودافون كاش</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('instapay')}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'instapay'
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                        : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    <span>⚡ إنستاباي</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === 'wallet'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    <span>🎁 محفظتي</span>
                  </button>
                </div>

                {/* Account details feedback box for selected electronic method (أمان مالي مشدد) */}
                {paymentMethod === 'visa' && (
                  <div className="bg-blue-950/40 border border-blue-400/30 p-2.5 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between text-blue-300 font-bold">
                      <span>💳 بوابة الدفع الإلكتروني الرسمية (بنك مصر):</span>
                      <span className="font-mono text-[10px] text-emerald-400">حساب رسمي مشفر 🔒</span>
                    </div>
                    <span className="text-[10px] text-white/60 block">
                      الربط مباشر وآمن ومشفر بروتوكولياً دون إظهار أرقام الحسابات للعامة.
                    </span>
                  </div>
                )}

                {paymentMethod === 'vodafone_cash' && (
                  <div className="bg-red-950/40 border border-red-400/30 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-red-300 font-bold">📱 محفظة إلكترونية مشفرة ومعتمدة:</span>
                    <span className="font-mono font-black text-emerald-400 text-xs">
                      سداد آمن ومحمي 🔒
                    </span>
                  </div>
                )}

                {paymentMethod === 'instapay' && (
                  <div className="bg-purple-950/40 border border-purple-400/30 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-purple-300 font-bold">⚡ حساب إنستاباي InstaPay:</span>
                    <span className="font-mono font-black text-purple-300 text-xs">
                      حساب موثق ومشفر 🔒
                    </span>
                  </div>
                )}
              </div>

              {/* إخلاء المسؤولية الرسمي عند الطلب */}
              <div className="bg-amber-950/60 border border-amber-400/50 rounded-2xl p-2.5 flex items-start gap-2 text-xs text-amber-200">
                <span className="text-amber-400 font-black text-sm shrink-0">⚠️</span>
                <div className="space-y-0.5">
                  <span className="font-black text-amber-300 text-[11px] block">
                    إخلاء مسؤولية رسمي عند الطلب (نحن مجرد إعلان):
                  </span>
                  <p className="text-[10px] text-white/90 leading-relaxed">
                    <strong>المنصة وسيط إعلاني فقط لنشر الإعلانات والأنشطة.</strong> لا نتحمل أي مسؤولية قانونية أو مالية عن الأسعار أو جودة المنتجات والخدمات أو التعاملات المتبادلة بين المشترك والعميل. يُرجى المعاينة والمحاسبة كاش عند الاستلام مباشرة.
                  </p>
                </div>
              </div>

              {/* Price Summary & Submit Bar */}
              <div className="bg-neutral-950 border border-white/15 p-3 rounded-2xl flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <span className="text-[10px] text-white/50 block">الإجمالي شامل التوصيل والخصم:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-amber-400 font-mono">{totalAmount} ج.م</span>
                    <span className="text-[9px] text-white/40">
                      ({itemsSubtotal} طلبات + {deliveryFee} توصيل {discountVal > 0 ? `- ${discountVal} خصم` : ''})
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black text-xs px-4 py-2 rounded-full shadow-lg shadow-orange-500/30 border border-amber-200/50 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Motorbike className="w-3.5 h-3.5 fill-black" />
                  <span>تأكيد الطلب الآن 🛵</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: MENUS & PRICING CATALOGS */}
          {activeTab === 'menus' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-amber-400" />
                    <span>عرض المنيو للمطاعم والأسعار لكافة الأنشطة التجارية:</span>
                  </h4>
                  <span className="text-[10px] text-amber-300 font-bold">
                    {filteredCatalogItems.length} صنف وخدمة معلنة
                  </span>
                </div>

                {/* Search Bar in Menus */}
                <div className="relative">
                  <Search className="w-4 h-4 text-white/40 absolute start-3 top-2.5" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="ابحث في المنيو (مندي، كريب، شاورما، كشف، عقد بيع، تغيير زيت)..."
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl ps-9 pe-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1.5 overflow-x-auto text-[11px] font-bold scrollbar-none pb-1">
                  <button
                    type="button"
                    onClick={() => setMenuSectorFilter('all')}
                    className={`px-3 py-1 rounded-xl transition ${
                      menuSectorFilter === 'all'
                        ? 'bg-amber-400 text-black'
                        : 'bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuSectorFilter('restaurant')}
                    className={`px-3 py-1 rounded-xl transition ${
                      menuSectorFilter === 'restaurant'
                        ? 'bg-amber-400 text-black'
                        : 'bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    🍔 مطاعم ومأكولات
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuSectorFilter('sandwiches')}
                    className={`px-3 py-1 rounded-xl transition ${
                      menuSectorFilter === 'sandwiches'
                        ? 'bg-amber-400 text-black font-black'
                        : 'bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    🥪 سندوتشات وسريع
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuSectorFilter('vegetables')}
                    className={`px-3 py-1 rounded-xl transition ${
                      menuSectorFilter === 'vegetables'
                        ? 'bg-emerald-400 text-black font-black'
                        : 'bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    🥬 خضروات وفواكه
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuSectorFilter('store')}
                    className={`px-3 py-1 rounded-xl transition ${
                      menuSectorFilter === 'store'
                        ? 'bg-emerald-400 text-black'
                        : 'bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    🛒 متاجر وصيدليات
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuSectorFilter('profession')}
                    className={`px-3 py-1 rounded-xl transition ${
                      menuSectorFilter === 'profession'
                        ? 'bg-blue-400 text-black'
                        : 'bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    ⚖️ مهن ومستندات
                  </button>
                </div>
              </div>

              {/* Catalog Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredCatalogItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-neutral-950 border border-white/10 hover:border-amber-500/40 p-3 rounded-2xl flex items-center justify-between gap-3 transition group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                          {item.businessCat}
                        </span>
                        <span className="text-[10px] text-white/40">{item.businessCity}</span>
                      </div>
                      <h5 className="text-xs font-black text-white group-hover:text-amber-300 transition">
                        {item.name}
                      </h5>
                      <span className="text-[11px] text-white/60 block truncate">
                        من: <span className="font-bold text-white/80">{item.businessName}</span>
                      </span>
                      <span className="text-sm font-black text-amber-400 font-mono block">
                        {item.priceEgp} ج.م
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBizId(item.businessId);
                        setCustomBizName(item.businessName);
                        handleSelectServiceQuick(item.name, item.priceEgp);
                        setActiveTab('new_order');
                      }}
                      className="bg-amber-500/20 hover:bg-amber-400 hover:text-black text-amber-300 border border-amber-500/30 p-2.5 rounded-xl transition text-xs font-black flex flex-col items-center gap-1 shrink-0 cursor-pointer shadow-sm"
                      title="أضف لسلة طلباتي"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-[10px]">أضف لطلباتي</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TALABATY WALLET & LOYALTY POINTS */}
          {activeTab === 'wallet' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-gradient-to-br from-amber-500/20 via-orange-600/20 to-neutral-900 border border-amber-500/40 p-5 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center text-2xl font-black">
                      🎁
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">محفظة ومكافآت برنامج طلباتي</h4>
                      <span className="text-[11px] text-amber-300 font-bold">كل طلب يمنحك 50 نقطة ولاء فورية!</span>
                    </div>
                  </div>

                  <div className="text-end">
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {userProfile?.points || 340}
                    </span>
                    <span className="text-[10px] text-white/60 block">نقطة مجمعة</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-black/40 border border-white/10 p-3 rounded-2xl">
                    <span className="text-[10px] text-white/50 block">رصيد المحفظة النقدية:</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {userProfile?.walletBalance || 200} ج.م
                    </span>
                  </div>
                  <div className="bg-black/40 border border-white/10 p-3 rounded-2xl">
                    <span className="text-[10px] text-white/50 block">مستوى العضوية:</span>
                    <span className="text-base font-black text-amber-300">
                      عميل ذهبي 🥇
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 space-y-2">
                  <h5 className="text-xs font-black text-white">كوبونات دليفري مجانية متوفرة لك:</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-amber-300 font-mono">TALABATY10</span>
                        <span className="text-[10px] text-white/60 block">خصم 30 جنيه على طلبات المطاعم</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPromoInput('TALABATY10');
                          setActiveTab('new_order');
                        }}
                        className="bg-amber-400 text-black font-black text-[10px] px-2.5 py-1 rounded-lg"
                      >
                        استخدم
                      </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-emerald-300 font-mono">FREEDEL</span>
                        <span className="text-[10px] text-white/60 block">توصيل مجاني بالكامل لأي متجر</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPromoInput('FREEDEL');
                          setActiveTab('new_order');
                        }}
                        className="bg-emerald-400 text-black font-black text-[10px] px-2.5 py-1 rounded-lg"
                      >
                        استخدم
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Delivery Captain 3 Months Free Register Modal */}
        {showCaptainRegisterModal && (
          <DeliveryCaptainRegisterModal
            onClose={() => setShowCaptainRegisterModal(false)}
            onSuccess={(_newBiz, newCap) => {
              if (newCap) {
                saveDrivers([newCap, ...drivers]);
              }
              setShowCaptainRegisterModal(false);
            }}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
};
