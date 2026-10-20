/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Shield, Heart, Plus, Bell, X, Mic, Megaphone } from 'lucide-react';
import { Business, CustomerMediaPost, PackageTier, SortOption, SupportedCurrency, SupportedLang, UserProfile, DeliveryOrder, AppNotification } from './types';
import { INITIAL_BUSINESSES } from './data/initialBusinesses';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ReelFeed } from './components/ReelFeed';
import { GridFeed } from './components/GridFeed';
import { BusinessModal } from './components/BusinessModal';
import { AddBusinessModal } from './components/AddBusinessModal';
import { RenewModal } from './components/RenewModal';
import { AdminModal } from './components/AdminModal';
import { CurrencyModal } from './components/CurrencyModal';
import { SubscribersProgramModal } from './components/SubscribersProgramModal';
import { AddCustomerMediaModal } from './components/AddCustomerMediaModal';
import { CustomerPostPlayerModal } from './components/CustomerPostPlayerModal';
import { BookingModal } from './components/BookingModal';
import { SubscriberDashboardModal } from './components/SubscriberDashboardModal';
import { CommentsModal } from './components/CommentsModal';
import { ShareActionSheet } from './components/ShareActionSheet';
import { BottomNav, BottomNavTab } from './components/BottomNav';
import { ChatsModal } from './components/ChatsModal';
import { UserBookingsModal, SavedBooking } from './components/UserBookingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { BusinessDirectDeliveryModal } from './components/BusinessDirectDeliveryModal';
import { FeaturedAdBanner } from './components/FeaturedAdBanner';
import { QuickRegisterUnlistedModal } from './components/QuickRegisterUnlistedModal';
import { TikTokHeader } from './components/TikTokHeader';
import { SettingsFolderModal } from './components/SettingsFolderModal';
import { OwnerLockModal } from './components/OwnerLockModal';
import { AdminEditSubscriberModal } from './components/AdminEditSubscriberModal';
import { BusinessPriceListModal } from './components/BusinessPriceListModal';
import { DeliveryCaptainRegisterModal } from './components/DeliveryCaptainRegisterModal';
import { SecurityWarningNoticeModal } from './components/SecurityWarningNoticeModal';
import { LiveTaxiTransportTrackingModal } from './components/LiveTaxiTransportTrackingModal';
import { AppInstallModal } from './components/AppInstallModal';
import { MusicBankModal } from './components/MusicBankModal';
import { NearbyQuickDispatchModal } from './components/NearbyQuickDispatchModal';
import { OfficialDomainModal } from './components/OfficialDomainModal';
import { OrderNowDirectoryModal } from './components/OrderNowDirectoryModal';
import { MockNotificationsModal } from './components/MockNotificationsModal';
import { AssistantStaffPortalModal } from './components/AssistantStaffPortalModal';
import { SupervisoryAndStaffSettingsModal } from './components/SupervisoryAndStaffSettingsModal';
import { VoiceCommandAssistantModal } from './components/VoiceCommandAssistantModal';
import { GoogleMapsExplorerModal } from './components/GoogleMapsExplorerModal';
import { BusinessSoundtrack } from './types';
import { calculateDistanceKm, getCurrentCoordinates } from './utils/distance';
import { I18N } from './utils/translations';
import { auditBusinessContent } from './utils/contentModeration';

const STORAGE_KEY = 'dalilk_v3';
const LIKES_KEY = 'dalilk_likes';
const LANG_KEY = 'dalilk_lang';
const CURRENCY_KEY = 'dalilk_currency';
const USER_KEY = 'dalilk_user_account';
const ORDERS_KEY = 'dalilk_delivery_orders';
const NOTIF_KEY = 'dalilk_mock_notifications';

