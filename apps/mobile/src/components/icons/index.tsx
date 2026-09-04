// Minimal line-icon set for the muscle/equipment filter pickers. Custom SVG
// (react-native-svg, already a project dependency) rather than photos: the
// exercise dataset only has per-exercise photos (© Gym visual, not licensed
// for reuse as category art) — see prisma/seed.ts / DEVELOPMENT_LOG.md.
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme/colors';

export type IconProps = { size?: number; color?: string };

const SIZE = 24;
const COLOR = colors.text;
const STROKE = 1.7;

// ---- Muscle groups ----

export function ChestIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5c-2.2 0-4 1.6-4 4 0 3 1.8 5 4 6.5 2.2-1.5 4-3.5 4-6.5 0-2.4-1.8-4-4-4Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Path d="M12 9v6.5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

export function BackIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 6c2.5 2.5 4.5 3.3 7 3.3S16.5 8.5 19 6M7 6v11c0 1.4 2.3 2.4 5 2.4s5-1 5-2.4V6"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ShouldersIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="7" cy="8" r="2.6" stroke={color} strokeWidth={STROKE} />
      <Circle cx="17" cy="8" r="2.6" stroke={color} strokeWidth={STROKE} />
      <Path d="M7 10.6V13a5 5 0 0 0 10 0v-2.4" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

export function ArmsIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="17" cy="7" r="2.3" stroke={color} strokeWidth={STROKE} />
      <Path
        d="M6 17c-.5-4 1.4-7.3 4.6-8.4 1-.35 2 .3 2 1.35 0 .9-.6 1.5-1.4 1.85.9.55 1.5 1.5 1.5 2.7 0 2.7-2.1 4.5-5.2 4.5"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LegsIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="6" y="4" width="4" height="16" rx="2" stroke={color} strokeWidth={STROKE} />
      <Rect x="14" y="4" width="4" height="16" rx="2" stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function WaistIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="6" y1="7" x2="18" y2="7" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Line x1="6" y1="12" x2="18" y2="12" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Line x1="6" y1="17" x2="18" y2="17" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

export function CardioIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 19.5s-6.6-4.1-8.7-8C1.7 8.7 2.8 5.5 5.7 5.5c1.9 0 3.2 1.1 4 2.2.8-1.1 2.1-2.2 4-2.2 2.9 0 4 3.2 2.4 6-2.1 3.9-3.4 7.9-8.7 8Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function NeckIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="6" r="3" stroke={color} strokeWidth={STROKE} />
      <Rect x="9" y="9.5" width="6" height="7" rx="2" stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

// ---- Equipment ----

export function BarbellIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="4.5" y1="12" x2="19.5" y2="12" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Rect x="2" y="9" width="2.5" height="6" rx="1" stroke={color} strokeWidth={STROKE} />
      <Rect x="19.5" y="9" width="2.5" height="6" rx="1" stroke={color} strokeWidth={STROKE} />
      <Rect x="6" y="10" width="2" height="4" rx="0.6" stroke={color} strokeWidth={STROKE} />
      <Rect x="16" y="10" width="2" height="4" rx="0.6" stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function DumbbellIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="9" y1="12" x2="15" y2="12" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Rect x="3.5" y="9" width="3" height="6" rx="1" stroke={color} strokeWidth={STROKE} />
      <Rect x="17.5" y="9" width="3" height="6" rx="1" stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function MachineIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth={STROKE} />
      <Line x1="4" y1="10.5" x2="20" y2="10.5" stroke={color} strokeWidth={STROKE} />
      <Line x1="9.5" y1="10.5" x2="9.5" y2="20" stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function CableIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth={STROKE} />
      <Line x1="12" y1="7" x2="12" y2="15" stroke={color} strokeWidth={STROKE} />
      <Line x1="8" y1="16" x2="16" y2="16" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Line x1="12" y1="15" x2="12" y2="19" stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function KettlebellIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 9.5V8a3 3 0 0 1 6 0v1.5" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
      <Circle cx="12" cy="15" r="6" stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function BandIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.5 12c2-4.2 4-4.2 6 0s4 4.2 6 0 4-4.2 6 0"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BallIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={STROKE} />
      <Path d="M12 4v16M4 12h16" stroke={color} strokeWidth={STROKE * 0.7} strokeOpacity={0.5} />
    </Svg>
  );
}

export function BodyweightIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="5" r="2.4" stroke={color} strokeWidth={STROKE} />
      <Path
        d="M12 7.8v6M8 11h8M9 20l3-6 3 6"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BikeIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="6" cy="17" r="3" stroke={color} strokeWidth={STROKE} />
      <Circle cx="18" cy="17" r="3" stroke={color} strokeWidth={STROKE} />
      <Path d="M6 17l5-9h4l3 9M11 8H8" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ---- General-purpose ----

export function FlameIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.5c1 3-2.5 4-2.5 7a2.5 2.5 0 0 0 5 0c0-1-.5-1.6-.5-1.6 1.5 1 2.5 3 2.5 5a5 5 0 0 1-10 0c0-4.5 3.5-6 3.5-9.5.8.5 2 1 2 3.1Z"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ClockIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth={STROKE} />
      <Path d="M12 8v4.3l3 1.8" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function MiscEquipmentIcon({ size = SIZE, color = COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}
