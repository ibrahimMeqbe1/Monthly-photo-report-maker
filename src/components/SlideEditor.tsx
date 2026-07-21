import React, { useState } from "react";
import { Slide, StatItem, MediaItem } from "../types";
import { Sparkles, Loader2, Upload, Trash2, Plus, Sliders, PlaySquare } from "lucide-react";

interface SlideEditorProps {
  slide: Slide;
  onUpdateSlide: (updated: Slide) => void;
  onRefineTextRequest: (text: string, tone: string) => Promise<string>;
  onUpdateAllSlides?: (updates: Partial<Slide>) => void;
  mediaLibrary: { src: string; type: "image" | "video"; name?: string }[];
  onAddToMediaLibrary: (item: { src: string; type: "image" | "video"; name?: string }) => void;
  onRemoveFromMediaLibrary: (index: number) => void;
  onClearMediaLibrary: () => void;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({
  slide,
  onUpdateSlide,
  onRefineTextRequest,
  onUpdateAllSlides,
  mediaLibrary,
  onAddToMediaLibrary,
  onRemoveFromMediaLibrary,
  onClearMediaLibrary,
}) => {
  const [refiningField, setRefiningField] = useState<string | null>(null);
  const [refineTone, setRefineTone] = useState("official");

  const updateField = (key: string, val: any) => {
    onUpdateSlide({
      ...slide,
      [key]: val,
    } as Slide);
  };

  const handleRefine = async (
    fieldKey: string,
    currentText: string,
    onRefineComplete?: (refined: string) => void
  ) => {
    if (!currentText || !currentText.trim()) return;
    setRefiningField(fieldKey);
    try {
      const refined = await onRefineTextRequest(currentText, refineTone);
      if (onRefineComplete) {
        onRefineComplete(refined);
      } else {
        updateField(fieldKey, refined);
      }
    } catch (err) {
      console.error("Failed to refine text:", err);
    } finally {
      setRefiningField(null);
    }
  };

  // Image/Logo files handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const logoSrc = event.target.result as string;
        updateField("logoData", logoSrc);
        onAddToMediaLibrary({
          src: logoSrc,
          type: "image",
          name: file.name || "شعار مؤسساتي"
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Media items handler (for Event slide)
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentMediaList = (slide as any).mediaList || [];
    
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const isVideo = file.type.startsWith("video/");
          const srcData = event.target.result as string;
          const newMedia: MediaItem = {
            type: isVideo ? "video" : "image",
            src: srcData,
          };
          updateField("mediaList", [newMedia, ...currentMediaList]);
          onAddToMediaLibrary({
            src: srcData,
            type: isVideo ? "video" : "image",
            name: file.name || "مرفق توثيقي"
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMediaItem = (idx: number) => {
    const currentMediaList = [...((slide as any).mediaList || [])];
    currentMediaList.splice(idx, 1);
    updateField("mediaList", currentMediaList);
  };

  // Statistics handlers (for Closing slide)
  const handleStatChange = (idx: number, key: keyof StatItem, val: string) => {
    const stats = [...((slide as any).stats || [])];
    stats[idx] = { ...stats[idx], [key]: val };
    updateField("stats", stats);
  };

  const addStatItem = () => {
    const stats = [...((slide as any).stats || [])];
    if (stats.length >= 4) {
      alert("الحد الأقصى للإحصائيات هو 4 بطاقات فقط لضمان توازن التصميم.");
      return;
    }
    stats.push({ n: "٠", l: "تسمية جديدة" });
    updateField("stats", stats);
  };

  const removeStatItem = (idx: number) => {
    const stats = [...((slide as any).stats || [])];
    stats.splice(idx, 1);
    updateField("stats", stats);
  };

  // Shared Sparkle input helper
  const renderTextInputWithRefiner = (
    label: string,
    fieldKey: string,
    value: string,
    placeholder = "",
    onValueChange?: (val: string) => void,
    onRefineComplete?: (val: string) => void
  ) => {
    const isRefining = refiningField === fieldKey;

    const handleApplyFormat = (formatType: "bold" | "italic" | "color" | "strip", colorHex?: string) => {
      const inputEl = document.getElementById(`input-${fieldKey}`) as HTMLInputElement | null;
      if (!inputEl) return;

      const start = inputEl.selectionStart ?? 0;
      const end = inputEl.selectionEnd ?? 0;
      const text = inputEl.value;
      const selectedText = text.substring(start, end);

      let newValue = "";
      let selectionOffset = 0;
      let selectionLen = 0;

      if (formatType === "strip") {
        // Strip all formatting codes: <color=...>, </color>, **, *
        const cleaned = text
          .replace(/<color=[^>]+>/gi, "")
          .replace(/<\/color>/gi, "")
          .replace(/\*\*/g, "")
          .replace(/\*/g, "");
        newValue = cleaned;
        selectionOffset = 0;
        selectionLen = cleaned.length;
      } else if (formatType === "color" && colorHex) {
        if (selectedText.length > 0) {
          // Check if selected text is already fully wrapped in a color tag
          const colorTagRegex = /^<color=([^>]+)>([\s\S]*)<\/color>$/i;
          const match = selectedText.match(colorTagRegex);
          if (match) {
            const innerText = match[2];
            const formatted = `<color=${colorHex}>${innerText}</color>`;
            newValue = text.substring(0, start) + formatted + text.substring(end);
            selectionLen = formatted.length;
          } else {
            const formatted = `<color=${colorHex}>${selectedText}</color>`;
            newValue = text.substring(0, start) + formatted + text.substring(end);
            selectionLen = formatted.length;
          }
          selectionOffset = start;
        } else {
          // No active selection
          alert("💡 يرجى تظليل/تحديد الكلمة أو العبارة المراد تلوينها في صندوق النص أولاً، ثم اضغط على اللون لتطبيق التلوين بصرياً!");
          return;
        }
      } else {
        if (selectedText.length === 0) {
          alert("💡 يرجى تظليل/تحديد الكلمة أو العبارة المراد جعلها عريضة أو مائلة أولاً!");
          return;
        }
        let formatted = "";
        if (formatType === "bold") {
          formatted = `**${selectedText}**`;
        } else if (formatType === "italic") {
          formatted = `*${selectedText}*`;
        }
        newValue = text.substring(0, start) + formatted + text.substring(end);
        selectionOffset = start;
        selectionLen = formatted.length;
      }
      
      if (onValueChange) {
        onValueChange(newValue);
      } else {
        updateField(fieldKey, newValue);
      }

      // Restore focus and selection
      setTimeout(() => {
        inputEl.focus();
        inputEl.setSelectionRange(selectionOffset, selectionOffset + selectionLen);
      }, 50);
    };

    return (
      <div className="flex flex-col gap-1.5 mb-4 w-full">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <label className="text-xs text-gray-400 font-sans font-medium">
            {label}
          </label>
          
          {/* Elegant Text Formatting Toolbar */}
          <div className="flex items-center gap-1.5 bg-[#091410] border border-amber-500/15 px-2 py-0.5 rounded-md shadow-inner">
            <button
              type="button"
              onClick={() => handleApplyFormat("bold")}
              className="px-1.5 py-0.5 text-[10px] font-bold text-gray-400 hover:text-[#E4C766] hover:bg-emerald-950/60 rounded cursor-pointer transition font-serif"
              title="خط عريض (Bold) - حدد جزءاً أولاً"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => handleApplyFormat("italic")}
              className="px-1.5 py-0.5 text-[10px] italic text-gray-400 hover:text-[#E4C766] hover:bg-emerald-950/60 rounded cursor-pointer transition font-serif"
              title="خط مائل (Italic) - حدد جزءاً أولاً"
            >
              I
            </button>
            <div className="w-[1px] h-3 bg-amber-500/10 mx-0.5"></div>
            <button
              type="button"
              onClick={() => handleApplyFormat("color", "#C9A227")}
              className="w-2 rounded-full h-2 bg-[#C9A227] hover:scale-125 transition cursor-pointer"
              title="تلوين الكلمة المحددة بالذهبي"
            />
            <button
              type="button"
              onClick={() => handleApplyFormat("color", "#FFFFFF")}
              className="w-2 rounded-full h-2 bg-white border border-gray-600 hover:scale-125 transition cursor-pointer"
              title="تلوين الكلمة المحددة بالأبيض"
            />
            <button
              type="button"
              onClick={() => handleApplyFormat("color", "#38BDF8")}
              className="w-2 rounded-full h-2 bg-sky-400 hover:scale-125 transition cursor-pointer"
              title="تلوين الكلمة المحددة بالأزرق السماوي"
            />
            <button
              type="button"
              onClick={() => handleApplyFormat("color", "#F43F5E")}
              className="w-2 rounded-full h-2 bg-rose-500 hover:scale-125 transition cursor-pointer"
              title="تلوين الكلمة المحددة بالأحمر"
            />
            <button
              type="button"
              onClick={() => handleApplyFormat("color", "#10B981")}
              className="w-2 rounded-full h-2 bg-[#10B981] hover:scale-125 transition cursor-pointer"
              title="تلوين الكلمة المحددة بالأخضر"
            />
            <div className="w-[1px] h-3 bg-amber-500/10 mx-0.5"></div>
            <button
              type="button"
              onClick={() => handleApplyFormat("strip")}
              className="px-1.5 py-0.5 text-[9px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded cursor-pointer transition font-sans flex items-center"
              title="تنظيف وتصفية النص من جميع الأكواد والألوان المخصصة"
            >
              🧹 تنظيف
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            id={`input-${fieldKey}`}
            value={value}
            onChange={(e) => onValueChange ? onValueChange(e.target.value) : updateField(fieldKey, e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-[#0e1f18] border border-amber-500/10 rounded-lg px-3 py-2 text-xs font-sans text-gray-200 focus:outline-none focus:border-[#C9A227]"
          />
          <button
            type="button"
            onClick={() => handleRefine(fieldKey, value, onRefineComplete)}
            disabled={isRefining || !value.trim()}
            className="px-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-950 border border-[#C9A227]/20 hover:border-[#C9A227] text-[#E4C766] transition flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="تحسين بليغ بالذكاء الاصطناعي"
          >
            {isRefining ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#152820] border border-amber-500/10 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center gap-2 border-r-2 border-[#C9A227] pr-2.5">
        <Sliders className="w-4 h-4 text-[#E4C766]" />
        <h3 className="font-display text-sm font-bold text-[#E4C766]">لوحة تعديل الشريحة</h3>
      </div>

      {/* Tone preset for single field text refinements */}
      <div className="flex items-center justify-between gap-2 bg-[#0e1f18] p-2 rounded-lg border border-amber-500/5 mb-2">
        <span className="text-[11px] text-gray-400 font-sans">أسلوب التحسين للذكاء الاصطناعي:</span>
        <select
          value={refineTone}
          onChange={(e) => setRefineTone(e.target.value)}
          className="bg-transparent text-[11px] font-sans text-[#E4C766] focus:outline-none cursor-pointer"
        >
          <option value="official">رسمي وبليغ</option>
          <option value="exciting">حماسي ومؤثر</option>
          <option value="minimal">بسيط ومباشر</option>
        </select>
      </div>

      <div className="max-h-[58vh] overflow-y-auto pl-1 pr-0.5">
        {/* 🕒 متحكم السرعة والانتقالات الشامل */}
        <div className="bg-[#0e1f18] border border-[#C9A227]/30 p-3.5 rounded-xl flex flex-col gap-3 mb-4 shadow-inner">
          <div className="flex items-center gap-1.5 border-b border-amber-500/10 pb-2">
            <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
            <span className="text-xs font-bold text-[#E4C766] font-sans">سرعة العرض والانتقالات السينمائية</span>
          </div>

          {/* Slide Duration Control */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-sans text-gray-300">
              <span>مدة عرض هذه الشريحة:</span>
              <span className="text-[#E4C766] font-bold font-mono">{slide.duration} ثوانٍ</span>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              step={0.5}
              value={slide.duration || 5}
              onChange={(e) => updateField("duration", parseFloat(e.target.value))}
              className="h-1 bg-[#152820] rounded-lg appearance-none cursor-pointer accent-[#C9A227] w-full"
            />
            {onUpdateAllSlides && (
              <button
                type="button"
                onClick={() => {
                  onUpdateAllSlides({ duration: slide.duration });
                  alert(`تم بنجاح تطبيق مدة العرض (${slide.duration} ثوانٍ) على جميع الشرائح بالكامل!`);
                }}
                className="text-[10px] text-[#C9A227] font-bold text-right hover:text-[#E4C766] transition mt-1.5 flex items-center justify-end gap-1 cursor-pointer bg-[#C9A227]/5 hover:bg-[#C9A227]/10 py-1 px-2 rounded border border-[#C9A227]/10"
              >
                <span>⚙️ تطبيق هذه السرعة (المدة) على كافة الشرائح بالكامل</span>
              </button>
            )}
          </div>

          {/* Slide Transition Control */}
          <div className="flex flex-col gap-1.5 mt-1 border-t border-amber-500/5 pt-2.5">
            <div className="flex justify-between text-xs font-sans text-gray-300">
              <span>تأثير الانتقال (Transition) عند الدخول:</span>
              <span className="text-[#E4C766] font-bold text-[10px] bg-[#152820] px-1.5 py-0.5 rounded border border-amber-500/5">
                {slide.transition === "crossFade" ? "تلاشي متقاطع" :
                 slide.transition === "wipe" ? "مسح خطي مذهب" :
                 slide.transition === "slideLeft" ? "انزلاق لليسار" :
                 slide.transition === "slideRight" ? "انزلاق لليمين" :
                 slide.transition === "slideUp" ? "انزلاق للأعلى" :
                 slide.transition === "slideDown" ? "انزلاق للأسفل" :
                 slide.transition === "zoomIn" ? "تقريب وتكبير" :
                 slide.transition === "zoomOut" ? "تبعيد وتصغير" :
                 slide.transition === "shutter" ? "شيش وبوابات حركية" :
                 slide.transition === "glitch" ? "تسريب ضوئي رقمي" :
                 slide.transition === "flip" ? "انعكاس ثلاثي الأبعاد" :
                 slide.transition === "none" ? "انتقال فوري" : "تلاشي تدريجي"}
              </span>
            </div>
            <select
              value={slide.transition || "fade"}
              onChange={(e) => updateField("transition", e.target.value)}
              className="w-full bg-[#152820] border border-amber-500/10 rounded-lg px-2.5 py-1.5 text-xs font-sans text-gray-200 focus:outline-none cursor-pointer focus:border-[#C9A227]"
            >
              <option value="fade">تلاشي تدريجي ناعم (Fade)</option>
              <option value="crossFade">تلاشي متقاطع ذائب (Cross-Fade)</option>
              <option value="wipe">مسح خطي مذهب فاخر (Wipe RTL)</option>
              <option value="slideLeft">انزلاق سينمائي لليسار (Slide Left)</option>
              <option value="slideRight">انزلاق سينمائي لليمين (Slide Right)</option>
              <option value="slideUp">انزلاق رأسي للأعلى (Slide Up)</option>
              <option value="slideDown">انزلاق رأسي للأسفل (Slide Down)</option>
              <option value="zoomIn">تقريب عدسة مرن (Elastic Zoom In)</option>
              <option value="zoomOut">تبعيد عدسة عريض (Zoom Out Back)</option>
              <option value="shutter">مسح الستار القطري الشيش (Diagonal Shutter)</option>
              <option value="glitch">تسريب ضوئي رقمي خاطف (Digital Glitch Leak)</option>
              <option value="flip">انعكاس بطاقات ثلاثي الأبعاد (3D Perspective Flip)</option>
              <option value="none">انتقال فوري مباشر (Cut / None)</option>
            </select>
            {onUpdateAllSlides && (
              <button
                type="button"
                onClick={() => {
                  onUpdateAllSlides({ transition: slide.transition || "fade" });
                  alert(`تم بنجاح تطبيق تأثير الانتقال على جميع الشرائح بالكامل!`);
                }}
                className="text-[10px] text-[#C9A227] font-bold text-right hover:text-[#E4C766] transition mt-1.5 flex items-center justify-end gap-1 cursor-pointer bg-[#C9A227]/5 hover:bg-[#C9A227]/10 py-1 px-2 rounded border border-[#C9A227]/10"
              >
                <span>✨ تطبيق هذا التأثير على كافة المشاهد والفواصل</span>
              </button>
            )}
          </div>
        </div>

        {/* 🎭 Cinematic Animation Preset Select */}
        <div className="bg-[#0e1f18] border border-amber-500/10 p-3.5 rounded-xl flex flex-col gap-2 mb-4">
          <div className="flex justify-between items-center text-xs font-sans text-gray-300">
            <span className="font-bold text-[#E4C766] flex items-center gap-1">
              <span>🎭</span>
              <span>حركة العناصر (Animation Preset):</span>
            </span>
            <span className="text-gray-400 font-mono text-[10px]">لكل العناصر</span>
          </div>
          <select
            value={(slide as any).animationPreset || "classic"}
            onChange={(e) => updateField("animationPreset", e.target.value)}
            className="w-full bg-[#152820] border border-amber-500/10 rounded-lg px-2.5 py-1.5 text-xs font-sans text-gray-200 focus:outline-none cursor-pointer focus:border-[#C9A227]"
          >
            <option value="classic">تلاشي وتحرك عمودي هادئ (Classic Fade-In)</option>
            <option value="zoom">تكبير تدريجي سينمائي (Ken Burns Cinematic Zoom)</option>
            <option value="slideRight">انزلاق سلس من اليمين (Slide Right Entrance)</option>
            <option value="slideLeft">انزلاق سلس من اليسار (Slide Left Entrance)</option>
            <option value="fadeOnly">تلاشي نقي بدون إزاحة (Pure Dissolve)</option>
            <option value="bounce">ظهور ارتدادي نابض (Elastic Bounce)</option>
            <option value="spring">تأثير زنبرك مرن (Springy Snap)</option>
            <option value="none">بدون حركة داخلية (None / Stable)</option>
          </select>
          <p className="text-[10px] text-gray-500 leading-relaxed font-sans pr-1">
            يتحكم هذا الخيار في الحركة الفردية لعناصر هذه الشريحة (النصوص والأشكال والبطاقات) عند دخولها لخدمة المشهد بصرياً.
          </p>
        </div>

        {/* ================= 1. INTRO TYPE ================= */}
        {slide.type === "intro" && (
          <>
            {renderTextInputWithRefiner("اسم الوزارة أو المؤسسة", "ministryName", slide.ministryName)}
            {renderTextInputWithRefiner("العنوان الرئيسي للتقرير", "mainTitle", slide.mainTitle)}
            {renderTextInputWithRefiner("شارة الشهر (مثال: تموز ٢٠٢٦)", "monthBadge", slide.monthBadge)}
            
            {/* Logo upload block */}
            <div className="flex flex-col gap-2 mb-4">
              <label className="text-xs text-gray-400 font-sans">شعار المؤسسة</label>
              <div className="flex items-center gap-3">
                {slide.logoData ? (
                  <div className="relative w-14 h-14 rounded-lg border border-amber-500/20 overflow-hidden bg-[#0e1f18] flex items-center justify-center p-1">
                    <img src={slide.logoData} alt="Logo" className="w-full h-full object-contain" />
                    <button
                      onClick={() => updateField("logoData", undefined)}
                      className="absolute top-0.5 right-0.5 bg-rose-950 p-1 rounded hover:bg-rose-900 text-rose-300 cursor-pointer"
                      title="حذف الشعار"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="relative w-14 h-14 rounded-lg border border-dashed border-amber-500/10 bg-[#0e1f18] flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-500" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <span className="text-[11px] text-gray-400 block font-sans">شعار رسمي بخلفية شفافة (PNG)</span>
                  {renderTextInputWithRefiner("أحرف بديلة للشعار", "emblemText", slide.emblemText)}
                </div>
              </div>
            </div>

            {/* Typography sliders */}
            <h4 className="text-xs font-sans font-bold text-[#E4C766] mb-3 mt-4 flex items-center gap-1">
              <PlaySquare className="w-3.5 h-3.5" />
              <span>مؤثرات الشعار والعنوان</span>
            </h4>

            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs text-gray-400 font-sans">حركة دخول الشعار</label>
              <select
                value={slide.logoAnimation}
                onChange={(e) => updateField("logoAnimation", e.target.value)}
                className="w-full bg-[#0e1f18] border border-amber-500/10 rounded-lg px-3 py-2 text-xs font-sans text-gray-200 focus:outline-none cursor-pointer"
              >
                <option value="fade">ظهور تدريجي ناعم (Fade)</option>
                <option value="zoomIn">تكبير مع ارتداد (Zoom In)</option>
                <option value="dropIn">سقوط من الأعلى (Drop In)</option>
                <option value="rotateIn">دوران مع تكبير (Rotate In)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 mb-3">
              <div className="flex justify-between text-xs font-mono text-gray-400 select-none">
                <span>حجم الشعار:</span>
                <span className="text-[#E4C766]">{slide.logoSize}px</span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                value={slide.logoSize}
                onChange={(e) => updateField("logoSize", parseInt(e.target.value, 10))}
                className="h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
              />
            </div>

            <div className="flex flex-col gap-1.5 mb-3">
              <div className="flex justify-between text-xs font-mono text-gray-400 select-none">
                <span>شدة توهج الخلفية:</span>
                <span className="text-[#E4C766]">{Math.round(slide.glowIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={slide.glowIntensity}
                onChange={(e) => updateField("glowIntensity", parseFloat(e.target.value))}
                className="h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
              />
            </div>

            <div className="flex flex-col gap-1.5 mb-3">
              <div className="flex justify-between text-xs font-mono text-gray-400 select-none">
                <span>حجم العنوان الرئيسي:</span>
                <span className="text-[#E4C766]">{slide.titleSize}px</span>
              </div>
              <input
                type="range"
                min={30}
                max={80}
                value={slide.titleSize}
                onChange={(e) => updateField("titleSize", parseInt(e.target.value, 10))}
                className="h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
              />
            </div>
          </>
        )}

        {/* ================= 2. SECTION TYPE ================= */}
        {slide.type === "section" && (
          <>
            {renderTextInputWithRefiner("رقم المحور أو القسم (مثال: ٠١، ٠٢)", "stageNumber", slide.stageNumber)}
            {renderTextInputWithRefiner("عنوان المرحلة", "stageTitle", slide.stageTitle)}
            {renderTextInputWithRefiner("شرح أو وصف فرعي موجز", "stageSubtitle", slide.stageSubtitle)}

            <div className="flex flex-col gap-1.5 mb-3 mt-4">
              <div className="flex justify-between text-xs font-mono text-gray-400 select-none">
                <span>حجم خط العنوان:</span>
                <span className="text-[#E4C766]">{slide.titleSize}px</span>
              </div>
              <input
                type="range"
                min={24}
                max={70}
                value={slide.titleSize}
                onChange={(e) => updateField("titleSize", parseInt(e.target.value, 10))}
                className="h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
              />
            </div>

            <div className="flex flex-col gap-1.5 mb-3">
              <div className="flex justify-between text-xs font-mono text-gray-400 select-none">
                <span>شفافية الوصف:</span>
                <span className="text-[#E4C766]">{Math.round(slide.subtitleOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={slide.subtitleOpacity}
                onChange={(e) => updateField("subtitleOpacity", parseFloat(e.target.value))}
                className="h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
              />
            </div>
          </>
        )}

        {/* ================= 3. EVENT TYPE ================= */}
        {slide.type === "event" && (
          <>
            {renderTextInputWithRefiner("تصنيف النشاط (مثل: جولة تفتيشية)", "catLabel", slide.catLabel)}
            {renderTextInputWithRefiner("عنوان الحدث أو الإنجاز", "title", slide.title)}
            {renderTextInputWithRefiner("الموقع أو الميدان", "location", slide.location)}

            <div className="grid grid-cols-2 gap-3 mb-4">
              {renderTextInputWithRefiner("يوم الفعالية", "day", slide.day)}
              {renderTextInputWithRefiner("اسم الشهر", "month", slide.month)}
            </div>

            {/* Media drag upload gallery */}
            <div className="flex flex-col gap-2 mb-4 border-t border-amber-500/5 pt-4">
              <label className="text-xs text-gray-400 font-sans">الصور والفيديوهات التوثيقية</label>
              
              <div className="grid grid-cols-3 gap-2.5 mb-2">
                {slide.mediaList && slide.mediaList.map((m, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg border border-amber-500/10 bg-[#0e1f18] overflow-hidden group">
                    {m.type === "video" ? (
                      <video src={m.src} className="w-full h-full object-cover" />
                    ) : (
                      <img src={m.src} alt="media" className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => removeMediaItem(idx)}
                      className="absolute top-1 right-1 bg-rose-950/90 text-rose-300 p-1 rounded hover:bg-rose-900 transition cursor-pointer"
                      title="حذف الملف"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {/* Upload Trigger */}
                <div className="relative aspect-video rounded-lg border border-dashed border-amber-500/15 bg-[#0e1f18] hover:border-amber-500/30 transition flex flex-col items-center justify-center">
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-[9px] text-gray-400 mt-1">رفع صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMediaUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Cinematic Camera sliders */}
            <h4 className="text-xs font-sans font-bold text-[#E4C766] mb-3 mt-4 flex items-center gap-1">
              <PlaySquare className="w-3.5 h-3.5" />
              <span>الإخراج الحركي والبصري</span>
            </h4>

            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs text-gray-400 font-sans flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={slide.kenBurnsEnabled}
                  onChange={(e) => updateField("kenBurnsEnabled", e.target.checked)}
                  className="rounded bg-[#0e1f18] border-amber-500/15 text-[#C9A227] focus:ring-0 cursor-pointer"
                />
                <span>تفعيل تأثير حركة الكاميرا (Ken Burns)</span>
              </label>
            </div>

            {slide.kenBurnsEnabled && (
              <div className="flex flex-col gap-1.5 mb-4">
                <div className="flex justify-between text-xs font-mono text-gray-400 select-none">
                  <span>سرعة وشدة التقريب:</span>
                  <span className="text-[#E4C766]">{Math.round(slide.kenBurnsIntensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.02}
                  max={0.15}
                  step={0.01}
                  value={slide.kenBurnsIntensity}
                  onChange={(e) => updateField("kenBurnsIntensity", parseFloat(e.target.value))}
                  className="h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5 mb-3">
              <div className="flex justify-between text-xs font-mono text-gray-400 select-none">
                <span>حجم خط العناوين:</span>
                <span className="text-[#E4C766]">{slide.textSize}px</span>
              </div>
              <input
                type="range"
                min={20}
                max={50}
                value={slide.textSize}
                onChange={(e) => updateField("textSize", parseInt(e.target.value, 10))}
                className="h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
              />
            </div>
          </>
        )}

        {/* ================= 4. CLOSING TYPE ================= */}
        {slide.type === "closing" && (
          <>
            {renderTextInputWithRefiner("العنوان الختامي", "heading", slide.heading)}
            {renderTextInputWithRefiner("التوقيع المؤسساتي الختامي", "ministryName", slide.ministryName)}

            {/* 📊 Stats Style Option */}
            <div className="flex flex-col gap-1.5 mb-4 bg-[#0e1f18] p-3 rounded-lg border border-amber-500/5">
              <label className="text-xs text-gray-300 font-sans font-medium flex items-center gap-1">
                <span>📊</span>
                <span>نمط العرض المرئي للإحصائيات:</span>
              </label>
              <select
                value={(slide as any).statsStyle || "cards"}
                onChange={(e) => updateField("statsStyle", e.target.value)}
                className="w-full bg-[#152820] border border-amber-500/10 rounded-lg px-2.5 py-1.5 text-xs font-sans text-gray-200 focus:outline-none cursor-pointer focus:border-[#C9A227]"
              >
                <option value="cards">بطاقات منفصلة شفافة (Glassmorphic Cards)</option>
                <option value="bars">أعمدة تقدم أفقية (Horizontal Progress Bars)</option>
                <option value="pie">مؤشرات دائرية دونت (Radial Circular Indicators)</option>
                <option value="grid">مؤشرات شبكية ثنائية الأبعاد (2D Dashboard Grid)</option>
                <option value="kpis">بطاقات مؤشرات الأداء الكبرى (KPI Blocks with Index)</option>
              </select>
              <p className="text-[10px] text-gray-500 leading-relaxed font-sans pr-1">
                اختر الأسلوب البصري الأكثر ملاءمة للأرقام المعروضة (مثلاً، النمط الدائري أو الأعمدة ممتاز للنسب المئوية ومقارنة الأهداف).
              </p>
            </div>

            {/* Statistics group builder */}
            <div className="flex flex-col gap-2 mb-4 border-t border-amber-500/5 pt-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="text-xs text-gray-400 font-sans font-medium">البطاقات الإحصائية</label>
                <button
                  onClick={addStatItem}
                  className="flex items-center gap-1 text-[11px] font-sans text-[#E4C766] hover:text-[#C9A227] cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>إضافة بطاقة</span>
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {slide.stats && slide.stats.map((st, idx) => (
                  <div key={idx} className="bg-[#0e1f18] p-3 rounded-lg border border-amber-500/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-sans text-gray-400">بطاقة رقم #{idx + 1}</span>
                      <button
                        onClick={() => removeStatItem(idx)}
                        className="text-rose-400 hover:text-rose-300 p-0.5 rounded cursor-pointer"
                        title="حذف البطاقة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {renderTextInputWithRefiner(
                        "الرقم أو النسبة",
                        `stat_n_${idx}`,
                        st.n,
                        "مثال: ١٢+",
                        (val) => handleStatChange(idx, "n", val),
                        (refined) => handleStatChange(idx, "n", refined)
                      )}
                      {renderTextInputWithRefiner(
                        "تسمية المعيار",
                        `stat_l_${idx}`,
                        st.l,
                        "مثال: نشاط ميداني",
                        (val) => handleStatChange(idx, "l", val),
                        (refined) => handleStatChange(idx, "l", refined)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mb-3 mt-4">
              <div className="flex justify-between text-xs font-mono text-gray-400 select-none">
                <span>حجم الأرقام الإحصائية:</span>
                <span className="text-[#E4C766]">{slide.statsSize}px</span>
              </div>
              <input
                type="range"
                min={30}
                max={70}
                value={slide.statsSize}
                onChange={(e) => updateField("statsSize", parseInt(e.target.value, 10))}
                className="h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
              />
            </div>
          </>
        )}

      </div>

      {/* 📁 مكتبة الوسائط المشتركة */}
      <div className="mt-2 pt-4 border-t border-amber-500/15 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#E4C766]">
            <span>📁</span>
            <span>مكتبة الوسائط المشتركة ({mediaLibrary.length})</span>
          </div>
          <div className="flex items-center gap-2">
            {mediaLibrary.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("هل أنت متأكد من تفريغ مكتبة الوسائط بالكامل؟")) {
                    onClearMediaLibrary();
                  }
                }}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-sans cursor-pointer transition py-1 px-1.5 bg-rose-950/20 hover:bg-rose-950/40 rounded border border-rose-500/10"
              >
                تفريغ المكتبة
              </button>
            )}
            <label className="text-[10px] bg-[#0e1f18] hover:bg-[#152820] text-gray-400 hover:text-white px-2 py-1 rounded border border-amber-500/10 cursor-pointer transition">
              <span>رفع للمكتبة</span>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files) return;
                  Array.from(files).forEach((file: File) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        onAddToMediaLibrary({
                          src: ev.target.result as string,
                          type: file.type.startsWith("video/") ? "video" : "image",
                          name: file.name
                        });
                      }
                    };
                    reader.readAsDataURL(file);
                  });
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {mediaLibrary.length === 0 ? (
          <div className="text-center py-4 bg-[#0e1f18] border border-amber-500/5 rounded-lg text-[10px] text-gray-500 leading-relaxed">
            المكتبة فارغة حالياً. عند رفع صور أو فيديوهات في أي شريحة، سيتم حفظها هنا تلقائياً لإعادة الاستخدام السريع!
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 bg-[#0e1f18] border border-amber-500/5 p-2 rounded-xl max-h-[140px] overflow-y-auto">
            {mediaLibrary.map((item, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg border border-amber-500/10 bg-[#152820] overflow-hidden group">
                {item.type === "video" ? (
                  <div className="w-full h-full flex items-center justify-center bg-black">
                    <video src={item.src} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <PlaySquare className="w-3.5 h-3.5 text-white/80" />
                    </div>
                  </div>
                ) : (
                  <img src={item.src} alt="media-library-item" className="w-full h-full object-cover" />
                )}

                {/* Badge style indicator */}
                <div className="absolute bottom-0.5 right-0.5 bg-black/60 px-1 py-0.2 rounded text-[7px] text-gray-300 select-none">
                  {item.type === "video" ? "فيديو" : "صورة"}
                </div>

                {/* Interactive Action Overlays */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition duration-150 flex flex-col items-center justify-center gap-1.5 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (slide.type === "intro") {
                        if (item.type !== "image") {
                          alert("يرجى اختيار صورة لشعار الشريحة!");
                          return;
                        }
                        updateField("logoData", item.src);
                      } else if (slide.type === "event") {
                        const currentList = slide.mediaList || [];
                        if (currentList.some((m) => m.src === item.src)) {
                          alert("هذا الملف مضاف بالفعل إلى هذه الشريحة!");
                          return;
                        }
                        const newItem: MediaItem = {
                          type: item.type,
                          src: item.src
                        };
                        updateField("mediaList", [newItem, ...currentList]);
                      } else {
                        alert("يرجى اختيار شريحة 'فعالية' أو شريحة 'مقدمة' لتتمكن من استخدام الوسائط بداخلها.");
                      }
                    }}
                    className="w-full py-0.5 bg-[#C9A227] hover:bg-[#E4C766] text-[#0A2C21] font-black text-[9px] rounded-md transition cursor-pointer text-center"
                  >
                    {slide.type === "intro" ? "شعار" : "إدراج"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFromMediaLibrary(idx)}
                    className="p-0.5 bg-rose-950/80 text-rose-300 hover:text-rose-200 rounded transition cursor-pointer"
                    title="حذف من المكتبة"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
