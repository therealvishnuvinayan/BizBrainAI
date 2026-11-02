import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// shadcn/ui's Radix Button composition, themed to preserve the BizBrain design.
// https://ui.shadcn.com/docs/components/radix/button
export const buttonVariants = cva("", {
  variants: {
    variant: {
      default:
        "inline-flex items-center justify-center gap-3 min-h-11 py-2.75 px-5 rounded-[11px] border border-[#ffffff45] bg-(image:--background-image-primary-button) shadow-primary-button text-white font-[650] text-[14px] hover:enabled:shadow-button-hover hover:enabled:[transform:translateY(-1px)] disabled:opacity-83",
      outline:
        "inline-flex items-center justify-center gap-2 min-h-10 border border-input rounded-[9px] py-2.25 px-3.5 bg-white text-secondary-foreground text-[12px] font-[550] hover:enabled:border-[#a580f4] hover:enabled:text-primary hover:enabled:bg-[#faf7ff] disabled:text-[#777287] disabled:bg-[#f8f7fb]",
      link: "inline-flex items-center gap-1.25 text-link text-[11px] bg-none bg-transparent border-0 p-0 font-[550] hover:text-link-hover hover:underline hover:underline-offset-3",
      icon: "inline-flex items-center justify-center size-9 border-0 rounded-[9px] bg-transparent text-icon shrink-0 hover:bg-accent hover:text-primary",
      "outline-icon":
        "inline-flex items-center justify-center size-9 border border-[#e1def0] rounded-[9px] bg-[#ffffffaa] shadow-bordered text-icon shrink-0 hover:bg-[#f1eaff] hover:border-[#d4c4fa] hover:text-primary",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Button({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      data-slot="button"
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  );
}
