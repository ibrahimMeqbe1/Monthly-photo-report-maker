import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Slide, SlideType, ThemeName, UserProfile, SavedProject } from "./types";
import { THEMES } from "./utils/themes";
import { ReportCanvas } from "./components/ReportCanvas";
import { SlideList } from "./components/SlideList";
import { ThemeSelector } from "./components/ThemeSelector";
import { TemplateGallery } from "./components/TemplateGallery";
import { ReportTemplate } from "./utils/templates";
import { SlideEditor } from "./components/SlideEditor";
import { SaaSModals } from "./components/SaaSModals";
import { AppLogo } from "./components/AppLogo";
import { 
  Sparkles, Music, Trash2, Heart, HelpCircle, FileAudio, Save, 
  FolderOpen, FileDown, UploadCloud, User, LogIn, Database, Crown 
} from "lucide-react";
import { 
  saveProjectToCloud, 
  fetchUserProjectsFromCloud, 
  deleteProjectFromCloud 
} from "./lib/firebase";

// Generate unique ID
const generateId = () => "s" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();

// Built-in Premium Soundtracks for the ministry report
const BUILTIN_TRACKS = [
  {
    id: "chopin",
    name: "عزف شوبرت الكلاسيكي (وقار وإيحاء رسمي)",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Chopin_Nocturne_Op_9_No_2.mp3",
    filename: "Chopin_Nocturne_Op9_No2.mp3"
  },
  {
    id: "beethoven",
    name: "سوناتا ضوء القمر (عمق بليغ ورصانة)",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Moonlight_Sonata_1st_movement_-_Ludwig_van_Beethoven.mp3",
    filename: "Beethoven_Moonlight_Sonata.mp3"
  },
  {
    id: "bach",
    name: "مقطوعة باخ الموسيقية (حيوية ونشاط تنموي)",
    url: "https://upload.wikimedia.org/wikipedia/commons/d/df/Bach_-_Minuet_in_G_major%2C_BWV_Anh_114_piano.mp3",
    filename: "Bach_Minuet_in_G.mp3"
  }
];

// Premium Palestine-focused Ministry of Economy initial slide deck
const INITIAL_SLIDES: Slide[] = [
  {
    id: "init_intro",
    type: "intro",
    duration: 6,
    ministryName: "وزارة الاقتصاد الوطني — دولة فلسطين",
    mainTitle: "التقرير الإحصائي الشهري لحركة المعابر والمصانع",
    monthBadge: "تموز ٢٠٢٦",
    emblemText: "MNE",
    logoSize: 100,
    logoOpacity: 1,
    logoAnimation: "zoomIn",
    glowIntensity: 0.6,
    titleSize: 48,
    titleOpacity: 1,
  },
  {
    id: "init_section1",
    type: "section",
    duration: 5,
    stageNumber: "٠١",
    stageTitle: "المحور الأول: الرقابة والترخيص الصناعي",
    stageSubtitle: "تفاصيل الجولات التفتيشية ومنح رخص التشغيل للمصانع الفلسطينية الجديدة",
    titleSize: 42,
    subtitleOpacity: 0.9,
  },
  {
    id: "init_event1",
    type: "event",
    duration: 7,
    catLabel: "تنمية وتفتيش صناعي",
    title: "منح تراخيص تشغيل لـ ١٥ منشأة صناعية جديدة في الخليل",
    location: "مديرية الخليل — وزارة الاقتصاد الوطني",
    day: "١٢",
    month: "تموز",
    mediaList: [], // Users can upload images
    transition: "fade",
    kenBurnsEnabled: true,
    kenBurnsIntensity: 0.08,
    textSize: 28,
    textOpacity: 1,
  },
  {
    id: "init_event2",
    type: "event",
    duration: 7,
    catLabel: "حماية المستهلك",
    title: "إتلاف ٥ أطنان من السلع والمواد منتهية الصلاحية لحماية السوق المحلي",
    location: "طواقم حماية المستهلك — نابلس",
    day: "١٨",
    month: "تموز",
    mediaList: [],
    transition: "slideLeft",
    kenBurnsEnabled: true,
    kenBurnsIntensity: 0.06,
    textSize: 28,
    textOpacity: 1,
  },
  {
    id: "init_closing",
    type: "closing",
    duration: 8,
    heading: "ملخص النشاط الرقابي والاستثماري بالأرقام",
    ministryName: "وزارة الاقتصاد الوطني الفلسطيني — الإدارة العامة للاتصال والإعلام",
    stats: [
      { n: "١٥", l: "مصنع جديد مرخص" },
      { n: "٢٢٠+", l: "جولة رقابية تفتيشية" },
      { n: "٩٥٪", l: "نسبة استقرار الأسعار" },
    ],
    headingSize: 32,
    statsSize: 48,
    statsOpacity: 1,
  },
];

