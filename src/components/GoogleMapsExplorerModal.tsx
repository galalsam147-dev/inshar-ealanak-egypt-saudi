import React, { useState, useMemo, useEffect } from 'react';
import { Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { X, Navigation, Phone, MapPin, ExternalLink, Compass, Search, ChevronUp, ChevronDown, Satellite, MessageCircle, Power, Car, Bike } from 'lucide-react';
import { Business, SupportedLang } from '../types';
import { CITIES, CATEGORIES } from '../utils/translations';

interface GoogleMapsExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  initialBusiness?: Business | null;
  userCoords: { lat: number; lng: number } | null;
  onDetectLocation: () => void;
  isLocating: boolean;
  onOpenBiz: (b: Business) => void;
  onOpenBooking?: (b: Business) => void;
  onOpenDelivery?: (b: Business) => void;
  onOpenTransportTracking?: (b?: Business) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  lang: SupportedLang;
}

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'القاهرة': { lat: 30.0444, lng: 31.2357 },
  'القاهرة الجديدة والتجمع الخامس': { lat: 30.0254, lng: 31.4712 },
  'الجيزة': { lat: 30.0131, lng: 31.2089 },
  'الإسكندرية': { lat: 31.2001, lng: 29.9187 },
  'العين السخنة': { lat: 29.5985, lng: 32.3412 },
  'المنصورة': { lat: 31.0409, lng: 31.3785 },
  'طنطا': { lat: 30.7865, lng: 31.0004 },
  'الزقازيق': { lat: 30.5877, lng: 31.5020 },
  'بورسعيد': { lat: 31.2653, lng: 32.3019 },
  'السويس': { lat: 29.9668, lng: 32.5498 },
  'الإسماعيلية': { lat: 30.5965, lng: 32.2715 },
  'دمياط': { lat: 31.4175, lng: 31.8144 },
  'الغردقة': { lat: 27.2579, lng: 33.8116 },
  'شرم الشيخ': { lat: 27.9158, lng: 34.3299 },
  'الأقصر': { lat: 25.6872, lng: 32.6396 },
  'أسوان': { lat: 24.0889, lng: 32.8998 },
  'أسيوط': { lat: 27.1783, lng: 31.1859 },
  'المنيا': { lat: 28.1099, lng: 30.7503 },
  'سوهاج': { lat: 26.5591, lng: 31.6957 },
};

const getVehicleShapeIcon = (biz: Business) => {
  const shape = biz.vehicleShape || biz.subscriberTrackingCell?.vehicleShape;
  const vType = biz.vehicleType || biz.subscriberTrackingCell?.vehicleType || '';
  if (shape === 'motorcycle' || vType.includes('موتوسيكل') || biz.cat.includes('دليفري')) return '🏍️';
  if (shape === 'scooter') return '🛵';
  if (shape === 'van_pickup') return '🚐';
  if (shape === 'suv_4x4') return '🚙';
  if (shape === 'sedan_taxi' || biz.cat.includes('تاكسي') || biz.cat.includes('توصيل')) return '🚖';
  if (biz.cat.includes('أطباء') || biz.cat.includes('عياد')) return '🩺';
  if (biz.cat.includes('مستشف') || biz.cat.includes('صيدلي')) return '🏥';
  if (biz.cat.includes('علاج طبيعي')) return '🦴';
  if (biz.cat.includes('كهربائي') || biz.cat.includes('صيانة سيارات')) return '⚡';
  if (biz.cat.includes('معرض سيارات')) return '🚗';
  if (biz.cat.includes('رحلات وشاليهات')) return '🏖️';
  if (biz.cat.includes('شركات سياحة')) return '✈️';
  if (biz.cat.includes('استيراد وتصدير')) return '🚢';
  return '📢';
};

