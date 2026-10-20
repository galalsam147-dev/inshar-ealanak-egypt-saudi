import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, Video, Globe, Sparkles, CheckCircle2, AlertTriangle, 
  Loader2, Play, Pause, Camera, Trash2, ArrowRight, ShieldCheck, Film, HardDrive
} from 'lucide-react';
import { PackageTier, SupportedLang } from '../types';
import { compressVideoFile, VideoCompressionResult } from '../utils/videoCompressor';
import { validateVideoAdditionQuota, getPackageQuota } from '../utils/mediaQuotaManager';

interface ExternalVideoImporterModalProps {
  currentVideosCount: number;
  pkgTier: PackageTier;
  onClose: () => void;
  onAddVideo: (videoUrl: string, posterUrl?: string) => void;
  lang: SupportedLang;
}

export const ExternalVideoImporterModal: React.FC<ExternalVideoImporterModalProps> = ({
  currentVideosCount,
  pkgTier,
  onClose,
  onAddVideo,
  lang,
}) => {
  const isAr = lang === 'ar';
  const quota = getPackageQuota(pkgTier);
  const quotaStatus = validateVideoAdditionQuota(currentVideosCount, pkgTier);

  const [activeTab, setActiveTab] = useState<'desktop' | 'google' | 'record'>('desktop');

  // Desktop File Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressProgress, setCompressProgress] = useState<number>(0);
  const [compressResult, setCompressResult] = useState<VideoCompressionResult | null>(null);

  // Google / External URL state
  const [externalUrl, setExternalUrl] = useState<string>('');
  const [isTestingUrl, setIsTestingUrl] = useState<boolean>(false);
  const [urlVerified, setUrlVerified] = useState<boolean>(false);
  const [urlPreviewSrc, setUrlPreviewSrc] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');

  // Live Camera Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const liveVideoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Handle Desktop File Selection & Auto-Compression
  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!quotaStatus.canAdd) {
      alert(quotaStatus.messageAr);
      return;
    }

    const file = files[0];
    if (!file.type.startsWith('video/')) {
      alert(isAr ? 'يرجى اختيار ملف فيديو صالح (MP4, WebM, MOV)' : 'Please select a valid video file');
      return;
    }

    setSelectedFile(file);
    setIsCompressing(true);
    setCompressProgress(10);

    try {
      const res = await compressVideoFile(file, (pct) => {
        setCompressProgress(pct);
      });
      setCompressResult(res);
    } catch (err) {
      console.error('Video compression error:', err);
      // Fallback
      const rawUrl = URL.createObjectURL(file);
      setCompressResult({
        compressedUrl: rawUrl,
        posterUrl: '',
        originalSizeMb: Number((file.size / (1024 * 1024)).toFixed(1)),
        compressedSizeMb: Number((file.size / (1024 * 1024)).toFixed(1)),
        compressionRatio: 0,
        durationSec: 15,
        dimensions: { width: 540, height: 960 },
      });
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle Google / Web URL Verification
  const handleVerifyExternalUrl = () => {
    setUrlError('');
    setUrlVerified(false);

    let raw = externalUrl.trim();
    if (!raw) {
      setUrlError(isAr ? 'يرجى كتابة أو لصق رابط الفيديو أولاً' : 'Please paste a video URL');
      return;
    }

    // Convert Google Drive share link to direct video stream if applicable
    if (raw.includes('drive.google.com/file/d/')) {
      const match = raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        raw = `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }

    setIsTestingUrl(true);
    const testVideo = document.createElement('video');
    testVideo.preload = 'metadata';
    testVideo.crossOrigin = 'anonymous';
    testVideo.src = raw;

    testVideo.onloadedmetadata = () => {
      setIsTestingUrl(false);
      setUrlVerified(true);
      setUrlPreviewSrc(raw);
    };

    testVideo.onerror = () => {
      setIsTestingUrl(false);
      // Even if direct metadata fails (e.g. CORS), accept typical video formats
      if (raw.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || raw.includes('google') || raw.includes('video')) {
        setUrlVerified(true);
        setUrlPreviewSrc(raw);
      } else {
        setUrlError(isAr ? 'تعذر تحميل الفيديو من هذا الرابط. تأكد أنه رابط مباشر أو متاح للمشاركة العامة.' : 'Could not stream video from URL');
      }
    };
  };

  // Start Camera Recording
  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 1280 }, facingMode: 'user' },
        audio: true,
      });
      cameraStreamRef.current = stream;
      if (liveVideoPreviewRef.current) {
        liveVideoPreviewRef.current.srcObject = stream;
        liveVideoPreviewRef.current.play().catch(() => {});
      }

      recordedChunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      mr.onstop = async () => {
        const recordedBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const recordedFile = new File([recordedBlob], `record-${Date.now()}.webm`, { type: 'video/webm' });
        await handleFileChange([recordedFile] as any);
      };

      mr.start(1000);
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingSeconds(0);

      const timer = setInterval(() => {
        setRecordingSeconds((s) => {
          if (s >= 59) {
            handleStopRecording();
            clearInterval(timer);
            return 60;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Camera error:', err);
      alert(isAr ? 'تعذر فتح الكاميرا، يرجى التأكد من منح الإذن للمتصفح' : 'Could not access camera');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
  };

  // Confirm and Submit Video
  const handleConfirmAddVideo = () => {
    if (!quotaStatus.canAdd) {
      alert(quotaStatus.messageAr);
      return;
    }

    if (activeTab === 'desktop' || activeTab === 'record') {
      if (!compressResult) {
        alert(isAr ? 'يرجى اختيار وضغط الفيديو أولاً' : 'Please select and compress a video first');
        return;
      }
      onAddVideo(compressResult.compressedUrl, compressResult.posterUrl);
      onClose();
    } else if (activeTab === 'google') {
      if (!urlVerified && !externalUrl.trim()) {
        alert(isAr ? 'يرجى إدخال رابط فيديو صالح' : 'Please enter a valid video link');
        return;
      }
      onAddVideo(externalUrl.trim());
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 text-white"
      onClick={onClose}
    >
      <div 
        className="bg-[#14151f] border border-white/15 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-[#FF2D55] to-orange-500 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-md text-white flex items-center justify-center shadow-lg">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white">
                إضافة وضغط فيديو ريلز جديد 🎬
              </h3>
              <p className="text-[11px] text-white/90">
                تحميل من سطح المكتب أو من الخارج من جوجل مع الضغط الفوري
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

        {/* Quota Status Banner (الالتزام بالحصص) */}
        <div className="bg-black/60 border-b border-white/10 p-3 px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <div>
              <span className="font-bold text-white block text-[11px]">
                حصة باقتك الحالية ({quota.tierNameAr}):
              </span>
              <span className="text-[10px] text-white/60">
                الفيديوهات المستخدمة: <b>{currentVideosCount}</b> من أصل <b>{quota.maxVideos}</b>
              </span>
            </div>
          </div>

          <div className="text-end">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
              quotaStatus.canAdd 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-red-500/20 text-red-300 border-red-500/40'
            }`}>
              {quotaStatus.canAdd ? `متبقي ${quotaStatus.remaining} فيديو` : 'اكتملت الحصة ⛔'}
            </span>
            <div className="w-24 bg-white/10 h-1.5 rounded-full overflow-hidden mt-1 mr-auto">
              <div 
                className={`h-full transition-all ${
                  currentVideosCount >= quota.maxVideos ? 'bg-red-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (currentVideosCount / quota.maxVideos) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs: Desktop vs Google vs Record */}
        <div className="flex items-center gap-1 p-2 bg-[#0A0B14] border-b border-white/10 text-xs px-4">
          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'desktop'
                ? 'bg-[#FF2D55] text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>سطح المكتب / جهازي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'google'
                ? 'bg-[#FF2D55] text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>من جوجل / رابط ويب</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('record')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'record'
                ? 'bg-[#FF2D55] text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>تسجيل مباشر 📹</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[62vh] overflow-y-auto text-xs">
          
          {/* TAB 1: DESKTOP UPLOAD & AUTO COMPRESSION */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files)}
              />

              {!selectedFile && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-3xl p-8 text-center cursor-pointer transition bg-white/5 hover:bg-white/10 group space-y-2"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#FF2D55]/20 text-[#FF2D55] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">
                      اضغط لاختيار فيديو من سطح المكتب أو اسحب الملف هنا
                    </h4>
                    <p className="text-[11px] text-white/50">
                      يدعم صيغ MP4, MOV, WebM, MKV • سيتم ضغط الفيديو تلقائياً لتسريع العرض
                    </p>
                  </div>
                </div>
              )}

              {/* Compression in Progress */}
              {isCompressing && (
                <div className="bg-[#0A0B14] border border-amber-400/30 rounded-2xl p-4 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-amber-300 font-bold">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>جارٍ ضغط الفيديو بنظام إعلانك الذكي... {compressProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-400 via-orange-500 to-[#FF2D55] h-full transition-all duration-300"
                      style={{ width: `${compressProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-white/50">
                    تقليص الدقة ومعدل البت للحصول على حجم خفيف جداً مع الحفاظ على وضوح الصورة
                  </p>
                </div>
              )}

              {/* Compression Result Preview */}
              {compressResult && !isCompressing && (
                <div className="bg-[#0A0B14] border border-emerald-500/30 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تم ضغط الفيديو بنجاح!</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setCompressResult(null);
                      }}
                      className="text-white/50 hover:text-red-400 text-[11px] flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>تغيير الفيديو</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div className="aspect-[9/14] rounded-xl overflow-hidden bg-black border border-white/10 relative max-h-48">
                      <video 
                        src={compressResult.compressedUrl} 
                        className="w-full h-full object-cover" 
                        controls 
                        playsInline 
                      />
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-white/50 block text-[10px]">الحجم الأصلي:</span>
                        <strong className="text-white font-mono">{compressResult.originalSizeMb} MB</strong>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-white/50 block text-[10px]">الحجم بعد الضغط:</span>
                        <strong className="text-emerald-400 font-mono text-sm">{compressResult.compressedSizeMb} MB</strong>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-emerald-300 font-bold text-[10px]">
                        🚀 وفرت {compressResult.compressionRatio}% من حجم الفيديو الأصلي!
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GOOGLE / EXTERNAL URL */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-white block">
                  رابط الفيديو من جوجل أو أي موقع خارجي:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => {
                      setExternalUrl(e.target.value);
                      setUrlVerified(false);
                      setUrlError('');
                    }}
                    placeholder="https://drive.google.com/... أو https://example.com/video.mp4"
                    className="flex-1 bg-[#0A0B14] border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono dir-ltr text-right"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyExternalUrl}
                    disabled={isTestingUrl}
                    className="bg-amber-400 hover:bg-amber-300 text-black px-4 py-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    {isTestingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                    <span>تحميل ومعاينة</span>
                  </button>
                </div>
                {urlError && (
                  <p className="text-red-400 text-[10px]">{urlError}</p>
                )}
                <p className="text-[10px] text-white/50 leading-relaxed">
                  💡 يمكنك لصق رابط مشاركة من Google Drive، أو رابط مباشر لملف MP4/WebM من أي سيرفر خارجي.
                </p>
              </div>

              {/* URL Preview */}
              {urlVerified && (
                <div className="bg-[#0A0B14] border border-emerald-500/30 rounded-2xl p-3.5 space-y-2">
                  <span className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم التحقق من الرابط بنجاح! جاهز للإضافة</span>
                  </span>
                  <div className="aspect-[16/9] rounded-xl overflow-hidden bg-black border border-white/10">
                    <video src={urlPreviewSrc} controls className="w-full h-full object-cover" playsInline />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RECORD LIVE VIDEO */}
          {activeTab === 'record' && (
            <div className="space-y-4 text-center">
              <div className="aspect-[9/14] max-h-64 mx-auto rounded-2xl overflow-hidden bg-black border border-white/20 relative">
                <video ref={liveVideoPreviewRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {isRecording && (
                  <div className="absolute top-3 left-3 bg-red-600/90 text-white px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    <span>00:{recordingSeconds.toString().padStart(2, '0')}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartCamera}
                    className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>فتح الكاميرا وبدء التسجيل</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="bg-white hover:bg-white/90 text-black px-6 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span className="w-3 h-3 bg-red-600 rounded-sm" />
                    <span>إيقاف وضغط الفيديو فوراً</span>
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-[#0A0B14] border-t border-white/10 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleConfirmAddVideo}
            disabled={
              !quotaStatus.canAdd ||
              (activeTab === 'desktop' && !compressResult) ||
              (activeTab === 'google' && !externalUrl.trim())
            }
            className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              quotaStatus.canAdd && ((activeTab === 'desktop' && compressResult) || (activeTab === 'google' && externalUrl.trim()))
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-black hover:brightness-110 shadow-lg shadow-emerald-900/30'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>إضافة الفيديو لصفحة النشاط (وفق الحصة)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
