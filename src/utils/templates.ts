import { ThemeName } from "../types";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  theme: ThemeName;
  fontDisplay: string;
  fontBody: string;
  layoutScheme: "classic" | "modern" | "minimal" | "traditional";
  accentColor: string; // Preview color for UI badge
  badgeText: string;
}

export const TEMPLATES: ReportTemplate[] = [
  {
    id: "royal-emerald",
    name: "الزمرد الملكي الفاخر",
    description: "تصميم زمردي فاخر ذو طابع رسمي وقور بلمسات ذهبية، مناسب للتقارير والبيانات الحكومية والوزارية الرصينة.",
    theme: "emerald",
    fontDisplay: "Cairo",
    fontBody: "Tajawal",
    layoutScheme: "traditional",
    accentColor: "#C9A227",
    badgeText: "الأكثر طلباً 👑"
  },
  {
    id: "royal-navy-gold",
    name: "الكحلي الملكي والذهب الإمبراطوري",
    description: "توليفة لونية تجمع بين الكحلي الحالك والذهب الساطع مع خط القاهرة العريض للعناوين، تضفي هيبة بصرية وقوة للبيانات الاستثمارية والسيادية.",
    theme: "royalNavy",
    fontDisplay: "Cairo",
    fontBody: "Almarai",
    layoutScheme: "classic",
    accentColor: "#E2B53E",
    badgeText: "مظهر سيادي 👑"
  },
  {
    id: "luminous-teal",
    name: "الفيروزي التنموي المعاصر",
    description: "طاقة لونية متجددة تجمع تدرجات البحر الفيروزي المضيء مع خط الإسكندرية (Alexandria) العصري. مناسب لخطط التنمية، البيئة، ريادة الأعمال، ومشاريع الشباب.",
    theme: "turquoise",
    fontDisplay: "Alexandria",
    fontBody: "Readex Pro",
    layoutScheme: "modern",
    accentColor: "#11B59C",
    badgeText: "استراتيجي ومستقبلي 🌟"
  },
  {
    id: "historic-bronze",
    name: "البرونزي الوقور العتيق",
    description: "يجمع عمق اللون الزيتي البرونزي الدافئ والخط المخطوط النبيل (Amiri) لتقديم التقارير السنوية الشاملة والمشاريع الثقافية والاجتماعية التاريخية بوقار متناهٍ.",
    theme: "bronze",
    fontDisplay: "Amiri",
    fontBody: "Tajawal",
    layoutScheme: "traditional",
    accentColor: "#BFA15F",
    badgeText: "وقار وتراث 🏛️"
  },
  {
    id: "desert-earth",
    name: "الترابي الصحراوي الأصيل",
    description: "مستوحى من ألوان الرمال الذهبية والصلصال والنحاس الدافئ، مقترناً بخط الريدكس المريح للعين. مناسب للتقارير الزراعية، شؤون الأراضي، والبيئة الريفية.",
    theme: "sandstone",
    fontDisplay: "Readex Pro",
    fontBody: "Tajawal",
    layoutScheme: "traditional",
    accentColor: "#D29F6C",
    badgeText: "ترابي طبيعي 🏜️"
  },
  {
    id: "cyber-platinum",
    name: "البلاتيني المالي المصقول",
    description: "نمط معدني بلاتيني بارد بلمسة كربونية ذكية وخط الإسكندرية الدقيق. يوفر واجهة بالغة الوضوح والأناقة لشرائح الأداء، الميزانيات، وجداول التدقيق والعملات.",
    theme: "platinum",
    fontDisplay: "Alexandria",
    fontBody: "Almarai",
    layoutScheme: "minimal",
    accentColor: "#94A3B8",
    badgeText: "تحليلي متقدم 🧪"
  },
  {
    id: "imperial-palace",
    name: "الأرجواني الإمبراطوري الفخم",
    description: "تصميم فني استثنائي يدمج البنفسجي الملكي المهيب مع خط المسيري (El Messiri) ذو الانحناءات الفنية الساحرة. يترك انطباعاً إبداعياً لا يُنسى في العروض والاحتفاليات.",
    theme: "imperialPurple",
    fontDisplay: "El Messiri",
    fontBody: "Tajawal",
    layoutScheme: "modern",
    accentColor: "#D1A7FC",
    badgeText: "إبداعي فريد ✨"
  },
  {
    id: "digital-tech",
    name: "الريادي التكنولوجي العصري",
    description: "نمط فحمي وفضي بلمسات هندسية عصرية وحواف متباينة للغاية. ممتاز للمشاريع التقنية والمصانع والبيانات المفتوحة.",
    theme: "charcoal",
    fontDisplay: "Alexandria",
    fontBody: "Readex Pro",
    layoutScheme: "modern",
    accentColor: "#B7C0C8",
    badgeText: "طابع تكنولوجي ⚡"
  },
  {
    id: "navy-corporate",
    name: "الأزرق المؤسسي الرصين",
    description: "نمط رسمي مريح للعين ومناسب لعرض الأرقام والإحصائيات بوضوح وجاذبية فائقة في الاجتماعات.",
    theme: "navy",
    fontDisplay: "Cairo",
    fontBody: "Almarai",
    layoutScheme: "classic",
    accentColor: "#C9A227",
    badgeText: "إحصائي متميز 📊"
  },
  {
    id: "lux-burgundy",
    name: "الوثائقي العنابي الأنيق",
    description: "تصميم بلون العنب الملكي الفاخر مع خطوط دافئة ناعمة تعكس القصص التنموية الملهمة والإنجازات الاستراتيجية.",
    theme: "burgundy",
    fontDisplay: "El Messiri",
    fontBody: "Tajawal",
    layoutScheme: "classic",
    accentColor: "#D4AF37",
    badgeText: "فخامة ملكية ✨"
  },
  {
    id: "heritage-amiri",
    name: "الديوان التراثي العتيق",
    description: "تصميم رصين مستوحى من الكتب والمخطوطات التراثية، يوظف خطاً تقليدياً بليغاً ومقروئية استثنائية.",
    theme: "burgundy",
    fontDisplay: "Amiri",
    fontBody: "Tajawal",
    layoutScheme: "traditional",
    accentColor: "#E9C972",
    badgeText: "تراثي عريق 🏛️"
  },
  {
    id: "sleek-geometric",
    name: "الصحفي الهندسي المعاصر",
    description: "نمط مالي صحفي بتبسيط هندسي كامل وحواف مصقولة، يركز على سهولة قراءة العناوين الكبيرة والمؤشرات بسرعة.",
    theme: "navy",
    fontDisplay: "Readex Pro",
    fontBody: "Readex Pro",
    layoutScheme: "minimal",
    accentColor: "#E4C766",
    badgeText: "حديث ومبسط 🎯"
  },
  {
    id: "retro-cairo-modern",
    name: "المنبر الثقافي الهجين",
    description: "يجمع دفء التراب الدافئ في طابع تقليدي مع جرأة خط القاهرة المتين. مثالي للتقارير الثقافية ومؤتمرات الشباب والتواصل المجتمعي.",
    theme: "sandstone",
    fontDisplay: "Cairo",
    fontBody: "Almarai",
    layoutScheme: "classic",
    accentColor: "#EABF96",
    badgeText: "شبابي مجتمعي 📣"
  },
  {
    id: "deep-emerald-royal",
    name: "الديوان الزمردي الأنيق",
    description: "تصميم زمردي داكن فخم جداً يعتمد خط Amiri المخطوط بدقة، مثالي للخطابات الرسمية والتقارير الرئاسية عالية المستوى.",
    theme: "emerald",
    fontDisplay: "Amiri",
    fontBody: "Almarai",
    layoutScheme: "traditional",
    accentColor: "#E4C766",
    badgeText: "رئاسي وقور ⚜️"
  }
];
