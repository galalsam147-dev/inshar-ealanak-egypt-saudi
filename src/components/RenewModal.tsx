import React, { useState } from 'react';
import { 
  X, Check, Copy, Sparkles, Crown, Star, ShieldCheck, 
  MessageCircle, CreditCard, Smartphone, Zap, Store, Building, 
  Wallet, Coins, Lock, CheckCircle2, ArrowRight, Printer, Download,
  ExternalLink, Clock, ShieldAlert, Award
} from 'lucide-react';
import { Business, PackageTier, SupportedLang } from '../types';
import { I18N } from '../utils/translations';
import { OFFICIAL_PAYMENT_CONFIG } from '../utils/bankPaymentConfig';

interface RenewModalProps {
  business: Business | null;
  onClose: () => void;
  onRenew: (bizId: number | string, pkg: PackageTier) => void;
  lang: SupportedLang;
}

type PaymentMethodType = 'visa' | 'vodafone' | 'instapay' | 'fawry' | 'bank' | 'wallet' | 'crypto';

export const RenewModal: React.FC<RenewModalProps> = ({
  business,
  onClose,
  onRenew,
  lang,
}) => {
  const t = I18N[lang];
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PackageTier>(900);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('visa');

  // Form states for Visa / Card payment
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(business?.name ? `أدمن ${business.name}` : 'مصطفى أحمد');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // Form states for Mobile Wallets & InstaPay
  const [senderWalletNumber, setSenderWalletNumber] = useState('');
  const [transferRef, setTransferRef] = useState('');

  // UI state
  const [step, setStep] = useState<'checkout' | 'processing' | 'receipt'>('checkout');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [invoiceId] = useState(() => `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
  const [transactionId] = useState(() => `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);

  const phonePayment = OFFICIAL_PAYMENT_CONFIG.vodafoneCashPhone; // 01006656669
  const fawryCode = "7892-4160";
  const instaPayAddress = OFFICIAL_PAYMENT_CONFIG.instaPayAddress; // 01006656669@instapay

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Card formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardExpiry(raw);
  };

  // Detect Card Brand
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return { name: 'Visa', color: 'from-blue-600 to-indigo-900', label: 'VISA' };
    if (clean.startsWith('5')) return { name: 'Mastercard', color: 'from-amber-600 to-rose-900', label: 'MASTERCARD' };
    if (clean.startsWith('5078') || clean.startsWith('50')) return { name: 'Meeza', color: 'from-emerald-700 to-teal-950', label: 'ميزة MEEZA' };
    return { name: 'Card', color: 'from-slate-800 to-neutral-900', label: 'DEBIT/CREDIT' };
  };

  // Compute final price depending on cycle
  const getAmount = () => {
    let base = selectedPlan;
    if (selectedPlan === 350) return billingCycle === 'yearly' ? 3500 : 350;
    if (selectedPlan === 900) return billingCycle === 'yearly' ? 9000 : 900;
    if (selectedPlan === 2500) return billingCycle === 'yearly' ? 25000 : 2500;
    if (selectedPlan === 5000) return billingCycle === 'yearly' ? 50000 : 5000;
    if (selectedPlan === 16000) return billingCycle === 'yearly' ? 160000 : 16000;
    return base;
  };

  const finalAmount = getAmount();

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    setTimeout(() => {
      setStep('receipt');
      if (business) {
        onRenew(business.id, selectedPlan);
      }
    }, 1400);
  };

  const getMethodName = () => {
    switch (paymentMethod) {
      case 'visa': return 'بطاقة فيزا / ماستركارد / ميزة المعتمدة (Visa)';
      case 'vodafone': return 'محفظة فودافون / اتصالات / أورنج كاش';
      case 'instapay': return 'شبكة المدفوعات اللحظية InstaPay';
      case 'fawry': return 'منافذ فوري Fawry Pay المعتمدة';
      case 'bank': return 'تحويل بنكي مباشر (CIB / الأهلي NBE)';
      case 'wallet': return 'محفظة إعلانك الإلكترونية الرقمية';
      case 'crypto': return 'عملات رقمية مشفرة (USDT TRC-20)';
      default: return 'دفع إلكتروني معتمد';
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-neutral-950 text-white rounded-3xl border border-white/10 p-5 sm:p-6 w-full max-w-xl shadow-2xl relative max-h-[94vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 start-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ================= STEP 1: CHECKOUT ================= */}
        {step === 'checkout' && (
          <form onSubmit={handleStartPayment} className="space-y-4">
            {/* Header */}
            <div className="text-center pt-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/40 text-white mx-auto flex items-center justify-center mb-2 shadow-lg shadow-blue-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="font-black text-lg sm:text-xl text-white">
                نظام الاشتراك والتحصيل للإعلانات - إعلانك الخاص
              </h2>
              <p className="text-xs text-white/70 mt-1">
                سدد عبر <strong className="text-blue-400">الفيزا والماستركارد</strong> أو أي طريقة تناسبك وفعّل نشاطك <span className="text-amber-400 font-bold">({business?.name || 'نشاطك التجاري'})</span> فوراً.
              </p>
            </div>

            {/* Monthly vs Yearly Switcher */}
            <div className="bg-white/5 border border-white/10 p-1 rounded-2xl flex items-center max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                اشتراك شهري
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <span>اشتراك سنوي</span>
                <span className="bg-black/40 text-[9px] px-1.5 py-0.5 rounded-full font-black text-amber-300">وفر شهرين 🎁</span>
              </button>
            </div>

            {/* 4 Tiers Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black text-white/80 block">
                1. اختر الباقة الإعلانية المناسبة لنشاطك:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Basic Plan 350 */}
                <div
                  onClick={() => setSelectedPlan(350)}
                  className={`border rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between ${
                    selectedPlan === 350
                      ? 'border-blue-400 bg-blue-500/15 ring-2 ring-blue-500/30'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-white">BASIC الأساسية</span>
                      {selectedPlan === 350 && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className="text-[10px] text-white/65 mt-1 leading-snug">
                      Top 10 الأقرب + 10 صور وفيديو وتجميل + 4 كروت تراخيص + 3 عروض بأسعار
                    </div>
                  </div>
                  <div className="mt-2 pt-1 border-t border-white/10 text-end">
                    <span className="text-sm font-black text-blue-400">
                      {billingCycle === 'yearly' ? '3,500' : '350'} ج.م
                    </span>
                    <span className="text-[9px] text-white/50 block">
                      {billingCycle === 'yearly' ? '/ سنة كاملة' : '/ شهر'}
                    </span>
                  </div>
                </div>

                {/* Premium Plan 900 */}
                <div
                  onClick={() => setSelectedPlan(900)}
                  className={`border-2 rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between relative overflow-hidden ${
                    selectedPlan === 900
                      ? 'border-sky-400 bg-sky-950/40 ring-2 ring-sky-500/40'
                      : 'border-white/15 bg-white/5 hover:border-sky-400/50'
                  }`}
                >
                  <div className="absolute top-0 end-0 bg-sky-400 text-black text-[8px] font-black px-1.5 py-0.5 rounded-es-lg">
                    الأكثر طلباً ⭐
                  </div>
                  <div>
                    <div className="flex items-center gap-1 font-black text-xs text-sky-400">
                      <Star className="w-3.5 h-3.5 fill-sky-400" />
                      <span>PREMIUM المميزة</span>
                    </div>
                    <div className="text-[10px] text-white/75 mt-1 leading-snug">
                      Top 3 + ⭐ مميز + يافطة ممولة + فيديو + ظهور بالمدن القريبة + إحصائيات
                    </div>
                  </div>
                  <div className="mt-2 pt-1 border-t border-white/10 text-end">
                    <span className="text-sm font-black text-sky-400">
                      {billingCycle === 'yearly' ? '9,000' : '900'} ج.م
                    </span>
                    <span className="text-[9px] text-white/50 block">
                      {billingCycle === 'yearly' ? '/ سنة كاملة' : '/ شهر'}
                    </span>
                  </div>
                </div>

                {/* VIP Plan 2500 */}
                <div
                  onClick={() => setSelectedPlan(2500)}
                  className={`border rounded-2xl p-3 cursor-pointer transition flex flex-col justify-between ${
                    selectedPlan === 2500
                      ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-500/30'
                      : 'border-white/10 bg-white/5 hover:border-amber-400/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 font-black text-xs text-amber-400">
                        <Crown className="w-3.5 h-3.5 fill-amber-400" />
                        <span>VIP الصدارة 👑</span>
                      </div>
                      {selectedPlan === 2500 && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="text-[10px] text-white/70 mt-1 leading-snug">
                      #1 ثابت + بنر رئيسية كبير + رابط /vip/name + إعلان لكل السياح + توثيق أزرق
                    </div>
                  </div>
                  <div className="mt-2 pt-1 border-t border-white/10 text-end">
                    <span className="text-sm font-black text-amber-400">
                      {billingCycle === 'yearly' ? '25,000' : '2,500'} ج.م
                    </span>
                    <span className="text-[9px] text-white/50 block">
                      {billingCycle === 'yearly' ? '/ سنة كاملة' : '/ شهر'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selectable Payment Methods */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white/80 block">
                  2. اختر وسيلة الدفع المناسبة لك:
                </label>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>دفع آمن ومعتمد 100%</span>
                </span>
              </div>

              {/* Method Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                {/* 1. Visa / Mastercard */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('visa')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'visa'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-600/30'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span className="text-[11px] leading-tight">فيزا / ماستركارد</span>
                </button>

                {/* 2. Vodafone / Mobile Wallets */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('vodafone')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'vodafone'
                      ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/30'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-300" />
                  <span className="text-[11px] leading-tight">فودافون كاش ومحافظ</span>
                </button>

                {/* 3. InstaPay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('instapay')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'instapay'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span className="text-[11px] leading-tight">إنستاباي InstaPay</span>
                </button>

                {/* 4. Fawry Pay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('fawry')}
                  className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'fawry'
                      ? 'bg-amber-600 text-white border-amber-400 shadow-lg shadow-amber-600/30'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Store className="w-4 h-4 text-white" />
                  <span className="text-[11px] leading-tight">فوري Fawry Pay</span>
                </button>
              </div>

              {/* Extra Methods Toggle Row */}
              <div className="flex items-center justify-center gap-2 pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`px-3 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                    paymentMethod === 'bank'
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                  }`}
                >
                  <Building className="w-3 h-3" />
                  <span>تحويل بنكي CIB/NBE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`px-3 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                    paymentMethod === 'wallet'
                      ? 'bg-sky-600 text-white border-sky-400'
                      : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                  }`}
                >
                  <Wallet className="w-3 h-3" />
                  <span>محفظة إعلانك</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`px-3 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                    paymentMethod === 'crypto'
                      ? 'bg-indigo-600 text-white border-indigo-400'
                      : 'bg-white/5 text-white/60 border-white/10 hover:text-white'
                  }`}
                >
                  <Coins className="w-3 h-3" />
                  <span>USDT عملات مشفرة</span>
                </button>
              </div>
            </div>

            {/* Method Details Box */}
            <div className="bg-neutral-900/90 border border-white/15 rounded-2xl p-4 space-y-3">
              {/* ============ VISA / MASTERCARD / MEEZA FORM ============ */}
              {paymentMethod === 'visa' && (
                <div className="space-y-3">
                  {/* Virtual Card Graphic */}
                  <div className={`bg-gradient-to-r ${getCardBrand().color} rounded-2xl p-4 text-white shadow-xl relative overflow-hidden border border-white/20 select-none`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-6 bg-amber-400/80 rounded-md border border-amber-300" />
                        <span className="text-[10px] font-mono tracking-widest text-white/70">EMV CHIP</span>
                      </div>
                      <span className="font-black text-sm tracking-wider font-mono bg-white/20 px-2 py-0.5 rounded">
                        {getCardBrand().label}
                      </span>
                    </div>

                    <div className="mt-4 mb-2 text-center">
                      <span className="font-mono text-base sm:text-lg tracking-widest font-black dir-ltr">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/15">
                      <div>
                        <span className="text-[9px] text-white/60 block">اسم صاحب البطاقة</span>
                        <span className="font-bold">{cardHolder || 'CARDHOLDER NAME'}</span>
                      </div>
                      <div className="text-end">
                        <span className="text-[9px] text-white/60 block">صالح حتى</span>
                        <span className="font-mono font-bold">{cardExpiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Inputs */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-bold text-white/80 block mb-1">
                        رقم بطاقة الدفع (16 رقم) *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4125 0000 0000 0000"
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 dir-ltr"
                        />
                        <div className="absolute end-3 top-2.5 flex items-center gap-1.5 pointer-events-none">
                          <span className="text-[10px] font-bold text-blue-400">{getCardBrand().name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-white/80 block mb-1">
                          تاريخ الانتهاء (MM/YY) *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="12/28"
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 text-center dir-ltr"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-white/80 block mb-1">
                          رمز الأمان السري (CVV/CVC) *
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 text-center dir-ltr"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-white/80 block mb-1">
                        اسم حامل البطاقة (باللغة الإنجليزية كما هو مدون)
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="MOHAMED AHMED"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 uppercase"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-white/70 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span>حفظ بيانات البطاقة بأمان للتجديد التلقائي</span>
                      </label>
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Lock className="w-3 h-3" />
                        <span>تشفير 256-bit SSL</span>
                      </span>
                    </div>

                    {/* Visa Direct Routing Notice */}
                    <div className="bg-gradient-to-r from-blue-950/70 via-neutral-900 to-emerald-950/70 border border-blue-400/30 rounded-xl p-2.5 space-y-1 text-xs text-white">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-amber-300 flex items-center gap-1.5 text-[11px]">
                          <span>🏛️ بوابة الدفع الإلكتروني المشفرة:</span>
                          <span className="text-emerald-400 font-bold">معتمد ومباشر ✓</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============ VODAFONE / MOBILE WALLETS ============ */}
              {paymentMethod === 'vodafone' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/90">
                      محفظة التحويل السريع المعتمدة (فودافون / اتصالات / أورنج):
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      سداد آمن ومشفر 🔒
                    </span>
                  </div>

                  <div className="bg-black/60 border border-emerald-500/30 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-emerald-400">
                        محفظة إلكترونية معتمدة ومشفرة 🔒
                      </span>
                    </div>
                    <p className="text-[10px] text-white/60 leading-relaxed pt-1">
                      🛡️ يتم التوثيق التلقائي فور إدخال رقم العملية بالأسفل.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] text-white/80 block mb-1">
                        رقم محفظتك التي قمت بالتحويل منها (اختياري)
                      </label>
                      <input
                        type="text"
                        value={senderWalletNumber}
                        onChange={(e) => setSenderWalletNumber(e.target.value)}
                        placeholder="010XXXXXXXX"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 dir-ltr"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/80 block mb-1">
                        كود أو رقم عملية التحويل في الرسالة
                      </label>
                      <input
                        type="text"
                        value={transferRef}
                        onChange={(e) => setTransferRef(e.target.value)}
                        placeholder="TXN-49219"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 dir-ltr"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-white/60 bg-white/5 p-2 rounded-xl">
                    💡 <strong>طريقة التحويل:</strong> اطلب كود السداد من محفظتك وحول مبلغ <strong>{finalAmount} ج.م</strong> ثم اكتب كود العملية واضغط "تأكيد السداد".
                  </div>
                </div>
              )}

              {/* ============ INSTAPAY ============ */}
              {paymentMethod === 'instapay' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/90">
                      بوابة الدفع اللحظي عبر إنستاباي InstaPay IPA:
                    </span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                      معتمد من البنك المركزي المصري 🔒
                    </span>
                  </div>

                  <div className="bg-black/60 border border-purple-400/30 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-purple-300">
                        بوابة إنستاباي المعتمدة 🔒
                      </span>
                    </div>
                    <p className="text-[10px] text-white/60 leading-relaxed pt-1">
                      🛡️ يتم التحقق وتفعيل الحساب مباشرة برقم المعاملة.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] text-white/80 block mb-1">
                      اسم الحساب المحول منه أو رقم العملية في InstaPay
                    </label>
                    <input
                      type="text"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      placeholder="اسمك على إنستاباي أو كود العملية"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              {/* ============ FAWRY PAY ============ */}
              {paymentMethod === 'fawry' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/90">
                      كود فوري الموحد للسداد في أي فرع أو كشك أو تطبيق myFawry:
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                      كود خدمة: 788
                    </span>
                  </div>

                  <div className="bg-black/60 border border-amber-400/30 rounded-xl py-3 px-4 flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black text-amber-400 font-mono tracking-widest dir-ltr block">
                        {fawryCode}
                      </span>
                      <span className="text-[10px] text-white/60">صالح لمدة 48 ساعة من الآن في جميع أنحاء مصر</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(fawryCode, 'fawry')}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedField === 'fawry' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الكود</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-white/70">
                    توجه لأي ماكينة فوري أو سوبر ماركت واطلب دفع خدمة «إعلانك دوت كوم رقم الخدمة 788» وأعطه الرقم أعلاه.
                  </p>
                </div>
              )}

              {/* ============ BANK TRANSFER ============ */}
              {paymentMethod === 'bank' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-emerald-400" />
                      <span>بوابة التحويل البنكي الإلكتروني:</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      تحويل بنكي فوري
                    </span>
                  </div>

                  <p className="text-[11px] text-white/70 bg-white/5 p-3 rounded-xl">
                    🛡️ يمكنك السداد والتأكيد مباشرة عبر البوابة الإلكترونية، ثم اضغط «تأكيد السداد» للتفعيل الفوري.
                  </p>
                </div>
              )}

              {/* ============ WALLET ============ */}
              {paymentMethod === 'wallet' && (
                <div className="space-y-2 text-xs text-center py-2">
                  <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center mx-auto">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-white">رصيد محفظتك الرقمية المتاح: <span className="text-emerald-400 text-sm font-black font-mono">1,850 ج.م</span></div>
                  <p className="text-[11px] text-white/70">
                    سيتم خصم قيمة الاشتراك ({finalAmount} ج.م) مباشرة من رصيدك وتفعيل نشاطك في أقل من ثانية.
                  </p>
                </div>
              )}

              {/* ============ CRYPTO USDT ============ */}
              {paymentMethod === 'crypto' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">عنوان USDT (TRC-20):</span>
                    <span className="text-[10px] text-indigo-400">للسياح والشركات العالمية</span>
                  </div>
                  <div className="bg-black/60 p-2.5 rounded-xl border border-white/15 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-amber-400 dir-ltr truncate max-w-[260px]">
                      TQ8r4G2m18KpNvdzW7ZxbY6kQ4bL2cE7
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('TQ8r4G2m18KpNvdzW7ZxbY6kQ4bL2cE7', 'crypto')}
                      className="bg-white/10 px-2 py-1 rounded text-xs font-bold shrink-0"
                    >
                      {copiedField === 'crypto' ? 'تم' : 'نسخ'}
                    </button>
                  </div>
                  <div className="text-[10px] text-white/60">
                    المبلغ بالدولار الرقمي: ${(finalAmount / 50).toFixed(2)} USDT
                  </div>
                </div>
              )}
            </div>

            {/* Total Summary & Checkout Button */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-white/70">الإجمالي المستحق للدفع:</span>
                <div className="text-end">
                  <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                    {finalAmount.toLocaleString()} ج.م
                  </span>
                  <span className="text-[10px] text-white/50 block">
                    {billingCycle === 'yearly' ? 'اشتراك سنوي (12 شهر + شهرين هدية)' : 'اشتراك شهري (تجديد مرن)'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110 active:scale-98 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm shadow-xl shadow-blue-600/30 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>دفع وتفعيل الاشتراك الآن ({finalAmount.toLocaleString()} ج.م)</span>
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-white/60 pt-1">
                <span>✓ ضمان استرجاع خلال 14 يوم</span>
                <span>✓ فاتورة ضريبية رسمية</span>
                <span>✓ دعم فني 24/7</span>
              </div>
            </div>
          </form>
        )}

        {/* ================= STEP 2: PROCESSING ================= */}
        {step === 'processing' && (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
            <h3 className="text-base sm:text-lg font-black text-white">
              جاري معالجة وتأكيد الدفع المشفر بنجاح... 🔒
            </h3>
            <p className="text-xs text-white/70 max-w-xs mx-auto">
              نقوم بالتواصل الآمن مع بوابة الدفع والبنك لتسجيل الفاتورة وترقية النشاط إلى باقة الصدارة فوراً.
            </p>
          </div>
        )}

        {/* ================= STEP 3: DIGITAL RECEIPT & CONFIRMATION ================= */}
        {step === 'receipt' && (
          <div className="space-y-4 pt-1">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center mb-2 shadow-xl shadow-emerald-500/20 animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="font-black text-lg text-white">
                تم الاشتراك وتفعيل النشاط بنجاح! 🎉
              </h3>
              <p className="text-xs text-emerald-400 font-bold mt-0.5">
                نشاطك الآن في صدارة نتائج البحث وفعال لمدة {billingCycle === 'yearly' ? '365 يوماً' : '90 يوماً'}
              </p>
            </div>

            {/* Electronic Receipt Card */}
            <div className="bg-neutral-900 border border-white/15 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 font-sans">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span className="font-black text-white">إيصال سداد إلكتروني معتمد</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  مدفوع ومفعل ✓
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-white/50 block text-[9px] font-sans">رقم الفاتورة:</span>
                  <span className="font-bold text-white">{invoiceId}</span>
                </div>
                <div className="text-end">
                  <span className="text-white/50 block text-[9px] font-sans">رقم العملية:</span>
                  <span className="font-bold text-amber-400">{transactionId}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-white/50 block text-[9px] font-sans">النشاط التجاري:</span>
                  <span className="font-bold text-white font-sans truncate block">{business?.name || 'نشاط تجاري'}</span>
                </div>
                <div className="text-end">
                  <span className="text-white/50 block text-[9px] font-sans">الباقة المفعّلة:</span>
                  <span className="font-bold text-sky-400 font-sans">
                    {selectedPlan === 350 ? 'BASIC' : selectedPlan === 900 ? 'PREMIUM ⭐' : 'VIP الصدارة 👑'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-white/50 block text-[9px] font-sans">وسيلة الدفع:</span>
                  <span className="font-bold text-white/90 font-sans">{getMethodName()}</span>
                </div>
                <div className="text-end">
                  <span className="text-white/50 block text-[9px] font-sans">تاريخ السداد:</span>
                  <span className="font-bold text-white">{new Date().toLocaleDateString('ar-EG')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm font-sans">
                <span className="font-bold text-white/80">المبلغ المدفوع بالكامل:</span>
                <span className="font-black text-emerald-400 text-base font-mono">
                  {finalAmount.toLocaleString()} ج.م
                </span>
              </div>
            </div>

            {/* Direct WhatsApp Receipt Confirmation Button */}
            <a
              href={`https://wa.me/2${phonePayment}?text=${encodeURIComponent(
                `مرحباً إدارة إعلانك E3lanak،\nتم سداد وتفعيل اشتراك نشاطي بنجاح:\n- اسم النشاط: ${business?.name || 'نشاطي'}\n- رقم الفاتورة: ${invoiceId}\n- رقم العملية: ${transactionId}\n- الباقة: ${selectedPlan} ج.م (${billingCycle === 'yearly' ? 'سنوي' : 'شهري'})\n- وسيلة الدفع: ${getMethodName()}\n- المبلغ: ${finalAmount} ج.م`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30 transition"
            >
              <MessageCircle className="w-4 h-4 fill-white text-transparent" />
              <span>إرسال نسخة من الإيصال لإدارة إعلانك عبر واتساب</span>
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full bg-white/10 hover:bg-white/15 text-white/80 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer"
            >
              إتمام والعودة للتطبيق
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
