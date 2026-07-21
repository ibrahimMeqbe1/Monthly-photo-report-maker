import { ThemeColors, ThemeName } from "../types";

export const THEMES: Record<ThemeName, ThemeColors> = {
  emerald: {
    label: 'الزمرد الملكي',
    bgDark1: '#0F3D2E',
    bgDark2: '#0A2C21',
    eventBg1: '#1C3A2E',
    eventBg2: '#12251D',
    eventBg3: '#0A1510',
    accent: '#C9A227',
    accentLight: '#E4C766',
    sand: '#F3EEE1',
    ink: '#141814',
    muted: '#8fa093',
    muted2: '#9aa39c',
    muted3: '#c7cdc4',
    swatchCss: 'linear-gradient(135deg, #0F3D2E, #C9A227)'
  },
  navy: {
    label: 'الكحلي الرسمي',
    bgDark1: '#0B2545',
    bgDark2: '#081B33',
    eventBg1: '#13355C',
    eventBg2: '#0B1E36',
    eventBg3: '#050E1A',
    accent: '#C9A227',
    accentLight: '#E4C766',
    sand: '#F0F3F8',
    ink: '#0B2545',
    muted: '#8a97ab',
    muted2: '#9aa7ba',
    muted3: '#c7cfd9',
    swatchCss: 'linear-gradient(135deg, #0B2545, #C9A227)'
  },
  burgundy: {
    label: 'العنابي الفاخر',
    bgDark1: '#4A1620',
    bgDark2: '#331017',
    eventBg1: '#5C1D29',
    eventBg2: '#3D131B',
    eventBg3: '#1F0A0E',
    accent: '#D4AF37',
    accentLight: '#E9C972',
    sand: '#F5ECE7',
    ink: '#2b0d12',
    muted: '#b08a8a',
    muted2: '#c19a9a',
    muted3: '#d9bcbc',
    swatchCss: 'linear-gradient(135deg, #4A1620, #D4AF37)'
  },
  charcoal: {
    label: 'الفحمي الفضي',
    bgDark1: '#2b2f33',
    bgDark2: '#1c1f22',
    eventBg1: '#3D4247',
    eventBg2: '#222528',
    eventBg3: '#141618',
    accent: '#B7C0C8',
    accentLight: '#DCE3E8',
    sand: '#F2F3F4',
    ink: '#1c1f22',
    muted: '#9aa0a5',
    muted2: '#a8adb2',
    muted3: '#c7ccd0',
    swatchCss: 'linear-gradient(135deg, #2b2f33, #B7C0C8)'
  }
};
