import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, Edit2, Trash2, Copy, Check, ShieldCheck, 
  AlertTriangle, Phone, DollarSign, Sparkles, X, CheckCircle2,
  Wallet, Building2, ArrowUpDown, ChevronDown, ChevronUp
} from 'lucide-react';
import { TripPaymentMethod } from '../types';

interface TripPaymentMethodsManagerProps {
  storageKey?: string; // unique key (e.g. captain phone or business id)
  initialMethods?: TripPaymentMethod[];
  captainName?: string;
  captainPhone?: string;
  currentFareEgp?: number;
  onFareChange?: (newFare: number) => void;
  allowFareEdit?: boolean;
  className?: string;
}

const DEFAULT_METHODS = (captainPhone = '01006656669', captainName = 'الكابتن'): TripPaymentMethod[] => [
  {
    id: 'pay-voda-1',
    type: 'vodafone_cash',
    label: 'فودافون كاش الكابتن',
    number: captainPhone,
    holderName: captainName,
    notes: 'استلام فوري 24 ساعة - يرجى إرسال الإشعار بعد التحويل',
    isPrimary: true,
    addedAt: Date.now() - 100000,
  },
  {
    id: 'pay-insta-1',
    type: 'instapay',
    label: 'إنستاباي InstaPay فوري',
    number: `${captainPhone}@instapay`,
    holderName: captainName,
    notes: 'تحويل لحظي من أي بنك أو محفظة بالاسم أو الرقم',
    isPrimary: false,
    addedAt: Date.now() - 80000,
  },
  {
    id: 'pay-cash-1',
    type: 'cash',
    label: 'الدفع كاش نقداً',
    number: 'كاش عند الوصول للوجهة 💵',
    holderName: captainName,
    notes: 'الخيار الكلاسيكي الموصى به لجميع الرحلات',
    isPrimary: false,
    addedAt: Date.now() - 60000,
  }
];

