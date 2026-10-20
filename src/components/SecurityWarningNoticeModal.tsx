import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, X, 
  FileText, Lock, Eye, AlertOctagon, PhoneCall, MessageCircle, 
  ShieldCheck, ArrowRight, UserCheck
} from 'lucide-react';
import { SupportedLang } from '../types';

interface SecurityWarningNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLang;
}

export const SecurityWarningNoticeModal: React.FC<SecurityWarningNoticeModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;
  const isAr = lang === 'ar';

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="bg-[#121420] border-2 border-red-500/60 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative my-auto text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-900 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md text-red-200 flex items-center justify-center shadow-lg border border-red-400/40">
              <ShieldAlert className="w-7 h-7 animate-pulse text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  تحذير أمني وقانوني وإخلاء مسؤولية رسمي ⚠️
                </h3>
                <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                  هام جداً للجميع
                </span>
              </div>
              <p className="text-[11px] text-red-100/90">
                منصة إعلانك - سياسة النشر، الرقابة، ومكافحة رسائل الدعاية والنصب
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs leading-relaxed">
          
          {/* Section 1: Warning against fraudulent promo bulk messages */}
          <div className="bg-red-950/50 border border-red-500/50 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-black text-red-300 text-sm">
              <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />
              <span>1. تحذير من رسائل الدعاية المجهولة والنصب والاحتيال (SMS والواتساب)</span>
            </div>
            <p className="text-white/85 text-[11px]">
              تُحذر إدارة منصة <strong>إعلانك</strong> كافة المستخدمين والعملاء والزوار من أي رسائل دعاية أو عروض مجهولة المصدر تُرسل يدويّاً أو آليّاً عبر رسائل الموبايل القصيرة (SMS) أو رسائل الواتساب لأرقام هواتف عشوائية وتدعي كذباً أنها صادرة من إدارة المنصة:
            </p>
            <div className="bg-black/60 border border-red-400/30 p-2.5 rounded-xl space-y-1 text-[11px] text-amber-200">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <span>🛡️ إخلاء مسؤولية صريح:</span>
              </div>
              <div>
                • إدارة المنصة <strong>غير مسؤولة قانونيّاً أو ماديّاً</strong> عن أي عمليات نصب أو احتيال أو رسائل كاذبة تُرسل خارج المنصة.
              </div>
              <div>
                • تأكد دائماً بنفسك من هوية النشاط التجاري ومعاينة الإعلان والأسعار داخل المنصة الرسمية قبل تحويل أي مبالغ أو التعامل المالي.
              </div>
            </div>
          </div>

          {/* Section 2: Legal and Criminal Responsibility of the Subscriber */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-300 text-sm">
              <FileText className="w-5 h-5 text-amber-400 shrink-0" />
              <span>2. المسؤولية القانونية والجنائية للمشترك والمعلن</span>
            </div>
            <p className="text-white/85 text-[11px]">
              يُقر كل مشترك أو معلن أو كابتن دليفري يسجل في منصة <strong>إعلانك</strong> بالآتي:
            </p>
            <ul className="list-disc list-inside space-y-1 text-white/80 text-[11px] pr-2">
              <li>
                <strong>المسؤولية القانونية والجنائية الكاملة:</strong> يتحمل المشترك وحده المسؤولية القانونية والجنائية عن كافة ما ينشره من بيانات أو صور أو فيديوهات أو أسعار أو خدمات أو تراخيص معلنة.
              </li>
              <li>
                أي إعلان يتضمن تضليلاً، خداعاً للعملاء، انتهاكاً لحقوق الملكية الفكرية، أو مخالفة للقوانين المنظمة للإعلانات والمهن يعرض صاحبه للمساءلة القانونية المباشرة وحظر الحساب فوراً.
              </li>
            </ul>
          </div>

          {/* Section 3: Admin Review, Approval, Rejection, and Deletion Policy */}
          <div className="bg-blue-950/30 border border-blue-500/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-black text-sky-300 text-sm">
              <UserCheck className="w-5 h-5 text-sky-400 shrink-0" />
              <span>3. مراجعة ومعاينة الإعلانات وعدم النشر إلا بعد موافقة الإدارة</span>
            </div>
            <p className="text-white/85 text-[11px]">
              تطبيقاً لأعلى معايير الأمان وحماية المستهلك:
            </p>
            <div className="space-y-1.5 text-white/80 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>
                  <strong>الموافقة المسبقة للإدارة (Admin Approval):</strong> لا يتم تفعيل أو نشر أي إعلان جديد أو تعديل لإعلان قديم للعامة إلا بعد معاينته وتدقيقه وموافقته رسمياً من قِبل إدارة منصة إعلانك.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">✓</span>
                <span>
                  <strong>حق الرفض والحذف:</strong> تمتلك الإدارة الحق الكامل في رفض أو تعديل أو حذف أي اشتراك أو إعلان غير مطابق للشروط مع إرسال إشعار فوري لجهة الإعلان بأسباب الرفض.
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Subscription Review & Auto-Hiding After Expiry */}
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-300 text-sm">
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
              <span>4. مراجعة الاشتراكات وإخفاء الإعلانات بعد انتهاء الاشتراك دون تجديد</span>
            </div>
            <p className="text-white/85 text-[11px]">
              تقوم المنصة بفحص ومراجعة دورية لجميع الاشتراكات (الجديدة والقديمة):
            </p>
            <div className="bg-black/60 p-2.5 rounded-xl border border-white/10 text-[11px] text-white/80 space-y-1">
              <div>
                • يتم <strong>إخفاء الإعلان فورياً وتلقائياً</strong> من خلاصات البحث والريلز والشبكة العامة بمجرد انتهاء فترة الاشتراك (فترة الـ 90 يوماً المجانية أو الباقة المدفوعة) في حال عدم قيام المشترك بالتجديد.
              </div>
              <div>
                • لا يُعاد إظهار الإعلان إلا بعد تأكيد التجديد والموافقة الإدارية الرسمية.
              </div>
            </div>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="p-4 bg-neutral-900 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
          <div className="text-[11px] text-white/60 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>حرصاً على سلامتك وثقتك في منصة إعلانك</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 active:scale-95 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-lg transition cursor-pointer"
          >
            فهمت وموافق على الشروط والتحذير ✓
          </button>
        </div>
      </div>
    </div>
  );
};
