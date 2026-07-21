export type SlideType = 'intro' | 'section' | 'event' | 'closing';

export interface StatItem {
  n: string; // The statistic value (e.g. "٢٥+", "٩٠٪")
  l: string; // The statistic label (e.g. "ورشة عمل", "منشأة مستفيدة")
}

export interface MediaItem {
  type: 'image' | 'video';
  src: string; // Base64 data or object URL
}

export type SlideTransition = 
  | 'none' 
  | 'fade' 
  | 'slideLeft' 
  | 'slideRight' 
  | 'slideUp' 
  | 'slideDown' 
  | 'zoomIn' 
  | 'zoomOut' 
  | 'dissolve' 
  | 'wipe' 
  | 'shutter' 
  | 'glitch' 
  | 'flip' 
  | 'crossFade';

export interface BaseSlide {
  id: string;
  type: SlideType;
  duration: number;
  transition?: SlideTransition;
  animationPreset?: 'classic' | 'zoom' | 'slideRight' | 'slideLeft' | 'fadeOnly' | 'bounce' | 'spring' | 'none'; // Element-level cinematic motion presets
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
  statsStyle?: 'cards' | 'bars' | 'pie' | 'grid' | 'kpis'; // Style of stats display (bars, pie charts, stats cards, 2D grid, or KPI blocks)
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
  fontDisplay?: string;
  fontBody?: string;
}

export type ThemeName = 
  | 'emerald' 
  | 'navy' 
  | 'burgundy' 
  | 'charcoal' 
  | 'bronze' 
  | 'turquoise' 
  | 'sandstone' 
  | 'platinum' 
  | 'royalNavy' 
  | 'imperialPurple'
  | 'olive'
  | 'ruby'
  | 'amber'
  | 'slate'
  | 'forest'
  | 'ocean';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  plan: 'free' | 'pro' | 'enterprise';
  exportQuotaLimit: number;
  exportQuotaCurrent: number;
  watermarkCustomAllowed: boolean;
  videoDurationLimit: number; // in seconds
}

export interface SavedProject {
  id: string;
  name: string;
  slides: Slide[];
  theme: ThemeName;
  createdAt: string;
  updatedAt: string;
  audioFilename?: string;
  audioUrl?: string;
  fontDisplay?: string;
  fontBody?: string;
  activeTemplateId?: string | null;
}
