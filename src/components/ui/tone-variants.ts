import type { Tone } from "@/types";
export const toneClasses = {
  purple: "text-tone-purple-foreground bg-tone-purple",
  blue: "text-tone-blue-foreground bg-tone-blue",
  teal: "text-tone-teal-foreground bg-tone-teal",
  green: "text-tone-green-foreground bg-tone-green",
  amber: "text-tone-amber-foreground bg-tone-amber",
  rose: "text-tone-rose-foreground bg-tone-rose",
} satisfies Record<Tone, string>;
export const kpiToneClasses: Partial<Record<Tone, string>> = {
  blue: "[&_[data-slot=kpi-wave]]:bg-(image:--background-image-kpi-blue)",
  amber: "[&_[data-slot=kpi-wave]]:bg-(image:--background-image-kpi-amber)",
  green: "[&_[data-slot=kpi-wave]]:bg-(image:--background-image-kpi-green)",
};
export const connectionMarkClasses: Partial<Record<string, string>> = {
  shopify: "italic",
  netsuite: "text-[27px] tracking-[-3px] leading-[1]",
};
