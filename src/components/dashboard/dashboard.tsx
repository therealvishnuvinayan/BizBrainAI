"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  toneClasses,
  kpiToneClasses,
  connectionMarkClasses,
} from "@/components/ui/tone-variants";
import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ShoppingCart,
  TriangleAlert,
  Package,
  Sparkles,
  TrendingUp,
  Clock3,
  ArrowRight,
  ChevronRight,
  Search,
  Link2,
  Bell,
  Database,
  FlaskConical,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import {
  Badge,
  CompleteBadge,
  IconTile,
  Modal,
  SectionHeading,
} from "@/components/ui/primitives";
import { QuestionComposer } from "@/components/shared/question-composer";
import { RevenueChart, OrdersChart } from "@/components/dashboard/charts";
import {
  alerts,
  business,
  connections,
  inventoryItems,
  investigations,
  kpis,
  overviewFindings,
} from "@/data/business";
import { formatNumber } from "@/lib/format";

const kpiIcons = {
  revenue: BarChart3,
  orders: ShoppingCart,
  inventory: TriangleAlert,
  fulfillment: Package,
};

export function ConnectionMark({ id }: { id: string }) {
  const connection = connections.find((item) => item.id === id)!;
  return (
    <span
      data-slot="connection-mark"
      className={cn(
        "text-[25px] font-extrabold leading-[1] w-6.5 h-6.5 grid place-items-center shrink-0",
        connectionMarkClasses[id],
      )}
      style={{ color: connection.color }}
      aria-hidden="true"
    >
      {id === "analytics" ? (
        <BarChart3 size={25} strokeWidth={3} />
      ) : id === "shipstation" ? (
        <SettingsMark />
      ) : (
        connection.initials
      )}
    </span>
  );
}

function SettingsMark() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m9 1 6 0 .7 3 2 .9 2.8-.9 3 5.2-2.1 2.1v2.3l2.1 2.1-3 5.2-2.8-.9-2 .9-.7 3H9l-.7-3-2-.9-2.8.9-3-5.2 2.1-2.1v-2.3L.5 9.2l3-5.2 2.8.9 2-.9L9 1Zm3 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    </svg>
  );
}

