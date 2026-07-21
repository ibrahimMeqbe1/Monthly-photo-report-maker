import React, { useState } from "react";
import { ReportTemplate, TEMPLATES } from "../utils/templates";
import { THEMES } from "../utils/themes";
import { ThemeName } from "../types";
import { Sparkles, Palette, Type, CheckCircle, Sliders } from "lucide-react";

interface TemplateGalleryProps {
  activeTemplateId: string | null;
  onSelectTemplate: (template: ReportTemplate) => void;
  currentTheme: ThemeName;
  onThemeChange: (themeName: ThemeName) => void;
  fontDisplay: string;
  onFontDisplayChange: (font: string) => void;
  fontBody: string;
  onFontBodyChange: (font: string) => void;
}

const ARABIC_FONTS = [
  { name: "Cairo", label: "القاهرة (Cairo) - عريض ورسمي" },
  { name: "Tajawal", label: "تجوال (Tajawal) - حديث ومتناسق" },
  { name: "Almarai", label: "المراعي (Almarai) - ناعم ومقروء" },
  { name: "Alexandria", label: "الإسكندرية (Alexandria) - هندسي معاصر" },
  { name: "Amiri", label: "الأميري (Amiri) - تراثي عريق" },
  { name: "Readex Pro", label: "ريدكس برو (Readex Pro) - تبسيطي ذكي" },
  { name: "El Messiri", label: "المسيري (El Messiri) - فني منحنٍ" }
];

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  activeTemplateId,
  onSelectTemplate,
  currentTheme,
  onThemeChange,
  fontDisplay,
  onFontDisplayChange,
  fontBody,
  onFontBodyChange,
}) => {
  const [activeTab, setActiveTab] = useState<"templates" | "colors" | "fonts">("templates");

  return (
    <div className="bg-[#152820] border border-amber-500/10 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-[#E4C766]" />
          <h3 className="font-display text-sm font-bold text-[#E4C766] border-r-2 border-[#C9A227] pr-2.5">
            النمط البصري والهوية المتكاملة
          </h3>
        </div>
        <p className="text-xs text-gray-400 font-sans leading-relaxed">
          خصص المظهر البصري لتقريرك بالكامل ليتوافق مع الهوية الرسمية لمؤسستك بأسلوب مخصص واحترافي.
        </p>
      </div>

      {/* Modern Pill Segmented Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-[#0b1712] p-1 rounded-lg border border-amber-500/5">
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-sans font-bold rounded-md transition-all duration-200 cursor-pointer ${
            activeTab === "templates"
              ? "bg-[#C9A227] text-[#0A2C21] shadow-sm"
              : "text-gray-400 hover:text-white hover:bg-emerald-950/20"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>القوالب</span>
        </button>
        <button
          onClick={() => setActiveTab("colors")}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-sans font-bold rounded-md transition-all duration-200 cursor-pointer ${
            activeTab === "colors"
              ? "bg-[#C9A227] text-[#0A2C21] shadow-sm"
              : "text-gray-400 hover:text-white hover:bg-emerald-950/20"
          }`}
        >
          <Palette className="w-3.5 h-3.5 shrink-0" />
          <span>الألوان</span>
        </button>
        <button
          onClick={() => setActiveTab("fonts")}
          className={`flex items-center justify-center gap-1.5 py-2 text-xs font-sans font-bold rounded-md transition-all duration-200 cursor-pointer ${
            activeTab === "fonts"
              ? "bg-[#C9A227] text-[#0A2C21] shadow-sm"
              : "text-gray-400 hover:text-white hover:bg-emerald-950/20"
          }`}
        >
          <Type className="w-3.5 h-3.5 shrink-0" />
          <span>الخطوط</span>
        </button>
      </div>

      {/* Tab 1: Integrated Templates */}
      {activeTab === "templates" && (
        <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
          {TEMPLATES.map((tpl) => {
            const isActive = activeTemplateId === tpl.id;
            const themeDetails = THEMES[tpl.theme];

            return (
              <div
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl)}
                className={`relative flex flex-col gap-2 p-3.5 rounded-xl border transition-all duration-300 text-right cursor-pointer select-none group ${
                  isActive
                    ? "border-[#C9A227] bg-gradient-to-br from-emerald-950/50 to-emerald-900/10 shadow-[0_0_20px_rgba(201,162,39,0.12)]"
                    : "border-amber-500/5 bg-[#0e1f18] hover:border-[#C9A227]/40 hover:bg-emerald-950/20"
                }`}
              >
                {/* Top Badge & Indicator */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-[#C9A227]/20 text-[#E4C766] font-sans font-medium">
                    {tpl.badgeText}
                  </span>
                  {isActive ? (
                    <CheckCircle className="w-4 h-4 text-[#C9A227] fill-amber-500/10 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-gray-600 group-hover:border-[#C9A227]/40 shrink-0" />
                  )}
                </div>

                {/* Template Name & Description */}
                <div>
                  <h4
                    className={`text-xs font-bold transition duration-150 ${
                      isActive ? "text-[#E4C766]" : "text-gray-200 group-hover:text-white"
                    }`}
                    style={{ fontFamily: tpl.fontDisplay }}
                  >
                    {tpl.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 font-sans leading-relaxed line-clamp-2">
                    {tpl.description}
                  </p>
                </div>

                {/* Design Swatch Details (Colors & Fonts) */}
                <div className="mt-1 pt-2 border-t border-amber-500/5 flex items-center justify-between text-[10px]">
                  {/* Font Combo Swatch */}
                  <div className="flex items-center gap-1.5 text-gray-400 bg-[#07130f] px-2 py-1 rounded-md border border-amber-500/5">
                    <Type className="w-3 h-3 text-[#E4C766]" />
                    <span className="font-mono text-gray-300">
                      <span style={{ fontFamily: tpl.fontDisplay }} className="font-bold">
                        {tpl.fontDisplay}
                      </span>
                      <span className="mx-0.5 text-gray-500">/</span>
                      <span style={{ fontFamily: tpl.fontBody }}>
                        {tpl.fontBody}
                      </span>
                    </span>
                  </div>

                  {/* Colors Bar Swatch */}
                  <div className="flex items-center gap-1 bg-[#07130f] px-2 py-1 rounded-md border border-amber-500/5">
                    <Palette className="w-3 h-3 text-[#E4C766]" />
                    <div className="flex -space-x-1.5 space-x-reverse">
                      <span
                        className="w-3 h-3 rounded-full border border-[#07130f]"
                        style={{ backgroundColor: themeDetails.accent }}
                        title="Accent"
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-[#07130f]"
                        style={{ backgroundColor: themeDetails.sand }}
                        title="Sand"
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-[#07130f]"
                        style={{ backgroundColor: themeDetails.bgDark1 }}
                        title="BG"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Individual Color Themes */}
      {activeTab === "colors" && (
        <div className="flex flex-col gap-3">
          <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
            اختر لوحة ألوان مستقلة لتطبيقها فورياً على قالب التقرير لتناسب تماماً هوية مؤسستك.
          </p>
          <div className="grid grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
            {Object.keys(THEMES).map((key) => {
              const name = key as ThemeName;
              const th = THEMES[name];
              const isActive = currentTheme === name && activeTemplateId === null;
              const isPartiallyActive = currentTheme === name;

              return (
                <button
                  key={name}
                  onClick={() => onThemeChange(name)}
                  className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200 text-center group cursor-pointer ${
                    isActive
                      ? "border-[#C9A227] bg-emerald-950/40 shadow-[0_0_15px_rgba(201,162,39,0.15)]"
                      : isPartiallyActive
                      ? "border-[#C9A227]/40 bg-emerald-950/20"
                      : "border-amber-500/5 bg-[#0e1f18] hover:border-[#C9A227]/40 hover:bg-emerald-950/20"
                  }`}
                >
                  {/* Theme color previews */}
                  <div
                    className="w-full h-9 rounded-lg mb-1.5 relative overflow-hidden"
                    style={{ background: th.swatchCss }}
                  >
                    <div className="absolute inset-y-0 left-0 w-1/3 bg-white/10" />
                    <div className="absolute inset-y-0 right-0 w-1/4 bg-black/25" />
                  </div>

                  <span
                    className={`text-[11px] font-sans font-bold transition duration-150 ${
                      isPartiallyActive ? "text-[#E4C766]" : "text-gray-300 group-hover:text-white"
                    }`}
                  >
                    {th.label}
                  </span>

                  {/* Indicator indicator */}
                  {isPartiallyActive && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C9A227]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Custom Fonts */}
      {activeTab === "fonts" && (
        <div className="flex flex-col gap-4">
          <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
            تحكم بخطوط العناوين العريضة وخطوط النصوص الجسدية المكتوبة بمرونة تامة.
          </p>

          {/* Display Font Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] text-[#E4C766] font-bold font-sans">
              خط العناوين الرئيسية (Display Font)
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {ARABIC_FONTS.map((f) => (
                <button
                  key={`display-${f.name}`}
                  onClick={() => onFontDisplayChange(f.name)}
                  style={{ fontFamily: f.name }}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-lg border text-right transition-all duration-150 cursor-pointer text-xs ${
                    fontDisplay === f.name
                      ? "border-[#C9A227] bg-[#C9A227]/10 text-[#E4C766] font-bold"
                      : "border-amber-500/5 bg-[#0e1f18] text-gray-300 hover:border-amber-500/20 hover:text-white"
                  }`}
                >
                  <span>{f.label}</span>
                  {fontDisplay === f.name && (
                    <CheckCircle className="w-3.5 h-3.5 text-[#C9A227]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-amber-500/5 my-1" />

          {/* Body Font Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] text-[#E4C766] font-bold font-sans">
              خط نصوص الشرح والتفاصيل (Body Font)
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {ARABIC_FONTS.map((f) => (
                <button
                  key={`body-${f.name}`}
                  onClick={() => onFontBodyChange(f.name)}
                  style={{ fontFamily: f.name }}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-lg border text-right transition-all duration-150 cursor-pointer text-xs ${
                    fontBody === f.name
                      ? "border-[#C9A227] bg-[#C9A227]/10 text-[#E4C766] font-bold"
                      : "border-amber-500/5 bg-[#0e1f18] text-gray-300 hover:border-amber-500/20 hover:text-white"
                  }`}
                >
                  <span>{f.label}</span>
                  {fontBody === f.name && (
                    <CheckCircle className="w-3.5 h-3.5 text-[#C9A227]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
