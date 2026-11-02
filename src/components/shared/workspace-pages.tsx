"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Database,
  FileText,
  FlaskConical,
  History,
  LockKeyhole,
  Monitor,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import {
  Badge,
  CompleteBadge,
  IconTile,
  SectionHeading,
} from "@/components/ui/primitives";
import {
  ConnectionMark,
  RecentInvestigations,
} from "@/components/dashboard/dashboard";
import { QuestionComposer } from "@/components/shared/question-composer";
import {
  EvidenceDialog,
  RecordFields,
} from "@/components/shared/evidence-dialog";
import { business, connections, investigations } from "@/data/business";
import { evidence, investigation } from "@/data/investigation";
import { formatNumber } from "@/lib/format";

export function InvestigationsPage() {
  return (
    <>
      <PageHeader
        title="Investigations"
        description="Start with a question. Follow the evidence. Find a clearer way forward."
      />
      <QuestionComposer />
      <Card
        asChild
        className={cn(
          "flex items-center gap-5 p-6.5 mb-5.5 bg-(image:--background-image-featured-investigation)",
          "[&>div]:flex-1",
          "[&_h2]:text-[21px] [&_h2]:tracking-[-0.5px] [&_h2]:mt-1.25 [&_h2]:mx-0 [&_h2]:mb-2",
          "[&>div>p:last-child]:text-[#82708e] [&>div>p:last-child]:text-[12px] [&>div>p:last-child]:leading-[1.6]",
          "[&>svg]:text-[#9664cb]",
          "hover:border-[#c5a7e6]",
          "max-lg:flex-wrap",
          "max-lg:[&>div]:min-w-[65%]",
          "max-lg:[&>svg]:ml-auto",
          "max-md:p-5 max-md:gap-3.5",
          "max-md:[&_h2]:text-[18px]",
          "max-md:[&>div>p:last-child]:text-[11px]",
          "max-sm:gap-3.25 max-sm:p-4.5",
          "max-sm:[&>[data-slot=icon-tile]]:hidden",
          "max-sm:[&_h2]:text-[19px]",
        )}
      >
        <Link href="/demo/investigations/4821">
          <IconTile icon={Search} />
          <div>
            <p
              data-slot="eyebrow"
              className="text-eyebrow text-[10px] font-[650] tracking-[0.65px]"
            >
              FEATURED SAMPLE INVESTIGATION
            </p>
            <h2>{investigation.question}</h2>
            <p>
              An out-of-stock tent. A missed dispatch promise. A complete
              evidence trail.
            </p>
          </div>
          <CompleteBadge />
          <ArrowRight size={23} />
        </Link>
      </Card>
      <RecentInvestigations expanded />
      <div
        className={cn(
          "flex gap-2.5 text-support-muted text-[11px] leading-[1.8] mt-5.5 mx-1 mb-0",
          "[&>svg]:mt-0.5",
        )}
      >
        <FlaskConical size={18} />
        <p>
          The order investigation is fully explorable. Revenue and inventory
          entries open prepared summaries. New AI investigations will be
          available in a future version.
        </p>
      </div>
    </>
  );
}

