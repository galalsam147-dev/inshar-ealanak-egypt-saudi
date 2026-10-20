import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, Music, Play, Pause, Download, Trash2, Plus, Volume2, VolumeX, 
  Search, Check, Sparkles, HardDrive, Headphones, SlidersHorizontal, 
  CheckCircle, Link as LinkIcon, Radio, Disc, Shield, AlertCircle
} from 'lucide-react';
import { BusinessSoundtrack, SoundtrackTrack, SupportedLang } from '../types';
import { 
  SOUNDTRACK_CATEGORIES, getFullSoundtrackList, getCustomSoundtracks, 
  saveCustomSoundtrack, deleteCustomSoundtrack, hideTrackFromBank 
} from '../utils/soundtracks';
import { globalStereoAudioEngine } from '../utils/stereoAudioEngine';
import { downloadAudioTrack } from '../utils/audioDownloader';

interface MusicBankModalProps {
  currentSoundtrack?: BusinessSoundtrack;
  onSelectSoundtrack?: (soundtrack: BusinessSoundtrack) => void;
  onRemoveSoundtrack?: () => void;
  onClose: () => void;
  lang: SupportedLang;
  isAdmin?: boolean;
}

export const MusicBankModal: React.FC<MusicBankModalProps> = ({
  currentSoundtrack,
  onSelectSoundtrack,
  onRemoveSoundtrack,
  onClose,
  lang,
  isAdmin = false,
}) => {
  const isAr = lang === 'ar';

  const [tracks, setTracks] = useState<SoundtrackTrack[]>(() => getFullSoundtrackList());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio Playback State
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stereo Settings
  const [stereoPan, setStereoPan] = useState<number>(currentSoundtrack?.stereoPan ?? 0);
  const [stereoMode, setStereoMode] = useState<'normal' | 'wide' | 'surround_3d'>(currentSoundtrack?.stereoMode ?? 'surround_3d');
  const [bassBoost, setBassBoost] = useState<number>(currentSoundtrack?.bassBoost ?? 4);
  const [trebleBoost, setTrebleBoost] = useState<number>(currentSoundtrack?.trebleBoost ?? 3);
  const [volume, setVolume] = useState<number>(currentSoundtrack?.volume ?? 0.7);
  const [isMuted, setIsMuted] = useState<boolean>(currentSoundtrack?.isMuted ?? false);

  // Upload state
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [customFileUrl, setCustomFileUrl] = useState<string>('');
  const [customFileTitle, setCustomFileTitle] = useState<string>('');
  const [customFileArtist, setCustomFileArtist] = useState<string>('');

  // Stereo VU levels
  const [vuLevels, setVuLevels] = useState<{ left: number; right: number }>({ left: 30, right: 30 });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // VU Meter animation during playback
  useEffect(() => {
    if (!isPlaying) {
      setVuLevels({ left: 15, right: 15 });
      return;
    }
    const interval = setInterval(() => {
      const panFactor = stereoPan;
      const baseL = Math.min(100, Math.max(15, Math.floor(45 + Math.random() * 45 - panFactor * 25)));
      const baseR = Math.min(100, Math.max(15, Math.floor(45 + Math.random() * 45 + panFactor * 25)));
      setVuLevels({ left: baseL, right: baseR });
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying, stereoPan]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      globalStereoAudioEngine.destroy();
    };
  }, []);

  const refreshTrackList = () => {
    setTracks(getFullSoundtrackList());
  };

  // Play / Pause Track
  const handleTogglePlay = (track: { id: string; url: string; title: string }) => {
    if (playingTrackId === track.id && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(track.url);
      newAudio.crossOrigin = 'anonymous';
      newAudio.volume = isMuted ? 0 : volume;

      // Connect to stereo engine
      globalStereoAudioEngine.setup(newAudio, {
        volume: isMuted ? 0 : volume,
        stereoPan,
        stereoMode,
        bassBoost,
        trebleBoost,
      });

      newAudio.play().catch((err) => {
        console.warn('Playback error:', err);
      });

      newAudio.onended = () => {
        setIsPlaying(false);
      };

      audioRef.current = newAudio;
      setPlayingTrackId(track.id);
      setIsPlaying(true);
    }
  };

  // Download Audio Track
  const handleDownload = async (track: { id: string; url: string; title: string; artist?: string }) => {
    setDownloadingId(track.id);
    showToast(`جاري بدء تحميل المقطع: ${track.title} ⏳`);
    try {
      const success = await downloadAudioTrack(track);
      if (success) {
        showToast(`✅ تم تنزيل الملف بنجاح: ${track.title}.mp3`);
      } else {
        showToast(`تم فتح رابط التحميل للمقطع: ${track.title}`);
      }
    } catch {
      showToast('تعذر التحميل المباشر للمقطع، تم فتح الرابط.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Delete Custom Track or Hide Track
  const handleDeleteTrack = (track: SoundtrackTrack) => {
    const confirmMsg = isAr 
      ? `هل تريد بالتأكيد حذف أو إخفاء المقطع: "${track.title}" من بنك الأغاني؟`
      : `Are you sure you want to delete/hide "${track.title}" from the music bank?`;

    if (!window.confirm(confirmMsg)) return;

    if (track.isCustom) {
      deleteCustomSoundtrack(track.id);
      showToast(`تم حذف الأغنية المرفوعة: ${track.title} بنجاح 🗑️`);
    } else {
      hideTrackFromBank(track.id);
      showToast(`تم إخفاء المقطع: ${track.title} من بنك الصوتيات 🗑️`);
    }

    if (playingTrackId === track.id) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
      setPlayingTrackId(null);
    }

    refreshTrackList();
  };

  // Upload / Add Local File
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();

    reader.onload = () => {
      const base64Url = reader.result as string;
      const newTrack: SoundtrackTrack = {
        id: `custom-track-${Date.now()}`,
        title: fileNameWithoutExt,
        artist: isAr ? 'أغنية مرفوعة من جهازي' : 'My Device Upload',
        category: 'custom',
        categoryLabelAr: 'أغاني وموسيقى مضافة 🎧',
        url: base64Url,
        duration: '1:00',
        compressedSizeKb: Math.round(file.size / 1024),
        isCustom: true,
        addedAt: Date.now(),
      };

      saveCustomSoundtrack(newTrack);
      refreshTrackList();
      setSelectedCategory('custom');
      showToast(`تمت إضافة الأغنية "${newTrack.title}" إلى بنك الموسيقى بنجاح! 🎵`);

      // Auto play
      handleTogglePlay(newTrack);
    };

    reader.readAsDataURL(file);
  };

  // Add via External URL
  const handleAddExternalUrl = () => {
    if (!customFileUrl.trim()) return;
    const newTrack: SoundtrackTrack = {
      id: `custom-link-${Date.now()}`,
      title: customFileTitle.trim() || (isAr ? 'مقطع خارجي مضاف' : 'External Web Audio'),
      artist: customFileArtist.trim() || (isAr ? 'رابط مباشر' : 'Direct Link'),
      category: 'custom',
      categoryLabelAr: 'أغاني وموسيقى مضافة 🎧',
      url: customFileUrl.trim(),
      duration: '1:00',
      compressedSizeKb: 500,
      isCustom: true,
      addedAt: Date.now(),
    };

    saveCustomSoundtrack(newTrack);
    refreshTrackList();
    setSelectedCategory('custom');
    setCustomFileUrl('');
    setCustomFileTitle('');
    setCustomFileArtist('');
    setShowUploadForm(false);
    showToast(`تم حفظ المقطع الخارجي "${newTrack.title}" في بنك الأغاني! 🎵`);
  };

  // Select Track for the Ad / Business
  const handleSelectForAd = (track: SoundtrackTrack) => {
    if (onSelectSoundtrack) {
      onSelectSoundtrack({
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        url: track.url,
        isExternal: Boolean(track.isCustom),
        isMuted: isMuted,
        volume: volume,
        stereoPan: stereoPan,
        stereoMode: stereoMode,
        bassBoost: bassBoost,
        trebleBoost: trebleBoost,
        updatedAt: Date.now(),
      });
      showToast(`تم تعيين "${track.title}" كموسيقى تصويرية للإعلان 🎬`);
    }
  };

  // Filter Tracks
  const filteredTracks = useMemo(() => {
    let list = tracks;
    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => 
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.categoryLabelAr.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tracks, selectedCategory, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-white">
        
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-[#FF2D55] text-black font-black px-4 py-2 rounded-2xl shadow-2xl text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4 text-black" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-neutral-900 to-amber-950/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF2D55] via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg text-black">
              <Headphones className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">
                  بنك الأغاني والموسيقى والصوتيات 🎵
                </h2>
                <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                  1000+ مقطع مضغوط ⚡
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  استريو 3D مدمج
                </span>
              </div>
              <p className="text-[11px] text-white/60">
                استماع مباشر، تحميل MP3، إضافة أغانيك من جهازك، وحذف وإدارة المقاطع بحرية كاملة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Audio Bar & Stereo Controls */}
        <div className="p-3 sm:p-4 bg-gradient-to-b from-black/80 to-[#0A0B14] border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            {/* Current Playing Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                isPlaying ? 'bg-[#FF2D55] text-white border-transparent shadow-lg shadow-[#FF2D55]/30' : 'bg-white/10 text-white/60 border-white/10'
              }`}>
                <Disc className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-white truncate flex items-center gap-2">
                  <span>
                    {playingTrackId 
                      ? (tracks.find((t) => t.id === playingTrackId)?.title || 'مقطع صوتي نشط')
                      : (currentSoundtrack?.title || 'اختر مقطعاً للاستماع والتحميل')}
                  </span>
                  {isPlaying && (
                    <span className="text-[9px] bg-emerald-500 text-black font-black px-1.5 py-0.2 rounded animate-pulse">
                      جاري التشغيل استريو 🔊
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/50 block truncate">
                  {playingTrackId 
                    ? (tracks.find((t) => t.id === playingTrackId)?.artist || '')
                    : (currentSoundtrack?.artist || 'مكتبة إعلانك للصوتيات الرقمية')}
                </span>
              </div>
            </div>

            {/* Stereo Dual Meters (L & R) */}
            <div className="flex items-center gap-2 bg-black/70 px-3 py-1.5 rounded-2xl border border-white/10 shrink-0">
              <span className="text-[10px] font-mono font-bold text-sky-400">L</span>
              <div className="w-14 bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-100" 
                  style={{ width: `${vuLevels.left}%` }} 
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400">R</span>
              <div className="w-14 bg-white/10 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-100" 
                  style={{ width: `${vuLevels.right}%` }} 
                />
              </div>
            </div>

            {/* Quick Actions: Remove Soundtrack or Upload */}
            <div className="flex items-center gap-1.5">
              {onRemoveSoundtrack && (
                <button
                  type="button"
                  onClick={() => {
                    onRemoveSoundtrack();
                    showToast('تمت إزالة وتفريغ الموسيقى التصويرية من الإعلان 🔇');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-bold transition flex items-center gap-1"
                  title="حذف الصوت من الإعلان تماماً"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>بدون موسيقى (حذف)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[11px] font-black transition flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>إضافة أغنية من جهازي 🎵</span>
              </button>
            </div>
          </div>

          {/* Upload Form Accordion */}
          {showUploadForm && (
            <div className="bg-black/60 border border-amber-500/30 rounded-2xl p-3.5 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4" />
                  <span>رفع أغنية أو ملف صوتي MP3 / WAV من سطح المكتب أو الهاتف:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="text-white/50 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. File Upload Box */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 hover:border-amber-400 rounded-2xl p-4 text-center cursor-pointer transition bg-white/5 hover:bg-white/10 group space-y-1.5"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.m4a"
                    className="hidden"
                    onChange={handleUploadFile}
                  />
                  <div className="w-10 h-10 rounded-xl bg-[#FF2D55]/20 text-[#FF2D55] flex items-center justify-center mx-auto group-hover:scale-110 transition">
                    <Music className="w-5 h-5" />
                  </div>
                  <h5 className="text-xs font-bold text-white">اختر ملف صوتي من جهازك</h5>
                  <p className="text-[10px] text-white/50">MP3, WAV, AAC, M4A • حفظ دائم في البنك</p>
                </div>

                {/* 2. Direct Web Link Box */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
                  <span className="text-[11px] font-bold text-white block">أو أدخل رابط مباشر من جوجل أو الويب:</span>
                  <input
                    type="url"
                    value={customFileUrl}
                    onChange={(e) => setCustomFileUrl(e.target.value)}
                    placeholder="https://.../audio.mp3"
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:border-amber-400 outline-none dir-ltr text-right"
                  />
                  <input
                    type="text"
                    value={customFileTitle}
                    onChange={(e) => setCustomFileTitle(e.target.value)}
                    placeholder="اسم الأغنية / المقطع"
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:border-amber-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddExternalUrl}
                    disabled={!customFileUrl.trim()}
                    className="w-full py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black font-black text-xs transition cursor-pointer"
                  >
                    حفظ في بنك الأغاني
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories Bar & Search */}
        <div className="p-3 border-b border-white/10 bg-neutral-900/60 space-y-2.5">
          {/* Categories Horizontal Scroll */}
          <div className="flex gap-1.5 overflow-x-auto hide-scroll pb-1">
            {SOUNDTRACK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#FF2D55] text-white border-transparent shadow font-black'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.labelAr}</span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في بنك الأغاني (اسم السورة، القارئ، اسم الأغنية، حماسي، ريلز، هادئ...)"
              className="w-full bg-white/10 border border-white/15 rounded-2xl ps-9 pe-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-amber-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 min-h-[300px] max-h-[50vh]">
          {filteredTracks.length === 0 ? (
            <div className="py-12 text-center text-white/50 space-y-2">
              <Music className="w-10 h-10 mx-auto text-white/20" />
              <p className="text-xs font-bold">لا توجد مقاطع تطابق بحثك حالياً</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs text-amber-400 underline font-bold"
              >
                عرض جميع مقاطع البنك
              </button>
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isPlayingThis = playingTrackId === track.id && isPlaying;
              const isDownloadingThis = downloadingId === track.id;
              const isCurrentSelected = currentSoundtrack?.trackId === track.id;

              return (
                <div
                  key={track.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isCurrentSelected
                      ? 'bg-gradient-to-r from-amber-500/20 via-neutral-900 to-[#FF2D55]/15 border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
                      : isPlayingThis
                      ? 'bg-white/10 border-amber-400/50 shadow'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {/* Left: Play Button & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePlay(track)}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition cursor-pointer ${
                        isPlayingThis
                          ? 'bg-[#FF2D55] text-white animate-pulse'
                          : 'bg-amber-400 text-black hover:bg-amber-300'
                      }`}
                      title="استماع استريو"
                    >
                      {isPlayingThis ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ms-0.5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-white truncate">
                          {track.title}
                        </span>
                        {track.isCustom && (
                          <span className="text-[9px] bg-purple-500/30 text-purple-300 border border-purple-400/30 font-bold px-1.5 py-0.2 rounded">
                            أغنية مضافة 🎧
                          </span>
                        )}
                        <span className="text-[9px] bg-white/10 text-amber-300 font-bold px-1.5 py-0.2 rounded shrink-0">
                          {track.duration || '0:45'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-white/50 mt-0.5">
                        <span className="truncate">{track.artist}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          {track.compressedSizeKb ? `${track.compressedSizeKb} KB ⚡` : 'مضغوط'}
                        </span>
                        <span>•</span>
                        <span className="text-white/40">{track.categoryLabelAr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions (Download MP3, Select, Delete) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* DOWNLOAD MUSIC BUTTON (تحميل الموسيقى) */}
                    <button
                      type="button"
                      onClick={() => handleDownload(track)}
                      disabled={isDownloadingThis}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="تحميل الموسيقى MP3 لجهازك"
                    >
                      <Download className={`w-3.5 h-3.5 ${isDownloadingThis ? 'animate-bounce' : ''}`} />
                      <span className="hidden sm:inline">تحميل MP3</span>
                    </button>

                    {/* SELECT TRACK FOR AD */}
                    {onSelectSoundtrack && (
                      <button
                        type="button"
                        onClick={() => handleSelectForAd(track)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          isCurrentSelected
                            ? 'bg-amber-400 text-black font-black shadow'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        {isCurrentSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>مختارة</span>
                          </>
                        ) : (
                          <span>اختيار</span>
                        )}
                      </button>
                    )}

                    {/* DELETE / REMOVE TRACK */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTrack(track)}
                      className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 flex items-center justify-center transition cursor-pointer"
                      title={track.isCustom ? 'حذف الأغنية المرفوعة' : 'إخفاء المقطع من بنك الأغاني'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-neutral-950 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-white/60 text-[11px]">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>جميع المقاطع مفحوصة ومضغوطة لسرعة التحميل وتعمل مع محرك الاستريو 3D</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
