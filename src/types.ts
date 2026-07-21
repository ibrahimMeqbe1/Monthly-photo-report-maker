export type SlideType = 'intro' | 'section' | 'event' | 'closing';

export interface StatItem {
  n: string; // The statistic value (e.g. "٢٥+", "٩٠٪")
  l: string; // The statistic label (e.g. "ورشة عمل", "منشأة مستفيدة")
}

export interface MediaItem {
  type: 'image' | 'video';
  src: string; // Base64 data or object URL
}

export type SlideTransition = 'none' | 'fade' | 'slideLeft' | 'slideRight' | 'zoomIn' | 'dissolve' | 'wipe' | 'crossFade';

export interface BaseSlide {
  id: string;
  type: SlideType;
  duration: number;
  transition?: SlideTransition;
  animationPreset?: 'classic' | 'zoom' | 'slideRight' | 'none'; // Element-level cinematic motion presets
}

export interface IntroSlide extends BaseSlide {
  type: 'intro';
  ministryName: string;
  mainTitle: string;
  monthBadge: string;
  emblemText: string;
  logoData?: string; // Base64 uploaded logo
  logoSize: number;
  logoOpacity: number;
  logoAnimation: 'fade' | 'zoomIn' | 'dropIn' | 'rotateIn';
  glowIntensity: number;
  titleSize: number;
  titleOpacity: number;
}

export interface SectionSlide extends BaseSlide {
  type: 'section';
  stageNumber: string;
  stageTitle: string;
  stageSubtitle: string;
  titleSize: number;
  subtitleOpacity: number;
}

export interface EventSlide extends BaseSlide {
  type: 'event';
  catLabel: string;
  title: string;
  location: string;
  day: string;
  month: string;
  mediaList: MediaItem[];
  transition?: SlideTransition;
  kenBurnsEnabled: boolean;
  kenBurnsIntensity: number;
  textSize: number;
  textOpacity: number;
}

export interface ClosingSlide extends BaseSlide {
  type: 'closing';
  heading: string;
  ministryName: string;
  stats: StatItem[];
  headingSize: number;
  statsSize: number;
  statsOpacity: number;
  statsStyle?: 'cards' | 'bars' | 'pie'; // Style of stats display (bars, pie charts, or stats cards)
}

export type Slide = IntroSlide | SectionSlide | EventSlide | ClosingSlide;

export interface ThemeColors {
  label: string;
  bgDark1: string;
  bgDark2: string;
  eventBg1: string;
  eventBg2: string;
  eventBg3: string;
  accent: string;
  accentLight: string;
  sand: string;
  ink: string;
  muted: string;
  muted2: string;
  muted3: string;
  swatchCss: string;
}

export type ThemeName = 'emerald' | 'navy' | 'burgundy' | 'charcoal';
