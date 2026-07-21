import React from "react";
import { Slide, SlideType } from "../types";
import { ArrowUp, ArrowDown, Copy, Trash2, PlusCircle, Layers } from "lucide-react";

interface SlideListProps {
  slides: Slide[];
  activeIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: (type: SlideType) => void;
  onDeleteSlide: (index: number) => void;
  onDuplicateSlide: (index: number) => void;
  onMoveSlide: (index: number, direction: -1 | 1) => void;
}

export const SlideList: React.FC<SlideListProps> = ({
  slides,
  activeIndex,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onMoveSlide,
}) => {
  const getSlideLabel = (type: SlideType): string => {
    switch (type) {
      case "intro":
        return "افتتاحية التقرير";
      case "section":
        return "فاصل عنوان مرحلة";
      case "event":
        return "حدث مصور";
      case "closing":
        return "خاتمة وإحصائيات";
    }
  };

  const getSlidePreviewText = (s: Slide): string => {
    if (s.type === "intro") return s.mainTitle || "العنوان الرئيسي للتقرير";
    if (s.type === "section") return s.stageTitle || "عنوان المحور";
    if (s.type === "event") return s.title || "عنوان الحدث أو الفعالية";
    return s.heading || "ملخص الإحصائيات";
  };

  return (
    <div className="bg-[#152820] border border-amber-500/10 rounded-xl p-4 flex flex-col gap-4 shadow-lg">
      <div className="flex items-center gap-2 border-r-2 border-[#C9A227] pr-2.5">
        <Layers className="w-4 h-4 text-[#E4C766]" />
        <h3 className="font-display text-sm font-bold text-[#E4C766]">قائمة السلايدات</h3>
      </div>

      {/* Creation tools */}
      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => onAddSlide("intro")}
          className="w-full bg-[#0e1f18] hover:border-[#C9A227] hover:bg-emerald-950/20 text-gray-200 border border-amber-500/5 py-2 px-3 rounded-lg text-xs font-sans font-semibold text-right flex items-center justify-between transition cursor-pointer"
        >
          <span>+ إضافة شريحة افتتاحية</span>
          <PlusCircle className="w-3.5 h-3.5 text-[#C9A227]" />
        </button>
        <button
          onClick={() => onAddSlide("section")}
          className="w-full bg-[#0e1f18] hover:border-[#C9A227] hover:bg-emerald-950/20 text-gray-200 border border-amber-500/5 py-2 px-3 rounded-lg text-xs font-sans font-semibold text-right flex items-center justify-between transition cursor-pointer"
        >
          <span>+ إضافة فاصل عنوان مرحلة</span>
          <PlusCircle className="w-3.5 h-3.5 text-[#C9A227]" />
        </button>
        <button
          onClick={() => onAddSlide("event")}
          className="w-full bg-[#0e1f18] hover:border-[#C9A227] hover:bg-emerald-950/20 text-gray-200 border border-amber-500/5 py-2 px-3 rounded-lg text-xs font-sans font-semibold text-right flex items-center justify-between transition cursor-pointer"
        >
          <span>+ إضافة حدث أو فعالية مصورة</span>
          <PlusCircle className="w-3.5 h-3.5 text-[#C9A227]" />
        </button>
        <button
          onClick={() => onAddSlide("closing")}
          className="w-full bg-[#0e1f18] hover:border-[#C9A227] hover:bg-emerald-950/20 text-gray-200 border border-amber-500/5 py-2 px-3 rounded-lg text-xs font-sans font-semibold text-right flex items-center justify-between transition cursor-pointer"
        >
          <span>+ إضافة شريحة خاتمة إحصائية</span>
          <PlusCircle className="w-3.5 h-3.5 text-[#C9A227]" />
        </button>
      </div>

      {/* Slide timeline cards */}
      <div className="flex flex-col gap-2.5 max-h-[48vh] overflow-y-auto pr-1">
        {slides.map((s, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={s.id}
              onClick={() => onSelectSlide(index)}
              className={`group flex flex-col p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                isActive
                  ? "border-[#C9A227] bg-[#0e1f18] shadow-[0_4px_12px_rgba(201,162,39,0.1)]"
                  : "border-amber-500/5 bg-[#0e1f18]/60 hover:bg-[#0e1f18] hover:border-[#C9A227]/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-mono text-[#C9A227] font-bold select-none">
                  #{index + 1} · {getSlideLabel(s.type)}
                </span>
                <span className="text-[10px] font-mono text-gray-400 select-none bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded-full">
                  {s.duration}s
                </span>
              </div>

              <div
                className={`text-xs font-sans font-medium line-clamp-1 mb-2.5 ${
                  isActive ? "text-[#E4C766]" : "text-gray-300 group-hover:text-white"
                }`}
              >
                {getSlidePreviewText(s)}
              </div>

              {/* Action rail inside thumbnail */}
              <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition duration-150 border-t border-amber-500/5 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveSlide(index, -1);
                  }}
                  disabled={index === 0}
                  className="flex-1 p-1 flex items-center justify-center rounded hover:bg-emerald-950 hover:text-[#E4C766] disabled:opacity-20 cursor-pointer text-gray-400"
                  title="تحريك لأعلى"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveSlide(index, 1);
                  }}
                  disabled={index === slides.length - 1}
                  className="flex-1 p-1 flex items-center justify-center rounded hover:bg-emerald-950 hover:text-[#E4C766] disabled:opacity-20 cursor-pointer text-gray-400"
                  title="تحريك لأسفل"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSlide(index);
                  }}
                  className="flex-1 p-1 flex items-center justify-center rounded hover:bg-emerald-950 hover:text-[#E4C766] cursor-pointer text-gray-400"
                  title="مضاعفة الشريحة"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSlide(index);
                  }}
                  className="flex-1 p-1 flex items-center justify-center rounded hover:bg-rose-950/50 hover:text-rose-400 cursor-pointer text-gray-400"
                  title="حذف الشريحة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
