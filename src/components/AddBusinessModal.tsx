import React, { useState, useRef, useMemo } from 'react';
import { 
  X, Mic, MicOff, MapPin, Upload, Plus, Trash2, FileSpreadsheet, 
  Sparkles, CheckCircle2, AlertTriangle, Layers, Eye, Video, 
  Smartphone, ShieldCheck, Check, Loader2, Globe, Car, Building2, Tag, ShoppingBag, Film,
  Copy, MessageSquare, Send, Share2, Gift
} from 'lucide-react';
import Papa from 'papaparse';
import { Business, PackageTier, ServiceItem, SupportedLang, TextAnimationType, BusinessSoundtrack } from '../types';
import { CITIES, CATEGORIES, SUBCATEGORIES, DEFAULT_VIDEOS, I18N, getCategoryLabel, getCityLabel } from '../utils/translations';
import { auditBusinessContent } from '../utils/contentModeration';
import { compressVideoFile, VideoCompressionResult } from '../utils/videoCompressor';
import { compressImageFile, MediaCompressionResult } from '../utils/mediaCompressor';
import { AdPreviewModal } from './AdPreviewModal';
import { LiveTextAnimationModal, TextAnimationConfig } from './LiveTextAnimationModal';
import { SoundtrackSelector } from './SoundtrackSelector';
import { SOUNDTRACK_LIBRARY } from '../utils/soundtracks';
import { ExternalVideoImporterModal } from './ExternalVideoImporterModal';

interface AddBusinessModalProps {
  onClose: () => void;
  onAddBusiness: (biz: Business) => void;
  onBulkAddBusinesses?: (bizList: Business[]) => void;
  lang: SupportedLang;
  existingBusinesses?: Business[];
}

