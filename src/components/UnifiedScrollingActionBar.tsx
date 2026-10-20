import React from 'react';
import { 
  FileText, Bike, Navigation, Zap, Target, Bell, Compass
} from 'lucide-react';
import { SupportedLang } from '../types';

export interface UnifiedScrollingActionBarProps {
  onOpenNearest?: () => void;
  onOpenBooking?: () => void;
  onOpenOrderNow?: () => void;
  onOpenPriceList?: () => void;
  onOpenDelivery?: () => void;
  onOpenDriverTracking?: () => void;
  onOpenPriceDisplay?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  lang?: SupportedLang;
}

export const UnifiedScrollingActionBar: React.FC<UnifiedScrollingActionBarProps> = ({
  onOpenNearest,
  onOpenBooking,
  onOpenOrderNow,
  onOpenPriceList,
  onOpenDelivery,
  onOpenDriverTracking,
  onOpenPriceDisplay,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  lang = 'ar',
}) => {
  // شريط الطلبات والأسعار (الصف الأول)
  const orderItems = [
    {
      id: 'order_now',
      label: 'لطلب الآن',
      icon: Zap,
      gradient: 'from-amber-400 to-yellow-500',
      badge: 'فوري ⚡',
      textColor: 'text-amber-300',
      onClick: onOpenOrderNow || onOpenDelivery,
    },
    {
      id: 'price_list',
      label: 'قائمة الأسعار',
      icon: FileText,
      gradient: 'from-yellow-500 to-amber-500',
      badge: 'الأسعار 📋',
      textColor: 'text-yellow-300',
      onClick: onOpenPriceList || onOpenPriceDisplay,
    },
    {
      id: 'delivery',
      label: 'طلب دليفري',
      icon: Bike,
      gradient: 'from-orange-500 to-red-500',
      badge: 'دليفري 🛵',
      textColor: 'text-orange-300',
      onClick: onOpenDelivery,
    },
    {
      id: 'tracking',
      label: 'تتبع السائق',
      icon: Compass,
      gradient: 'from-sky-500 to-blue-500',
      badge: 'تتبع 🛰️',
      textColor: 'text-sky-300',
      onClick: onOpenDriverTracking || onOpenDelivery,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-1 select-none py-0.5 px-1 max-w-full overflow-hidden" dir="rtl">
      {/* 1. شريط الطلبات والأسعار المتحرك الرفيع */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scroll py-0.5 scroll-smooth">
        {orderItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="bg-black/80 hover:bg-black active:scale-95 border border-white/20 hover:border-amber-400/60 rounded-full px-2 py-0.5 flex items-center gap-1 shrink-0 transition shadow-sm cursor-pointer group backdrop-blur-md"
              title={item.label}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${item.gradient} text-black flex items-center justify-center shrink-0 shadow-sm`}>
                <Icon className="w-2 h-2 stroke-[2.5]" />
              </div>
              <span className={`text-[9px] font-black ${item.textColor} group-hover:brightness-125 transition`}>
                {item.label}
              </span>
              <span className="text-[7px] font-black px-1 py-0.2 rounded-full bg-white/10 text-white/80 border border-white/10">
                {item.badge}
              </span>
            </button>
          );
        })}

        {/* إشعارات الطلبات إن وجدت */}
        {unreadNotificationsCount > 0 && onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            className="bg-rose-500/30 hover:bg-rose-500/50 border border-rose-400/40 text-rose-200 rounded-full px-2 py-0.5 flex items-center gap-1 shrink-0 text-[8px] font-bold transition cursor-pointer"
          >
            <Bell className="w-2.5 h-2.5 text-rose-400 animate-bounce" />
            <span>{unreadNotificationsCount} إشعار</span>
          </button>
        )}
      </div>

      {/* 2. شريط اطلب الأقرب إليك تحت كل الطلبات */}
      <div className="flex items-center gap-1.5 w-full">
        {/* شريط اطلب الأقرب إليك تحت كل الطلبات */}
        <button
          onClick={onOpenNearest || onOpenDelivery}
          className="flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-110 active:scale-98 text-white px-2.5 py-0.5 rounded-full flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 border border-emerald-400/40 cursor-pointer transition"
          title="اطلب الأقرب إليك حسب موقعك وGPS فوراً"
        >
          <Navigation className="w-3 h-3 fill-emerald-200 text-emerald-200 animate-pulse shrink-0" />
          <span className="text-[10px] font-black tracking-wide truncate">
            📍 شريط اطلب الأقرب إليك
          </span>
          <span className="bg-black/30 text-[8px] font-black px-1.5 py-0.2 rounded-full text-emerald-200 border border-emerald-300/30 shrink-0">
            GPS مباشر
          </span>
        </button>
      </div>
    </div>
  );
};
