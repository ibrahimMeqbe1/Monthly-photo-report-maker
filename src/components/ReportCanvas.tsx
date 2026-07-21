import React, { useRef, useEffect, useState } from "react";
import { Slide, ThemeColors } from "../types";
import { formatStatValue, parseStatNumber } from "../utils/arabic";
import { Play, Pause, Download, Volume2, RefreshCw, Music, Trash2, Upload, FileAudio, Sliders } from "lucide-react";

interface ReportCanvasProps {
  slides: Slide[];
  theme: ThemeColors;
  activeSlideIndex: number;
  onActiveSlideChange: (index: number) => void;
  globalAudio: {
    data: string | null;
    filename: string;
    volume: number;
  };
  onUpdateGlobalAudio: (audio: { data: string | null; filename: string; volume: number }) => void;
  watermarkSettings: {
    enabled: boolean;
    type: "default" | "custom";
    src: string | null;
    position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  };
  onWatermarkSettingsChange: (settings: {
    enabled: boolean;
    type: "default" | "custom";
    src: string | null;
    position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  }) => void;
}

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

export const ReportCanvas: React.FC<ReportCanvasProps> = ({
  slides,
  theme,
  activeSlideIndex,
  onActiveSlideChange,
  globalAudio,
  onUpdateGlobalAudio,
  watermarkSettings,
  onWatermarkSettingsChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Caches for images and video elements to avoid reloading flickers
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const [rerenderKey, setRerenderKey] = useState(0);

  const prevCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    prevCanvasRef.current = document.createElement("canvas");
    prevCanvasRef.current.width = 1280;
    prevCanvasRef.current.height = 720;

    nextCanvasRef.current = document.createElement("canvas");
    nextCanvasRef.current.width = 1280;
    nextCanvasRef.current.height = 720;
  }, []);

  // Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatusText, setExportStatusText] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [exportResolution, setExportResolution] = useState<"720p" | "1080p">("720p");
  const [activeSettingsTab, setActiveSettingsTab] = useState<"branding" | "audio">("branding");

  const totalDuration = slides.reduce((acc, s) => acc + (s.duration || 3), 0);

  // Synchronized refs for smooth non-blocking playback loop
  const currentTimeRef = useRef(currentTime);
  const activeSlideIndexRef = useRef(activeSlideIndex);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    activeSlideIndexRef.current = activeSlideIndex;
  }, [activeSlideIndex]);

  // Trigger canvas updates on demand (like image loaders or theme toggles)
  const triggerRerender = () => setRerenderKey((prev) => prev + 1);

  // Load new audio file whenever the source URL changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.volume = globalAudio.volume;
      // If the video is currently playing, resume playback with the new track in sync!
      if (isPlaying) {
        audioRef.current.currentTime = currentTimeRef.current;
        audioRef.current.play().catch((err) => console.log("Audio play blocked on track change", err));
      }
    }
  }, [globalAudio.data]);

  // Sync audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = globalAudio.volume;
    }
  }, [globalAudio.volume]);

  // Handle active slide changed externally
  useEffect(() => {
    if (!isPlaying) {
      // Seek current time to start of active slide
      let acc = 0;
      for (let i = 0; i < activeSlideIndex; i++) {
        acc += slides[i].duration || 3;
      }
      setCurrentTime(acc);
    }
  }, [activeSlideIndex, isPlaying]);

  // Resolve Image element and cache it
  const getCachedImage = (id: string, src: string): HTMLImageElement | null => {
    const key = `${id}_${src}`;
    if (imageCacheRef.current[key]) {
      return imageCacheRef.current[key];
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imageCacheRef.current[key] = img;
      triggerRerender();
    };
    return null;
  };

  /* ================= DRAW UTILITIES ================= */
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const stripFormatting = (text: string): string => {
    return (text || "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/<color=[^>]+>/g, "")
      .replace(/<\/color>/g, "");
  };

  interface RichSegment {
    text: string;
    bold: boolean;
    italic: boolean;
    color: string;
  }

  const parseRichText = (text: string, defaultColor: string): RichSegment[] => {
    const segments: RichSegment[] = [];
    let i = 0;
    let curBold = false;
    let curItalic = false;
    let curColor = defaultColor;
    const activeColorStack: string[] = [];
    let currentWord = "";

    const pushSegment = () => {
      if (currentWord) {
        segments.push({
          text: currentWord,
          bold: curBold,
          italic: curItalic,
          color: curColor,
        });
        currentWord = "";
      }
    };

    while (i < text.length) {
      if (text.startsWith("**", i)) {
        pushSegment();
        curBold = !curBold;
        i += 2;
      } else if (text.startsWith("*", i)) {
        pushSegment();
        curItalic = !curItalic;
        i += 1;
      } else if (text.startsWith("<color=", i)) {
        pushSegment();
        const closeBracket = text.indexOf(">", i);
        if (closeBracket !== -1) {
          const colorVal = text.substring(i + 7, closeBracket);
          activeColorStack.push(curColor);
          curColor = colorVal;
          i = closeBracket + 1;
        } else {
          currentWord += "<";
          i++;
        }
      } else if (text.startsWith("</color>", i)) {
        pushSegment();
        curColor = activeColorStack.pop() || defaultColor;
        i += 8;
      } else {
        currentWord += text[i];
        i++;
      }
    }
    pushSegment();
    return segments;
  };

  const drawRichTextLine = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    align: "left" | "right" | "center",
    baseFontName: string,
    baseFontSize: number,
    defaultColor: string,
    fontWeight = "900"
  ) => {
    const segments = parseRichText(text, defaultColor);

    // Measure total width and individual segment widths
    const measured = segments.map((seg) => {
      ctx.save();
      const weight = seg.bold ? "900" : fontWeight;
      const style = seg.italic ? "italic" : "normal";
      ctx.font = `${style} ${weight} ${baseFontSize}px ${baseFontName}`;
      const width = ctx.measureText(seg.text).width;
      ctx.restore();
      return { seg, width };
    });

    const totalWidth = measured.reduce((sum, item) => sum + item.width, 0);

    // Calculate rightX (where the rightmost word starts drawing from its right edge)
    let rightX = x;
    if (align === "center") {
      rightX = x + totalWidth / 2;
    } else if (align === "left") {
      rightX = x + totalWidth;
    } else {
      rightX = x;
    }

    ctx.save();
    // Set text alignment to LEFT so segments draw forward (to the right) from their calculated left coordinates
    ctx.textAlign = "left";

    // Draw segments RTL (first segment on the far right, and moving leftwards)
    let currentRightX = rightX;
    measured.forEach(({ seg, width }) => {
      ctx.save();
      const weight = seg.bold ? "900" : fontWeight;
      const style = seg.italic ? "italic" : "normal";
      ctx.font = `${style} ${weight} ${baseFontSize}px ${baseFontName}`;
      ctx.fillStyle = seg.color;

      const drawX = currentRightX - width;
      ctx.fillText(seg.text, drawX, y);
      ctx.restore();

      currentRightX -= width;
    });
    ctx.restore();
  };

  const wrapLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = (text || "").split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const wd of words) {
      const test = cur ? cur + " " + wd : wd;
      const cleanTest = stripFormatting(test);
      if (ctx.measureText(cleanTest).width > maxWidth && cur) {
        lines.push(cur);
        cur = wd;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  };

  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    zoom: number,
    offsetX = 0,
    offsetY = 0
  ) => {
    const ir = img.width / img.height;
    const r = w / h;
    let sw, sh, sx, sy;

    if (ir > r) {
      sh = img.height;
      sw = sh * r;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      sw = img.width;
      sh = sw / r;
      sx = 0;
      sy = (img.height - sh) / 2;
    }

    const zsw = sw / zoom;
    const zsh = sh / zoom;
    const zsx = sx + (sw - zsw) / 2 + offsetX;
    const zsy = sy + (sh - zsh) / 2 + offsetY;

    ctx.drawImage(img, zsx, zsy, zsw, zsh, x, y, w, h);
  };

  const drawImageContain = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    cx: number,
    cy: number,
    maxW: number,
    maxH: number
  ) => {
    const ir = img.width / img.height;
    let w = maxW;
    let h = maxW / ir;
    if (h > maxH) {
      h = maxH;
      w = maxH * ir;
    }
    ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  };

  const hexToRgba = (hex: string, alpha: number): string => {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  /* ================= CANVAS DRAW CHUNKS ================= */
  const drawIntroSlide = (ctx: CanvasRenderingContext2D, s: any, t: number, W: number, H: number) => {
    // Gradient Background
    const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
    g.addColorStop(0, theme.bgDark1);
    g.addColorStop(1, theme.bgDark2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Decorative Radial Glow
    const rg = ctx.createRadialGradient(W / 2, H * 0.32, 10, W / 2, H * 0.32, W * 0.45);
    rg.addColorStop(0, hexToRgba(theme.accent, 0.16));
    rg.addColorStop(1, hexToRgba(theme.accent, 0));
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);

    const preset = s.animationPreset || "classic";
    const ease = 1 - Math.pow(1 - Math.min(1, t / 0.6), 3); // Ease out cubic
    
    let dx = 0;
    let dy = 0;
    let scale = 1;
    
    if (preset === "classic") {
      dy = (1 - ease) * 26;
    } else if (preset === "zoom") {
      scale = 0.95 + 0.05 * ease;
    } else if (preset === "slideRight") {
      dx = (1 - ease) * -60;
    } else if (preset === "none") {
      dy = 0;
    }

    const logoAlpha = ease * (s.logoOpacity ?? 1);

    // Save and apply global cinematic preset translation/scaling to elements
    ctx.save();
    if (scale !== 1) {
      ctx.translate(W / 2, H / 2);
      ctx.scale(scale, scale);
      ctx.translate(-W / 2, -H / 2);
    }
    if (dx !== 0 || dy !== 0) {
      ctx.translate(dx, dy);
    }

    const cx = W / 2;
    const cy = H * 0.30;
    const logoSize = s.logoSize || 100;
    const animType = s.logoAnimation || "fade";
    const glowIntensity = s.glowIntensity ?? 0.6;

    // Pulse multiplier for ambient glow
    const pulse = 0.9 + 0.1 * Math.sin(t * 2.5);

    // Render glow
    if (glowIntensity > 0) {
      ctx.save();
      ctx.globalAlpha = logoAlpha * glowIntensity;
      const glowR = logoSize * (0.95 + 0.2 * pulse);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glow.addColorStop(0, hexToRgba(theme.accentLight, 0.6));
      glow.addColorStop(0.5, hexToRgba(theme.accent, 0.25));
      glow.addColorStop(1, hexToRgba(theme.accent, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Logo entrance kinematics
    let logoScale = 1;
    let logoRotation = 0;
    let logoDy = 0;

    if (animType === "zoomIn") {
      const zoomEase = Math.min(1, t / 0.65);
      // springy scale effect
      logoScale = zoomEase === 1 ? 1 : 0.2 + 0.8 * (1 + 1.70158 * Math.pow(zoomEase - 1, 3) + 1.70158 * Math.pow(zoomEase - 1, 2));
    } else if (animType === "dropIn") {
      const dropEase = Math.min(1, t / 0.7);
      logoDy = (1 - dropEase) * -65;
    } else if (animType === "rotateIn") {
      const rotEase = Math.min(1, t / 0.6);
      logoRotation = (1 - rotEase) * -0.55;
      logoScale = 0.7 + 0.3 * rotEase;
    }

    // Render Logo
    ctx.save();
    ctx.globalAlpha = logoAlpha;
    ctx.translate(cx, cy + logoDy);
    if (logoRotation !== 0) ctx.rotate(logoRotation);
    if (logoScale !== 1) ctx.scale(logoScale, logoScale);

    if (s.logoData) {
      const img = getCachedImage(s.id, s.logoData);
      if (img) {
        drawImageContain(ctx, img, 0, 0, logoSize, logoSize);
      }
    } else {
      // Elegant typographic replacement
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, logoSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = theme.accent;
      ctx.font = `900 ${Math.floor(logoSize * 0.32)}px Cairo`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.emblemText || "تقرير", 0, 0);
    }
    ctx.restore();

    // Institution Name
    ctx.save();
    ctx.globalAlpha = ease * (s.titleOpacity ?? 1);
    ctx.translate(0, dy);
    drawRichTextLine(ctx, s.ministryName || "", W / 2, H * 0.48, "center", "Tajawal", 22, theme.accentLight, "700");

    // Main Title
    ctx.fillStyle = theme.sand;
    const titleSize = s.titleSize || 52;
    ctx.font = `900 ${titleSize}px Cairo`;
    const lines = wrapLines(ctx, s.mainTitle, W * 0.75);
    const lh = titleSize + 10;
    const startY = H * 0.58 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, idx) => {
      drawRichTextLine(ctx, ln, W / 2, startY + idx * lh, "center", "Cairo", titleSize, theme.sand, "900");
    });
    ctx.restore();

    // Elegant separator line
    ctx.save();
    ctx.globalAlpha = logoAlpha;
    const dw = 180;
    const lineGradient = ctx.createLinearGradient(W / 2 - dw, 0, W / 2 + dw, 0);
    lineGradient.addColorStop(0, hexToRgba(theme.accent, 0));
    lineGradient.addColorStop(0.5, theme.accent);
    lineGradient.addColorStop(1, hexToRgba(theme.accent, 0));
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(W / 2 - dw, H * 0.74);
    ctx.lineTo(W / 2 + dw, H * 0.74);
    ctx.stroke();
    ctx.restore();

    // Month Badge
    ctx.save();
    ctx.globalAlpha = logoAlpha;
    ctx.font = "800 19px Tajawal";
    const badgeLabel = s.monthBadge || "";
    const cleanBadgeLabel = stripFormatting(badgeLabel);
    const tw = ctx.measureText(cleanBadgeLabel).width;
    const padX = 36;
    const bw = tw + padX * 2;
    const bh = 46;
    const bx = W / 2 - bw / 2;
    const by = H * 0.79;

    ctx.fillStyle = theme.accent;
    roundRect(ctx, bx, by, bw, bh, 6);
    ctx.fill();

    ctx.textBaseline = "middle";
    drawRichTextLine(ctx, badgeLabel, W / 2, by + bh / 2 + 1, "center", "Tajawal", 19, theme.ink, "800");
    ctx.restore(); // restores Month Badge context
    ctx.restore(); // restores global elements translation context
  };

  const drawSectionSlide = (ctx: CanvasRenderingContext2D, s: any, t: number, W: number, H: number) => {
    // Background Gradient
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, theme.bgDark2);
    g.addColorStop(1, theme.bgDark1);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Ambient Center Glow
    const rg = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.6);
    rg.addColorStop(0, hexToRgba(theme.accent, 0.12));
    rg.addColorStop(1, hexToRgba(theme.accent, 0));
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);

    const preset = s.animationPreset || "classic";
    const ease = 1 - Math.pow(1 - Math.min(1, t / 0.6), 3);
    
    let dx = 0;
    let dy = 0;
    let scale = 1;
    
    if (preset === "classic") {
      dy = (1 - ease) * 22;
    } else if (preset === "zoom") {
      scale = 0.95 + 0.05 * ease;
    } else if (preset === "slideRight") {
      dx = (1 - ease) * -60;
    } else if (preset === "none") {
      dy = 0;
    }

    // Save and apply global cinematic preset translation/scaling to elements
    ctx.save();
    if (scale !== 1) {
      ctx.translate(W / 2, H / 2);
      ctx.scale(scale, scale);
      ctx.translate(-W / 2, -H / 2);
    }
    if (dx !== 0 || dy !== 0) {
      ctx.translate(dx, dy);
    }

    // Stage Number
    ctx.save();
    ctx.globalAlpha = ease * 0.85;
    ctx.translate(0, 0); // dy handled by global preset context
    ctx.textBaseline = "middle";
    drawRichTextLine(ctx, s.stageNumber || "", W / 2, H * 0.28, "center", "Cairo", 32, theme.accent, "900");
    ctx.restore();

    // Divider Line
    ctx.save();
    ctx.globalAlpha = ease;
    const dw = 100;
    const lineGr = ctx.createLinearGradient(W / 2 - dw, 0, W / 2 + dw, 0);
    lineGr.addColorStop(0, hexToRgba(theme.accent, 0));
    lineGr.addColorStop(0.5, theme.accent);
    lineGr.addColorStop(1, hexToRgba(theme.accent, 0));
    ctx.strokeStyle = lineGr;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - dw, H * 0.35);
    ctx.lineTo(W / 2 + dw, H * 0.35);
    ctx.stroke();
    ctx.restore();

    // Stage Title
    ctx.save();
    ctx.globalAlpha = ease;
    ctx.translate(0, 0); // dy handled by global preset context
    ctx.fillStyle = theme.sand;
    const titleSize = s.titleSize || 44;
    ctx.font = `900 ${titleSize}px Cairo`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const lines = wrapLines(ctx, s.stageTitle, W * 0.75);
    const lh = titleSize + 8;
    const startY = H * 0.46 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      drawRichTextLine(ctx, ln, W / 2, startY + i * lh, "center", "Cairo", titleSize, theme.sand, "900");
    });
    ctx.restore();

    // Subtitle
    ctx.save();
    ctx.globalAlpha = ease * (s.subtitleOpacity ?? 1);
    ctx.translate(0, 0); // dy handled by global preset context
    ctx.fillStyle = theme.muted3;
    ctx.font = "400 19px Tajawal";
    ctx.textAlign = "center";
    const subLines = wrapLines(ctx, s.stageSubtitle, W * 0.65);
    const subLh = 28;
    const subStartY = H * 0.65;
    subLines.forEach((ln, i) => {
      drawRichTextLine(ctx, ln, W / 2, subStartY + i * subLh, "center", "Tajawal", 19, theme.muted3, "400");
    });
    ctx.restore();

    ctx.restore(); // restore the global translation context
  };

  const drawEventSlide = (ctx: CanvasRenderingContext2D, s: any, t: number, W: number, H: number) => {
    // Default abstract background
    const g = ctx.createLinearGradient(0, 0, W * 0.2, H);
    g.addColorStop(0, theme.eventBg1);
    g.addColorStop(0.5, theme.eventBg2);
    g.addColorStop(1, theme.eventBg3);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Media background with Ken Burns
    if (s.mediaList && s.mediaList.length > 0) {
      const media = s.mediaList[0];
      if (media.src) {
        const img = getCachedImage(s.id, media.src);
        if (img) {
          const kenBurnsEnabled = s.kenBurnsEnabled !== false;
          const intensity = s.kenBurnsIntensity ?? 0.07;
          
          // Compute animated Zoom and Pan
          const zoomRatio = Math.min(1, t / (s.duration || 4));
          const zoom = kenBurnsEnabled ? 1 + intensity * zoomRatio : 1;
          const offsetX = kenBurnsEnabled ? zoomRatio * 15 : 0;
          const offsetY = kenBurnsEnabled ? zoomRatio * -10 : 0;

          drawImageCover(ctx, img, 0, 0, W, H, zoom, offsetX, offsetY);
          
          // Subtle elegant dark overlay tint for text legibility
          ctx.fillStyle = "rgba(10, 15, 12, 0.22)";
          ctx.fillRect(0, 0, W, H);
        }
      }
    } else {
      // Empty media visual placeholder
      ctx.strokeStyle = hexToRgba(theme.accent, 0.25);
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, W - 60, H - 60);
      ctx.setLineDash([]);

      ctx.fillStyle = hexToRgba(theme.sand, 0.35);
      ctx.font = "500 18px Tajawal";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("قم برفع صورة أو فيديو توثيقي للفعالية من لوحة التعديل", W / 2, H / 2);
    }

    // Modern Arabic curved Date Badge in top-left
    const dx = 45;
    const dy = 45;
    const dw = 90;
    const dh = 90;

    ctx.save();
    // Glassmorphic background
    ctx.fillStyle = hexToRgba(theme.bgDark1, 0.72);
    ctx.beginPath();
    ctx.arc(dx + dw / 2, dy + dh / 2, dw / 2, 0, Math.PI * 2);
    ctx.fill();

    // Dotted Accent border
    ctx.strokeStyle = theme.accentLight;
    ctx.setLineDash([2, 5]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(dx + dw / 2, dy + dh / 2, dw / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Text Day
    ctx.setLineDash([]);
    ctx.fillStyle = theme.accentLight;
    ctx.font = "900 32px Cairo";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.day || "٠١", dx + dw / 2, dy + dh / 2 - 8);

    // Text Month
    ctx.fillStyle = theme.sand;
    ctx.font = "700 14px Tajawal";
    ctx.fillText(s.month || "", dx + dw / 2, dy + dh / 2 + 22);
    ctx.restore();

    // Bottom gradient overlay for caption backing
    const blockH = 260;
    const blockTop = H - blockH;
    const textG = ctx.createLinearGradient(0, blockTop, 0, H);
    textG.addColorStop(0, "rgba(10, 15, 12, 0)");
    textG.addColorStop(0.35, "rgba(10, 15, 12, 0.78)");
    textG.addColorStop(1, "rgba(10, 15, 12, 0.95)");
    ctx.fillStyle = textG;
    ctx.fillRect(0, blockTop, W, blockH);

    // Text reveal transition
    const preset = s.animationPreset || "classic";
    const textEase = 1 - Math.pow(1 - Math.min(1, t / 0.6), 3);
    const textAlpha = textEase * (s.textOpacity ?? 1);

    let animOffsetX = 0;
    let animOffsetY = 0;
    let scale = 1;

    if (preset === "classic") {
      animOffsetY = (1 - textEase) * 20;
    } else if (preset === "zoom") {
      scale = 0.95 + 0.05 * textEase;
    } else if (preset === "slideRight") {
      animOffsetX = (1 - textEase) * -60;
    } else if (preset === "none") {
      animOffsetY = 0;
    }

    const marginX = 50;
    let cy = H - 180;

    ctx.save();
    ctx.globalAlpha = textAlpha;
    if (scale !== 1) {
      // Scale around bottom center area
      ctx.translate(W / 2, H - 100);
      ctx.scale(scale, scale);
      ctx.translate(-W / 2, -(H - 100));
    }
    if (animOffsetX !== 0 || animOffsetY !== 0) {
      ctx.translate(animOffsetX, animOffsetY);
    }

    // 1. Category Tag with Golden vertical line
    ctx.textBaseline = "top";
    drawRichTextLine(ctx, s.catLabel || "", W - marginX - 16, cy, "right", "Tajawal", 16, theme.accent, "800");

    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(W - marginX, cy + 1);
    ctx.lineTo(W - marginX, cy + 19);
    ctx.stroke();

    cy += 30;

    // 2. Activity Title
    const textSize = s.textSize || 30;
    ctx.fillStyle = theme.sand;
    ctx.font = `900 ${textSize}px Cairo`;
    const lines = wrapLines(ctx, s.title, W - marginX * 2);
    const lh = textSize + 10;
    lines.forEach((ln) => {
      drawRichTextLine(ctx, ln, W - marginX, cy, "right", "Cairo", textSize, theme.sand, "900");
      cy += lh;
    });

    cy += 4;

    // 3. Location Description
    drawRichTextLine(ctx, s.location || "", W - marginX, cy, "right", "Tajawal", 17, theme.muted3, "300");

    ctx.restore();
  };

  const drawClosingSlide = (ctx: CanvasRenderingContext2D, s: any, t: number, W: number, H: number) => {
    // Gradient Background
    const g = ctx.createLinearGradient(0, 0, W * 0.8, H);
    g.addColorStop(0, theme.bgDark2);
    g.addColorStop(1, theme.bgDark1);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    const preset = s.animationPreset || "classic";
    const ease = 1 - Math.pow(1 - Math.min(1, t / 0.6), 3);
    
    let dx = 0;
    let dy = 0;
    let scale = 1;
    
    if (preset === "classic") {
      dy = (1 - ease) * 24;
    } else if (preset === "zoom") {
      scale = 0.95 + 0.05 * ease;
    } else if (preset === "slideRight") {
      dx = (1 - ease) * -60;
    } else if (preset === "none") {
      dy = 0;
    }

    // Global save for preset animation
    ctx.save();
    if (scale !== 1) {
      ctx.translate(W / 2, H / 2);
      ctx.scale(scale, scale);
      ctx.translate(-W / 2, -H / 2);
    }
    if (dx !== 0 || dy !== 0) {
      ctx.translate(dx, dy);
    }

    // Header Title
    ctx.save();
    ctx.globalAlpha = ease;
    ctx.translate(0, 0); // dy handled globally
    ctx.textBaseline = "middle";
    const headingSize = s.headingSize || 32;
    drawRichTextLine(ctx, s.heading || "", W / 2, H * 0.32, "center", "Cairo", headingSize, theme.accentLight, "900");
    ctx.restore();

    // Statistics Layout
    const stats = s.stats && s.stats.length ? s.stats : [];
    const cellW = 240;
    const totalW = stats.length * cellW;
    const startX = W / 2 - totalW / 2;

    const statsSize = s.statsSize || 46;
    const statsAlpha = s.statsOpacity ?? 1;
    const statsStyle = s.statsStyle || "cards";

    if (statsStyle === "bars") {
      // Vertical progress bars
      const rowH = 55;
      const totalH = stats.length * rowH;
      const startY = H * 0.44 - (totalH / 2) + 20;

      stats.forEach((st: any, i: number) => {
        const cy = startY + i * rowH;
        const localEase = 1 - Math.pow(1 - Math.min(1, Math.max(0, t - 0.15 * i) / 0.5), 3);
        const a = localEase * statsAlpha;

        ctx.save();
        ctx.globalAlpha = a;

        // Animate count and percentage value
        const parsed = parseStatNumber(st.n);
        let displayNum = st.n || "";
        let pct = 0.7; // default fill
        
        if (parsed) {
          const countRatio = Math.min(1, Math.max(0, t - 0.12 * i) / 1.5);
          const currentVal = parsed.value * countRatio;
          displayNum = formatStatValue(parsed, currentVal);
          
          if (parsed.suffix === "%" || parsed.suffix === "٪") {
            pct = Math.min(1, parsed.value / 100) * countRatio;
          } else {
            pct = Math.min(1, parsed.value / (parsed.value > 15 ? 100 : 15)) * countRatio;
          }
        }

        // Draw Row items:
        // 1. Label on the right
        drawRichTextLine(ctx, st.l || "", W / 2 + 100, cy, "right", "Tajawal", 15.5, theme.accentLight, "600");

        // 2. Value on the left
        ctx.fillStyle = theme.sand;
        ctx.font = `900 24px Cairo`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(displayNum, W / 2 - 300, cy);

        // 3. Progress Bar Track in the middle (between W/2 - 240 and W/2 + 80)
        const bx = W / 2 - 240;
        const bw = 320;
        const bh = 10;
        const by = cy - bh / 2;

        ctx.fillStyle = hexToRgba(theme.accent, 0.15);
        roundRect(ctx, bx, by, bw, bh, 5);
        ctx.fill();

        // Active Bar Fill with golden gradient
        if (pct > 0) {
          const fillW = bw * pct;
          const barG = ctx.createLinearGradient(bx, 0, bx + fillW, 0);
          barG.addColorStop(0, theme.accent);
          barG.addColorStop(1, theme.accentLight);
          ctx.fillStyle = barG;
          roundRect(ctx, bx, by, fillW, bh, 5);
          ctx.fill();
        }

        ctx.restore();
      });
    } else if (statsStyle === "pie") {
      // Horizontal Circular / Radial Donut charts
      stats.forEach((st: any, i: number) => {
        const cx = startX + i * cellW + cellW / 2;
        const localEase = 1 - Math.pow(1 - Math.min(1, Math.max(0, t - 0.15 * i) / 0.5), 3);
        const a = localEase * statsAlpha;
        const sdy = (1 - localEase) * 16;

        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(0, sdy);

        const parsed = parseStatNumber(st.n);
        let displayNum = st.n || "";
        let pct = 0.75; // default fill

        if (parsed) {
          const countRatio = Math.min(1, Math.max(0, t - 0.12 * i) / 1.5);
          const currentVal = parsed.value * countRatio;
          displayNum = formatStatValue(parsed, currentVal);

          if (parsed.suffix === "%" || parsed.suffix === "٪") {
            pct = Math.min(1, parsed.value / 100) * countRatio;
          } else {
            pct = Math.min(1, parsed.value / (parsed.value > 15 ? 100 : 15)) * countRatio;
          }
        }

        const cy = H * 0.48;
        const r = 46;

        // 1. Draw track
        ctx.strokeStyle = hexToRgba(theme.accent, 0.15);
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // 2. Draw active arc
        if (pct > 0) {
          ctx.strokeStyle = theme.accent;
          ctx.lineWidth = 8;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
          ctx.stroke();
        }

        // 3. Draw text value inside the ring
        ctx.fillStyle = theme.sand;
        const innerFontSize = Math.floor(statsSize * 0.65);
        ctx.font = `900 ${innerFontSize}px Cairo`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(displayNum, cx, cy + 1.5);

        // 4. Draw label below
        const lblLines = wrapLines(ctx, st.l || "", cellW - 20);
        lblLines.forEach((ln, lIdx) => {
          drawRichTextLine(ctx, ln, cx, H * 0.61 + lIdx * 20, "center", "Tajawal", 15.5, theme.accentLight, "600");
        });

        ctx.restore();
      });
    } else {
      // DEFAULT: cards
      stats.forEach((st: any, i: number) => {
        const cx = startX + i * cellW + cellW / 2;
        const localEase = 1 - Math.pow(1 - Math.min(1, Math.max(0, t - 0.15 * i) / 0.5), 3);
        const a = localEase * statsAlpha;
        const sdy = (1 - localEase) * 16;

        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(0, sdy);

        // Subtle rounded card glass background
        ctx.fillStyle = hexToRgba(theme.bgDark1, 0.4);
        ctx.strokeStyle = hexToRgba(theme.accent, 0.15);
        ctx.lineWidth = 1.5;
        const cardMargin = 12;
        roundRect(ctx, cx - cellW / 2 + cardMargin, H * 0.41, cellW - cardMargin * 2, 160, 10);
        ctx.fill();
        ctx.stroke();

        // Animate digits counting up
        const parsed = parseStatNumber(st.n);
        let displayNum = st.n || "";
        if (parsed) {
          const countRatio = Math.min(1, Math.max(0, t - 0.12 * i) / 1.5);
          const currentVal = parsed.value * countRatio;
          displayNum = formatStatValue(parsed, currentVal);
        }

        // Stat Value
        ctx.fillStyle = theme.sand;
        ctx.font = `900 ${statsSize}px Cairo`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(displayNum, cx, H * 0.52);

        // Stat Label
        const lblLines = wrapLines(ctx, st.l || "", cellW - 20);
        lblLines.forEach((ln, lIdx) => {
          drawRichTextLine(ctx, ln, cx, H * 0.60 + lIdx * 20, "center", "Tajawal", 16, theme.accentLight, "600");
        });

        ctx.restore();

        // Divider vertical lines between cards
        if (i > 0) {
          ctx.save();
          ctx.globalAlpha = ease * 0.35;
          ctx.strokeStyle = theme.accent;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(startX + i * cellW, H * 0.44);
          ctx.lineTo(startX + i * cellW, H * 0.63);
          ctx.stroke();
          ctx.restore();
        }
      });
    }

    // Sign-off organization tagline
    ctx.save();
    ctx.globalAlpha = ease;
    ctx.translate(0, 0); // dy handled globally
    ctx.textBaseline = "middle";
    drawRichTextLine(ctx, s.ministryName || "", W / 2, H * 0.79, "center", "Tajawal", 15.5, theme.muted, "400");
    ctx.restore();

    ctx.restore(); // restores the global preset translation context
  };

  const drawSingleSlideFrame = (
    ctx: CanvasRenderingContext2D,
    slide: Slide,
    t: number,
    W: number,
    H: number
  ) => {
    if (slide.type === "intro") drawIntroSlide(ctx, slide, t, W, H);
    else if (slide.type === "section") drawSectionSlide(ctx, slide, t, W, H);
    else if (slide.type === "event") drawEventSlide(ctx, slide, t, W, H);
    else if (slide.type === "closing") drawClosingSlide(ctx, slide, t, W, H);
  };

  const drawCanvasAtTime = (
    ctx: CanvasRenderingContext2D,
    globalSec: number,
    W: number,
    H: number
  ) => {
    const frame = getFrameAt(globalSec);
    const i = frame.index;
    const localT = frame.localT;
    const currentSlide = slides[i];

    if (!currentSlide) return;

    const transitionDuration = 0.8; // 0.8 seconds standard transition duration

    if (i > 0 && localT < transitionDuration) {
      const prevSlide = slides[i - 1];
      const transitionType = currentSlide.transition || "fade";

      if (transitionType && transitionType !== "none") {
        const progress = localT / transitionDuration;
        const prevCanvas = prevCanvasRef.current;
        const nextCanvas = nextCanvasRef.current;

        if (prevCanvas && nextCanvas) {
          const prevCtx = prevCanvas.getContext("2d")!;
          prevCtx.clearRect(0, 0, W, H);
          prevCtx.direction = "rtl";
          drawSingleSlideFrame(prevCtx, prevSlide, prevSlide.duration || 3, W, H);

          const nextCtx = nextCanvas.getContext("2d")!;
          nextCtx.clearRect(0, 0, W, H);
          nextCtx.direction = "rtl";
          drawSingleSlideFrame(nextCtx, currentSlide, localT, W, H);

          ctx.clearRect(0, 0, W, H);
          if (transitionType === "fade") {
            if (progress < 0.5) {
              ctx.save();
              ctx.globalAlpha = 1 - progress * 2;
              ctx.drawImage(prevCanvas, 0, 0);
              ctx.restore();
            } else {
              ctx.save();
              ctx.globalAlpha = (progress - 0.5) * 2;
              ctx.drawImage(nextCanvas, 0, 0);
              ctx.restore();
            }
          } else if (transitionType === "crossFade" || transitionType === "dissolve") {
            ctx.save();
            ctx.globalAlpha = 1 - progress;
            ctx.drawImage(prevCanvas, 0, 0);
            ctx.globalAlpha = progress;
            ctx.drawImage(nextCanvas, 0, 0);
            ctx.restore();
          } else if (transitionType === "slideLeft") {
            ctx.save();
            const shiftX = progress * W;
            ctx.drawImage(prevCanvas, -shiftX, 0);
            ctx.drawImage(nextCanvas, W - shiftX, 0);
            ctx.restore();
          } else if (transitionType === "slideRight") {
            ctx.save();
            const shiftX = progress * W;
            ctx.drawImage(prevCanvas, shiftX, 0);
            ctx.drawImage(nextCanvas, -W + shiftX, 0);
            ctx.restore();
          } else if (transitionType === "wipe") {
            ctx.save();
            ctx.drawImage(prevCanvas, 0, 0);
            const wipeX = W * (1 - progress);
            ctx.beginPath();
            ctx.rect(wipeX, 0, W - wipeX, H);
            ctx.clip();
            ctx.drawImage(nextCanvas, 0, 0);
            ctx.restore();

            // Soft glow border at transition edge
            ctx.save();
            ctx.shadowColor = theme.accent;
            ctx.shadowBlur = 15;
            ctx.fillStyle = theme.accent;
            ctx.fillRect(wipeX - 2, 0, 4, H);
            ctx.restore();
          } else if (transitionType === "zoomIn") {
            ctx.save();
            const prevScale = 1 + progress * 0.15;
            const prevAlpha = Math.max(0, 1 - progress);
            ctx.globalAlpha = prevAlpha;
            ctx.translate(W / 2, H / 2);
            ctx.scale(prevScale, prevScale);
            ctx.drawImage(prevCanvas, -W / 2, -H / 2);
            ctx.restore();

            ctx.save();
            const nextScale = 0.85 + progress * 0.15;
            const nextAlpha = progress;
            ctx.globalAlpha = nextAlpha;
            ctx.translate(W / 2, H / 2);
            ctx.scale(nextScale, nextScale);
            ctx.drawImage(nextCanvas, -W / 2, -H / 2);
            ctx.restore();
          } else {
            // Cut / none
            drawSingleSlideFrame(ctx, currentSlide, localT, W, H);
          }
          if (watermarkSettings.enabled) {
            drawWatermark(ctx, W, H);
          }
          return;
        }
      }
    }

    ctx.clearRect(0, 0, W, H);
    drawSingleSlideFrame(ctx, currentSlide, localT, W, H);
    if (watermarkSettings.enabled) {
      drawWatermark(ctx, W, H);
    }
  };

  const drawWatermark = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.save();
    ctx.direction = "rtl";
    
    const marginX = 40;
    const marginY = 40;
    
    const position = watermarkSettings.position || "bottom-right";
    const type = watermarkSettings.type || "default";
    const src = watermarkSettings.src;

    // Set transparency
    ctx.globalAlpha = 0.55;

    let x = 0;
    let y = 0;

    if (type === "custom" && src) {
      const img = getCachedImage("global_watermark", src);
      if (img) {
        const maxW = 90;
        const maxH = 90;
        const ir = img.width / img.height;
        let w = maxW;
        let h = maxW / ir;
        if (h > maxH) {
          h = maxH;
          w = maxH * ir;
        }

        if (position === "bottom-right") {
          x = W - marginX - w;
          y = H - marginY - h;
        } else if (position === "bottom-left") {
          x = marginX;
          y = H - marginY - h;
        } else if (position === "top-right") {
          x = W - marginX - w;
          y = marginY;
        } else { // top-left
          x = marginX;
          y = marginY;
        }

        ctx.drawImage(img, x, y, w, h);
      }
      ctx.restore();
      return;
    }

    // Default watermark text and flag
    ctx.font = "bold 13px Tajawal, sans-serif";
    
    const text = "وزارة الاقتصاد الوطني — دولة فلسطين";
    const textWidth = ctx.measureText(text).width;
    const flagWidth = 24;
    const flagHeight = 12;
    const flagSpacing = 8;

    let textX = 0;
    let textY = 0;
    let flagX = 0;
    let flagY = 0;

    if (position === "bottom-right") {
      ctx.textAlign = "right";
      textX = W - marginX;
      textY = H - marginY;
      flagX = W - marginX - textWidth - flagSpacing - flagWidth;
      flagY = textY - 10;
    } else if (position === "bottom-left") {
      ctx.textAlign = "left";
      textX = marginX + flagWidth + flagSpacing;
      textY = H - marginY;
      flagX = marginX;
      flagY = textY - 10;
    } else if (position === "top-right") {
      ctx.textAlign = "right";
      textX = W - marginX;
      textY = marginY + 15;
      flagX = W - marginX - textWidth - flagSpacing - flagWidth;
      flagY = textY - 10;
    } else { // top-left
      ctx.textAlign = "left";
      textX = marginX + flagWidth + flagSpacing;
      textY = marginY + 15;
      flagX = marginX;
      flagY = textY - 10;
    }

    // 1. Draw elegant translucent gold text
    ctx.fillStyle = "rgba(228, 199, 102, 0.55)"; // Elegant translucent gold
    ctx.fillText(text, textX, textY);
    
    // 2. Draw real Palestinian flag at the end of the text
    drawPalestinianFlag(ctx, flagX, flagY, flagWidth, flagHeight);

    ctx.restore();
  };

  const drawPalestinianFlag = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.save();
    
    // Tiny bordered rectangle for contrast
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    
    const stripeHeight = height / 3;

    // 1. Top stripe (Black)
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y, width, stripeHeight);

    // 2. Middle stripe (White)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x, y + stripeHeight, width, stripeHeight);

    // 3. Bottom stripe (Green)
    ctx.fillStyle = "#007A3D"; // Palestinian Green
    ctx.fillRect(x, y + stripeHeight * 2, width, stripeHeight);

    // 4. Red Triangle on the hoist side (left)
    ctx.fillStyle = "#E4312B"; // Palestinian Red
    ctx.beginPath();
    ctx.moveTo(x, y); // Top-left
    ctx.lineTo(x + width / 3, y + height / 2); // Center-right point of triangle
    ctx.lineTo(x, y + height); // Bottom-left
    ctx.closePath();
    ctx.fill();

    // Subtle border for visibility
    ctx.strokeRect(x, y, width, height);

    ctx.restore();
  };

  const drawSlideFrame = (
    ctx: CanvasRenderingContext2D,
    slide: Slide,
    t: number,
    W: number,
    H: number
  ) => {
    ctx.clearRect(0, 0, W, H);
    drawSingleSlideFrame(ctx, slide, t, W, H);
  };

  /* ================= PLAYBACK SYSTEM ================= */
  // Find which slide is playing at the global elapsed time
  const getFrameAt = (globalSec: number) => {
    let acc = 0;
    for (let i = 0; i < slides.length; i++) {
      const d = slides[i].duration || 3;
      if (globalSec < acc + d || i === slides.length - 1) {
        return { index: i, localT: Math.max(0, globalSec - acc) };
      }
      acc += d;
    }
    return { index: 0, localT: 0 };
  };

  // Effect 1: Draw static/seeking frame when NOT actively playing
  useEffect(() => {
    if (isPlaying) return; // Only draw statics when not playing

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.direction = "rtl";

    const W = canvas.width;
    const H = canvas.height;

    const s = slides[activeSlideIndex];
    if (s) {
      // Calculate local time within the active slide
      let acc = 0;
      for (let i = 0; i < activeSlideIndex; i++) {
        acc += slides[i].duration || 3;
      }
      const localT = Math.max(0, currentTime - acc);

      // If localT is exactly 0 (such as after clicking a slide in the side menu),
      // we render the fully formed design state of the slide (s.duration) for editing.
      // Otherwise, we draw the exact frame at that exact elapsed time.
      if (localT === 0) {
        ctx.clearRect(0, 0, W, H);
        drawSingleSlideFrame(ctx, s, s.duration || 3, W, H);
        if (watermarkSettings.enabled) {
          drawWatermark(ctx, W, H);
        }
      } else {
        drawCanvasAtTime(ctx, currentTime, W, H);
      }
    }
  }, [isPlaying, currentTime, activeSlideIndex, slides, theme, rerenderKey, watermarkSettings]);

  // Effect 2: Ultra-smooth, non-blocking 60 FPS active playback loop (no currentTime in deps!)
  useEffect(() => {
    if (!isPlaying) return; // Only run playback loop when active

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.direction = "rtl";

    const W = canvas.width;
    const H = canvas.height;

    let startTs: number | null = null;
    let animFrameId: number;
    let lastStateUpdateTs = 0;

    // Capture precise play starting second from our synchronized ref
    const startSec = currentTimeRef.current;

    const playAudio = () => {
      if (audioRef.current && globalAudio.data && audioRef.current.paused) {
        audioRef.current.currentTime = startSec;
        audioRef.current.play().catch((err) => console.log("Audio play blocked", err));
      }
    };

    const stopAudio = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };

    playAudio();

    const renderLoop = (ts: number) => {
      if (!startTs) startTs = ts;
      const elapsedReal = (ts - startTs) / 1000;
      const elapsed = startSec + elapsedReal;

      if (elapsed >= totalDuration) {
        // Playback completed
        setCurrentTime(0);
        setIsPlaying(false);
        onActiveSlideChange(0);
        stopAudio();
        return;
      }

      // Sync ref instantly for smooth rendering and frame alignment
      currentTimeRef.current = elapsed;

      // Detect slide crossing boundaries and synchronize selection
      const frame = getFrameAt(elapsed);
      if (frame.index !== activeSlideIndexRef.current) {
        activeSlideIndexRef.current = frame.index;
        onActiveSlideChange(frame.index);
      }

      // Smooth canvas render at 60 FPS
      drawCanvasAtTime(ctx, elapsed, W, H);

      // Throttled UI state updates for slider to reduce React DOM re-render cost (10 FPS is plenty for seeker)
      if (ts - lastStateUpdateTs > 100) {
        setCurrentTime(elapsed);
        lastStateUpdateTs = ts;
      }

      animFrameId = requestAnimationFrame(renderLoop);
    };

    animFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animFrameId);
      stopAudio();
    };
  }, [isPlaying, totalDuration, slides, theme, watermarkSettings, globalAudio.data]);

  const togglePlayback = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (val: number) => {
    setIsPlaying(false);
    setCurrentTime(val);
    const frame = getFrameAt(val);
    onActiveSlideChange(frame.index);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  /* ================= EXPORT SYSTEM ================= */
  const exportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.captureStream) {
      alert("متصفحك لا يدعم تصدير الفيديو المباشر من الـ Canvas. يرجى استخدام متصفح Chrome أو Edge.");
      return;
    }

    setIsPlaying(false);
    setIsExporting(true);
    setExportProgress(0);
    setExportStatusText("جاري ضبط دقة الفيديو وأبعاد العرض...");

    // Adjust canvas resolution dynamically
    const exportW = exportResolution === "1080p" ? 1920 : 1280;
    const exportH = exportResolution === "1080p" ? 1080 : 720;
    canvas.width = exportW;
    canvas.height = exportH;

    // Update transition buffer canvas sizes
    if (prevCanvasRef.current) {
      prevCanvasRef.current.width = exportW;
      prevCanvasRef.current.height = exportH;
    }
    if (nextCanvasRef.current) {
      nextCanvasRef.current.width = exportW;
      nextCanvasRef.current.height = exportH;
    }

    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext("2d")!;

    // 30 FPS high fidelity output stream
    const stream = canvas.captureStream(30);

    // Audio node compilation setup
    let audioCtx: AudioContext | null = null;
    let recorderStream = stream;
    let exportAudio: HTMLAudioElement | null = null;

    if (globalAudio.data) {
      try {
        setExportStatusText("جاري دمج ملف الموسيقى التصويرية...");
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        exportAudio = new Audio(globalAudio.data);
        exportAudio.crossOrigin = "anonymous";
        exportAudio.volume = globalAudio.volume;
        exportAudio.currentTime = 0;
        exportAudio.loop = true;
        
        const source = audioCtx.createMediaElementSource(exportAudio);
        const dest = audioCtx.createMediaStreamDestination();
        
        source.connect(dest);
        source.connect(audioCtx.destination); // Feed back to speakers

        const audioTracks = dest.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          stream.addTrack(audioTracks[0]);
        }
      } catch (err) {
        console.error("Audio Context merge failed, continuing silent export", err);
      }
    }

    // Determine compatible recorder format
    let mimeType = "video/webm;codecs=vp9";
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm;codecs=vp8";
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm";

    const recorder = new MediaRecorder(recorderStream, {
      mimeType,
      videoBitsPerSecond: 6000000, // 6 Mbps high-fidelity
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      // Restore canvas preview size
      canvas.width = 1280;
      canvas.height = 720;
      if (prevCanvasRef.current) {
        prevCanvasRef.current.width = 1280;
        prevCanvasRef.current.height = 720;
      }
      if (nextCanvasRef.current) {
        nextCanvasRef.current.width = 1280;
        nextCanvasRef.current.height = 720;
      }
      triggerRerender();

      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsExporting(false);
      setExportStatusText("");
      
      // Auto trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = `التقرير-الشهري-${new Date().getFullYear()}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    // Begin recording sequence
    recorder.start();
    if (exportAudio) {
      exportAudio.currentTime = 0;
      exportAudio.play().catch((err) => console.log("Export audio play blocked", err));
    }

    const stepsCount = totalDuration * 30; // 30 frames per second
    let currentStep = 0;

    const renderExportStep = () => {
      if (currentStep >= stepsCount) {
        // Complete
        setExportStatusText("جاري معالجة وتصدير ملف الفيديو النهائي...");
        setTimeout(() => {
          if (exportAudio) {
            exportAudio.pause();
          }
          recorder.stop();
          if (audioCtx) audioCtx.close();
        }, 300);
        return;
      }

      const elapsed = (currentStep / stepsCount) * totalDuration;

      drawCanvasAtTime(ctx, elapsed, W, H);
      
      const pct = Math.round((currentStep / stepsCount) * 100);
      setExportProgress(pct);
      setExportStatusText(`جاري تسجيل الفيديو: إطار ${currentStep} / ${Math.floor(stepsCount)} (${pct}%)`);

      currentStep++;
      // Render faster than real-time inside requestAnimationFrame
      requestAnimationFrame(renderExportStep);
    };

    requestAnimationFrame(renderExportStep);
  };

  const formatSeconds = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* HTML5 HD Canvas Rendering stage */}
      <div className="relative w-full max-w-[720px] aspect-video border border-amber-500/20 bg-black rounded-xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]">
        <canvas
          ref={canvasRef}
          width="1280"
          height="720"
          className="w-full h-full object-contain"
        />

        {/* Dynamic Loading/Progress Overlay for Export */}
        {isExporting && (
          <div className="absolute inset-0 bg-[#0A0F0C]/94 flex flex-col items-center justify-center p-6 text-center z-40">
            <RefreshCw className="w-12 h-12 text-[#C9A227] animate-spin mb-4" />
            <h3 className="text-xl font-bold font-display text-white mb-2">جاري تصدير الفيديو بجودة عالية</h3>
            <p className="text-sm text-gray-400 mb-6 font-sans max-w-[450px] leading-relaxed">
              {exportStatusText}
            </p>
            
            {/* Custom high-contrast progress bar */}
            <div className="w-full max-w-xs h-3 bg-emerald-950/50 rounded-full overflow-hidden border border-amber-500/10 mb-2">
              <div
                className="h-full bg-gradient-to-r from-[#C9A227] to-[#E4C766] transition-all duration-75"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            <span className="text-sm font-mono text-[#E4C766] font-bold">{exportProgress}%</span>
          </div>
        )}
      </div>

      {/* Control console bar */}
      <div className="w-full max-w-[720px] bg-emerald-950/20 border border-amber-500/10 p-4 rounded-xl flex flex-wrap items-center gap-4">
        {/* Playback Trigger */}
        <button
          onClick={togglePlayback}
          disabled={isExporting}
          className="w-11 h-11 flex items-center justify-center rounded-lg bg-[#C9A227] hover:bg-[#E4C766] text-[#0A2C21] font-bold transition duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          title={isPlaying ? "إيقاف مؤقت" : "تشغيل المعاينة"}
        >
          {isPlaying ? <Pause className="w-5.5 h-5.5 fill-current" /> : <Play className="w-5.5 h-5.5 fill-current" />}
        </button>

        {/* Video Download/Export Trigger */}
        <button
          onClick={exportVideo}
          disabled={isExporting || slides.length === 0}
          className="h-11 px-5 flex items-center gap-2 rounded-lg border border-[#C9A227] hover:bg-[#C9A227]/10 text-[#E4C766] font-bold text-sm transition duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>تصدير فيديو MP4</span>
        </button>

        {/* Seekable Range slider timeline */}
        <div className="flex-1 flex items-center gap-3 min-w-[180px]">
          <span className="text-xs font-mono text-gray-400 select-none">
            {formatSeconds(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={totalDuration || 1}
            step={0.05}
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            disabled={isExporting}
            className="flex-1 h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-[#C9A227] focus:outline-none"
          />
          <span className="text-xs font-mono text-gray-400 select-none">
            {formatSeconds(totalDuration)}
          </span>
        </div>

        {/* Audio helper notifier */}
        {globalAudio.data && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full bg-emerald-950/40">
            <Volume2 className="w-3.5 h-3.5" />
            <span className="max-w-[80px] truncate" title={globalAudio.filename}>
              {globalAudio.filename}
            </span>
          </div>
        )}
      </div>

      {/* Advanced Settings & Toggles Row */}
      <div className="w-full max-w-[720px] bg-emerald-950/10 border border-amber-500/5 px-4 py-3 rounded-xl flex flex-col gap-3 -mt-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-amber-500/10 pb-2">
          <button
            type="button"
            onClick={() => setActiveSettingsTab("branding")}
            className={`px-3 py-1.5 rounded-md text-xs font-sans transition cursor-pointer flex items-center gap-1.5 ${
              activeSettingsTab === "branding"
                ? "bg-[#C9A227]/20 text-[#E4C766] font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>⚜️ الهوية والعلامة المائية</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSettingsTab("audio")}
            className={`px-3 py-1.5 rounded-md text-xs font-sans transition cursor-pointer flex items-center gap-1.5 ${
              activeSettingsTab === "audio"
                ? "bg-[#C9A227]/20 text-[#E4C766] font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>🎵 الموسيقى والخلفية الصوتية</span>
          </button>
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 font-sans">الدقة:</span>
            <select
              value={exportResolution}
              onChange={(e) => setExportResolution(e.target.value as "720p" | "1080p")}
              className="bg-[#0e1f18] border border-amber-500/10 rounded-lg px-2 py-0.5 text-xs text-gray-200 cursor-pointer focus:outline-none focus:border-[#C9A227]"
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Branding & Watermark */}
        {activeSettingsTab === "branding" && (
          <div className="flex flex-col gap-3 pt-1 transition-all duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={watermarkSettings.enabled}
                  onChange={(e) => onWatermarkSettingsChange({ ...watermarkSettings, enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-amber-500/20 text-[#C9A227] focus:ring-0 focus:ring-offset-0 accent-[#C9A227] bg-[#0e1f18]"
                />
                <span className="text-gray-300 font-sans font-medium">إضافة العلامة المائية للتقرير</span>
              </label>
            </div>

            {watermarkSettings.enabled && (
              <div className="flex flex-col gap-3 pt-2.5 border-t border-amber-500/5 text-xs">
                {/* Logo Type selection */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-gray-400 font-sans">هوية العلامة:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onWatermarkSettingsChange({ ...watermarkSettings, type: "default" })}
                      className={`py-1 px-3 rounded-md text-[11px] font-sans transition cursor-pointer border ${
                        watermarkSettings.type === "default"
                          ? "bg-[#C9A227]/10 text-[#E4C766] border-[#C9A227]/30 font-bold"
                          : "bg-[#0e1f18] text-gray-400 border-transparent hover:text-white"
                      }`}
                    >
                      شعار فلسطين والوزارة (الافتراضي)
                    </button>
                    <button
                      type="button"
                      onClick={() => onWatermarkSettingsChange({ ...watermarkSettings, type: "custom" })}
                      className={`py-1 px-3 rounded-md text-[11px] font-sans transition cursor-pointer border ${
                        watermarkSettings.type === "custom"
                          ? "bg-[#C9A227]/10 text-[#E4C766] border-[#C9A227]/30 font-bold"
                          : "bg-[#0e1f18] text-gray-400 border-transparent hover:text-white"
                      }`}
                    >
                      شعار مؤسساتي مخصص
                    </button>
                  </div>
                </div>

                {watermarkSettings.type === "custom" && (
                  <div className="flex items-center gap-3 bg-[#0e1f18] p-2.5 rounded-lg border border-amber-500/5 max-w-[420px]">
                    {watermarkSettings.src ? (
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-2 max-w-[80%]">
                          <img src={watermarkSettings.src} className="w-7 h-7 object-contain bg-emerald-950/20 rounded border border-amber-500/15" alt="watermark-logo" />
                          <span className="text-[10px] text-gray-300 truncate font-sans">الشعار المرفوع جاهز للدمج</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onWatermarkSettingsChange({ ...watermarkSettings, src: null })}
                          className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer font-sans"
                        >
                          إزالة
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-900/30 text-gray-300 text-[10px] font-sans cursor-pointer transition w-full text-center">
                        <span>➕ رفع شعار بصيغة PNG شفافة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                onWatermarkSettingsChange({ ...watermarkSettings, src: ev.target.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}

                {/* Logo position buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                  <span className="text-gray-400 font-sans">موقع الشعار المائي:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: "bottom-right", label: "أسفل اليمين" },
                      { value: "bottom-left", label: "أسفل اليسار" },
                      { value: "top-right", label: "أعلى اليمين" },
                      { value: "top-left", label: "أعلى اليسار" }
                    ].map((pos) => {
                      const isSel = watermarkSettings.position === pos.value;
                      return (
                        <button
                          key={pos.value}
                          type="button"
                          onClick={() => onWatermarkSettingsChange({ ...watermarkSettings, position: pos.value as any })}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-sans transition-all duration-150 cursor-pointer ${
                            isSel
                              ? "bg-[#C9A227]/20 text-[#E4C766] border border-[#C9A227]/40 font-bold"
                              : "bg-[#0e1f18]/40 text-gray-400 hover:text-gray-200 border border-transparent"
                          }`}
                        >
                          {pos.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Curated & Custom Audio */}
        {activeSettingsTab === "audio" && (
          <div className="flex flex-col gap-3 pt-1 transition-all duration-200 text-xs">
            {/* Built-in Track Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-gray-400 font-sans">اختر مقطعاً موسيقياً ملائماً لطبيعة التقرير:</span>
              <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto bg-[#0e1f18] p-2 rounded-lg border border-amber-500/5">
                {/* Silence Option */}
                <button
                  type="button"
                  onClick={() => onUpdateGlobalAudio({ data: null, filename: "", volume: globalAudio.volume })}
                  className={`w-full py-1.5 px-3 rounded-md text-right text-[11px] font-sans transition cursor-pointer border flex items-center justify-between ${
                    globalAudio.data === null
                      ? "bg-[#C9A227]/10 text-[#E4C766] border-[#C9A227]/30 font-bold"
                      : "bg-transparent text-gray-400 border-transparent hover:text-white"
                  }`}
                >
                  <span>🔇 عرض صامت (بدون خلفية صوتية)</span>
                  {globalAudio.data === null && <span className="text-[9px] bg-[#C9A227]/20 px-1.5 py-0.2 rounded">نشط</span>}
                </button>

                {/* Built-in Tracks List */}
                {BUILTIN_TRACKS.map((track) => {
                  const isActive = globalAudio.filename === track.filename;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => onUpdateGlobalAudio({ data: track.url, filename: track.filename, volume: globalAudio.volume })}
                      className={`w-full py-1.5 px-3 rounded-md text-right text-[11px] font-sans transition cursor-pointer border flex items-center justify-between ${
                        isActive
                          ? "bg-[#C9A227]/10 text-[#E4C766] border-[#C9A227]/30 font-bold"
                          : "bg-transparent text-gray-400 border-transparent hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <FileAudio className="w-3.5 h-3.5 text-amber-500" />
                        <span>{track.name}</span>
                      </span>
                      {isActive && <span className="text-[9px] bg-[#C9A227]/20 px-1.5 py-0.2 rounded">نشط</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Audio Upload and Volume row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2.5 border-t border-amber-500/5">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 py-1 px-3 rounded bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-900/30 text-gray-300 text-[10.5px] font-sans cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>أو ارفع ملف موسيقي من جهازك (MP3)</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          onUpdateGlobalAudio({
                            data: ev.target.result as string,
                            filename: file.name,
                            volume: globalAudio.volume,
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>

                {globalAudio.data && (
                  <button
                    type="button"
                    onClick={() => onUpdateGlobalAudio({ data: null, filename: "", volume: globalAudio.volume })}
                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-0.5 py-1 px-2 rounded hover:bg-rose-950/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                )}
              </div>

              {/* Volume slide control */}
              <div className="flex items-center gap-2 min-w-[140px]">
                <Volume2 className="w-3.5 h-3.5 text-[#C9A227]" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={globalAudio.volume}
                  onChange={(e) => onUpdateGlobalAudio({ ...globalAudio, volume: parseFloat(e.target.value) })}
                  className="flex-1 h-1 bg-[#0e1f18] rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
                  title="مستوى الصوت للموسيقى التصويرية"
                />
                <span className="text-[10px] font-mono text-gray-400 w-6">
                  {Math.round(globalAudio.volume * 100)}%
                </span>
              </div>
            </div>

            {/* Smart Fade-out indicator */}
            <div className="text-[10px] text-[#E4C766]/80 bg-[#C9A227]/5 border border-[#C9A227]/10 p-2 rounded-lg leading-relaxed mt-1 flex items-start gap-1">
              <span>💡</span>
              <span>يتميز النظام بـ <strong>خفوت الصوت تدريجياً (Audio Fade-out)</strong> تلقائياً وبنعومة تامة خلال آخر ثانيتين من الفيديو الختامي لمنع انقطاع الصوت المفاجئ وضمان جودة إخراج احترافية للعمل!</span>
            </div>
          </div>
        )}
      </div>

      {downloadUrl && (
        <a
          href={downloadUrl}
          download="التقرير-الشهري.webm"
          className="text-sm font-sans text-[#E4C766] underline hover:text-[#C9A227] font-medium"
        >
          إذا لم يبدأ تنزيل الفيديو تلقائياً، اضغط هنا للتحميل المباشر
        </a>
      )}

      {/* Audio element for playback syncing */}
      {globalAudio.data && (
        <audio
          ref={audioRef}
          id="backgroundAudio"
          src={globalAudio.data}
          crossOrigin="anonymous"
          style={{ display: "none" }}
          loop={true}
        />
      )}
    </div>
  );
};
