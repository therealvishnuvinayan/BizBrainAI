"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Eye,
  FlaskConical,
  Layers,
  LockKeyhole,
  Mail,
  Monitor,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Brand, GradientWaves } from "@/components/ui/brand";
import { IconTile } from "@/components/ui/primitives";

const features = [
  {
    icon: Layers,
    tone: "purple",
    title: "Evidence-grounded investigations",
    description: "Get answers with data, citations, and clear reasoning.",
  },
  {
    icon: Sparkles,
    tone: "blue",
    title: "Actionable business insights",
    description: "Spot risks, uncover opportunities, and know what to do next.",
  },
  {
    icon: Monitor,
    tone: "teal",
    title: "A fictional workspace, ready to explore",
    description: "Try BizBrain AI with realistic, pre-built business data.",
  },
] as const;

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.7 4.7 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-1 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 14a6 6 0 0 1 0-4V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.9 5.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z"
      />
    </svg>
  );
}

export function LoginScreen() {
  const [mode, setMode] = useState<"signin" | "create">("signin");
  return (
    <main
      className={cn(
        "relative isolate min-h-svh grid grid-cols-[minmax(0,_1.42fr)_minmax(390px,_1fr)] items-center gap-[5vw] pt-13.5 px-[max(5.5vw,_30px)] pb-10.5 overflow-hidden bg-[#fafaff] bg-(image:--background-image-login-page)",
        "max-xl:gap-[4vw] max-xl:py-10 max-xl:px-[4.5vw] max-xl:grid-cols-[minmax(0,_1.25fr)_minmax(360px,_1fr)]",
        "max-lg:py-9.5 max-lg:px-8.75 max-lg:gap-8.5 max-lg:grid-cols-[1fr_1fr]",
        "max-md:flex max-md:flex-col max-md:pt-7.5 max-md:px-6.25 max-md:pb-10 max-md:gap-8.5 max-md:overflow-hidden",
        "max-sm:pt-6.5 max-sm:px-5.25 max-sm:pb-8.5 max-sm:gap-7.75",
      )}
    >
      <div
        className={cn(
          "absolute -z-1 w-225 h-155 -top-107.5 left-[27%] [transform:rotate(-35deg)] rounded-[40%] bg-(image:--background-image-login-top-glow) blur-[3px] opacity-60",
          "max-md:-left-10 max-md:-top-117.5",
        )}
        aria-hidden="true"
      />
      <GradientWaves
        className={cn(
          "-z-1 w-105 h-53.75 bottom-0 -left-15 opacity-67",
          "max-md:w-75 max-md:h-42.5 max-md:opacity-55",
        )}
      />
      <GradientWaves
        className={cn(
          "-z-1 w-120 h-53.75 -bottom-20 -right-25 [transform:scaleX(-1)] opacity-65",
          "max-md:w-75 max-md:h-45 max-md:-bottom-12.5 max-md:-right-25",
        )}
      />
      <section
        className={cn(
          "relative self-center min-w-0 max-w-205",
          "max-md:w-full max-md:max-w-142.5",
        )}
      >
        <Brand large />
        <div
          className={cn(
            "mt-8 mr-0 mb-7.25 ml-2",
            "[&_h1>span]:relative [&_h1>span]:inline-block",
            "[&_h1_svg]:absolute [&_h1_svg]:w-[330%] [&_h1_svg]:max-w-none [&_h1_svg]:-right-2 [&_h1_svg]:-bottom-4.25 [&_h1_svg]:h-3.5",
            "[&>p:last-child]:mt-6.75 [&>p:last-child]:text-[#60617b] [&>p:last-child]:text-[length:clamp(17px,_1.5vw,_24px)] [&>p:last-child]:leading-[1.5] [&>p:last-child]:max-w-152.5 [&>p:last-child]:tracking-[-0.35px]",
            "max-xl:[&>p:last-child]:text-[18px]",
            "max-lg:ml-0",
            "max-lg:[&>p:last-child]:text-[16px]",
            "max-md:mt-8.5 max-md:mx-0 max-md:mb-7",
            "max-md:[&>p:last-child]:text-[17px] max-md:[&>p:last-child]:max-w-125 max-md:[&>p:last-child]:mt-6.25",
            "max-md:[&_h1_svg]:-bottom-3.25 max-md:[&_h1_svg]:w-[205%] max-md:[&_h1_svg]:h-2.75",
            "max-sm:[&>p:last-child]:text-[16px]",
          )}
        >
          <p className="hidden">YOUR BUSINESS. A CLEARER PICTURE.</p>
          <h1 className="text-[length:clamp(40px,_4.05vw,_66px)] font-[780] leading-[1.13] tracking-[-2.7px] text-[#090a1b] max-w-170 max-xl:text-[45px] max-xl:tracking-[-2px] max-lg:text-[39px] max-lg:tracking-[-1.8px] max-md:text-[length:clamp(39px,_7vw,_53px)] max-md:tracking-[-2px] max-md:max-w-137.5 max-md:leading-[1.13] max-sm:text-[42px] max-sm:max-w-90">
            Understand your
            <br className="max-lg:hidden" /> business with{" "}
            <span>
              AI
              <svg viewBox="0 0 230 14" fill="none" aria-hidden="true">
                <path
                  d="M3 11C62-1 175-1 227 10"
                  stroke="url(#underline)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="underline">
                    <stop stopColor="#bf80ff" />
                    <stop offset=".55" stopColor="#8f8bff" />
                    <stop offset="1" stopColor="#65e5e3" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>
          <p>
            Investigate revenue, orders, and inventory with evidence from your
            business data.
          </p>
        </div>
        <Link
          href="/demo/overview"
          className={cn(
            "block relative mt-6.75 p-1.5 bg-[#ffffffc7] border border-white rounded-[18px] shadow-product-preview [transform:rotate(-0.6deg)]",
            "[&>img]:block [&>img]:w-full [&>img]:h-auto [&>img]:aspect-[2.2] [&>img]:object-cover [&>img]:object-top [&>img]:rounded-[12px]",
            "[&:hover_[data-slot=preview-link]]:opacity-100",
            "[&:focus-visible_[data-slot=preview-link]]:opacity-100",
            "max-md:mt-7.25 max-md:rounded-[13px] max-md:p-1",
            "max-md:[&>img]:rounded-[10px]",
            "max-sm:[&>img]:aspect-[1.6]",
          )}
          aria-label="Explore the BizBrain AI demo dashboard"
        >
          <div className="absolute [inset:-10px_-8px_17px_12px] rounded-[24px] bg-(image:--background-image-preview-glow) -z-1 [transform:rotate(-2deg)]" />
          <Image
            src="/images/workspace-preview.png"
            width={1440}
            height={1019}
            alt="BizBrain AI business overview with revenue charts, sample findings, and recent investigations"
            priority
            sizes="(max-width: 760px) 90vw, 52vw"
          />
          <span
            data-slot="preview-link"
            className="absolute right-3.75 bottom-3.75 flex items-center gap-1.25 py-1.75 px-2.75 rounded-[6px] bg-white shadow-preview-link text-[#6c3bd1] text-[10px] opacity-0 [transition:opacity_0.2s]"
          >
            Take a closer look <ArrowUpRightIcon />
          </span>
        </Link>
        <div
          className={cn(
            "grid gap-3.25 mt-7.25 mx-0 mb-0 pl-[clamp(20px,_8.5vw,_145px)]",
            "[&>div]:flex [&>div]:items-center [&>div]:gap-4.5",
            "[&_[data-slot=icon-tile]]:w-10.75 [&_[data-slot=icon-tile]]:h-10.75 [&_[data-slot=icon-tile]]:border [&_[data-slot=icon-tile]]:border-[#b9a1f233] [&_[data-slot=icon-tile]]:shadow-feature-icon",
            "[&_h2]:text-[15px] [&_h2]:font-[710] [&_h2]:tracking-[-0.3px]",
            "[&_p]:text-[12px] [&_p]:text-[#62617b] [&_p]:mt-1 [&_p]:leading-[1.45]",
            "max-xl:pl-5",
            "max-xl:[&_h2]:text-[13px]",
            "max-xl:[&_p]:text-[11px]",
            "max-lg:pl-0 max-lg:gap-4.25",
            "max-lg:[&>div]:gap-2.75",
            "max-lg:[&_h2]:text-[12px]",
            "max-lg:[&_p]:text-[10px]",
            "max-lg:[&_[data-slot=icon-tile]]:w-9.25 max-lg:[&_[data-slot=icon-tile]]:h-9.25",
            "max-md:hidden",
          )}
        >
          {features.map((feature) => (
            <div key={feature.title}>
              <IconTile icon={feature.icon} tone={feature.tone} />
              <div>
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section
        className={cn(
          "w-full max-w-130 justify-self-end p-8 border border-white rounded-[25px] bg-[#ffffffc4] shadow-auth-card",
          "max-xl:p-6.5",
          "max-lg:p-5.75",
          "max-md:w-full max-md:max-w-142.5 max-md:p-6.5 max-md:rounded-[21px]",
          "max-sm:py-5.75 max-sm:px-5",
        )}
        aria-label="Welcome to BizBrain AI"
      >
        <div
          className={cn(
            "flex p-1.75 border border-[#e5e0f4] rounded-[13px] shadow-auth-tabs gap-1.5",
            "[&_button]:w-1/2 [&_button]:rounded-[8px] [&_button]:border-0 [&_button]:bg-transparent [&_button]:min-h-10 [&_button]:text-foreground [&_button]:text-[15px]",
            "[&_button[aria-pressed=true]]:bg-[#e9e0ff] [&_button[aria-pressed=true]]:text-[#6624f5] [&_button[aria-pressed=true]]:font-bold",
            "[&_button:not([aria-pressed=true]):hover]:bg-[#f8f5ff]",
            "max-lg:[&_button]:text-[13px]",
            "max-md:[&_button]:text-[15px]",
            "max-sm:[&_button]:text-[13px]",
          )}
          role="group"
          aria-label="Account options"
        >
          <button
            aria-pressed={mode === "signin"}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            aria-pressed={mode === "create"}
            onClick={() => setMode("create")}
          >
            Create account
          </button>
        </div>
        <div className="mt-7.5">
          <h2 className="text-[length:clamp(22px,_1.9vw,_31px)] font-[740] leading-[1.24] tracking-[-0.9px] max-xl:text-[25px] max-lg:text-[24px] max-md:text-[27px] max-sm:text-[26px]">
            {mode === "signin"
              ? "Welcome back to BizBrain AI"
              : "Your next chapter starts here"}
          </h2>
          <p className="text-[#64627f] text-[14px] mt-1.75 leading-[1.5] max-xl:text-[12px] max-md:text-[14px] max-sm:text-[12px]">
            {mode === "signin"
              ? "A clearer view of your business starts here."
              : "Connect the dots. Understand your business."}
          </p>
        </div>
        <p
          className={cn(
            "flex items-start gap-1.5 mt-4.25 mx-0 mb-5 py-2.5 px-2.75 rounded-[8px] bg-[#f3efff] text-[10px] text-[#73579e] leading-[1.5]",
            "[&_svg]:mt-0.25",
            "max-lg:text-[9px]",
            "max-md:text-[10px]",
            "max-sm:px-2 max-sm:text-[9px]",
          )}
        >
          <LockKeyhole size={14} />
          Authentication is coming soon. Explore the demo below.
        </p>
        <div
          className={cn(
            "grid gap-4.25",
            "[&_label]:text-[13px] [&_label]:font-[530]",
            "max-md:[&_label]:text-[13px]",
            "max-md:[&_input]:text-[13px]",
          )}
          aria-describedby="auth-description"
        >
          {mode === "create" && (
            <label>
              Full name
              <span
                className={cn(
                  "flex items-center gap-3 h-10.75 mt-1.75 py-0 px-3.5 border border-border-control rounded-[9px] text-label-muted shadow-auth-input bg-input-background",
                  "[&_input]:min-w-0 [&_input]:w-full [&_input]:border-0 [&_input]:outline-none [&_input]:bg-transparent [&_input]:text-[13px] [&_input]:font-normal",
                  "max-md:h-11.5",
                )}
              >
                <UserRound size={19} />
                <input disabled placeholder="Your name" autoComplete="off" />
              </span>
            </label>
          )}
          <label>
            Email
            <span
              className={cn(
                "flex items-center gap-3 h-10.75 mt-1.75 py-0 px-3.5 border border-border-control rounded-[9px] text-label-muted shadow-auth-input bg-input-background",
                "[&_input]:min-w-0 [&_input]:w-full [&_input]:border-0 [&_input]:outline-none [&_input]:bg-transparent [&_input]:text-[13px] [&_input]:font-normal",
                "max-md:h-11.5",
              )}
            >
              <Mail size={20} />
              <input
                type="email"
                disabled
                placeholder="you@company.com"
                autoComplete="off"
              />
            </span>
          </label>
          <label>
            Password
            <span
              className={cn(
                "flex items-center gap-3 h-10.75 mt-1.75 py-0 px-3.5 border border-border-control rounded-[9px] text-label-muted shadow-auth-input bg-input-background",
                "[&_input]:min-w-0 [&_input]:w-full [&_input]:border-0 [&_input]:outline-none [&_input]:bg-transparent [&_input]:text-[13px] [&_input]:font-normal",
                "max-md:h-11.5",
              )}
            >
              <LockKeyhole size={20} />
              <input
                type="password"
                disabled
                placeholder="Enter your password"
                autoComplete="off"
              />
              <Eye size={20} aria-hidden="true" />
            </span>
          </label>
        </div>
        <div
          className={cn(
            "flex justify-end mt-3",
            "[&_button]:p-0 [&_button]:bg-transparent [&_button]:border-0 [&_button]:text-[12px] [&_button]:text-[#8a73b0]",
          )}
        >
          <button disabled>Forgot password?</button>
        </div>
        <Button
          variant="default"
          className="w-full mt-5.75 min-h-11.5"
          disabled
        >
          {mode === "signin" ? "Sign in to BizBrain AI" : "Create your account"}
          <ArrowRight size={21} />
        </Button>
        <div
          className={cn(
            "flex items-center gap-3 text-[#77708e] text-[12px] mt-5.75 mx-0 mb-4",
            "[&_span]:h-0.25 [&_span]:bg-[#e3deef] [&_span]:flex-1",
          )}
        >
          <span />
          Or continue with
          <span />
        </div>
        <div
          className={cn(
            "flex gap-3",
            "[&_button]:w-1/2 [&_button]:min-h-10.75 [&_button]:flex [&_button]:gap-3 [&_button]:items-center [&_button]:justify-center [&_button]:bg-input-background [&_button]:border [&_button]:border-[#ded9ee] [&_button]:text-[#6e687b] [&_button]:rounded-[10px] [&_button]:text-[12px] [&_button]:shadow-social-button",
          )}
        >
          <button disabled>
            <GoogleMark />
            Google
          </button>
          <button disabled>
            <span
              className={cn(
                "grid grid-cols-[repeat(2,_9px)] gap-0.5",
                "[&_i]:w-2.25 [&_i]:h-2.25 [&_i]:bg-[#f35325]",
                "[&_i:nth-child(2)]:bg-[#81bc06]",
                "[&_i:nth-child(3)]:bg-[#05a6f0]",
                "[&_i:nth-child(4)]:bg-[#ffba08]",
              )}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
              <i />
            </span>
            Microsoft
          </button>
        </div>
        <Link
          href="/demo/overview"
          className={cn(
            "flex items-center gap-4 bg-(image:--background-image-demo-entry) border border-[#eee5ff] rounded-[11px] p-4.5 mt-7.25 text-[#7137f5] [transition:transform_0.2s,_box-shadow_0.2s]",
            "hover:[transform:translateY(-2px)] hover:shadow-demo-entry-hover",
            "[&>span]:flex-1",
            "[&_strong]:block [&_strong]:text-[15px] [&_strong]:font-[710] [&_strong]:text-foreground [&_strong]:tracking-[-0.3px]",
            "[&_small]:block [&_small]:mt-1.25 [&_small]:text-[11px] [&_small]:text-[#676080]",
            "max-xl:py-3.75 max-xl:px-3 max-xl:gap-2.75",
            "max-xl:[&_strong]:text-[13px]",
            "max-lg:gap-2.25",
            "max-lg:[&>svg:first-child]:w-6.25",
            "max-lg:[&_strong]:text-[12px]",
            "max-lg:[&_small]:text-[9px]",
            "max-md:py-4.75 max-md:px-3.75 max-md:gap-3.75",
            "max-md:[&_strong]:text-[15px]",
            "max-md:[&_small]:text-[11px]",
            "max-md:[&>svg:first-child]:w-7.5",
            "max-sm:[&_strong]:text-[13px]",
            "max-sm:[&_small]:text-[10px]",
          )}
        >
          <FlaskConical size={31} strokeWidth={1.65} />
          <span>
            <strong>Explore Demo Workspace</strong>
            <small>A fictional business. Real possibilities.</small>
          </span>
          <ArrowRight size={22} />
        </Link>
        <p
          className="text-center text-[#837790] text-[10px] mt-2.75 mx-0 mb-5.75"
          id="auth-description"
        >
          No account needed. No credentials collected.
        </p>
        <p
          className={cn(
            "text-[12px] flex items-center justify-center gap-2 text-[#6b6281] leading-[1.5]",
            "[&_button]:bg-none [&_button]:bg-transparent [&_button]:border-0 [&_button]:p-0 [&_button]:text-[length:inherit] [&_button]:text-[#7135eb]",
            "[&_button:hover]:underline",
            "max-lg:text-[10px] max-lg:gap-1.25 max-lg:flex-wrap",
            "max-md:text-[12px] max-md:gap-1.75",
            "max-sm:text-[11px]",
          )}
        >
          {mode === "signin"
            ? "New to BizBrain AI?"
            : "Already have an account?"}
          <button
            onClick={() => setMode(mode === "signin" ? "create" : "signin")}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </section>
    </main>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}
