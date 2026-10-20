import React, { useState } from 'react';
import { 
  X, Check, ShieldCheck, Sparkles, Motorbike, Bike, Car, 
  MapPin, Phone, User, CheckCircle2, Gift, Clock, Award, 
  Send, Lock, CreditCard, Navigation, ExternalLink, KeyRound,
  Truck, Bus
} from 'lucide-react';
import { Business, SubscriberTrackingCell, SubscriberBankTransferDetails, SupportedLang, DeliveryDriver } from '../types';

interface DeliveryCaptainRegisterModalProps {
  onClose: () => void;
  onSuccess?: (newBusiness: Business, driverRecord?: DeliveryDriver) => void;
  lang: SupportedLang;
}

export type DriverTransportType = 'taxi' | 'motorcycle' | 'limousine' | 'bus_travel' | 'heavy_truck';

export const DeliveryCaptainRegisterModal: React.FC<DeliveryCaptainRegisterModalProps> = ({
  onClose,
  onSuccess,
  lang,
}) => {
  const isAr = lang === 'ar';

  const [driverType, setDriverType] = useState<DriverTransportType>('taxi');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleModel, setVehicleModel] = useState('تويوتا كورولا 2024');
  const [plateNumber, setPlateNumber] = useState('');
  const [city, setCity] = useState('القاهرة');
  const [coverageZones, setCoverageZones] = useState('التجمع، المطار، مدينة نصر، المعادي');
  const [ownerPin, setOwnerPin] = useState('1234');
  const [vodafoneCash, setVodafoneCash] = useState('');
  const [instapayId, setInstapayId] = useState('');
  const [ratePerKm, setRatePerKm] = useState('6.5');
  const [minFare, setMinFare] = useState('25');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdBizRecord, setCreatedBizRecord] = useState<Business | null>(null);

  const getDriverTypeDetails = (type: DriverTransportType) => {
    switch (type) {
      case 'taxi':
        return {
          title: 'تاكسي وأجرة (White Cab)',
          cat: 'تاكسي وأجرة',
          sub: 'تاكسي العاصمة والمطار',
          icon: '🚕',
          image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
          defaultModel: 'هيونداي فيرنا / تويوتا كورولا',
          defaultRate: '6.5',
          defaultMin: '25',
        };
      case 'motorcycle':
        return {
          title: 'موتوسيكل وسكوتر دليفري',
          cat: 'موتوسيكل ودليفري',
          sub: 'سكوتر دليفري إكسبريس',
          icon: '🛵',
          image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800',
          defaultModel: 'سكوتر بينيلي / دايون دليفري',
          defaultRate: '4.5',
          defaultMin: '15',
        };
      case 'limousine':
        return {
          title: 'سيارات ليموزين ورجال أعمال VIP',
          cat: 'سيارات ليموزين',
          sub: 'ليموزين مطار القاهرة والساحل',
          icon: '🚘',
          image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800',
          defaultModel: 'مرسيدس E200 / تويوتا كامري VIP',
          defaultRate: '15',
          defaultMin: '250',
        };
      case 'bus_travel':
        return {
          title: 'أتوبيسات رحلات وسياحة وعمرة',
          cat: 'أتوبيسات رحلات وسياحة وعمرة',
          sub: 'أتوبيس سوبر جيت سياحي',
          icon: '🚌',
          image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
          defaultModel: 'مرسيدس 600 سياحي مكيف 50 راكب',
          defaultRate: '45',
          defaultMin: '2500',
        };
      case 'heavy_truck':
        return {
          title: 'شحن ونقل ثقيل ونقل عفش',
          cat: 'شحن ونقل ثقيل',
          sub: 'سيارات نقل أثاث مغلقة',
          icon: '🚚',
          image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800',
          defaultModel: 'سيارة جامبو مجهزة ونش هيدروليك',
          defaultRate: '25',
          defaultMin: '600',
        };
    }
  };

  const handleTypeChange = (type: DriverTransportType) => {
    setDriverType(type);
    const details = getDriverTypeDetails(type);
    setVehicleModel(details.defaultModel);
    setRatePerKm(details.defaultRate);
    setMinFare(details.defaultMin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert(isAr ? 'يرجى كتابة الاسم ورقم الهاتف' : 'Please provide name and phone');
      return;
    }

    const typeDetails = getDriverTypeDetails(driverType);
    const cleanPhone = phone.trim();
    const code = `DRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = Date.now();
    const cleanPlate = plateNumber.trim() || 'ط س ق 4821';
    const cleanPin = ownerPin.trim() || '1234';
    const freeExpiryDate = Date.now() + 90 * 24 * 60 * 60 * 1000; // 90 days = 3 months

    // Full Subscriber Business Record (له كل خصائص المشترك)
    const newBusiness: Business = {
      id: newId,
      name: `كابتن ${name.trim()} (${typeDetails.title})`,
      cat: typeDetails.cat,
      subCat: typeDetails.sub,
      phone: cleanPhone,
      city: city.trim(),
      addr: coverageZones.trim() || `${city} - خدمة سريعة`,
      bio: `كابتن وسائق معتمد في خدمة ${typeDetails.title}. تغطية شاملة لـ (${coverageZones}). مركبة مجهزة ومكيفة، وتتبع مباشر بالـ GPS. سداد الأجرة نقداً كاش عند الوصول أو عبر فودافون كاش وإنستاباي.`,
      hours: '24 ساعة (خدمة متواصلة)',
      pkg: 350, // Full subscriber active tier
      verified: 1,
      status: 'active',
      expiry: freeExpiryDate,
      likes: 15,
      viewsCount: 120,
      sharesCount: 8,
      rating: 5.0,
      isSponsored: false,
      ownerPageLocked: true,
      ownerPin: cleanPin,
      ownerAccessCode: code,
      images: [typeDetails.image],
      videos: ['https://assets.mixkit.co/videos/preview/mixkit-car-driving-through-the-streets-of-a-city-43184-large.mp4'],
      hasDelivery: driverType === 'motorcycle',
      deliveryInfo: driverType === 'motorcycle' ? {
        available: true,
        phone: cleanPhone,
        areas: coverageZones,
        fee: `${minFare} ج.م`,
        estimatedTime: '20 - 35 دقيقة',
      } : undefined,
      // Full GPS Live Tracking Cell
      trackingCell: {
        enabled: true,
        vehicleType: driverType,
        vehiclePlate: cleanPlate,
        vehicleModel: vehicleModel.trim(),
        captainName: name.trim(),
        captainPhone: cleanPhone,
        captainPhoto: typeDetails.image,
        currentStatus: 'available',
        currentArea: `${city} - ${coverageZones}`,
        ratePerKmEgp: parseFloat(ratePerKm) || 6.5,
        minimumTripPriceEgp: parseFloat(minFare) || 25,
        lastPing: Date.now(),
        lat: 30.0444 + (Math.random() - 0.5) * 0.05,
        lng: 31.2357 + (Math.random() - 0.5) * 0.05,
        hotline: cleanPhone,
      },
      // Full Direct Financial & Bank Transfer Details
      bankTransferDetails: {
        enabled: true,
        vodafoneCashNumber: vodafoneCash.trim() || cleanPhone,
        instapayId: instapayId.trim() || `${cleanPhone}@instapay`,
        phones: [cleanPhone],
        hotline: cleanPhone,
        customerTransferNotes: 'الدفع نقداً كاش عند الوصول أو تحويل فودافون كاش وإنستاباي مباشرة للكابتن',
        isEncryptedSecurity: true,
      },
      services: [
        { n: `مشوار داخل ${city}`, p: `${minFare} ج.م` },
        { n: 'مشاوير المطار والمحافظات', p: `${(parseFloat(minFare) || 25) * 3} ج.م` },
        { n: 'توصيل طلبات وإكسبريس', p: `${ratePerKm} ج.م/كم` },
      ],
    };

    // Save driver profile to drivers registry
    const deliveryDriverObj: DeliveryDriver = {
      id: `driver-${newId}`,
      name: name.trim(),
      phone: cleanPhone,
      avatarUrl: typeDetails.image,
      vehicleType: typeDetails.title,
      plateNumber: cleanPlate,
      city: city.trim(),
      coverageZones: coverageZones.split('،').map((s) => s.trim()).filter(Boolean),
      rating: 5.0,
      completedOrdersCount: 0,
      status: 'available',
      isVerified: true,
      joinedDate: Date.now(),
    };

    try {
      const existingRaw = localStorage.getItem('dalilk_drivers');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('dalilk_drivers', JSON.stringify([deliveryDriverObj, ...existing]));
      localStorage.setItem(`dalilk_pin_${newId}`, cleanPin);
      localStorage.setItem(`dalilk_owner_verified_${newId}`, 'true');
    } catch (err) {
      console.warn('Driver save warning:', err);
    }

    setCreatedBizRecord(newBusiness);
    setIsSubmitted(true);
    if (onSuccess) {
      onSuccess(newBusiness, deliveryDriverObj);
    }
  };

  const handleWhatsAppContact = () => {
    if (!createdBizRecord) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = `🚕 مرحباً إدارة منصة إعلانك E3lanak،\nأنا الكابتن (${name}) كود رقم (#${createdBizRecord.ownerAccessCode}).\nقمت بالاشتراك وتفعيل تطبيقي في خدمة (${getDriverTypeDetails(driverType).title}) في (${city} - ${coverageZones}).\nرقم لوحة المركبة: (${plateNumber || 'ط س ق 4821'}).\nرقم التحويل الخاص بي هو (${vodafoneCash || cleanPhone}) لاستقبال مبالغ الأجرة عبر فودافون كاش وإنستاباي مع خيار الدفع كاش عند الوصول.\nأرغب في تأكيد اشتراكي والبدء باستقبال الركاب والطلبات فوراً.`;
    const waUrl = `https://wa.me/201006656669?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-[160] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="bg-[#121420] border border-amber-400/50 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative my-auto text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-5 flex items-center justify-between text-black">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black text-amber-400 flex items-center justify-center shadow-lg border border-amber-300/40 text-2xl font-black">
              {getDriverTypeDetails(driverType).icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-black">
                  اشتراك كابتن تاكسي ودليفري (مشترك رسمي 100%)
                </h3>
              </div>
              <p className="text-[11px] text-black/80 font-bold">
                له كل خصائص المشترك: صفحة مستقلة، تتبع GPS، تيك توك ريلز، وأرباح 100% لك بدون أي عمولة!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-black transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free 3-Month Gift Banner */}
        <div className="bg-amber-950/40 border-b border-amber-500/30 p-3 px-4 flex items-center gap-2.5 text-xs">
          <Gift className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
          <div className="leading-relaxed">
            <strong className="text-amber-300 block text-xs">
              هدية الانضمام الفوري: باقة المشترك الكاملة مجاناً لمدة 3 شهور (90 يوماً) 🎁
            </strong>
            <span className="text-white/80 text-[11px]">
              تفعيل صفحتك، ظهورك على خريطة الرادار لجميع الركاب، ورقم سري خاص بك لتعديل بياناتك بدون أي وسيط أو عمولة.
            </span>
          </div>
        </div>

        {!isSubmitted ? (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto hide-scroll text-xs">
            
            {/* 1. Vehicle / Driver Type Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-white/90 block">
                اختر نوع وسيلة النقل والخدمة الخاصة بك: *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'taxi' as DriverTransportType, label: '🚕 تاكسي وأجرة' },
                  { id: 'motorcycle' as DriverTransportType, label: '🛵 موتوسيكل ودليفري' },
                  { id: 'limousine' as DriverTransportType, label: '🚘 ليموزين VIP' },
                  { id: 'bus_travel' as DriverTransportType, label: '🚌 أتوبيسات رحلات وعمرة' },
                  { id: 'heavy_truck' as DriverTransportType, label: '🚚 شحن ونقل ثقيل وعفش' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTypeChange(item.id)}
                    className={`p-2.5 rounded-xl border text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      driverType === item.id
                        ? 'bg-amber-400 text-black border-amber-300 font-black shadow-md'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Captain Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>اسم الكابتن والسائق *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: كابتن محمود الشريف"
                  className="w-full bg-neutral-900 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>رقم الموبايل والواتساب *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full bg-neutral-900 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono outline-none"
                />
              </div>
            </div>

            {/* 3. Vehicle Model & Plate Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80">نوع وموديل المركبة</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="مثال: تويوتا كورولا 2024 / هيونداي فيرنا"
                  className="w-full bg-neutral-900 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80">رقم اللوحة المعدنية</label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  placeholder="مثال: ط س ق 4821"
                  className="w-full bg-neutral-900 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono outline-none"
                />
              </div>
            </div>

            {/* 4. City & Coverage Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>المحافظة / المدينة الرئيسية</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="مثال: القاهرة / الإسكندرية / الجيزة"
                  className="w-full bg-neutral-900 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80">مناطق التغطية والعمل المفضلة</label>
                <input
                  type="text"
                  value={coverageZones}
                  onChange={(e) => setCoverageZones(e.target.value)}
                  placeholder="مثال: التجمع، المطار، مدينة نصر، المعادي"
                  className="w-full bg-neutral-900 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
            </div>

            {/* 5. Secret PIN for Owner Page Editing */}
            <div className="bg-black/50 border border-amber-400/30 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>الرقم السري لتعديل صفحتك الخاصة (🔐 PIN من 4 أرقام):</span>
                </label>
                <span className="text-[10px] text-white/60">خاص بك فقط</span>
              </div>
              <input
                type="password"
                maxLength={6}
                value={ownerPin}
                onChange={(e) => setOwnerPin(e.target.value)}
                placeholder="مثال: 1234"
                className="w-full bg-neutral-900 border border-white/15 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono tracking-widest text-center text-sm outline-none"
              />
              <p className="text-[10px] text-white/60 leading-relaxed">
                ستستخدم هذا الرقم السري في أي وقت لتعديل صفحة إعلانك، أسعارك، أرقامك، وصورك بكل خصوصية.
              </p>
            </div>

            {/* 6. Financial Payment Accounts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>محفظة فودافون كاش لاستقبال الأجرة</span>
                </label>
                <input
                  type="tel"
                  value={vodafoneCash}
                  onChange={(e) => setVodafoneCash(e.target.value)}
                  placeholder="010XXXXXXXX (نفس رقمك أو رقم آخر)"
                  className="w-full bg-neutral-900 border border-white/15 focus:border-emerald-400 rounded-xl px-3 py-2 text-white font-mono outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/80 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>معرّف إنستاباي InstaPay (اختياري)</span>
                </label>
                <input
                  type="text"
                  value={instapayId}
                  onChange={(e) => setInstapayId(e.target.value)}
                  placeholder="name@instapay أو رقم الهاتف"
                  className="w-full bg-neutral-900 border border-white/15 focus:border-purple-400 rounded-xl px-3 py-2 text-white font-mono outline-none"
                />
              </div>
            </div>

            {/* 7. Fare Rates */}
            <div className="grid grid-cols-2 gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/80 block">تسعيرة الكيلومتر (ج.م):</label>
                <input
                  type="number"
                  step="0.5"
                  value={ratePerKm}
                  onChange={(e) => setRatePerKm(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-1.5 text-white font-mono outline-none text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/80 block">الحد الأدنى لفتح العداد (ج.م):</label>
                <input
                  type="number"
                  value={minFare}
                  onChange={(e) => setMinFare(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-1.5 text-white font-mono outline-none text-xs"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 active:scale-98 text-black font-black text-sm py-3.5 rounded-2xl shadow-xl shadow-amber-500/30 transition cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>تأكيد الاشتراك وتفعيل صفحة المشترك وتتبع الـ GPS فوراً 🚀</span>
            </button>
          </form>
        ) : (
          /* Confirmation & Activated Subscriber Digital Card */
          <div className="p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto text-2xl animate-pulse">
              ✓
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-lg text-white">
                تم تفعيل اشتراكك بنجاح ولك كافة خصائص المشترك! 🎉
              </h3>
              <p className="text-xs text-white/80 max-w-md mx-auto leading-relaxed">
                مرحباً كابتن {name}! تم تفعيل اشتراكك كـ مشترك رسمي في منصة إعلانك لمدة 3 شهور مجاناً. تم تفعيل صفحتك الخاصة، خلية تتبع الـ GPS، وبات بإمكانك تعديل صفحتك برقمك السري واستقبال المشاوير والأرباح 100% لك مباشرة.
              </p>
            </div>

            {/* Captain ID Digital Card */}
            <div className="bg-gradient-to-br from-neutral-900 to-black border-2 border-amber-400/60 rounded-3xl p-4 text-start space-y-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div>
                  <span className="font-black text-white text-sm block">{name}</span>
                  <span className="text-[11px] text-amber-300 font-bold">{getDriverTypeDetails(driverType).title}</span>
                </div>
                <span className="font-mono text-emerald-400 font-black text-xs bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                  {createdBizRecord?.ownerAccessCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
                <div>الهاتف: <b className="text-white font-mono">{phone}</b></div>
                <div>اللوحة: <b className="text-amber-300 font-mono">{plateNumber || 'ط س ق 4821'}</b></div>
                <div>المركبة: <b className="text-white">{vehicleModel}</b></div>
                <div>الرقم السري (PIN): <b className="text-emerald-400 font-mono">{ownerPin}</b></div>
                <div>المحافظة: <b className="text-white">{city}</b></div>
                <div>تتبع GPS: <b className="text-emerald-400">🟢 متاح ونشط الآن</b></div>
              </div>

              <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center justify-between">
                <span>🎁 باقة المشترك المفعلة: ٣ شهور مجاناً</span>
                <span className="text-white font-mono">حتى {new Date(Date.now() + 90 * 86400000).toLocaleDateString('ar-EG')}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleWhatsAppContact}
                className="flex-1 bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow"
              >
                <Send className="w-4 h-4 fill-black" />
                <span>إرسال بيانات اشتراكي للإدارة واتساب</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                عرض صفحتي الآن ↗
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
