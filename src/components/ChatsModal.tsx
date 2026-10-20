import React from 'react';
import { Business } from '../types';
import { X, MessageCircle, Phone, MapPin, CheckCircle, ExternalLink } from 'lucide-react';

interface ChatsModalProps {
  businesses: Business[];
  onClose: () => void;
  onOpenBiz: (b: Business) => void;
}

export const ChatsModal: React.FC<ChatsModalProps> = ({
  businesses,
  onClose,
  onOpenBiz,
}) => {
  const verifiedBiz = businesses.filter((b) => b.verified === 1 || b.phone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[85vh] flex flex-col text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-teal-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30">
              <MessageCircle className="w-6 h-6 fill-white text-transparent" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                المحادثات والتواصل المباشر
              </h2>
              <p className="text-[11px] text-white/60">
                تواصل مباشر عبر واتساب مع أصحاب المنشآت والأنشطة دون وسيط
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Contacts */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {verifiedBiz.map((b) => (
            <div
              key={b.id}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3 transition"
            >
              <div 
                onClick={() => onOpenBiz(b)}
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              >
                <img
                  src={b.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200'}
                  alt={b.name}
                  className="w-11 h-11 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs sm:text-sm text-white truncate">
                      {b.name}
                    </span>
                    {b.verified === 1 && (
                      <CheckCircle className="w-3.5 h-3.5 fill-[#20D5EC] text-black shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-white/50 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                    <span>{b.city} • {b.cat}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `مرحباً ${b.name}، استفسار مباشر من منصة إعلانك E3lanak`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white p-2.5 rounded-xl transition flex items-center justify-center shadow"
                  title="محادثة واتساب"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-transparent" />
                </a>

                <a
                  href={`tel:${b.phone}`}
                  className="bg-white hover:bg-neutral-200 text-black p-2.5 rounded-xl transition flex items-center justify-center shadow"
                  title="اتصال هاتفي"
                >
                  <Phone className="w-4 h-4 fill-black" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
