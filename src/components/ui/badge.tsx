import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-[50px] py-1 px-2 text-[10px] font-semibold leading-[1.15] whitespace-nowrap align-middle",
  {
    variants: {
      tone: {
        purple: "text-badge-purple-foreground bg-tone-purple",
        green: "text-badge-green-foreground bg-badge-green",
        blue: "text-tone-blue-foreground bg-tone-blue",
        teal: "text-tone-teal-foreground bg-tone-teal",
        amber: "text-tone-amber-foreground bg-tone-amber",
        rose: "text-tone-rose-foreground bg-tone-rose",
      },
    },
    defaultVariants: { tone: "purple" },
  },
);

export function Badge({
  className,
  tone = "purple",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      data-tone={tone}
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    />
  );
}
