import React, { useState } from 'react';
import { 
  Bell, MessageSquare, Truck, Award, Heart, ShieldAlert, 
  CheckCheck, Trash2, X, Sparkles, Clock, ChevronLeft, Send,
  RefreshCw
} from 'lucide-react';
import { AppNotification, NotificationType, SupportedLang } from '../types';

interface MockNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSimulateCommentReply: () => void;
  onSimulateDeliveryUpdate: () => void;
  onOpenComments?: (bizId: string | number) => void;
  onOpenDeliveryOrder?: (orderNumber?: string) => void;
  onOpenBusiness?: (bizId: string | number) => void;
  lang?: SupportedLang;
}

export const MockNotificationsModal: React.FC<MockNotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSimulateCommentReply,
  onSimulateDeliveryUpdate,
  onOpenComments,
  onOpenDeliveryOrder,
  onOpenBusiness,
  lang = 'ar',
}) => {
  const [filter, setFilter] = useState<'all' | 'comments' | 'delivery' | 'rewards'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'comments') return n.type === 'comment_reply';
    if (filter === 'delivery') return n.type === 'delivery_update' || n.type === 'order_placed';
    if (filter === 'rewards') return n.type === 'points_earned' || n.type === 'like_received' || n.type === 'system_alert';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'comment_reply':
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      case 'delivery_update':
      case 'order_placed':
        return <Truck className="w-4 h-4 text-amber-400" />;
      case 'points_earned':
        return <Award className="w-4 h-4 text-emerald-400" />;
      case 'like_received':
        return <Heart className="w-4 h-4 text-[#FF2D55] fill-[#FF2D55]" />;
      case 'system_alert':
      default:
        return <ShieldAlert className="w-4 h-4 text-purple-400" />;
    }
  };

  const handleNotificationClick = (item: AppNotification) => {
    if (!item.read) {
      onMarkAsRead(item.id);
    }
    if (item.type === 'comment_reply' && item.businessId && onOpenComments) {
      onClose();
      onOpenComments(item.businessId);
    } else if (item.type === 'delivery_update' && onOpenDeliveryOrder) {
      onClose();
      onOpenDeliveryOrder(item.orderNumber);
    } else if (item.businessId && onOpenBusiness) {
      onClose();
      onOpenBusiness(item.businessId);
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return new Date(ts).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-md bg-neutral-950 text-white rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-2xl bg-[#FF2D55]/20 border border-[#FF2D55]/30 flex items-center justify-center text-[#FF2D55]">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-[#FF2D55] text-white text-[10px] font-black flex items-center justify-center shadow">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white">مركز التنبيهات والإشعارات</h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  تجريبي Mock
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                متابعة فورية للردود على تعليقاتك وحالات طلبات الدليفري
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Simulator Banner - Interactive Quick Testing */}
        <div className="px-3.5 py-2.5 bg-gradient-to-r from-blue-950/60 via-purple-950/40 to-neutral-900 border-b border-white/10 flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="text-[11px] text-white/70 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>جرّب التنبيهات الآن:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={onSimulateCommentReply}
              className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/30 px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 transition cursor-pointer active:scale-95"
              title="إرسال تنبيه تجريبي لرد على تعليق"
            >
              <MessageSquare className="w-3 h-3" />
              <span>رد على تعليق 💬</span>
            </button>
            <button
              onClick={onSimulateDeliveryUpdate}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 transition cursor-pointer active:scale-95"
              title="إرسال تنبيه تجريبي لتحديث طلب دليفري"
            >
              <Truck className="w-3 h-3" />
              <span>تحديث دليفري 🛵</span>
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-white/5 bg-neutral-900/30">
          <div className="flex items-center gap-1 overflow-x-auto hide-scroll text-[11px] font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-black shadow'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('comments')}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                filter === 'comments'
                  ? 'bg-sky-500 text-white shadow'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              ردود التعليقات
            </button>
            <button
              onClick={() => setFilter('delivery')}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                filter === 'delivery'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              الدليفري
            </button>
            <button
              onClick={() => setFilter('rewards')}
              className={`px-3 py-1 rounded-full transition cursor-pointer ${
                filter === 'rewards'
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              نقاط ولاء
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[10px] text-white/60 hover:text-white p-1 rounded transition"
                title="تحديد الكل كمقروء"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[10px] text-red-400 hover:text-red-300 p-1 rounded transition"
                title="مسح كافة الإشعارات"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[55vh] hide-scroll">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-white/40 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-white/20 stroke-1" />
              <div className="font-bold text-xs text-white/70">لا توجد تنبيهات جديدة في هذا القسم</div>
              <p className="text-[11px] text-white/40">
                يمكنك الضغط على أزرار التجربة بأعلى النافذة لاختبار التنبيهات فوراً.
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3 rounded-2xl border transition cursor-pointer relative group flex items-start gap-3 ${
                  !item.read
                    ? 'bg-white/[0.08] border-[#FF2D55]/30 shadow-md shadow-black/40'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                }`}
              >
                {/* Type Icon Badge */}
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {getTypeIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs truncate ${!item.read ? 'font-black text-white' : 'font-bold text-white/80'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-white/40 shrink-0 font-mono">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>

                  <p className="text-[11px] text-white/70 leading-relaxed line-clamp-2">
                    {item.body}
                  </p>

                  {item.orderNumber && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-mono bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/20">
                      <span>رقم الطلب: {item.orderNumber}</span>
                    </div>
                  )}

                  {item.businessName && (
                    <div className="text-[10px] text-sky-300 font-medium">
                      📍 {item.businessName}
                    </div>
                  )}
                </div>

                {/* Unread dot */}
                {!item.read && (
                  <span className="w-2 h-2 rounded-full bg-[#FF2D55] shrink-0 mt-1.5 shadow-[0_0_6px_#FF2D55]" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-neutral-900/50 flex items-center justify-between text-[11px] text-white/50">
          <span>نظام التنبيهات التفاعلي • إعلانك الأقرب ليك</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
