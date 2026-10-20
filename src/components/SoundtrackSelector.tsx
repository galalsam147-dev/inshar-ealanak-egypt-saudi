import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Music, Play, Pause, Volume2, VolumeX, Check, Sparkles, 
  Link as LinkIcon, Radio, ShieldAlert, Sliders, ExternalLink, RefreshCw,
  Search, Shield, AlertTriangle, Upload, Disc, Headphones, SlidersHorizontal, HardDrive,
  Download, Trash2
} from 'lucide-react';
import { BusinessSoundtrack, SoundtrackTrack, SupportedLang } from '../types';
import { 
  SOUNDTRACK_LIBRARY, SOUNDTRACK_CATEGORIES, getFullSoundtrackList, 
  getCustomSoundtracks, saveCustomSoundtrack, deleteCustomSoundtrack, hideTrackFromBank 
} from '../utils/soundtracks';
import { globalStereoAudioEngine, StereoEngineSettings } from '../utils/stereoAudioEngine';
import { downloadAudioTrack } from '../utils/audioDownloader';

interface SoundtrackSelectorProps {
  value?: BusinessSoundtrack;
  onChange: (soundtrack: BusinessSoundtrack) => void;
  onRemove?: () => void;
  lang: SupportedLang;
  isAdmin?: boolean;
}

