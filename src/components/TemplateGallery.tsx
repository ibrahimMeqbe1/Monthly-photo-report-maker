import React from "react";
import { ReportTemplate, TEMPLATES } from "../utils/templates";
import { THEMES } from "../utils/themes";
import { Sparkles, Palette, Type, CheckCircle } from "lucide-react";

interface TemplateGalleryProps {
  activeTemplateId: string | null;
  onSelectTemplate: (template: ReportTemplate) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  activeTemplateId,
  onSelectTemplate,
}) => {
  return (
    <div className="bg-[#152820] border border-amber-500/10 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-[#E4C766]" />
          <h3 className="font-display text-sm font-bold text-[#E4C766] border-r-2 border-[#C9A227] pr-2.5">
            معرض القوالب البصرية المتكاملة
          </h3>
        </div>
        <p className="text-xs text-gray-400 font-sans leading-relaxed">
          اختر نمطاً تصميمياً جاهزاً (ألوان، خطوط، وتنسيقات بصريّة متكاملة) لتطبيق مظهر احترافي فاخر على التقرير بضغطة واحدة.
        </p>
      </div>

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
    </div>
  );
};
