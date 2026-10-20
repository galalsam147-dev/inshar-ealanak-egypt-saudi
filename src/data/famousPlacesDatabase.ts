export interface FamousPlaceCandidate {
  name: string;
  cat: string;
  city: string;
  addr: string;
  bio: string;
  phone: string;
  phones: string[];
  rating: number;
  reviewsCount: number;
  googleBusinessUrl: string;
  googleMapsUrl: string;
  image: string;
  video: string;
  services: { n: string; p: string }[];
  hours: string;
  lat: number;
  lng: number;
}

export const FAMOUS_PLACES_CATALOG: FamousPlaceCandidate[] = [
  {
    name: "مطعم قصر الكبابجي - التجمع الخامس",
    cat: "مطاعم",
    city: "القاهرة",
    addr: "شارع التسعين الشمالي، التجمع الخامس، القاهرة الجديدة",
    bio: "أشهر وأفخم مطاعم المشويات الشرقية والكباب والكفتة في مصر. جلسات عائلية ملوكية وأجواء سياحية مميزة مع تشكيلة من أشهى الأطباق المصرية الأصيلة.",
    phone: "19056",
    phones: ["19056", "01006656669", "01200019056"],
    rating: 4.8,
    reviewsCount: 14200,
    googleBusinessUrl: "https://business.google.com/search?q=قصر+الكبابجي+التجمع",
    googleMapsUrl: "https://maps.google.com/?q=قصر+الكبابجي+التجمع+الخامس",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-vegetables-in-a-pan-43407-large.mp4",
    services: [
      { n: "كيلو كباب وكفتة ضاني مشوي على الفحم", p: "890 ج.م" },
      { n: "طاجن موزة بالمشروم وبطاطس بيوريه", p: "420 ج.م" },
      { n: "صينية السلطان الملكية مع الرقاق والشوربة", p: "2100 ج.م" }
    ],
    hours: "12:00 م - 04:00 ص",
    lat: 30.0278,
    lng: 31.4722
  },
  {
    name: "كشري أبو طارق - وسط البلد التاريخي",
    cat: "مطاعم",
    city: "القاهرة",
    addr: "16 شارع معروف، متفرع من شارع رمسيس، وسط البلد",
    bio: "ملك الكشري المصري وصاحب الرقم القياسي في موسوعة جينيس. محطة سياحية أساسية لكل زائر لمصر مع خلطة الصلصة والدقة الخاصة وحلوى الأرز باللبن.",
    phone: "16005",
    phones: ["16005", "0225775935", "01006656669"],
    rating: 4.7,
    reviewsCount: 28500,
    googleBusinessUrl: "https://business.google.com/search?q=كشري+أبو+طارق+وسط+البلد",
    googleMapsUrl: "https://maps.google.com/?q=كشري+ابو+طارق+وسط+البلد",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-glass-of-drink-over-a-table-42790-large.mp4",
    services: [
      { n: "طبق كشري أبو طارق الخصوصي كبير", p: "85 ج.م" },
      { n: "طاجن كشري لحمة مفرومة في الفرن", p: "95 ج.م" },
      { n: "طبق أرز باللبن والمكسرات الفاخرة", p: "40 ج.م" }
    ],
    hours: "09:00 ص - 03:00 ص",
    lat: 30.0511,
    lng: 31.2394
  },
  {
    name: "بلبن B.Laban - أصل القشطوطة والأم علي",
    cat: "مطاعم",
    city: "الجيزة",
    addr: "شارع جامعة الدول العربية، المهندسين",
    bio: "العلامة الأسرع انتشاراً في الشرق الأوسط لعالم الحلويات الشرقية والمبتكرة. قشطوطة، مسحب، كشري حلو، وافل، وأم علي بلبن الطبيعي الطازج 100%.",
    phone: "15980",
    phones: ["15980", "01006656669"],
    rating: 4.9,
    reviewsCount: 31000,
    googleBusinessUrl: "https://business.google.com/search?q=B.Laban+بلبن+المهندسين",
    googleMapsUrl: "https://maps.google.com/?q=بلبن+جامعة+الدول+المهندسين",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-glass-of-drink-over-a-table-42790-large.mp4",
    services: [
      { n: "قشطوطة لوتس ونوتيلا ومكسرات فستق", p: "95 ج.م" },
      { n: "كشري حلو بلبن بقطع المانجو الطبيعية", p: "85 ج.م" },
      { n: "أم علي ملوكي بالمكسرات والقشطة البلدي", p: "70 ج.م" }
    ],
    hours: "11:00 ص - 03:30 ص",
    lat: 30.0542,
    lng: 31.2014
  },
  {
    name: "مطعم البرنس - إمبابة (ناصر البرنس)",
    cat: "مطاعم",
    city: "الجيزة",
    addr: "شارع طلعت حرب، مدينة العمال، إمبابة",
    bio: "الاسم الأشهر في عالم الطواجن المصرية، كبدة إسكندراني، سجق بلدي، ومخاط ملوخية بالطشة الشهيرة. مقصد الفنانين ونجوم المجتمع والسياح.",
    phone: "19154",
    phones: ["19154", "01006656669"],
    rating: 4.6,
    reviewsCount: 19800,
    googleBusinessUrl: "https://business.google.com/search?q=مطعم+البرنس+إمبابة",
    googleMapsUrl: "https://maps.google.com/?q=مطعم+البرنس+امبابة",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-vegetables-in-a-pan-43407-large.mp4",
    services: [
      { n: "طاجن ورق عنب بالكوارع المخلية", p: "260 ج.م" },
      { n: "طبق كبدة بلدي بالثوم والليمون", p: "190 ج.م" },
      { n: "ملوخية خضراء بلدي بالطشة", p: "85 ج.م" }
    ],
    hours: "01:00 م - 04:00 ص",
    lat: 30.0784,
    lng: 31.2144
  },
  {
    name: "سي جل للمأكولات البحرية Sea Gull - الإسكندرية",
    cat: "مطاعم",
    city: "الإسكندرية",
    addr: "طريق الجيش، المكس، شاطئ البحر مباشرة",
    bio: "أعرق مطاعم الأسماك والفواكه البحرية في عروس البحر المتوسط منذ 1978. جمبري جامبو، استاكوزا بالجبنة، طواجن سبيط، وجلسات بانورامية ساحرة على البحر.",
    phone: "034404000",
    phones: ["034404000", "01006656669"],
    rating: 4.7,
    reviewsCount: 8900,
    googleBusinessUrl: "https://business.google.com/search?q=Sea+Gull+Alexandria",
    googleMapsUrl: "https://maps.google.com/?q=Sea+Gull+Restaurant+Alexandria",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-vegetables-in-a-pan-43407-large.mp4",
    services: [
      { n: "كيلو جمبري سويسي مشوي باترفلاي", p: "980 ج.م" },
      { n: "شوربة سي فود ملوكية مخلية بالكريمة", p: "180 ج.م" },
      { n: "سمكة وقار إسكندراني مشوية سنجاري بالزيت والليمون", p: "750 ج.م" }
    ],
    hours: "11:00 ص - 01:00 ص",
    lat: 31.1492,
    lng: 29.8375
  },
  {
    name: "حلواني العبد El Abd Patisserie - وسط البلد",
    cat: "مطاعم",
    city: "القاهرة",
    addr: "25 شارع طلعت حرب، ميدان طلعت حرب، وسط البلد",
    bio: "رائد صناعة الحلويات الشرقية والغربية وحلاوة المولد والكعك والبسكويت في مصر منذ 1950. جودة استثنائية وأسعار تنافسية لا تضاهى.",
    phone: "16437",
    phones: ["16437", "0223938307", "01006656669"],
    rating: 4.8,
    reviewsCount: 35000,
    googleBusinessUrl: "https://business.google.com/search?q=حلواني+العبد+وسط+البلد",
    googleMapsUrl: "https://maps.google.com/?q=حلواني+العبد+طلعت+حرب",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-glass-of-drink-over-a-table-42790-large.mp4",
    services: [
      { n: "علبة حلويات شرقية مشكلة سوبر لوكس", p: "240 ج.م" },
      { n: "تورتة شوكولاتة وفواكه طبيعية", p: "320 ج.م" },
      { n: "كيلو بسبوسة بالمكسرات وقشطة", p: "175 ج.م" }
    ],
    hours: "08:30 ص - 01:00 ص",
    lat: 30.0475,
    lng: 31.2396
  },
  {
    name: "فندق وسبا الماسة Al Masa Hotel - مدينة نصر",
    cat: "فنادق",
    city: "القاهرة",
    addr: "شارع عبد العزيز الشناوي، خلف المنصة، مدينة نصر",
    bio: "منتجع فندقي فخم 5 نجوم يمتد على مساحات خضراء شاسعة وبحيرات صناعية في قلب القاهرة. قاعات مؤتمرات دولية، حمامات سباحة، ملاعب تنس وسبا عالمي.",
    phone: "0224023730",
    phones: ["0224023730", "01006656669"],
    rating: 4.8,
    reviewsCount: 16500,
    googleBusinessUrl: "https://business.google.com/search?q=فندق+الماسة+مدينة+نصر",
    googleMapsUrl: "https://maps.google.com/?q=Al+Masa+Hotel+Nasr+City",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-luxury-hotel-room-43405-large.mp4",
    services: [
      { n: "غرفة بريميوم مزدوجة مطلة على البحيرة شاملة الإفطار", p: "3200 ج.م" },
      { n: "جناح دبلوماسي تنفيذي فاخر", p: "6500 ج.م" },
      { n: "يوم داي يوز كامل مع استخدام المسابح والسبا", p: "1200 ج.م" }
    ],
    hours: "استقبال وحجوزات 24 ساعة",
    lat: 30.0633,
    lng: 31.3125
  },
  {
    name: "غبور جي بي أوتو GB Auto لقطع الغيار والصيانة",
    cat: "قطع غيار",
    city: "الجيزة",
    addr: "طريق القاهرة - الإسكندرية الصحراوي، الكيلو 28، القرية الذكية",
    bio: "الموزع والوكيل الرسمي لسيارات هيونداي، شيري، هافال، شانجان ومازدا. مراكز صيانة معتمدة وأكبر مستودع لقطع الغيار الأصلية بالضمان المعتمد في مصر.",
    phone: "16661",
    phones: ["16661", "01006656669", "0235391200"],
    rating: 4.5,
    reviewsCount: 7400,
    googleBusinessUrl: "https://business.google.com/search?q=GB+Auto+Ghabbour",
    googleMapsUrl: "https://maps.google.com/?q=GB+Auto+Egypt",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-mechanic-working-on-a-car-engine-42795-large.mp4",
    services: [
      { n: "طقم صيانة دورية 20 ألف كم شامل الفلاتر والزيوت", p: "2450 ج.م" },
      { n: "طقم تيل فرامل أصلي مع الفحص الشامل للفرامل", p: "1250 ج.م" },
      { n: "فحص كمبيوتر شامل لجميع أنظمة وحساسات السيارة", p: "450 ج.م" }
    ],
    hours: "08:30 ص - 05:30 م",
    lat: 30.0765,
    lng: 31.0211
  },
  {
    name: "مستشفيات دار الفؤاد Dar Al Fouad Hospital - 6 أكتوبر",
    cat: "أطباء",
    city: "الجيزة",
    addr: "امتداد محور 26 يوليو، بجوار جامعة مصر للعلوم والتكنولوجيا، 6 أكتوبر",
    bio: "الصرح الطبي الرائد في جراحة القلب وزراعة الأعضاء والأورام، معتمد من الهيئة المشتركة الدولية JCI. أفضل استشاريين ورعاية طبية بمعايير عالمية.",
    phone: "16370",
    phones: ["16370", "01006656669", "0238247000"],
    rating: 4.6,
    reviewsCount: 9200,
    googleBusinessUrl: "https://business.google.com/search?q=Dar+Al+Fouad+Hospital",
    googleMapsUrl: "https://maps.google.com/?q=Dar+Al+Fouad+Hospital+6+October",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-luxury-hotel-room-43405-large.mp4",
    services: [
      { n: "كشف استشاري متخصص بعيادات القلب والأوعية الدموية", p: "600 ج.م" },
      { n: "رسم قلب بالمجهود وفحص إيكو متقدم", p: "950 ج.م" },
      { n: "فحص طبي دوري شامل لكبار السن والرياضيين", p: "1800 ج.م" }
    ],
    hours: "طوارئ وعيادات 24 ساعة",
    lat: 29.9875,
    lng: 30.9525
  },
  {
    name: "فارس للمأكولات البحرية Fares Seafood - شرم الشيخ",
    cat: "مطاعم",
    city: "جنوب سيناء - شرم الشيخ",
    addr: "السوق التجاري القديم، شرم الشيخ، جنوب سيناء",
    bio: "الوجهة الأولى لعشاق السمك والسي فود في شرم الشيخ. شوربة فارس المميزة مع تشكيلة أسماك البحر الأحمر الطازجة وشعور وناجل وحبار بتتبيلة سرية.",
    phone: "0693663076",
    phones: ["0693663076", "01006656669"],
    rating: 4.8,
    reviewsCount: 12400,
    googleBusinessUrl: "https://business.google.com/search?q=Fares+Seafood+Sharm",
    googleMapsUrl: "https://maps.google.com/?q=Fares+Seafood+Old+Market+Sharm+El+Sheikh",
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-vegetables-in-a-pan-43407-large.mp4",
    services: [
      { n: "شوربة فارس الخصوصية الغنية بالجمبري والكابوريا", p: "195 ج.م" },
      { n: "طاجن حبار وفيليه طازج بصلصة الطماطم الحارة", p: "320 ج.م" },
      { n: "وجبة ميكس سي فود مشوي لشخصين", p: "750 ج.م" }
    ],
    hours: "11:00 ص - 02:00 ص",
    lat: 27.8654,
    lng: 34.2982
  },
  {
    name: "حلواني العبد El Abd Patisserie - وسط البلد وجميع الفروع",
    cat: "مطاعم",
    city: "القاهرة",
    addr: "25 شارع طلعت حرب، وسط البلد، القاهرة",
    bio: "البراند الأكثر عراقة وشهرة للحلويات الشرقية والغربية وكحك العيد وحلاوة المولد في مصر منذ عام 1974. بسبوسة بالسمن البلدي وشوكولاتة وآيس كريم فاخر.",
    phone: "16437",
    phones: ["16437", "0223938307", "01006656669"],
    rating: 4.9,
    reviewsCount: 45000,
    googleBusinessUrl: "https://business.google.com/search?q=El+Abd+Patisserie+Cairo",
    googleMapsUrl: "https://maps.google.com/?q=El+Abd+Patisserie+Talaat+Harb",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-glass-of-drink-over-a-table-42790-large.mp4",
    services: [
      { n: "علبة حلويات شرقية مشكلة ملوكية سمن بلدي 1 كجم", p: "280 ج.م" },
      { n: "تورتة شوكولاتة وكراميل للمناسبات الكبيرة", p: "360 ج.م" },
      { n: "كيلو آيس كريم طبيعي مانجو وفستق ومستكة", p: "180 ج.م" }
    ],
    hours: "08:30 ص - 01:00 ص",
    lat: 30.0489,
    lng: 31.2392
  },
  {
    name: "كرم الشام Karam El Sham - إمبراطور الشاورما السورية",
    cat: "مطاعم",
    city: "القاهرة",
    addr: "شارع عباس العقاد، مدينة نصر، القاهرة",
    bio: "أشهر سلاسل الشاورما والبروستد السوري في مصر. وجبة التوفير العربي، بوكس الشياكة، شاورما لحمة ودجاج بالثومية والمخلل مع أجواء شبابية حيوية.",
    phone: "19509",
    phones: ["19509", "01006656669", "01201950900"],
    rating: 4.8,
    reviewsCount: 38000,
    googleBusinessUrl: "https://business.google.com/search?q=Karam+El+Sham+Nasr+City",
    googleMapsUrl: "https://maps.google.com/?q=Karam+El+Sham+Abbas+El+Akkad",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-chef-garnishing-a-dish-in-a-kitchen-40810-large.mp4",
    services: [
      { n: "وجبة شاورما دجاج عربي دبل مع بطاطس وثومية", p: "165 ج.م" },
      { n: "بوكس السعادة كرم الشام مع شاورما وموزاريلا وبروستد", p: "295 ج.م" },
      { n: "ساندوتش صاروخ لحمة بلدي صوص دبس الرمان", p: "125 ج.م" }
    ],
    hours: "11:00 ص - 04:00 ص",
    lat: 30.0578,
    lng: 31.3412
  },
  {
    name: "صيدليات العزبي El Ezaby Pharmacy - الخط الساخن الرسمي",
    cat: "صيدليات ومستشفيات",
    city: "القاهرة",
    addr: "ميدان مصطفى محمود، جامعة الدول العربية، الجيزة",
    bio: "أكبر وأشهر سلاسل الصيدليات في مصر والرعاية الصحية الموثوقة. جميع الأدوية المحلية والمستوردة، مستحضرات التجميل، أجهزة قياس الضغط والسكر، وتوصيل سريع للمنازل 24 ساعة.",
    phone: "19600",
    phones: ["19600", "01006656669", "01140019600"],
    rating: 4.8,
    reviewsCount: 52000,
    googleBusinessUrl: "https://business.google.com/search?q=El+Ezaby+Pharmacy",
    googleMapsUrl: "https://maps.google.com/?q=El+Ezaby+Pharmacy+Mohandessin",
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-luxury-hotel-room-43405-large.mp4",
    services: [
      { n: "خدمة توصيل أدوية منزلية سريعة 24 ساعة لجميع المحافظات", p: "مجاناً للطلبات" },
      { n: "قياس سكر وضغط ووزن واستشارة صيدلانية مجانية", p: "مجاني" },
      { n: "جهاز قياس ضغط الدم ديجيتال ألماني معتمد", p: "1450 ج.م" }
    ],
    hours: "مفتوح 24 ساعة طوال أيام الأسبوع",
    lat: 30.0521,
    lng: 31.2052
  },
  {
    name: "بي تك B.TECH - الأجهزة الكهربائية والإلكترونيات والتقسيط",
    cat: "شركات",
    city: "القاهرة",
    addr: "مول سيتي ستارز، شارع عمر بن الخطاب، مدينة نصر",
    bio: "الشركة الرائدة في بيع الأجهزة المنزلية والهواتف الذكية والشاشات في مصر، بنظام كاش وتقسيط ميسر عبر ميني كاش. ضمان معتمد وفروع في كافة المدن المصرية.",
    phone: "19966",
    phones: ["19966", "01006656669", "01020019966"],
    rating: 4.7,
    reviewsCount: 31000,
    googleBusinessUrl: "https://business.google.com/search?q=B.TECH+Egypt",
    googleMapsUrl: "https://maps.google.com/?q=B.TECH+City+Stars+Cairo",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-car-driving-on-the-highway-41137-large.mp4",
    services: [
      { n: "شاشة سمارت 55 بوصة 4K ألترا إتش دي بضمان 3 سنوات", p: "16900 ج.م" },
      { n: "ثلاجة نوفروست موفرة للطاقة بنظام التقسيط المريح", p: "24500 ج.م" },
      { n: "صيانة واستبدال فوري وضمان شامل", p: "حسب الضمان" }
    ],
    hours: "10:00 ص - 11:30 م",
    lat: 30.0732,
    lng: 31.3458
  },
  {
    name: "زانوسي مصر Zanussi Egypt - الصيانة الرسمية المعتمدة",
    cat: "صيانة",
    city: "القاهرة",
    addr: "المنطقة الصناعية الأولى، مدينة العبور، القاهرة الكبرى",
    bio: "الخط الساخن والتوكيل الرسمي لصيانة غسالات وثلاجات وبوتاجازات وسخانات زانوسي وإيديال زانوسي في مصر. قطع غيار أصلية 100% بالضمان وفنيين معتمدين.",
    phone: "19999",
    phones: ["19999", "01006656669", "01280019999"],
    rating: 4.6,
    reviewsCount: 22000,
    googleBusinessUrl: "https://business.google.com/search?q=Zanussi+Egypt",
    googleMapsUrl: "https://maps.google.com/?q=Zanussi+Maintenance+Center+Obour",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-car-driving-on-the-highway-41137-large.mp4",
    services: [
      { n: "زيارة صيانة وكشف فني منزلي شامل للغسالات والثلاجات", p: "250 ج.م" },
      { n: "طقم كارتة وموتور أصلي مع شهادة ضمان معتمدة سنة", p: "1850 ج.م" },
      { n: "صيانة وقائية دورية للأجهزة المنزلية", p: "400 ج.م" }
    ],
    hours: "08:00 ص - 10:00 م",
    lat: 30.2155,
    lng: 31.4589
  },
  {
    name: "كارفور مصر Carrefour Egypt - هايبر ماركت والتسوق",
    cat: "تسوق ومولات",
    city: "القاهرة",
    addr: "داندي ميجا مول، طريق مصر الإسكندرية الصحراوي / كايرو فيستيفال سيتي",
    bio: "سلسلة الهايبر ماركت العالمية الأكبر في مصر. عروض يومية على السلع الغذائية، اللحوم، الأجهزة، والأدوات المنزلية مع خدمة الشراء أونلاين وتوصيل الطلبات.",
    phone: "16061",
    phones: ["16061", "01006656669", "0235392000"],
    rating: 4.8,
    reviewsCount: 65000,
    googleBusinessUrl: "https://business.google.com/search?q=Carrefour+Egypt",
    googleMapsUrl: "https://maps.google.com/?q=Carrefour+Cairo+Festival+City",
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800",
    video: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-glass-of-drink-over-a-table-42790-large.mp4",
    services: [
      { n: "عروض البقالة الأسبوعية بخصومات تصل إلى 40%", p: "حسب العرض" },
      { n: "خدمة توصيل كارفور ناو خلال 60 دقيقة للباب", p: "30 ج.م" },
      { n: "نقاط برنامج ماي كلوب Carrefour MyCLUB لاسترداد كاش", p: "مجاناً" }
    ],
    hours: "09:00 ص - 12:00 منتصف الليل",
    lat: 30.0305,
    lng: 31.4082
  }
];
