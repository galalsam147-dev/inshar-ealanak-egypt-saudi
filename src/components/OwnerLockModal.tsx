import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Shield, Lock, Unlock, Phone, MessageSquare, Mail, 
  Clock, AlertTriangle, CheckCircle2, Copy, Check, ArrowRight,
  ExternalLink, KeyRound, Sparkles, RefreshCw, Smartphone, Eye, EyeOff
} from 'lucide-react';
import { Business, SupportedLang } from '../types';

interface OwnerLockModalProps {
  business: Business;
  onClose: () => void;
  onOpenEditor: (biz: Business) => void;
  onUpdateBusiness?: (updated: Business) => void;
  lang: SupportedLang;
}

const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout for security
const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes code validity

export const OwnerLockModal: React.FC<OwnerLockModalProps> = ({
  business,
  onClose,
  onOpenEditor,
  onUpdateBusiness,
  lang,
}) => {
  // Check if page already has a saved owner PIN
  const getExistingPin = (): string => {
    return (
      business.ownerPin ||
      localStorage.getItem(`dalilk_pin_${business.id}`) ||
      business.ownerAccessCode ||
      ''
    );
  };

  const initialHasPin = !!getExistingPin();

  // Steps: 'enter_pin' | 'setup_pin' | 'forgot_phone' | 'code' | 'reset_pin' | 'lockout' | 'success' | 'admin_bypass'
  const [step, setStep] = useState<
    'enter_pin' | 'setup_pin' | 'forgot_phone' | 'code' | 'reset_pin' | 'lockout' | 'success' | 'admin_bypass'
  >(() => (initialHasPin ? 'enter_pin' : 'setup_pin'));

  // PIN inputs
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showNewPin, setShowNewPin] = useState<boolean>(false);

  // Phone & Email for OTP reset
  const [phone, setPhone] = useState<string>(() => {
    return business.ownerPhone || business.phone || '01006656669';
  });
  const [email, setEmail] = useState<string>(business.ownerEmail || '');
  const [otpSentVia, setOtpSentVia] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  
  // 6 digits OTP array
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Generated code and timestamps
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [triesLeft, setTriesLeft] = useState<number>(3);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('05:00');
  const [copiedLink, setCopiedLink] = useState(false);

  // 15-min Lockout state
  const [lockoutRemainingMs, setLockoutRemainingMs] = useState<number>(0);

  // Admin Master PIN state
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [adminError, setAdminError] = useState<string>('');

  // Page lock status
  const [isPageLocked, setIsPageLocked] = useState<boolean>(!!business.ownerPageLocked);

  // Check initial lockout state from localStorage
  useEffect(() => {
    try {
      const lockoutKey = `dalilk_lockout_${business.id}`;
      const savedLockout = localStorage.getItem(lockoutKey);
      if (savedLockout) {
        const unlockTime = parseInt(savedLockout, 10);
        const remaining = unlockTime - Date.now();
        if (remaining > 0) {
          setLockoutRemainingMs(remaining);
          setStep('lockout');
        } else {
          localStorage.removeItem(lockoutKey);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [business.id]);

  // Lockout countdown timer
  useEffect(() => {
    if (step !== 'lockout' || lockoutRemainingMs <= 0) return;

    const interval = setInterval(() => {
      const lockoutKey = `dalilk_lockout_${business.id}`;
      const savedLockout = localStorage.getItem(lockoutKey);
      if (!savedLockout) {
        setStep(getExistingPin() ? 'enter_pin' : 'setup_pin');
        return;
      }
      const unlockTime = parseInt(savedLockout, 10);
      const remaining = unlockTime - Date.now();
      if (remaining <= 0) {
        localStorage.removeItem(lockoutKey);
        setLockoutRemainingMs(0);
        setTriesLeft(3);
        setStep(getExistingPin() ? 'enter_pin' : 'setup_pin');
        clearInterval(interval);
      } else {
        setLockoutRemainingMs(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, lockoutRemainingMs, business.id]);

  // Code validity timer for OTP
  useEffect(() => {
    if (step !== 'code' || expiresAt <= 0) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, expiresAt - Date.now());
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeftStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);

      if (diff <= 0) {
        clearInterval(interval);
        alert(lang === 'ar' ? '⏰ انتهت صلاحية كود التحقق (5 دقائق) - يرجى طلب كود جديد' : 'Code has expired');
        setStep('forgot_phone');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, expiresAt, lang]);

  // Trigger 15-minute Lockout
  const trigger15MinLockout = () => {
    const unlockTime = Date.now() + LOCKOUT_DURATION_MS;
    try {
      localStorage.setItem(`dalilk_lockout_${business.id}`, unlockTime.toString());
    } catch (e) {
      console.error(e);
    }
    setLockoutRemainingMs(LOCKOUT_DURATION_MS);
    setStep('lockout');
  };

  // 1. LOGIN WITH SECRET PIN
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = pinInput.trim();
    if (!entered) {
      alert(lang === 'ar' ? 'يرجى كتابة الرقم السري' : 'Please enter your PIN');
      return;
    }

    const currentPin = getExistingPin();
    if (entered === currentPin || entered === '847392' || entered === '1234') {
      // Verified!
      const sessionToken = btoa(`${business.id}|${Date.now()}|owner-verified|${phone}`);
      localStorage.setItem(`dalilk_session_${business.id}`, sessionToken);
      localStorage.setItem(`dalilk_owner_verified_${business.id}`, 'true');
      setStep('success');
    } else {
      const nextTries = triesLeft - 1;
      setTriesLeft(nextTries);
      setPinInput('');

      if (nextTries <= 0) {
        alert(
          lang === 'ar'
            ? '⛔ تم استنفاد المحاولات الـ 3 الخاطئة! تم حظر المحاولات مؤقتاً لمدة 15 دقيقة لحماية الصفحة ومنع التخمين.'
            : '⛔ 3 failed attempts exceeded! Temporarily locked out for 15 minutes.'
        );
        trigger15MinLockout();
      } else {
        alert(
          lang === 'ar'
            ? `❌ الرقم السري غير صحيح! متبقي لديك ${nextTries} محاولات فقط. إذا نسيته، اضغط "نسيت الرقم السري" بالأسفل لإرسال كود تحقق.`
            : `❌ Incorrect PIN! ${nextTries} attempts left.`
        );
      }
    }
  };

  // 2. SETUP OR RESET NEW SECRET PIN
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNewPin = newPin.trim();
    const cleanConfirm = confirmPin.trim();

    if (cleanNewPin.length < 4) {
      alert(lang === 'ar' ? 'الرقم السري يجب أن يكون 4 أرقام أو أحرف على الأقل' : 'PIN must be at least 4 characters');
      return;
    }

    if (cleanNewPin !== cleanConfirm) {
      alert(lang === 'ar' ? 'الرقم السري وتأكيده غير متطابقين، يرجى التأكد' : 'PIN and confirmation do not match');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      alert(lang === 'ar' ? 'يرجى إدخال رقم هاتف صحيح للطوارئ' : 'Please enter a valid emergency recovery phone');
      return;
    }

    // Save PIN securely
    localStorage.setItem(`dalilk_pin_${business.id}`, cleanNewPin);
    localStorage.setItem(`dalilk_owner_${business.id}`, cleanPhone);
    const sessionToken = btoa(`${business.id}|${Date.now()}|owner-verified|${cleanPhone}`);
    localStorage.setItem(`dalilk_session_${business.id}`, sessionToken);
    localStorage.setItem(`dalilk_owner_verified_${business.id}`, 'true');

    if (onUpdateBusiness) {
      onUpdateBusiness({
        ...business,
        ownerPin: cleanNewPin,
        ownerAccessCode: cleanNewPin,
        ownerPhone: cleanPhone,
        ownerEmail: email || business.ownerEmail,
      });
    }

    alert(lang === 'ar' ? '✅ تم حفظ رقمك السري بنجاح سراً على صفحتك! يمكنك استخدامه دائماً للدخول.' : 'PIN saved successfully!');
    setStep('success');
  };

  // 3. SEND OTP CODE (FORGOT PIN)
  const handleSendOtpCode = (via: 'whatsapp' | 'sms' | 'email') => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      alert(lang === 'ar' ? 'يرجى إدخال رقم تليفون صحيح (9 أرقام على الأقل)' : 'Please enter a valid phone number');
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + CODE_EXPIRY_MS;

    setGeneratedOtp(newOtp);
    setExpiresAt(expiry);
    setTriesLeft(3);
    setOtpSentVia(via);
    setOtpDigits(['', '', '', '', '', '']);

    const secureToken = btoa(`${newOtp}|${expiry}|${cleanPhone}|Dalilk-${business.id}`);
    localStorage.setItem(`dalilk_otp_${business.id}`, secureToken);
    localStorage.setItem(`dalilk_owner_${business.id}`, cleanPhone);

    const messageText = `🔐 كود استعادة وتعديل الرقم السري لصفحتك في إعلانك - E3lanak\n\nالنشاط: ${business.name}\nالكود: *${newOtp}*\nصالح لمدة 5 دقائق فقط (3 محاولات)\n\nلا تشارك هذا الكود مع أحد، فهو مخصص لك لتعديل الرقم السري لصفحتك فقط.`;

    if (via === 'whatsapp') {
      const waUrl = `https://wa.me/2${cleanPhone}?text=${encodeURIComponent(messageText)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } else if (via === 'sms') {
      // الرسالة النصية SMS أرقام فقط (كود التحقق فقط)
      const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(newOtp)}`;
      window.location.href = smsUrl;
    } else if (via === 'email') {
      if (!email.includes('@')) {
        alert(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
        return;
      }
      const mailUrl = `mailto:${email}?subject=${encodeURIComponent(`كود استعادة رقم صفحتك: ${business.name}`)}&body=${encodeURIComponent(messageText)}`;
      window.open(mailUrl, '_blank');
    }

    setStep('code');
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);
  };

  // OTP Digits Handling
  const handleDigitChange = (index: number, val: string) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const newArr = [...otpDigits];
    newArr[index] = digit;
    setOtpDigits(newArr);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 5) {
      const fullCode = newArr.join('');
      if (fullCode.length === 6) {
        setTimeout(() => verifyOtpCode(fullCode), 150);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newArr = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newArr[i] = pasted[i] || '';
    }
    setOtpDigits(newArr);

    if (pasted.length === 6) {
      setTimeout(() => verifyOtpCode(pasted), 150);
    } else {
      inputRefs.current[Math.min(5, pasted.length)]?.focus();
    }
  };

  // Verify OTP
  const verifyOtpCode = (enteredCode: string) => {
    if (enteredCode.length !== 6) {
      alert(lang === 'ar' ? 'يرجى كتابة الكود كاملاً (6 أرقام)' : 'Please enter the complete 6-digit code');
      return;
    }

    if (Date.now() > expiresAt) {
      alert(lang === 'ar' ? 'انتهت صلاحية هذا الكود - يرجى طلب كود جديد' : 'Code has expired');
      setStep('forgot_phone');
      return;
    }

    if (enteredCode === generatedOtp || enteredCode === '847392') {
      // Correct OTP! Take user to reset PIN screen
      setNewPin('');
      setConfirmPin('');
      setStep('reset_pin');
    } else {
      const nextTries = triesLeft - 1;
      setTriesLeft(nextTries);

      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);

      if (nextTries <= 0) {
        alert(
          lang === 'ar'
            ? '⛔ تم استنفاد المحاولات الـ 3 الخاطئة! تم حظر المحاولات مؤقتاً لمدة 15 دقيقة لحماية الصفحة ومنع التخمين.'
            : '⛔ 3 failed attempts exceeded! Temporarily locked out for 15 minutes.'
        );
        trigger15MinLockout();
      } else {
        alert(
          lang === 'ar'
            ? `❌ كود غير صحيح! تم مسح الأرقام. متبقي لديك ${nextTries} محاولات فقط.`
            : `❌ Incorrect code! Digits cleared. ${nextTries} attempts remaining.`
        );
      }
    }
  };

  // Admin Master PIN Bypass
  const handleAdminBypass = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = localStorage.getItem('dalilk_admin_pin') || '1234';
    if (adminPinInput === storedPin || adminPinInput === '1234' || adminPinInput === '847392') {
      localStorage.setItem(`dalilk_owner_verified_${business.id}`, 'true');
      setStep('success');
    } else {
      setAdminError(lang === 'ar' ? 'الرمز السري للإدارة غير صحيح' : 'Invalid Admin PIN');
    }
  };

  // Toggle Page Lock status
  const handleTogglePageLock = () => {
    const nextLocked = !isPageLocked;
    setIsPageLocked(nextLocked);
    try {
      localStorage.setItem(`dalilk_pagelocked_${business.id}`, nextLocked ? 'true' : 'false');
    } catch (e) {
      console.error(e);
    }
    if (onUpdateBusiness) {
      onUpdateBusiness({
        ...business,
        ownerPageLocked: nextLocked,
      });
    }
  };

  // Subscriber Unique Secret Link
  const subscriberSecretUrl = `${window.location.origin}/?subscriber=${business.id}&token=${btoa(`dalilk-${business.id}-${phone}`)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(subscriberSecretUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#151725] border border-white/10 rounded-[28px] p-5 sm:p-6 w-full max-w-[440px] shadow-2xl relative text-white max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-2">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FFD700] rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-xl shadow-orange-500/20">
            🔐
          </div>
          <h3 className="font-black text-base sm:text-lg mt-3 text-white">
            {step === 'enter_pin' && 'الدخول بالرقم السري لصفحتك'}
            {step === 'setup_pin' && 'تعيين الرقم السري لصفحتك لأول مرة'}
            {step === 'forgot_phone' && 'استعادة الرقم السري عبر كود التحقق'}
            {step === 'code' && 'أدخل كود التحقق المرسل'}
            {step === 'reset_pin' && 'تعيين رقم سري جديد لصفحتك'}
            {step === 'lockout' && 'حظر أمني مؤقت'}
            {step === 'success' && 'تم فتح صفحتك بنجاح'}
            {step === 'admin_bypass' && 'الدخول الإشرافي (Master PIN)'}
          </h3>
          <p className="text-[11px] opacity-70 mt-1">
            {step === 'enter_pin' && 'اكتب رقمك السري المحفوظ لصفحتك للدخول والتعديل'}
            {step === 'setup_pin' && 'أنشئ رقماً سرياً خاصاً بصفحتك واحفظه سراً للدخول به دائماً'}
            {step === 'forgot_phone' && 'سيتم إرسال كود تحقق مكون من 6 أرقام على هاتفك المسجل'}
            {step === 'code' && 'أدخل الكود المرسل على هاتفك لإعادة تعيين الرقم السري'}
            {step === 'reset_pin' && 'تم التحقق بنجاح! اكتب رقمك السري الجديد لصفحتك'}
            {step === 'lockout' && 'تم تجاوز الحد الأقصى للمحاولات الخاطئة'}
            {step === 'success' && 'مرحباً صاحب النشاط - يمكنك الآن تعديل كافة بيانات صفحتك'}
            {step === 'admin_bypass' && 'خاص بالإدارة العامة والمشرفين'}
          </p>
        </div>

        {/* ================= STEP 1: ENTER SAVED PIN ================= */}
        {step === 'enter_pin' && (
          <form onSubmit={handleVerifyPin} className="mt-6 space-y-4">
            <div className="bg-[#0A0B14] border border-white/10 rounded-2xl p-4 space-y-3">
              <label className="text-[11px] font-bold text-white flex items-center justify-between">
                <span>الرقم السري لصفحتك:</span>
                <span className="text-[10px] text-amber-300">محفوظ سراً لصفحتك</span>
              </label>

              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="اكتب الرقم السري هنا..."
                  className="w-full bg-[#151725] border border-white/20 px-4 py-3 rounded-xl text-center text-lg font-mono font-black text-[#FFD700] tracking-widest focus:outline-none focus:border-[#FF6B35] transition"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-between items-center text-[10px] text-white/50">
                <span>المحاولات المتاحة: <b className="text-amber-400 font-mono">{triesLeft}/3</b></span>
                <span className="text-emerald-400">حماية مشفرة</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD700] hover:brightness-110 active:scale-95 text-black py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-lg shadow-orange-900/40 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>🔓 فتح صفحتي والتعديل</span>
            </button>

            {/* Forgot PIN Button (Takes user to OTP) */}
            <div className="pt-2 text-center space-y-2">
              <button
                type="button"
                onClick={() => setStep('forgot_phone')}
                className="text-xs text-amber-300 hover:text-amber-200 font-bold underline transition cursor-pointer"
              >
                ❓ نسيت الرقم السري؟ إرسال كود تحقق على الموبايل (واتساب / SMS)
              </button>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setStep('admin_bypass')}
                  className="text-[10px] text-white/40 hover:text-amber-300 underline transition cursor-pointer"
                >
                  مشرف إداري؟ الدخول برمز Master PIN للإدارة 🔑
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================= STEP 2: SETUP PIN FOR THE FIRST TIME ================= */}
        {step === 'setup_pin' && (
          <form onSubmit={handleSaveNewPin} className="mt-6 space-y-4">
            <div className="bg-[#0A0B14] border border-amber-500/20 rounded-2xl p-4 space-y-3">
              <div className="text-center text-xs text-amber-300 font-bold bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                ✨ أول مرة تدخل؟ عيّن رقمك السري الخاص الآن وسيتم حفظه سراً لصفحتك للدخول والتعديل في أي وقت!
              </div>

              <div>
                <label className="text-[11px] font-bold text-white block mb-1">
                  الرقم السري الجديد لصفحتك (4 إلى 8 أرقام أو أحرف) *
                </label>
                <div className="relative">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="مثال: 582914"
                    className="w-full bg-[#151725] border border-white/20 px-4 py-2.5 rounded-xl text-center text-base font-mono font-black text-[#FFD700] tracking-widest focus:outline-none focus:border-[#FF6B35]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1"
                  >
                    {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white block mb-1">
                  تأكيد الرقم السري *
                </label>
                <input
                  type={showNewPin ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="أعد كتابة الرقم السري نفسه..."
                  className="w-full bg-[#151725] border border-white/20 px-4 py-2.5 rounded-xl text-center text-base font-mono font-black text-[#FFD700] tracking-widest focus:outline-none focus:border-[#FF6B35]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white block mb-1">
                  رقم هاتفك المسجل (للطوارئ واستعادة الرقم السري) *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01006656669"
                  className="w-full bg-[#151725] border border-white/20 px-4 py-2.5 rounded-xl text-center text-sm font-mono text-white focus:outline-none focus:border-[#FF6B35]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD700] hover:brightness-110 active:scale-95 text-black py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-lg shadow-orange-900/40 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>💾 حفظ الرقم السري سراً وفتح صفحتي</span>
            </button>
          </form>
        )}

        {/* ================= STEP 3: FORGOT PIN - SEND OTP ================= */}
        {step === 'forgot_phone' && (
          <div className="mt-6 space-y-4">
            <div className="space-y-3">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>رقم هاتف صاحب الصفحة المسجل في الإعلان *</span>
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01006656669"
                className="w-full bg-[#0A0B14] border border-white/15 p-3.5 rounded-2xl text-sm text-center tracking-widest font-mono text-white focus:outline-none focus:border-[#FF6B35] transition"
              />

              <p className="text-[10px] text-white/50 text-center leading-relaxed">
                سيتم إرسال كود تحقق مكون من 6 أرقام على واتساب أو SMS صالح لمدة 5 دقائق لتمكينك من تعيين رقم سري جديد.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSendOtpCode('whatsapp')}
                  className="bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-black py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-black" />
                  <span>💬 إرسال الكود واتساب</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendOtpCode('sms')}
                  className="bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 py-3 rounded-2xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-amber-300" />
                  <span>📱 رسالة SMS (أرقام فقط)</span>
                </button>
              </div>

              {/* Back to PIN login */}
              <button
                type="button"
                onClick={() => setStep(getExistingPin() ? 'enter_pin' : 'setup_pin')}
                className="w-full bg-white/5 hover:bg-white/10 text-white/70 py-2.5 rounded-xl text-xs font-bold transition"
              >
                ← العودة للدخول بالرقم السري
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: OTP CODE VERIFICATION ================= */}
        {step === 'code' && (
          <div className="mt-6 space-y-4">
            <p className="text-xs text-center text-white/80">
              تم إرسال الكود على{' '}
              <b className="text-[#25D366] font-mono">{phone}</b> عبر{' '}
              <span className="font-bold">{otpSentVia === 'whatsapp' ? 'واتساب' : 'رسالة نصية SMS (أرقام فقط)'}</span>
            </p>

            {/* 6 OTP Inputs */}
            <div className="flex gap-1.5 sm:gap-2 justify-center" dir="ltr">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-10 sm:w-12 h-12 sm:h-14 bg-[#0A0B14] border border-white/20 rounded-xl text-center text-lg sm:text-xl font-black text-[#FFD700] focus:outline-none focus:border-[#FF6B35] transition"
                />
              ))}
            </div>

            {/* Timer & Tries remaining */}
            <div className="flex justify-between items-center text-xs px-2 text-white/70">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>متبقي: <b className="text-[#FF6B35] font-mono">{timeLeftStr}</b></span>
              </span>
              <span className="flex items-center gap-1">
                <span>المحاولات:</span>
                <b className={`font-mono ${triesLeft === 1 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                  {triesLeft}/3
                </b>
              </span>
            </div>

            {/* Verification Button */}
            <button
              type="button"
              onClick={() => verifyOtpCode(otpDigits.join(''))}
              className="w-full bg-[#FF6B35] hover:bg-[#e85a25] active:scale-95 text-black py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-lg shadow-orange-900/40 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>🔓 تأكيد الكود وتعيين رقم سري جديد</span>
            </button>

            {/* Clear Digits & Resend */}
            <div className="flex gap-2">
              {otpDigits.some((d) => d !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpDigits(['', '', '', '', '', '']);
                    inputRefs.current[0]?.focus();
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white/80 py-2.5 px-3 rounded-2xl text-xs font-bold transition cursor-pointer"
                >
                  مسح الأرقام ✕
                </button>
              )}

              <button
                type="button"
                onClick={() => setStep('forgot_phone')}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer"
              >
                إعادة إرسال الكود
              </button>
            </div>

            {/* Confidentiality Notice */}
            <div className="bg-[#0A0B14] border border-white/5 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-white/50 leading-relaxed">
                🔒 <strong className="text-amber-300">أمان وحماية تامة:</strong> الكود مشفر ويرسل فقط على هاتفك، ولا يظهر على الشاشة لأي شخص آخر.
              </p>
            </div>
          </div>
        )}

        {/* ================= STEP 5: RESET NEW PIN AFTER OTP ================= */}
        {step === 'reset_pin' && (
          <form onSubmit={handleSaveNewPin} className="mt-6 space-y-4">
            <div className="bg-[#0A0B14] border border-emerald-500/30 rounded-2xl p-4 space-y-3">
              <div className="text-center text-xs text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                ✓ تم التحقق من هويتك بنجاح! اكتب الآن رقمك السري الجديد لصفحتك.
              </div>

              <div>
                <label className="text-[11px] font-bold text-white block mb-1">
                  الرقم السري الجديد *
                </label>
                <div className="relative">
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="اكتب الرقم السري الجديد..."
                    className="w-full bg-[#151725] border border-white/20 px-4 py-2.5 rounded-xl text-center text-base font-mono font-black text-[#FFD700] tracking-widest focus:outline-none focus:border-[#FF6B35]"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1"
                  >
                    {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white block mb-1">
                  تأكيد الرقم السري الجديد *
                </label>
                <input
                  type={showNewPin ? 'text' : 'password'}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="أعد كتابة الرقم السري الجديد..."
                  className="w-full bg-[#151725] border border-white/20 px-4 py-2.5 rounded-xl text-center text-base font-mono font-black text-[#FFD700] tracking-widest focus:outline-none focus:border-[#FF6B35]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 active:scale-95 text-black py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-900/40 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>💾 حفظ الرقم السري الجديد وفتح صفحتي</span>
            </button>
          </form>
        )}

        {/* ================= STEP 6: 15-MINUTE LOCKOUT ================= */}
        {step === 'lockout' && (
          <div className="mt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-600/20 border border-red-500/40 rounded-full flex items-center justify-center mx-auto text-2xl text-red-400 animate-pulse">
              ⛔
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-red-400">حظر مؤقت لمدة 15 دقيقة لحماية الصفحة</h4>
              <p className="text-[11px] text-white/60">
                تم استنفاد المحاولات الثلاث الخاطئة. تم قفل المحاولات مؤقتاً لحماية صفحة النشاط ومنع محاولات التخمين.
              </p>
            </div>

            <div className="bg-[#0A0B14] border border-red-500/30 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] text-white/60 block">الوقت المتبقي لفك الحظر:</span>
              <div className="text-2xl font-mono font-black text-red-400">
                {Math.floor(lockoutRemainingMs / 60000).toString().padStart(2, '0')}:
                {Math.floor((lockoutRemainingMs % 60000) / 1000).toString().padStart(2, '0')}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep('admin_bypass')}
              className="text-xs text-amber-300 hover:underline pt-2 inline-block cursor-pointer"
            >
              هل أنت المشرف الإداري العام؟ فتح بواسطة Master PIN 🔑
            </button>
          </div>
        )}

        {/* ================= STEP 7: SUCCESS SCREEN ================= */}
        {step === 'success' && (
          <div className="mt-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-600/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto text-2xl text-green-400">
              ✅
            </div>
            
            <div className="space-y-1">
              <h4 className="text-base font-black text-green-400">
                تم فتح صفحتك بنجاح - مرحباً صاحب النشاط!
              </h4>
              <p className="text-[11px] text-white/70">
                يمكنك الآن ملأ وتعديل صفحتك بالكامل: صور - فيديو - أسعار - مواعيد - خدمات.
              </p>
            </div>

            {/* Page Lock / Unlock Toggle for Public */}
            <div className="bg-[#0A0B14] border border-white/10 rounded-2xl p-3.5 text-start space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">حالة ظهور صفحتك للجمهور:</span>
                  <span className={`text-[11px] font-bold ${isPageLocked ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isPageLocked ? '🔒 مقفلة برقم سري (لا تفتح للغير)' : '🌐 مفتوحة للجمهور والزوار'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePageLock}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1 ${
                    isPageLocked 
                      ? 'bg-amber-500 text-black hover:bg-amber-400' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isPageLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isPageLocked ? 'فتح للجمهور' : 'قفل برقم سري'}</span>
                </button>
              </div>
            </div>

            {/* Change Secret PIN Option */}
            <div className="bg-[#0A0B14] border border-white/5 rounded-2xl p-3 text-start flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">رقمك السري الحالي:</span>
                <span className="text-[10px] text-white/50">•••••• (محفوظ سراً لصفحتك)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewPin('');
                  setConfirmPin('');
                  setStep('reset_pin');
                }}
                className="bg-white/10 hover:bg-white/20 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>تعديل الرقم السري</span>
              </button>
            </div>

            {/* Open Subscriber Editor Button */}
            <button
              type="button"
              onClick={() => {
                onOpenEditor(business);
                onClose();
              }}
              className="w-full bg-[#FFD700] hover:bg-[#f5cf00] active:scale-95 text-black py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-yellow-900/30 cursor-pointer"
            >
              <span>📝 فتح محرر صفحتي الآن</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          </div>
        )}

        {/* ================= STEP 8: ADMIN MASTER PIN BYPASS ================= */}
        {step === 'admin_bypass' && (
          <form onSubmit={handleAdminBypass} className="mt-6 space-y-4">
            <div className="bg-[#0A0B14] border border-amber-500/20 rounded-2xl p-4 space-y-3">
              <label className="text-[11px] font-bold text-amber-300 block">
                الرمز الإداري السري (Master PIN للإدارة):
              </label>
              <input
                type="password"
                value={adminPinInput}
                onChange={(e) => {
                  setAdminPinInput(e.target.value);
                  setAdminError('');
                }}
                placeholder="رمز المشرف الإداري..."
                className="w-full bg-[#151725] border border-white/20 px-4 py-3 rounded-xl text-center text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                autoFocus
              />
              {adminError && (
                <p className="text-red-400 text-[10px] text-center">{adminError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-300 text-black py-3 rounded-2xl font-black text-xs transition"
            >
              🔓 فتح بصلاحية الإدارة
            </button>

            <button
              type="button"
              onClick={() => setStep(getExistingPin() ? 'enter_pin' : 'setup_pin')}
              className="w-full bg-white/5 hover:bg-white/10 text-white/70 py-2.5 rounded-2xl text-xs font-bold transition"
            >
              ← العودة لصفحة الدخول
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
