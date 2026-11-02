import { useId } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Brand({ large = false }: { large?: boolean }) {
  return (
    <Link
      href="/"
      data-slot="brand"
      className={cn(
        "inline-flex items-center gap-2.25 text-[23px] font-[780] tracking-[-0.9px] whitespace-nowrap",
        large
          ? cn(
              "text-[31px] tracking-[-1.15px] gap-3",
              "[&_[data-slot=brand-mark]]:w-12 [&_[data-slot=brand-mark]]:h-11.75",
              "[&_[data-slot=brand-mark]_i:nth-child(1)]:right-3 [&_[data-slot=brand-mark]_i:nth-child(1)]:rounded-[14px]",
              "[&_[data-slot=brand-mark]_i:nth-child(2)]:w-8.5 [&_[data-slot=brand-mark]_i:nth-child(2)]:h-8.5",
              "[&_[data-slot=brand-mark]_i:nth-child(3)]:w-6.25 [&_[data-slot=brand-mark]_i:nth-child(3)]:h-7 [&_[data-slot=brand-mark]_i:nth-child(3)]:right-2",
              "max-lg:text-[26px]",
              "max-lg:[&_[data-slot=brand-mark]]:w-10.25 max-lg:[&_[data-slot=brand-mark]]:h-10.5",
              "max-md:text-[27px]",
              "max-sm:text-[26px]",
              "max-sm:[&_[data-slot=brand-mark]]:w-10 max-sm:[&_[data-slot=brand-mark]]:h-10",
            )
          : "",
      )}
      aria-label="BizBrain AI home"
    >
      <span
        data-slot="brand-mark"
        className={cn(
          "relative inline-block w-9 h-9 shrink-0 isolate",
          "[&_i]:absolute",
          "[&_i:nth-child(1)]:[inset:2px_9px_2px_0] [&_i:nth-child(1)]:rounded-[11px_12px_8px_9px] [&_i:nth-child(1)]:bg-(image:--background-image-brand-cyan)",
          "[&_i:nth-child(2)]:w-6.5 [&_i:nth-child(2)]:h-6.5 [&_i:nth-child(2)]:right-0 [&_i:nth-child(2)]:top-0.5 [&_i:nth-child(2)]:rounded-[50%] [&_i:nth-child(2)]:bg-(image:--background-image-brand-violet) [&_i:nth-child(2)]:opacity-95",
          "[&_i:nth-child(3)]:w-4.75 [&_i:nth-child(3)]:h-5.5 [&_i:nth-child(3)]:right-1.5 [&_i:nth-child(3)]:bottom-0.5 [&_i:nth-child(3)]:rounded-[6px_10px_11px_4px] [&_i:nth-child(3)]:bg-(image:--background-image-brand-blue) [&_i:nth-child(3)]:mix-blend-multiply",
        )}
        aria-hidden="true"
      >
        <i />
        <i />
        <i />
      </span>
      <span>BizBrain AI</span>
    </Link>
  );
}

export function GradientWaves({ className = "" }: { className?: string }) {
  const gradientId = useId();
  return (
    <svg
      className={cn("absolute pointer-events-none", className)}
      viewBox="0 0 600 340"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`wave-purple-${gradientId}`}
          x1="0"
          y1="0"
          x2="600"
          y2="340"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#b990ff" />
          <stop offset="1" stopColor="#cfc9ff" stopOpacity=".15" />
        </linearGradient>
        <linearGradient
          id={`wave-teal-${gradientId}`}
          x1="130"
          y1="340"
          x2="600"
          y2="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#5d8dff" stopOpacity=".5" />
          <stop offset="1" stopColor="#74f2e6" stopOpacity=".7" />
        </linearGradient>
      </defs>
      <path
        d="M0 0C155 3 161 225 320 227C462 230 479 312 600 291V340H0V0Z"
        fill={`url(#wave-purple-${gradientId})`}
      />
      <path
        d="M0 340C155 330 209 127 354 121C462 115 526 249 600 208V340H0Z"
        fill={`url(#wave-teal-${gradientId})`}
      />
      <path
        d="M0 146C144 158 167 233 317 275C428 309 510 268 600 309V340H0V146Z"
        fill="#8ca3ff"
        fillOpacity=".25"
      />
    </svg>
  );
}
