import React, { useState } from 'react';
import { 
  X, Calendar, MapPin, CheckCircle, ExternalLink, Bed, Phone, 
  MessageCircle, Building2, Trash2, Printer, Share2, Filter, 
  ArrowRight, ShieldCheck, Clock
} from 'lucide-react';
import { Business } from '../types';

export interface SavedBooking {
  ref: string;
  businessId: string | number;
  businessName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
  createdAt?: number;
  totalPrice: number;
  paymentMethod: string;
}

interface UserBookingsModalProps {
  bookings: SavedBooking[];
  onClose: () => void;
  onOpenBookingDetails?: (b: SavedBooking) => void;
  onOpenBusiness?: (bizId: string | number) => void;
  onDeleteBooking?: (ref: string) => void;
  businesses?: Business[];
}

export const UserBookingsModal: React.FC<UserBookingsModalProps> = ({
  bookings,
  onClose,
  onOpenBusiness,
  onDeleteBooking,
  businesses = [],
}) => {
  const [selectedSubscriberFilter, setSelectedSubscriberFilter] = useState<string | number>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [locallyDeletedRefs, setLocallyDeletedRefs] = useState<string[]>([]);

  // Default hotel & tourism bookings linked to subscribers if user has not booked yet
  const defaultSample: SavedBooking[] = [
    {
      ref: 'E3L-BK-849120',
      businessId: 100,
      businessName: 'تانوك ريزورت (Tanoak Hotel) - أزها العين السخنة',
      roomName: 'جناح سوبيريور عائلي (إطلالة بحر)',
      checkIn: '2026-10-07',
      checkOut: '2026-10-09',
      nights: 2,
      guestName: 'أحمد محمود النجار',
      guestPhone: '01006656669',
      totalPrice: 12558,
      paymentMethod: 'الدفع في الفندق عند الوصول (Cash upon arrival)',
      status: 'confirmed',
      createdAt: Date.now() - 3600000 * 24,
    },
    {
      ref: 'E3L-BK-918234',
      businessId: 2,
      businessName: 'Nile Royal Palace Hotel - فندق قصر النيل الدولي',
      roomName: 'غرفة ديلوكس مطلة على النيل لشخصين',
      checkIn: '2026-10-12',
      checkOut: '2026-10-14',
      nights: 2,
      guestName: 'أحمد محمود النجار',
      guestPhone: '01006656669',
      totalPrice: 5200,
      paymentMethod: 'الدفع في الفندق عند الوصول (Cash upon arrival)',
      status: 'confirmed',
      createdAt: Date.now() - 3600000 * 48,
    }
  ];

  const rawBookings = bookings.length > 0 ? bookings : defaultSample;
  const allBookings = rawBookings.filter((b) => !locallyDeletedRefs.includes(b.ref));

  // Extract unique subscribers from bookings list
  const subscriberList = Array.from(
    new Map(allBookings.map((b) => [String(b.businessId), { id: b.businessId, name: b.businessName }])).values()
  );

  // Filtered bookings
  const filteredBookings = allBookings.filter((b) => {
    if (selectedSubscriberFilter !== 'all' && String(b.businessId) !== String(selectedSubscriberFilter)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.businessName.toLowerCase().includes(q) ||
        b.ref.toLowerCase().includes(q) ||
        b.roomName.toLowerCase().includes(q) ||
        b.guestName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getBusinessPhone = (bizId: string | number): string => {
    const found = businesses.find((b) => String(b.id) === String(bizId));
    return found?.phone || '01006656669';
  };

  const handlePrintVoucher = (b: SavedBooking) => {
    const text = `━━━━━━━━━━━━━━━━━━━━━\n` +
      `🎫 قسيمة حجز فندقي وسياحي معتمدة - منصة إعلانك\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `🏨 المشترك: ${b.businessName}\n` +
      `🔖 كود الحجز: #${b.ref}\n` +
      `🛏️ نوع الإقامة / الغرفة: ${b.roomName}\n` +
      `📅 تاريخ الوصول: ${b.checkIn}\n` +
      `📅 تاريخ المغادرة: ${b.checkOut} (${b.nights} ليلة)\n` +
      `👤 اسم النزيل: ${b.guestName}\n` +
      `📱 هاتف النزيل: ${b.guestPhone}\n` +
      `💳 طريقة الدفع: ${b.paymentMethod}\n` +
      `💰 المبلغ المستحق: ${b.totalPrice.toLocaleString()} ج.م\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `تأكيد فوري عبر منصة إعلانك E3lanak.`;
    
    if (navigator.share) {
      navigator.share({
        title: `حجز ${b.businessName}`,
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('تم نسخ قسيمة الحجز بالكامل إلى الحافظة للمشاركة والطباعة!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-neutral-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-white"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-950/50 via-neutral-900 to-yellow-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Calendar className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  حجوزاتي الفندقية والسياحية
                </h2>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  مرتبطة بكل مشترك 🏨
                </span>
              </div>
              <p className="text-[11px] text-white/60">
                سجل الفنادق، الشاليهات، والرحلات المحجوزة لكل مشترك على منصة إعلانك
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter by Subscriber Chips */}
        <div className="p-3 bg-neutral-900/60 border-b border-white/10 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span className="font-bold flex items-center gap-1.5 text-amber-300">
              <Filter className="w-3.5 h-3.5" />
              <span>تصفية الحجوزات حسب المشترك:</span>
            </span>
            <span className="text-[11px] text-white/50 font-mono">
              {filteredBookings.length} حجز
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto hide-scroll pb-1">
            <button
              type="button"
              onClick={() => setSelectedSubscriberFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedSubscriberFilter === 'all'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
              }`}
            >
              🌟 كل المشتركين ({allBookings.length})
            </button>

            {subscriberList.map((sub) => {
              const subCount = allBookings.filter((b) => String(b.businessId) === String(sub.id)).length;
              return (
                <button
                  key={String(sub.id)}
                  type="button"
                  onClick={() => setSelectedSubscriberFilter(sub.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    String(selectedSubscriberFilter) === String(sub.id)
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{sub.name}</span>
                  <span className="text-[10px] bg-black/30 px-1.5 rounded-full">({subCount})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-3xl space-y-3">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto text-2xl">
                🏨
              </div>
              <h3 className="font-black text-sm text-white">لا توجد حجوزات لهذا المشترك حالياً</h3>
              <p className="text-[11px] text-white/60 max-w-sm mx-auto">
                يمكنك تصفح الفنادق والمنتجعات المسجلة في إعلانك والضغط على "احجز الآن" لتأكيد إقامتك والدفع في المكان.
              </p>
            </div>
          ) : (
            filteredBookings.map((b) => {
              const bizPhone = getBusinessPhone(b.businessId);
              return (
                <div
                  key={b.ref}
                  className="bg-neutral-900 border border-white/15 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl hover:border-amber-400/40 transition"
                >
                  {/* Subscriber Header Card */}
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>حجز مؤكد فوري</span>
                        </span>
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>المشترك: {b.businessName}</span>
                        </span>
                      </div>

                      <h3 className="font-black text-sm sm:text-base text-white mt-1">
                        {b.businessName}
                      </h3>

                      <p className="text-xs text-amber-300 font-bold flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" />
                        <span>{b.roomName}</span>
                      </p>
                    </div>

                    <div className="text-end shrink-0">
                      <span className="text-[10px] text-white/50 block font-mono">كود الحجز:</span>
                      <span className="text-xs font-mono font-black text-amber-400 bg-black/60 px-2.5 py-1 rounded-xl border border-white/15 inline-block">
                        #{b.ref}
                      </span>
                    </div>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-black/40 p-3 rounded-2xl border border-white/10 text-xs">
                    <div>
                      <span className="text-white/50 block text-[10px] mb-0.5">تاريخ الوصول:</span>
                      <span className="font-bold text-white font-mono">{b.checkIn}</span>
                    </div>
                    <div>
                      <span className="text-white/50 block text-[10px] mb-0.5">تاريخ المغادرة:</span>
                      <span className="font-bold text-white font-mono">{b.checkOut} <span className="text-amber-400">({b.nights} ليلة)</span></span>
                    </div>
                    <div>
                      <span className="text-white/50 block text-[10px] mb-0.5">طريقة الدفع:</span>
                      <span className="font-bold text-emerald-400 text-[11px] truncate block">{b.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-white/50 block text-[10px] mb-0.5">المبلغ الإجمالي:</span>
                      <span className="font-black text-amber-400 text-sm font-mono">{b.totalPrice.toLocaleString()} ج.م</span>
                    </div>
                  </div>

                  {/* Guest Info */}
                  <div className="bg-white/5 rounded-xl px-3 py-2 flex items-center justify-between text-[11px] text-white/70">
                    <div>
                      <span>النزيل: </span>
                      <strong className="text-white">{b.guestName}</strong>
                    </div>
                    <div>
                      <span>رقم الهاتف: </span>
                      <span className="font-mono text-amber-300">{b.guestPhone}</span>
                    </div>
                  </div>

                  {/* Subscriber Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Button: Open Subscriber Profile Page */}
                      {onOpenBusiness && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenBusiness(b.businessId);
                          }}
                          className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>صفحة المشترك</span>
                        </button>
                      )}

                      {/* WhatsApp with Subscriber */}
                      <a
                        href={`https://wa.me/2${bizPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `مرحباً إدارة (${b.businessName}) 🌟،\nأنا النزيل ${b.guestName}، لدي حجز مؤكد طرفكم بكود: #${b.ref} (${b.roomName}) من تاريخ ${b.checkIn} إلى ${b.checkOut}.\nأود التأكيد معكم.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition shadow"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-black" />
                        <span>واتساب المشترك</span>
                      </a>

                      {/* Call Subscriber */}
                      <a
                        href={`tel:${bizPhone}`}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition"
                        title="اتصال هاتفي"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">اتصال</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5 ms-auto">
                      {/* Share / Print Voucher */}
                      <button
                        type="button"
                        onClick={() => handlePrintVoucher(b)}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                        title="طباعة ومشاركة الفاوتشر"
                      >
                        <Printer className="w-3.5 h-3.5 text-sky-400" />
                        <span>الفاوتشر</span>
                      </button>

                      {/* Delete / Cancel Booking */}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`هل أنت متأكد من رغبتك في إلغاء حجز ${b.businessName} (كود: #${b.ref})؟`)) {
                            setLocallyDeletedRefs((prev) => [...prev, b.ref]);
                            if (onDeleteBooking) onDeleteBooking(b.ref);
                          }
                        }}
                        className="bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                        title="إلغاء هذا الحجز"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">إلغاء</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info note */}
        <div className="p-3 bg-neutral-900 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50 shrink-0">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>حجوزاتك محمية ومسجلة في حسابك المرتبط بكل مشترك مباشرة.</span>
          </span>
          <button
            onClick={onClose}
            className="text-white hover:underline font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