export function ConnectionsPage() {
  const [recordId, setRecordId] = useState<string | null>(null);
  return (
    <>
      <PageHeader
        title="Connections"
        description="A shared picture of your business starts with connected data."
      />
      <div
        className={cn(
          "flex items-center gap-3.5 bg-[#eee8ff] border border-[#e7dcf5] rounded-[13px] py-4.25 px-5 mb-5.5 text-[#8b5db7]",
          "[&>div]:flex-1",
          "[&_strong]:text-[13px] [&_strong]:text-[#69428a]",
          "[&_p]:text-[11px] [&_p]:leading-[1.6] [&_p]:mt-1.25 [&_p]:text-[#765987]",
          "max-md:p-3.75 max-md:items-start max-md:gap-2.5",
          "max-md:[&>[data-slot=badge]]:hidden",
        )}
      >
        <FlaskConical size={20} />
        <div>
          <strong>Sample sources, ready to explore</strong>
          <p>
            These cards represent fictional data sources. No accounts are
            linked, no API calls are made, and no sync is running.
          </p>
        </div>
        <Badge>Demo only</Badge>
      </div>
      <div
        className={cn(
          "grid grid-cols-4 gap-4.25",
          "max-xl:grid-cols-[1fr_1fr]",
          "max-md:gap-3",
          "max-sm:grid-cols-[1fr]",
        )}
      >
        {connections.map((connection) => (
          <Card
            key={connection.id}
            asChild
            className={cn(
              "p-5.5",
              "[&_h2]:text-[19px] [&_h2]:font-bold [&_h2]:tracking-[-0.5px]",
              "[&_[data-slot=eyebrow]]:text-[9px] [&_[data-slot=eyebrow]]:mt-1.5",
              "[&>p:not([data-slot=eyebrow])]:text-support-muted [&>p:not([data-slot=eyebrow])]:text-[11px] [&>p:not([data-slot=eyebrow])]:my-4.25 [&>p:not([data-slot=eyebrow])]:mx-0 [&>p:not([data-slot=eyebrow])]:min-h-19.75",
              "[&>[data-slot=secondary-button]]:mt-5 [&>[data-slot=secondary-button]]:w-full [&>[data-slot=secondary-button]]:text-[10px] [&>[data-slot=secondary-button]]:px-1.75",
              "max-xl:[&>p:not([data-slot=eyebrow])]:min-h-10",
              "max-md:p-4.75",
              "max-sm:[&>p:not([data-slot=eyebrow])]:min-h-0",
              "max-sm:[&>[data-slot=secondary-button]]:text-[12px]",
            )}
          >
            <section>
              <div
                className={cn(
                  "flex items-center justify-between mb-5.5",
                  "[&_[data-slot=connection-mark]]:w-9 [&_[data-slot=connection-mark]]:h-9 [&_[data-slot=connection-mark]]:text-[33px]",
                )}
              >
                <ConnectionMark id={connection.id} />
                <Badge>Simulated</Badge>
              </div>
              <h2>{connection.name}</h2>
              <p
                data-slot="eyebrow"
                className="text-eyebrow text-[10px] font-[650] tracking-[0.65px]"
              >
                {connection.category}
              </p>
              <p>{connection.description}</p>
              <div className="flex items-center gap-1.75 text-record-meta text-[10px] border-t border-t-[#efe7f4] pt-4">
                <Database size={16} />
                {formatNumber(connection.records)} sample{" "}
                {connection.id === "analytics" ? "snapshots" : "records"}
              </div>
              {connection.id === "analytics" ? (
                <Link
                  href="/demo/overview#ai-findings"
                  data-slot="secondary-button"
                  className={buttonVariants({ variant: "outline" })}
                >
                  View sample insights <ArrowRight size={15} />
                </Link>
              ) : (
                <Button
                  variant="outline"
                  data-slot="secondary-button"
                  onClick={() =>
                    setRecordId(
                      connection.id === "shopify"
                        ? "ORD-4821"
                        : connection.id === "netsuite"
                          ? "INV-ST200"
                          : "FUL-4821",
                    )
                  }
                >
                  Inspect a sample record <ArrowRight size={15} />
                </Button>
              )}
            </section>
          </Card>
        ))}
      </div>
      <Card
        className={cn(
          "flex items-center gap-4.75 p-6 mt-5.5",
          "[&>div]:flex-1",
          "[&_h2]:text-[17px] [&_h2]:font-[650]",
          "[&_p]:text-support-muted [&_p]:text-[11px] [&_p]:leading-[1.8] [&_p]:mt-1.5",
          "max-lg:flex-wrap",
          "max-md:p-5",
          "max-sm:p-4.5 max-sm:gap-3.25",
          "max-sm:[&_h2]:text-[15px]",
          "max-sm:[&_[data-slot=secondary-button]]:ml-0 max-sm:[&_[data-slot=secondary-button]]:w-full",
        )}
      >
        <IconTile icon={Plus} />
        <div>
          <h2>Your next connection starts here</h2>
          <p>
            Live integrations will be available after the backend and account
            system are added.
          </p>
        </div>
        <Button variant="outline" data-slot="secondary-button" disabled>
          Add connection · coming later
        </Button>
      </Card>
      <EvidenceDialog recordId={recordId} onClose={() => setRecordId(null)} />
    </>
  );
}