export const TripPaymentMethodsManager: React.FC<TripPaymentMethodsManagerProps> = ({
  storageKey = 'default_captain',
  initialMethods,
  captainName = 'الكابتن',
  captainPhone = '01006656669',
  currentFareEgp = 35,
  onFareChange,
  allowFareEdit = true,
  className = '',
}) => {
  const fullStorageKey = `dalilak_trip_payments_${storageKey}`;

  const [methods, setMethods] = useState<TripPaymentMethod[]>(() => {
    try {
      const saved = localStorage.getItem(fullStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return initialMethods && initialMethods.length > 0 ? initialMethods : DEFAULT_METHODS(captainPhone, captainName);
  });

  // Save to localStorage whenever methods change
  const persistMethods = (updated: TripPaymentMethod[]) => {
    setMethods(updated);
    try {
      localStorage.setItem(fullStorageKey, JSON.stringify(updated));
    } catch {}
  };

  // State for Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<TripPaymentMethod | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    type: TripPaymentMethod['type'];
    label: string;
    number: string;
    holderName: string;
    notes: string;
    isPrimary: boolean;
  }>({
    type: 'vodafone_cash',
    label: '',
    number: '',
    holderName: captainName,
    notes: '',
    isPrimary: false,
  });

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Fare manual editing
  const [isFareEditing, setIsFareEditing] = useState(false);
  const [manualFareInput, setManualFareInput] = useState<string>(String(currentFareEgp));
  const [fareNote, setFareNote] = useState<string>('');

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerFeedback('تم نسخ رقم الدفع بنجاح 📋');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const openAddModal = () => {
    setEditingMethod(null);
    setFormData({
      type: 'vodafone_cash',
      label: 'محفظة فودافون كاش جديدة',
      number: captainPhone,
      holderName: captainName,
      notes: 'استلام فوري',
      isPrimary: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (method: TripPaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      type: method.type,
      label: method.label,
      number: method.number,
      holderName: method.holderName || '',
      notes: method.notes || '',
      isPrimary: Boolean(method.isPrimary),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (methods.length <= 1) {
      alert('يجب الإبقاء على وسيلة دفع واحدة على الأقل للرحلة.');
      return;
    }
    if (window.confirm('هل أنت متأكد من حذف رقم دفع الرحلة هذا نهائياً؟')) {
      const updated = methods.filter((m) => m.id !== id);
      persistMethods(updated);
      triggerFeedback('تم حذف رقم الدفع بنجاح 🗑️');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number.trim() || !formData.label.trim()) {
      alert('يرجى إدخال مسمى وسيلة الدفع والرقم / المعرف.');
      return;
    }

    if (editingMethod) {
      // Edit existing
      const updated = methods.map((m) => {
        if (m.id === editingMethod.id) {
          return {
            ...m,
            type: formData.type,
            label: formData.label.trim(),
            number: formData.number.trim(),
            holderName: formData.holderName.trim(),
            notes: formData.notes.trim(),
            isPrimary: formData.isPrimary,
          };
        }
        if (formData.isPrimary) {
          return { ...m, isPrimary: false };
        }
        return m;
      });
      persistMethods(updated);
      triggerFeedback('تم تعديل رقم دفع الرحلة بنجاح ✏️');
    } else {
      // Add new
      const newMethod: TripPaymentMethod = {
        id: `pay-${Date.now()}`,
        type: formData.type,
        label: formData.label.trim(),
        number: formData.number.trim(),
        holderName: formData.holderName.trim(),
        notes: formData.notes.trim(),
        isPrimary: formData.isPrimary,
        addedAt: Date.now(),
      };
      let updated = [...methods];
      if (formData.isPrimary) {
        updated = updated.map((m) => ({ ...m, isPrimary: false }));
      }
      updated.push(newMethod);
      persistMethods(updated);
      triggerFeedback('تمت إضافة رقم دفع جديد للرحلة بنجاح ➕');
    }

    setIsModalOpen(false);
  };

  const handleSaveManualFare = () => {
    const parsed = parseFloat(manualFareInput);
    if (isNaN(parsed) || parsed < 0) {
      alert('يرجى إدخال قيمة صحيحة للأجرة.');
      return;
    }
    if (onFareChange) {
      onFareChange(Math.round(parsed));
    }
    setIsFareEditing(false);
    triggerFeedback(`تم تعديل أجرة الرحلة يدوياً إلى ${Math.round(parsed)} ج.م 💰`);
  };

  const getMethodBadge = (type: TripPaymentMethod['type']) => {
    switch (type) {
      case 'vodafone_cash':
        return { label: 'فودافون كاش', color: 'bg-red-500/20 text-red-300 border-red-500/40', icon: '📱' };
      case 'instapay':
        return { label: 'إنستاباي InstaPay', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: '⚡' };
      case 'orange_cash':
        return { label: 'أورنج كاش', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40', icon: '🍊' };
      case 'etisalat_cash':
        return { label: 'اتصالات كاش', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: '🟢' };
      case 'we_pay':
        return { label: 'وي باي WE Pay', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', icon: '🟣' };
      case 'smart_wallet':
        return { label: 'محفظة بنكية ذكية', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: '💳' };
      case 'bank_account':
        return { label: 'تحويل بنكي IBAN', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: '🏛️' };
      case 'visa_card':
        return { label: 'بطاقة فيزا / كارت', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40', icon: '💳' };
      case 'cash':
        return { label: 'كاش نقداً', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: '💵' };
      default:
        return { label: 'دفع مخصص', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: '🏷️' };
    }
  };

  return (
    <div className={`bg-neutral-900 border border-white/10 rounded-2xl p-3.5 space-y-3 ${className}`}>
      {/* Toast Notification */}
      {feedbackMsg && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl text-center shadow-lg animate-in fade-in slide-in-from-top duration-200 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>أرقام وطرق دفع الرحلة اليدوية</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.2 rounded-full border border-amber-400/30">
                إضافة • تعديل • حذف
              </span>
            </h4>
            <p className="text-[10px] text-white/50">
              تحكم كامل بأرقام كاش والمحافظ وحسابات الكابتن للتحويل المباشر
            </p>
          </div>
        </div>

        {/* Action: Add new payment number */}
        <button
          type="button"
          onClick={openAddModal}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-3 py-1.5 rounded-xl text-[11px] flex items-center gap-1 shadow-md transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة رقم دفع يدوي</span>
        </button>
      </div>

      {/* Manual Fare Adjuster (تعديل أجرة الرحلة يدوياً بالاتفاق) */}
      {allowFareEdit && (
        <div className="bg-black/50 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-base">💵</span>
            <div>
              <span className="text-[10px] text-white/60 block">قيمة أجرة الرحلة الحالية:</span>
              <span className="font-black text-emerald-400 font-mono text-sm">
                {currentFareEgp} ج.م
              </span>
            </div>
          </div>

          {!isFareEditing ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setManualFareInput(String(currentFareEgp));
                  setIsFareEditing(true);
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 transition cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-amber-300" />
                <span>تعديل الأجرة يدوياً</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <input
                type="number"
                min="0"
                value={manualFareInput}
                onChange={(e) => setManualFareInput(e.target.value)}
                className="w-20 bg-neutral-800 border border-amber-400/60 rounded-lg px-2 py-1 text-xs text-white font-mono font-bold text-center focus:outline-none"
                placeholder="الأجرة"
              />
              <span className="text-[10px] text-white/70">ج.م</span>
              <button
                type="button"
                onClick={handleSaveManualFare}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-2.5 py-1 rounded-lg text-[10px] cursor-pointer"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setIsFareEditing(false)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-2 py-1 rounded-lg text-[10px] cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      )}

      {/* List of Trip Payment Numbers */}
      <div className="space-y-2">
        {methods.map((m) => {
          const badge = getMethodBadge(m.type);
          return (
            <div 
              key={m.id}
              className={`bg-black/40 border rounded-xl p-2.5 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                m.isPrimary ? 'border-amber-400/50 bg-amber-950/10' : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Info Column */}
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${badge.color} flex items-center gap-1`}>
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </span>

                  <span className="text-xs font-black text-white truncate">
                    {m.label}
                  </span>

                  {m.isPrimary && (
                    <span className="text-[9px] bg-amber-400 text-black font-black px-1.5 py-0.2 rounded-md shadow">
                      الوسيلة المفضلة ⭐
                    </span>
                  )}
                </div>

                {/* Number & Holder */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-mono font-bold text-amber-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 select-all">
                    {m.number}
                  </span>
                  {m.holderName && (
                    <span className="text-[10px] text-white/60">
                      باسم: <b className="text-white">{m.holderName}</b>
                    </span>
                  )}
                </div>

                {/* Notes */}
                {m.notes && (
                  <p className="text-[10px] text-white/50 truncate">
                    💡 {m.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons: Copy, Edit, Delete */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {/* Copy */}
                <button
                  type="button"
                  onClick={() => handleCopy(m.number, m.id)}
                  className="bg-white/10 hover:bg-white/20 text-emerald-300 font-bold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 transition cursor-pointer"
                  title="نسخ الرقم"
                >
                  {copiedId === m.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>تم</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => openEditModal(m)}
                  className="bg-white/10 hover:bg-amber-400/20 text-amber-300 font-bold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 transition cursor-pointer"
                  title="تعديل الرقم والبيانات"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>تعديل</span>
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="bg-white/10 hover:bg-red-500/20 text-red-400 font-bold px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 transition cursor-pointer"
                  title="حذف الرقم"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct Captain / Subscriber Accounts Notice */}
      <div className="bg-black/60 border border-amber-500/25 rounded-xl p-2.5 text-[10px] space-y-1">
        <div className="flex items-center gap-1 font-bold text-amber-300">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>تنبيه هام حول دفع الأجرة والطلبات:</span>
        </div>
        <p className="text-white/70 leading-relaxed">
          أرقام الدفع بالأعلى خاصة مباشرة بالكابتن/المشترك لتحصيل أجرة الرحلة أو الطلب بالكامل بدون أي وسيط.
        </p>
      </div>

      {/* Add / Edit Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div 
            className="bg-[#141824] border border-amber-400/40 w-full max-w-md rounded-2xl p-4 text-white shadow-2xl space-y-3 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-amber-400">
                  {editingMethod ? '✏️ تعديل رقم دفع الرحلة' : '➕ إضافة رقم دفع جديد للرحلة'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3">
              {/* Type Select */}
              <div>
                <label className="text-[11px] font-bold text-white/80 block mb-1">
                  نوع وسيلة الدفع / المحفظة:
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as TripPaymentMethod['type'];
                    setFormData((prev) => ({
                      ...prev,
                      type: newType,
                      label: prev.label || getMethodBadge(newType).label,
                    }));
                  }}
                  className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="vodafone_cash">📱 فودافون كاش (Vodafone Cash)</option>
                  <option value="instapay">⚡ إنستاباي (InstaPay Handle / Phone)</option>
                  <option value="orange_cash">🍊 أورنج كاش (Orange Money)</option>
                  <option value="etisalat_cash">🟢 اتصالات كاش (Etisalat Cash)</option>
                  <option value="we_pay">🟣 وي باي (WE Pay)</option>
                  <option value="smart_wallet">💳 محفظة بنكية ذكية (Smart Wallet)</option>
                  <option value="bank_account">🏛️ حساب بنكي / آيبان (IBAN Transfer)</option>
                  <option value="visa_card">💳 كارت فيزا / ماستركارد</option>
                  <option value="cash">💵 دفع كاش نقداً</option>
                  <option value="custom">🏷️ وسيلة دفع مخصصة أخرى</option>
                </select>
              </div>

              {/* Label */}
              <div>
                <label className="text-[11px] font-bold text-white/80 block mb-1">
                  مسمى الرقم / الوسيلة (يظهر للراكب):
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فودافون كاش الكابتن الأساسي"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Number / Handle */}
              <div>
                <label className="text-[11px] font-bold text-white/80 block mb-1">
                  رقم الهاتف أو المعرف البنكي:
                </label>
                <input
                  type="text"
                  required
                  dir="ltr"
                  placeholder="01006656669 أو user@instapay"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Holder Name */}
              <div>
                <label className="text-[11px] font-bold text-white/80 block mb-1">
                  اسم صاحب المحفظة أو الحساب:
                </label>
                <input
                  type="text"
                  placeholder="مثال: كابتن محمود الشريف"
                  value={formData.holderName}
                  onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                  className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-bold text-white/80 block mb-1">
                  ملاحظات أو تعليمات للراكب (اختياري):
                </label>
                <input
                  type="text"
                  placeholder="مثال: يرجى إرسال لقطة شاشة بالتحويل على الواتساب"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Is Primary Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrimaryCheck"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="rounded text-amber-400 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="isPrimaryCheck" className="text-[11px] text-white/90 font-bold cursor-pointer">
                  تعيين كوسيلة الدفع الأساسية والمفضلة للرحلة ⭐
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black px-4 py-2 rounded-xl text-xs transition shadow-lg cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingMethod ? 'حفظ التعديلات' : 'إضافة وتأكيد'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