const BORDER_REPORT_SLIDES: Slide[] = [
  {
    id: "p2_intro",
    type: "intro",
    duration: 6,
    ministryName: "وزارة الاقتصاد الوطني — الإدارة العامة للمعابر والمنافذ",
    mainTitle: "حركة التبادل التجاري وتدفق السلع والواردات",
    monthBadge: "آب ٢٠٢٦",
    emblemText: "MNE",
    logoSize: 100,
    logoOpacity: 1,
    logoAnimation: "zoomIn",
    glowIntensity: 0.7,
    titleSize: 44,
    titleOpacity: 1,
  },
  {
    id: "p2_section1",
    type: "section",
    duration: 5,
    stageNumber: "٠١",
    stageTitle: "تأمين السلع وحركة الشاحنات التجارية",
    stageSubtitle: "تقرير شامل لحركة مرور شاحنات الإمداد والمساعدات عبر معابر المحافظات الجنوبية",
    titleSize: 40,
    subtitleOpacity: 0.9,
  },
  {
    id: "p2_event1",
    type: "event",
    duration: 7,
    catLabel: "تسهيل الاستيراد والتصدير",
    title: "تخليص وتمريد ٢٥٠+ شاحنة محملة بالدقيق والقمح والمواد الأساسية",
    location: "معبر كرم أبو سالم التجاري",
    day: "١٤",
    month: "آب",
    mediaList: [],
    transition: "fade",
    kenBurnsEnabled: true,
    kenBurnsIntensity: 0.07,
    textSize: 28,
    textOpacity: 1,
  },
  {
    id: "p2_closing",
    type: "closing",
    duration: 8,
    heading: "المؤشرات الكلية لحركة المعابر للسلع الأساسية",
    ministryName: "وزارة الاقتصاد الوطني — الإدارة العامة للاتصال والإعلام",
    stats: [
      { n: "٢٥٠+", l: "شاحنة دقيق وقمح مخلصة" },
      { n: "٤٥", l: "منشأة تجارية مستفيدة" },
      { n: "٩٢٪", l: "نسبة الاكتفاء من الحبوب" },
    ],
    headingSize: 32,
    statsSize: 46,
    statsOpacity: 1,
    statsStyle: "grid"
  },
];

