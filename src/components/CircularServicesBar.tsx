import React from 'react';
import { 
  ShieldCheck, Navigation, Stethoscope, Zap, Sparkles, 
  Bike, Bell, Award, Calendar, Music, Smartphone, Globe, FolderCog 
} from 'lucide-react';
import { SupportedLang } from '../types';

interface CircularServicesBarProps {
  onOpenAssistantPortal: () => void;
  onOpenTransportTracking: () => void;
  onOpenClinicBooking: () => void;
  onOpenOrderNowDirectory: () => void;
  onOpenAdd: () => void;
  onOpenDelivery: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount?: number;
  onOpenCaptainRegister: () => void;
  onOpenBookings: () => void;
  bookingsCount?: number;
  onOpenMusicBank: () => void;
  onOpenAppInstall: () => void;
  onOpenOfficialDomain: () => void;
  onOpenSettings: () => void;
  pendingApprovalsCount?: number;
  lang?: SupportedLang;
}

export const CircularServicesBar: React.FC<CircularServicesBarProps> = ({
  onOpenAssistantPortal,
  onOpenTransportTracking,
  onOpenClinicBooking,
  onOpenOrderNowDirectory,
  onOpenAdd,
  onOpenDelivery,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onOpenCaptainRegister,
  onOpenBookings,
  bookingsCount = 0,
  onOpenMusicBank,
  onOpenAppInstall,
  onOpenOfficialDomain,
  onOpenSettings,
  pendingApprovalsCount = 0,
  lang = 'ar',
}) => {
  const isAr = lang === 'ar';

  const SERVICES = [
    {
      id: 'assistants',
      title: isAr ? 'المساعدين' : 'Assistants',
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : undefined,
      badgeColor: 'bg-amber-500',
      gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
      icon: <ShieldCheck className="w-5 h-5 text-white" />,
      onClick: onOpenAssistantPortal,
    },
    {
      id: 'tracking',
      title: isAr ? 'تتبع السائق' : 'GPS Tracking',
      badge: isAr ? 'مباشر' : 'Live',
      badgeColor: 'bg-emerald-500',
      gradient: 'from-amber-500 via-orange-500 to-yellow-400',
      icon: <Navigation className="w-5 h-5 text-black fill-black" />,
      onClick: onOpenTransportTracking,
    },
    {
      id: 'clinics',
      title: isAr ? 'حجز عيادات' : 'Clinics',
      badge: isAr ? 'متميز' : 'Pro',
      badgeColor: 'bg-cyan-500',
      gradient: 'from-cyan-500 via-teal-500 to-emerald-500',
      icon: <Stethoscope className="w-5 h-5 text-white" />,
      onClick: onOpenClinicBooking,
    },
    {
      id: 'order_now',
      title: isAr ? 'اطلب الآن' : 'Order Now',
      gradient: 'from-amber-400 via-orange-500 to-[#FF2D55]',
      icon: <Zap className="w-5 h-5 text-black fill-black" />,
      onClick: onOpenOrderNowDirectory,
    },
    {
      id: 'add_ad',
      title: isAr ? 'أضف إعلانك' : 'Add Ad',
      badge: isAr ? 'مجاناً' : 'Free',
      badgeColor: 'bg-emerald-500',
      gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
      icon: <Sparkles className="w-5 h-5 text-white" />,
      onClick: onOpenAdd,
    },
    {
      id: 'delivery',
      title: isAr ? 'دليفري خاص' : 'Delivery',
      gradient: 'from-orange-500 via-amber-500 to-red-500',
      icon: <Bike className="w-5 h-5 text-white" />,
      onClick: onOpenDelivery,
    },
    {
      id: 'notifications',
      title: isAr ? 'التنبيهات' : 'Alerts',
      badge: unreadNotificationsCount > 0 ? (unreadNotificationsCount > 9 ? '9+' : `${unreadNotificationsCount}`) : undefined,
      badgeColor: 'bg-[#FF2D55]',
      gradient: 'from-rose-500 via-[#FF2D55] to-pink-600',
      icon: <Bell className="w-5 h-5 text-white" />,
      onClick: onOpenNotifications,
    },
    {
      id: 'captain',
      title: isAr ? 'سائق جديد' : 'New Driver',
      badge: isAr ? '٣ شهور' : '3 Mo',
      badgeColor: 'bg-purple-500',
      gradient: 'from-purple-600 via-violet-600 to-indigo-600',
      icon: <Award className="w-5 h-5 text-white" />,
      onClick: onOpenCaptainRegister,
    },
    {
      id: 'bookings',
      title: isAr ? 'حجوزاتي' : 'Bookings',
      badge: bookingsCount > 0 ? `${bookingsCount}` : undefined,
      badgeColor: 'bg-indigo-500',
      gradient: 'from-indigo-600 via-blue-600 to-purple-600',
      icon: <Calendar className="w-5 h-5 text-white" />,
      onClick: onOpenBookings,
    },
    {
      id: 'music',
      title: isAr ? 'الموسيقى' : 'Music',
      gradient: 'from-fuchsia-600 via-purple-600 to-pink-600',
      icon: <Music className="w-5 h-5 text-white" />,
      onClick: onOpenMusicBank,
    },
    {
      id: 'app_install',
      title: isAr ? 'تحميل' : 'Install',
      gradient: 'from-sky-500 via-blue-600 to-indigo-600',
      icon: <Smartphone className="w-5 h-5 text-white" />,
      onClick: onOpenAppInstall,
    },
    {
      id: 'domain',
      title: 'alasematex',
      gradient: 'from-teal-500 via-emerald-600 to-cyan-600',
      icon: <Globe className="w-5 h-5 text-white" />,
      onClick: onOpenOfficialDomain,
    },
    {
      id: 'settings',
      title: isAr ? 'الإعدادات' : 'Settings',
      gradient: 'from-neutral-700 via-neutral-800 to-neutral-900',
      icon: <FolderCog className="w-5 h-5 text-amber-300" />,
      onClick: onOpenSettings,
    },
  ];

  return (
    <div 
      className="w-full bg-gradient-to-b from-black/95 via-black/85 to-black/70 backdrop-blur-xl border-b border-white/10 select-none py-2 px-2.5 z-30 shrink-0"
      dir="rtl"
    >
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 overflow-x-auto hide-scroll py-1 px-1">
          {SERVICES.map((item) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none transition active:scale-95 cursor-pointer"
              title={item.title}
            >
              {/* Circular Avatar / Badge Icon */}
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr ${item.gradient} shadow-md group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.3)] transition-all duration-200 flex items-center justify-center`}
                >
                  <div className="w-full h-full rounded-full bg-neutral-950/90 flex items-center justify-center backdrop-blur-sm group-hover:bg-neutral-900/60 transition">
                    {item.icon}
                  </div>
                </div>

                {/* Status / Count Badge */}
                {item.badge && (
                  <span
                    className={`absolute -top-1 -end-1 ${item.badgeColor || 'bg-[#FF2D55]'} text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow border border-black`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Title below circle */}
              <span className="text-[10px] font-bold text-white/80 group-hover:text-white transition whitespace-nowrap text-center max-w-[58px] truncate">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
