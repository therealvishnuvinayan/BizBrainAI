"use client";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toneClasses } from "@/components/ui/tone-variants";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { X, Check, FlaskConical, type LucideIcon } from "lucide-react";
import { useRef, type ReactNode } from "react";
import type { Tone } from "@/types";

export function IconTile({
  icon: Icon,
  tone = "purple",
  small = false,
}: {
  icon: LucideIcon;
  tone?: Tone;
  small?: boolean;
}) {
  return (
    <span
      data-slot="icon-tile"
      data-tone={tone}
      className={cn(
        "inline-flex items-center justify-center w-11.5 h-11.5 rounded-[12px] shrink-0",
        toneClasses[tone],
        small ? "w-8.5 h-8.5 rounded-[9px]" : "",
      )}
    >
      <Icon size={small ? 20 : 25} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}

export { Badge } from "@/components/ui/badge";

export function CompleteBadge({
  children = "Completed",
}: {
  children?: ReactNode;
}) {
  return (
    <Badge tone="green">
      <Check size={13} strokeWidth={2.5} aria-hidden="true" />
      {children}
    </Badge>
  );
}

export function DemoBadge() {
  return (
    <span
      data-slot="demo-badge"
      className="inline-flex items-center gap-1.25 border border-[#e5dbfa] py-1.25 px-2.25 rounded-[6px] text-[#715799] bg-[#ffffffb3] text-[10px] whitespace-nowrap"
    >
      <FlaskConical size={12} aria-hidden="true" />
      Demo workspace
    </span>
  );
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const previousFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-[5px] animate-surface-in" />
        <Dialog.Content
          className={cn(
            "fixed z-51 top-1/2 left-1/2 [transform:translate(-50%,_-50%)] w-[min(570px,_calc(100vw_-_32px))] max-h-[calc(100svh_-_60px)] overflow-y-auto bg-popover border border-white rounded-[20px] shadow-dialog-content p-6.25 animate-surface-in",
            "max-md:p-5.5",
            "max-sm:p-5 max-sm:max-h-[calc(100svh_-_36px)] max-sm:w-[calc(100vw_-_24px)] max-sm:rounded-[16px]",
          )}
          onOpenAutoFocus={() => {
            previousFocus.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            previousFocus.current?.focus();
          }}
        >
          <div
            className={cn(
              "flex items-start justify-between gap-2.5 mb-5.5",
              "[&>[data-slot=icon-button]]:w-7.25 [&>[data-slot=icon-button]]:h-7.25 [&>[data-slot=icon-button]]:-mt-0.75 [&>[data-slot=icon-button]]:-mr-1 [&>[data-slot=icon-button]]:mb-0 [&>[data-slot=icon-button]]:ml-0",
            )}
          >
            <div>
              <Dialog.Title
                className={cn(
                  "text-[22px] font-[710] leading-[1.3] tracking-[-0.6px]",
                  "max-md:text-[21px]",
                  "max-sm:text-[20px]",
                )}
              >
                {title}
              </Dialog.Title>
              <Dialog.Description
                className={cn(
                  "text-[12px] text-[#796886] leading-[1.6] mt-2",
                  "max-sm:text-[11px]",
                )}
              >
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close
              data-slot="icon-button"
              className={buttonVariants({ variant: "icon" })}
              aria-label="Close dialog"
            >
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Menu({
  trigger,
  label,
  children,
  align = "end",
}: {
  trigger: ReactNode;
  label: string;
  children: ReactNode;
  align?: "start" | "end";
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild aria-label={label}>
        {trigger}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={9}
          className="z-45 min-w-58.75 max-w-[calc(100vw_-_30px)] p-1.75 border border-[#e9def4] rounded-[13px] bg-popover shadow-dropdown-menu animate-menu-in"
        >
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function MenuItem({
  children,
  onSelect,
  disabled = false,
}: {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu.Item
      className={cn(
        "flex items-center gap-2.5 py-2.75 px-2.5 outline-none rounded-[7px] cursor-pointer text-[12px] text-[#4b365e]",
        "data-highlighted:bg-[#f0e7ff] data-highlighted:text-[#6f2fd8]",
        "[&>svg:last-child]:ml-auto",
        "[&_strong]:block [&_strong]:text-[11px] [&_strong]:font-semibold",
        "[&_small]:block [&_small]:text-[10px] [&_small]:leading-[1.5] [&_small]:mt-1 [&_small]:text-support-muted",
        "data-disabled:opacity-50 data-disabled:cursor-not-allowed",
      )}
      onSelect={onSelect}
      disabled={disabled}
    >
      {children}
    </DropdownMenu.Item>
  );
}

export function SectionHeading({
  icon: Icon,
  title,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div
      data-slot="section-heading"
      className="flex items-center justify-between gap-2.5 mb-3.5"
    >
      <h2 className="flex items-center gap-2.5 text-[17px] font-[730] tracking-[-0.5px] leading-[1.3] 2xl:text-[19px] max-lg:text-[16px]">
        {Icon && (
          <Icon
            data-slot="section-icon"
            className="text-section-icon"
            size={23}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        )}
        {title}
      </h2>
      {children}
    </div>
  );
}
