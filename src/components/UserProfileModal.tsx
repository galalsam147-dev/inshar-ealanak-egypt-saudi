import React, { useState } from 'react';
import { 
  X, User, Heart, ShoppingBag, MapPin, Share2, 
  Sparkles, Check, Edit3, Phone, ShieldCheck, Copy, 
  ArrowRight, Award, Wallet, Clock, ExternalLink, Motorbike, MessageCircle,
  Calendar, Bed, Building2
} from 'lucide-react';
import { UserProfile, Business, DeliveryOrder, SupportedLang } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { isDeliveryEligible } from '../utils/deliveryEligibility';
import { SavedBooking } from './UserBookingsModal';

interface UserProfileModalProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  businesses: Business[];
  orders: DeliveryOrder[];
  likedBizIds: Set<string | number>;
  userBookings?: SavedBooking[];
  onOpenBookingsModal?: () => void;
  onClose: () => void;
  onOpenBiz: (b: Business) => void;
  onOpenDeliveryForBiz?: (b?: Business) => void;
  onOpenOrderTracker?: (order: DeliveryOrder) => void;
  onToggleFollow?: (bizId: string | number) => void;
  lang: SupportedLang;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onUpdateUser,
  businesses,
  orders,
  likedBizIds,
  userBookings = [],
  onOpenBookingsModal,
  onClose,
  onOpenBiz,
  onOpenDeliveryForBiz,
  onOpenOrderTracker,
  onToggleFollow,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'following' | 'likes' | 'orders' | 'bookings' | 'wallet'>('following');
  const [isEditing, setIsEditing] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states for editing profile
  const [name, setName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || 'متابع ومستكشف في إعلانك الخاص 🇪🇬');
  const [phone, setPhone] = useState(user.phone || '');
  const [city, setCity] = useState(user.city || 'القاهرة');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  const followedBusinesses = businesses.filter((b) => user.followingIds.includes(b.id));
  const likedBusinesses = businesses.filter((b) => likedBizIds.has(b.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      displayName: name.trim() || user.displayName,
      username: username.startsWith('@') ? username.trim() : `@${username.trim()}`,
      bio: bio.trim(),
      phone: phone.trim(),
      city: city.trim(),
      avatarUrl: avatarUrl.trim() || user.avatarUrl,
    });
    setIsEditing(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?user=${encodeURIComponent(user.username)}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-neutral-900 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-neutral-950/80 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <span>{user.username}</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                حساب متابع مجاني 🌟
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQr(!showQr)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 transition cursor-pointer"
              title="رمز QR للحساب"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TikTok Style Profile Header */}
          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="relative group">
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-24 h-24 rounded-full object-cover border-4 border-[#38BDF8] shadow-xl shadow-[#38BDF8]/20"
              />
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 end-0 bg-[#FF2D55] text-white p-1.5 rounded-full shadow-lg border-2 border-neutral-900 hover:scale-110 transition cursor-pointer"
                title="تعديل الصورة"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <h2 className="text-lg font-black text-white">{user.displayName}</h2>
                <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              </div>
              <p className="text-xs text-white/60 font-mono mt-0.5">{user.username}</p>
              <p className="text-xs text-white/80 max-w-sm mt-1 leading-relaxed">
                {user.bio}
              </p>
              {user.city && (
                <div className="flex items-center justify-center gap-1 text-[11px] text-white/50 mt-1">
                  <MapPin className="w-3 h-3 text-[#FF2D55]" />
                  <span>{user.city}</span>
                </div>
              )}
            </div>

            {/* TikTok Metrics Row with Compact 100M Audience */}
            <div className="flex items-center justify-around py-2.5 border-y border-white/10 w-full text-center">
              <div>
                <span className="block text-base font-black text-white">{user.followingIds.length}</span>
                <span className="text-[10px] text-white/50">أتابع</span>
              </div>
              <div>
                <span className="block text-base font-black text-white">{user.followersCount}</span>
                <span className="text-[10px] text-white/50">متابع</span>
              </div>
              <div>
                <span className="block text-base font-black text-[#FF2D55] font-mono">100M+</span>
                <span className="text-[10px] text-white/60 font-bold">عميل وزبون 🇪🇬</span>
              </div>
              <div>
                <span className="block text-base font-black text-white">{likedBusinesses.length * 12 + 45}</span>
                <span className="text-[10px] text-white/50">إعجاب</span>
              </div>
              <div>
                <span className="block text-base font-black text-amber-400">{user.points}</span>
                <span className="text-[10px] text-amber-400/80 font-bold">نقطة</span>
              </div>
            </div>

            {/* Nationwide Audience Reach Card: 100M+ عملاء وزبائن مصر */}
            <div className="w-full bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-neutral-900 border border-emerald-500/30 p-2.5 rounded-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  🇪🇬
                </span>
                <div className="text-start">
                  <span className="text-[11px] font-black text-white block">
                    نطاق الوصول التسويقي: <span className="text-emerald-400 font-mono">100M+</span> عميل وزبون
                  </span>
                  <span className="text-[10px] text-white/60">
                    حسابك المجاني مهيأ ومضغوط للظهور والوصول لكافة زوار وعملاء مصر
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                100M مضغوط ✓
              </span>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2 w-full max-w-md pt-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex-1 bg-white/10 hover:bg-white/15 text-white text-xs font-bold py-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل الملف الشخصي</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onOpenDeliveryForBiz) onOpenDeliveryForBiz();
                }}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 active:scale-98 text-white text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25 transition cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>طلب دليفري من الدليل 🛵</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl border border-white/10 transition cursor-pointer"
                title="نسخ رابط حسابي"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* QR Code Card if toggled */}
            {showQr && (
              <div className="bg-white p-4 rounded-2xl flex flex-col items-center space-y-2 text-neutral-900 shadow-2xl animate-in zoom-in-95 duration-150">
                <QRCodeSVG
                  value={`${window.location.origin}?user=${encodeURIComponent(user.username)}`}
                  size={140}
                  level="M"
                />
                <span className="text-[11px] font-black">{user.username} - إعلانك الخاص</span>
                <span className="text-[10px] text-neutral-500">امسح الكود لفتح ومتابعة حسابي فوراً</span>
              </div>
            )}
          </div>

          {/* Edit Profile Accordion Form */}
          {isEditing && (
            <form onSubmit={handleSaveProfile} className="bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-150">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>تعديل بيانات الحساب المجاني</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-1">اسم المستخدم (@username)</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/70 block mb-1">النبذة التعريفية (Bio)</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-1">رقم الهاتف (للتوصيل والتواصل)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-1">المدينة / المحافظة</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/70 block mb-1">اختر صورة الحساب أو اكتب رابط الصورة:</label>
                <div className="flex items-center gap-2 mb-2">
                  {AVATAR_PRESETS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(av)}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 transition ${
                        avatarUrl === av ? 'border-[#FF2D55] scale-110 shadow-md shadow-[#FF2D55]/50' : 'border-white/20 opacity-70'
                      }`}
                    >
                      <img src={av} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl transition"
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 bg-white/10 text-white/70 hover:text-white text-xs py-2 rounded-xl transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {/* Content Tabs (TikTok Grid style) */}
          <div className="space-y-3">
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition border-b-2 cursor-pointer ${
                  activeTab === 'following'
                    ? 'border-[#38BDF8] text-[#38BDF8]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <span>المتاجر التي أتابعها</span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded-full">
                  {followedBusinesses.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('likes')}
                className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition border-b-2 cursor-pointer ${
                  activeTab === 'likes'
                    ? 'border-[#FF2D55] text-[#FF2D55]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>المفضلة</span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded-full">
                  {likedBusinesses.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition border-b-2 cursor-pointer ${
                  activeTab === 'orders'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>طلباتي ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition border-b-2 cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>حجوزاتي ({userBookings.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition border-b-2 cursor-pointer ${
                  activeTab === 'wallet'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>المحفظة</span>
              </button>
            </div>

            {/* TAB 1: Following Businesses */}
            {activeTab === 'following' && (
              <div className="space-y-2">
                {followedBusinesses.length === 0 ? (
                  <div className="text-center py-8 space-y-2 text-white/60">
                    <p className="text-xs">أنت لا تتابع أي نشاط أو متجر بعد.</p>
                    <p className="text-[11px] text-white/40">
                      اضغط على زر "متابعة" في أي متجر أو ريل لمتابعة عروضه أولاً بأول!
                    </p>
                  </div>
                ) : (
                  followedBusinesses.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-2xl flex items-center justify-between gap-3 transition"
                    >
                      <div 
                        onClick={() => {
                          onClose();
                          onOpenBiz(b);
                        }}
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      >
                        <img
                          src={b.images[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                          alt={b.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-white truncate">{b.name}</h4>
                          <span className="text-[10px] text-white/50 block truncate">{b.cat} • {b.city}</span>
                          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                            ⭐ {b.rating || 4.8} ({b.viewsCount || 520} مشاهدة)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isDeliveryEligible(b) && (
                          <button
                            onClick={() => {
                              onClose();
                              if (onOpenDeliveryForBiz) onOpenDeliveryForBiz(b);
                            }}
                            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer"
                            title="طلب دليفري من هذا المتجر"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>طلباتي 🛵</span>
                          </button>
                        )}
                        {onToggleFollow && (
                          <button
                            onClick={() => onToggleFollow(b.id)}
                            className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/70 text-[11px] px-2 py-1.5 rounded-lg font-semibold transition cursor-pointer"
                          >
                            إلغاء
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: Liked Videos / Favorites */}
            {activeTab === 'likes' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {likedBusinesses.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-white/60 text-xs">
                    لم تسجل إعجاباً بأي فيديو حتى الآن ❤️
                  </div>
                ) : (
                  likedBusinesses.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        onClose();
                        onOpenBiz(b);
                      }}
                      className="group relative aspect-[9/14] rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-neutral-950"
                    >
                      <img
                        src={b.images[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                        alt={b.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-2.5 flex flex-col justify-end">
                        <span className="text-[11px] font-bold text-white line-clamp-1">{b.name}</span>
                        <span className="text-[9px] text-[#38BDF8] line-clamp-1">{b.cat}</span>
                        <div className="flex items-center gap-1 text-[10px] text-rose-400 mt-0.5">
                          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                          <span>{b.likes || 12}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: Delivery Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-2.5">
                {orders.length === 0 ? (
                  <div className="text-center py-8 space-y-3 text-white/60">
                    <ShoppingBag className="w-10 h-10 mx-auto text-amber-400 opacity-60" />
                    <p className="text-xs">لا توجد طلبات توصيل سابقة حتى الآن.</p>
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenDeliveryForBiz) onOpenDeliveryForBiz();
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-5 py-2.5 rounded-full transition cursor-pointer"
                    >
                      🛵 اطلب توصيل من أي محل أو مستندات الآن
                    </button>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => onOpenOrderTracker && onOpenOrderTracker(ord)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 p-3.5 rounded-2xl space-y-2 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {ord.category === 'restaurant' ? '🍔' : ord.category === 'pharmacy' ? '💊' : ord.category === 'documents' ? '📄' : '🛍️'}
                          </span>
                          <div>
                            <h4 className="text-xs font-black text-white">{ord.businessName}</h4>
                            <span className="text-[10px] text-white/50">{ord.orderNumber}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : ord.status === 'on_the_way'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }`}>
                          {ord.status === 'delivered' ? '✓ تم التوصيل' : ord.status === 'on_the_way' ? '🛵 في الطريق إليك' : '⏳ جاري التجهيز'}
                        </span>
                      </div>

                      <div className="text-[11px] text-white/70 line-clamp-1 bg-black/30 p-1.5 rounded-lg">
                        {ord.items.map((i) => `${i.name} (x${i.quantity})`).join('، ')}
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                        <span className="text-white/50">{new Date(ord.createdAt).toLocaleDateString('ar-EG')}</span>
                        <div className="flex items-center gap-1 font-black text-emerald-400">
                          <span>الإجمالي: {ord.totalEgp} ج.م</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: Hotel & Tourism Bookings Linked to Each Subscriber (حجوزاتي الفندقية والسياحية) */}
            {activeTab === 'bookings' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>حجوزاتي الفندقية والسياحية</span>
                    </h4>
                    <p className="text-[10px] text-white/60">
                      مرتبطة بحسابك ومسجلة لكل مشترك مباشرة 🏨
                    </p>
                  </div>
                  {onOpenBookingsModal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenBookingsModal();
                      }}
                      className="bg-amber-400 hover:bg-amber-300 text-black text-[11px] font-black px-3 py-1.5 rounded-xl transition cursor-pointer shadow flex items-center gap-1"
                    >
                      <span>عرض الكل</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  )}
                </div>

                {userBookings.length === 0 ? (
                  <div className="text-center py-8 space-y-2 text-white/60 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs">لا توجد حجوزات فندقية وسياحية مسجلة حالياً.</p>
                    <p className="text-[11px] text-white/40">
                      يمكنك تصفح الفنادق والمنتجعات والضغط على "احجز الآن" لتأكيد حجزك مع كل مشترك.
                    </p>
                  </div>
                ) : (
                  userBookings.map((b) => (
                    <div
                      key={b.ref}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 p-3.5 rounded-2xl space-y-2.5 transition"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                        <div>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold inline-block mb-1">
                            المشترك: {b.businessName}
                          </span>
                          <h4 className="text-xs font-black text-white">{b.roomName}</h4>
                          <span className="text-[10px] text-white/50 block font-mono">
                            📅 {b.checkIn} إلى {b.checkOut} ({b.nights} ليلة)
                          </span>
                        </div>
                        <div className="text-end">
                          <span className="text-[10px] font-mono text-amber-400 block font-bold">#{b.ref}</span>
                          <span className="text-xs font-black text-emerald-400">{b.totalPrice.toLocaleString()} ج.م</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          onClick={() => {
                            const foundBiz = businesses.find((biz) => String(biz.id) === String(b.businessId));
                            if (foundBiz) {
                              onClose();
                              onOpenBiz(foundBiz);
                            }
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>صفحة المشترك</span>
                        </button>

                        {onOpenBookingsModal && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenBookingsModal();
                            }}
                            className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>تفاصيل والفاوتشر</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: Wallet & Free Dalilak Perks */}
            {activeTab === 'wallet' && (
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-neutral-900 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-300 font-bold block">رصيد محفظة إعلانك كاش</span>
                    <span className="text-2xl font-black text-white">{user.walletBalance} ج.م</span>
                    <span className="text-[10px] text-white/60 block mt-1">يُخصم تلقائياً عند طلب التوصيل وحجوزات الفنادق</span>
                  </div>
                  <div className="text-end">
                    <span className="text-[11px] text-amber-300 font-bold block">نقاط الولاء</span>
                    <span className="text-xl font-black text-amber-400">{user.points} ⭐️</span>
                    <span className="text-[10px] text-amber-400/80 block mt-1">تساوي خصم 24 ج.م</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>مزايا حساب المتابع والعميل المجاني:</span>
                  </h4>
                  <ul className="text-[11px] text-white/70 space-y-1.5 list-disc list-inside">
                    <li>حساب شخصي مجاني مدى الحياة بدون أي اشتراكات أو رسوم خفية.</li>
                    <li>إمكانية متابعة المحلات، المطاعم، الأطباء، والمحاسبين وحفظ الفيديوهات.</li>
                    <li>طلب التوصيل والشراء الفوري من أي متجر داخل الدليل في دقائق.</li>
                    <li>كسب نقاط ولاء مع كل طلب حجز أو دليفري وتحويلها لرصيد نقدي.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
