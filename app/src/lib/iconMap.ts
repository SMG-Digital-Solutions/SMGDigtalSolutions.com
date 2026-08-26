import {
  PaintBrush,
  DeviceMobile,
  RocketLaunch,
  ShieldCheck,
  ChartLineUp,
  Sparkle,
  Robot,
  Wrench,
  MapPin,
  Brain,
  Compass,
  Star,
  GearSix,
  Database,
  Lightning,
  Globe,
  Clock,
  Target,
  type Icon,
} from '@phosphor-icons/react';

// Mirrors the admin app's own copy of this lookup (smg-admin/src/lib/iconMap.ts)
// — an iconKey saved in the CMS is only ever one of these curated Phosphor
// icon names, never a free-form value, so the two lookups must stay in sync.
//
// Kept intentionally short: every icon here ships in the client bundle for
// both ServiceFocus and AddOnsSection (string-key lookup means a bundler
// can't tree-shake out the unused ones), so this list is "what's actually
// useful for a web agency's services/add-ons," not "every icon that might
// ever be wanted." Add sparingly.
export const ICON_MAP: Record<string, Icon> = {
  PaintBrush,
  DeviceMobile,
  RocketLaunch,
  ShieldCheck,
  ChartLineUp,
  Sparkle,
  Robot,
  Wrench,
  MapPin,
  Brain,
  Compass,
  Star,
  GearSix,
  Database,
  Lightning,
  Globe,
  Clock,
  Target,
};

// Fallback for the rare case an iconKey doesn't match ICON_MAP (e.g. the two
// apps' lookups briefly drift out of sync) — render something rather than
// crash the build on a missing icon.
export const DEFAULT_ICON: Icon = Sparkle;