export const SoundtrackSelector: React.FC<SoundtrackSelectorProps> = ({
  value,
  onChange,
  onRemove,
  lang,
  isAdmin = false,
}) => {
  const isAr = lang === 'ar';

  const [allBankTracks, setAllBankTracks] = useState<SoundtrackTrack[]>(() => getFullSoundtrackList());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  // Mode: 'library' | 'upload_desktop' | 'external_url'
  const [activeMode, setActiveMode] = useState<'library' | 'upload_desktop' | 'external_url'>(
    value?.isExternal ? 'external_url' : 'library'
  );

  const [customUrl, setCustomUrl] = useState<string>(value?.isExternal ? value.url : '');
  const [customTitle, setCustomTitle] = useState<string>(value?.isExternal ? value.title : '');
  const [adminMuteReasonInput, setAdminMuteReasonInput] = useState<string>(value?.adminMuteReason || '');

  // Integrated Stereo Sound Controls
  const [stereoPan, setStereoPan] = useState<number>(value?.stereoPan ?? 0); // -1 to +1
  const [stereoMode, setStereoMode] = useState<'normal' | 'wide' | 'surround_3d'>(value?.stereoMode ?? 'surround_3d');
  const [bassBoost, setBassBoost] = useState<number>(value?.bassBoost ?? 4); // 0 to 12 dB
  const [trebleBoost, setTrebleBoost] = useState<number>(value?.trebleBoost ?? 3); // 0 to 12 dB
  const [showStereoPanel, setShowStereoPanel] = useState<boolean>(true);

  // Stereo Meter animation
  const [stereoLevels, setStereoLevels] = useState<{ left: number; right: number }>({ left: 35, right: 35 });

  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
      globalStereoAudioEngine.destroy();
    };
  }, []);

  // Update stereo visualizer animation when preview is playing
  useEffect(() => {
    if (!isPlayingPreview) {
      setStereoLevels({ left: 20, right: 20 });
      return;
    }

    const interval = setInterval(() => {
      const panFactor = stereoPan; // -1 to 1
      const baseL = Math.min(100, Math.max(10, Math.floor(40 + Math.random() * 50 - panFactor * 25)));
      const baseR = Math.min(100, Math.max(10, Math.floor(40 + Math.random() * 50 + panFactor * 25)));
      setStereoLevels({ left: baseL, right: baseR });
    }, 120);

    return () => clearInterval(interval);
  }, [isPlayingPreview, stereoPan]);

  const updateStereoSettings = (newSettings: Partial<StereoEngineSettings>) => {
    const pan = newSettings.stereoPan !== undefined ? newSettings.stereoPan : stereoPan;
    const mode = newSettings.stereoMode !== undefined ? newSettings.stereoMode : stereoMode;
    const bass = newSettings.bassBoost !== undefined ? newSettings.bassBoost : bassBoost;
    const treble = newSettings.trebleBoost !== undefined ? newSettings.trebleBoost : trebleBoost;

    if (newSettings.stereoPan !== undefined) setStereoPan(newSettings.stereoPan);
    if (newSettings.stereoMode !== undefined) setStereoMode(newSettings.stereoMode);
    if (newSettings.bassBoost !== undefined) setBassBoost(newSettings.bassBoost);
    if (newSettings.trebleBoost !== undefined) setTrebleBoost(newSettings.trebleBoost);

    globalStereoAudioEngine.applySettings({
      volume: value?.volume ?? 0.7,
      stereoPan: pan,
      stereoMode: mode,
      bassBoost: bass,
      trebleBoost: treble,
    });

    onChange({
      ...(value || {
        trackId: SOUNDTRACK_LIBRARY[0].id,
        title: SOUNDTRACK_LIBRARY[0].title,
        artist: SOUNDTRACK_LIBRARY[0].artist,
        url: SOUNDTRACK_LIBRARY[0].url,
        isMuted: false,
      }),
      stereoPan: pan,
      stereoMode: mode,
      bassBoost: bass,
      trebleBoost: treble,
      updatedAt: Date.now(),
    });
  };

  const handleTogglePlayPreview = (trackUrl: string, trackId: string) => {
    if (playingTrackId === trackId && isPlayingPreview) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setIsPlayingPreview(false);
      setPlayingTrackId(null);
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      const newAudio = new Audio(trackUrl);
      newAudio.crossOrigin = 'anonymous';
      newAudio.volume = value?.volume ?? 0.7;

      // Connect to Stereo Engine
      globalStereoAudioEngine.setup(newAudio, {
        volume: value?.volume ?? 0.7,
        stereoPan,
        stereoMode,
        bassBoost,
        trebleBoost,
      });

      newAudio.play().catch(() => {});
      newAudio.onended = () => {
        setIsPlayingPreview(false);
        setPlayingTrackId(null);
      };
      audioPreviewRef.current = newAudio;
      setIsPlayingPreview(true);
      setPlayingTrackId(trackId);
    }
  };

  const handleSelectTrack = (track: SoundtrackTrack) => {
    onChange({
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      url: track.url,
      isExternal: false,
      isMuted: value?.isMuted ?? false,
      volume: value?.volume ?? 0.7,
      stereoPan,
      stereoMode,
      bassBoost,
      trebleBoost,
      mutedByAdmin: value?.mutedByAdmin ?? false,
      adminMuteReason: value?.adminMuteReason,
      updatedAt: Date.now(),
    });
  };

  // Upload Local Song / Audio file from desktop with persistent Base64
  const handleUploadAudioFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newCustomTrack: SoundtrackTrack = {
        id: `custom-track-${Date.now()}`,
        title: fileNameWithoutExt,
        artist: isAr ? 'أغنية من سطح المكتب' : 'Desktop Upload',
        category: 'custom',
        categoryLabelAr: 'أغاني وموسيقى مضافة 🎧',
        url: dataUrl,
        duration: '1:00',
        compressedSizeKb: Math.round(file.size / 1024),
        isCustom: true,
        addedAt: Date.now(),
      };

      saveCustomSoundtrack(newCustomTrack);
      setAllBankTracks(getFullSoundtrackList());
      setSelectedCategory('custom');
      setToastFeedback(`تمت إضافة "${fileNameWithoutExt}" لبنك الأغاني بنجاح! 🎵`);

      onChange({
        trackId: newCustomTrack.id,
        title: fileNameWithoutExt,
        artist: isAr ? 'أغنية من سطح المكتب' : 'Desktop Upload',
        url: dataUrl,
        isExternal: true,
        isMuted: false,
        volume: value?.volume ?? 0.7,
        stereoPan,
        stereoMode,
        bassBoost,
        trebleBoost,
        mutedByAdmin: value?.mutedByAdmin ?? false,
        adminMuteReason: value?.adminMuteReason,
        updatedAt: Date.now(),
      });

      handleTogglePlayPreview(dataUrl, newCustomTrack.id);
    };

    reader.readAsDataURL(file);
  };

  // Download MP3 Track directly
  const handleDownloadTrack = async (track: { id: string; url: string; title: string; artist?: string }) => {
    setDownloadingId(track.id);
    setToastFeedback(`جاري بدء تحميل: ${track.title} ⏳`);
    try {
      const success = await downloadAudioTrack(track);
      if (success) {
        setToastFeedback(`✅ تم تحميل المقطع بنجاح: ${track.title}.mp3`);
      } else {
        setToastFeedback(`تم فتح رابط تحميل المقطع: ${track.title}`);
      }
    } catch {
      setToastFeedback('تم فتح رابط التحميل المباشر.');
    } finally {
      setDownloadingId(null);
      setTimeout(() => setToastFeedback(null), 3500);
    }
  };

  // Delete Track from custom list or hide from bank
  const handleDeleteTrack = (track: SoundtrackTrack) => {
    const confirmMsg = isAr
      ? `هل تريد حذف أو إخفاء المقطع: "${track.title}"؟`
      : `Delete/hide track "${track.title}"?`;
    if (!window.confirm(confirmMsg)) return;

    if (track.isCustom) {
      deleteCustomSoundtrack(track.id);
      setToastFeedback(`تم حذف الأغنية: ${track.title} بنجاح 🗑️`);
    } else {
      hideTrackFromBank(track.id);
      setToastFeedback(`تم إخفاء المقطع: ${track.title} 🗑️`);
    }

    if (playingTrackId === track.id) {
      if (audioPreviewRef.current) audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
      setPlayingTrackId(null);
    }

    setAllBankTracks(getFullSoundtrackList());
    setTimeout(() => setToastFeedback(null), 3000);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    const finalTitle = customTitle.trim() || (isAr ? 'موسيقى خارجية من جوجل/الويب' : 'Custom Web Audio Track');
    const newCustomTrack: SoundtrackTrack = {
      id: `custom-url-${Date.now()}`,
      title: finalTitle,
      artist: isAr ? 'رابط صوت خارجي' : 'External Audio Link',
      category: 'custom',
      categoryLabelAr: 'أغاني وموسيقى مضافة 🎧',
      url: customUrl.trim(),
      duration: '1:00',
      compressedSizeKb: 500,
      isCustom: true,
      addedAt: Date.now(),
    };

    saveCustomSoundtrack(newCustomTrack);
    setAllBankTracks(getFullSoundtrackList());
    setSelectedCategory('custom');

    onChange({
      trackId: newCustomTrack.id,
      title: finalTitle,
      artist: isAr ? 'رابط صوت خارجي' : 'External Audio Link',
      url: customUrl.trim(),
      isExternal: true,
      isMuted: value?.isMuted ?? false,
      volume: value?.volume ?? 0.7,
      stereoPan,
      stereoMode,
      bassBoost,
      trebleBoost,
      mutedByAdmin: value?.mutedByAdmin ?? false,
      adminMuteReason: value?.adminMuteReason,
      updatedAt: Date.now(),
    });

    handleTogglePlayPreview(customUrl.trim(), newCustomTrack.id);
  };

  const handleToggleMute = () => {
    const nextMuted = !value?.isMuted;
    onChange({
      ...(value || {
        trackId: SOUNDTRACK_LIBRARY[0].id,
        title: SOUNDTRACK_LIBRARY[0].title,
        artist: SOUNDTRACK_LIBRARY[0].artist,
        url: SOUNDTRACK_LIBRARY[0].url,
      }),
      isMuted: nextMuted,
      updatedAt: Date.now(),
    });
  };

  const handleToggleAdminMute = () => {
    const nextAdminMuted = !value?.mutedByAdmin;
    onChange({
      ...(value || {
        trackId: SOUNDTRACK_LIBRARY[0].id,
        title: SOUNDTRACK_LIBRARY[0].title,
        artist: SOUNDTRACK_LIBRARY[0].artist,
        url: SOUNDTRACK_LIBRARY[0].url,
      }),
      isMuted: nextAdminMuted ? true : value?.isMuted ?? false,
      mutedByAdmin: nextAdminMuted,
      adminMuteReason: nextAdminMuted 
        ? (adminMuteReasonInput.trim() || (isAr ? 'تم كتم الصوت إدارياً لعدم ملائمة المحتوى الصوتي' : 'Muted by admin'))
        : undefined,
      updatedAt: Date.now(),
    });
  };

  const handleChangeVolume = (vol: number) => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.volume = vol;
    }
    onChange({
      ...(value || {
        trackId: SOUNDTRACK_LIBRARY[0].id,
        title: SOUNDTRACK_LIBRARY[0].title,
        artist: SOUNDTRACK_LIBRARY[0].artist,
        url: SOUNDTRACK_LIBRARY[0].url,
        isMuted: false,
      }),
      volume: vol,
      updatedAt: Date.now(),
    });
  };

  // Filtered tracks with fast search across all 1000+ items and custom tracks
  const filteredTracks = useMemo(() => {
    let list = allBankTracks;
    if (selectedCategory !== 'all') {
      list = list.filter((s) => s.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => 
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.categoryLabelAr.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 150);
  }, [allBankTracks, selectedCategory, searchQuery]);

  return (
    <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-amber-950/20 border border-amber-500/30 rounded-2xl p-3.5 space-y-3.5">
      {/* Toast Alert */}
      {toastFeedback && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-amber-400 to-[#FF2D55] text-black font-black px-3.5 py-1.5 rounded-xl shadow-xl text-[11px] flex items-center gap-1.5 animate-bounce">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>{toastFeedback}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30 shrink-0">
            <Headphones className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">
                {isAr ? 'الموسيقى التصويرية والصوت الاستريو المدمج 🎧' : 'Stereo Audio & Soundtrack Engine'}
              </span>
              <span className="text-[9px] bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black px-2 py-0.5 rounded-full shadow">
                {isAr ? 'استريو محيطي 3D ⚡' : '3D Spatial Stereo'}
              </span>
            </div>
            <span className="text-[10px] text-white/60 block">
              {isAr
                ? 'تحميل وتنزيل أغاني MP3، رفع من جهازك أو جوجل، وحذف المقاطع بحرية'
                : 'Download MP3 tracks, upload from desktop/Google, and manage audio'}
            </span>
          </div>
        </div>

        {/* Action Buttons: Mute, Remove & Admin Mute */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition flex items-center gap-1 cursor-pointer"
              title="حذف الصوت تماماً من الإعلان"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>بدون صوت (حذف)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleMute}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
              value?.isMuted
                ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {value?.isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>{isAr ? 'الصوت مكتوم 🔇' : 'Muted 🔇'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'الصوت مفعّل 🔊' : 'Active 🔊'}</span>
              </>
            )}
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={handleToggleAdminMute}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 transition cursor-pointer border ${
                value?.mutedByAdmin
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-red-900/40 text-red-200 border-red-500/40'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>{value?.mutedByAdmin ? 'فك كتم الإدارة' : 'كتم إداري'}</span>
            </button>
          )}
        </div>
      </div>

      {/* INTEGRATED STEREO SOUND ENGINE CONTROLS (تشغيل الصوت استريو مدمج) */}
      <div className="bg-[#0A0B14] border border-amber-500/25 rounded-2xl p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white text-xs">
              تحكم الصوت الاستريو المدمج (Stereo Panning & Equalizer)
            </span>
          </div>

          {/* DUAL CHANNEL STEREO LEVEL METERS (L & R) */}
          <div className="flex items-center gap-2 bg-black/60 px-2.5 py-1 rounded-xl border border-white/10">
            <span className="text-[10px] font-mono font-bold text-sky-400">L</span>
            <div className="w-12 bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-100" 
                style={{ width: `${stereoLevels.left}%` }} 
              />
            </div>

            <span className="text-[10px] font-mono font-bold text-amber-400">R</span>
            <div className="w-12 bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-100" 
                style={{ width: `${stereoLevels.right}%` }} 
              />
            </div>

            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ms-1" title="Stereo Engine Active" />
          </div>
        </div>

        {/* Stereo Pan Slider (توازن القنوات: يسار / استريو وسطي / يمين) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[10px] text-white/70">
            <span>سماعة يسار (L)</span>
            <span className="text-amber-300 font-bold">
              {stereoPan === 0 ? 'استريو متوازن متطابق (Center)' : stereoPan < 0 ? `ميل يسار ${Math.round(Math.abs(stereoPan) * 100)}%` : `ميل يمين ${Math.round(stereoPan * 100)}%`}
            </span>
            <span>سماعة يمين (R)</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={stereoPan}
            onChange={(e) => updateStereoSettings({ stereoPan: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 bg-white/10 rounded-lg cursor-pointer h-1.5"
          />
          <div className="flex justify-between gap-1 pt-0.5">
            <button
              type="button"
              onClick={() => updateStereoSettings({ stereoPan: -0.8 })}
              className={`text-[9px] px-2 py-0.5 rounded transition ${stereoPan < -0.5 ? 'bg-sky-500 text-black font-bold' : 'text-white/50 bg-white/5'}`}
            >
              يسار L
            </button>
            <button
              type="button"
              onClick={() => updateStereoSettings({ stereoPan: 0 })}
              className={`text-[9px] px-2 py-0.5 rounded transition ${stereoPan === 0 ? 'bg-amber-400 text-black font-black' : 'text-white/50 bg-white/5'}`}
            >
              استريو متوازن 0
            </button>
            <button
              type="button"
              onClick={() => updateStereoSettings({ stereoPan: 0.8 })}
              className={`text-[9px] px-2 py-0.5 rounded transition ${stereoPan > 0.5 ? 'bg-orange-500 text-black font-bold' : 'text-white/50 bg-white/5'}`}
            >
              يمين R
            </button>
          </div>
        </div>

        {/* Stereo Modes (Normal / Wide / 3D Surround) & Equalizer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
          <div>
            <label className="text-[10px] text-white/60 block mb-1">وضع الاستريو والمجال الصوتي:</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'normal', label: 'قياسي' },
                { id: 'wide', label: 'واسع Wide' },
                { id: 'surround_3d', label: '3D محيطي' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => updateStereoSettings({ stereoMode: m.id as any })}
                  className={`py-1 rounded-lg text-[10px] font-bold border transition ${
                    stereoMode === m.id
                      ? 'bg-amber-400 text-black border-amber-400 font-black'
                      : 'bg-white/5 text-white/70 border-white/10 hover:border-white/20'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Equalizer Quick Knobs */}
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-0.5">
              <span className="text-[10px] text-white/60 block">مضخم البيز ({bassBoost} dB):</span>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={bassBoost}
                onChange={(e) => updateStereoSettings({ bassBoost: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-400 bg-white/10 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            <div className="flex-1 space-y-0.5">
              <span className="text-[10px] text-white/60 block">النقاء Treble ({trebleBoost} dB):</span>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={trebleBoost}
                onChange={(e) => updateStereoSettings({ trebleBoost: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-1.5"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Track Banner */}
      <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <div className="min-w-0">
            <div className="text-xs font-black text-white truncate flex items-center gap-1.5">
              <span>{value?.title || SOUNDTRACK_LIBRARY[0].title}</span>
              {value?.isExternal && (
                <span className="text-[9px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded border border-blue-400/40 font-bold">
                  {isAr ? 'ملف خارجي' : 'External'}
                </span>
              )}
            </div>
            <span className="text-[10px] text-white/50 block truncate">
              {value?.artist || SOUNDTRACK_LIBRARY[0].artist}
            </span>
          </div>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
          <Sliders className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="text-[10px] text-white/60 shrink-0">{isAr ? 'الصوت:' : 'Vol:'}</span>
          {[0.3, 0.6, 0.9].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleChangeVolume(v)}
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition ${
                Math.abs((value?.volume ?? 0.7) - v) < 0.15
                  ? 'bg-amber-400 text-black font-black'
                  : 'text-white/60 hover:text-white bg-white/5'
              }`}
            >
              {v === 0.3 ? '30%' : v === 0.6 ? '60%' : '90%'}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Switcher: 3 Modes */}
      <div className="grid grid-cols-3 gap-1.5 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveMode('library')}
          className={`py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 ${
            activeMode === 'library'
              ? 'bg-amber-400 text-black shadow'
              : 'bg-white/5 text-white/70 hover:text-white'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>بنك المقاطع (1000)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('upload_desktop')}
          className={`py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 ${
            activeMode === 'upload_desktop'
              ? 'bg-[#FF2D55] text-white shadow'
              : 'bg-white/5 text-white/70 hover:text-white'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>رفع أغنية من جهازي 🎵</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('external_url')}
          className={`py-2 px-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 ${
            activeMode === 'external_url'
              ? 'bg-amber-400 text-black shadow'
              : 'bg-white/5 text-white/70 hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>رابط صوت من جوجل/ويب</span>
        </button>
      </div>

      {/* MODE 1: SUGGESTED LIBRARY & 1000 TRACK BANK */}
      {activeMode === 'library' && (
        <div className="space-y-2.5">
          {/* Category filter pills */}
          <div className="flex gap-1.5 overflow-x-auto hide-scroll py-0.5">
            {SOUNDTRACK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition flex items-center gap-1 ${
                  selectedCategory === cat.id
                    ? 'bg-[#FF2D55] text-white border-transparent shadow font-black'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{isAr ? cat.labelAr : cat.labelEn}</span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/40 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث في بنك الـ 1000 مقطع (اسم السورة، القارئ، دعاء، إيقاع...)' : 'Search 1000 tracks...'}
              className="w-full bg-white/10 border border-white/15 rounded-xl ps-8 pe-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:border-amber-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute end-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Tracks List */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {filteredTracks.map((track) => {
              const isSelected = (!value?.isExternal && value?.trackId === track.id) || (!value?.trackId && !value?.isExternal && track.id === SOUNDTRACK_LIBRARY[0].id);
              const isPlayingThis = playingTrackId === track.id && isPlayingPreview;

              return (
                <div
                  key={track.id}
                  className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/20 to-[#FF2D55]/15 border-amber-400 ring-1 ring-amber-400/40 shadow'
                      : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePlayPreview(track.url, track.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow transition ${
                        isPlayingThis
                          ? 'bg-[#FF2D55] text-white animate-pulse'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                      title="استماع استريو للمقطع"
                    >
                      {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ms-0.5" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white truncate">
                          {track.title}
                        </span>
                        <span className="text-[9px] bg-white/10 text-amber-300 font-bold px-1.5 py-0.2 rounded shrink-0">
                          {track.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/50 mt-0.5">
                        <span className="truncate">{track.artist}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          {track.compressedSizeKb} KB ⚡
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Download MP3 Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadTrack(track)}
                      disabled={downloadingId === track.id}
                      className="px-2 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="تحميل الموسيقى MP3"
                    >
                      <Download className={`w-3 h-3 ${downloadingId === track.id ? 'animate-bounce' : ''}`} />
                      <span className="hidden sm:inline">تحميل</span>
                    </button>

                    {/* Select Track Button */}
                    <button
                      type="button"
                      onClick={() => handleSelectTrack(track)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition flex items-center gap-1 shrink-0 ${
                        isSelected
                          ? 'bg-amber-400 text-black font-black shadow'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>مختارة</span>
                        </>
                      ) : (
                        <span>اختيار</span>
                      )}
                    </button>

                    {/* Delete / Hide Track Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTrack(track)}
                      className="w-7 h-7 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center transition cursor-pointer"
                      title={track.isCustom ? 'حذف الأغنية المرفوعة' : 'إخفاء المقطع من بنك الأغاني'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: UPLOAD SONG FROM DESKTOP / DEVICE */}
      {activeMode === 'upload_desktop' && (
        <div className="space-y-3 bg-black/40 border border-white/10 rounded-2xl p-4 text-center">
          <input
            ref={audioFileInputRef}
            type="file"
            accept="audio/mp3,audio/wav,audio/ogg,audio/aac,audio/m4a,audio/*"
            className="hidden"
            onChange={(e) => handleUploadAudioFile(e.target.files)}
          />

          <div
            onClick={() => audioFileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl p-6 cursor-pointer transition bg-white/5 hover:bg-white/10 group space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FF2D55]/20 text-[#FF2D55] flex items-center justify-center mx-auto group-hover:scale-110 transition">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-xs">
              اضغط لاختيار أغنية أو ملف صوتي من سطح المكتب
            </h4>
            <p className="text-[10px] text-white/50">
              يدعم MP3, WAV, AAC, M4A, OGG • سيتم تشغيلها بصوت استريو محيطي نقي
            </p>
          </div>

          <div className="text-[10px] text-emerald-400/90 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-start leading-relaxed">
            ⚡ <strong>التزام بالحصص:</strong> يُفضل اختيار مقاطع صوتية خفيفة (أقل من 5 ميجابايت) لتحميل فوري للزوار دون استهلاك باقة الهاتف.
          </div>
        </div>
      )}

      {/* MODE 3: EXTERNAL AUDIO LINK FROM GOOGLE / WEB */}
      {activeMode === 'external_url' && (
        <div className="space-y-2.5 bg-black/40 border border-white/10 rounded-2xl p-3">
          <div>
            <label className="text-xs font-bold text-white block mb-1">
              رابط ملف الموسيقى الخارجي المباشر من جوجل أو الويب:
            </label>
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/audio/song.mp3 أو رابط جوجل درايف مباشر"
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-amber-400 outline-none font-mono dir-ltr text-right"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white block mb-1">
              اسم الأغنية / الفنان (اختياري):
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="مثال: لحن ترويجي استريو خاص"
              className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-amber-400 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleApplyCustomUrl}
              disabled={!customUrl.trim()}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                customUrl.trim()
                  ? 'bg-amber-400 hover:bg-amber-300 text-black shadow cursor-pointer'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>تشغيل واعتماد الصوت الاستريو</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
