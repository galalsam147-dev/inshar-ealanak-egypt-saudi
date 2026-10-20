import React, { useState, useRef } from 'react';
import { 
  X, ShieldCheck, Camera, Upload, CheckCircle2, Lock, 
  FileText, UserCheck, AlertTriangle, EyeOff, Loader2, Sparkles 
} from 'lucide-react';
import { Business, SupportedLang, TrustVerificationDocs } from '../types';

interface TrustVerificationModalProps {
  business: Business;
  isOpen: boolean;
  onClose: () => void;
  onSaveDocs: (bizId: string | number, docs: TrustVerificationDocs) => void;
  lang: SupportedLang;
}

export const TrustVerificationModal: React.FC<TrustVerificationModalProps> = ({
  business,
  isOpen,
  onClose,
  onSaveDocs,
  lang,
}) => {
  const existingDocs = business.trustDocs || {
    verificationStatus: 'unverified',
  };

  const [facePhoto, setFacePhoto] = useState<string>(existingDocs.facePhotoUrl || '');
  const [idFront, setIdFront] = useState<string>(existingDocs.idCardFrontUrl || '');
  const [idBack, setIdBack] = useState<string>(existingDocs.idCardBackUrl || '');
  const [licenseFront, setLicenseFront] = useState<string>(existingDocs.licenseFrontUrl || '');
  const [licenseBack, setLicenseBack] = useState<string>(existingDocs.licenseBackUrl || '');
  const [taxCard, setTaxCard] = useState<string>(existingDocs.officialTaxCardUrl || '');
  const [notes, setNotes] = useState<string>(existingDocs.notes || '');
  const [isCapturingWebcam, setIsCapturingWebcam] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (!isOpen) return null;

  const handleStartWebcam = async () => {
    try {
      setIsCapturingWebcam(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert(lang === 'ar' ? 'تعذر فتح الكاميرا، يرجى رفع صورة سيلفي من جهازك' : 'Camera not accessible, please upload photo');
      setIsCapturingWebcam(false);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setFacePhoto(dataUrl);
    }
    handleStopWebcam();
  };

  const handleStopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCapturingWebcam(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedDocs: TrustVerificationDocs = {
      facePhotoUrl: facePhoto,
      idCardFrontUrl: idFront,
      idCardBackUrl: idBack,
      licenseFrontUrl: licenseFront,
      licenseBackUrl: licenseBack,
      officialTaxCardUrl: taxCard,
      verificationStatus: (facePhoto && idFront && licenseFront) ? 'pending' : 'unverified',
      verifiedAt: Date.now(),
      reviewedByAdmin: false,
      notes: notes.trim(),
    };

    setTimeout(() => {
      onSaveDocs(business.id, updatedDocs);
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1800);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[96] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-neutral-900 border border-emerald-500/30 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200 text-white"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-neutral-900 p-5 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 text-2xl shadow-lg">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">
                  {lang === 'ar' ? 'صفحة الثقة والأوراق الثبوتية للموثقين' : 'Trust & Identity Verification Center'}
                </h3>
                <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-400/40">
                  {lang === 'ar' ? 'شارة التوثيق الزرقاء ✓' : 'Blue Badge ✓'}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                {business.name} • {business.cat}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleStopWebcam();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confidentiality Admin-Only Notice */}
        <div className="bg-amber-950/40 border-b border-amber-500/30 p-3.5 px-5 flex items-center gap-3 text-xs text-amber-200">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="leading-relaxed">
            <b className="text-amber-300">
              {lang === 'ar' ? 'سرية وأمان تام (لا يراها إلا الأدمن والإدارة): ' : 'Strict Confidentiality (Admin-Only Eyes): '}
            </b>
            {lang === 'ar'
              ? 'صورة وجهك، البطاقة الشخصية، ورخصة النشاط مشفرة ولا تظهر للجمهور أو الزوار بأي شكل. تطلع عليها الإدارة فقط للتحقق ومنحك شارة الثقة الرسمية.'
              : 'Your face selfie, National ID, and commercial licenses are strictly private and never exposed to the public. Only system administrators review them for official badge approval.'}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* 1. Face Verification (تصوير الوجه سيلفي) */}
          <div className="bg-neutral-800/60 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-400" />
                <h4 className="text-xs font-black text-white">
                  {lang === 'ar' ? '١. تصوير الوجه (سيلفي مباشر أو رفع صورة حية)' : '1. Face Selfie Verification'}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {!isCapturingWebcam ? (
                  <button
                    type="button"
                    onClick={handleStartWebcam}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'فتح الكاميرا المباشرة 📸' : 'Open Webcam 📸'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition animate-pulse cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'التقاط الصورة الآن ✓' : 'Capture Photo ✓'}</span>
                  </button>
                )}

                <label className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-white/10">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'أو اختر صورة' : 'Upload File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setFacePhoto)}
                  />
                </label>
              </div>
            </div>

            {/* Webcam Live Stream View */}
            {isCapturingWebcam && (
              <div className="relative rounded-2xl overflow-hidden border-2 border-sky-400 max-w-sm mx-auto bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-48 object-cover" />
                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="bg-black/70 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/20">
                    {lang === 'ar' ? 'وجه الكاميرا نحو وجهك بوضوح' : 'Align your face in the center'}
                  </span>
                </div>
              </div>
            )}

            {/* Face Photo Preview */}
            {facePhoto && !isCapturingWebcam && (
              <div className="flex items-center gap-3 bg-black/40 p-2.5 rounded-xl border border-white/10">
                <img src={facePhoto} alt="Face" className="w-16 h-16 rounded-xl object-cover border border-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {lang === 'ar' ? 'تم حفظ صورة الوجه بنجاح' : 'Face photo attached'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFacePhoto('')}
                    className="text-[10px] text-red-400 hover:underline mt-0.5 cursor-pointer"
                  >
                    {lang === 'ar' ? 'إعادة التصوير' : 'Retake photo'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. National ID Card (وش وظهر) */}
          <div className="bg-neutral-800/60 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <h4 className="text-xs font-black text-white">
                {lang === 'ar' ? '٢. بطاقة الرقم القومي أو الهوية الشخصية (وش وظهر)' : '2. National ID Card (Front & Back)'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* ID Front */}
              <div className="border border-dashed border-white/20 rounded-xl p-3 text-center space-y-2 bg-black/20">
                <span className="text-[11px] font-bold text-amber-300 block">
                  {lang === 'ar' ? 'صورة البطاقة (الوجه الأمامي) 🪪' : 'ID Front Side 🪪'}
                </span>
                {idFront ? (
                  <div className="relative">
                    <img src={idFront} alt="ID Front" className="h-28 mx-auto rounded-lg object-contain border border-amber-400/50" />
                    <button
                      type="button"
                      onClick={() => setIdFront('')}
                      className="absolute top-1 end-1 bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-3 hover:bg-white/5 rounded-lg transition">
                    <Upload className="w-6 h-6 mx-auto text-white/40 mb-1" />
                    <span className="text-[10px] text-white/70 block">
                      {lang === 'ar' ? 'اضغط لرفع الوجه الأمامي للبطاقة' : 'Upload ID front side'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setIdFront)}
                    />
                  </label>
                )}
              </div>

              {/* ID Back */}
              <div className="border border-dashed border-white/20 rounded-xl p-3 text-center space-y-2 bg-black/20">
                <span className="text-[11px] font-bold text-amber-300 block">
                  {lang === 'ar' ? 'صورة البطاقة (الظهر) 🪪' : 'ID Back Side 🪪'}
                </span>
                {idBack ? (
                  <div className="relative">
                    <img src={idBack} alt="ID Back" className="h-28 mx-auto rounded-lg object-contain border border-amber-400/50" />
                    <button
                      type="button"
                      onClick={() => setIdBack('')}
                      className="absolute top-1 end-1 bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-3 hover:bg-white/5 rounded-lg transition">
                    <Upload className="w-6 h-6 mx-auto text-white/40 mb-1" />
                    <span className="text-[10px] text-white/70 block">
                      {lang === 'ar' ? 'اضغط لرفع ظهر البطاقة' : 'Upload ID back side'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setIdBack)}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* 3. Official License / Commercial Register (وش وظهر) */}
          <div className="bg-neutral-800/60 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-xs font-black text-white">
                {lang === 'ar' ? '٣. الترخيص الرسمي / السجل التجاري أو رخصة القيادة / مزاولة المهنة (وش وظهر)' : '3. Official Trade License / Driver License / Commercial Register (Front & Back)'}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* License Front */}
              <div className="border border-dashed border-white/20 rounded-xl p-3 text-center space-y-2 bg-black/20">
                <span className="text-[11px] font-bold text-emerald-300 block">
                  {lang === 'ar' ? 'الرخصة / السجل (الوجه الأمامي) 📄' : 'License Front 📄'}
                </span>
                {licenseFront ? (
                  <div className="relative">
                    <img src={licenseFront} alt="License Front" className="h-28 mx-auto rounded-lg object-contain border border-emerald-400/50" />
                    <button
                      type="button"
                      onClick={() => setLicenseFront('')}
                      className="absolute top-1 end-1 bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-3 hover:bg-white/5 rounded-lg transition">
                    <Upload className="w-6 h-6 mx-auto text-white/40 mb-1" />
                    <span className="text-[10px] text-white/70 block">
                      {lang === 'ar' ? 'اضغط لرفع الوجه الأمامي للرخصة' : 'Upload license front'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setLicenseFront)}
                    />
                  </label>
                )}
              </div>

              {/* License Back */}
              <div className="border border-dashed border-white/20 rounded-xl p-3 text-center space-y-2 bg-black/20">
                <span className="text-[11px] font-bold text-emerald-300 block">
                  {lang === 'ar' ? 'الرخصة / السجل (الظهر) 📄' : 'License Back 📄'}
                </span>
                {licenseBack ? (
                  <div className="relative">
                    <img src={licenseBack} alt="License Back" className="h-28 mx-auto rounded-lg object-contain border border-emerald-400/50" />
                    <button
                      type="button"
                      onClick={() => setLicenseBack('')}
                      className="absolute top-1 end-1 bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-3 hover:bg-white/5 rounded-lg transition">
                    <Upload className="w-6 h-6 mx-auto text-white/40 mb-1" />
                    <span className="text-[10px] text-white/70 block">
                      {lang === 'ar' ? 'اضغط لرفع ظهر الرخصة' : 'Upload license back'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, setLicenseBack)}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Notes for Admin */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-white/80">
              {lang === 'ar' ? 'ملاحظات إضافية لإدارة التطبيق (اختياري):' : 'Additional notes for review (Optional):'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={lang === 'ar' ? 'مثال: رقم السجل التجاري، مقر الورشة بالتجمع، شهادات الخبرة...' : 'e.g. Commercial ID number, workshop location...'}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Success Banner */}
          {savedSuccess && (
            <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{lang === 'ar' ? '✅ تم إرسال أوراقك الثبوتية بنجاح إلى الإدارة للمراجعة وتفعيل شارة التوثيق الزرقاء' : 'Documents successfully submitted to Admin for verification!'}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                handleStopWebcam();
                onClose();
              }}
              className="text-xs text-white/60 hover:text-white px-4 py-2 rounded-xl transition cursor-pointer"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 active:scale-95 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'ar' ? 'جاري الحفظ المشفر...' : 'Saving securely...'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'حفظ وإرسال للأدمن للحصول على التوثيق 🛡️' : 'Save & Submit for Blue Badge 🛡️'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
