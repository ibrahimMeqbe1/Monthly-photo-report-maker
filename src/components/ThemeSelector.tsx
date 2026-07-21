import React from "react";
import { ThemeName } from "../types";
import { THEMES } from "../utils/themes";

interface ThemeSelectorProps {
  currentTheme: ThemeName;
  onThemeChange: (themeName: ThemeName) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  return (
    <div className="bg-[#152820] border border-amber-500/10 rounded-xl p-5 shadow-lg">
      <h3 className="font-display text-sm font-bold text-[#E4C766] mb-3 border-r-2 border-[#C9A227] pr-2.5">
        القالب اللوني للفيديو
      </h3>
      <p className="text-xs text-gray-400 mb-4 font-sans leading-relaxed">
        اختر النمط البصري المتناسق المناسب لهوية مؤسستك لتغيير ألوان التقرير فورياً.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {Object.keys(THEMES).map((key) => {
          const name = key as ThemeName;
          const th = THEMES[name];
          const isActive = currentTheme === name;

          return (
            <button
              key={name}
              onClick={() => onThemeChange(name)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 text-center group cursor-pointer ${
                isActive
                  ? "border-[#C9A227] bg-emerald-950/40 shadow-[0_0_15px_rgba(201,162,39,0.15)]"
                  : "border-amber-500/5 bg-[#0e1f18] hover:border-[#C9A227]/40 hover:bg-emerald-950/20"
              }`}
            >
              {/* Theme color previews */}
              <div
                className="w-full h-10 rounded-lg mb-2 relative overflow-hidden"
                style={{ background: th.swatchCss }}
              >
                <div className="absolute inset-y-0 left-0 w-1/3 bg-white/10" />
                <div className="absolute inset-y-0 right-0 w-1/4 bg-black/25" />
              </div>

              <span
                className={`text-xs font-sans font-bold transition duration-150 ${
                  isActive ? "text-[#E4C766]" : "text-gray-300 group-hover:text-white"
                }`}
              >
                {th.label}
              </span>

              {/* Gold dot active state indicators */}
              {isActive && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C9A227]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
