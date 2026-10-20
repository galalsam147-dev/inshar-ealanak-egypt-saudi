import React, { useState } from 'react';
import { X, ArrowRightLeft, DollarSign, Check, Coins } from 'lucide-react';
import { SupportedCurrency, SupportedLang } from '../types';
import { CURRENCIES, convertFromEgp } from '../utils/currency';
import { I18N } from '../utils/translations';

interface CurrencyModalProps {
  currentCurrency: SupportedCurrency;
  onSelectCurrency: (c: SupportedCurrency) => void;
  onClose: () => void;
  lang: SupportedLang;
}

export const CurrencyModal: React.FC<CurrencyModalProps> = ({
  currentCurrency,
  onSelectCurrency,
  onClose,
  lang,
}) => {
  const t = I18N[lang];
  const [calcEgp, setCalcEgp] = useState<number>(1000);

  return (
    <div className="fixed inset-0 z-[75] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-neutral-950 text-white rounded-3xl border border-white/10 p-5 sm:p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto hide-scroll flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 start-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pt-2 pb-3 border-b border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center mb-2">
            <Coins className="w-6 h-6" />
          </div>
          <h3 className="font-black text-base sm:text-lg text-white">
            {t.ratesAndCurrencies}
          </h3>
          <p className="text-[11px] text-white/60 mt-0.5">
            {t.ratesTitle}
          </p>
        </div>

        {/* Currency Switcher Cards */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-bold text-white/70">
            اختر عملة العرض الأساسية لجميع الأسعار في التطبيق:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.keys(CURRENCIES) as SupportedCurrency[]).map((code) => {
              const info = CURRENCIES[code];
              const isSelected = currentCurrency === code;
              return (
                <div
                  key={code}
                  onClick={() => onSelectCurrency(code)}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#FF2D55]/20 border-[#FF2D55] ring-1 ring-[#FF2D55]'
                      : 'bg-white/5 border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{info.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-white">
                          {info.code}
                        </span>
                        <span className="text-[10px] text-white/60">
                          ({info.symbol})
                        </span>
                      </div>
                      <div className="text-[10px] text-white/50">
                        {lang === 'ar' ? info.nameAr : info.nameEn}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {code !== 'EGP' ? (
                      <span className="text-[10px] font-bold text-amber-400">
                        1 = {info.rateToEgp} ج.م
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-400">
                        العملة الأساسية
                      </span>
                    )}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#FF2D55] text-white flex items-center justify-center ms-auto mt-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Currency Calculator */}
        <div className="mt-5 bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>محاكي التحويل الفوري (EGP Converter)</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={calcEgp}
              onChange={(e) => setCalcEgp(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="المبلغ بالجنيه المصري"
              className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF2D55]"
            />
            <span className="text-xs font-bold text-white/70">ج.م (EGP)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {(['USD', 'EUR', 'SAR', 'AED', 'CNY', 'RUB', 'UAH', 'GBP'] as SupportedCurrency[]).map((c) => (
              <div key={c} className="bg-black/40 border border-white/5 rounded-xl p-2 text-center">
                <div className="text-[10px] text-white/50">{CURRENCIES[c].flag} {c}</div>
                <div className="text-xs font-black text-amber-300 mt-0.5">
                  {convertFromEgp(calcEgp, c)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-white text-black font-black py-2.5 rounded-full text-xs hover:bg-white/90 transition cursor-pointer"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