export const GoogleMapsExplorerModal: React.FC<GoogleMapsExplorerModalProps> = ({
  isOpen,
  onClose,
  businesses,
  initialBusiness,
  userCoords,
  onDetectLocation,
  isLocating,
  onOpenBiz,
  onOpenBooking,
  onOpenDelivery,
  onOpenTransportTracking,
  selectedCity,
  onSelectCity,
}) => {
  const [selectedMarkerBiz, setSelectedMarkerBiz] = useState<Business | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('الكل');
  const [searchText, setSearchText] = useState<string>('');
  const [satelliteMode, setSatelliteMode] = useState<boolean>(true);
  const [workStatusFilter, setWorkStatusFilter] = useState<'all' | 'on' | 'off'>('all');

  useEffect(() => {
    if (isOpen) {
      if (initialBusiness) {
        setSelectedMarkerBiz(initialBusiness);
      } else if (businesses.length > 0 && !selectedMarkerBiz) {
        setSelectedMarkerBiz(businesses[0]);
      }
    }
  }, [isOpen, initialBusiness, businesses]);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      if (b.moderationStatus === 'hidden_by_admin' || b.moderationStatus === 'suspended' || b.isBannedByAdmin) return false;
      if (selectedCity && b.city !== selectedCity) return false;
      if (filterCategory !== 'الكل' && b.cat !== filterCategory) return false;
      const isOff = b.workStatus === 'inactive' || b.subscriberTrackingCell?.workStatus === 'inactive';
      if (workStatusFilter === 'on' && isOff) return false;
      if (workStatusFilter === 'off' && !isOff) return false;
      if (searchText.trim()) {
        const q = searchText.trim().toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          b.addr.toLowerCase().includes(q) ||
          b.cat.toLowerCase().includes(q) ||
          (b.subCat || '').toLowerCase().includes(q) ||
          (b.googleKeywords || []).join(' ').toLowerCase().includes(q) ||
          (b.googleSearchKeywords || []).join(' ').toLowerCase().includes(q) ||
          (b.vehiclePlateNumber || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [businesses, selectedCity, filterCategory, searchText, workStatusFilter]);

  // Assign deterministic coordinates & calculate real distance from user satellite location
  const mappedBusinesses = useMemo(() => {
    const refLat = userCoords?.lat || 30.0444;
    const refLng = userCoords?.lng || 31.2357;

    const list = filteredBusinesses.map((b, idx) => {
      let pos = { lat: 30.0444, lng: 31.2357 };
      if (typeof b.lat === 'number' && typeof b.lng === 'number') {
        pos = { lat: b.lat, lng: b.lng };
      } else {
        const base = CITY_COORDS[b.city] || { lat: 30.0444, lng: 31.2357 };
        const angle = (idx * 137.5 * Math.PI) / 180;
        const radius = 0.008 + (idx % 7) * 0.004;
        pos = {
          lat: base.lat + Math.cos(angle) * radius,
          lng: base.lng + Math.sin(angle) * radius,
        };
      }
      const dLat = (pos.lat - refLat) * 111;
      const dLng = (pos.lng - refLng) * 111 * Math.cos(refLat * (Math.PI / 180));
      const distKm = Math.max(0.2, parseFloat(Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1)));
      return {
        biz: b,
        position: pos,
        distKm,
      };
    });

    return list.sort((a, b) => a.distKm - b.distKm);
  }, [filteredBusinesses, userCoords]);

  const mapCenter = useMemo(() => {
    if (selectedMarkerBiz) {
      const found = mappedBusinesses.find((m) => m.biz.id === selectedMarkerBiz.id);
      if (found) return found.position;
      if (typeof selectedMarkerBiz.lat === 'number' && typeof selectedMarkerBiz.lng === 'number') {
        return { lat: selectedMarkerBiz.lat, lng: selectedMarkerBiz.lng };
      }
    }
    if (userCoords) {
      return userCoords;
    }
    if (selectedCity && CITY_COORDS[selectedCity]) {
      return CITY_COORDS[selectedCity];
    }
    if (mappedBusinesses.length > 0) {
      return mappedBusinesses[0].position;
    }
    return { lat: 30.0444, lng: 31.2357 };
  }, [selectedMarkerBiz, selectedCity, userCoords, mappedBusinesses]);

  const handleNavigateBizOnMap = (delta: number) => {
    if (mappedBusinesses.length === 0) return;
    const currentIndex = selectedMarkerBiz
      ? mappedBusinesses.findIndex((m) => m.biz.id === selectedMarkerBiz.id)
      : 0;
    const nextIndex = (currentIndex + delta + mappedBusinesses.length) % mappedBusinesses.length;
    setSelectedMarkerBiz(mappedBusinesses[nextIndex].biz);
  };

  if (!isOpen) return null;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const activePreviewBiz = selectedMarkerBiz || mappedBusinesses[0]?.biz || null;

  return (
    <div
      className="fixed inset-0 z-[160] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      {/* Top-Center Close Button Above the Page (إغلاق الصفحة أعلى الشاشة في المنتصف فوق الصفحة) */}
      <div
        className="mb-2 flex items-center justify-center z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-[0_4px_20px_rgba(220,38,38,0.85)] border-2 border-white transition cursor-pointer active:scale-95"
          title="غلق الصفحة (X)"
        >
          <X className="w-4 h-4 stroke-[3]" />
          <span>غلق الصفحة</span>
        </button>
      </div>

      <div
        className="bg-neutral-950 border border-emerald-500/40 w-full max-w-[480px] h-[87dvh] max-h-[730px] rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-neutral-900 px-3.5 py-2 flex items-center justify-between border-b border-emerald-500/30 shrink-0">
          <div className="flex items-center gap-2">
            {/* Program Logo Badge */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF2D55] to-amber-400 border border-white/50 flex flex-col items-center justify-center text-white shadow">
              <span className="text-[10px] leading-none">📢</span>
              <span className="text-[6.5px] font-black leading-none mt-0.5">إعلانك</span>
            </div>
            <div>
              <h3 className="font-black text-xs sm:text-sm text-white flex items-center gap-1.5">
                <span>تحديد موقعي على القمر الصناعي والأقرب لي 🛰️</span>
                <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {mappedBusinesses.length} خدمة
                </span>
              </h3>
              <p className="text-[9px] text-emerald-200/90">
                الأقرب لموقعك بالـ GPS • عيادات ومستشفيات وصيدليات وصيانة وسياحة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-500 flex items-center gap-1 text-white text-[10px] font-black transition cursor-pointer shadow"
          >
            <X className="w-3.5 h-3.5" />
            <span>غلق</span>
          </button>
        </div>

        {/* Filter & Search Bar + Satellite & ON/OFF Controls */}
        <div className="p-2 bg-neutral-900/95 border-b border-white/10 space-y-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="flex-1 flex items-center bg-black/60 border border-white/15 rounded-full px-2.5 py-1">
              <Search className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="ابحث بكلمات البحث (عيادة، مستشفى، علاج طبيعي، كهربائي سيارات...)"
                className="w-full bg-transparent text-white text-[10px] px-1.5 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setSatelliteMode((prev) => !prev)}
              className={`h-7 px-2.5 rounded-full border text-[9px] font-black flex items-center gap-1 transition cursor-pointer shrink-0 ${
                satelliteMode
                  ? 'bg-sky-500 text-black border-sky-300 shadow'
                  : 'bg-white/10 text-sky-300 border-sky-400/40'
              }`}
              title="ربط الموقع بالقمر الصناعي"
            >
              <Satellite className="w-3 h-3" />
              <span>{satelliteMode ? 'قمر صناعي 🛰️' : 'خريطة عادية'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSatelliteMode(true);
                onDetectLocation();
                if (mappedBusinesses.length > 0) {
                  setSelectedMarkerBiz(mappedBusinesses[0].biz);
                }
              }}
              className="h-7 px-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black border border-white text-[9px] font-black flex items-center gap-1 transition cursor-pointer shrink-0 shadow"
              title="تحديد موقعي على القمر الصناعي والأقرب لي من الخدمات"
            >
              <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
              <span>موقعي والأقرب لي 📍</span>
            </button>
          </div>

          {/* شريط كلمات البحث السريعة على خريطة القمر الصناعي */}
          <div className="flex items-center gap-1 overflow-x-auto hide-scroll py-0.5 text-[9px]">
            <span className="text-amber-300 font-black shrink-0">كلمات البحث:</span>
            {[
              { label: 'الكل', cat: 'الكل' },
              { label: '👨‍⚕️ عيادة ودكتور', cat: 'أطباء وعيادات' },
              { label: '🏥 مستشفى وصيدلية', cat: 'صيدليات ومستشفيات' },
              { label: '🦴 علاج طبيعي', cat: 'علاج طبيعي وتأهيل' },
              { label: '⚡ كهربائي صيانة سيارات', cat: 'كهربائي وصيانة سيارات' },
              { label: '🚗 معرض سيارات', cat: 'معرض سيارات' },
              { label: '🏖️ رحلات وشاليهات', cat: 'رحلات وشاليهات' },
              { label: '✈️ شركات سياحة', cat: 'شركات سياحة' },
              { label: '🚢 استيراد وتصدير', cat: 'شركات استيراد وتصدير' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  setFilterCategory(chip.cat);
                  setSearchText('');
                }}
                className={`px-2 py-0.5 rounded-full font-black shrink-0 cursor-pointer border transition ${
                  filterCategory === chip.cat
                    ? 'bg-amber-400 text-black border-white'
                    : 'bg-black/60 text-white/85 border-white/15 hover:border-amber-400'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* شريط الأقرب لي من الخدمات بالمسافة بالكيلومتر */}
          {mappedBusinesses.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto hide-scroll py-0.5 text-[8.5px]">
              <span className="text-emerald-300 font-black shrink-0">📡 الأقرب لي:</span>
              {mappedBusinesses.slice(0, 6).map((item) => (
                <button
                  key={item.biz.id}
                  type="button"
                  onClick={() => setSelectedMarkerBiz(item.biz)}
                  className={`px-2 py-0.5 rounded-full font-bold shrink-0 cursor-pointer border flex items-center gap-1 ${
                    selectedMarkerBiz?.id === item.biz.id
                      ? 'bg-emerald-500 text-black border-white font-black'
                      : 'bg-emerald-950/60 text-emerald-200 border-emerald-500/30'
                  }`}
                >
                  <span className="truncate max-w-[90px]">{item.biz.name}</span>
                  <span className="bg-black/40 text-amber-300 px-1 rounded font-mono">{item.distKm} كم</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <select
              value={selectedCity}
              onChange={(e) => onSelectCity(e.target.value)}
              className="flex-1 bg-black/60 border border-white/15 rounded-full px-2 py-1 text-[10px] text-white focus:outline-none focus:border-amber-400"
            >
              <option value="" className="bg-neutral-900">كل المحافظات</option>
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-neutral-900">
                  {c}
                </option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 bg-black/60 border border-white/15 rounded-full px-2 py-1 text-[10px] text-white focus:outline-none focus:border-amber-400"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-neutral-900">
                  {cat}
                </option>
              ))}
            </select>

            {/* فلتر حالة العمل ON / OFF */}
            <div className="flex items-center bg-black/60 border border-white/15 rounded-full p-0.5 text-[9px] font-black shrink-0">
              <button
                type="button"
                onClick={() => setWorkStatusFilter('all')}
                className={`px-2 py-0.5 rounded-full cursor-pointer ${
                  workStatusFilter === 'all' ? 'bg-amber-400 text-black' : 'text-white/60'
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setWorkStatusFilter('on')}
                className={`px-2 py-0.5 rounded-full cursor-pointer ${
                  workStatusFilter === 'on' ? 'bg-emerald-500 text-black' : 'text-emerald-300'
                }`}
              >
                🟢 ON
              </button>
              <button
                type="button"
                onClick={() => setWorkStatusFilter('off')}
                className={`px-2 py-0.5 rounded-full cursor-pointer ${
                  workStatusFilter === 'off' ? 'bg-red-600 text-white' : 'text-red-300'
                }`}
              >
                ⚪ OFF
              </button>
            </div>
          </div>
        </div>

        {/* Google Map Container with Program Logo Markers for every Subscriber */}
        <div className="flex-1 min-h-[260px] w-full relative bg-neutral-900">
          {!apiKey ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
              <MapPin className="w-8 h-8 text-amber-400 animate-bounce" />
              <p className="text-xs font-bold text-white">جاري تهيئة مفتاح خرائط جوجل بالقمر الصناعي...</p>
            </div>
          ) : (
            <Map
              mapId="DEMO_MAP_ID"
              mapTypeId={satelliteMode ? 'hybrid' : 'roadmap'}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              defaultCenter={mapCenter}
              defaultZoom={13}
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="w-full h-full"
            >
              {/* User GPS Marker */}
              {userCoords && (
                <AdvancedMarker position={userCoords} title="موقعي الحالي عبر القمر الصناعي (GPS)">
                  <div className="relative flex flex-col items-center">
                    <div className="px-2 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[8.5px] border border-white shadow-lg whitespace-nowrap">
                      🛰️ موقعي الآن
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow animate-ping mt-0.5" />
                  </div>
                </AdvancedMarker>
              )}

              {/* Business Markers with Program Logo on Google Maps for Each Subscriber */}
              {mappedBusinesses.map(({ biz, position }) => {
                const isOff = biz.workStatus === 'inactive' || biz.subscriberTrackingCell?.workStatus === 'inactive';
                const isSelected = selectedMarkerBiz?.id === biz.id;
                const shapeEmoji = getVehicleShapeIcon(biz);
                const plate = biz.vehiclePlateNumber || biz.subscriberTrackingCell?.vehiclePlateNumber;

                return (
                  <AdvancedMarker
                    key={biz.id}
                    position={position}
                    title={`${biz.name} - ${biz.city} (${isOff ? 'عند العطلة OFF' : 'عند العمل ON'})`}
                    onClick={() => setSelectedMarkerBiz(biz)}
                  >
                    <div
                      className={`relative flex flex-col items-center transition-transform cursor-pointer ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                      }`}
                    >
                      {/* Program Logo Badge on Top of Marker (لوجو البرنامج على خريطة جوجل لكل مشترك) */}
                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full border-2 shadow-xl whitespace-nowrap ${
                          isOff
                            ? 'bg-neutral-900/95 border-red-400 text-white/75'
                            : 'bg-gradient-to-r from-[#FF2D55] via-rose-600 to-amber-500 border-white text-white'
                        }`}
                      >
                        <span className="bg-black/40 px-1 py-0.2 rounded text-[7.5px] font-black text-amber-300">
                          📢 إعلانك
                        </span>
                        <span className="text-[9px]">{shapeEmoji}</span>
                        <span className="text-[8.5px] font-black max-w-[75px] truncate">{biz.name}</span>
                        <span
                          className={`text-[7.5px] font-black px-1 rounded-full ${
                            isOff ? 'bg-red-600 text-white' : 'bg-emerald-400 text-black'
                          }`}
                        >
                          {isOff ? 'OFF' : 'ON'}
                        </span>
                      </div>

                      {/* Subscriber Avatar / Vehicle Photo Circle with Program Logo Ring */}
                      <div
                        className={`w-8 h-8 rounded-full border-2 overflow-hidden shadow-lg bg-neutral-950 flex items-center justify-center -mt-0.5 ${
                          isOff ? 'border-red-500 grayscale' : 'border-amber-400'
                        }`}
                      >
                        {biz.captainPhotoUrl || biz.vehiclePhotoUrl || biz.images?.[0] ? (
                          <img
                            src={biz.captainPhotoUrl || biz.vehiclePhotoUrl || biz.images?.[0]}
                            alt={biz.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs">{shapeEmoji}</span>
                        )}
                      </div>

                      {plate && (
                        <span className="bg-amber-400 text-black font-mono font-black text-[7.5px] px-1.5 rounded border border-black shadow -mt-1">
                          {plate}
                        </span>
                      )}
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* InfoWindow for Selected Business with Close Button Above Image */}
              {selectedMarkerBiz && (
                <InfoWindow
                  position={
                    mappedBusinesses.find((m) => m.biz.id === selectedMarkerBiz.id)?.position || mapCenter
                  }
                  onCloseClick={() => setSelectedMarkerBiz(null)}
                  maxWidth={260}
                >
                  <div className="text-neutral-900 p-1 space-y-1.5 text-right" dir="rtl">
                    {/* زر غلق الصفحة أعلى الصورة في الخريطة */}
                    <div className="flex items-center justify-between gap-1 pb-1">
                      <span className="bg-gradient-to-r from-[#FF2D55] to-amber-500 text-white text-[8.5px] font-black px-2 py-0.5 rounded-full">
                        📢 لوجو إعلانك الرسمي
                      </span>
                      <button
                        type="button"
                        onClick={() => onClose()}
                        className="bg-red-600 hover:bg-red-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-0.5 shadow cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                        <span>غلق الصفحة</span>
                      </button>
                    </div>

                    {(selectedMarkerBiz.vehiclePhotoUrl || selectedMarkerBiz.images?.[0]) && (
                      <div className="w-full h-20 rounded-xl overflow-hidden bg-neutral-200 relative">
                        <img
                          src={selectedMarkerBiz.vehiclePhotoUrl || selectedMarkerBiz.images[0]}
                          alt={selectedMarkerBiz.name}
                          className="w-full h-full object-cover"
                        />
                        {selectedMarkerBiz.captainPhotoUrl && (
                          <img
                            src={selectedMarkerBiz.captainPhotoUrl}
                            alt="صورة شخصية"
                            className="w-8 h-8 rounded-full object-cover border-2 border-amber-400 absolute bottom-1 right-1 shadow"
                          />
                        )}
                        <span
                          className={`absolute top-1 left-1 text-[8.5px] font-black px-1.5 py-0.5 rounded-full ${
                            selectedMarkerBiz.workStatus === 'inactive'
                              ? 'bg-red-600 text-white'
                              : 'bg-emerald-500 text-black'
                          }`}
                        >
                          {selectedMarkerBiz.workStatus === 'inactive' ? '⚪ في عطلة OFF' : '🟢 في العمل ON'}
                        </span>
                      </div>
                    )}

                    <div className="font-black text-xs text-neutral-950">{selectedMarkerBiz.name}</div>
                    <div className="text-[9.5px] text-neutral-600">
                      {selectedMarkerBiz.cat} • {selectedMarkerBiz.city} - {selectedMarkerBiz.addr}
                    </div>

                    {/* Vehicle Shape, Type & Plate Number if available */}
                    {(selectedMarkerBiz.vehiclePlateNumber || selectedMarkerBiz.vehicleType || selectedMarkerBiz.subscriberTrackingCell?.vehiclePlateNumber) && (
                      <div className="bg-amber-100 border border-amber-400 rounded-lg p-1 text-[9px] font-bold text-neutral-900 flex flex-wrap items-center justify-between gap-1">
                        <span>
                          {getVehicleShapeIcon(selectedMarkerBiz)}{' '}
                          {selectedMarkerBiz.vehicleType || selectedMarkerBiz.subscriberTrackingCell?.vehicleType || 'مركبة مسجلة'}
                        </span>
                        {(selectedMarkerBiz.vehiclePlateNumber || selectedMarkerBiz.subscriberTrackingCell?.vehiclePlateNumber) && (
                          <span className="bg-black text-amber-300 px-1.5 py-0.2 rounded font-mono font-black">
                            لوحة: {selectedMarkerBiz.vehiclePlateNumber || selectedMarkerBiz.subscriberTrackingCell?.vehiclePlateNumber}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenBiz(selectedMarkerBiz);
                        }}
                        className="bg-[#FF2D55] text-white text-[9px] font-bold px-2 py-1 rounded-full cursor-pointer"
                      >
                        عرض الصفحة
                      </button>
                      <a
                        href={`tel:${selectedMarkerBiz.phone}`}
                        className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-0.5"
                      >
                        <Phone className="w-2.5 h-2.5" />
                        <span>اتصل</span>
                      </a>
                      <a
                        href={`https://wa.me/2${selectedMarkerBiz.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `مرحباً ${selectedMarkerBiz.name}، أتواصل معك عبر خريطة البرنامج وأشاركك رابط التتبع المباشر لموقعي الآن 🛰️📍`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-green-700 text-white text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-0.5"
                      >
                        <MessageCircle className="w-2.5 h-2.5" />
                        <span>تتبع واتساب</span>
                      </a>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          )}

          {/* Right-Side Shape Navigation Bar on Map (غلق الصفحة أعلى الصورة في الخريطة تنقل شكل مع الشريط يمين الشاشة) */}
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-full border border-white/20 shadow-2xl"
            dir="ltr"
          >
            {/* زر غلق الصفحة أعلى الصورة في الخريطة */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex flex-col items-center justify-center shadow-lg border border-white cursor-pointer active:scale-90 transition"
              title="غلق الصفحة أعلى الصورة في الخريطة"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>

            {/* صورة النشاط الحالي على الشريط يمين الخريطة */}
            {activePreviewBiz && (
              <div
                onClick={() => {
                  onClose();
                  onOpenBiz(activePreviewBiz);
                }}
                className="w-8 h-8 rounded-full border-2 border-amber-400 overflow-hidden cursor-pointer shadow-md relative"
                title={activePreviewBiz.name}
              >
                <img
                  src={activePreviewBiz.captainPhotoUrl || activePreviewBiz.vehiclePhotoUrl || activePreviewBiz.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200'}
                  alt={activePreviewBiz.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* تنقل شكل بين الأنشطة على الخريطة (السابق / التالي) */}
            <button
              type="button"
              onClick={() => handleNavigateBizOnMap(-1)}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-amber-400 hover:text-black text-white flex items-center justify-center transition cursor-pointer active:scale-90"
              title="النشاط السابق على الخريطة"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigateBizOnMap(1)}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-amber-400 hover:text-black text-white flex items-center justify-center transition cursor-pointer active:scale-90"
              title="النشاط التالي على الخريطة"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* تبديل القمر الصناعي */}
            <button
              type="button"
              onClick={() => setSatelliteMode((p) => !p)}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer active:scale-90 ${
                satelliteMode
                  ? 'bg-sky-500 text-black border border-white'
                  : 'bg-white/15 text-sky-300'
              }`}
              title="ربط الموقع بالقمر الصناعي"
            >
              <Satellite className="w-3.5 h-3.5" />
            </button>

            {/* موقعي على الخريطة */}
            <button
              type="button"
              onClick={onDetectLocation}
              className="w-7 h-7 rounded-full bg-emerald-500/30 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-400/50 flex items-center justify-center transition cursor-pointer active:scale-90"
              title="تحديد موقعي على الخريطة"
            >
              <Navigation className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Selected Business Quick Footer Card */}
        {activePreviewBiz && (
          <div className="p-3 bg-neutral-900 border-t border-white/15 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img
                  src={activePreviewBiz.captainPhotoUrl || activePreviewBiz.vehiclePhotoUrl || activePreviewBiz.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200'}
                  alt={activePreviewBiz.name}
                  className="w-10 h-10 rounded-xl object-cover border border-amber-400/50"
                />
                <span
                  className={`absolute -top-1 -right-1 text-[7.5px] font-black px-1 rounded-full border border-black ${
                    activePreviewBiz.workStatus === 'inactive'
                      ? 'bg-red-600 text-white'
                      : 'bg-emerald-400 text-black'
                  }`}
                >
                  {activePreviewBiz.workStatus === 'inactive' ? 'OFF' : 'ON'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] bg-[#FF2D55] text-white px-1.5 py-0.2 rounded font-black">📢 إعلانك</span>
                  <h4 className="font-black text-xs text-amber-300 truncate">{activePreviewBiz.name}</h4>
                </div>
                <p className="text-[9.5px] text-white/70 truncate">
                  📍 {activePreviewBiz.city} - {activePreviewBiz.addr}
                  {activePreviewBiz.vehiclePlateNumber ? ` • لوحة: ${activePreviewBiz.vehiclePlateNumber}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {onOpenBooking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBooking(activePreviewBiz);
                  }}
                  className="bg-teal-500 hover:bg-teal-400 text-black font-black text-[9.5px] px-2.5 py-1.5 rounded-full cursor-pointer flex items-center gap-1"
                >
                  <span>🏥 حجز</span>
                </button>
              )}
              {onOpenTransportTracking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTransportTracking(activePreviewBiz);
                  }}
                  className="bg-sky-500 text-black font-black text-[9.5px] px-2.5 py-1.5 rounded-full cursor-pointer flex items-center gap-1"
                >
                  <Satellite className="w-3 h-3" />
                  <span>تتبع مباشر</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBiz(activePreviewBiz);
                }}
                className="bg-[#FF2D55] text-white font-black text-[9.5px] px-2.5 py-1.5 rounded-full flex items-center gap-1 cursor-pointer"
              >
                <span>الصفحة</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