export default function App() {
  // Load businesses from localStorage or fallback, merging any newly added INITIAL_BUSINESSES
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Business[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasActive = parsed.some(
            (b: Business) => b.status === 'active' && b.expiry > Date.now()
          );
          if (hasActive) {
            const existingIds = new Set(parsed.map((b) => String(b.id)));
            const missingInitial = INITIAL_BUSINESSES.filter(
              (initBiz) => !existingIds.has(String(initBiz.id))
            );
            return missingInitial.length > 0 ? [...missingInitial, ...parsed] : parsed;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }
    return INITIAL_BUSINESSES;
  });

  // Liked businesses IDs
  const [likedIds, setLikedIds] = useState<Set<number | string>>(() => {
    try {
      const stored = localStorage.getItem(LIKES_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
    return new Set();
  });

  // Language state (7 Languages: ar, en, zh, it, fr, ru, uk)
  const [lang, setLang] = useState<SupportedLang>(() => {
    try {
      const savedLang = localStorage.getItem(LANG_KEY) as SupportedLang;
      if (['ar', 'en', 'zh', 'it', 'fr', 'ru', 'uk'].includes(savedLang)) {
        return savedLang;
      }
    } catch {}
    return 'ar';
  });

  // Currency state (EGP, USD, EUR, SAR, AED, CNY, RUB, UAH, GBP)
  const [currentCurrency, setCurrentCurrency] = useState<SupportedCurrency>(() => {
    try {
      const savedCurr = localStorage.getItem(CURRENCY_KEY) as SupportedCurrency;
      if (['EGP', 'USD', 'EUR', 'SAR', 'AED', 'CNY', 'RUB', 'UAH', 'GBP'].includes(savedCurr)) {
        return savedCurr;
      }
    } catch {}
    return 'EGP';
  });

  // GPS User Location state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Filter & Sorting states
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<'reels' | 'grid'>('reels');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showExpiredOnly, setShowExpiredOnly] = useState<boolean>(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [showForSaleOnly, setShowForSaleOnly] = useState<boolean>(false);

  // Modals
  const [selectedBiz, setSelectedBiz] = useState<Business | null>(null);
  const [selectedBookingBiz, setSelectedBookingBiz] = useState<Business | null>(null);
  const [selectedDashboardBiz, setSelectedDashboardBiz] = useState<Business | null>(null);
  const [selectedCommentsBiz, setSelectedCommentsBiz] = useState<Business | null>(null);
  const [selectedShareBiz, setSelectedShareBiz] = useState<Business | null>(null);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isRenewOpen, setIsRenewOpen] = useState<boolean>(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState<boolean>(false);
  const [isSubscribersProgramOpen, setIsSubscribersProgramOpen] = useState<boolean>(false);
  const [isOfficialDomainOpen, setIsOfficialDomainOpen] = useState<boolean>(false);
  const [isCustomerUploadOpen, setIsCustomerUploadOpen] = useState<boolean>(false);
  const [customerUploadTargetBiz, setCustomerUploadTargetBiz] = useState<Business | null>(null);
  const [activeCustomerPostPlayer, setActiveCustomerPostPlayer] = useState<{
    post: CustomerMediaPost;
    business?: Business | null;
  } | null>(null);
  const [renewTarget, setRenewTarget] = useState<Business | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ownerLockTargetBiz, setOwnerLockTargetBiz] = useState<Business | null>(null);
  const [ownerEditBiz, setOwnerEditBiz] = useState<Business | null>(null);
  const [priceListTargetBiz, setPriceListTargetBiz] = useState<Business | null>(null);
  const [isCaptainRegisterOpen, setIsCaptainRegisterOpen] = useState<boolean>(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState<boolean>(false);
  const [isTransportModalOpen, setIsTransportModalOpen] = useState<boolean>(false);
  const [transportTargetBiz, setTransportTargetBiz] = useState<Business | null>(null);
  const [isAppInstallModalOpen, setIsAppInstallModalOpen] = useState<boolean>(false);

  // Free User Profile (TikTok style account) state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      id: 'usr_guest_e3lanak',
      username: '@ahmed_e3lanak',
      displayName: 'أحمد المصري (متابع إعلانك)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: 'عاشق لمصر واستكشاف أرقى الأماكن السياحية، المطاعم، والخدمات المميزة 🇪🇬✨',
      phone: '01006656669',
      city: 'القاهرة',
      followersCount: 185,
      followingIds: [100, 101, 1], // Following Tanoak, Accountant, Hadramawt
      points: 340,
      walletBalance: 200,
      createdAt: Date.now() - 86400000 * 30,
      isVerified: true,
    };
  });

  // Delivery Orders (Talabat-style in-app delivery) state
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>(() => {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'ord-sample-1',
        orderNumber: 'DLK-7821',
        businessId: 1,
        businessName: 'مطعم حضرموت شيخ المندي الملكي',
        category: 'restaurant',
        items: [
          { name: 'وجبة مندي لحم تيس بلدي فاخر', quantity: 2, estimatedPriceEgp: 380 }
        ],
        pickupAddress: 'شارع الطيران، مدينة نصر، القاهرة',
        deliveryAddress: 'مدينة نصر - الحي السابع - عمارة 14',
        customerName: 'أحمد المصري',
        customerPhone: '01006656669',
        captainName: 'كابتن وليد المصري',
        captainPhone: '01006656669',
        deliveryFeeEgp: 25,
        itemsSubtotalEgp: 760,
        totalEgp: 785,
        paymentMethod: 'cash',
        status: 'delivered',
        statusUpdates: [
          { status: 'received', time: Date.now() - 3600000 * 5, note: 'تم استلام الطلب' },
          { status: 'preparing', time: Date.now() - 3600000 * 4.5, note: 'تم التجهيز' },
          { status: 'delivered', time: Date.now() - 3600000 * 4, note: 'تم التسليم بنجاح' },
        ],
        createdAt: Date.now() - 3600000 * 5,
      }
    ];
  });

  // User Profile & Delivery modals states
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [deliveryTargetBiz, setDeliveryTargetBiz] = useState<Business | null>(null);
  const [activeTrackedOrder, setActiveTrackedOrder] = useState<DeliveryOrder | null>(null);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
  const [isChatsModalOpen, setIsChatsModalOpen] = useState(false);
  const [isSettingsFolderOpen, setIsSettingsFolderOpen] = useState(false);
  const [isMusicBankOpen, setIsMusicBankOpen] = useState(false);
  const [isNearbyDispatchOpen, setIsNearbyDispatchOpen] = useState(false);
  const [isOrderNowDirectoryOpen, setIsOrderNowDirectoryOpen] = useState(false);
  const [activeBankSoundtrack, setActiveBankSoundtrack] = useState<BusinessSoundtrack | undefined>(undefined);
  const [isAssistantPortalOpen, setIsAssistantPortalOpen] = useState(false);
  const [isSupervisoryModalOpen, setIsSupervisoryModalOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomNavTab>('home');

  // Mock Notifications System State (نظام التنبيهات التجريبي لردود التعليقات ومتابعة الدليفري)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isGoogleMapsOpen, setIsGoogleMapsOpen] = useState(false);
  const [mapTargetBiz, setMapTargetBiz] = useState<Business | null>(null);
  const [isGmpQuotaExceeded, setIsGmpQuotaExceeded] = useState(false);
  const [activeNotificationToast, setActiveNotificationToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    const handleQuotaExceeded = () => setIsGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Activate live tracking automatically if URL has ?track= parameter
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const trackParam = params.get('track');
      if (trackParam === 'taxi' || trackParam === 'live') {
        setIsTransportModalOpen(true);
      } else if (trackParam === 'order') {
        setIsDeliveryOpen(true);
      }
    } catch {}
  }, []);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'notif-1',
        type: 'comment_reply',
        title: '💬 رد جديد على تعليقك',
        body: 'قام مطعم حضرموت شيخ المندي الملكي بالرد على تعليقك: شكراً لثقتكم الغالية يا فندم ويسعدنا دائماً خدمتكم! ❤️',
        timestamp: Date.now() - 1000 * 60 * 15,
        read: false,
        businessId: 1,
        businessName: 'مطعم حضرموت شيخ المندي الملكي',
      },
      {
        id: 'notif-2',
        type: 'delivery_update',
        title: '🛵 تحديث حالة طلب دليفري',
        body: 'كابتن وليد المصري استلم طلبك (وجبة مندي لحم تيس بلدي فاخر) وهو الآن في الطريق إليك.',
        timestamp: Date.now() - 1000 * 60 * 45,
        read: false,
        businessId: 1,
        businessName: 'مطعم حضرموت شيخ المندي الملكي',
        orderNumber: 'DLK-7821',
      },
      {
        id: 'notif-3',
        type: 'points_earned',
        title: '🎁 نقاط ولاء جديدة',
        body: 'مبروك! تمت إضافة 50 نقطة ولاء إلى محفظتك لتفاعلك ومتابعتك للأنشطة.',
        timestamp: Date.now() - 1000 * 60 * 120,
        read: true,
      },
      {
        id: 'notif-4',
        type: 'like_received',
        title: '✨ تفاعل جديد على مشاركتك',
        body: 'نال فيديو تجربتك المصور 14 إعجاباً جديداً من زوار التطبيق في تانوك ريزورت.',
        timestamp: Date.now() - 1000 * 60 * 360,
        read: true,
        businessId: 100,
        businessName: 'تانوك ريزورت (Tanoak Hotel)',
      },
    ];
  });

  const saveNotifications = (list: AppNotification[]) => {
    setNotifications(list);
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
    } catch {}
  };

  const handleMarkNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    saveNotifications(updated);
  };

  const handleMarkAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
    showToast('✓ تم تحديد كافة الإشعارات كمقروءة');
  };

  const handleClearAllNotifications = () => {
    saveNotifications([]);
    showToast('🗑️ تم مسح كافة الإشعارات');
  };

  const handleSimulateCommentReply = () => {
    const target = selectedBiz || businesses[0] || { id: 1, name: 'مطعم حضرموت شيخ المندي الملكي' };
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'comment_reply',
      title: '💬 رد جديد على تعليقك',
      body: `رد مدير ${target.name}: "أهلاً بك يا فندم! يسعدنا دائماً تقديم أفضل تجربة لك، وننتظر زيارتك القادمة بكل سرور 🌟❤️"`,
      timestamp: Date.now(),
      read: false,
      businessId: target.id,
      businessName: target.name,
    };
    saveNotifications([newNotif, ...notifications]);
    setActiveNotificationToast(newNotif);
    setTimeout(() => setActiveNotificationToast(null), 5000);
  };

  const handleSimulateDeliveryUpdate = () => {
    const currentOrder = deliveryOrders[0];
    const orderNum = currentOrder?.orderNumber || 'DLK-7821';
    const bizName = currentOrder?.businessName || 'مطعم حضرموت شيخ المندي';
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'delivery_update',
      title: '🛵 تحديث حالة طلب دليفري',
      body: `تحديث لطلبك ${orderNum}: كابتن التوصيل وصل بالقرب من موقعك، يرجى الاستعداد للاستلام ودفع القيمة كاش! 🛵`,
      timestamp: Date.now(),
      read: false,
      businessId: currentOrder?.businessId || 1,
      businessName: bizName,
      orderNumber: orderNum,
    };
    saveNotifications([newNotif, ...notifications]);
    setActiveNotificationToast(newNotif);
    setTimeout(() => setActiveNotificationToast(null), 5000);
  };

  // User Bookings state (حجوزاتي الفندقية والسياحية المرتبطة بكل مشترك)
  const [userBookings, setUserBookings] = useState<SavedBooking[]>(() => {
    try {
      const saved = localStorage.getItem('e3lanak_my_bookings') || localStorage.getItem('dalilk_my_bookings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [
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
  });

  const handleDeleteBooking = (ref: string) => {
    setUserBookings((prev) => {
      const updated = prev.filter((b) => b.ref !== ref);
      try {
        localStorage.setItem('e3lanak_my_bookings', JSON.stringify(updated));
        localStorage.setItem('dalilk_my_bookings', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showToast('🗑️ تم إلغاء وحذف الحجز بنجاح.');
  };

  const handleBookingSuccess = (newBooking: SavedBooking) => {
    setUserBookings((prev) => {
      const updated = [newBooking, ...prev.filter((b) => b.ref !== newBooking.ref)];
      try {
        localStorage.setItem('e3lanak_my_bookings', JSON.stringify(updated));
        localStorage.setItem('dalilk_my_bookings', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
    } catch {}
    showToast('✨ تم حفظ وتحديث بيانات حسابك المجاني بنجاح!');
  };

  const toggleFollowBusiness = (bizId: string | number) => {
    setUserProfile((prev) => {
      const isFollowing = prev.followingIds.includes(bizId);
      const nextIds = isFollowing
        ? prev.followingIds.filter((id) => id !== bizId)
        : [...prev.followingIds, bizId];
      const updated = {
        ...prev,
        followingIds: nextIds,
        points: isFollowing ? prev.points : prev.points + 10,
      };
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
      } catch {}
      showToast(isFollowing ? 'تم إلغاء المتابعة' : '🎉 تم متابعة النشاط بنجاح وكسبت 10 نقاط ولاء!');
      return updated;
    });
  };

  const handlePlaceDeliveryOrder = (order: DeliveryOrder) => {
    const updated = [order, ...deliveryOrders];
    setDeliveryOrders(updated);
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    } catch {}
    // Award 50 points on every delivery order!
    setUserProfile((prev) => {
      const next = { ...prev, points: prev.points + 50 };
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`🛵 تم إرسال طلبك ${order.orderNumber} بنجاح وجاري المتابعة الفورية!`);
  };

  const handleOpenDelivery = (targetBiz?: Business | null) => {
    const effectiveBiz =
      targetBiz ||
      businesses.find((b) => b.hasDelivery || b.deliveryInfo?.available) ||
      businesses[0];
    setDeliveryTargetBiz(effectiveBiz);
    setActiveTrackedOrder(null);
    setIsDeliveryOpen(true);
  };

  const handleOpenOrderTracker = (order: DeliveryOrder) => {
    setActiveTrackedOrder(order);
    setIsDeliveryOpen(true);
  };

  const handleOpenTransportTracking = (targetBiz?: Business | null) => {
    setTransportTargetBiz(targetBiz || null);
    setIsTransportModalOpen(true);
  };

  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);

  const handleRegisterUnlistedBusiness = (biz: Business, message: string) => {
    const updated = [biz, ...businesses];
    saveBusinesses(updated);
    // Award 100 loyalty points to the customer for adding a new local place!
    setUserProfile((prev) => {
      const next = { ...prev, points: prev.points + 100 };
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('🎉 يسعدنا استضافتك لزياده مبيعاتك وشهرتك ونتمني ان تسجل معنا علي طول ونتمني نكون في خدمتك لتحقيق النجاح');
  };

  const t = I18N[lang];

  // Sync businesses to localStorage
  const saveBusinesses = (list: Business[]) => {
    setBusinesses(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  const handleAddCustomerPost = (post: CustomerMediaPost, targetBusinessId?: string | number) => {
    const bizId = targetBusinessId || post.businessId;
    const updated = businesses.map((b) => {
      if (b.id === bizId) {
        const existing = b.customerPosts || [];
        return {
          ...b,
          customerPosts: [post, ...existing],
        };
      }
      return b;
    });
    saveBusinesses(updated);
    if (selectedBiz && selectedBiz.id === bizId) {
      setSelectedBiz({
        ...selectedBiz,
        customerPosts: [post, ...(selectedBiz.customerPosts || [])],
      });
    }
    showToast(lang === 'ar' ? 'تم نشر فيديو وتجربة العميل مع الكتابة المتحركة بنجاح! 🚀🎬' : 'Media with animated text published successfully! 🚀🎬');
  };

  const handleSelectLang = (newLang: SupportedLang) => {
    setLang(newLang);
    try {
      localStorage.setItem(LANG_KEY, newLang);
    } catch {}
  };

  const handleSelectCurrency = (newCurr: SupportedCurrency) => {
    setCurrentCurrency(newCurr);
    try {
      localStorage.setItem(CURRENCY_KEY, newCurr);
    } catch {}
    setIsCurrencyModalOpen(false);
    showToast(lang === 'ar' ? `تم تغيير عملة العرض إلى ${newCurr}` : `Display currency changed to ${newCurr}`);
  };

  // Sync likes to localStorage
  const toggleLike = (id: number | string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem(LIKES_KEY, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Interactive 1-5 Star Rating update handler for public business cards
  const handleRateBusiness = (bizId: number | string, newRating: number, newCount: number) => {
    const updated = businesses.map((b) => {
      if (b.id === bizId) {
        return {
          ...b,
          rating: newRating,
          ratingCount: newCount,
        };
      }
      return b;
    });
    saveBusinesses(updated);
    if (selectedBiz && selectedBiz.id === bizId) {
      setSelectedBiz({
        ...selectedBiz,
        rating: newRating,
        ratingCount: newCount,
      });
    }
    showToast(lang === 'ar' ? `⭐ شكراً لتقييمك! تم تحديث تقييم النشاط إلى ${newRating.toFixed(1)} / 5` : `⭐ Thank you! Business rating updated to ${newRating.toFixed(1)} / 5`);
  };

  // Detect GPS User Geolocation in seconds
  const handleDetectLocation = useCallback(async () => {
    setIsLocating(true);
    try {
      const coords = await getCurrentCoordinates();
      setUserCoords(coords);
      setSortBy('nearest');
      showToast(lang === 'ar' ? '📍 تم تحديد موقعك في ثوانٍ وعرض الأقرب لك فوراً!' : 'Location detected in seconds! Nearest listings displayed.');
    } catch (err) {
      console.warn('GPS detection failed, fallback to Cairo center:', err);
      // Fallback Cairo center coordinates for simulation
      setUserCoords({ lat: 30.0444, lng: 31.2357 });
      setSortBy('nearest');
      showToast(lang === 'ar' ? '📍 تم تحديد موقعك (القاهرة) وعرض الأقرب لك فوراً!' : 'Location set to Cairo! Showing nearest places.');
    } finally {
      setIsLocating(false);
    }
  }, [lang]);

  // Auto-detect GPS location on app launch / open for iPads, mobiles, tablets, and computers
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDetectLocation();
    }, 600);
    return () => clearTimeout(timer);
  }, [handleDetectLocation]);

  // Check for expired businesses every 15s (90-day countdown expiration engine)
  useEffect(() => {
    const timer = setInterval(() => {
      let changed = false;
      const now = Date.now();
      const updated = businesses.map((b) => {
        if (b.status === 'active' && b.expiry < now) {
          changed = true;
          return { ...b, status: 'expired' as const };
        }
        return b;
      });

      if (changed) {
        saveBusinesses(updated);
      }
    }, 15000);

    return () => clearInterval(timer);
  }, [businesses]);

  // Language direction updater
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Filter & Sort pipeline for public feeds
  const expiredCount = useMemo(() => {
    const now = Date.now();
    return businesses.filter((b) => b.status === 'expired' || b.expiry < now).length;
  }, [businesses]);

  const visibleBusinesses = useMemo(() => {
    const now = Date.now();
    const query = searchQuery.trim().toLowerCase();

    // 1. Filter
    const filtered = businesses.filter((b) => {
      // Automatic Content Moderation halt: stop display of inappropriate, abusive, or political ads
      if (b.status === 'hidden' || b.status === 'flagged') return false;
      if (b.moderationStatus === 'hidden_by_admin' || b.moderationStatus === 'suspended' || b.isBannedByAdmin) return false;
      const moderationCheck = auditBusinessContent(b);
      if (!moderationCheck.isValid) return false;

      const isExpired = b.status === 'expired' || b.expiry < now;

      // When showExpiredOnly is true, only show expired listings
      if (showExpiredOnly) {
        if (!isExpired) return false;
      } else {
        // By default, hide expired listings
        if (isExpired) return false;
      }

      // Favorites tab filter
      if (showFavoritesOnly) {
        if (!likedIds.has(b.id)) return false;
      }

      // For Sale tab filter (معروض للبيع دون مستندات)
      if (showForSaleOnly) {
        if (!b.forSaleItem?.isForSale) return false;
      }

      // Category filter (bypassed when searching by subscriber name or general query so every subscriber & activity is found)
      if (!query && selectedCategory !== 'الكل' && b.cat !== selectedCategory) {
        return false;
      }

      // Subcategory filter (تضييق البحث بالتصنيفات الفرعية)
      if (!query && selectedSubCategory) {
        const matchesSub = (b.subCat && b.subCat.includes(selectedSubCategory)) ||
          b.bio.includes(selectedSubCategory) ||
          b.name.includes(selectedSubCategory) ||
          b.services?.some((s) => s.n.includes(selectedSubCategory));
        if (!matchesSub) return false;
      }

      // City filter
      if (!query && selectedCity && b.city !== selectedCity) {
        return false;
      }

      // Deep search: any registered subscriber name, every activity (cat/subCat), city, addr, bio, services, phones
      if (query) {
        const cleanQ = query
          .replace(/عايز اي مشترك اسمه مسجل|عايز مشترك اسمه|عايز مشترك|مشترك اسمه|مشترك|ابحث عن كل نشاط|البحث عن كل نشاط|ابحث عن|بحث عن|عايز|اريد|افتح/g, '')
          .trim();

        if (!cleanQ || query.includes('كل نشاط') || query.includes('كل الأنشطة')) {
          return true;
        }

        // Special keyword matching: free ads, 3 months free, medical/clinics/hospitals/pharmacies/physio, auto electrician, car showroom, chalets, tourism, import/export
        const isFreeKeywordSearch = cleanQ.includes('مجانا') || cleanQ.includes('مجاني') || cleanQ.includes('free');
        const isThreeMonthsSearch = cleanQ.includes('3 شهور') || cleanQ.includes('٣ شهور');
        const isTaxiKeywordSearch = cleanQ.includes('تاكسي') || cleanQ.includes('اجرة') || cleanQ.includes('أجرة') || cleanQ.includes('موتوسيكل') || cleanQ.includes('دليفري');
        const isClinicKeywordSearch =
          cleanQ.includes('حجز العيادات والمستشفيات') ||
          cleanQ.includes('عياد') ||
          cleanQ.includes('مستشف') ||
          cleanQ.includes('صيدلي') ||
          cleanQ.includes('طبيب') ||
          cleanQ.includes('دكتور') ||
          cleanQ.includes('علاج طبيعي');
        const isAutoElectricianSearch = cleanQ.includes('كهربائي') || cleanQ.includes('صيانة سيارات') || cleanQ.includes('صيانه سيارات');
        const isCarShowroomSearch = cleanQ.includes('معرض سيارات') || cleanQ.includes('معرض سيارت');
        const isChaletsTripsSearch = cleanQ.includes('رحلات وشاليهات') || cleanQ.includes('شاليه');
        const isTourismCompanySearch = cleanQ.includes('شركات سياحة') || cleanQ.includes('شركات سياحه') || cleanQ.includes('شركة سياحة');
        const isImportExportSearch = cleanQ.includes('استيراد وتصدير') || cleanQ.includes('شركات استيراد');
        const isRealEstateSearch = cleanQ.includes('شقق') || cleanQ.includes('محلات') || cleanQ.includes('مولات') || cleanQ.includes('فلل') || cleanQ.includes('عقار');

        if (isFreeKeywordSearch && (b.pkg === 0 || b.expiry > now || b.bio?.includes('مجانا') || b.name?.includes('مجانا'))) {
          return true;
        }

        if (isThreeMonthsSearch && (b.expiry > now || b.bio?.includes('شهور') || b.name?.includes('شهور'))) {
          return true;
        }

        if (isTaxiKeywordSearch && (b.cat?.includes('تاكسي') || b.cat?.includes('أجرة') || b.cat?.includes('موتوسيكل') || b.trackingCell?.enabled)) {
          return true;
        }

        if (
          isClinicKeywordSearch &&
          (b.cat?.includes('عيادات') ||
            b.cat?.includes('أطباء') ||
            b.cat?.includes('صيدليات') ||
            b.cat?.includes('مستشفيات') ||
            b.cat?.includes('علاج طبيعي') ||
            b.bio?.includes('عياد') ||
            b.bio?.includes('طبيب') ||
            b.bio?.includes('مستشف') ||
            b.bio?.includes('صيدلي') ||
            b.bio?.includes('علاج طبيعي'))
        ) {
          return true;
        }

        if (isAutoElectricianSearch && (b.cat?.includes('كهربائي') || b.cat?.includes('صيانة') || b.bio?.includes('كهربائي') || b.name?.includes('كهربائي'))) {
          return true;
        }

        if (isCarShowroomSearch && (b.cat?.includes('معرض سيارات') || b.cat?.includes('سيارات') || b.name?.includes('معرض'))) {
          return true;
        }

        if (isChaletsTripsSearch && (b.cat?.includes('رحلات وشاليهات') || b.cat?.includes('فنادق') || b.bio?.includes('شاليه'))) {
          return true;
        }

        if (isTourismCompanySearch && (b.cat?.includes('سياحة') || b.bio?.includes('سياحة'))) {
          return true;
        }

        if (isImportExportSearch && (b.cat?.includes('استيراد وتصدير') || b.cat?.includes('شركات') || b.bio?.includes('استيراد'))) {
          return true;
        }

        if (isRealEstateSearch && (b.cat?.includes('للبيع') || b.cat?.includes('عقارات') || b.forSaleItem?.isForSale || b.bio?.includes('شقق') || b.bio?.includes('محلات') || b.bio?.includes('فلل'))) {
          return true;
        }

        const servicesText = b.services?.map((s) => s.n).join(' ') || '';
        const phonesText = (b.phones || [b.phone]).join(' ');
        const googleKeywords = [...(b.googleKeywords || []), ...(b.googleSearchKeywords || [])].join(' ');
        const fullText = `${b.name} ${b.cat} ${b.subCat || ''} ${b.city} ${b.addr} ${b.bio} ${servicesText} ${phonesText} ${googleKeywords} ${b.vehiclePlateNumber || ''}`.toLowerCase();
        if (!fullText.includes(cleanQ) && !fullText.includes(query)) return false;
      }

      return true;
    });

    // 2. Attach distance from user satellite coords (or fallback city coords when nearest sort is active)
    const refCoords = userCoords || (sortBy === 'nearest' ? { lat: 30.0444, lng: 31.2357 } : null);
    const withDistance = filtered.map((b) => {
      if (refCoords && b.lat && b.lng) {
        const d = calculateDistanceKm(refCoords.lat, refCoords.lng, b.lat, b.lng);
        return { ...b, distanceKm: d };
      }
      return b;
    });

    // 3. Sort
    withDistance.sort((a, b) => {
      // Nearest to user location
      if (sortBy === 'nearest') {
        const distA = a.distanceKm !== undefined ? a.distanceKm : 99999;
        const distB = b.distanceKm !== undefined ? b.distanceKm : 99999;
        return distA - distB;
      }

      // Most Trusted (Verified & high tier packages first)
      if (sortBy === 'trusted') {
        if (b.verified !== a.verified) {
          return b.verified - a.verified;
        }
        return (b.pkg || 0) - (a.pkg || 0);
      }

      // Most Popular (Likes & engagement)
      if (sortBy === 'popular') {
        return (b.likes || 0) - (a.likes || 0);
      }

      // Default: Sponsored / Google Ads & VIP first, then newest
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;
      if ((b.pkg || 0) !== (a.pkg || 0)) {
        return (b.pkg || 0) - (a.pkg || 0);
      }
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    return withDistance;
  }, [
    businesses,
    selectedCategory,
    selectedSubCategory,
    selectedCity,
    searchQuery,
    showExpiredOnly,
    showFavoritesOnly,
    showForSaleOnly,
    likedIds,
    userCoords,
    sortBy,
  ]);

  const forSaleCount = useMemo(() => {
    return businesses.filter((b) => b.forSaleItem?.isForSale).length;
  }, [businesses]);

  // Handlers
  const handleAddBusiness = (newBiz: Business) => {
    const cleanNewPhone = (newBiz.phone || '').replace(/\D/g, '');
    if (cleanNewPhone) {
      const duplicateBiz = businesses.find((b) => {
        const bPhones = [b.phone, b.whatsapp, ...(b.phones || [])]
          .filter(Boolean)
          .map((p) => p!.replace(/\D/g, ''));
        return bPhones.includes(cleanNewPhone);
      });
      if (duplicateBiz) {
        showToast(`⚠️ تنبيه عدم التكرار: رقم الهاتف (${newBiz.phone}) مسجل مسبقاً باسم "${duplicateBiz.name}". لا يُسمح بتكرار رقم الهاتف!`);
        return;
      }
    }

    const updated = [newBiz, ...businesses];
    saveBusinesses(updated);

    // إضافة تنبيه للمشترك الجديد للأدمن والمساعدين والمشترك
    const newSubAlert = {
      id: `notif_new_sub_${Date.now()}`,
      type: 'new_subscriber' as const,
      title: `🎉 تنبيه مشترك جديد: ${newBiz.name}`,
      message: `تم تسجيل مشترك جديد (${newBiz.name} - ${newBiz.cat} - ${newBiz.city}) برقم هاتف ${newBiz.phone}. جاري المتابعة والمراجعة من الأدمن والمساعدين.`,
      timestamp: Date.now(),
      read: false,
      businessId: newBiz.id,
      businessName: newBiz.name,
      icon: '🆕',
    };
    setNotifications((prev) => {
      const next = [newSubAlert, ...prev];
      try {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    showToast(
      lang === 'ar'
        ? `🎉 تنبيه مشترك جديد: تم نشر (${newBiz.name}) بنجاح لمدة 90 يوم مجاناً وإشعار الإدارة والمساعدين!`
        : '🎉 New subscriber alert: Business listing published with 90 days free!'
    );
  };

  const handleRenew = (bizId: number | string, pkg: PackageTier) => {
    const updated = businesses.map((b) => {
      if (b.id === bizId) {
        return {
          ...b,
          expiry: Date.now() + 90 * 86400000,
          status: 'active' as const,
          pkg: pkg,
          verified: pkg >= 399 ? 1 : b.verified,
          isSponsored: pkg === 799 ? true : b.isSponsored,
        };
      }
      return b;
    });

    saveBusinesses(updated);
    setIsRenewOpen(false);
    if (selectedBiz && selectedBiz.id === bizId) {
      setSelectedBiz(updated.find((x) => x.id === bizId) || null);
    }
    showToast(
      lang === 'ar'
        ? `✅ تم تجديد الاشتراك بنجاح لمدة 90 يوم إضافية!`
        : `✅ Subscription renewed successfully for 90 days!`
    );
  };

  const handleResetData = () => {
    if (
      window.confirm(
        lang === 'ar'
          ? 'هل تريد استعادة البيانات الافتراضية؟'
          : 'Restore default sample listings?'
      )
    ) {
      saveBusinesses(INITIAL_BUSINESSES);
      showToast(lang === 'ar' ? 'تمت استعادة البيانات' : 'Data reset to defaults');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Universal helper to close any currently open page or modal ("غلق كل صفحه علامه اكس او غلق")
  const isAnyPageOpen = Boolean(
    selectedBiz ||
    selectedBookingBiz ||
    selectedDashboardBiz ||
    selectedCommentsBiz ||
    selectedShareBiz ||
    isCurrencyModalOpen ||
    isAddOpen ||
    isOfficialDomainOpen ||
    isSubscribersProgramOpen ||
    isRenewOpen ||
    isAdminOpen ||
    isAssistantPortalOpen ||
    isCustomerUploadOpen ||
    activeCustomerPostPlayer ||
    isUserProfileOpen ||
    isDeliveryOpen ||
    isQuickRegisterOpen ||
    ownerLockTargetBiz ||
    ownerEditBiz ||
    isBookingsModalOpen ||
    priceListTargetBiz ||
    isCaptainRegisterOpen ||
    isWarningModalOpen ||
    isChatsModalOpen ||
    isSettingsFolderOpen ||
    isTransportModalOpen ||
    isNearbyDispatchOpen ||
    isAppInstallModalOpen ||
    isMusicBankOpen ||
    isOrderNowDirectoryOpen ||
    isNotificationsOpen ||
    isGoogleMapsOpen ||
    isSupervisoryModalOpen ||
    showFavoritesOnly ||
    showForSaleOnly
  );

  const handleCloseAllPages = () => {
    setSelectedBiz(null);
    setSelectedBookingBiz(null);
    setSelectedDashboardBiz(null);
    setSelectedCommentsBiz(null);
    setSelectedShareBiz(null);
    setIsCurrencyModalOpen(false);
    setIsAddOpen(false);
    setIsOfficialDomainOpen(false);
    setIsSubscribersProgramOpen(false);
    setIsRenewOpen(false);
    setIsAdminOpen(false);
    setIsAssistantPortalOpen(false);
    setIsCustomerUploadOpen(false);
    setActiveCustomerPostPlayer(null);
    setIsUserProfileOpen(false);
    setIsDeliveryOpen(false);
    setIsQuickRegisterOpen(false);
    setOwnerLockTargetBiz(null);
    setOwnerEditBiz(null);
    setIsBookingsModalOpen(false);
    setPriceListTargetBiz(null);
    setIsCaptainRegisterOpen(false);
    setIsWarningModalOpen(false);
    setIsChatsModalOpen(false);
    setIsSettingsFolderOpen(false);
    setIsTransportModalOpen(false);
    setIsNearbyDispatchOpen(false);
    setIsAppInstallModalOpen(false);
    setIsMusicBankOpen(false);
    setIsOrderNowDirectoryOpen(false);
    setIsNotificationsOpen(false);
    setIsGoogleMapsOpen(false);
    setIsSupervisoryModalOpen(false);
    setShowFavoritesOnly(false);
    setShowForSaleOnly(false);
    setActiveBottomTab('home');
  };

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
      language="ar"
      region="EG"
      libraries={['marker']}
    >
      {isGmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      <div className="w-full h-[100dvh] bg-[#08080c] flex items-center justify-center overflow-hidden select-none">
      <div className="w-[90%] h-[90dvh] max-w-[90%] max-h-[90dvh] flex flex-col bg-black text-white overflow-hidden relative select-none rounded-2xl border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.9)] transform-gpu">
          {/* Active Mock Notification Real-Time Toast Banner */}
      {activeNotificationToast && (
        <div 
          onClick={() => {
            if (activeNotificationToast.type === 'comment_reply' && activeNotificationToast.businessId) {
              const found = businesses.find((b) => b.id === activeNotificationToast.businessId);
              if (found) setSelectedCommentsBiz(found);
            } else if (activeNotificationToast.type === 'delivery_update') {
              const order = deliveryOrders.find((o) => o.orderNumber === activeNotificationToast.orderNumber) || deliveryOrders[0];
              if (order) handleOpenOrderTracker(order);
              else handleOpenDelivery();
            } else {
              setIsNotificationsOpen(true);
            }
            setActiveNotificationToast(null);
          }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[90] max-w-sm w-[92%] bg-neutral-900/95 backdrop-blur-xl border border-[#FF2D55] text-white p-3 rounded-2xl shadow-2xl shadow-[#FF2D55]/30 flex items-center gap-3 cursor-pointer animate-in slide-in-from-top-4 duration-300"
          dir="rtl"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FF2D55]/20 text-[#FF2D55] flex items-center justify-center shrink-0 border border-[#FF2D55]/30">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h5 className="font-black text-xs text-white truncate">{activeNotificationToast.title}</h5>
              <span className="text-[10px] text-amber-400 font-mono">الآن</span>
            </div>
            <p className="text-[11px] text-white/80 truncate mt-0.5">{activeNotificationToast.body}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setActiveNotificationToast(null);
            }}
            className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[80] bg-neutral-900 border border-[#FF2D55] text-white px-5 py-2.5 rounded-full text-xs font-black shadow-2xl shadow-[#FF2D55]/30 animate-bounce flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar: Floating Translucent TikTokHeader when in reels mode, or classic header when in grid mode */}
      {viewMode === 'reels' ? (
        <TikTokHeader
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSelectedSubCategory('');
          }}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          selectedSubCategory={selectedSubCategory}
          onSelectSubCategory={setSelectedSubCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSelectSortBy={setSortBy}
          viewMode={viewMode}
          onToggleView={() => setViewMode('grid')}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={() => setShowFavoritesOnly((prev) => !prev)}
          favoritesCount={likedIds.size}
          showForSaleOnly={showForSaleOnly}
          onToggleForSale={() => {
            setShowForSaleOnly((prev) => !prev);
            if (!showForSaleOnly) setShowFavoritesOnly(false);
          }}
          onDetectLocation={handleDetectLocation}
          hasUserLocation={userCoords !== null}
          isLocating={isLocating}
          currentCurrency={currentCurrency}
          onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
          lang={lang}
          onSelectLang={handleSelectLang}
          userPoints={userProfile.points}
          onOpenSettings={() => setIsSettingsFolderOpen(true)}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onOpenCaptainRegister={() => setIsCaptainRegisterOpen(true)}
          onOpenMusicBank={() => {
            setActiveBankSoundtrack(undefined);
            setIsMusicBankOpen(true);
          }}
          onOpenNearbyDispatch={() => setIsNearbyDispatchOpen(true)}
          onOpenTransportTracking={() => handleOpenTransportTracking()}
          onOpenAppInstall={() => setIsAppInstallModalOpen(true)}
          onOpenSecurityNotice={() => setIsWarningModalOpen(true)}
          onOpenAdd={() => setIsAddOpen(true)}
          onOpenOfficialDomain={() => setIsOfficialDomainOpen(true)}
          onOpenDelivery={() => handleOpenDelivery()}
          onOpenOrderNowDirectory={() => setIsOrderNowDirectoryOpen(true)}
          onOpenAssistantPortal={() => setIsSupervisoryModalOpen(true)}
          onOpenSupervisory={() => setIsSupervisoryModalOpen(true)}
          onOpenPriceDisplay={() => setIsOrderNowDirectoryOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotificationsCount={notifications.filter((n) => !n.read).length}
          onOpenDashboard={() => {
            if (businesses.length > 0) setSelectedDashboardBiz(businesses[0]);
          }}
          onOpenGoogleMaps={() => setIsGoogleMapsOpen(true)}
          onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
          onOpenBooking={(b) => {
            const target =
              b ||
              businesses.find(
                (item) =>
                  item.cat.includes('أطباء') ||
                  item.cat.includes('عياد') ||
                  item.cat.includes('مستشف') ||
                  item.cat.includes('صيدلي') ||
                  item.cat.includes('علاج طبيعي')
              ) ||
              businesses[0];
            if (target) setSelectedBookingBiz(target);
          }}
          businesses={businesses}
          onOpenBiz={(b) => setSelectedBiz(b)}
        />
      ) : (
        <>
          <Header
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            lang={lang}
            onSelectLang={handleSelectLang}
            currentCurrency={currentCurrency}
            onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
            onDetectLocation={handleDetectLocation}
            isLocating={isLocating}
            hasUserLocation={userCoords !== null}
            onOpenAdd={() => setIsAddOpen(true)}
            onOpenOfficialDomain={() => setIsOfficialDomainOpen(true)}
            onOpenDelivery={() => handleOpenDelivery()}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenSubscribersProgram={() => setIsSubscribersProgramOpen(true)}
            onOpenCaptainRegister={() => setIsCaptainRegisterOpen(true)}
            onOpenCustomerUpload={() => {
              setCustomerUploadTargetBiz(null);
              setIsCustomerUploadOpen(true);
            }}
            onOpenTransportTracking={() => handleOpenTransportTracking()}
            onOpenAppInstall={() => setIsAppInstallModalOpen(true)}
            onOpenSecurityNotice={() => setIsWarningModalOpen(true)}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            viewMode={viewMode}
          />

          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedCity={selectedCity}
            sortBy={sortBy}
            onSelectSortBy={setSortBy}
            viewMode={viewMode}
            onToggleView={() => setViewMode('reels')}
            showExpiredOnly={showExpiredOnly}
            onToggleShowExpired={() => setShowExpiredOnly((prev) => !prev)}
            expiredCount={expiredCount}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavorites={() => setShowFavoritesOnly((prev) => !prev)}
            favoritesCount={likedIds.size}
            selectedSubCategory={selectedSubCategory}
            onSelectSubCategory={(sub) => setSelectedSubCategory(sub)}
            showForSaleOnly={showForSaleOnly}
            onToggleForSale={() => {
              setShowForSaleOnly((prev) => !prev);
              if (!showForSaleOnly) setShowFavoritesOnly(false);
            }}
            forSaleCount={forSaleCount}
            onOpenSubscribersProgram={() => setIsSubscribersProgramOpen(true)}
            onOpenCustomerUpload={() => {
              setCustomerUploadTargetBiz(null);
              setIsCustomerUploadOpen(true);
            }}
            onOpenTransportModal={() => handleOpenTransportTracking()}
            onDetectLocation={handleDetectLocation}
            lang={lang}
          />
        </>
      )}

      {/* Main Visual Display (Reels) */}
      <main className="flex-1 min-h-0 relative overflow-hidden bg-black w-full">
        {showFavoritesOnly && visibleBusinesses.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white space-y-4 max-w-md mx-auto" dir="rtl">
            <div className="w-16 h-16 rounded-full bg-[#FF2D55]/20 border border-[#FF2D55]/40 flex items-center justify-center text-[#FF2D55] animate-pulse">
              <Heart className="w-8 h-8 fill-[#FF2D55]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-lg text-white">قائمة الأماكن المفضلة فارغة حالياً</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                لم تقم بإضافة أي مكان إلى المفضلة بعد. اضغط على زر القلب ❤️ في أي ريل أو إعلان لحفظ أماكنك المختارة والوصول إليها هنا بنقرة واحدة!
              </p>
            </div>
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className="bg-gradient-to-r from-[#FF2D55] to-rose-600 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-lg shadow-[#FF2D55]/30 transition active:scale-95 cursor-pointer"
            >
              استكشف الأماكن والريلز الآن 🌟
            </button>
          </div>
        ) : (
          <ReelFeed
            businesses={visibleBusinesses}
            onOpenBiz={(b) => setSelectedBiz(b)}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            onToggleLike={toggleLike}
            likedIds={likedIds}
            currentCurrency={currentCurrency}
            lang={lang}
            onOpenCustomerUpload={(b) => {
              setCustomerUploadTargetBiz(b);
              setIsCustomerUploadOpen(true);
            }}
            onOpenCustomerPost={(post, b) => {
              setActiveCustomerPostPlayer({ post, business: b });
            }}
            onOpenBooking={(b) => setSelectedBookingBiz(b)}
            onOpenDelivery={(b) => handleOpenDelivery(b)}
            userFollowingIds={userProfile.followingIds}
            onToggleFollow={toggleFollowBusiness}
            onOpenDashboard={(b) => setSelectedDashboardBiz(b)}
            onOpenComments={(b) => setSelectedCommentsBiz(b)}
            onOpenShareActionSheet={(b) => setSelectedShareBiz(b)}
            onOpenOwnerLock={(b) => setOwnerLockTargetBiz(b)}
            onOpenPriceList={(b) => setPriceListTargetBiz(b)}
            onOpenMusicBank={(st) => {
              setActiveBankSoundtrack(st);
              setIsMusicBankOpen(true);
            }}
            onOpenTransportModal={(b) => handleOpenTransportTracking(b)}
            onOpenGoogleMaps={(b) => {
              if (b) setMapTargetBiz(b);
              setIsGoogleMapsOpen(true);
            }}
            onRateBusiness={handleRateBusiness}
          />
        )}
      </main>

      {/* Pinned Bottom Navigation Bar directly below main so الرئيسية, انشر الآن, الميك, الخريطة are always visible */}
      <BottomNav
        activeTab={activeBottomTab}
        onSelectTab={(tab) => {
          setActiveBottomTab(tab);
          if (tab === 'home') {
            setViewMode('reels');
            setSelectedCategory('الكل');
            setSelectedCity('');
            setShowFavoritesOnly(false);
            setShowExpiredOnly(false);
          } else if (tab === 'favorites') {
            setShowFavoritesOnly(true);
            setShowForSaleOnly(false);
          } else if (tab === 'delivery') {
            handleOpenDelivery();
          } else if (tab === 'settings') {
            setIsSettingsFolderOpen(true);
          } else if (tab === 'profile') {
            if (businesses.length > 0) setSelectedDashboardBiz(businesses[0]);
          } else if (tab === 'add') {
            setIsAddOpen(true);
          }
        }}
        onOpenAdd={() => setIsAddOpen(true)}
        onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
        onOpenDelivery={() => handleOpenDelivery()}
        onOpenSettings={() => setIsSettingsFolderOpen(true)}
        onOpenSupervisory={() => setIsSupervisoryModalOpen(true)}
        onOpenGoogleMaps={() => setIsGoogleMapsOpen(true)}
        lang={lang}
        favoritesCount={likedIds.size}
      />

      {/* Detailed Business Profile Sheet/Modal */}
      {selectedBiz && (
        <BusinessModal
          business={selectedBiz}
          onClose={() => setSelectedBiz(null)}
          onOpenRenew={() => {
            setRenewTarget(selectedBiz);
            setIsRenewOpen(true);
          }}
          onUpdateBusiness={(updatedBiz) => {
            const updated = businesses.map((b) => (b.id === updatedBiz.id ? updatedBiz : b));
            saveBusinesses(updated);
            setSelectedBiz(updatedBiz);
          }}
          onOpenBooking={(b) => setSelectedBookingBiz(b)}
          onOpenDelivery={(b) => handleOpenDelivery(b)}
          onOpenOwnerLock={(b) => setOwnerLockTargetBiz(b)}
          onOpenOwnerEdit={(b) => setOwnerEditBiz(b)}
          onOpenPriceList={(b) => setPriceListTargetBiz(b)}
          onOpenTransportTracking={(b) => handleOpenTransportTracking(b)}
          onOpenSecurityNotice={() => setIsWarningModalOpen(true)}
          isFollowed={userProfile.followingIds.includes(selectedBiz.id)}
          onToggleFollow={toggleFollowBusiness}
          currentCurrency={currentCurrency}
          lang={lang}
          onRateBusiness={handleRateBusiness}
        />
      )}

      {/* Instant Travel-style Booking Modal ("احجز الآن * اطلب الآن") */}
      {selectedBookingBiz && (
        <BookingModal
          business={selectedBookingBiz}
          businesses={businesses}
          onSelectBusiness={(b) => setSelectedBookingBiz(b)}
          onClose={() => setSelectedBookingBiz(null)}
          lang={lang}
          currency={currentCurrency}
          onBookingSuccess={(details) => {
            handleBookingSuccess(details);
            showToast(`🎉 تم تأكيد حجزك بنجاح بكود: ${details.ref}`);
          }}
        />
      )}

      {/* Subscriber Analytics & BI Dashboard Modal */}
      {selectedDashboardBiz && (
        <SubscriberDashboardModal
          business={selectedDashboardBiz}
          onClose={() => setSelectedDashboardBiz(null)}
          lang={lang}
          onUpdateBusiness={(updated) => {
            const newBizList = businesses.map((b) => (b.id === updated.id ? updated : b));
            saveBusinesses(newBizList);
            setSelectedDashboardBiz(updated);
          }}
          onOpenMusicBank={(st) => {
            setActiveBankSoundtrack(st);
            setIsMusicBankOpen(true);
          }}
          onOpenDelivery={(b) => handleOpenDelivery(b)}
          onOpenPriceList={(b) => setPriceListTargetBiz(b)}
        />
      )}

      {/* Interactive Comments Modal */}
      {selectedCommentsBiz && (
        <CommentsModal
          business={selectedCommentsBiz}
          onClose={() => setSelectedCommentsBiz(null)}
          onAddComment={(commentText, authorName) => {
            const newComment = {
              id: `cm-${Date.now()}`,
              userName: authorName,
              comment: commentText,
              createdAt: Date.now(),
              status: 'approved' as const,
            };
            const updated = businesses.map((b) => {
              if (b.id === selectedCommentsBiz.id) {
                const existing = b.comments || [];
                return { ...b, comments: [newComment, ...existing] };
              }
              return b;
            });
            saveBusinesses(updated);
            showToast('✨ تم إرسال تعليقك واستفسارك بنجاح ويظهر فوراً');
          }}
        />
      )}

      {/* Share Action Sheet */}
      {selectedShareBiz && (
        <ShareActionSheet
          business={selectedShareBiz}
          onClose={() => setSelectedShareBiz(null)}
          onShareCompleted={() => {
            const updated = businesses.map((b) => {
              if (b.id === selectedShareBiz.id) {
                return { ...b, sharesCount: (b.sharesCount || 0) + 1 };
              }
              return b;
            });
            saveBusinesses(updated);
            showToast('🚀 شكراً لمشاركة الفيديو مع أصدقائك!');
          }}
        />
      )}

      {/* Currency & Exchange Rate Calculator Modal */}
      {isCurrencyModalOpen && (
        <CurrencyModal
          currentCurrency={currentCurrency}
          onSelectCurrency={handleSelectCurrency}
          onClose={() => setIsCurrencyModalOpen(false)}
          lang={lang}
        />
      )}

      {/* Add New Business Modal (Voice 🎤 + Map 📍 + Multiple Phones + CSV) */}
      {isAddOpen && (
        <AddBusinessModal
          onClose={() => setIsAddOpen(false)}
          onAddBusiness={handleAddBusiness}
          existingBusinesses={businesses}
          lang={lang}
        />
      )}

      {/* Official Domain & Platform Link Modal (الرابط النهائي بالدومين الرسمي) */}
      {isOfficialDomainOpen && (
        <OfficialDomainModal
          onClose={() => setIsOfficialDomainOpen(false)}
          lang={lang}
          businessId={selectedBiz?.id}
          businessName={selectedBiz?.name}
        />
      )}

      {/* Subscribers Program & Pricing Guide Modal (3 Months Free) */}
      {isSubscribersProgramOpen && (
        <SubscribersProgramModal
          onClose={() => setIsSubscribersProgramOpen(false)}
          onOpenAdd={() => {
            setIsSubscribersProgramOpen(false);
            setIsAddOpen(true);
          }}
          onOpenSubscribe={() => {
            setIsSubscribersProgramOpen(false);
            setRenewTarget(selectedBiz || businesses[0] || null);
            setIsRenewOpen(true);
          }}
          onOpenCaptainRegister={() => {
            setIsSubscribersProgramOpen(false);
            setIsCaptainRegisterOpen(true);
          }}
          lang={lang}
        />
      )}

      {/* Renewal Tier Modal (Vodafone Cash / InstaPay 01006656669) */}
      {isRenewOpen && (
        <RenewModal
          business={renewTarget || selectedBiz}
          onClose={() => setIsRenewOpen(false)}
          onRenew={handleRenew}
          lang={lang}
        />
      )}

      {/* Admin Dashboard Modal (Protected by Secret PIN - Remains in Arabic) */}
      {isAdminOpen && (
        <AdminModal
          businesses={businesses}
          onClose={() => setIsAdminOpen(false)}
          onUpdateBusiness={saveBusinesses}
          onResetData={handleResetData}
          lang="ar"
        />
      )}

      {/* Assistant & General Manager Supervisory Portal Modal (صفحة المساعدين والمدير للرقابة) */}
      {isAssistantPortalOpen && (
        <AssistantStaffPortalModal
          isOpen={isAssistantPortalOpen}
          onClose={() => setIsAssistantPortalOpen(false)}
          businesses={businesses}
          onUpdateBusinesses={saveBusinesses}
          onOpenDriverTracking={(biz) => {
            setIsAssistantPortalOpen(false);
            if (biz) setTransportTargetBiz(biz);
            setIsTransportModalOpen(true);
          }}
          lang={lang}
        />
      )}

      {/* Customer Upload Modal (Photos & Videos with Moving Animated Text) */}
      {isCustomerUploadOpen && (
        <AddCustomerMediaModal
          business={customerUploadTargetBiz}
          businesses={businesses}
          onClose={() => {
            setIsCustomerUploadOpen(false);
            setCustomerUploadTargetBiz(null);
          }}
          onAddPost={handleAddCustomerPost}
          lang={lang}
        />
      )}

      {/* Customer Post Player Modal (Full screen with moving animated text) */}
      {activeCustomerPostPlayer && (
        <CustomerPostPlayerModal
          post={activeCustomerPostPlayer.post}
          business={activeCustomerPostPlayer.business}
          onClose={() => setActiveCustomerPostPlayer(null)}
          onLike={(id) => {
            const updated = businesses.map((b) => {
              if (!b.customerPosts) return b;
              return {
                ...b,
                customerPosts: b.customerPosts.map((p) =>
                  p.id === id ? { ...p, likes: (p.likes || 1) + 1 } : p
                ),
              };
            });
            saveBusinesses(updated);
          }}
          lang={lang}
        />
      )}

      {/* Free Follower & Visitor TikTok Profile Modal */}
      {isUserProfileOpen && (
        <UserProfileModal
          user={userProfile}
          onUpdateUser={handleUpdateUser}
          businesses={businesses}
          orders={deliveryOrders}
          likedBizIds={likedIds}
          userBookings={userBookings}
          onOpenBookingsModal={() => setIsBookingsModalOpen(true)}
          onClose={() => setIsUserProfileOpen(false)}
          onOpenBiz={(b) => setSelectedBiz(b)}
          onOpenDeliveryForBiz={(b) => handleOpenDelivery(b)}
          onOpenOrderTracker={(ord) => handleOpenOrderTracker(ord)}
          onToggleFollow={toggleFollowBusiness}
          lang={lang}
        />
      )}

      {/* Business Direct Delivery Modal (برنامج: اطلب الأقرب ليك - جمع طلبك دليفري خاص) */}
      {isDeliveryOpen && (
        <BusinessDirectDeliveryModal
          business={
            deliveryTargetBiz ||
            businesses.find((b) => b.hasDelivery || b.deliveryInfo?.available) ||
            businesses[0]
          }
          businesses={businesses}
          onSelectBusiness={(b) => setDeliveryTargetBiz(b)}
          onClose={() => {
            setIsDeliveryOpen(false);
            setDeliveryTargetBiz(null);
          }}
          onUpdateBusiness={(updated) => {
            const next = businesses.map((b) => (b.id === updated.id ? updated : b));
            saveBusinesses(next);
            setDeliveryTargetBiz(updated);
          }}
          userCoords={userCoords}
          lang={lang}
        />
      )}

      {/* Quick 3-Month Free Onboarding for Any Unlisted Business + WhatsApp Welcome Message */}
      {isQuickRegisterOpen && (
        <QuickRegisterUnlistedModal
          userCoords={userCoords}
          onClose={() => setIsQuickRegisterOpen(false)}
          onRegisterBusiness={handleRegisterUnlistedBusiness}
          lang={lang}
        />
      )}

      {/* Owner Security PIN & OTP Verification Modal */}
      {ownerLockTargetBiz && (
        <OwnerLockModal
          business={ownerLockTargetBiz}
          onClose={() => setOwnerLockTargetBiz(null)}
          onOpenEditor={(biz) => {
            setOwnerLockTargetBiz(null);
            setOwnerEditBiz(biz);
          }}
          onUpdateBusiness={(updated) => {
            const newBizList = businesses.map((b) => (b.id === updated.id ? updated : b));
            saveBusinesses(newBizList);
            if (selectedBiz?.id === updated.id) setSelectedBiz(updated);
          }}
          lang={lang}
        />
      )}

      {/* Subscriber Dedicated Page Editor (Owner Mode - His page ONLY) */}
      {ownerEditBiz && (
        <AdminEditSubscriberModal
          business={ownerEditBiz}
          onClose={() => setOwnerEditBiz(null)}
          onSave={(updated) => {
            const newBizList = businesses.map((b) => (b.id === updated.id ? updated : b));
            saveBusinesses(newBizList);
            if (selectedBiz?.id === updated.id) setSelectedBiz(updated);
            setOwnerEditBiz(null);
          }}
          lang={lang}
          mode="owner"
        />
      )}

      {/* User Bookings Modal (حجوزاتي الفندقية والسياحية المرتبطة بكل مشترك) */}
      {isBookingsModalOpen && (
        <UserBookingsModal
          bookings={userBookings}
          businesses={businesses}
          onOpenBusiness={(bizId) => {
            const found = businesses.find((b) => String(b.id) === String(bizId));
            if (found) {
              setIsBookingsModalOpen(false);
              setSelectedBiz(found);
            }
          }}
          onDeleteBooking={handleDeleteBooking}
          onClose={() => setIsBookingsModalOpen(false)}
        />
      )}

      {/* Business Price List & Quick Menu Modal (علامة زائد في منتصف أسفل صورة الإعلان) */}
      {priceListTargetBiz && (
        <BusinessPriceListModal
          business={priceListTargetBiz}
          onClose={() => setPriceListTargetBiz(null)}
          onOpenDeliveryOrder={(biz) => {
            handleOpenDelivery(biz);
          }}
          currentCurrency={currentCurrency}
          lang={lang}
          onUpdateServices={(updatedServices) => {
            const updatedBiz = { ...priceListTargetBiz, services: updatedServices };
            const newBizList = businesses.map((b) => (b.id === updatedBiz.id ? updatedBiz : b));
            saveBusinesses(newBizList);
            setPriceListTargetBiz(updatedBiz);
            if (selectedBiz?.id === updatedBiz.id) {
              setSelectedBiz(updatedBiz);
            }
          }}
        />
      )}

      {/* Driver & Transport Captain Subscription Modal (تاكسي ودليفري مشترك رسمي 100%) */}
      {isCaptainRegisterOpen && (
        <DeliveryCaptainRegisterModal
          onClose={() => setIsCaptainRegisterOpen(false)}
          onSuccess={(createdBiz) => {
            const updated = [createdBiz, ...businesses];
            saveBusinesses(updated);
            setSelectedBiz(createdBiz);
            setUserProfile((prev) => {
              const next = { ...prev, points: prev.points + 200 };
              try {
                localStorage.setItem(USER_KEY, JSON.stringify(next));
              } catch {}
              return next;
            });
            showToast(`🎉 مرحباً ${createdBiz.name}! تم تفعيل اشتراكك كـ مشترك رسمي (تتبع GPS، صفحة خاصة، أرباحك 100%) بنجاح 🚀`);
          }}
          lang={lang}
        />
      )}

      {/* Official Security Warning & Legal Notice Modal */}
      <SecurityWarningNoticeModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        lang={lang}
      />

      {/* Live Direct WhatsApp & Messaging Modal */}
      {isChatsModalOpen && (
        <ChatsModal
          onClose={() => setIsChatsModalOpen(false)}
          businesses={businesses}
          onOpenBiz={(b) => setSelectedBiz(b)}
        />
      )}

      {/* Unified Settings Folder Modal (حافظة الإعدادات والخيارات الشاملة في فولدر واحد) */}
      <SettingsFolderModal
        isOpen={isSettingsFolderOpen}
        onClose={() => setIsSettingsFolderOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedSubCategory('');
        }}
        selectedSubCategory={selectedSubCategory}
        onSelectSubCategory={setSelectedSubCategory}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        sortBy={sortBy}
        onSelectSortBy={setSortBy}
        viewMode={viewMode}
        onToggleView={() => setViewMode(viewMode === 'reels' ? 'grid' : 'reels')}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly((prev) => !prev)}
        favoritesCount={likedIds.size}
        showForSaleOnly={showForSaleOnly}
        onToggleForSale={() => {
          setShowForSaleOnly((prev) => !prev);
          if (!showForSaleOnly) setShowFavoritesOnly(false);
        }}
        forSaleCount={forSaleCount}
        onDetectLocation={handleDetectLocation}
        hasUserLocation={userCoords !== null}
        isLocating={isLocating}
        onOpenAdd={() => setIsAddOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSubscribersProgram={() => setIsSubscribersProgramOpen(true)}
        onOpenDelivery={() => handleOpenDelivery()}
        onOpenCaptainRegister={() => setIsCaptainRegisterOpen(true)}
        onOpenTransportModal={() => handleOpenTransportTracking()}
        onOpenAppInstall={() => setIsAppInstallModalOpen(true)}
        onOpenSecurityNotice={() => setIsWarningModalOpen(true)}
        onOpenQuickRegister={() => setIsQuickRegisterOpen(true)}
        onOpenCurrencyModal={() => setIsCurrencyModalOpen(true)}
        onOpenBookings={() => setIsBookingsModalOpen(true)}
        onOpenClinicHospitalBooking={(b) => {
          const target =
            b ||
            businesses.find(
              (item) =>
                item.cat.includes('أطباء') ||
                item.cat.includes('عياد') ||
                item.cat.includes('مستشف') ||
                item.cat.includes('صيدلي') ||
                item.cat.includes('علاج طبيعي')
            ) ||
            businesses[0];
          if (target) setSelectedBookingBiz(target);
        }}
        businesses={businesses}
        bookingsCount={userBookings.length}
        onOpenMusicBank={() => {
          setActiveBankSoundtrack(undefined);
          setIsMusicBankOpen(true);
        }}
        currentCurrency={currentCurrency}
        lang={lang}
        onSelectLang={handleSelectLang}
        onResetData={handleResetData}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
      />

      {/* Live Taxi, Motorcycle, Limousine & Heavy Transport GPS Tracking Modal (خلية التتبع وتحديد المكان) */}
      {isTransportModalOpen && (
        <LiveTaxiTransportTrackingModal
          isOpen={isTransportModalOpen}
          onClose={() => {
            setIsTransportModalOpen(false);
            setTransportTargetBiz(null);
          }}
          targetBusiness={transportTargetBiz}
          userCoords={userCoords}
          onDetectLocation={handleDetectLocation}
          lang={lang}
          onSelectLang={handleSelectLang}
          onUpdateBusiness={(updatedBiz) => {
            const nextList = businesses.map((b) => (b.id === updatedBiz.id ? updatedBiz : b));
            saveBusinesses(nextList);
            setTransportTargetBiz(updatedBiz);
            if (selectedBiz && selectedBiz.id === updatedBiz.id) {
              setSelectedBiz(updatedBiz);
            }
          }}
        />
      )}

      {/* Proximity Calling & Dispatch Modal (الاتصال بالقرب على المشاركين من موقعهم - قبول أو رفض) */}
      {isNearbyDispatchOpen && (
        <NearbyQuickDispatchModal
          isOpen={isNearbyDispatchOpen}
          onClose={() => setIsNearbyDispatchOpen(false)}
          businesses={businesses}
          userCoords={userCoords}
          onDetectLocation={handleDetectLocation}
          onOpenLiveTracking={(biz) => {
            setIsNearbyDispatchOpen(false);
            if (biz) setTransportTargetBiz(biz);
            setIsTransportModalOpen(true);
          }}
          lang={lang}
        />
      )}

      {/* Mobile, iPad, Google Play & PWA App Installation Modal (البرنامج يعمل على كل الأجهزة والآيباد وجاهز للتحميل) */}
      <AppInstallModal
        isOpen={isAppInstallModalOpen}
        onClose={() => setIsAppInstallModalOpen(false)}
        lang={lang}
      />

      {/* Music & Audio Bank Modal (بنك الأغاني والموسيقى وتحميل الصوتيات MP3) */}
      {isMusicBankOpen && (
        <MusicBankModal
          currentSoundtrack={activeBankSoundtrack}
          onSelectSoundtrack={(st) => {
            setActiveBankSoundtrack(st);
            if (selectedBiz) {
              const updatedBiz = { ...selectedBiz, soundtrack: st };
              const newBizList = businesses.map((b) => (b.id === updatedBiz.id ? updatedBiz : b));
              saveBusinesses(newBizList);
              setSelectedBiz(updatedBiz);
            }
          }}
          onRemoveSoundtrack={() => {
            setActiveBankSoundtrack(undefined);
            if (selectedBiz) {
              const updatedBiz = { ...selectedBiz, soundtrack: undefined };
              const newBizList = businesses.map((b) => (b.id === updatedBiz.id ? updatedBiz : b));
              saveBusinesses(newBizList);
              setSelectedBiz(updatedBiz);
            }
          }}
          onClose={() => setIsMusicBankOpen(false)}
          lang={lang}
          isAdmin={isAdminOpen}
        />
      )}

      {/* Order Now Directory Modal - دليل الأنشطة والأوامر الشامل بدون تكرار أزرار أضف إعلانك */}
      <OrderNowDirectoryModal
        isOpen={isOrderNowDirectoryOpen}
        onClose={() => setIsOrderNowDirectoryOpen(false)}
        businesses={businesses}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedSubCategory('');
          setIsOrderNowDirectoryOpen(false);
        }}
        onDetectLocation={handleDetectLocation}
        hasUserLocation={userCoords !== null}
        isLocating={isLocating}
        onOpenAdd={() => {
          setIsOrderNowDirectoryOpen(false);
          setIsAddOpen(true);
        }}
        onOpenSubscribersProgram={() => {
          setIsOrderNowDirectoryOpen(false);
          setIsSubscribersProgramOpen(true);
        }}
        onOpenDelivery={() => {
          setIsOrderNowDirectoryOpen(false);
          handleOpenDelivery();
        }}
        onOpenTransportTracking={() => {
          setIsOrderNowDirectoryOpen(false);
          handleOpenTransportTracking();
        }}
        onOpenNearbyDispatch={() => {
          setIsOrderNowDirectoryOpen(false);
          setIsNearbyDispatchOpen(true);
        }}
        onOpenOfficialDomain={() => {
          setIsOrderNowDirectoryOpen(false);
          setIsOfficialDomainOpen(true);
        }}
        onOpenMusicBank={() => {
          setIsOrderNowDirectoryOpen(false);
          setActiveBankSoundtrack(undefined);
          setIsMusicBankOpen(true);
        }}
        onOpenAppInstall={() => {
          setIsOrderNowDirectoryOpen(false);
          setIsAppInstallModalOpen(true);
        }}
        onOpenSecurityNotice={() => {
          setIsOrderNowDirectoryOpen(false);
          setIsWarningModalOpen(true);
        }}
        onOpenCurrencyModal={() => {
          setIsOrderNowDirectoryOpen(false);
          setIsCurrencyModalOpen(true);
        }}
        onOpenBookingModal={(biz) => {
          setIsOrderNowDirectoryOpen(false);
          setSelectedBookingBiz(biz);
        }}
        lang={lang}
        onSelectLang={handleSelectLang}
      />

      {/* Mock Notifications Modal (مركز التنبيهات والإشعارات التجريبي) */}
      <MockNotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onClearAll={handleClearAllNotifications}
        onSimulateCommentReply={handleSimulateCommentReply}
        onSimulateDeliveryUpdate={handleSimulateDeliveryUpdate}
        onOpenComments={(bizId) => {
          const biz = businesses.find((b) => b.id === bizId) || businesses[0];
          if (biz) setSelectedCommentsBiz(biz);
        }}
        onOpenDeliveryOrder={(orderNum) => {
          const ord = deliveryOrders.find((o) => o.orderNumber === orderNum) || deliveryOrders[0];
          if (ord) handleOpenOrderTracker(ord);
          else handleOpenDelivery();
        }}
        onOpenBusiness={(bizId) => {
          const biz = businesses.find((b) => b.id === bizId);
          if (biz) setSelectedBiz(biz);
        }}
        lang={lang}
      />

      {/* Interactive Google Maps Platform Explorer Modal */}
      <GoogleMapsExplorerModal
        isOpen={isGoogleMapsOpen}
        onClose={() => setIsGoogleMapsOpen(false)}
        businesses={businesses}
        initialBusiness={mapTargetBiz}
        userCoords={userCoords}
        onDetectLocation={handleDetectLocation}
        isLocating={isLocating}
        onOpenBiz={(b) => setSelectedBiz(b)}
        onOpenBooking={(b) => setSelectedBookingBiz(b)}
        onOpenDelivery={(b) => handleOpenDelivery(b)}
        onOpenTransportTracking={(b) => handleOpenTransportTracking(b)}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        lang={lang}
      />

      {/* Dedicated Standalone Supervisory, Assistants & Settings Page Modal */}
      <SupervisoryAndStaffSettingsModal
        isOpen={isSupervisoryModalOpen}
        onClose={() => setIsSupervisoryModalOpen(false)}
        businesses={businesses}
        onUpdateBusinesses={saveBusinesses}
        onOpenDriverTracking={(biz) => {
          setIsSupervisoryModalOpen(false);
          if (biz) setTransportTargetBiz(biz);
          setIsTransportModalOpen(true);
        }}
        onResetData={handleResetData}
        lang={lang}
      />

      {/* Universal Floating Page Close (غلق الصفحة أعلى الشاشة في المنتصف تظهر فوق الصفحة في المنتصف) */}
      {isAnyPageOpen && (
        <div
          className="fixed top-1.5 left-1/2 -translate-x-1/2 z-[260] flex items-center gap-2 bg-neutral-950/95 backdrop-blur-xl border-2 border-white/40 px-3 py-1 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.95)]"
          dir="rtl"
        >
          <button
            type="button"
            onClick={handleCloseAllPages}
            className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_16px_rgba(220,38,38,0.85)] border border-white transition cursor-pointer active:scale-95"
            title="غلق الصفحة الحالية والعودة للرئيسية (X)"
          >
            <X className="w-4 h-4 stroke-[3]" />
            <span>غلق الصفحة</span>
          </button>

          {/* شكل الميك فقط حساس للأوامر الصوتية بالصفحات */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              setIsVoiceAssistantOpen(true);
            }}
            onClick={(e) => {
              if (e.detail === 0) setIsVoiceAssistantOpen(true);
            }}
            className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-300 text-black flex items-center justify-center shadow-md border border-white transition cursor-pointer active:scale-90"
            title="أمر صوتي حساس بالصفحات"
            aria-label="Voice Command Mic"
          >
            <Mic className="w-4 h-4 stroke-[2.75]" />
          </button>

          {!isAddOpen && (
            <button
              type="button"
              onClick={() => {
                handleCloseAllPages();
                setIsAddOpen(true);
              }}
              className="px-3 py-1 rounded-full bg-[#FF2D55] hover:bg-rose-600 text-white font-black text-xs flex items-center gap-1 shadow-md transition cursor-pointer active:scale-95"
              title="عايز أشترك وانشر إعلاني"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>عايز أشترك</span>
            </button>
          )}
        </div>
      )}

      {/* Voice Command Mic Assistant Modal (إعطاء أوامر صوتية بالصفحات + عايز أشترك + بحث عن كل مشترك وكل نشاط) */}
      <VoiceCommandAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        currentCity={selectedCity}
        businesses={businesses}
        onSelectBusiness={(biz) => {
          handleCloseAllPages();
          setSelectedBiz(biz);
          showToast(`👤 تم فتح صفحة المشترك المسجل: ${biz.name}`);
        }}
        onSelectCategory={(cat) => {
          handleCloseAllPages();
          setSelectedCategory(cat);
          setSelectedSubCategory('');
          showToast(cat === 'الكل' ? '🔍 عرض جميع الأنشطة والمشتركين' : `🔍 تم عرض نشاط: ${cat}`);
        }}
        onSelectCity={(city) => {
          handleCloseAllPages();
          setSelectedCity(city);
          setSelectedCategory('الكل');
          showToast(`📍 المحافظة تسمي المكان: تم تحديد ${city}`);
        }}
        onSearch={(query) => {
          setSearchQuery(query);
          if (query) {
            showToast(`🔍 تم البحث عن: ${query}`);
          }
        }}
        onOpenPage={(page) => {
          handleCloseAllPages();
          if (page === 'close_all') {
            showToast('✕ تم غلق الصفحات والعودة للشاشة الرئيسية');
          } else if (page === 'supervisory') {
            setIsSupervisoryModalOpen(true);
          } else if (page === 'delivery') {
            handleOpenDelivery();
          } else if (page === 'subscriber') {
            if (businesses.length > 0) setSelectedDashboardBiz(businesses[0]);
          } else if (page === 'add') {
            setIsAddOpen(true);
          } else if (page === 'favorites') {
            setShowFavoritesOnly(true);
            setShowForSaleOnly(false);
          } else if (page === 'settings') {
            setIsSettingsFolderOpen(true);
          } else if (page === 'directory') {
            setIsOrderNowDirectoryOpen(true);
          } else if (page === 'maps') {
            setIsGoogleMapsOpen(true);
          }
        }}
      />
      </div>
      </div>
    </APIProvider>
  );
}
