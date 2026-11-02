import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

// A shadcn-style surface; asChild preserves section/aside/link semantics and DOM shape.
export function Card({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Component = asChild ? Slot : "div";
  return (
    <Component
      data-slot="card"
      className={cn(
        "min-w-0 rounded-card border border-border bg-(image:--background-image-panel) shadow-card",
        className,
      )}
      {...props}
    />
  );
}