export function KnowledgePage() {
  const [query, setQuery] = useState("");
  const filtered = evidence.filter((item) =>
    `${item.id} ${item.title} ${item.source}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Knowledge"
        description="Trace every finding back to the records behind it."
      />
      <Card
        className={cn(
          "max-w-237.5 p-5.75",
          "[&_[data-slot=search-field]]:mt-5.5 [&_[data-slot=search-field]]:mx-0 [&_[data-slot=search-field]]:mb-4",
          "max-md:p-4.75",
        )}
      >
        <SectionHeading icon={Database} title="Sample source library">
          <Badge>{evidence.length} records</Badge>
        </SectionHeading>
        <p
          data-slot="section-description"
          className="text-description text-[12px] leading-[1.5]"
        >
          The complete synthetic evidence set for order #{investigation.id}.
          Expand a record to see its fields.
        </p>
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
            aria-label="Filter sample records"
            placeholder="Filter by source, record, or event…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div
          data-slot="knowledge-records"
          className={cn(
            "[&>details]:border-t [&>details]:border-t-[#ebe3f2]",
            "[&_summary]:flex [&_summary]:items-center [&_summary]:gap-3.25 [&_summary]:py-4 [&_summary]:px-0 [&_summary]:list-none",
            "[&_summary::-webkit-details-marker]:hidden",
            "[&_summary>span:nth-child(2)]:flex-1",
            "[&_strong]:block [&_strong]:text-[13px] [&_strong]:text-[#5c3f70]",
            "[&_small]:block [&_small]:text-record-meta [&_small]:text-[10px] [&_small]:mt-1.25",
            "[&_summary>svg:last-child]:text-support-muted",
            "[&_details[open]_summary>svg:last-child]:[transform:rotate(180deg)]",
            "[&_[data-slot=record-fields]]:pt-0 [&_[data-slot=record-fields]]:pr-3.75 [&_[data-slot=record-fields]]:pb-4 [&_[data-slot=record-fields]]:pl-11.75 [&_[data-slot=record-fields]]:m-0",
            "max-md:[&_[data-slot=badge]]:text-[8px]",
            "max-md:[&_strong]:text-[12px]",
            "max-md:[&_[data-slot=record-fields]]:pl-2.5",
            "max-sm:[&_summary]:gap-2",
            "max-sm:[&_summary>[data-slot=icon-tile]]:hidden",
            "max-sm:[&_strong]:text-[11px]",
            "max-sm:[&_[data-slot=badge]]:text-[7px] max-sm:[&_[data-slot=badge]]:py-1 max-sm:[&_[data-slot=badge]]:px-1.25",
            "max-sm:[&_small]:text-[9px]",
          )}
        >
          {filtered.map((record) => (
            <details key={record.id}>
              <summary>
                <IconTile icon={FileText} tone={record.tone} small />
                <span>
                  <strong>{record.title}</strong>
                  <small>{record.source}</small>
                </span>
                <Badge tone={record.tone}>{record.id}</Badge>
                <ChevronDown size={17} />
              </summary>
              <RecordFields record={record} />
            </details>
          ))}
          {!filtered.length && (
            <div
              className={cn(
                "py-10 px-5 text-center text-[#805f94]",
                "[&>svg]:mt-0 [&>svg]:mx-auto [&>svg]:mb-3.75",
                "[&_[data-slot=text-link]]:mt-3.75",
              )}
            >
              <Search size={30} />
              <h3 className="text-[16px] font-semibold text-[#755089]">
                No matching sample records
              </h3>
              <p className="text-[12px] mt-2 leading-[1.6]">
                Try “inventory”, “order”, or “Shopify”.
              </p>
              <Button
                variant="link"
                data-slot="text-link"
                onClick={() => setQuery("")}
              >
                Clear filter
              </Button>
            </div>
          )}
        </div>
      </Card>
      <p
        className={cn(
          "flex items-start gap-1.75 text-note text-[11px] leading-[1.6] mt-4.25",
          "[&_svg]:mt-0.5",
        )}
      >
        <ShieldCheck size={15} />
        Fictional records only. No real customer or business data is stored.
      </p>
    </>
  );
}

export function HistoryPage() {
  return (
    <>
      <PageHeader
        title="History"
        description="Revisit the questions, evidence, and insights in your demo workspace."
      />
      <Card asChild className={cn("p-5.75 max-w-237.5", "max-md:p-4.75")}>
        <section>
          <SectionHeading icon={History} title="Sample activity history">
            <Badge>Prepared snapshot</Badge>
          </SectionHeading>
          <div
            className={cn(
              "mt-5",
              "[&>a]:flex [&>a]:items-center [&>a]:gap-4.25 [&>a]:py-5 [&>a]:px-0 [&>a]:border-b [&>a]:border-b-[#eee5f4]",
              "[&>a>div]:flex-1",
              "[&_strong]:text-[14px] [&_strong]:font-semibold",
              "[&_p]:text-[12px] [&_p]:text-record-meta [&_p]:my-1.75 [&_p]:mx-0",
              "[&_small]:text-[10px] [&_small]:text-[#7a5e89]",
              "[&>a>svg]:text-[#795d8b]",
              "max-sm:[&_strong]:text-[12px]",
              "max-sm:[&_p]:text-[11px]",
              "max-sm:[&>a]:gap-2.75",
              "max-sm:[&_small]:text-[9px]",
            )}
          >
            {investigations.map((item) => (
              <Link key={item.id} href={item.href}>
                <IconTile icon={item.id === "4821" ? Search : Sparkles} small />
                <div>
                  <strong>{item.question}</strong>
                  <p>{item.result}</p>
                  <small>
                    {item.created} · {business.name}
                  </small>
                </div>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
          <div
            className={cn(
              "flex gap-2.5 text-support-muted text-[11px] leading-[1.8] mt-5.5 mx-1 mb-0",
              "[&>svg]:mt-0.5",
            )}
          >
            <FlaskConical size={17} />
            <p>
              This is a prepared activity history. Your demo activity is not
              recorded or sent anywhere.
            </p>
          </div>
        </section>
      </Card>
    </>
  );
}

export function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="A few details about the workspace you’re exploring."
      />
      <div
        className={cn(
          "grid grid-cols-[1fr_1fr] gap-5.5 max-w-262.5",
          "max-lg:grid-cols-[1fr]",
          "max-md:gap-3.75",
        )}
      >
        <Card
          asChild
          className={cn(
            "p-6",
            "[&>[data-slot=text-link]]:flex",
            "max-md:p-4.75",
          )}
        >
          <section>
            <SectionHeading icon={Monitor} title="Workspace" />
            <dl
              data-slot="record-fields"
              className={cn(
                "mt-3.75 mx-0 mb-0",
                "[&>div]:grid [&>div]:grid-cols-[1fr_1.4fr] [&>div]:gap-3.75 [&>div]:py-2.75 [&>div]:px-0 [&>div]:border-b [&>div]:border-b-[#eae3f0]",
                "[&_dt]:text-[11px] [&_dt]:capitalize [&_dt]:text-record-label [&_dt]:leading-[1.5]",
                "[&_dd]:m-0 [&_dd]:text-record-value [&_dd]:text-[11px] [&_dd]:leading-[1.6] [&_dd]:wrap-anywhere",
                "[&_ul]:list-none [&_ul]:m-0 [&_ul]:p-0",
                "[&_li+li]:mt-1.25",
                "[&>div:last-child]:border-0",
                "max-sm:[&>div]:grid-cols-[1fr_1.3fr] max-sm:[&>div]:gap-2.5",
              )}
            >
              <div>
                <dt>Business</dt>
                <dd>{business.name}</dd>
              </div>
              <div>
                <dt>Workspace type</dt>
                <dd>
                  <Badge>Fictional demo</Badge>
                </dd>
              </div>
              <div>
                <dt>Data snapshot</dt>
                <dd>{business.snapshot}</dd>
              </div>
              <div>
                <dt>Currency</dt>
                <dd>{business.currency}</dd>
              </div>
              <div>
                <dt>Appearance</dt>
                <dd>Light theme</dd>
              </div>
            </dl>
            <p
              className={cn(
                "flex items-start gap-1.75 text-note text-[11px] leading-[1.6] mt-4.25",
                "[&_svg]:mt-0.5",
              )}
            >
              This demo uses a fixed workspace and light appearance.
            </p>
          </section>
        </Card>
        <Card
          asChild
          className={cn(
            "p-6",
            "[&>[data-slot=text-link]]:flex",
            "max-md:p-4.75",
          )}
        >
          <section>
            <SectionHeading icon={LockKeyhole} title="Account & privacy" />
            <div className="pt-3 px-0 pb-5">
              <IconTile icon={ShieldCheck} tone="green" />
              <h3 className="mt-4 text-[17px] font-[650]">
                A safe place to explore
              </h3>
              <p className="text-[12px] leading-[1.8] text-[#896b9e] mt-2.5">
                No account is signed in. All records are bundled sample data;
                this app does not collect credentials or connect to external
                business services.
              </p>
            </div>
            <Button variant="outline" data-slot="secondary-button" disabled>
              Account settings coming later
            </Button>
            <Link
              href="/"
              data-slot="text-link"
              className={cn(buttonVariants({ variant: "link" }), "mt-5")}
            >
              Return to welcome <ArrowRight size={15} />
            </Link>
          </section>
        </Card>
      </div>
    </>
  );
}
