import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Business } from '../types';

interface StarRatingWidgetProps {
  business: Business;
  onRate?: (bizId: number | string, newRating: number, newCount: number) => void;
  variant?: 'card' | 'floating' | 'modal';
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

/**
 * نظام تقييم بالنجوم (1-5) في واجهة بطاقة النشاط التجاري
 * يتيح للجمهور تقييم الأنشطة مباشرة من 1 إلى 5 نجوم
 * مع تحديث متوسط التقييم وحالة النشاط فورياً وحفظ التقييم
 */
export const StarRatingWidget: React.FC<StarRatingWidgetProps> = ({
  business,
  onRate,
  variant = 'card',
  size = 'md',
  showCount = true,
}) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [userVote, setUserVote] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem(`dalilk_user_rating_${business.id}`);
      return stored ? Number(stored) : null;
    } catch {
      return null;
    }
  });
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const currentScore = Number((business.rating || 4.8).toFixed(1));
  const currentCount = business.ratingCount || 128;

  const handleStarClick = (e: React.MouseEvent, starScore: number) => {
    e.stopPropagation();

    // حساب التقييم الجديد للنشاط
    let newCount = currentCount;
    let newScore = currentScore;

    if (!userVote) {
      newCount = currentCount + 1;
      newScore = Number(((currentScore * currentCount + starScore) / newCount).toFixed(1));
    } else {
      // تعديل تقييم العميل السابق
      newScore = Number(((currentScore * currentCount - userVote + starScore) / currentCount).toFixed(1));
    }

    // حفظ تقييم المستخدم محلياً
    try {
      localStorage.setItem(`dalilk_user_rating_${business.id}`, String(starScore));
    } catch (err) {
      console.error(err);
    }

    setUserVote(starScore);
    setFeedbackToast(`تم تقييمك بـ ⭐ ${starScore}/5! شكراً لدعمك`);
    setTimeout(() => setFeedbackToast(null), 2500);

    if (onRate) {
      onRate(business.id, newScore, newCount);
    }
  };

  const starSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-5 h-5',
  };

  // نمط الزر العائم في قائمة ريلز تيك توك
  if (variant === 'floating') {
    return (
      <div
        className="flex flex-col items-center group cursor-pointer relative"
        onClick={(e) => e.stopPropagation()}
        title={`متوسط التقييم: ${currentScore} من 5 نجوم (${currentCount} تقييم)`}
      >
        <div className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 border border-amber-400/40 text-amber-300 flex flex-col items-center justify-center transition transform active:scale-75 shadow-md backdrop-blur-md">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
          <span className="text-[8px] font-black text-amber-300 font-mono leading-none mt-0.5">
            {currentScore}
          </span>
        </div>
        <span className="text-[8px] font-bold text-amber-300 mt-0.5 drop-shadow bg-black/60 px-1 rounded truncate">
          {currentCount} تقييم
        </span>

        {/* صندوق التقييم السريع المنبثق عند التفاعل */}
        <div className="hidden group-hover:flex absolute -end-2 bottom-12 bg-neutral-950/95 border border-amber-400/50 p-2 rounded-xl shadow-2xl flex-col items-center gap-1 z-50 backdrop-blur-md min-w-[140px]">
          <span className="text-[10px] font-bold text-white/90">قيّم هذا النشاط:</span>
          <div className="flex items-center gap-0.5" dir="ltr">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={(e) => handleStarClick(e, star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                className="p-1 hover:scale-125 transition cursor-pointer"
                title={`${star} نجوم`}
              >
                <Star
                  className={`w-4 h-4 transition ${
                    (hoveredStar !== null ? star <= hoveredStar : userVote ? star <= userVote : star <= Math.round(currentScore))
                      ? 'fill-amber-400 text-amber-400 drop-shadow'
                      : 'text-neutral-600'
                  }`}
                />
              </button>
            ))}
          </div>
          {feedbackToast && (
            <span className="text-[9px] text-emerald-400 font-black animate-fade-in text-center">
              {feedbackToast}
            </span>
          )}
        </div>
      </div>
    );
  }

  // نمط البطاقة الأساسي والنافذة
  return (
    <div
      className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/30 text-white select-none relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* عرض النجوم الخمسة التفاعلية */}
      <div className="flex items-center gap-0.5" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled =
            hoveredStar !== null
              ? star <= hoveredStar
              : userVote
              ? star <= userVote
              : star <= Math.round(currentScore);

          return (
            <button
              key={star}
              type="button"
              onClick={(e) => handleStarClick(e, star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              className="p-0.5 hover:scale-125 active:scale-95 transition cursor-pointer"
              title={`تقييم ${star} من 5 نجوم`}
            >
              <Star
                className={`${starSizes[size]} transition ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                    : 'text-neutral-500 hover:text-amber-200'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* رقم المتوسط الهندسي */}
      <span className="font-mono font-black text-amber-300 text-xs">
        {currentScore}
      </span>

      {showCount && (
        <span className="text-[10px] text-white/60 font-medium">
          ({currentCount})
        </span>
      )}

      {userVote && (
        <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1 py-0.2 rounded border border-amber-400/30 font-bold">
          تقييمك: {userVote}★
        </span>
      )}

      {/* Toast feedback */}
      {feedbackToast && (
        <div className="absolute -top-7 inset-x-0 mx-auto bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg text-center animate-bounce z-50 whitespace-nowrap w-fit">
          {feedbackToast}
        </div>
      )}
    </div>
  );
};
