import {
  HeartPulse,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import {
  FeatureIcon,
  type FeatureIconTone,
} from "@/components/common/FeatureIcon";
import type { Service } from "@shared/schema";

type HomeServiceVisualProps = {
  readonly service: Service;
};

type ServiceIconConfig = {
  readonly icon: LucideIcon;
  readonly tone: FeatureIconTone;
  readonly label: string;
};

const serviceIcons: Readonly<Record<string, ServiceIconConfig>> = {
  "preventive-dentistry": {
    icon: ShieldCheck,
    tone: "primary",
    label: "Protect and maintain",
  },
  "cosmetic-dentistry": {
    icon: Sparkles,
    tone: "amber",
    label: "Refine your smile",
  },
  "restorative-dentistry": {
    icon: HeartPulse,
    tone: "emerald",
    label: "Restore comfort",
  },
};

const fallbackIcon: ServiceIconConfig = {
  icon: ShieldCheck,
  tone: "slate",
  label: "Thoughtful dental care",
};

const HomeServiceVisual = ({ service }: HomeServiceVisualProps) => {
  const config = serviceIcons[service.slug] ?? fallbackIcon;

  return (
    <div className="flex items-center justify-between gap-4">
      <FeatureIcon icon={config.icon} tone={config.tone} size="lg" />
      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {config.label}
      </span>
    </div>
  );
};

export default HomeServiceVisual;