export function RecentInvestigations({
  expanded = false,
}: {
  expanded?: boolean;
}) {
  return (
    <Card
      asChild
      className={cn(
        "pt-4 overflow-hidden",
        "[&>[data-slot=section-heading]]:py-0 [&>[data-slot=section-heading]]:px-3.75 [&>[data-slot=section-heading]]:mb-3",
        "max-xl:col-span-full",
        "max-md:[&>[data-slot=section-heading]_h2]:text-[17px]",
        "max-sm:col-auto",
        "max-sm:[&>[data-slot=section-heading]]:px-3.5",
        expanded
          ? cn(
              "[&_[data-slot=investigations-table]]:text-[12px]",
              "[&_[data-slot=investigations-table]_th]:text-[11px] [&_[data-slot=investigations-table]_th]:pt-4 [&_[data-slot=investigations-table]_th]:pb-4",
              "[&_[data-slot=investigations-table]_td]:pt-4.75 [&_[data-slot=investigations-table]_td]:pb-4.75",
              "[&_[data-slot=investigations-table]_[data-slot=badge]]:text-[10px]",
            )
          : "",
      )}
    >
      <section>
        <SectionHeading title="Recent Investigations">
          {!expanded && (
            <Link
              href="/demo/investigations"
              data-slot="text-link"
              className={buttonVariants({ variant: "link" })}
            >
              View all <ArrowRight size={15} />
            </Link>
          )}
        </SectionHeading>
        <div className="relative overflow-x-auto max-w-full">
          <table
            data-slot="investigations-table"
            className={cn(
              "w-full border-collapse text-left text-[9px]",
              "[&_thead]:bg-[#f3f1f9] [&_thead]:text-[#685b7b] [&_thead]:text-[9px]",
              "[&_th]:font-[550] [&_th]:py-2.75 [&_th]:px-2",
              "[&_th:first-child]:pl-3.75 [&_th:first-child]:rounded-tl-[14px]",
              "[&_th:last-child]:rounded-tr-[14px]",
              "[&_td]:py-2.75 [&_td]:px-2 [&_td]:border-b [&_td]:border-b-[#efedf5] [&_td]:text-[#605672] [&_td]:leading-[1.4]",
              "[&_td:first-child]:pl-3",
              "[&_td:first-child_a]:flex [&_td:first-child_a]:items-center [&_td:first-child_a]:gap-1.75 [&_td:first-child_a]:text-[#29203d] [&_td:first-child_a]:font-[590] [&_td:first-child_a]:min-w-40",
              "[&_tr:last-child_td]:border-0",
              "[&_tbody_tr:hover]:bg-[#faf8ff]",
              "[&_[data-slot=badge]]:text-[8px] [&_[data-slot=badge]]:py-0.75 [&_[data-slot=badge]]:px-1.25",
              "2xl:text-[11px]",
              "2xl:[&_th]:text-[10px]",
              "2xl:[&_td]:py-3.5",
              "max-xl:text-[11px]",
              "max-xl:[&_td]:py-3.25",
              "max-md:text-[10px]",
              "max-md:[&_td]:py-3.25",
              "max-sm:min-w-147.5",
              "max-sm:[&_td:first-child_a]:min-w-46.25",
            )}
          >
            <caption className="sr-only">
              Prepared investigations in the fictional demo
            </caption>
            <thead>
              <tr>
                <th scope="col">Investigation</th>
                <th scope="col">Status</th>
                <th scope="col">Created</th>
                <th scope="col">Result</th>
                <th scope="col">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {investigations.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link href={item.href}>
                      <span className="text-[#7941fb] bg-tone-purple p-1 inline-flex rounded-[6px]">
                        <Search size={15} />
                      </span>
                      {item.question}
                    </Link>
                  </td>
                  <td>
                    {item.status === "Completed" ? (
                      <CompleteBadge />
                    ) : (
                      <Badge>{item.status}</Badge>
                    )}
                  </td>
                  <td className="whitespace-nowrap">{item.created}</td>
                  <td>{item.result}</td>
                  <td>
                    <Link
                      className="grid place-items-center w-5 h-6.25 text-[#777086]"
                      href={item.href}
                      aria-label={`Open: ${item.question}`}
                    >
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Card>
  );
}

export function Dashboard() {
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [alertId, setAlertId] = useState<string | null>(null);
  const connection = connections.find((item) => item.id === connectionId);

  return (
    <>
      <PageHeader
        title="Business Overview"
        description={`An AI-powered view of ${business.name} — performance, risks, and what to do next.`}
      />
      <QuestionComposer />
      <div
        className={cn(
          "grid grid-cols-4 gap-3.5 mb-4.25",
          "max-lg:grid-cols-2 max-lg:gap-3",
          "max-md:gap-2.75 max-md:mb-3.75",
        )}
      >
        {kpis.map((kpi) => (
          <Card
            key={kpi.id}
            asChild
            className={cn(
              "relative overflow-hidden flex items-start pt-3.75 px-3.25 pb-3.5 gap-3 min-h-25.75",
              "[&_[data-slot=icon-tile]]:w-10.75 [&_[data-slot=icon-tile]]:h-10.75 [&_[data-slot=icon-tile]]:rounded-[11px]",
              "2xl:py-4.5 2xl:px-4 2xl:min-h-28",
              "max-xl:gap-2 max-xl:py-3.5 max-xl:px-2.5",
              "max-xl:[&_[data-slot=icon-tile]]:w-8.75 max-xl:[&_[data-slot=icon-tile]]:h-8.75",
              "max-xl:[&_[data-slot=icon-tile]>svg]:w-5.25",
              "max-lg:p-4 max-lg:gap-3.5 max-lg:min-h-25",
              "max-lg:[&_[data-slot=icon-tile]]:w-10.75 max-lg:[&_[data-slot=icon-tile]]:h-10.75",
              "max-md:gap-2.5 max-md:py-3.5 max-md:px-3",
              "max-md:[&_[data-slot=icon-tile]]:w-9.5 max-md:[&_[data-slot=icon-tile]]:h-9.5",
              "max-sm:py-3.25 max-sm:px-2.75 max-sm:gap-2.25 max-sm:min-h-29.25 max-sm:flex-wrap max-sm:items-start",
              "max-sm:[&_[data-slot=icon-tile]]:w-7.75 max-sm:[&_[data-slot=icon-tile]]:h-7.75 max-sm:[&_[data-slot=icon-tile]]:rounded-[8px]",
              "max-sm:[&_[data-slot=icon-tile]>svg]:w-4.5 max-sm:[&_[data-slot=icon-tile]>svg]:h-4.5",
              kpiToneClasses[kpi.tone],
            )}
          >
            <section>
              <IconTile icon={kpiIcons[kpi.id]} tone={kpi.tone} />
              <div
                className={cn("flex-1 min-w-0 relative z-1", "max-sm:contents")}
              >
                <h2 className="text-[12px] font-[610] mt-0.25 mx-0 mb-1.75 2xl:text-[14px] max-xl:text-[11px] max-lg:text-[12px] max-md:text-[11px] max-sm:flex-1 max-sm:mt-2 max-sm:mx-0 max-sm:mb-0 max-sm:text-[10px] max-sm:font-semibold max-sm:whitespace-nowrap">
                  {kpi.label}
                </h2>
                <div
                  className={cn(
                    "flex items-center justify-between gap-1.25",
                    "[&_[data-slot=badge]]:text-[9px] [&_[data-slot=badge]]:py-1 [&_[data-slot=badge]]:px-1.5",
                    "2xl:[&_[data-slot=badge]]:text-[11px]",
                    "max-xl:flex-wrap max-xl:gap-1.25",
                    "max-lg:flex-nowrap",
                    "max-md:[&_[data-slot=badge]]:text-[9px]",
                    "max-sm:basis-full max-sm:gap-1",
                    "max-sm:[&_[data-slot=badge]]:text-[8px] max-sm:[&_[data-slot=badge]]:py-1 max-sm:[&_[data-slot=badge]]:px-1.25",
                  )}
                >
                  <strong className="text-[length:clamp(21px,_1.9vw,_30px)] font-[730] tracking-[-0.8px] leading-[1.1] max-xl:text-[23px] max-md:text-[25px] max-sm:text-[24px]">
                    {kpi.value}
                  </strong>
                  <Badge tone="green">
                    {kpi.direction === "up" ? "▲" : "▼"} {kpi.change}
                  </Badge>
                </div>
                <p className="text-[10px] text-[#6b6580] mt-2 whitespace-nowrap tracking-[-0.1px] 2xl:text-[12px] max-xl:text-[9px] max-xl:whitespace-normal max-lg:text-[10px] max-md:text-[10px] max-sm:basis-full max-sm:text-[9px] max-sm:-mt-1">
                  {kpi.comparison}
                </p>
              </div>
              <span
                data-slot="kpi-wave"
                className="absolute w-23.75 h-11.25 -right-6 -bottom-5.5 [transform:rotate(-26deg)] bg-(image:--background-image-kpi-wave) rounded-[40%_40%_0_0]"
                aria-hidden="true"
              />
            </section>
          </Card>
        ))}
      </div>
      <div
        className={cn(
          "grid grid-cols-[1.15fr_1.02fr_1fr] gap-3.75 items-stretch mb-4.5",
          "max-xl:grid-cols-[1fr_1fr]",
          "max-md:gap-3.25",
          "max-sm:grid-cols-[1fr]",
        )}
      >
        <RevenueChart />
        <OrdersChart />
        <Card
          asChild
          className={cn(
            "pt-4 px-3.5 pb-3 flex flex-col [scroll-margin-top:90px]",
            "[&_[data-slot=section-heading]]:mb-3.25",
            "[&_[data-slot=section-heading]_[data-slot=badge]]:text-[9px]",
            "[&>[data-slot=panel-footnote]]:mt-auto [&>[data-slot=panel-footnote]]:pt-2.5",
            "max-xl:col-span-full",
            "max-xl:[&>[data-slot=panel-footnote]]:pt-1",
            "max-sm:p-4",
            "max-sm:[&>[data-slot=panel-footnote]]:text-[9px] max-sm:[&>[data-slot=panel-footnote]]:pt-2",
          )}
        >
          <section id="ai-findings">
            <SectionHeading icon={Sparkles} title="AI Findings">
              <Badge>Demo insights</Badge>
            </SectionHeading>
            <div
              className={cn(
                "max-xl:grid max-xl:grid-cols-[1fr_1fr] max-xl:gap-5",
                "max-sm:block",
              )}
            >
              {overviewFindings.map((finding) => (
                <details
                  key={finding.id}
                  data-slot="overview-finding"
                  className={cn(
                    "py-2.75 px-0",
                    "[&:first-child]:pt-0.75",
                    "[&+[data-slot=overview-finding]]:border-t [&+[data-slot=overview-finding]]:border-t-divider [&+[data-slot=overview-finding]]:mt-0.5 [&+[data-slot=overview-finding]]:pt-3.75",
                    "[&_summary]:flex [&_summary]:gap-2.5 [&_summary]:list-none",
                    "[&_summary::-webkit-details-marker]:hidden",
                    "[&_strong]:block [&_strong]:text-[11px] [&_strong]:leading-[1.5] [&_strong]:font-[650] [&_strong]:tracking-[-0.15px]",
                    "[&_[data-slot=icon-tile]]:mt-0.5 [&_[data-slot=icon-tile]]:w-7.75 [&_[data-slot=icon-tile]]:h-7.75",
                    "2xl:[&_strong]:text-[13px]",
                    "max-xl:[&+[data-slot=overview-finding]]:border-0 max-xl:[&+[data-slot=overview-finding]]:border-l max-xl:[&+[data-slot=overview-finding]]:border-l-[#eee8f5] max-xl:[&+[data-slot=overview-finding]]:pt-0.75 max-xl:[&+[data-slot=overview-finding]]:pr-0 max-xl:[&+[data-slot=overview-finding]]:pb-2.5 max-xl:[&+[data-slot=overview-finding]]:pl-5 max-xl:[&+[data-slot=overview-finding]]:m-0",
                    "max-md:[&_strong]:text-[12px]",
                    "max-sm:py-2.5 max-sm:px-0",
                    "max-sm:[&+[data-slot=overview-finding]]:border-l-0 max-sm:[&+[data-slot=overview-finding]]:border-t max-sm:[&+[data-slot=overview-finding]]:border-t-divider max-sm:[&+[data-slot=overview-finding]]:mt-1 max-sm:[&+[data-slot=overview-finding]]:pt-4 max-sm:[&+[data-slot=overview-finding]]:px-0 max-sm:[&+[data-slot=overview-finding]]:pb-3",
                    "max-sm:[&_strong]:text-[12px]",
                  )}
                >
                  <summary>
                    <IconTile
                      icon={finding.id === "revenue" ? TrendingUp : Clock3}
                      tone={finding.tone}
                      small
                    />
                    <span>
                      <strong>{finding.title}</strong>
                      <span
                        className={cn(
                          "block text-[#6d6583] text-[10px] leading-[1.55] mt-0.75",
                          "2xl:text-[11px]",
                          "max-md:text-[11px]",
                          "max-sm:text-[11px]",
                        )}
                      >
                        {finding.detail}
                      </span>
                    </span>
                  </summary>
                  <div
                    className={cn(
                      "text-[10px] text-[#714ca8] p-3 bg-[#f7f3ff] rounded-[8px] mt-2.5 leading-[1.6]",
                      "[&>svg]:inline [&>svg]:mr-1.25 [&>svg]:align-middle",
                    )}
                  >
                    <Database size={13} />
                    {finding.source}
                    <p className="text-[9px] text-[#756785] mt-1.25">
                      Prepared insight from fictional data; no model execution.
                    </p>
                  </div>
                </details>
              ))}
            </div>
            <p
              data-slot="panel-footnote"
              className="flex gap-1.25 items-center text-footnote text-[9px]"
            >
              <FlaskConical size={12} />
              Prepared from the sample business snapshot
            </p>
          </section>
        </Card>
      </div>
      <div
        className={cn(
          "grid grid-cols-[1.85fr_1fr_1fr] gap-3.75 items-stretch",
          "max-xl:grid-cols-[1fr_1fr]",
          "max-md:gap-3.25",
          "max-sm:grid-cols-[1fr]",
        )}
      >
        <RecentInvestigations />
        <Card
          asChild
          className={cn(
            "pt-4 px-3.5 pb-3.25",
            "[&_[data-slot=section-heading]]:gap-1.25 [&_[data-slot=section-heading]]:mb-2.75",
            "[&_[data-slot=section-heading]_h2]:text-[16px] [&_[data-slot=section-heading]_h2]:gap-1.75",
            "[&_[data-slot=section-heading]_[data-slot=badge]]:text-[8px] [&_[data-slot=section-heading]_[data-slot=badge]]:py-0.75 [&_[data-slot=section-heading]_[data-slot=badge]]:px-1.25",
            "[&_[data-slot=panel-footnote]]:text-[8px] [&_[data-slot=panel-footnote]]:mt-1.75",
            "max-xl:[&_[data-slot=section-heading]_h2]:text-[17px]",
            "max-md:py-4 max-md:px-3.5",
            "max-md:[&_[data-slot=section-heading]_h2]:text-[16px]",
            "max-md:[&_[data-slot=section-icon]]:w-5",
            "max-sm:[&_[data-slot=section-heading]_h2]:text-[18px]",
            "max-sm:[&_[data-slot=section-heading]_[data-slot=badge]]:text-[10px]",
            "max-sm:[&_[data-slot=panel-footnote]]:text-[9px]",
          )}
        >
          <section>
            <SectionHeading icon={Link2} title="Connection Health">
              <Badge>
                <Check size={12} />
                Demo
              </Badge>
            </SectionHeading>
            <div
              className={cn(
                "[&>button]:w-full [&>button]:flex [&>button]:items-center [&>button]:gap-2.5 [&>button]:py-2.25 [&>button]:px-0 [&>button]:bg-none [&>button]:bg-transparent [&>button]:border-0 [&>button]:border-b [&>button]:border-b-divider [&>button]:text-left",
                "[&>button:hover]:bg-[#faf8ff]",
                "[&>button:last-child]:border-0",
                "[&_strong]:text-[11px] [&_strong]:font-semibold",
                "[&>button>svg]:text-[#786b88]",
                "2xl:[&_strong]:text-[12px]",
                "2xl:[&>button]:py-3",
                "max-xl:[&>button]:py-2.75",
                "max-xl:[&_strong]:text-[12px]",
                "max-sm:[&>button]:py-3.25",
                "max-sm:[&_strong]:text-[13px]",
              )}
            >
              {connections.map((item) => (
                <button key={item.id} onClick={() => setConnectionId(item.id)}>
                  <ConnectionMark id={item.id} />
                  <strong>{item.name}</strong>
                  <span
                    className={cn(
                      "ml-auto inline-flex items-center gap-1.25 text-[10px] text-[#78658c]",
                      "[&>i]:w-1.5 [&>i]:h-1.5 [&>i]:rounded-[50%] [&>i]:bg-[#b49acb]",
                      "2xl:text-[12px]",
                      "max-xl:text-[11px]",
                      "max-sm:text-[12px]",
                    )}
                  >
                    <i />
                    Sample
                  </span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
            <p
              data-slot="panel-footnote"
              className="flex gap-1.25 items-center text-footnote text-[9px]"
            >
              Simulated sources · no live integrations
            </p>
          </section>
        </Card>
        <Card
          asChild
          className={cn(
            "py-4 px-3.25 [scroll-margin-top:90px]",
            "[&_[data-slot=section-heading]]:mb-4.25",
            "[&_[data-slot=section-heading]_h2]:text-[16px] [&_[data-slot=section-heading]_h2]:gap-1.75",
            "[&_[data-slot=section-icon]]:text-[#686181]",
            "[&_[data-slot=section-heading]_[data-slot=badge]]:text-[14px] [&_[data-slot=section-heading]_[data-slot=badge]]:min-w-6 [&_[data-slot=section-heading]_[data-slot=badge]]:p-1",
            "max-xl:[&_[data-slot=section-heading]_h2]:text-[17px]",
            "max-md:py-4 max-md:px-3.5",
            "max-md:[&_[data-slot=section-heading]_h2]:text-[16px]",
            "max-md:[&_[data-slot=section-icon]]:w-5",
            "max-sm:[&_[data-slot=section-heading]_h2]:text-[18px]",
          )}
        >
          <section id="operational-alerts">
            <SectionHeading icon={Bell} title="Operational Alerts">
              <Badge>{alerts.length}</Badge>
            </SectionHeading>
            <div className="grid gap-2.25">
              {alerts.map((alert) => (
                <button
                  data-tone={alert.tone}
                  className={cn(
                    "flex items-center gap-2.5 border-0 rounded-[11px] py-3.25 px-2.5 w-full text-left",
                    "[&>span]:flex-1",
                    "[&_strong]:block [&_strong]:text-[11px] [&_strong]:leading-[1.4] [&_strong]:text-[#29213b] [&_strong]:tracking-[-0.15px]",
                    "[&_small]:block [&_small]:text-[10px] [&_small]:text-[#70637e] [&_small]:leading-[1.5] [&_small]:mt-0.75",
                    "hover:[filter:brightness(0.985)] hover:shadow-alert-item-hover",
                    "[&[data-tone=amber]]:bg-[#fff7ec]",
                    "[&[data-tone=purple]]:bg-[#f4efff]",
                    "2xl:[&_strong]:text-[12px]",
                    "2xl:[&_small]:text-[11px]",
                    "max-xl:py-4.25",
                    "max-xl:[&_strong]:text-[12px]",
                    "max-xl:[&_small]:text-[11px]",
                    "max-sm:py-3.75 max-sm:px-3.25",
                    "max-sm:[&_strong]:text-[12px]",
                    toneClasses[alert.tone],
                  )}
                  key={alert.id}
                  onClick={() => setAlertId(alert.id)}
                >
                  {alert.id === "inventory" ? (
                    <TriangleAlert size={23} />
                  ) : (
                    <Clock3 size={23} />
                  )}
                  <span>
                    <strong>{alert.title}</strong>
                    <small>{alert.description}</small>
                  </span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </section>
        </Card>
      </div>
      <Modal
        open={Boolean(connection)}
        onOpenChange={(open) => {
          if (!open) setConnectionId(null);
        }}
        title={`${connection?.name ?? "Data source"} · sample connection`}
        description="This source is simulated. No account is connected and no data is synced."
      >
        {connection && (
          <>
            <div
              className={cn(
                "flex items-center gap-3.75 pb-4 border-b border-b-[#eee6f4] mb-3.75",
                "[&>div]:flex-1",
                "[&_strong]:text-[13px]",
                "[&_p]:text-record-meta [&_p]:text-[11px] [&_p]:mt-1.25",
                "[&~[data-slot=secondary-button]]:mt-5",
              )}
            >
              <ConnectionMark id={connection.id} />
              <div>
                <strong>{connection.category}</strong>
                <p>
                  {formatNumber(connection.records)} sample{" "}
                  {connection.id === "analytics"
                    ? "weekly snapshots"
                    : "records"}
                </p>
              </div>
              <Badge>Demo only</Badge>
            </div>
            <p
              className={cn(
                "text-content-muted text-[13px]",
                "max-sm:text-[12px]",
              )}
            >
              {connection.description}
            </p>
            <Button variant="outline" data-slot="secondary-button" disabled>
              Live integrations coming later
            </Button>
            <Link
              data-slot="text-link"
              className={cn(buttonVariants({ variant: "link" }), "mt-5")}
              href="/demo/connections"
              onClick={() => setConnectionId(null)}
            >
              Explore sample connections <ArrowRight size={15} />
            </Link>
          </>
        )}
      </Modal>
      <Modal
        open={Boolean(alertId)}
        onOpenChange={(open) => {
          if (!open) setAlertId(null);
        }}
        title={
          alertId === "inventory"
            ? "High-risk inventory"
            : "Orders need attention"
        }
        description={`Sample operational alert · ${business.snapshot}`}
      >
        {alertId === "inventory" ? (
          <>
            <p
              className={cn(
                "text-content-muted text-[13px]",
                "max-sm:text-[12px]",
              )}
            >
              These are the most urgent items in the sample inventory. Incoming
              dates are estimates.
            </p>
            <div
              className={cn(
                "mt-4.5",
                "[&>div]:flex [&>div]:justify-between [&>div]:gap-3.75 [&>div]:py-3.75 [&>div]:px-0 [&>div]:border-b [&>div]:border-b-[#eee5f3]",
                "[&_strong]:text-[12px] [&_strong]:text-[#5c3f6d]",
                "[&_small]:block [&_small]:mt-1.5 [&_small]:text-record-meta [&_small]:text-[10px]",
                "[&>div>div:last-child]:text-right",
              )}
            >
              {inventoryItems.map((item) => (
                <div key={item.sku}>
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {item.sku} · {item.onHand} on hand
                    </small>
                  </div>
                  <div>
                    <Badge tone="amber">{item.status}</Badge>
                    <small>
                      {item.incoming} incoming · {item.available}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p
            className={cn(
              "text-content-muted text-[13px]",
              "max-sm:text-[12px]",
            )}
          >
            The sample delay rate is above the operational target. Order #4821
            illustrates one cause: an out-of-stock item blocked allocation and
            the whole order missed its dispatch promise.
          </p>
        )}
        <Link
          href="/demo/investigations/4821"
          className={cn(buttonVariants({ variant: "default" }), "mt-5")}
          onClick={() => setAlertId(null)}
        >
          Investigate order #4821 <ArrowRight size={17} />
        </Link>
      </Modal>
    </>
  );
}
