import React, { useState } from 'react';
import { Business, BusinessComment } from '../types';
import { X, Send, MessageCircle, Heart, CheckCircle2, ShieldCheck, Clock, User } from 'lucide-react';

interface CommentsModalProps {
  business: Business;
  onClose: () => void;
  onAddComment: (commentText: string, authorName: string) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  business,
  onClose,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [submittedAlert, setSubmittedAlert] = useState<string | null>(null);

  const comments: BusinessComment[] = business.comments || [
    {
      id: 'c1',
      userName: 'م. أحمد خالد',
      comment: 'ما شاء الله المكان تحفة والخدمة ممتازة جداً، بالتوفيق!',
      createdAt: Date.now() - 3600000 * 4,
      status: 'approved',
    },
    {
      id: 'c2',
      userName: 'د. ياسمين فؤاد',
      comment: 'هل متاح الحجز لنهاية الأسبوع القادم؟',
      createdAt: Date.now() - 3600000 * 24,
      status: 'approved',
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const name = authorName.trim() || 'عميل إعلانك SAM';
    onAddComment(commentText.trim(), name);
    setCommentText('');
    setSubmittedAlert('✨ تم إرسال تعليقك واستفسارك بنجاح ويظهر فوراً بعد المراجعة!');
    setTimeout(() => setSubmittedAlert(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full sm:max-w-md bg-neutral-900 border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 space-y-4 shadow-2xl text-white max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                <span>تعليقات واستفسارات العملاء</span>
                <span className="text-[11px] font-bold text-white/50">({comments.length})</span>
              </h3>
              <p className="text-[10px] text-white/50 truncate max-w-xs">
                {business.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedAlert && (
          <div className="bg-emerald-500/15 border border-emerald-400/40 rounded-xl p-2.5 text-xs text-emerald-300 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{submittedAlert}</span>
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto space-y-3 pe-1 text-xs">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-white/40 space-y-2">
              <MessageCircle className="w-8 h-8 mx-auto opacity-40" />
              <p>كن أول من يترك تعليقاً أو استفساراً لأصحاب هذا النشاط!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {c.userName.charAt(0)}
                    </div>
                    <span className="font-black text-white text-xs">{c.userName}</span>
                  </div>
                  <span className="text-[10px] text-white/40 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>منذ قليل</span>
                  </span>
                </div>
                <p className="text-white/80 text-[11px] ps-8 leading-relaxed">
                  {c.comment}
                </p>
              </div>
            ))
          )}
        </div>

        {/* New Comment Input */}
        <form onSubmit={handleSubmit} className="border-t border-white/10 pt-3 space-y-2">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="اسمك أو لقبك (اختياري)..."
            className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-white/40"
          />

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="اكتب تعليقك أو استفسارك لصاحب النشاط..."
              className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF2D55]"
              required
            />
            <button
              type="submit"
              className="bg-[#FF2D55] hover:bg-[#ff4064] text-white p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 shadow-md"
              title="إرسال التعليق"
            >
              <Send className="w-4 h-4 fill-white" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
