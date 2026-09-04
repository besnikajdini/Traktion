// Grouping/icon metadata for the muscle and equipment filter pickers. The
// backend (GET /exercises/filters) returns plain strings sourced from the
// vendored exercises dataset — not a fixed enum — so every lookup here is
// defensive: an unrecognized value still renders (fallback icon/group)
// instead of being silently dropped.
import type { ComponentType } from 'react';
import * as Icons from '../components/icons';
import type { IconProps } from '../components/icons';

export type FilterIconComponent = ComponentType<IconProps>;

export interface FilterOptionMeta {
  value: string;
  label: string;
  Icon: FilterIconComponent;
}

export interface BodyPartGroup {
  title: string;
  entries: FilterOptionMeta[];
}

export const BODY_PART_GROUPS: BodyPartGroup[] = [
  {
    title: 'Upper Body',
    entries: [
      { value: 'chest', label: 'Chest', Icon: Icons.ChestIcon },
      { value: 'back', label: 'Back', Icon: Icons.BackIcon },
      { value: 'shoulders', label: 'Shoulders', Icon: Icons.ShouldersIcon },
      { value: 'upper arms', label: 'Upper Arms', Icon: Icons.ArmsIcon },
      { value: 'lower arms', label: 'Lower Arms', Icon: Icons.ArmsIcon },
    ],
  },
  {
    title: 'Lower Body',
    entries: [
      { value: 'upper legs', label: 'Upper Legs', Icon: Icons.LegsIcon },
      { value: 'lower legs', label: 'Lower Legs', Icon: Icons.LegsIcon },
    ],
  },
  {
    title: 'Other',
    entries: [
      { value: 'waist', label: 'Waist', Icon: Icons.WaistIcon },
      { value: 'cardio', label: 'Cardio', Icon: Icons.CardioIcon },
      { value: 'neck', label: 'Neck', Icon: Icons.NeckIcon },
    ],
  },
];

export const EQUIPMENT_ICON_MAP: Record<string, FilterIconComponent> = {
  barbell: Icons.BarbellIcon,
  'olympic barbell': Icons.BarbellIcon,
  'ez barbell': Icons.BarbellIcon,
  'trap bar': Icons.BarbellIcon,
  dumbbell: Icons.DumbbellIcon,
  'leverage machine': Icons.MachineIcon,
  'smith machine': Icons.MachineIcon,
  'elliptical machine': Icons.MachineIcon,
  'skierg machine': Icons.MachineIcon,
  'sled machine': Icons.MachineIcon,
  'stepmill machine': Icons.MachineIcon,
  cable: Icons.CableIcon,
  kettlebell: Icons.KettlebellIcon,
  band: Icons.BandIcon,
  'resistance band': Icons.BandIcon,
  'bosu ball': Icons.BallIcon,
  'medicine ball': Icons.BallIcon,
  'stability ball': Icons.BallIcon,
  'body weight': Icons.BodyweightIcon,
  assisted: Icons.BodyweightIcon,
  'stationary bike': Icons.BikeIcon,
  'upper body ergometer': Icons.BikeIcon,
};

export const DEFAULT_EQUIPMENT_ICON: FilterIconComponent = Icons.MiscEquipmentIcon;

export function getEquipmentIcon(rawValue: string): FilterIconComponent {
  return EQUIPMENT_ICON_MAP[rawValue.toLowerCase().trim()] ?? DEFAULT_EQUIPMENT_ICON;
}

export function getBodyPartMeta(rawValue: string): FilterOptionMeta {
  const normalized = rawValue.toLowerCase().trim();
  for (const group of BODY_PART_GROUPS) {
    const found = group.entries.find((entry) => entry.value === normalized);
    if (found) return found;
  }
  return { value: rawValue, label: rawValue, Icon: Icons.WaistIcon };
}