export default function App() {
  const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<ThemeName>("emerald");
  
  // Template Gallery state
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>("royal-emerald");
  const [fontDisplay, setFontDisplay] = useState<string>("Cairo");
  const [fontBody, setFontBody] = useState<string>("Tajawal");

  const handleSelectTemplate = (template: ReportTemplate) => {
    setActiveTemplateId(template.id);
    setCurrentTheme(template.theme);
    setFontDisplay(template.fontDisplay);
    setFontBody(template.fontBody);
  };

  // SaaS User Profile state
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem("hema_saas_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      uid: "guest_user",
      email: "demo-user@hemagraphic.ps",
      displayName: "مستخدم تجريبي",
      plan: 'pro',
      exportQuotaLimit: 9999,
      exportQuotaCurrent: 0,
      watermarkCustomAllowed: true,
      videoDurationLimit: 600,
    };
  });

  // SaaS saved projects state with premium pre-populated Ministry templates
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => {
    try {
      const saved = localStorage.getItem("hema_saas_projects");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    
    // Default pre-populated ministry templates for pristine SaaS feeling
    const defaultProjects: SavedProject[] = [
      {
        id: "proj_mne_july",
        name: "تقرير تموز ٢٠٢٦ — وزارة الاقتصاد الوطني",
        slides: INITIAL_SLIDES,
        theme: "emerald",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "proj_mne_crossing",
        name: "تقرير حركة المعابر والتبادل التجاري — آب ٢٠٢٦",
        slides: BORDER_REPORT_SLIDES,
        theme: "navy",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];
    localStorage.setItem("hema_saas_projects", JSON.stringify(defaultProjects));
    return defaultProjects;
  });

  // Modal triggers
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Auto-sync saved projects to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("hema_saas_projects", JSON.stringify(savedProjects));
    } catch (e) {
      console.error(e);
    }
  }, [savedProjects]);
  
  // Media library state with localStorage persistence
  const [mediaLibrary, setMediaLibrary] = useState<{ src: string; type: "image" | "video"; name?: string }[]>(() => {
    try {
      const saved = localStorage.getItem("hema_media_library");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load media library from localStorage:", e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("hema_media_library", JSON.stringify(mediaLibrary));
    } catch (e) {
      console.error("Failed to save media library to localStorage:", e);
    }
  }, [mediaLibrary]);

  const handleAddToMediaLibrary = (item: { src: string; type: "image" | "video"; name?: string }) => {
    setMediaLibrary((prev) => {
      if (prev.some((existing) => existing.src === item.src)) return prev;
      return [item, ...prev];
    });
  };

  const handleRemoveFromMediaLibrary = (index: number) => {
    setMediaLibrary((prev) => prev.filter((_, idx) => idx !== index));
  };
  
  const handleClearMediaLibrary = () => {
    setMediaLibrary([]);
  };
  
  // Background music state
  const [globalAudio, setGlobalAudio] = useState<{
    data: string | null;
    filename: string;
    volume: number;
  }>({
    data: null,
    filename: "",
    volume: 0.5,
  });

  // Global Watermark & Branding state
  const [watermarkSettings, setWatermarkSettings] = useState<{
    enabled: boolean;
    type: "default" | "custom";
    src: string | null;
    position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  }>({
    enabled: true,
    type: "default",
    src: null,
    position: "bottom-right",
  });

  const [devMenuOpen, setDevMenuOpen] = useState(false);

  // Compute stats
  const totalDuration = slides.reduce((acc, s) => acc + (s.duration || 3), 0);

  // Handlers for managing slide list
  const handleSelectSlide = (index: number) => {
    setActiveIndex(index);
  };

  const handleAddSlide = (type: SlideType) => {
    let newSlide: Slide;

    switch (type) {
      case "intro":
        newSlide = {
          id: generateId(),
          type: "intro",
          duration: 6,
          ministryName: "المؤسسة أو الوزارة الراعية",
          mainTitle: "عنوان التقرير المصور الجديد",
          monthBadge: "تشرين ٢٠٢٦",
          emblemText: "NEW",
          logoSize: 100,
          logoOpacity: 1,
          logoAnimation: "fade",
          glowIntensity: 0.5,
          titleSize: 52,
          titleOpacity: 1,
        };
        break;
      case "section":
        newSlide = {
          id: generateId(),
          type: "section",
          duration: 5,
          stageNumber: "٠٢",
          stageTitle: "عنوان المحور الإداري الجديد",
          stageSubtitle: "وصف بليغ مختصر للمحور والفعاليات القادمة",
          titleSize: 44,
          subtitleOpacity: 0.9,
        };
        break;
      case "event":
        newSlide = {
          id: generateId(),
          type: "event",
          duration: 7,
          catLabel: "تصنيف النشاط",
          title: "عنوان النشاط الميداني وصياغة قوية للإنجاز",
          location: "رام الله — غزة — فلسطين",
          day: "٢٠",
          month: "تموز",
          mediaList: [],
          transition: "fade",
          kenBurnsEnabled: true,
          kenBurnsIntensity: 0.07,
          textSize: 30,
          textOpacity: 1,
        };
        break;
      case "closing":
        newSlide = {
          id: generateId(),
          type: "closing",
          duration: 8,
          heading: "أبرز إحصائيات وإنجازات الشهر",
          ministryName: "الإدارة العامة للعلاقات العامة والإعلام",
          stats: [
            { n: "١٠", l: "لقاءات عمل ثنائية" },
            { n: "٥", l: "اتفاقيات تعاون مبرمة" },
          ],
          headingSize: 32,
          statsSize: 46,
          statsOpacity: 1,
        };
        break;
    }

    setSlides((prev) => [...prev, newSlide]);
    setActiveIndex(slides.length); // Select newly added slide
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      alert("يجب أن يحتوي التقرير على شريحة واحدة على الأقل.");
      return;
    }
    const filtered = slides.filter((_, idx) => idx !== index);
    setSlides(filtered);
    if (activeIndex >= filtered.length) {
      setActiveIndex(filtered.length - 1);
    }
  };

  const handleDuplicateSlide = (index: number) => {
    const s = slides[index];
    const copy: Slide = {
      ...JSON.parse(JSON.stringify(s)),
      id: generateId(),
    };
    const updated = [...slides];
    updated.splice(index + 1, 0, copy);
    setSlides(updated);
    setActiveIndex(index + 1);
  };

  const handleMoveSlide = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setSlides(updated);
    setActiveIndex(targetIdx);
  };

  const handleUpdateSlide = (updated: Slide) => {
    setSlides((prev) => prev.map((s, idx) => (idx === activeIndex ? updated : s)));
  };

  const handleUpdateAllSlides = (updates: Partial<Slide>) => {
    setSlides((prev) => prev.map((s) => ({ ...s, ...updates })));
  };

  // AI slide generator callbacks
  const handleSlidesGenerated = (newSlides: Slide[]) => {
    // Merge or replace
    const confirmChoice = window.confirm(
      "تم توليد التقرير بالذكاء الاصطناعي بنجاح! هل ترغب في إضافة السلايدات الجديدة إلى التقرير الحالي؟ (اضغط إلغاء للبدء بتقرير جديد بالكامل)"
    );
    if (confirmChoice) {
      setSlides((prev) => [...prev, ...newSlides]);
      setActiveIndex(slides.length);
    } else {
      setSlides(newSlides);
      setActiveIndex(0);
    }
  };

  const handleRefineTextRequest = async (text: string, tone: string): Promise<string> => {
    try {
      const res = await fetch("/api/ai/refine-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone }),
      });
      if (!res.ok) {
        throw new Error("فشلت الصياغة التلقائية.");
      }
      const data = await res.json();
      return data.refinedText || text;
    } catch (err) {
      console.error(err);
      return text;
    }
  };

  // Auto-sync database projects when logged in via Firebase
  useEffect(() => {
    if (user.uid && user.uid !== "guest_user") {
      const loadCloudProjects = async () => {
        try {
          const cloudProjs = await fetchUserProjectsFromCloud(user.uid);
          if (cloudProjs && cloudProjs.length > 0) {
            setSavedProjects(cloudProjs);
          }
        } catch (err) {
          console.error("Error loading cloud projects:", err);
        }
      };
      loadCloudProjects();
    }
  }, [user.uid]);

  // SaaS Cloud Project Save & Load Handlers
  const handleLoadSaaSProject = (project: SavedProject) => {
    setSlides(project.slides);
    if (project.theme) {
      setCurrentTheme(project.theme);
    }
    if (project.fontDisplay) {
      setFontDisplay(project.fontDisplay);
    } else {
      setFontDisplay("Cairo");
    }
    if (project.fontBody) {
      setFontBody(project.fontBody);
    } else {
      setFontBody("Tajawal");
    }
    if (project.activeTemplateId !== undefined) {
      setActiveTemplateId(project.activeTemplateId);
    } else {
      setActiveTemplateId(null);
    }
    setActiveIndex(0);
    alert(`تم تحميل التقرير السحابي بنجاح: "${project.name}"`);
  };

  const handleSaveSaaSProject = async (name: string) => {
    const projectId = "proj_" + Math.random().toString(36).substring(2, 9);
    const newProj: SavedProject = {
      id: projectId,
      name: name,
      slides: slides,
      theme: currentTheme,
      fontDisplay: fontDisplay,
      fontBody: fontBody,
      activeTemplateId: activeTemplateId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setSavedProjects((prev) => [newProj, ...prev]);

    if (user.uid !== "guest_user") {
      try {
        await saveProjectToCloud(
          user.uid,
          projectId,
          name,
          slides,
          currentTheme,
          fontDisplay,
          fontBody,
          activeTemplateId
        );
      } catch (err) {
        console.error("Failed to save project to Firestore cloud:", err);
      }
    }
    
    alert(`تم حفظ التقرير السحابي بنجاح بمستودع SaaS الخاص بك باسم: \n"${name}"`);
  };

  const handleDeleteSaaSProject = async (id: string) => {
    setSavedProjects((prev) => prev.filter((p) => p.id !== id));
    
    if (user.uid !== "guest_user") {
      try {
        await deleteProjectFromCloud(id);
      } catch (err) {
        console.error("Failed to delete project from Firestore cloud:", err);
      }
    }
  };

  // Project Save & Load Handlers (JSON)
  const handleExportProject = () => {
    const projectData = {
      theme: currentTheme,
      fontDisplay,
      fontBody,
      activeTemplateId,
      slides,
      globalAudio,
      watermarkSettings,
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `مشروع_التقرير_الشهري_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.slides)) {
          setSlides(parsed.slides);
          if (parsed.theme) {
            setCurrentTheme(parsed.theme);
          }
          if (parsed.fontDisplay) {
            setFontDisplay(parsed.fontDisplay);
          } else {
            setFontDisplay("Cairo");
          }
          if (parsed.fontBody) {
            setFontBody(parsed.fontBody);
          } else {
            setFontBody("Tajawal");
          }
          if (parsed.activeTemplateId !== undefined) {
            setActiveTemplateId(parsed.activeTemplateId);
          } else {
            setActiveTemplateId(null);
          }
          if (parsed.globalAudio) {
            setGlobalAudio(parsed.globalAudio);
          }
          if (parsed.watermarkSettings) {
            setWatermarkSettings(parsed.watermarkSettings);
          }
          setActiveIndex(0);
          alert("تم استيراد مشروع التقرير بنجاح ومزامنة السلايدات والموسيقى!");
        } else {
          alert("صيغة الملف غير صحيحة. يجب أن يحتوي الملف على قائمة شرائح صالحة.");
        }
      } catch (err) {
        console.error(err);
        alert("فشل قراءة ملف المشروع. يرجى التأكد من اختيار ملف JSON صحيح ومصدر من هذا الموقع.");
      }
    };
    reader.readAsText(file);
  };

  // Upload background music files
  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setGlobalAudio({
          data: event.target.result as string,
          filename: file.name,
          volume: 0.6,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMusic = () => {
    setGlobalAudio({
      data: null,
      filename: "",
      volume: 0.5,
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0f0c] text-[#F3EEE1] flex flex-col font-sans" dir="rtl">
      {/* Dynamic Luxury Navigation header */}
      <header className="border-b border-[#C9A227]/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-b from-[#152820] to-transparent">
        <div className="flex items-center gap-3">
          <AppLogo size={42} />
          <div>
            <div className="text-[11px] font-mono tracking-wider text-[#C9A227] font-bold uppercase">
              HEMA GRAPHIC — ADVANCED VIDEO ENGINE
            </div>
            <h1 className="font-display font-black text-lg md:text-xl text-white">
              صانع التقارير <span className="text-[10px] bg-amber-500/10 text-[#E4C766] border border-[#C9A227]/25 px-2 py-0.5 rounded-full mr-2">SaaS Cloud v2</span>
            </h1>
          </div>
        </div>

        {/* Global info and SaaS management console */}
        <div className="flex items-center flex-wrap gap-3">
          {/* A. Saved Projects Button */}
          <button
            onClick={() => setShowProjects(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e1f18] hover:bg-[#152820] border border-amber-500/15 hover:border-[#C9A227] text-gray-200 hover:text-white text-xs font-bold transition cursor-pointer"
            title="إدارة المشاريع السحابية"
          >
            <Database className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>المستودع السحابي ({savedProjects.length})</span>
          </button>

          {/* B. Subscription/Quota Badge */}
          <div 
            onClick={() => setShowUpgrade(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer border bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-950/60 transition"
            title="الحساب مفعل بالكامل بالباقة الاحترافية مجاناً"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>الباقة الاحترافية غير المحدودة ⚡</span>
          </div>

          {/* C. User Auth status */}
          {user.uid === "guest_user" ? (
            <button
              onClick={() => setShowAuth(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/50 hover:bg-emerald-950 border border-emerald-900/40 text-gray-300 hover:text-[#E4C766] text-xs font-bold transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>تسجيل الدخول السحابي</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-[#0e1f18] border border-amber-500/10 px-3 py-1.5 rounded-xl text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-gray-300 font-bold">{user.displayName}</span>
            </div>
          )}

          <div className="w-px h-6 bg-amber-500/10" />

          {/* D. Telemetry Info */}
          <div className="flex items-center gap-4 bg-[#152820]/80 border border-amber-500/10 px-4 py-2 rounded-xl text-xs">
            <div>
              الشرائح: <span className="text-[#E4C766] font-bold font-mono">{slides.length}</span>
            </div>
            <div className="w-px h-4 bg-amber-500/10" />
            <div>
              مدة الفيديو: <span className="text-[#E4C766] font-bold font-mono">{totalDuration.toFixed(1)}s</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main workspace container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Slide timeline list and template picking (3 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
          className="lg:col-span-3 flex flex-col gap-6 w-full"
        >
          <SlideList
            slides={slides}
            activeIndex={activeIndex}
            onSelectSlide={handleSelectSlide}
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
            onDuplicateSlide={handleDuplicateSlide}
            onMoveSlide={handleMoveSlide}
          />

          <TemplateGallery
            activeTemplateId={activeTemplateId}
            onSelectTemplate={handleSelectTemplate}
          />

          <ThemeSelector
            currentTheme={currentTheme}
            onThemeChange={(themeName) => {
              setCurrentTheme(themeName);
              setActiveTemplateId(null);
            }}
          />

          {/* Project File Management Card */}
          <div className="bg-[#152820] border border-amber-500/10 p-5 rounded-xl flex flex-col gap-3">
            <h3 className="font-display text-xs font-bold text-[#E4C766] flex items-center gap-2 border-r-2 border-[#C9A227] pr-2.5">
              <Save className="w-4 h-4 text-[#C9A227]" />
              <span>إدارة ملفات مشروع التقرير</span>
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
              حفظ وتصدير التعديلات الحالية كملف مشروع للعودة والتعديل عليه في المستقبل دون فقدان أي بيانات.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-1">
              {/* Export Button */}
              <button
                onClick={handleExportProject}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#C9A227]/10 hover:bg-[#C9A227]/20 border border-[#C9A227]/30 text-[#E4C766] text-xs font-bold font-sans transition cursor-pointer"
                title="تصدير مشروع التقرير"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>تصدير المشروع</span>
              </button>

              {/* Import Button */}
              <label className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-900/30 text-gray-200 text-xs font-bold font-sans transition cursor-pointer relative">
                <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>استيراد مشروع</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportProject}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </motion.div>

        {/* CENTER COLUMN: Live canvas preview player, music upload, instructions (5 cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-5 flex flex-col gap-6 items-center w-full"
        >
          <ReportCanvas
            slides={slides}
            theme={{
              ...THEMES[currentTheme],
              fontDisplay: fontDisplay,
              fontBody: fontBody
            }}
            activeSlideIndex={activeIndex}
            onActiveSlideChange={setActiveIndex}
            globalAudio={globalAudio}
            onUpdateGlobalAudio={setGlobalAudio}
            watermarkSettings={watermarkSettings}
            onWatermarkSettingsChange={setWatermarkSettings}
          />

          {/* Quick instructions hints */}
          <div className="w-full max-w-[720px] bg-emerald-950/10 border border-emerald-900/20 p-5 rounded-xl leading-relaxed text-xs text-gray-400 font-sans">
            <h4 className="font-display font-bold text-gray-200 mb-2.5 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#C9A227]" />
              <span>نصائح لإعداد تقارير فيديو ممتازة</span>
            </h4>
            <ul className="list-decimal list-inside space-y-2 text-gray-400">
              <li>قم برفع صور أو فيديوهات واضحة ونظيفة لكل حدث لتفعيل تأثير حركة الكاميرا (Ken Burns).</li>
              <li>استخدم أداة الصياغة الذكية وخيارات التنسيق بداخل محرر الشريحة لتعديل نصوص محددة.</li>
              <li>يرجى استخدام متصفح <b className="text-gray-200 font-semibold">Chrome / Edge</b> للحصول على دمج صوتي وموسيقي فائق أثناء تصدير الفيديو النهائي.</li>
              <li>الفيديو النهائي يتم تنزيله بصيغة <b className="text-gray-200 font-semibold">WebM</b> عالية الدقة (720p). يمكنك نقله مباشرة إلى CapCut أو Premiere لإضافة فلاتر إضافية وتصديره MP4 نهائي إن لزم.</li>
            </ul>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Slide editor (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6 w-full">
          {slides[activeIndex] && (
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <SlideEditor
                slide={slides[activeIndex]}
                onUpdateSlide={handleUpdateSlide}
                onRefineTextRequest={handleRefineTextRequest}
                onUpdateAllSlides={handleUpdateAllSlides}
                mediaLibrary={mediaLibrary}
                onAddToMediaLibrary={handleAddToMediaLibrary}
                onRemoveFromMediaLibrary={handleRemoveFromMediaLibrary}
                onClearMediaLibrary={handleClearMediaLibrary}
              />
            </motion.div>
          )}
        </div>
      </main>

      {/* Luxury Footer panel */}
      <footer className="border-t border-[#C9A227]/20 py-6 px-4 text-center text-xs text-gray-500 font-sans bg-gradient-to-t from-[#0e1f18] to-transparent">
        <div className="flex items-center justify-center gap-1 mb-2">
          <span>تم التطوير بكل</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
          <span>بواسطة</span>
          <span
            onClick={() => setDevMenuOpen(!devMenuOpen)}
            className="text-[#E4C766] font-bold underline decoration-dotted underline-offset-4 cursor-pointer hover:text-[#C9A227] transition"
          >
            Eng: Ibrahim Meqbel
          </span>
        </div>
        <p className="text-gray-600 mb-4 select-none font-mono">© 2026 Hema Graphic advanced. All rights reserved.</p>

        {/* Hidden contact dropdown popup */}
        {devMenuOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-[#152820] border border-[#C9A227]/30 rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-150">
              <h4 className="font-display font-black text-base text-[#E4C766] mb-2">تواصل مع المطور</h4>
              <p className="text-xs text-gray-400 mb-5 leading-relaxed font-sans">
                المهندس إبراهيم مقبل - مطور برمجيات ومهندس حلول ومصمم بصري للتقنيات التفاعلية والأنظمة الرقمية.
              </p>
              
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0A66C2] hover:opacity-90 py-2.5 px-3 rounded-xl text-xs font-bold text-white font-sans transition"
                >
                  LinkedIn
                </a>
                <a
                  href="mailto:7ema.meqbe1@gmail.com"
                  className="bg-[#D64545] hover:opacity-90 py-2.5 px-3 rounded-xl text-xs font-bold text-white font-sans transition"
                >
                  البريد الإلكتروني
                </a>
                <a
                  href="https://wa.me/970597163242"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:opacity-90 py-2.5 px-3 rounded-xl text-xs font-bold text-emerald-950 font-sans transition"
                >
                  واتساب مباشر
                </a>
                <a
                  href="https://ibrahimmeqbel.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1FA97A] hover:opacity-90 py-2.5 px-3 rounded-xl text-xs font-bold text-white font-sans transition"
                >
                  الموقع الشخصي
                </a>
                <a
                  href="https://www.behance.net/ibrahimmeqbel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1769FF] hover:opacity-90 py-2.5 px-3 rounded-xl text-xs font-bold text-white font-sans transition"
                >
                  Behance
                </a>
                <a
                  href="https://github.com/ibrahimMeqbe1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#161B22] hover:opacity-90 py-2.5 px-3 rounded-xl text-xs font-bold text-white font-sans border border-white/10 transition"
                >
                  GitHub
                </a>
              </div>

              <button
                onClick={() => setDevMenuOpen(false)}
                className="mt-6 w-full py-2 bg-emerald-950/60 border border-amber-500/10 rounded-xl text-xs text-gray-300 font-sans hover:bg-emerald-950 cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        )}
      </footer>

      <SaaSModals
        user={user}
        setUser={setUser}
        savedProjects={savedProjects}
        onLoadProject={handleLoadSaaSProject}
        onSaveProject={handleSaveSaaSProject}
        onDeleteProject={handleDeleteSaaSProject}
        showUpgrade={showUpgrade}
        setShowUpgrade={setShowUpgrade}
        showProjects={showProjects}
        setShowProjects={setShowProjects}
        showAuth={showAuth}
        setShowAuth={setShowAuth}
      />
    </div>
  );
}
