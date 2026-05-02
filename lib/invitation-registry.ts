import { lazy, ComponentType } from 'react';
import { BaseTemplateProps } from '@/types/invitation.types';

// Lazy load setiap template untuk code splitting
const templateRegistry: Record<string, () => Promise<{ default: ComponentType<BaseTemplateProps> }>> = {
  'jawa/JawaKlasik': () => import('@/components/invitation-templates/jawa/JawaKlasik'),
  'jawa/JawaModern': () => import('@/components/invitation-templates/jawa/JawaModern'),
  'sunda/SundaPastel': () => import('@/components/invitation-templates/sunda/SundaPastel'),
  'betawi/BetawiKencana': () => import('@/components/invitation-templates/betawi/BetawiKencana'),
  'batak/BatakUlos': () => import('@/components/invitation-templates/batak/BatakUlos'),
  'minang/MinangSongket': () => import('@/components/invitation-templates/minang/MinangSongket'),
  'modern/ModernMinimal': () => import('@/components/invitation-templates/modern/ModernMinimal'),
  'modern/ModernRomantic': () => import('@/components/invitation-templates/modern/ModernRomantic'),
  'islami/IslamiElegan': () => import('@/components/invitation-templates/islami/IslamiElegan'),
  'bugis/BugisBodo': () => import('@/components/invitation-templates/bugis/BugisBodo'),
  'melayu/MelayuSongket': () => import('@/components/invitation-templates/melayu/MelayuSongket'),
  'palembang/PalembangSongket': () => import('@/components/invitation-templates/palembang/PalembangSongket'),
  'dayak/DayakBorneo': () => import('@/components/invitation-templates/dayak/DayakBorneo'),
  'ntt/NTTTenun': () => import('@/components/invitation-templates/ntt/NTTTenun'),
  'papua/PapuaCendrawasih': () => import('@/components/invitation-templates/papua/PapuaCendrawasih'),
  'custom/CustomErland': () => import('@/components/invitation-templates/custom/CustomErland'),
};

export function getTemplateLoader(componentPath: string) {
  return templateRegistry[componentPath] || null;
}

export const REGION_LABELS: Record<string, string> = {
  'JAWA': '🏛️ Jawa',
  'SUNDA': '🌿 Sunda',
  'BETAWI': '🎭 Betawi',
  'BATAK': '🦅 Batak',
  'MINANG': '🏠 Minang',
  'MODERN': '💍 Modern',
  'ISLAMI': '🕌 Islami',
  'BUGIS': '⚓ Bugis',
  'MELAYU': '🌙 Melayu',
  'PALEMBANG': '🌺 Palembang',
  'KALIMANTAN': '🌿 Kalimantan',
  'NTT': '🏝️ NTT',
  'PAPUA': '🦜 Papua',
  'BALI': '🌺 Bali',
  'TORAJA': '🏔️ Toraja',
  'CUSTOM': '🎨 Custom Design',
};

export const ALL_REGIONS = Object.keys(REGION_LABELS);