export const AddBusinessModal: React.FC<AddBusinessModalProps> = ({
  onClose,
  onAddBusiness,
  onBulkAddBusinesses,
  lang,
  existingBusinesses = [],
}) => {
  const t = I18N[lang];

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1] || 'مطاعم');
  const [subCategory, setSubCategory] = useState('');
  const [city, setCity] = useState(CITIES[0] || 'القاهرة');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('30.0617');
  const [lng, setLng] = useState('31.3364');
  const [showMap, setShowMap] = useState(false);
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('01006656669');
  const [additionalPhones, setAdditionalPhones] = useState<string[]>([]);
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [hours, setHours] = useState('10:00 ص - 12:00 ص');
  const [pkg, setPkg] = useState<PackageTier>(0);
  const [isVideoImporterOpen, setIsVideoImporterOpen] = useState(false);

  // Text Animation & Live Preview State
  const [isLiveAnimModalOpen, setIsLiveAnimModalOpen] = useState(false);
  const [textOverlayConfig, setTextOverlayConfig] = useState<TextAnimationConfig & { enabled: boolean }>({
    caption: '🔥 عروض وخدمات حصرية لجميع عملاء إعلانك ⚡',
    animation: 'neon',
    fontStyle: 'kufi',
    bannerStyle: 'neon_glow_box',
    textColor: '#00F0FF',
    bgColor: 'rgba(0, 0, 0, 0.75)',
    speed: 'normal',
    position: 'bottom',
    fontSize: 'md',
    enabled: true,
  });

  // Soundtrack & Audio State (موسيقى تصويرية مقترحة أو رابط خارجي مع خيار الكتم والتحكم)
  const [soundtrack, setSoundtrack] = useState<BusinessSoundtrack>({
    trackId: SOUNDTRACK_LIBRARY[0].id,
    title: SOUNDTRACK_LIBRARY[0].title,
    artist: SOUNDTRACK_LIBRARY[0].artist,
    url: SOUNDTRACK_LIBRARY[0].url,
    isExternal: false,
    isMuted: false,
    volume: 0.7,
  });

  // Quick template autofillers
  const fillAccountantTemplate = () => {
    setName('مكتب المحاسب القانوني المعتمد وخبير الضرائب');
    setCategory('محاسبين قانونيين');
    setSubCategory('محاسب قانوني معتمد');
    setCity('القاهرة');
    setAddress('شارع مصطفى النحاس، تقاطع مكرم عبيد، مدينة نصر');
    setBio('محاسب ومراجع قانوني مقيد بسجل المحاسبين والمراجعين بوزارة المالية. فحص واعتماد القوائم المالية، مراجعة الحسابات السنوية، ضرائب القيمة المضافة والدخل، تأسيس الشركات الاستثمارية والمساهمة، ودراسات الجدوى للتمويل البنكي.');
    setServices([
      { n: 'اعتماد الميزانية السنوية ودفاتر الحسابات القانونية', p: '3000 ج.م', priceEgp: 3000 },
      { n: 'تأسيس شركة ذات مسؤولية محدودة أو شركة مساهمة', p: '5500 ج.م', priceEgp: 5500 },
      { n: 'تقديم إقرارات ضريبة القيمة المضافة والدخل الشهرية', p: '1000 ج.م', priceEgp: 1000 },
      { n: 'استشارة محاسبية وضريبية متقدمة ودراسة جدوى معتمدة', p: '800 ج.م', priceEgp: 800 }
    ]);
    setHours('09:00 ص - 08:30 م (السبت - الخميس)');
  };

  const fillCraftsmanTemplate = () => {
    setName('ورشة الأسطى المعتمد - خدمات سباكة وكهرباء وصيانة منازل');
    setCategory('أصحاب حرف');
    setSubCategory('سباكة وصحي');
    setCity('القاهرة');
    setAddress('المعادي الجديدة، بالقرب من شارع النصر');
    setBio('فريق فني معتمد لأعمال السباكة الحديثة وكشف التسريبات بأحدث الأجهزة الإلكترونية بدون تكسير، صيانة وتأسيس كهرباء المنازل والشقق، تركيب وصيانة التكييف، وأعمال النجارة والأثاث الفورية بضمان معتمد.');
    setServices([
      { n: 'كشف تسريب مياه إلكتروني وإصلاح فوري بالضمان', p: '350 ج.م', priceEgp: 350 },
      { n: 'صيانة وتأسيس كهرباء شقق ولوحات مفاتيح أوتوماتيك', p: '250 ج.م', priceEgp: 250 },
      { n: 'تنظيف وصيانة وشحن فريون تكييف سبليت', p: '400 ج.م', priceEgp: 400 },
      { n: 'تركيب وصيانة أطقم حمامات ومطابخ وخلاطات', p: '200 ج.م', priceEgp: 200 }
    ]);
    setHours('طوارئ وخدمة فورية 24 ساعة (24/7)');
  };

  // Dynamic services
  const [services, setServices] = useState<ServiceItem[]>([
    { n: 'وجبة مميزة / خدمة رئيسية', p: '350 ج.م / $7 / 26 SAR' },
  ]);

  // Media & Video Compression state
  const [mediaList, setMediaList] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  const [isCompressingVideo, setIsCompressingVideo] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);
  const [videoCompressionStats, setVideoCompressionStats] = useState<VideoCompressionResult | null>(null);
  const [imageCompressionStats, setImageCompressionStats] = useState<MediaCompressionResult | null>(null);
  const [videoPoster, setVideoPoster] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Ad Live Preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Ready Website or Custom Domain state
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Delivery service option for subscribers (برنامج: اطلب الأقرب ليك - جمع طلبك دليفري خاص)
  const [hasDelivery, setHasDelivery] = useState(false);
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryWhatsapp, setDeliveryWhatsapp] = useState('');
  const [deliveryHotline, setDeliveryHotline] = useState('');
  const [captainPhones, setCaptainPhones] = useState<string[]>([]);
  const [newCaptainPhoneInput, setNewCaptainPhoneInput] = useState('');
  const [deliveryAreas, setDeliveryAreas] = useState('داخل نطاق المدينة والمناطق المجاورة');
  const [deliveryFee, setDeliveryFee] = useState('يبدأ من 15 ج.م');
  const [deliveryEstimatedTime, setDeliveryEstimatedTime] = useState('30 - 45 دقيقة');
  const [deliveryNotes, setDeliveryNotes] = useState('الطلب متاح طوال ساعات العمل عبر الاتصال أو الواتساب');

  // Driver / Captain status: "active" (شغال يفتح نشط) or "inactive" (في عطلة يفتح غير نشط)
  const [driverWorkStatus, setDriverWorkStatus] = useState<'active' | 'inactive'>('active');
  const [avatarPhotoUrl, setAvatarPhotoUrl] = useState<string>('');
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState<string>('');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState<string>('');
  const [vehicleShape, setVehicleShape] = useState<'sedan_taxi' | 'suv_4x4' | 'motorcycle' | 'scooter' | 'van_pickup'>('sedan_taxi');
  const [vehicleTypeModel, setVehicleTypeModel] = useState<string>('');
  const [ownerPagePassword, setOwnerPagePassword] = useState<string>('');
  const [googleKeywordsText, setGoogleKeywordsText] = useState<string>('إعلان مجاناً، خدمات التجمع، طلب دليفري، تاكسي قريب');
  const [customProgramTitle, setCustomProgramTitle] = useState<string>('انشر إعلانك');
  const [customWelcomeMessage, setCustomWelcomeMessage] = useState<string>('مرحباً بكم، يسعدنا تواصلكم المباشر معنا عبر الاتصال أو الواتساب');

  // For Sale & Public Images state (No docs required!)
  const [isForSale, setIsForSale] = useState(false);
  const [forSaleItemType, setForSaleItemType] = useState('سيارة / مركبة');
  const [forSaleTitle, setForSaleTitle] = useState('');
  const [forSalePrice, setForSalePrice] = useState('');
  const [forSaleCondition, setForSaleCondition] = useState('مستعمل بحالة ممتازة');
  const [forSaleWebsite, setForSaleWebsite] = useState('');
  const [forSaleSpecs, setForSaleSpecs] = useState('');
  const [forSalePublicImages, setForSalePublicImages] = useState<string[]>([]);
  const [isUploadingSaleImages, setIsUploadingSaleImages] = useState(false);
  const saleImageInputRef = useRef<HTMLInputElement>(null);

  // Optional Official License state
  const [licenseDocUrl, setLicenseDocUrl] = useState<string>('');
  const [licenseDocName, setLicenseDocName] = useState<string>('');
  const licenseFileRef = useRef<HTMLInputElement>(null);

  // Content Moderation real-time audit
  const moderationAudit = useMemo(() => {
    return auditBusinessContent({
      name,
      bio,
      addr: address,
      cat: category,
      services,
    });
  }, [name, bio, address, category, services]);

  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // CSV Import state
  const [csvMessage, setCsvMessage] = useState<string | null>(null);

  // Duplicate Prevention & Developer Message State (عدم النشر عند تكرار الاسم والعنوان والتليفون - صفحة واحدة لكل عميل)
  const [duplicateBlock, setDuplicateBlock] = useState<{
    reason: string;
    field: 'phone' | 'name' | 'address';
    label: string;
    value: string;
    existingBusinessName: string;
  } | null>(null);
  const [developerMsgText, setDeveloperMsgText] = useState('');
  const [developerMsgSent, setDeveloperMsgSent] = useState(false);
  const [createdBusinessSuccess, setCreatedBusinessSuccess] = useState<Business | null>(null);
  const [copiedSuccessLink, setCopiedSuccessLink] = useState(false);

  // 1. Voice Recognition Implementation
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        lang === 'ar'
          ? 'المتصفح لا يدعم ميزة التسجيل الصوتي المباشر، يرجى استخدام Google Chrome.'
          : 'Browser does not support Speech Recognition. Please use Google Chrome.'
      );
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (!name) {
          setName(transcript.slice(0, 45));
        }
        setBio((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = (e: any) => {
        console.error('Speech error:', e);
        setSpeechError(lang === 'ar' ? 'حدث خطأ في التقاط الصوت' : 'Speech error occurred');
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  // 2. Media Upload Handling with Automatic Image & Video Compression
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (file.type.startsWith('video')) {
        setIsCompressingVideo(true);
        setCompressProgress(25);
        try {
          const result = await compressVideoFile(file, (pct) => setCompressProgress(pct));
          setVideoCompressionStats(result);
          if (result.posterUrl) {
            setVideoPoster(result.posterUrl);
          }
          setMediaList((prev) => [
            ...prev,
            { url: result.compressedUrl, type: 'video' },
          ]);
        } catch (err) {
          console.error('Video compression error:', err);
          const rawUrl = URL.createObjectURL(file);
          setMediaList((prev) => [...prev, { url: rawUrl, type: 'video' }]);
        } finally {
          setIsCompressingVideo(false);
          setCompressProgress(0);
        }
      } else if (file.type.startsWith('image')) {
        setIsCompressingImage(true);
        try {
          const res = await compressImageFile(file, 1280, 1280, 0.78);
          setImageCompressionStats(res);
          setMediaList((prev) => [...prev, { url: res.url, type: 'image' }]);
        } catch (err) {
          console.error('Image compression error:', err);
          const url = URL.createObjectURL(file);
          setMediaList((prev) => [...prev, { url, type: 'image' }]);
        } finally {
          setIsCompressingImage(false);
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSaleImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingSaleImages(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        try {
          const comp = await compressImageFile(file, 1280, 1280, 0.8);
          urls.push(comp.url);
        } catch {
          urls.push(URL.createObjectURL(file));
        }
      }
      setForSalePublicImages((prev) => [...prev, ...urls]);
    } finally {
      setIsUploadingSaleImages(false);
    }
  };

  // 3. CSV Import
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        if (data && data.length > 0) {
          const first = data[0];
          // Autofill form with the first record
          if (first.name || first.Name || first['الاسم']) {
            setName(first.name || first.Name || first['الاسم']);
          }
          if (first.city || first.City || first['المدينة']) {
            setCity(first.city || first.City || first['المدينة']);
          }
          if (first.phone || first.Phone || first['الهاتف']) {
            setPhone(first.phone || first.Phone || first['الهاتف']);
          }
          if (first.category || first.Category || first['القسم']) {
            setCategory(first.category || first.Category || first['القسم']);
          }
          if (first.address || first.Address || first['العنوان']) {
            setAddress(first.address || first.Address || first['العنوان']);
          }

          setCsvMessage(
            lang === 'ar'
              ? `تم قراءة ملف CSV بنجاح! تم استخراج ${data.length} سجل وتمت تعبئة النموذج بأول عميل.`
              : `CSV parsed successfully! Found ${data.length} records. Populated with first row.`
          );
        }
      },
    });
  };

  // Add Service Row
  const addServiceRow = () => {
    setServices((prev) => [...prev, { n: '', p: '' }]);
  };

  const removeServiceRow = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: 'n' | 'p', value: string) => {
    setServices((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const videoUrls = mediaList
      .filter((m) => m.type === 'video')
      .map((m) => m.url);
    const imageUrls = mediaList
      .filter((m) => m.type === 'image')
      .map((m) => m.url);

    // Fallbacks if user didn't upload
    const finalVideos =
      videoUrls.length > 0
        ? videoUrls
        : [DEFAULT_VIDEOS[Math.floor(Math.random() * DEFAULT_VIDEOS.length)]];
    const finalImages =
      imageUrls.length > 0
        ? imageUrls
        : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'];

    const filteredServices = services.filter((s) => s.n.trim() !== '');
    if (filteredServices.length === 0) {
      filteredServices.push({ n: 'خدمة رئيسية', p: '350 ج.م' });
    }

    const allPhones = [
      phone.trim() || '01006656669',
      ...additionalPhones.filter((p) => p.trim() !== ''),
    ];

    // قاعدة الأمان ومنع التكرار الصارمة (لكل عميل صفحة واحدة فقط لا تكرار - عدم النشر عند تكرار الاسم والعنوان والتليفون)
    const normalizeArabic = (s: string) => {
      return s
        .trim()
        .toLowerCase()
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/[^\w\s\u0600-\u06FF]/gi, '')
        .replace(/\s+/g, ' ');
    };

    const normalizedName = normalizeArabic(name);
    const normalizedAddr = normalizeArabic(address);
    const primaryCleanPhone = phone.replace(/[^0-9]/g, '');

    const checkList = existingBusinesses.length > 0 ? existingBusinesses : (() => {
      try {
        const raw = localStorage.getItem('e3lanak_businesses') || localStorage.getItem('dalilk_businesses');
        if (raw) return JSON.parse(raw);
      } catch {}
      return [];
    })();

    // 1. فحص تكرار رقم الهاتف (بما في ذلك كود الدولة ومقارنة الأرقام)
    const duplicateByPhone = checkList.find((b: Business) => {
      const bPhones = (b.phones && b.phones.length > 0 ? b.phones : [b.phone]).map((p: string) => p.replace(/[^0-9]/g, ''));
      return bPhones.some((bp: string) => {
        if (!bp || !primaryCleanPhone) return false;
        if (bp === primaryCleanPhone) return true;
        const normBp = bp.replace(/^20|^0/, '');
        const normPrimary = primaryCleanPhone.replace(/^20|^0/, '');
        return normBp.length >= 8 && normBp === normPrimary;
      });
    });

    // 2. فحص تكرار الاسم التجاري بدقة وبدون تكرار
    const duplicateByName = checkList.find((b: Business) => {
      if (!b.name) return false;
      const bNorm = normalizeArabic(b.name);
      return bNorm === normalizedName || (normalizedName.length > 4 && bNorm === normalizedName);
    });

    // 3. فحص تكرار العنوان الدقيق في نفس المحافظة أو المدينة
    const duplicateByAddress = (normalizedAddr && normalizedAddr.length > 6) ? checkList.find((b: Business) => {
      if (!b.addr) return false;
      const bAddrNorm = normalizeArabic(b.addr);
      return b.city === city && (bAddrNorm === normalizedAddr || (normalizedAddr.length > 10 && bAddrNorm.includes(normalizedAddr)));
    }) : undefined;

    if (duplicateByPhone || duplicateByName || duplicateByAddress) {
      const field: 'phone' | 'name' | 'address' = duplicateByPhone 
        ? 'phone' 
        : duplicateByName 
        ? 'name' 
        : 'address';
      const label = duplicateByPhone 
        ? 'رقم الهاتف' 
        : duplicateByName 
        ? 'اسم النشاط' 
        : 'العنوان الجغرافي';
      const val = duplicateByPhone ? phone : duplicateByName ? name : address;
      const existingMatched = duplicateByPhone || duplicateByName || duplicateByAddress;

      setDuplicateBlock({
        field,
        label,
        value: val,
        existingBusinessName: existingMatched?.name || 'نشاط مسجل سابقاً',
        reason: `${label} (${val}) سبق استخدامه بالفعل للمشتركين أو مطور منصة إعلانك`,
      });
      setDeveloperMsgText(`السلام عليكم مطور منصة إعلانك، أحتاج المساعدة بخصوص تسجيل نشاطي (${name.trim()}) برقم (${phone.trim()}). ظهر لي تنبيه أن ${label} (${val}) سبق استخدامه، أرجو المراجعة أو تفعيل صفحتي.`);
      return;
    }

    const newBusiness: Business = {
      id: Date.now(),
      name: name.trim() || (lang === 'ar' ? 'نشاط تجاري جديد' : 'New Business'),
      cat: category,
      subCat: subCategory.trim() || undefined,
      city: city,
      addr: address.trim() || city,
      bio: bio.trim() || (lang === 'ar' ? 'أفضل وأجود الخدمات للعملاء.' : 'Top quality service for our clients.'),
      verified: pkg >= 399 ? 1 : 0,
      phone: allPhones[0],
      phones: allPhones,
      videos: finalVideos,
      images: finalImages,
      services: filteredServices,
      hours: hours.trim() || '10:00 ص - 12:00 ص',
      expiry: Date.now() + 90 * 86400000, // 90 days trial!
      status: driverWorkStatus === 'active' ? 'active' : 'hidden',
      pkg: pkg,
      // Full Captain & Proximity Tracking Cell for taxi/delivery/services
      trackingCell: (category.includes('تاكسي') || category.includes('دليفري') || category.includes('موتوسيكل') || hasDelivery) ? {
        enabled: true,
        vehicleType: category.includes('موتوسيكل') || category.includes('دليفري') ? 'motorcycle' : 'taxi',
        vehiclePlate: 'ط س ق 4821',
        vehicleModel: name.trim(),
        captainName: name.trim(),
        captainPhone: allPhones[0],
        captainPhoto: avatarPhotoUrl || finalImages[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
        currentStatus: driverWorkStatus === 'active' ? 'available' : 'busy',
        currentArea: address.trim() || city,
        ratePerKmEgp: 6.5,
        minimumTripPriceEgp: 25,
        lat: parseFloat(lat) || 30.0617,
        lng: parseFloat(lng) || 31.3364,
        lastPing: Date.now(),
        hotline: allPhones[0],
      } : undefined,
      bankTransferDetails: {
        enabled: true,
        vodafoneCashNumber: allPhones[0],
        instapayId: `${allPhones[0]}@instapay`,
        phones: allPhones,
        hotline: allPhones[0],
        customerTransferNotes: 'سداد يدوي كاش عند الاستلام أو فودافون كاش وإنستاباي مباشرة للكابتن',
        isEncryptedSecurity: true,
      },
      likes: Math.floor(Math.random() * 20) + 5,
      lat: parseFloat(lat) || 30.0617,
      lng: parseFloat(lng) || 31.3364,
      googleBusinessUrl: googleBusinessUrl.trim() || undefined,
      isSponsored: pkg === 799,
      adCampaignTitle: pkg === 799 ? 'إعلان Google Ads ممول' : undefined,
      poster: videoPoster || undefined,
      videoStats: videoCompressionStats
        ? {
            originalSizeMb: videoCompressionStats.originalSizeMb,
            compressedSizeMb: videoCompressionStats.compressedSizeMb,
            compressionRatio: videoCompressionStats.compressionRatio,
          }
        : undefined,
      moderationStatus: 'clean',
      licenseDocUrl: licenseDocUrl || undefined,
      licenseVerified: false,
      websiteUrl: websiteUrl.trim() || undefined,
      forSaleItem: isForSale
        ? {
            isForSale: true,
            price: parseFloat(forSalePrice) || 0,
            itemType: forSaleItemType,
            title: forSaleTitle.trim() || name.trim(),
            condition: forSaleCondition,
            websiteOrDomain: forSaleWebsite.trim() || websiteUrl.trim() || undefined,
            publicImages: forSalePublicImages.length > 0 ? forSalePublicImages : finalImages,
            specs: forSaleSpecs.trim() || undefined,
            noDocsRequired: true,
          }
        : undefined,
      hasDelivery: hasDelivery,
      deliveryInfo: hasDelivery
        ? {
            available: true,
            phone: deliveryPhone.trim() || allPhones[0],
            deliveryWhatsapp: deliveryWhatsapp.trim() || deliveryPhone.trim() || allPhones[0],
            deliveryHotline: deliveryHotline.trim() || undefined,
            deliveryPhones: captainPhones.length > 0 ? captainPhones : [deliveryPhone.trim() || allPhones[0]],
            areas: deliveryAreas.trim() || undefined,
            fee: deliveryFee.trim() || undefined,
            estimatedTime: deliveryEstimatedTime.trim() || undefined,
            notes: deliveryNotes.trim() || undefined,
            programName: 'اطلب الأقرب ليك',
            customDeliveryActive: true,
          }
        : undefined,
      textAnimation: textOverlayConfig.enabled ? textOverlayConfig.animation : undefined,
      overlayText: textOverlayConfig.enabled
        ? {
            caption: textOverlayConfig.caption.trim() || bio.trim() || name.trim(),
            animation: textOverlayConfig.animation,
            fontStyle: textOverlayConfig.fontStyle || 'kufi',
            bannerStyle: textOverlayConfig.bannerStyle || 'neon_glow_box',
            textColor: textOverlayConfig.textColor,
            bgColor: textOverlayConfig.bgColor,
            speed: textOverlayConfig.speed,
            position: textOverlayConfig.position,
            fontSize: textOverlayConfig.fontSize,
          }
        : undefined,
      soundtrack: soundtrack,
      ownerAccessCode: Math.floor(100000 + Math.random() * 900000).toString(),
      uniqueSubscriberKey: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ownerPhone: allPhones[0],
      ownerPageLocked: !!ownerPagePassword.trim(),
      ownerPagePassword: ownerPagePassword.trim() || undefined,
      workStatus: driverWorkStatus,
      satelliteLinkActive: true,
      whatsappCallerLiveTracking: true,
      captainPhotoUrl: avatarPhotoUrl || undefined,
      vehiclePhotoUrl: vehiclePhotoUrl || undefined,
      vehiclePlateNumber: vehiclePlateNumber.trim() || undefined,
      vehicleShape: vehicleShape,
      vehicleType: vehicleTypeModel.trim() || undefined,
      googleSearchKeywords: googleKeywordsText
        .split(/[،,]/)
        .map((k) => k.trim())
        .filter(Boolean),
      customProgramTitle: customProgramTitle.trim() || 'انشر إعلانك',
      customWelcomeMessage: customWelcomeMessage.trim() || undefined,
    };

    if (!moderationAudit.isValid) {
      return;
    }

    // Save initial owner access session in localStorage
    if (newBusiness.ownerAccessCode) {
      localStorage.setItem(`dalilk_owner_verified_${newBusiness.id}`, 'true');
      localStorage.setItem(
        `dalilk_otp_${newBusiness.id}`,
        btoa(`${newBusiness.ownerAccessCode}|${Date.now() + 86400000}|${allPhones[0]}`)
      );
    }

    onAddBusiness(newBusiness);
    setCreatedBusinessSuccess(newBusiness);
  };

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${address || city}`
  )}&z=14&output=embed`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto flex justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-2xl bg-neutral-950 text-white min-h-full sm:min-h-0 sm:my-auto sm:rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-white/10">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
              <span>{t.addTitle}</span>
            </h2>
            <p className="text-[11px] text-[#FF2D55] font-semibold mt-0.5">
              {t.addSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

          {/* 4 Feature Methods Highlights Banner */}
          <div className="mt-3 bg-gradient-to-r from-[#FF2D55]/15 to-purple-900/15 border border-[#FF2D55]/30 rounded-2xl p-3 text-[11px] text-white/90 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🎤</span>
              <span className="font-bold">إملاء صوتي</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">📍</span>
              <span className="font-bold">تحديد بالخريطة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">📁</span>
              <span className="font-bold">سحب وإفلات ميديا</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">📊</span>
              <span className="font-bold">استيراد CSV/Excel</span>
            </div>
          </div>

          {/* Quick Profession Templates for Accountant & Craftsman */}
          <div className="mt-2.5 p-2 bg-blue-950/40 border border-blue-500/30 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-blue-300 block">✨ نماذج سريعة جاهزة بضغطة واحدة:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fillAccountantTemplate}
                className="bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>💼</span>
                <span className="font-bold">تعبئة نموذج محاسب قانوني معتمد</span>
              </button>
              <button
                type="button"
                onClick={fillCraftsmanTemplate}
                className="bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>🔧</span>
                <span className="font-bold">تعبئة نموذج أصحاب حرف وصيانة</span>
              </button>
            </div>
          </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Top Quick Publish Button (أضف إعلانك للجمهور المشتركين الآن مجاناً 3 شهور دون تكرار) */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-rose-950/60 border-2 border-emerald-400/50 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-400 text-black text-xs font-black px-2.5 py-0.5 rounded-full shadow">
                  🎉 أضف إعلانك الآن مجاناً (3 شهور كاملة)
                </span>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  🛡️ صفحة واحدة فقط لكل عميل (يُمنع التكرار)
                </span>
              </div>
              <span className="text-[11px] text-white/90 block font-medium">
                كلمات البحث المفعلة تلقائياً: <strong>إعلان مجاناً، خدمات التجمع، عيادات، كوافير، عقارات، تاكسي</strong>
              </span>
              <span className="text-[10px] text-amber-300/80 block">
                🔒 فحص تلقائي يمنع تكرار الاسم أو العنوان أو التليفون لحماية بيانات المشتركين.
              </span>
            </div>

            <button
              type="submit"
              disabled={!moderationAudit.isValid || isCompressingVideo}
              className={`px-5 py-2.5 rounded-full text-xs font-black transition flex items-center gap-1.5 shadow-lg ${
                moderationAudit.isValid && !isCompressingVideo
                  ? 'bg-gradient-to-r from-[#FF2D55] via-orange-500 to-amber-400 text-white hover:brightness-110 active:scale-95 cursor-pointer shadow-amber-500/20'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
              }`}
            >
              <span>{t.publishNow} 🚀</span>
            </button>
          </div>

          {/* Compressed Top Section: Name, Phone, Address, Photo Upload & Work Status Toggle */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <span>⭐ البيانات الأساسية للمشترك (في بداية الصفحة من فوق)</span>
              </span>

              {/* Status toggle: شغال يفتح نشط / في عطلة يفتح غير نشط */}
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => setDriverWorkStatus('active')}
                  className={`px-2 py-1 rounded-lg font-black transition cursor-pointer ${
                    driverWorkStatus === 'active'
                      ? 'bg-emerald-500 text-black shadow'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  🟢 يفتح نشط (شغال)
                </button>
                <button
                  type="button"
                  onClick={() => setDriverWorkStatus('inactive')}
                  className={`px-2 py-1 rounded-lg font-black transition cursor-pointer ${
                    driverWorkStatus === 'inactive'
                      ? 'bg-red-500 text-white shadow'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  ⚪ يفتح غير نشط (في عطلة)
                </button>
              </div>
            </div>

            {/* Photo Upload for Subscriber */}
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-2xl bg-neutral-900 border-2 border-dashed border-amber-400/50 overflow-hidden flex items-center justify-center shrink-0 group cursor-pointer"
                onClick={() => imageInputRef.current?.click()}
              >
                {avatarPhotoUrl || mediaList.find((m) => m.type === 'image')?.url ? (
                  <img
                    src={avatarPhotoUrl || mediaList.find((m) => m.type === 'image')?.url}
                    alt="صورة المشترك"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-1">
                    <Upload className="w-5 h-5 mx-auto text-amber-400 group-hover:scale-110 transition" />
                    <span className="text-[9px] text-white/60 block mt-0.5">رفع الصورة *</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold text-white block">
                  صورة المشترك / الشعار / الصورة الشخصية للكابتن *
                </span>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  رفع الصورة الشخصية للمشترك أو الكابتن أو شعار النشاط في بداية الصفحة من فوق.
                </p>
              </div>
            </div>

            {/* وضع وتحميل صور ورقم المركبة والسيارة وصورة شخصية وشكل السيارة ونوعها عند التتبع */}
            <div className="bg-black/50 border border-amber-400/40 rounded-2xl p-3 space-y-2.5">
              <div className="text-[11px] font-black text-amber-300 flex items-center justify-between">
                <span>🚖 وضع وتحميل صور ورقم المركبة والسيارة وصورة شخصية وشكل السيارة ونوعها عند التتبع:</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[9px]">
                  🛰️ مربوط بالقمر الصناعي
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-white/75 block mb-1">رقم المركبة / السيارة (اللوحة):</label>
                  <input
                    type="text"
                    value={vehiclePlateNumber}
                    onChange={(e) => setVehiclePlateNumber(e.target.value)}
                    placeholder="مثال: أ ب ج 4821"
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/75 block mb-1">نوع وموديل السيارة / الموتوسيكل:</label>
                  <input
                    type="text"
                    value={vehicleTypeModel}
                    onChange={(e) => setVehicleTypeModel(e.target.value)}
                    placeholder="مثال: هيونداي إلنترا / موتوسيكل هوندا"
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/75 block mb-1">شكل السيارة ونوعها عند التتبع:</label>
                  <select
                    value={vehicleShape}
                    onChange={(e) => setVehicleShape(e.target.value as typeof vehicleShape)}
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="sedan_taxi">🚖 سيارة ملاكي / تاكسي سيدان</option>
                    <option value="suv_4x4">🚙 سيارة دفع رباعي / عائلية SUV</option>
                    <option value="motorcycle">🏍️ موتوسيكل دليفري وتوصيل</option>
                    <option value="scooter">🛵 سكوتر سريع للطلبات</option>
                    <option value="van_pickup">🚐 فان / ربع نقل بضائع</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer font-black text-[10.5px]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{vehiclePhotoUrl ? 'تم تحميل صورة المركبة ✓ (اضغط للتغيير)' : 'تحميل صورة المركبة / السيارة / الموتوسيكل'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') setVehiclePhotoUrl(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>

                <label className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer font-black text-[10.5px]">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{avatarPhotoUrl ? 'تم تحميل الصورة الشخصية ✓ (اضغط للتغيير)' : 'تحميل صورة شخصية للكابتن / المشترك'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') setAvatarPhotoUrl(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* غلق صفحتي بقفل باسورد + كلمات بحث جوجل للصفحة + تعديل البرنامج والرسائل لكل مشترك */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="bg-purple-950/40 border border-purple-400/40 rounded-xl p-2.5 space-y-1">
                <label className="text-[10.5px] font-black text-purple-200 block">
                  🔒 غلق صفحتي بقفل باسورد خاص (اختياري):
                </label>
                <input
                  type="text"
                  value={ownerPagePassword}
                  onChange={(e) => setOwnerPagePassword(e.target.value)}
                  placeholder="اكتب باسورد قفل صفحتك لحمايتها..."
                  className="w-full bg-black/60 border border-purple-400/40 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>

              <div className="bg-blue-950/40 border border-blue-400/40 rounded-xl p-2.5 space-y-1">
                <label className="text-[10.5px] font-black text-blue-200 block">
                  🔍 إضافة كلمات بحث جوجل لصفحتك:
                </label>
                <input
                  type="text"
                  value={googleKeywordsText}
                  onChange={(e) => setGoogleKeywordsText(e.target.value)}
                  placeholder="كلمات بحث جوجل مفصولة بفاصلة..."
                  className="w-full bg-black/60 border border-blue-400/40 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="bg-white/5 border border-white/15 rounded-xl p-2.5 space-y-1">
                <label className="text-[10px] font-black text-amber-300 block">
                  📢 عنوان البرنامج بصفحتك (تعديل البرنامج لكل مشترك):
                </label>
                <input
                  type="text"
                  value={customProgramTitle}
                  onChange={(e) => setCustomProgramTitle(e.target.value)}
                  placeholder="انشر إعلانك"
                  className="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div className="bg-white/5 border border-white/15 rounded-xl p-2.5 space-y-1">
                <label className="text-[10px] font-black text-amber-300 block">
                  💬 رسالتك الترحيبية للعملاء (تعديل الرسائل لكل مشترك):
                </label>
                <input
                  type="text"
                  value={customWelcomeMessage}
                  onChange={(e) => setCustomWelcomeMessage(e.target.value)}
                  placeholder="رسالة ترحيب أو عرض خاص لعملائك..."
                  className="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
          {/* Business Name with Voice Recognition Button */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/80 flex items-center justify-between">
              <span>{t.bizName} *</span>
              {isRecording && (
                <span className="text-[#FF2D55] text-[10px] animate-pulse font-black">
                  ● جاري التسجيل الصوتي... تحدث الآن
                </span>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: مطعم الشيف، شركة المقاولات، عيادة د. محمد..."
                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF2D55]"
              />
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`px-3.5 rounded-xl flex items-center justify-center transition cursor-pointer ${
                  isRecording
                    ? 'bg-[#FF2D55] text-white animate-pulse shadow-lg shadow-[#FF2D55]/50'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}
                title="تسجيل صوتي فوري لاسم ووصف النشاط"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#FF2D55]" />}
              </button>
            </div>
            {speechError && (
              <p className="text-[10px] text-amber-400 mt-1">{speechError}</p>
            )}
          </div>

          {/* Quick Category Pickers: Clinics, Hospitals, Pharmacies, Physical Therapy, Auto Electrician, Car Showroom, Chalets, Tourism, Import/Export */}
          <div className="space-y-2 bg-white/5 border border-amber-400/30 p-3 rounded-2xl">
            <span className="text-[11px] font-black text-amber-300 block">
              ⚡ إضافة سريعة للأنشطة والخدمات الطبية والسياحية والتجارية:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setCategory('أطباء وعيادات');
                  setSubCategory('عيادة ودكتور');
                  if (!name) setName('عيادة د. ');
                  setGoogleKeywordsText('عيادة، دكتور، حجز العيادات والمستشفيات، كشف طبي');
                }}
                className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black transition cursor-pointer flex items-center justify-center gap-1 border ${
                  category === 'أطباء وعيادات'
                    ? 'bg-teal-500 text-black border-teal-300 shadow-md'
                    : 'bg-white/5 text-white/85 border-white/10 hover:text-white'
                }`}
              >
                <span>👨‍⚕️ عيادة ودكتور</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('صيدليات ومستشفيات');
                  setSubCategory('مستشفى وصيدلية');
                  if (!name) setName('مستشفى وصيدلية ');
                  setGoogleKeywordsText('مستشفى، صيدلية، حجز العيادات والمستشفيات، طوارئ، أدوية');
                }}
                className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black transition cursor-pointer flex items-center justify-center gap-1 border ${
                  category === 'صيدليات ومستشفيات'
                    ? 'bg-emerald-500 text-black border-emerald-300 shadow-md'
                    : 'bg-white/5 text-white/85 border-white/10 hover:text-white'
                }`}
              >
                <span>🏥 مستشفى وصيدلية</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('علاج طبيعي وتأهيل');
                  setSubCategory('علاج طبيعي وتأهيل');
                  if (!name) setName('مركز العلاج الطبيعي والتأهيل ');
                  setGoogleKeywordsText('علاج طبيعي، تأهيل، عمود فقري، جلسات علاج طبيعي');
                }}
                className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black transition cursor-pointer flex items-center justify-center gap-1 border ${
                  category === 'علاج طبيعي وتأهيل'
                    ? 'bg-cyan-500 text-black border-cyan-300 shadow-md'
                    : 'bg-white/5 text-white/85 border-white/10 hover:text-white'
                }`}
              >
                <span>🦴 علاج طبيعي</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('كهربائي وصيانة سيارات');
                  setSubCategory('كهربائي صيانة سيارات');
                  if (!name) setName('مركز كهربائي وصيانة سيارات ');
                  setGoogleKeywordsText('كهربائي صيانة سيارات، فحص كمبيوتر، صيانة سيارات');
                }}
                className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black transition cursor-pointer flex items-center justify-center gap-1 border ${
                  category === 'كهربائي وصيانة سيارات'
                    ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                    : 'bg-white/5 text-white/85 border-white/10 hover:text-white'
                }`}
              >
                <span>⚡ كهربائي صيانة سيارات</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('معرض سيارات');
                  setSubCategory('معرض سيارات زيرو ومستعمل');
                  if (!name) setName('معرض سيارات ');
                  setGoogleKeywordsText('معرض سيارات، سيارات للبيع، تقسيط سيارات');
                }}
                className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black transition cursor-pointer flex items-center justify-center gap-1 border ${
                  category === 'معرض سيارات'
                    ? 'bg-[#FF2D55] text-white border-rose-300 shadow-md'
                    : 'bg-white/5 text-white/85 border-white/10 hover:text-white'
                }`}
              >
                <span>🚗 معرض سيارات</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('رحلات وشاليهات');
                  setSubCategory('شاليهات للإيجار بالعين السخنة والساحل');
                  if (!name) setName('رحلات وشاليهات ');
                  setGoogleKeywordsText('رحلات وشاليهات، شاليهات للإيجار، مصايف السخنة والساحل');
                }}
                className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black transition cursor-pointer flex items-center justify-center gap-1 border ${
                  category === 'رحلات وشاليهات'
                    ? 'bg-sky-500 text-black border-sky-300 shadow-md'
                    : 'bg-white/5 text-white/85 border-white/10 hover:text-white'
                }`}
              >
                <span>🏖️ رحلات وشاليهات</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('شركات سياحة');
                  setSubCategory('شركات سياحة وحج وعمرة');
                  if (!name) setName('شركة سياحة وطيران ');
                  setGoogleKeywordsText('شركات سياحة، حجز طيران، رحلات سياحية، حج وعمرة');
                }}
                className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black transition cursor-pointer flex items-center justify-center gap-1 border ${
                  category === 'شركات سياحة'
                    ? 'bg-purple-500 text-white border-purple-300 shadow-md'
                    : 'bg-white/5 text-white/85 border-white/10 hover:text-white'
                }`}
              >
                <span>✈️ شركات سياحة</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('شركات استيراد وتصدير');
                  setSubCategory('استيراد وتصدير وتخليص جمركي');
                  if (!name) setName('شركة استيراد وتصدير ');
                  setGoogleKeywordsText('شركات استيراد وتصدير، تخليص جمركي، شحن دولي');
                }}
                className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black transition cursor-pointer flex items-center justify-center gap-1 border ${
                  category === 'شركات استيراد وتصدير'
                    ? 'bg-orange-500 text-black border-orange-300 shadow-md'
                    : 'bg-white/5 text-white/85 border-white/10 hover:text-white'
                }`}
              >
                <span>🚢 شركات استيراد وتصدير</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setCategory('مطاعم');
                  setSubCategory('مشويات ومأكولات شرقية وغربية');
                }}
                className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black transition cursor-pointer flex items-center justify-center gap-1 border ${
                  category === 'مطاعم'
                    ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                    : 'bg-white/5 text-white/80 border-white/10 hover:text-white'
                }`}
              >
                <span>🍔 مطاعم</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('خضروات وفواكه');
                  setSubCategory('خضروات وفواكه طازجة وتمور');
                }}
                className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black transition cursor-pointer flex items-center justify-center gap-1 border ${
                  category === 'خضروات وفواكه'
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-md'
                    : 'bg-white/5 text-white/80 border-white/10 hover:text-white'
                }`}
              >
                <span>🥬 خضروات</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('سندوتشات ووجبات سريعة');
                  setSubCategory('سندوتشات سريعة وشاورما وبرجر');
                }}
                className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black transition cursor-pointer flex items-center justify-center gap-1 border ${
                  category === 'سندوتشات ووجبات سريعة'
                    ? 'bg-[#FF2D55] text-white border-red-400 shadow-md'
                    : 'bg-white/5 text-white/80 border-white/10 hover:text-white'
                }`}
              >
                <span>🥪 سندوتشات</span>
              </button>
            </div>
          </div>

          {/* Category & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/80">
                {t.selectCategory} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF2D55]"
              >
                {CATEGORIES.filter((c) => c !== 'الكل').map((c) => (
                  <option key={c} value={c} className="bg-neutral-900 text-white">
                    {getCategoryLabel(c, lang)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white/80">
                {t.selectCity} *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF2D55]"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-neutral-900 text-white">
                    {getCityLabel(c, lang)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subcategory / Specialty */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/80 flex items-center justify-between">
              <span>التخصص الدقيق / التصنيف الفرعي (Subcategory)</span>
              {category === 'محاسبين قانونيين' && (
                <span className="text-[10px] text-emerald-400 font-bold">✓ معتمد بسجل المحاسبين والضرائب</span>
              )}
              {category === 'أصحاب حرف' && (
                <span className="text-[10px] text-amber-400 font-bold">✓ حرفيين وصناع بضمان الجودة</span>
              )}
            </label>
            {SUBCATEGORIES[category] && SUBCATEGORIES[category].length > 0 ? (
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF2D55]"
              >
                <option value="" className="bg-neutral-900 text-white">اختر التخصص الدقيق (أو اكتبه بالأسفل)...</option>
                {SUBCATEGORIES[category].filter((s) => s !== 'الكل').map((sub) => (
                  <option key={sub} value={sub} className="bg-neutral-900 text-white">
                    {sub}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="مثال: محاسب قانوني معتمد، استشاري ضرائب، سباكة وكهرباء، ميكانيكا..."
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF2D55]"
              />
            )}
          </div>

          {/* Address & Interactive Map Picker */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/80">
              {t.address} *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="الشارع، المنطقة، أقرب علامة مميزة..."
                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF2D55]"
              />
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className={`px-3 rounded-xl text-xs font-bold flex items-center gap-1 border transition ${
                  showMap
                    ? 'bg-[#FF2D55] text-white border-[#FF2D55]'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{showMap ? 'إخفاء الخريطة' : t.pickOnMap}</span>
              </button>
            </div>

            {/* Interactive Map Box Accordion */}
            {showMap && (
              <div className="mt-2 bg-neutral-900 border border-white/15 rounded-2xl overflow-hidden p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white/70">معاينة الخريطة المباشرة:</span>
                  <button
                    type="button"
                    onClick={() => {
                      if ('geolocation' in navigator) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setLat(pos.coords.latitude.toFixed(6));
                            setLng(pos.coords.longitude.toFixed(6));
                            setAddress((prev) => prev || `موقعي الجغرافي (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
                            alert(lang === 'ar' ? '📍 تم تحديد موقعك الحالي بدقة عبر GPS!' : 'Current GPS location detected successfully!');
                          },
                          (err) => {
                            console.warn(err);
                            alert(lang === 'ar' ? 'تعذر الوصول إلى الموقع الجغرافي، يرجى تفعيل الـ GPS في المتصفح.' : 'GPS location access denied.');
                          }
                        );
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-sm transition"
                  >
                    <span>📍 تحديد موقعي الحالي عبر GPS</span>
                  </button>
                </div>
                <iframe
                  src={mapEmbedUrl}
                  title="تحديد الموقع على الخريطة"
                  className="w-full h-40 rounded-xl border-0"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Latitude"
                    className="flex-1 bg-white/10 border border-white/10 rounded-lg p-1.5 text-[11px] text-white"
                  />
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="Longitude"
                    className="flex-1 bg-white/10 border border-white/10 rounded-lg p-1.5 text-[11px] text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMap(false)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    حفظ الإحداثيات
                  </button>
                </div>
              </div>
            )}

            {/* Google Business Profile & Google Maps link */}
            <div className="pt-1.5">
              <input
                type="url"
                value={googleBusinessUrl}
                onChange={(e) => setGoogleBusinessUrl(e.target.value)}
                placeholder="رابط صفحة Google Business Profile أو رابط المكان على خرائط Google (اختياري)"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-blue-400 placeholder:text-white/40"
              />
            </div>

            {/* Ready Website or Custom Domain (إضافة موقع جاهز أو دومين) */}
            <div className="pt-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-white/90 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>موقع جاهز أو دومين خاص (Website / Custom Domain)</span>
                </label>
                <span className="text-[10px] text-blue-300">اختياري - يظهر للمستخدمين مباشرة</span>
              </div>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="مثال: https://mysite.com أو www.mycar.eg أو دومينك الجاهز"
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-blue-400 placeholder:text-white/40 font-mono"
              />
            </div>
          </div>

          {/* Description / Bio */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-white/80">
              {t.description}
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="اكتب نبذة مختصرة عن نشاطك أو اضغط زر الميكروفون بالأعلى لتسجيلها بصوتك..."
              className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF2D55]"
            />
          </div>

          {/* Phone / WhatsApp & Operating Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/80">
                {t.phoneOrWa} *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01006656669"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF2D55]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white/80">
                ساعات العمل
              </label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="مثال: 10:00 ص - 02:00 ص أو 24 ساعة"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#FF2D55]"
              />
            </div>
          </div>

          {/* Additional Phone Numbers (Hotline, Landline, WhatsApp 2) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-white/80">
                {t.additionalPhones}
              </label>
              <button
                type="button"
                onClick={() => setAdditionalPhones([...additionalPhones, ''])}
                className="text-[11px] font-bold text-[#FF2D55] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{t.addPhoneBtn}</span>
              </button>
            </div>

            {additionalPhones.map((extraPhone, pIdx) => (
              <div key={pIdx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={extraPhone}
                  onChange={(e) => {
                    const copy = [...additionalPhones];
                    copy[pIdx] = e.target.value;
                    setAdditionalPhones(copy);
                  }}
                  placeholder={`رقم إضافي ${pIdx + 2} (أرضي أو محمول أو خدمة عملاء)`}
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() =>
                    setAdditionalPhones(additionalPhones.filter((_, i) => i !== pIdx))
                  }
                  className="p-1.5 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {additionalPhones.length === 0 && (
              <p className="text-[10px] text-white/40">
                يمكنك إضافة أكثر من رقم هاتف (مثل الخط الساخن، رقم أرضي، فرع ثان) ليسهل على الزوار التواصل معك.
              </p>
            )}
          </div>

          {/* Delivery Service Option for Subscribers (خدمة الدليفري والتوصيل للمشتركين) */}
          <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-orange-950/40 border border-amber-500/30 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    <span>خدمة التوصيل والدليفري للعملاء 🛵</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                      خيار للمشتركين
                    </span>
                  </h4>
                  <p className="text-[10px] text-white/60">
                    هل يوفر نشاطك خدمة توصيل الطلبات والمنتجات للعملاء؟
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDelivery}
                  onChange={(e) => setHasDelivery(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {hasDelivery && (
              <div className="pt-2 border-t border-white/10 space-y-2.5 animate-in fade-in duration-150">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-[11px] text-amber-200">
                  <div className="font-black text-amber-300 flex items-center gap-1.5 mb-1">
                    <span>🛵 برنامج: اطلب الأقرب ليك</span>
                    <span className="bg-amber-400 text-black px-1.5 py-0.2 rounded font-black text-[9px]">جمع طلبك دليفري خاص</span>
                  </div>
                  <span>أدخل أرقام الدليفري والطيارين لتظهر لجمهورك وعملائك مباشرة مع تتبع الطلبات وجمع المشتريات.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-300">
                      📞 رقم الدليفري الأساسي لاستقبال الطلبات:
                    </label>
                    <input
                      type="text"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      placeholder={phone || '01006656669'}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-emerald-400">
                      💬 رقم واتساب الدليفري الفوري:
                    </label>
                    <input
                      type="text"
                      value={deliveryWhatsapp}
                      onChange={(e) => setDeliveryWhatsapp(e.target.value)}
                      placeholder={phone || '01006656669'}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-red-300">
                      ☎️ الخط الساخن السريع (اختياري):
                    </label>
                    <input
                      type="text"
                      value={deliveryHotline}
                      onChange={(e) => setDeliveryHotline(e.target.value)}
                      placeholder="مثال: 19xxx أو رقم مختصر"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/80">
                      مناطق وتغطية التوصيل:
                    </label>
                    <input
                      type="text"
                      value={deliveryAreas}
                      onChange={(e) => setDeliveryAreas(e.target.value)}
                      placeholder="مثال: داخل المدينة والمناطق المجاورة، أو بقطر 10 كم"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/80">
                      رسوم وتكلفة التوصيل:
                    </label>
                    <input
                      type="text"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      placeholder="مثال: توصيل مجاني / يبدأ من 15 ج.م / حسب المشوار"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-white/80">
                      الوقت التقريبي لوصول الطلب:
                    </label>
                    <input
                      type="text"
                      value={deliveryEstimatedTime}
                      onChange={(e) => setDeliveryEstimatedTime(e.target.value)}
                      placeholder="مثال: خلال 30 - 45 دقيقة"
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Captain Phones Dynamic Section */}
                <div className="space-y-1.5 bg-black/40 p-2.5 rounded-xl border border-white/10">
                  <label className="text-[10px] font-bold text-sky-300 block">
                    🛵 أرقام طياري وكباتن الدليفري التابعين للنشاط:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newCaptainPhoneInput}
                      onChange={(e) => setNewCaptainPhoneInput(e.target.value)}
                      placeholder="أدخل رقم كابتن أو طيار دليفري تابع للمحل..."
                      className="flex-1 bg-neutral-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newCaptainPhoneInput.trim()) return;
                        setCaptainPhones((prev) => [...prev, newCaptainPhoneInput.trim()]);
                        setNewCaptainPhoneInput('');
                      }}
                      className="bg-sky-500 hover:bg-sky-400 text-black px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition"
                    >
                      + إضافة كابتن
                    </button>
                  </div>

                  {captainPhones.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {captainPhones.map((cp, idx) => (
                        <div
                          key={idx}
                          className="bg-neutral-800 border border-white/10 rounded-lg px-2 py-0.5 text-[11px] font-mono text-sky-300 flex items-center gap-1.5"
                        >
                          <span>كابتن #{idx + 1}: {cp}</span>
                          <button
                            type="button"
                            onClick={() => setCaptainPhones((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-rose-400 hover:text-rose-300 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/80">
                    ملاحظات أو شروط الطلب (اختياري):
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="مثال: الدفع عند الاستلام كاش أو فودافون كاش، إرسال اللوكيشن بالواتساب"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}
          </div>

            {/* Media Drag and Drop Zone */}
          {/* Media Drag and Drop Zone & Compression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white/80">
                الفيديوهات والصور (ريلز + صور العرض مع ضغط فوري) *
              </label>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                ⚡ ضغط آلي لتسريع التصفح
              </span>
            </div>

            {/* Quick Action Buttons: Upload Photos vs Upload Videos */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-2 border border-white/15 transition cursor-pointer text-xs"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>📸 رفع صور (ضغط فوري)</span>
              </button>

              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-2 border border-white/15 transition cursor-pointer text-xs"
              >
                <Video className="w-4 h-4 text-[#FF2D55]" />
                <span>🎥 رفع فيديو (ضغط ريلز)</span>
              </button>
            </div>

            {/* Hidden specialized inputs */}
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <input
              ref={videoInputRef}
              type="file"
              multiple
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Drag & Drop Box */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-[#FF2D55] bg-white/5 rounded-2xl p-3.5 text-center cursor-pointer transition group"
            >
              <Upload className="w-5 h-5 mx-auto text-white/50 mb-1 group-hover:scale-110 transition" />
              <p className="text-xs font-bold text-white">
                أو اسحب وأفلت ملفات الصور والفيديوهات هنا معاً
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                يتم ضغط الصور والفيديوهات تلقائياً عند دخولها لتوفير الحجم وتسريع التحميل للزوار
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/*,image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Video Compression Progress Banner */}
            {isCompressingVideo && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-1.5 animate-pulse">
                <div className="flex items-center justify-between text-xs text-amber-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    {lang === 'ar' ? 'جاري ضغط وتقليص حجم الفيديو بنسبة فائقة لتسريع التحميل والتوفير...' : 'Compressing video on-the-fly for faster loading and data saving...'}
                  </span>
                  <span className="font-mono font-black">{compressProgress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${compressProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Image Compression Progress Banner */}
            {isCompressingImage && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-300 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                <span>{lang === 'ar' ? 'جاري معالجة وضغط الصورة فائقة الجودة لسرعة فائقة في التصفح...' : 'Optimizing and compressing image for fast loading...'}</span>
              </div>
            )}

            {/* Video Compression Success Badge */}
            {videoCompressionStats && !isCompressingVideo && (
              <div className="bg-blue-500/15 border border-blue-500/30 rounded-xl p-2.5 px-3 flex items-center justify-between text-xs text-blue-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>
                    <b>{lang === 'ar' ? 'تم ضغط الفيديو بنجاح:' : 'Video compressed successfully:'}</b> {videoCompressionStats.originalSizeMb} MB ⬅️ {videoCompressionStats.compressedSizeMb} MB
                  </span>
                </div>
                <span className="bg-blue-500/30 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                  {lang === 'ar' ? `توفير ${videoCompressionStats.compressionRatio}%` : `${videoCompressionStats.compressionRatio}% saved`}
                </span>
              </div>
            )}

            {/* Image Compression Success Badge */}
            {imageCompressionStats && !isCompressingImage && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-2.5 px-3 flex items-center justify-between text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <b>{lang === 'ar' ? 'تم ضغط الصورة بنجاح:' : 'Image compressed successfully:'}</b> {imageCompressionStats.originalSizeMb} MB ⬅️ {imageCompressionStats.compressedSizeMb} MB
                  </span>
                </div>
                <span className="bg-emerald-500/30 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                  {lang === 'ar' ? `توفير ${imageCompressionStats.compressionRatio}%` : `${imageCompressionStats.compressionRatio}% saved`}
                </span>
              </div>
            )}

            {/* External Video Importer Button with Compression and Quotas */}
            <button
              type="button"
              onClick={() => setIsVideoImporterOpen(true)}
              className="w-full bg-gradient-to-r from-red-600 via-[#FF2D55] to-orange-500 hover:brightness-110 active:scale-98 text-white p-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition cursor-pointer"
            >
              <Film className="w-4 h-4" />
              <span>🎬 تحميل وضغط فيديو من الخارج (جوجل أو سطح المكتب) مع الالتزام بالحصص</span>
            </button>

            {/* Direct Video URL Input & Presets */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 space-y-2">
              <span className="text-[11px] font-bold text-white/80 block">
                أو أضف رابط فيديو ريلز مباشر (URL):
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="flex-1 bg-white/10 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (videoUrlInput.trim()) {
                      setMediaList((prev) => [
                        ...prev,
                        { url: videoUrlInput.trim(), type: 'video' },
                      ]);
                      setVideoUrlInput('');
                    }
                  }}
                  className="bg-[#FF2D55] text-white px-3 py-1 rounded-lg text-xs font-bold"
                >
                  + إضافة
                </button>
              </div>

              {/* Ready Presets */}
              <div className="flex gap-1.5 overflow-x-auto hide-scroll pt-1">
                <span className="text-[10px] text-white/40 self-center">نماذج ريلز:</span>
                {[
                  { label: 'فيديو مطعم 🍳', url: DEFAULT_VIDEOS[0] },
                  { label: 'فيديو فندق 🏨', url: DEFAULT_VIDEOS[3] },
                  { label: 'فيديو سيارات 🚗', url: DEFAULT_VIDEOS[2] },
                  { label: 'فيديو عيادة 🩺', url: DEFAULT_VIDEOS[4] },
                ].map((preset, pI) => (
                  <button
                    key={pI}
                    type="button"
                    onClick={() =>
                      setMediaList((prev) => [...prev, { url: preset.url, type: 'video' }])
                    }
                    className="shrink-0 bg-white/10 hover:bg-white/20 text-white/80 text-[10px] px-2 py-0.5 rounded-full border border-white/5"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Uploaded media previews */}
            {mediaList.length > 0 && (
              <div className="flex gap-2 overflow-x-auto hide-scroll py-1">
                {mediaList.map((m, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-white/20 group"
                  >
                    {m.type === 'video' ? (
                      <video src={m.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={m.url} alt="upload" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaList((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="absolute inset-0 bg-red-600/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Live Text Animation Preview Widget (نموذج تجربة ومعاينة تحريك النصوص الحية على الريل) */}
            <div className="bg-gradient-to-r from-purple-950/40 via-neutral-900 to-[#FF2D55]/15 border-2 border-purple-500/40 hover:border-purple-400/60 rounded-2xl p-3.5 space-y-3 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30 shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white">
                        {lang === 'ar' ? 'تحريك النصوص والعروض على الفيديو (Live Preview)' : 'Text Animation & Live Preview'}
                      </span>
                      <span className="text-[9px] bg-gradient-to-r from-amber-400 to-[#FF2D55] text-black font-black px-2 py-0.5 rounded-full shadow">
                        {lang === 'ar' ? 'ميزة تفاعلية ⚡' : 'Interactive ⚡'}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/60 block">
                      {lang === 'ar'
                        ? 'جرب حركة النصوص (التحريك النيوني، التذبذب، الموجة) وشاهد المعاينة الحية بالهاتف قبل النشر'
                        : 'Try neon glow, vibration & wiggle animations with instant live phone preview'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLiveAnimModalOpen(true)}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-[#FF2D55] hover:brightness-110 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition shrink-0 cursor-pointer active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تجربة ومعاينة حية 🎬' : 'Live Preview 🎬'}</span>
                </button>
              </div>

              {/* Status and Active animation badge */}
              <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-2.5 flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white/70">
                    {lang === 'ar' ? 'الشكل المعتمد حالياً:' : 'Active Animation:'}
                  </span>
                  <span className="bg-[#FF2D55]/30 border border-[#FF2D55]/50 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    {textOverlayConfig.animation === 'neon' ? '💡 التحريك النيوني المشع'
                      : textOverlayConfig.animation === 'vibrate' ? '⚡ التذبذب والاهتزاز النابض'
                      : textOverlayConfig.animation === 'marquee' ? '🏃‍♂️ شريط إخباري زاحف'
                      : textOverlayConfig.animation === 'wave' ? '🌊 موجة انسيابية راقصة'
                      : textOverlayConfig.animation === 'bounce' ? '🏀 قفز واهتزاز حيوي'
                      : textOverlayConfig.animation === 'pop' ? '💥 نبض وتكبير عاجل'
                      : textOverlayConfig.animation === 'slide' ? '↔️ انزلاق جانبي متكرر'
                      : '🔄 دوران مجسم 3D'}
                  </span>
                </div>

                {/* Quick Animation Changer Pills right on the page */}
                <div className="flex items-center gap-1 overflow-x-auto hide-scroll py-0.5">
                  {[
                    { id: 'neon', label: 'النيوني 💡' },
                    { id: 'vibrate', label: 'التذبذب ⚡' },
                    { id: 'marquee', label: 'زاحف 🏃' },
                    { id: 'wave', label: 'موجة 🌊' },
                    { id: 'bounce', label: 'قفز 🏀' },
                    { id: 'pop', label: 'نبض 💥' },
                    { id: 'slide', label: 'انزلاق ↔️' },
                    { id: 'flip3d', label: '3D 🔄' },
                  ].map((animOption) => (
                    <button
                      key={animOption.id}
                      type="button"
                      onClick={() =>
                        setTextOverlayConfig((prev) => ({
                          ...prev,
                          animation: animOption.id as TextAnimationType,
                          enabled: true,
                        }))
                      }
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition ${
                        textOverlayConfig.animation === animOption.id
                          ? 'bg-amber-400 text-black border-amber-300 shadow font-black'
                          : 'bg-white/5 text-white/70 border-white/10 hover:text-white'
                      }`}
                    >
                      {animOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slogan Input Field */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textOverlayConfig.caption}
                  onChange={(e) =>
                    setTextOverlayConfig((prev) => ({
                      ...prev,
                      caption: e.target.value,
                      enabled: true,
                    }))
                  }
                  placeholder={lang === 'ar' ? 'اكتب العرض أو التخفيض أو الشعار المراد تحريكه على الفيديو...' : 'Enter slogan or offer to animate on video...'}
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#FF2D55]"
                />
              </div>

              {/* Text Slogan Live Moving Preview Banner */}
              <div className="flex items-center gap-2 bg-black/60 rounded-xl p-2 border border-white/10 overflow-hidden">
                <span className="text-[10px] text-amber-400 font-bold shrink-0">
                  {lang === 'ar' ? 'معاينة مباشرة للحركة:' : 'Live Motion Preview:'}
                </span>
                <div className="overflow-hidden flex-1">
                  <div
                    className={`${
                      textOverlayConfig.animation === 'neon'
                        ? 'anim-neon-glow'
                        : textOverlayConfig.animation === 'vibrate'
                        ? 'anim-vibrate'
                        : textOverlayConfig.animation === 'wave'
                        ? 'anim-wave-text'
                        : textOverlayConfig.animation === 'bounce'
                        ? 'anim-bounce-text'
                        : textOverlayConfig.animation === 'slide'
                        ? 'anim-slide-text'
                        : textOverlayConfig.animation === 'pop'
                        ? 'anim-pop-text'
                        : textOverlayConfig.animation === 'flip3d'
                        ? 'anim-flip3d'
                        : 'anim-marquee'
                    } speed-${textOverlayConfig.speed} text-[11px] font-black tracking-wide drop-shadow`}
                    style={{ color: textOverlayConfig.textColor }}
                  >
                    {textOverlayConfig.caption || bio || name || (lang === 'ar' ? '🔥 خصم خاص لعملاء إعلانك لفترة محدودة ⚡' : 'Special offer for E3lanak clients')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLiveAnimModalOpen(true)}
                  className="text-[10px] bg-white/10 hover:bg-white/20 text-white font-bold px-2 py-0.5 rounded-md shrink-0 border border-white/10"
                >
                  {lang === 'ar' ? 'فتح المحاكي 📱' : 'Open Simulator 📱'}
                </button>
              </div>
            </div>

            {/* Soundtrack & Audio Library Selector (موسيقى تصويرية مقترحة أو رابط خارجي مع كتم الصوت) */}
            <SoundtrackSelector
              value={soundtrack}
              onChange={(st) => setSoundtrack(st)}
              onRemove={() => setSoundtrack({
                trackId: undefined,
                title: 'بدون صوت (مكتوم)',
                url: '',
                isMuted: true,
              })}
              lang={lang}
            />
          </div>

          {/* Dynamic Services & Pricing */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-white">
                {t.servicesAndPrices}
              </label>
              <button
                type="button"
                onClick={addServiceRow}
                className="text-[11px] font-bold text-[#FF2D55] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>{t.addService}</span>
              </button>
            </div>

            <div className="space-y-2">
              {services.map((serv, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={serv.n}
                    onChange={(e) => updateService(index, 'n', e.target.value)}
                    placeholder={t.serviceName}
                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={serv.p}
                    onChange={(e) => updateService(index, 'p', e.target.value)}
                    placeholder={t.servicePrice}
                    className="w-36 bg-white/10 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeServiceRow(index)}
                      className="p-1.5 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CSV / Excel Client Import Box */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <label className="text-xs font-bold text-white">
                {t.excelImport}
              </label>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="text-[11px] text-white/60 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
            />
            {csvMessage && (
              <p className="text-[10px] text-emerald-400 font-bold mt-1">
                {csvMessage}
              </p>
            )}
          </div>

          {/* Marketplace & For Sale Item Section (بيع سيارات، عقارات، أي شيء دون مستندات) */}
          <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/20 border border-amber-500/40 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏷️</span>
                <div>
                  <span className="text-xs font-black text-white block">
                    عرض سيارة أو عقار أو أي شيء للبيع للجمهور
                  </span>
                  <span className="text-[10px] text-amber-300 font-bold">
                    بيع مباشر وسريع دون الحاجة لمستندات أو رخص تجارية ✨
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isForSale}
                onChange={(e) => setIsForSale(e.target.checked)}
                className="w-5 h-5 accent-amber-400 cursor-pointer rounded"
              />
            </div>

            {isForSale && (
              <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
                {/* No-Docs Direct Guarantee Banner */}
                <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-2.5 flex items-center gap-2 text-emerald-300 text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-black text-white">بيع حر مباشر دون مستندات:</span>
                    <p className="text-[10px] text-emerald-200/90 mt-0.5">
                      يمكنك نشر إعلانك وصور السلعة للجمهور فوراً دون الحاجة لتقديم أي أوراق أو سجلات تجارية.
                    </p>
                  </div>
                </div>

                {/* Title & Item Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-white/80 block mb-1 font-bold">
                      عنوان السلعة أو المعروض للبيع *
                    </label>
                    <input
                      type="text"
                      value={forSaleTitle}
                      onChange={(e) => setForSaleTitle(e.target.value)}
                      placeholder="مثال: مرسيدس C200 موديل 2023 فابريكا / شقة 180م التجمع الخامس"
                      className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-white/80 block mb-1 font-bold">
                      تصنيف المعروض:
                    </label>
                    <select
                      value={forSaleItemType}
                      onChange={(e) => setForSaleItemType(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="سيارة / مركبة">🚗 سيارة / مركبة (سبتره)</option>
                      <option value="عقار / شقة / فيلا">🏢 عقار / شقة / فيلا / أرض</option>
                      <option value="محل تجاري / كافيه">🏬 محل تجاري / كافيه / مطعم</option>
                      <option value="أجهزة وإلكترونيات">📱 أجهزة وإلكترونيات وهواتف</option>
                      <option value="أثاث ومفروشات">🛋️ أثاث ومفروشات منزلية ومكتبية</option>
                      <option value="معدات وبضائع">⚙️ معدات مصانع وبضائع جملة</option>
                      <option value="أي شيء للبيع">📦 أي شيء آخر للبيع</option>
                    </select>
                  </div>
                </div>

                {/* Price & Condition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-white/80 block mb-1 font-bold">
                      السعر المطلوب (ج.م) *
                    </label>
                    <input
                      type="number"
                      value={forSalePrice}
                      onChange={(e) => setForSalePrice(e.target.value)}
                      placeholder="مثال: 650000"
                      className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-white/80 block mb-1 font-bold">
                      حالة المعروض:
                    </label>
                    <select
                      value={forSaleCondition}
                      onChange={(e) => setForSaleCondition(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="فابريكا كسر زيرو كالجديد">✨ فابريكا كسر زيرو كالجديد</option>
                      <option value="مستعمل بحالة ممتازة">⭐ مستعمل بحالة ممتازة</option>
                      <option value="جديد بالضمان والكرتونة">📦 جديد بالضمان والكرتونة</option>
                      <option value="تشطيب ألترا سوبر لوكس (عقار)">🏠 تشطيب ألترا سوبر لوكس (عقار)</option>
                      <option value="نصف تشطيب / محارة وحلوق">🧱 نصف تشطيب / محارة وحلوق</option>
                      <option value="جاهز للمعاينة والتسليم الفوري">🔑 جاهز للمعاينة والتسليم الفوري</option>
                    </select>
                  </div>
                </div>

                {/* Ready Website or Custom Domain for the Sale Item */}
                <div className="space-y-1">
                  <label className="text-[11px] text-white/80 block font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span>رابط موقع جاهز أو دومين خاص بالسلعة أو المعرض (اختياري)</span>
                    </span>
                    <span className="text-[10px] text-blue-300">يظهر للمشترين مباشرة</span>
                  </label>
                  <input
                    type="text"
                    value={forSaleWebsite}
                    onChange={(e) => setForSaleWebsite(e.target.value)}
                    placeholder="https://mycar-listing.com أو رابط صفحة العقار"
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                {/* Specifications & Notes */}
                <div className="space-y-1">
                  <label className="text-[11px] text-white/80 block font-bold">
                    المواصفات والتفاصيل (سنة الصنع، الكيلومترات، المساحة، المواصفات الفنية):
                  </label>
                  <textarea
                    rows={2}
                    value={forSaleSpecs}
                    onChange={(e) => setForSaleSpecs(e.target.value)}
                    placeholder="مثال: موديل 2023، عداد 25,000 كم، صيانة توكيل بالكامل، رخصة سارية سنة باسم المالك الأول..."
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-xs text-white resize-none"
                  />
                </div>

                {/* Upload Public Photos for the Audience (رفع صور للجمهور) */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>رفع صور للجمهور (صور السيارة أو العقار أو المعروض للبيع)</span>
                    </label>
                    <span className="text-[10px] text-amber-300 font-bold">
                      {forSalePublicImages.length} صور مرفوعة للجمهور
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => saleImageInputRef.current?.click()}
                      className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>📸 رفع صور من جهازك</span>
                    </button>
                    <input
                      ref={saleImageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleSaleImagesUpload(e.target.files)}
                    />
                    <span className="text-[10px] text-white/50">
                      يمكنك اختيار صور متعددة للسيارة أو العقار وتُضغط تلقائياً لسرعة التصفح.
                    </span>
                  </div>

                  {isUploadingSaleImages && (
                    <div className="flex items-center gap-2 text-amber-300 text-xs bg-amber-400/10 p-2 rounded-lg">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري ضغط وتجهيز صور المعروضات للعرض السريع للجمهور...</span>
                    </div>
                  )}

                  {/* Public Photos Preview Grid */}
                  {forSalePublicImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                      {forSalePublicImages.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-black border border-white/20 group">
                          <img src={img} alt={`sale-${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setForSalePublicImages((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 end-1 bg-red-600/80 text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Plan / Package Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80">
              {t.choosePackage}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { val: 0, title: t.free90Days, desc: 'تجربة مجانية كاملة 90 يوم' },
                { val: 199, title: t.basic199, desc: '10 فيديوهات + ظهور مميز' },
                { val: 399, title: t.premium399, desc: '30 فيديو + علامة التوثيق الرسمية ⭐' },
                { val: 799, title: t.vip799, desc: 'غير محدود + بنر أعلى المنصة 👑' },
              ].map((tier) => (
                <div
                  key={tier.val}
                  onClick={() => setPkg(tier.val as PackageTier)}
                  className={`p-3 rounded-2xl border cursor-pointer transition ${
                    pkg === tier.val
                      ? 'bg-[#FF2D55]/20 border-[#FF2D55] ring-1 ring-[#FF2D55]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-black text-white">{tier.title}</div>
                  <div className="text-[10px] text-white/60 mt-0.5">{tier.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Moderation Warning Banner (If Profanity or Political content is detected) */}
          {!moderationAudit.isValid && (
            <div className="bg-red-500/15 border-2 border-red-500/50 rounded-2xl p-3.5 text-red-200 space-y-2 animate-pulse">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-red-400 flex items-center gap-1.5">
                    <span>⚠️ تم إيقاف عرض الإعلان (محتوى مخالف لسياسة النشر)</span>
                  </h4>
                  <p className="text-[11px] leading-relaxed text-red-200">
                    {moderationAudit.errorMessage}
                  </p>
                  <div className="text-[11px] font-mono bg-black/50 px-2 py-1 rounded border border-red-500/30">
                    الكلمات المحظورة المرصودة:{' '}
                    <span className="text-red-400 font-bold">{moderationAudit.flaggedWords.join(', ')}</span>
                  </div>
                  <p className="text-[10px] text-red-300/80">
                    يُرجى إزالة الألفاظ المخالفة لتفعيل زر النشر وعرض الإعلان للجمهور.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Legal Responsibility & Admin Review Acknowledgment */}
          <div className="bg-red-950/40 border border-red-500/40 p-3 rounded-2xl space-y-1.5 text-start">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>إقرار المسؤولية القانونية والموافقة الإدارية:</span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed">
              • يُقر المشترك بأن كافة ما ينشره من بيانات أو صور أو فيديوهات أو أسعار يقع تحت <strong>مسؤوليته القانونية والجنائية الكاملة</strong>.<br />
              • يخضع الإعلان لمراجعة ومعاينة الإدارة ولا يُنشر للعامة إلا بعد <strong>موافقة المشرف (Admin Approval)</strong>، ويتم إخفاؤه تلقائياً عند انتهاء الاشتراك دون تجديد.
            </p>
          </div>

          {/* Action Buttons: Preview & Publish */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {/* Live Ad Preview Button */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-black py-3 rounded-full text-xs transition flex items-center justify-center gap-2 border border-white/15 cursor-pointer shadow-md"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>معاينة الإعلان قبل النشر 👁️</span>
            </button>

            {/* Direct Submit Button (كلمة نشر أسفل صفحة المشترك) */}
            <button
              type="submit"
              disabled={!moderationAudit.isValid || isCompressingVideo}
              className={`font-black py-3 rounded-full text-xs transition flex items-center justify-center gap-1.5 shadow-xl ${
                moderationAudit.isValid && !isCompressingVideo
                  ? 'bg-gradient-to-r from-[#FF2D55] via-orange-500 to-amber-400 hover:brightness-110 active:scale-98 text-white shadow-[#FF2D55]/40 cursor-pointer'
                  : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-60'
              }`}
            >
              {isCompressingVideo ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري ضغط الفيديو ({compressProgress}%)...</span>
                </>
              ) : !moderationAudit.isValid ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>موقوف للمخالفة</span>
                </>
              ) : (
                <span>انشر إعلانك الآن • نشر وتفعيل الاشتراك 🚀</span>
              )}
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-2 text-center space-y-1">
            <p className="text-[10px] text-amber-300 font-bold">
              • تُنشر الصفحة وتُفعّل بعد مراجعة الاشتراك من قِبل الأدمن أو تنشيط فوري خلال ٣ أيام.
            </p>
            <p className="text-[9px] text-white/50">
              {t.paymentNote} • الالتزام بالحصص والقانون وتصحيح الأخطاء • ينتهي الاشتراك تلقائياً بعد 90 يوماً إن لم يتم التجديد.
            </p>
          </div>
        </form>

        {/* Live Ad Preview Modal */}
        {isPreviewOpen && (
          <AdPreviewModal
            business={{
              id: Date.now(),
              name: name || (lang === 'ar' ? 'نشاط تجاري جديد' : 'New Business'),
              cat: category,
              city,
              addr: address || city,
              bio: bio || (lang === 'ar' ? 'أفضل وأجود الخدمات للعملاء.' : 'Top quality service for our clients.'),
              phone: phone || '01006656669',
              phones: [phone, ...additionalPhones.filter(Boolean)],
              videos: mediaList.filter((m) => m.type === 'video').map((m) => m.url).length > 0
                ? mediaList.filter((m) => m.type === 'video').map((m) => m.url)
                : [DEFAULT_VIDEOS[0]],
              images: mediaList.filter((m) => m.type === 'image').map((m) => m.url).length > 0
                ? mediaList.filter((m) => m.type === 'image').map((m) => m.url)
                : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
              services: services.filter((s) => s.n.trim() !== ''),
              poster: videoPoster || undefined,
              videoStats: videoCompressionStats
                ? {
                    originalSizeMb: videoCompressionStats.originalSizeMb,
                    compressedSizeMb: videoCompressionStats.compressedSizeMb,
                    compressionRatio: videoCompressionStats.compressionRatio,
                  }
                : undefined,
              verified: pkg >= 399 ? 1 : 0,
              isSponsored: pkg === 799,
              pkg,
              textAnimation: textOverlayConfig.enabled ? textOverlayConfig.animation : undefined,
              overlayText: textOverlayConfig.enabled
                ? {
                    caption: textOverlayConfig.caption.trim() || bio.trim() || name.trim(),
                    animation: textOverlayConfig.animation,
                    fontStyle: textOverlayConfig.fontStyle || 'kufi',
                    bannerStyle: textOverlayConfig.bannerStyle || 'neon_glow_box',
                    textColor: textOverlayConfig.textColor,
                    bgColor: textOverlayConfig.bgColor,
                    speed: textOverlayConfig.speed,
                    position: textOverlayConfig.position,
                    fontSize: textOverlayConfig.fontSize,
                  }
                : undefined,
              soundtrack: soundtrack,
            }}
            lang={lang}
            onClose={() => setIsPreviewOpen(false)}
            onConfirmPublish={() => {
              setIsPreviewOpen(false);
              // Trigger form submission
              const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
              handleSubmit(fakeEvent);
            }}
          />
        )}

        {/* Dedicated Live Text Animation Preview Modal (معاينة حية ومحاكاة تحريك النصوص بالهاتف) */}
        {isLiveAnimModalOpen && (
          <LiveTextAnimationModal
            videoSrc={
              mediaList.find((m) => m.type === 'video')?.url ||
              (videoUrlInput.trim() || DEFAULT_VIDEOS[0])
            }
            businessName={name || (lang === 'ar' ? 'نشاطك التجاري' : 'Your Business')}
            initialConfig={{
              caption: textOverlayConfig.caption || bio || (lang === 'ar' ? '🔥 خصم خاص 20% لعملاء إعلانك لفترة محدودة ⚡' : 'Special offer for E3lanak clients'),
              animation: textOverlayConfig.animation,
              fontStyle: textOverlayConfig.fontStyle,
              bannerStyle: textOverlayConfig.bannerStyle,
              textColor: textOverlayConfig.textColor,
              bgColor: textOverlayConfig.bgColor,
              speed: textOverlayConfig.speed,
              position: textOverlayConfig.position,
              fontSize: textOverlayConfig.fontSize,
            }}
            onApply={(config) => {
              setTextOverlayConfig({ ...config, enabled: true });
            }}
            onClose={() => setIsLiveAnimModalOpen(false)}
            lang={lang}
          />
        )}

        {/* External Video Importer Modal (Google / Desktop with Compression & Quotas) */}
        {isVideoImporterOpen && (
          <ExternalVideoImporterModal
            currentVideosCount={mediaList.filter((m) => m.type === 'video').length}
            pkgTier={pkg}
            onClose={() => setIsVideoImporterOpen(false)}
            onAddVideo={(videoUrl) => {
              setMediaList((prev) => [...prev, { url: videoUrl, type: 'video' }]);
              setIsVideoImporterOpen(false);
            }}
            lang={lang}
          />
        )}

        {/* Duplicate Prevention & Developer Message Modal (عدم النشر عند تكرار الاسم والعنوان والتليفون - صفحة واحدة لكل عميل) */}
        {duplicateBlock && (
          <div 
            className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            dir="rtl"
          >
            <div 
              className="w-full max-w-lg bg-neutral-950 border-2 border-red-500/70 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 my-auto relative animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-red-500/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400 font-black shadow-lg">
                    <ShieldCheck className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-red-400 flex items-center gap-1.5">
                      <span>⚠️ تنبيه أمني - تم رفض النشر منعاً للتكرار!</span>
                    </h3>
                    <p className="text-[11px] text-red-200/80">
                      نظام حماية المشتركين والعملاء • لكل عميل صفحة واحدة فقط
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDuplicateBlock(null)}
                  className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Duplicate Details Banner */}
              <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>🚫 {duplicateBlock.label} [{duplicateBlock.value}]</span>
                </div>
                <p className="text-xs text-white/90 leading-relaxed font-bold">
                  [ سبق استخدامه للمشتركين أو مطور منصة إعلانك ] في صفحة: ({duplicateBlock.existingBusinessName})
                </p>
                <div className="p-2.5 bg-black/60 rounded-xl border border-red-500/20 text-[11px] text-red-200 leading-relaxed">
                  🛡️ <strong className="text-white">قاعدة المنصة الصارمة:</strong> مسموح بصفحة واحدة فقط لكل عميل ومشترك (3 شهور مجاناً). يُمنع تكرار الاسم التجاري أو رقم الهاتف أو العنوان لمنع التكرار وحماية المشتركين والجمهور من أي تضارب أو احتيال.
                </div>
              </div>

              {/* Developer Messaging Section */}
              <div className="bg-gradient-to-r from-neutral-900 to-blue-950/30 border border-blue-500/30 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span>إرسال رسالة "سبق استخدامه" لمطور منصة إعلانك:</span>
                  </span>
                  <span className="text-[10px] text-white/50">دعم المشتركين</span>
                </div>

                {developerMsgSent ? (
                  <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-3 text-center space-y-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                    <p className="text-xs font-black text-emerald-300">
                      ✅ تم إرسال رسالتك بنجاح إلى مطور منصة إعلانك!
                    </p>
                    <p className="text-[10px] text-white/70">
                      سيتم مراجعة نشاطك ورقم هاتفك والتواصل معك لتفعيل صفحتك أو استعادة كود الدخول.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={developerMsgText}
                      onChange={(e) => setDeveloperMsgText(e.target.value)}
                      rows={3}
                      className="w-full bg-black/70 border border-white/15 focus:border-sky-400 rounded-xl p-2.5 text-xs text-white focus:outline-none placeholder:text-white/40 leading-relaxed"
                      placeholder="اكتب رسالتك أو استفسارك لمطور المنصة..."
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            const raw = localStorage.getItem('e3lanak_developer_messages') || '[]';
                            const msgs = JSON.parse(raw);
                            msgs.push({
                              id: Date.now(),
                              date: new Date().toISOString(),
                              name,
                              phone,
                              field: duplicateBlock.field,
                              value: duplicateBlock.value,
                              text: developerMsgText,
                              status: 'pending'
                            });
                            localStorage.setItem('e3lanak_developer_messages', JSON.stringify(msgs));
                          } catch {}
                          setDeveloperMsgSent(true);
                        }}
                        className="flex-1 bg-sky-500 hover:bg-sky-400 text-black py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>إرسال لمطور منصة إعلانك 📩</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const waText = encodeURIComponent(developerMsgText);
                          window.open(`https://wa.me/201006656669?text=${waText}`, '_blank');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer"
                        title="محادثة واتساب مباشرة مع مطور المنصة"
                      >
                        <span>واتساب 💬</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Official Domain & Guidance */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-white/70">
                <span className="flex items-center gap-1.5 text-white/90">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الرابط النهائي بالدومين الرسمي:</span>
                </span>
                <span className="text-emerald-400 font-mono font-bold">https://alasematex.com</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDuplicateBlock(null)}
                  className="flex-1 bg-white/15 hover:bg-white/25 text-white py-2.5 rounded-xl text-xs font-black transition cursor-pointer"
                >
                  ✏️ تعديل البيانات المدخلة والمحاولة مجدداً
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDuplicateBlock(null);
                    onClose();
                  }}
                  className="bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-400/40 px-3 py-2.5 rounded-xl text-xs font-black transition cursor-pointer"
                  title="أنا صاحب هذا النشاط وأريد تعديل صفحتي بالرقم السري"
                >
                  🔐 أنا صاحب هذا النشاط
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Publication Success Screen with Official Domain Link */}
        {createdBusinessSuccess && (
          <div 
            className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            dir="rtl"
          >
            <div 
              className="w-full max-w-lg bg-neutral-950 border-2 border-emerald-500/70 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 my-auto relative animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="text-center space-y-2 border-b border-white/10 pb-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  🎉 تم تسجيل ونشر صفحتك بنجاح!
                </h3>
                <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-black">
                  <Gift className="w-3.5 h-3.5" />
                  <span>هدية المنصة: 3 شهور مجاناً لجميع الخدمات 🎁</span>
                </div>
              </div>

              {/* Private PIN & Access Code */}
              <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-yellow-950/40 border border-amber-500/40 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300">
                    🔐 الرقم السري الخاص بك لتعديل وإدارة صفحتك:
                  </span>
                  <span className="text-[10px] text-white/60">سري وخاص بك</span>
                </div>
                <div className="bg-black/60 rounded-xl p-2.5 text-center border border-amber-500/30">
                  <span className="text-2xl font-black tracking-widest text-amber-400 font-mono">
                    {createdBusinessSuccess.ownerAccessCode}
                  </span>
                </div>
                <p className="text-[10px] text-white/70 text-center">
                  رقم الهاتف المسجل: <strong className="text-white">{createdBusinessSuccess.phone}</strong> • احتفظ بهذا الرقم السري حيث لا يستطيع أحد تعديل صفحتك بدونه.
                </p>
              </div>

              {/* Official Domain Final Link */}
              <div className="bg-neutral-900/90 border border-emerald-500/40 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>🌐 الرابط النهائي الرسمي لصفحتك بالدومين:</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    معتمد
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-black/60 rounded-xl p-2 border border-white/10">
                  <input
                    type="text"
                    readOnly
                    value={`https://alasematex.com/p/${createdBusinessSuccess.id}`}
                    className="bg-transparent flex-1 text-xs text-emerald-300 font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://alasematex.com/p/${createdBusinessSuccess.id}`);
                      setCopiedSuccessLink(true);
                      setTimeout(() => setCopiedSuccessLink(false), 2500);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition shrink-0"
                  >
                    {copiedSuccessLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSuccessLink ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const pageUrl = `https://alasematex.com/p/${createdBusinessSuccess.id}`;
                    const waText = encodeURIComponent(`شاهد صفحة إعلاني الرسمية على منصة إعلانك (3 شهور مجاناً):\n${pageUrl}`);
                    const a = document.createElement('a');
                    a.href = `https://wa.me/?text=${waText}`;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.click();
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>مشاركة الرابط عبر الواتساب</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreatedBusinessSuccess(null);
                    onClose();
                  }}
                  className="bg-gradient-to-r from-[#FF2D55] to-rose-600 hover:brightness-110 text-white px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer"
                >
                  دخول وعرض صفحتي 🚀
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
