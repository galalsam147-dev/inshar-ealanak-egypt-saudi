import React from 'react';
import { 
  X, Sparkles, Gift, CheckCircle, ShieldCheck, Crown, 
  AlertTriangle, Phone, MessageCircle, HelpCircle, ArrowLeft,
  Flame, Zap, Clock, Star 
} from 'lucide-react';
import { SupportedLang } from '../types';

interface SubscribersProgramModalProps {
  onClose: () => void;
  onOpenAdd: () => void;
  onOpenSubscribe?: () => void;
  onOpenCaptainRegister?: () => void;
  lang: SupportedLang;
}

export const SubscribersProgramModal: React.FC<SubscribersProgramModalProps> = ({
  onClose,
  onOpenAdd,
  onOpenSubscribe,
  onOpenCaptainRegister,
  lang,
}) => {
  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-[#121216] border border-white/15 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#FF2D55] via-rose-600 to-amber-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 start-4 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-black/30 backdrop-blur-md text-amber-300 border border-amber-300/30 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
              <Gift className="w-3.5 h-3.5" />
              <span>عرض حصري للمشتركين الجدد</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black">
            برنامج إعلانك E3lanak للمشتركين: ٣ شهور مجاناً بالكامل! 🎁
          </h2>
          <p className="text-xs sm:text-sm text-white/90 mt-1 leading-relaxed max-w-xl">
            انشر نشاطك التجاري اليوم أمام آلاف الزوار والعملاء القريبين منك في منطقتك مجاناً لمدة 90 يوماً بدون أي رسوم خفية.
          </p>
        </div>

        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto hide-scroll text-white text-xs sm:text-sm">
          {/* 3 Months Free Highlights */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm sm:text-base">
              <Sparkles className="w-5 h-5" />
              <span>ماذا ستحصل في تجربة الـ ٣ شهور المجانية؟</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-white/85">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>عرض نشاطك في ريلز تفاعلية فيديو وسلايدر صور</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ربط فوري بموقعك على Google Maps وحساب المسافة</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>أزرار اتصال سريع ورسائل واتساب بنقرة واحدة</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>عرض قائمة الخدمات والأسعار مع تحويل للعملات</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>رابط رسمي بالدومين (alasematex.com) وصفحة واحدة لكل عميل دون تكرار</span>
              </li>
            </ul>
          </div>

          {/* DEDICATED DRIVER & TRANSPORT SUBSCRIBER CARD (التاكسي والتوصيل من ضمن المشتركين - له كل خصائص المشترك) */}
          <div className="bg-gradient-to-r from-amber-950/70 via-neutral-900 to-emerald-950/70 border-2 border-amber-400/70 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-black flex items-center justify-center text-2xl shadow-lg font-black border border-amber-300">
                  🚕
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-white text-sm sm:text-base">
                      باقة كباتن التاكسي والتوصيل والنقل (مشترك رسمي 100%)
                    </h3>
                    <span className="bg-emerald-400 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse shadow">
                      تفعيل فوري ⚡ ٣ شهور مجاناً 🎁
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 mt-0.5 font-bold">
                    التاكسي والدليفري من ضمن المشتركين الأساسيين: أي سائق يشترك ويفعل الأبلكيشن وله كافة خصائص ومميزات المشترك!
                  </p>
                </div>
              </div>
            </div>

            {/* All Subscriber Features Detailed for the Driver */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/90">
              <div className="bg-black/50 border border-white/10 rounded-2xl p-2.5 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  🛰️
                </div>
                <div>
                  <strong className="text-amber-300 block text-xs">خلية تتبع مباشر GPS على الرادار:</strong>
                  <span className="text-[11px] text-white/70 leading-relaxed">
                    ظهور مركبتك (تاكسي / سكوتر / ليموزين / أتوبيس / شحن) وسرعتك اللحظية على الخريطة لكل الركاب والعملاء في محيطك لطلبك فوراً.
                  </span>
                </div>
              </div>

              <div className="bg-black/50 border border-white/10 rounded-2xl p-2.5 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  🔐
                </div>
                <div>
                  <strong className="text-amber-300 block text-xs">صفحة إعلان خاصة برقم سري:</strong>
                  <span className="text-[11px] text-white/70 leading-relaxed">
                    صفحة مستقلة لك برقم PIN سري خاص بك؛ يمكنك تعديل بياناتك، أرقامك، صورك، وسعر الكيلومتر في أي وقت عبر زر (🔐 تعديل صفحتي).
                  </span>
                </div>
              </div>

              <div className="bg-black/50 border border-white/10 rounded-2xl p-2.5 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  💵
                </div>
                <div>
                  <strong className="text-amber-300 block text-xs">أرباحك 100% لك بدون أي نسبة أو عمولة:</strong>
                  <span className="text-[11px] text-white/70 leading-relaxed">
                    استقبال مشاوير وطلبات الزبائن مباشرة اتصال وواتساب؛ لا توجد أي نسبة مقتطعة للمنصة، والأجرة كاملة في جيبك.
                  </span>
                </div>
              </div>

              <div className="bg-black/50 border border-white/10 rounded-2xl p-2.5 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  💳
                </div>
                <div>
                  <strong className="text-amber-300 block text-xs">بيانات التحويل المالي الخاصة بك:</strong>
                  <span className="text-[11px] text-white/70 leading-relaxed">
                    إدراج محفظتك (فودافون كاش، إنستاباي، فيزا) في صفحتك لتحويل الركاب الأجرة إليك، مع خيار السداد كاش عند الوصول.
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Instant Action for Drivers */}
            {onOpenCaptainRegister && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCaptainRegister();
                }}
                className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 active:scale-98 text-black font-black py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/30 transition cursor-pointer"
              >
                <span>🚕 اشترك الآن كـ كابتن وفعل تطبيقه بكافة خصائص المشترك (٣ شهور مجاناً) 🛵</span>
              </button>
            )}
          </div>

          {/* Pricing 4 Tiers (نظام التحصيل والاشتراكات) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#38BDF8]" />
                <span>باقات التحصيل والإعلان للمنشآت والأنشطة (4 باقات رئيسية)</span>
              </h3>
              <span className="text-[11px] text-white/60">من 0 وحتى 16,000 ج.م</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. FREE Tier */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-white/60 bg-white/10 px-2 py-0.5 rounded-full inline-block">
                    مجاني FREE
                  </span>
                  <div className="text-xl font-black text-white">
                    0 <span className="text-xs font-normal text-white/60">ج.م</span>
                  </div>
                  <p className="text-[11px] text-white/60">لجمع وتوثيق أول 100 ألف منشأة</p>
                  <ul className="space-y-1 text-[11px] text-white/70 pt-2 border-t border-white/10">
                    <li>• نتائج أخيرة في البحث</li>
                    <li>• صورة واحدة فقط بدون أسعار</li>
                    <li>• بيانات تواصل أساسية</li>
                  </ul>
                </div>
              </div>

              {/* 2. BASIC Tier */}
              <div className="bg-blue-950/40 border border-blue-500/40 rounded-2xl p-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full inline-block">
                    الأساسية BASIC
                  </span>
                  <div className="text-xl font-black text-white font-mono">
                    350 <span className="text-xs font-normal text-white/60">ج.م / شهر</span>
                  </div>
                  <span className="text-[10px] text-blue-300 font-bold block">أو 3,500 ج.م / سنة (وفر شهرين)</span>
                  <ul className="space-y-1 text-[11px] text-blue-100/80 pt-2 border-t border-white/10">
                    <li>• صدارة Top 10 الأقرب جغرافياً</li>
                    <li>• 10 صور + فيديو + تجميل الصور</li>
                    <li>• 4 كروت تراخيص (مزاولة + منشأة + جودة + اعتماد)</li>
                    <li>• كتالوج 3 عروض بأسعار (مثل مغسلة، كشف طبيب)</li>
                    <li>• واتساب + اتصال + خريطة GPS تلقائية</li>
                    <li>• SEO: "أقرب + مهنة + مدينة"</li>
                  </ul>
                </div>
              </div>

              {/* 3. PREMIUM Tier */}
              <div className="bg-gradient-to-b from-purple-950/50 to-indigo-950/50 border border-purple-500/50 rounded-2xl p-4 flex flex-col justify-between relative shadow-lg">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full inline-block">
                    المميزة PREMIUM ⭐
                  </span>
                  <div className="text-xl font-black text-white font-mono">
                    900 <span className="text-xs font-normal text-white/60">ج.م / شهر</span>
                  </div>
                  <span className="text-[10px] text-purple-300 font-bold block">أو 9,000 ج.م / سنة</span>
                  <ul className="space-y-1 text-[11px] text-purple-100/80 pt-2 border-t border-white/10">
                    <li>• صدارة Top 3 في نتائج البحث</li>
                    <li>• ⭐ علامة مميز + يافطة ممولة</li>
                    <li>• يظهر في المدن والمناطق القريبة</li>
                    <li>• إحصائيات دقيقة للمشاهدات والاتصالات</li>
                    <li>• دعم فني وتقارير أداء</li>
                  </ul>
                </div>
              </div>

              {/* 4. VIP Tier */}
              <div className="bg-gradient-to-b from-amber-950/60 to-yellow-950/40 border-2 border-amber-400 rounded-2xl p-4 flex flex-col justify-between relative shadow-xl shadow-amber-500/10">
                <div className="absolute -top-3 start-1/2 -translate-x-1/2 bg-amber-400 text-black text-[10px] font-black px-3 py-0.5 rounded-full shadow">
                  قمة الصدارة VIP 👑
                </div>
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-black text-amber-300 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>باقة VIP الكبرى</span>
                  </span>
                  <div className="text-xl font-black text-amber-300 font-mono">
                    2500 - 5000 <span className="text-xs font-normal text-white/60">ج.م</span>
                  </div>
                  <span className="text-[10px] text-amber-200 block">وتصل لـ 16,000 ج.م للحملات الكبرى</span>
                  <ul className="space-y-1 text-[11px] text-amber-100/90 pt-2 border-t border-white/10">
                    <li>• المركز #1 ثابت في الرئيسية والبحث</li>
                    <li>• Banner إعلاني كبير في الصفحة الرئيسية</li>
                    <li>• رابط مخصص /vip/name</li>
                    <li>• إعلان موجه لجميع السياح والمواطنين</li>
                    <li>• علامة زرقاء موثقة + جلسة تصوير مجانية</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods (Visa, Vodafone Cash, InstaPay, Fawry, etc.) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-white text-sm">طرق الدفع والتحصيل المعتمدة:</span>
              <span className="text-[11px] text-emerald-400 font-bold">تفعيل فوري خلال دقائق</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-white font-bold">
                💳 فيزا / ماستركارد (Visa)
              </div>
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-white font-bold">
                📱 فودافون / اتصالات / أورنج كاش
              </div>
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-white font-bold">
                ⚡ إنستاباي InstaPay فوري
              </div>
              <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-white font-bold">
                🏪 فوري Fawry وتحويل بنكي
              </div>
            </div>
            <p className="text-[11px] text-white/60 text-center sm:text-start">
              * تذكير آلي عبر واتساب قبل انتهاء الاشتراك بـ 3 أيام، مع تنزيل تلقائي في حال عدم السداد أو ترقية فورية عند الدفع.
            </p>

            {onOpenSubscribe && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSubscribe();
                }}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110 active:scale-98 text-white font-black py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition cursor-pointer"
              >
                <span>💳 اشترك وسدد بالفيزا / ماستركارد أو المحافظ الآن ⚡</span>
              </button>
            )}
          </div>

          {/* Warning & Cutoff Advice (نصائح وإرشادات قبل قطع الإعلان) */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-black text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>إرشادات هامة حول قطع الإعلان بعد انتهاء المدة</span>
            </div>
            <div className="text-xs text-white/80 space-y-2 leading-relaxed">
              <p>
                <strong>ماذا يحدث عند انتهاء مدة الـ 90 يوماً؟</strong> يتم إيقاف وقطع ظهور الإعلان تلقائياً وإخفاؤه عن العملاء ونتائج البحث، حفاظاً على دقة الأنشطة النشطة في المنصة.
              </p>
              <div className="bg-black/40 p-3 rounded-xl space-y-1.5 border border-white/5">
                <div className="font-bold text-white text-[11px]">💡 نصائح ذهبية قبل قطع الإعلان:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-white/70">
                  <li><strong>التجديد قبل الانتهاء بأسبوع:</strong> نرسل لكم رسالة تنبيه ودية على الواتساب وSMS قبل أسبوع، لتجديد النشاط بضغطة واحدة وتجنب أي انقطاع.</li>
                  <li><strong>تحديث الفيديوهات والصور:</strong> احرص على إضافة صور وفيديوهات حصرية لجذب زبائن جدد باستمرار.</li>
                  <li><strong>الحفاظ على تقييمات العملاء:</strong> الرد السريع على استفسارات الواتساب يرفع ثقة المشترين في نشاطك.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="p-4 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-white/60 text-center sm:text-start">
            انضم الآن إلى مئات الشركات والمطاعم والخدمات الناجحة في إعلانك E3lanak.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition cursor-pointer"
            >
              إغلاق
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAdd();
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2D55] to-rose-600 hover:brightness-110 active:scale-95 text-white text-xs font-black shadow-lg shadow-[#FF2D55]/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>سجل نشاطك (٣ شهور مجاناً) 🚀</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
