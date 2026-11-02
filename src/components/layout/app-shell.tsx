"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Home,
  Search,
  Network,
  Layers,
  History,
  Settings,
  Store,
  Menu as MenuIcon,
  X,
  FlaskConical,
  LogOut,
  Check,
  Command,
  ArrowUpRight,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Brand, GradientWaves } from "@/components/ui/brand";
import {
  Badge,
  DemoBadge,
  Menu,
  MenuItem,
  Modal,
} from "@/components/ui/primitives";
import { business, alerts, investigations } from "@/data/business";

const navigation = [
  { name: "Overview", href: "/demo/overview", icon: Home },
  { name: "Investigations", href: "/demo/investigations", icon: Search },
  { name: "Connections", href: "/demo/connections", icon: Network },
  { name: "Knowledge", href: "/demo/knowledge", icon: Layers },
  { name: "History", href: "/demo/history", icon: History },
  { name: "Settings", href: "/demo/settings", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <div
        data-slot="sidebar-brand"
        className={cn(
          "min-h-19.5 flex items-center py-0 px-5.25",
          "[&_[data-slot=brand]]:text-[22px] [&_[data-slot=brand]]:gap-1.75",
          "[&_[data-slot=brand-mark]]:w-8 [&_[data-slot=brand-mark]]:h-8.25",
          "max-xl:px-3.5",
          "max-xl:[&_[data-slot=brand]]:text-[21px]",
          "max-lg:[&_[data-slot=brand]]:text-[19px] max-lg:[&_[data-slot=brand]]:gap-1.25",
          "max-lg:[&_[data-slot=brand-mark]]:w-7.25",
        )}
      >
        <Brand />
      </div>
      <nav
        data-slot="main-nav"
        className="grid gap-1.75 py-3.75 px-2.75 relative z-1"
        aria-label="Main navigation"
      >
        {navigation.map(({ name, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            data-slot="nav-link"
            className={cn(
              "flex items-center gap-3.75 min-h-11 py-0 px-4.25 rounded-[10px] text-[13px] font-medium [transition:background_0.15s]",
              "[&_svg]:text-[#565376]",
              "hover:bg-[#f2eefb]",
              "[&[aria-current=page]]:bg-sidebar-accent [&[aria-current=page]]:text-[#682cf9] [&[aria-current=page]]:font-[620]",
              "[&[aria-current=page]_svg]:text-[#7439ff]",
              "max-xl:gap-3 max-xl:px-3.25",
              "max-lg:text-[12px] max-lg:gap-3 max-lg:px-3",
            )}
            aria-current={pathname.startsWith(href) ? "page" : undefined}
          >
            <Icon size={21} strokeWidth={1.7} />
            <span>{name}</span>
            {pathname.startsWith(href) && (
              <span className="w-1.25 h-1.25 bg-[#8b58ff] rounded-[50%] ml-auto opacity-0" />
            )}
          </Link>
        ))}
      </nav>
      <div
        data-slot="sidebar-demo"
        className={cn(
          "relative z-1 mt-auto mx-5.5 mb-32.5 flex flex-wrap gap-2.25 items-start text-[#8465b2]",
          "[&>svg]:mt-0.5",
          "[&>div]:flex-1",
          "[&_strong]:text-[10px] [&_strong]:font-[550] [&_strong]:leading-[1.6]",
          "[&_p]:mt-1 [&_p]:text-[10px] [&_p]:text-[#8a8199] [&_p]:leading-[1.6]",
          "[&>a]:flex [&>a]:items-center [&>a]:gap-1.5 [&>a]:text-[10px] [&>a]:ml-6.75",
          "max-lg:mx-3.75",
        )}
      >
        <FlaskConical size={18} />
        <div>
          <strong>A little data. A lot of clarity.</strong>
          <p>You’re exploring a fictional business.</p>
        </div>
        <Link href="/" onClick={onNavigate}>
          Back to welcome <ArrowUpRight size={13} />
        </Link>
      </div>
      <GradientWaves className="bottom-0 left-0 w-90 h-43.75 opacity-66" />
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const searchResults = [
    ...investigations.map((item) => ({
      title: item.question,
      href: item.href,
      subtitle: "Sample investigation",
    })),
    ...navigation.map((item) => ({
      title: item.name,
      href: item.href,
      subtitle: "Workspace page",
    })),
  ].filter((item) =>
    `${item.title} ${item.subtitle}`
      .toLowerCase()
      .replaceAll("#", "")
      .includes(query.toLowerCase().trim().replaceAll("#", "")),
  );

  return (
    <div className="min-h-svh">
      <a
        className={cn(
          "fixed left-5 -top-15 z-100 bg-primary text-white rounded-[8px] py-3 px-5",
          "focus:top-3.5",
        )}
        href="#main-content"
      >
        Skip to content
      </a>
      <aside
        className={cn(
          "w-54 fixed [inset:0_auto_0_0] z-30 border-r border-r-[#e9e6f2] bg-(image:--background-image-desktop-sidebar) overflow-hidden flex flex-col",
          "max-xl:w-48.75",
          "max-lg:w-46",
          "max-md:hidden",
        )}
      >
        <SidebarContent />
      </aside>
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-[5px] animate-surface-in" />
          <Dialog.Content
            className={cn(
              "max-md:fixed max-md:z-51 max-md:top-0 max-md:bottom-0 max-md:left-0 max-md:w-63.75 max-md:max-w-[calc(100vw_-_60px)] max-md:bg-popover max-md:shadow-mobile-sidebar max-md:flex max-md:flex-col max-md:overflow-hidden",
              "max-md:[&_[data-slot=sidebar-brand]]:pt-4.5 max-md:[&_[data-slot=sidebar-brand]]:min-h-23.5",
              "max-md:[&_[data-slot=brand]]:text-[24px]",
              "max-md:[&_[data-slot=main-nav]]:px-3.25 max-md:[&_[data-slot=main-nav]]:gap-2.25",
              "max-md:[&_[data-slot=nav-link]]:text-[14px] max-md:[&_[data-slot=nav-link]]:min-h-12 max-md:[&_[data-slot=nav-link]]:gap-4 max-md:[&_[data-slot=nav-link]]:px-4.25",
              "max-md:[&_[data-slot=sidebar-demo]]:mt-auto max-md:[&_[data-slot=sidebar-demo]]:mx-5.75 max-md:[&_[data-slot=sidebar-demo]]:mb-41.25",
            )}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              document
                .querySelector<HTMLButtonElement>(
                  "[data-control='mobile-nav-toggle']",
                )
                ?.focus();
            }}
          >
            <Dialog.Title className="sr-only">
              Workspace navigation
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Navigate the fictional demo workspace.
            </Dialog.Description>
            <Dialog.Close
              data-slot="icon-button"
              className={cn(
                buttonVariants({ variant: "icon" }),
                "max-md:absolute max-md:right-2.25 max-md:top-3 max-md:w-6.75 max-md:h-6.75",
              )}
              aria-label="Close navigation"
            >
              <X size={20} />
            </Dialog.Close>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div
        className={cn(
          "ml-54 min-w-0",
          "max-xl:ml-48.75",
          "max-lg:ml-46",
          "max-md:ml-0",
        )}
      >
        <header
          className={cn(
            "sticky top-0 z-20 min-h-16.5 flex items-center gap-6.5 py-0 px-6.25 bg-[#fffffff0] border-b border-b-[#e8e5f1] shadow-topbar backdrop-blur-[16px]",
            "2xl:px-7",
            "max-xl:gap-5 max-xl:px-5",
            "max-lg:px-4.25 max-lg:gap-4",
            "max-md:min-h-15.25 max-md:py-0 max-md:px-3.25 max-md:gap-3",
            "max-sm:gap-2 max-sm:px-2.5",
            "max-sm:[&_[data-control=mobile-search]]:w-7",
          )}
        >
          <Button
            variant="icon"
            data-slot="icon-button"
            data-control="mobile-nav-toggle"
            className={cn("hidden", "max-md:inline-flex max-md:w-7.5")}
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon size={22} />
          </Button>
          <Menu
            label="Select workspace"
            align="start"
            trigger={
              <button
                className={cn(
                  "flex items-center gap-3.25 min-w-63.75 py-2.5 px-3.25 border border-[#dcd8eb] rounded-[10px] bg-(image:--background-image-business-selector) text-[13px] font-[630] whitespace-nowrap",
                  "[&>svg:first-child]:text-[#7442f7]",
                  "[&>svg:last-child]:ml-auto",
                  "hover:border-[#bba4eb]",
                  "max-xl:min-w-56.25 max-xl:text-[12px]",
                  "max-lg:min-w-52.5",
                  "max-md:min-w-0 max-md:flex-[0_1_245px] max-md:text-[12px] max-md:py-2 max-md:px-2.5 max-md:gap-2.25",
                  "max-md:[&>svg:first-child]:w-4.75 max-md:[&>svg:first-child]:h-4.75",
                  "max-md:[&>span]:overflow-hidden max-md:[&>span]:text-ellipsis max-md:[&>span]:whitespace-nowrap",
                  "max-sm:text-[11px] max-sm:px-2 max-sm:gap-1.75 max-sm:rounded-[8px]",
                  "max-sm:[&>svg:last-child]:w-3",
                )}
              >
                <Store size={22} />
                <span>{business.name}</span>
                <ChevronDown size={16} />
              </button>
            }
          >
            <div className="text-[9px] font-semibold text-support-muted tracking-[0.7px] py-2 px-2.25">
              YOUR DEMO WORKSPACE
            </div>
            <MenuItem>
              <Store size={17} />
              <span>{business.name}</span>
              <Check size={15} />
            </MenuItem>
            <div className="text-[11px] text-support-muted leading-[1.7] py-2 px-2.5 max-w-75">
              A fictional outdoor retailer.
              <br />
              More workspaces will be available with accounts.
            </div>
          </Menu>
          <button
            data-slot="global-search"
            className={cn(
              "w-full max-w-148.75 ml-auto flex items-center gap-2.75 min-h-10 py-2 px-3.25 rounded-[10px] border border-[#dcd8e9] bg-[#faf9fd] text-[#65607c] text-[12px]",
              "[&>span]:overflow-hidden [&>span]:whitespace-nowrap [&>span]:text-ellipsis",
              "[&_kbd]:ml-auto [&_kbd]:flex [&_kbd]:items-center [&_kbd]:gap-0.75 [&_kbd]:border [&_kbd]:border-[#e2deee] [&_kbd]:rounded-[5px] [&_kbd]:py-0.75 [&_kbd]:px-1.75 [&_kbd]:whitespace-nowrap [&_kbd]:font-[inherit] [&_kbd]:text-[11px] [&_kbd]:bg-[#f1eef8]",
              "max-xl:text-[11px]",
              "max-lg:max-w-67.5",
              "max-lg:[&_kbd]:hidden",
              "max-md:hidden",
            )}
            onClick={() => setSearchOpen(true)}
          >
            <Search size={19} />
            <span>Search your business, data, or past investigations…</span>
            <kbd>
              <Command size={12} /> K
            </kbd>
          </button>
          <div
            className={cn(
              "flex items-center gap-3.5 ml-auto",
              "max-xl:gap-2",
              "max-md:gap-1.25",
              "max-sm:gap-0.5",
            )}
          >
            <Button
              variant="icon"
              data-slot="icon-button"
              data-control="mobile-search"
              className={cn("hidden", "max-md:inline-flex max-md:w-7.25")}
              aria-label="Search workspace"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={21} />
            </Button>
            <Menu
              label="View operational notifications"
              trigger={
                <Button
                  variant="icon"
                  data-slot="icon-button"
                  className={cn(
                    "relative",
                    "[&>span]:absolute [&>span]:right-1.5 [&>span]:top-0.75 [&>span]:bg-[#803bff] [&>span]:border-[2px] [&>span]:border-white [&>span]:w-2.5 [&>span]:h-2.5 [&>span]:rounded-[50%]",
                    "max-sm:w-7.5",
                  )}
                  aria-label="View operational notifications"
                >
                  <Bell size={22} />
                  <span />
                </Button>
              }
            >
              <div className="text-[9px] font-semibold text-support-muted tracking-[0.7px] py-2 px-2.25">
                SAMPLE NOTIFICATIONS
              </div>
              {alerts.map((alert) => (
                <MenuItem
                  key={alert.id}
                  onSelect={() =>
                    router.push("/demo/overview#operational-alerts")
                  }
                >
                  <div>
                    <strong>{alert.title}</strong>
                    <small>{alert.description}</small>
                  </div>
                  <ChevronRight size={15} />
                </MenuItem>
              ))}
              <div className="text-[11px] text-support-muted leading-[1.7] py-2 px-2.5 max-w-75">
                Snapshot: {business.snapshot}
              </div>
            </Menu>
            <span
              className={cn(
                "w-0.25 h-6.25 bg-[#e3dfeb]",
                "max-md:mx-1 max-md:h-5.5",
                "max-sm:hidden",
              )}
            />
            <Menu
              label="Open demo profile"
              trigger={
                <button
                  className={cn(
                    "flex items-center gap-2.5 p-0 border-0 bg-transparent text-[#49405f]",
                    "max-md:gap-1.25",
                    "max-sm:[&>svg]:hidden",
                  )}
                >
                  <span
                    className={cn(
                      "rounded-[50%] w-8.5 h-8.5 bg-(image:--background-image-avatar) border-[3px] border-[#f6ede8] grid place-items-center text-[#654832] text-[11px] font-[650]",
                      "max-md:w-7.75 max-md:h-7.75 max-md:text-[10px]",
                    )}
                  >
                    JD
                  </span>
                  <ChevronDown size={14} />
                </button>
              }
            >
              <div className="text-[9px] font-semibold text-support-muted tracking-[0.7px] py-2 px-2.25">
                DEMO VISITOR
              </div>
              <div className="text-[11px] text-support-muted leading-[1.7] py-2 px-2.5 max-w-75">
                Explore freely. No account is signed in.
              </div>
              <MenuItem onSelect={() => router.push("/demo/settings")}>
                <Settings size={16} />
                Workspace settings
              </MenuItem>
              <MenuItem onSelect={() => router.push("/")}>
                <LogOut size={16} />
                Exit demo
              </MenuItem>
            </Menu>
          </div>
        </header>
        <main
          id="main-content"
          className={cn(
            "relative isolate pt-5.75 px-6 pb-4.5 min-h-[calc(100svh_-_104px)] max-w-450 my-0 mx-auto outline-none",
            "2xl:py-6.25 2xl:px-7",
            "max-xl:px-5",
            "max-lg:px-4.5",
            "max-md:pt-5.5 max-md:px-4 max-md:pb-4 max-md:min-h-[calc(100svh_-_101px)]",
            "max-sm:px-3.25 max-sm:pt-5",
          )}
          tabIndex={-1}
        >
          <div
            className={cn(
              "absolute -z-1 top-0 right-0 w-[65%] h-45 pointer-events-none overflow-hidden bg-(image:--background-image-page-ambient) [mask-image:linear-gradient(black,_transparent)]",
              "[&::after]:content-[''] [&::after]:absolute [&::after]:top-1.25 [&::after]:-right-6.25 [&::after]:w-60 [&::after]:h-20 [&::after]:rounded-[80%_0_0_10%] [&::after]:bg-[#c0f8f887] [&::after]:[transform:rotate(-24deg)]",
            )}
            aria-hidden="true"
          />
          {children}
        </main>
        <footer
          className={cn(
            "flex justify-between gap-3.75 pt-1 px-6.5 pb-3.5 text-[9px] text-[#736b80]",
            "[&>span]:inline-flex [&>span]:items-center [&>span]:gap-1.25",
            "max-md:text-[8px] max-md:px-4.5 max-md:flex-wrap max-md:gap-1.5",
            "max-sm:gap-1.75 max-sm:px-3.75 max-sm:pb-4",
          )}
        >
          <span>
            <FlaskConical size={12} />
            Synthetic data · Frontend demonstration
          </span>
          <span>
            {business.name} · {business.snapshot}
          </span>
        </footer>
      </div>
      <Modal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Search your workspace"
        description="Find pages and prepared investigations in the demo."
      >
        <div
          data-slot="search-field"
          className={cn(
            "flex items-center gap-2.5 py-2.75 px-3.25 border border-[#e0d6e8] bg-white rounded-[10px] text-[#796089]",
            "[&_input]:w-full [&_input]:min-w-0 [&_input]:bg-none [&_input]:bg-transparent [&_input]:outline-none [&_input]:border-0 [&_input]:text-[#5f4673] [&_input]:text-[12px]",
            "focus-within:[outline:2px_solid_#b18ade] focus-within:outline-offset-[2px]",
            "[&_input:focus-visible]:outline-none",
          )}
        >
          <Search size={19} />
          <input
            aria-label="Search pages and investigations"
            placeholder="Try “order 4821” or “connections”"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div
          className={cn(
            "mt-3.75",
            "[&>button]:flex [&>button]:items-center [&>button]:justify-between [&>button]:gap-3 [&>button]:p-3 [&>button]:border-0 [&>button]:bg-none [&>button]:bg-transparent [&>button]:rounded-[8px] [&>button]:w-full [&>button]:text-left [&>button]:text-[#8a639e]",
            "[&>button:hover]:bg-[#f2e9fb]",
            "[&_strong]:text-[#523b64] [&_strong]:text-[12px] [&_strong]:font-semibold",
            "[&_small]:block [&_small]:text-[#795d8b] [&_small]:mt-1 [&_small]:text-[10px]",
          )}
        >
          {searchResults.length ? (
            searchResults.map((result) => (
              <button
                key={result.title}
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                  router.push(result.href);
                }}
              >
                <div>
                  <strong>{result.title}</strong>
                  <small>{result.subtitle}</small>
                </div>
                <ArrowUpRight size={17} />
              </button>
            ))
          ) : (
            <div
              className={cn(
                "py-10 px-5 text-center text-[#805f94]",
                "[&>svg]:mt-0 [&>svg]:mx-auto [&>svg]:mb-3.75",
                "[&_[data-slot=text-link]]:mt-3.75",
              )}
            >
              <Search size={28} />
              <h3 className="text-[16px] font-semibold text-[#755089]">
                No sample results
              </h3>
              <p className="text-[12px] mt-2 leading-[1.6]">
                Try “4821”, “revenue”, or a page name.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4.5 mb-5.5",
        "[&_h1]:text-[34px] [&_h1]:leading-[1.15] [&_h1]:font-[750] [&_h1]:tracking-[-1.3px]",
        "[&_p]:text-[13px] [&_p]:text-[#66627f] [&_p]:mt-1.5 [&_p]:leading-[1.55]",
        "[&>[data-slot=demo-badge]]:mt-1.5",
        "2xl:[&_h1]:text-[38px]",
        "2xl:[&_p]:text-[15px]",
        "max-xl:[&_h1]:text-[30px]",
        "max-xl:[&_p]:text-[12px]",
        "max-xl:[&>[data-slot=demo-badge]]:text-[9px]",
        "max-lg:[&>[data-slot=demo-badge]]:hidden",
        "max-lg:[&_h1]:text-[28px]",
        "max-lg:[&_p]:max-w-150",
        "max-md:mb-4.75",
        "max-md:[&_h1]:text-[28px] max-md:[&_h1]:tracking-[-1px]",
        "max-md:[&_p]:text-[12px] max-md:[&_p]:leading-[1.65] max-md:[&_p]:mt-1.75",
        "max-sm:[&_h1]:text-[27px]",
        "max-sm:[&_p]:text-[11px]",
      )}
    >
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <DemoBadge />
    </div>
  );
}

export function SampleLabel() {
  return <Badge>Sample data</Badge>;
}
