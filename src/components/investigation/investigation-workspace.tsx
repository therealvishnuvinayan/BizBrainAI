"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toneClasses } from "@/components/ui/tone-variants";
import { useState } from "react";
import {
  Search,
  Check,
  Bookmark,
  Share2,
  MoreHorizontal,
  Sparkles,
  Boxes,
  CalendarDays,
  Clock3,
  FileText,
  TriangleAlert,
  Package,
  Layers,
  ShoppingCart,
  Truck,
  BarChart3,
  Target,
  Zap,
  Settings,
  ArrowUpRight,
  Download,
  ChevronDown,
  FlaskConical,
} from "lucide-react";
import { PageHeader } from "@/components/layout/app-shell";
import {
  Badge,
  CompleteBadge,
  IconTile,
  Menu,
  MenuItem,
  Modal,
  SectionHeading,
} from "@/components/ui/primitives";
import { QuestionComposer } from "@/components/shared/question-composer";
import {
  EvidenceDialog,
  RecordFields,
} from "@/components/shared/evidence-dialog";
import {
  evidence,
  findings,
  investigation,
  recommendations,
  stages,
  toolActivity,
} from "@/data/investigation";

const eventIcons = [FileText, TriangleAlert, Package, CalendarDays];
const toolIcons = [ShoppingCart, Package, Truck];
const recommendationIcons = [Zap, Truck, Settings];

export function InvestigationWorkspace() {
  const [recordId, setRecordId] = useState<string | null>(null);
  const [recommendationId, setRecommendationId] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [notice, setNotice] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const recommendation = recommendations.find(
    (item) => item.id === recommendationId,
  );

  async function share() {
    const url = window.location.href;
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Investigation link copied to clipboard.");
    } catch {
      setShareOpen(true);
    }
  }

  function download() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            disclaimer:
              "Synthetic frontend demo. No live business data or AI execution.",
            investigation,
            findings,
            evidence,
            recommendations,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bizbrain-demo-investigation-${investigation.id}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Sample investigation exported as JSON.");
  }

  return (
    <>
      <PageHeader
        title="Investigation Workspace"
        description="Deep, AI-powered investigations that connect your business data, uncover root causes, and turn findings into action."
      />
      <Card
        asChild
        className={cn(
          "pt-4.25 px-5 pb-4.75 mb-4.25",
          "max-md:p-4",
          "max-sm:px-3.25",
        )}
      >
        <section>
          <div
            className={cn(
              "flex items-center gap-4 pb-4.25 border-b border-b-[#e8e2f2]",
              "[&>[data-slot=icon-tile]]:w-13.75 [&>[data-slot=icon-tile]]:h-13.75 [&>[data-slot=icon-tile]]:border [&>[data-slot=icon-tile]]:border-[#e4d8ff] [&>[data-slot=icon-tile]]:rounded-[13px]",
              "[&>[data-slot=icon-tile]>svg]:w-8 [&>[data-slot=icon-tile]>svg]:h-8",
              "max-xl:flex-wrap max-xl:gap-3",
              "max-md:gap-3",
              "max-md:[&>[data-slot=icon-tile]]:w-11 max-md:[&>[data-slot=icon-tile]]:h-11",
              "max-md:[&>[data-slot=icon-tile]>svg]:w-6.5 max-md:[&>[data-slot=icon-tile]>svg]:h-6.5",
              "max-sm:[&>[data-slot=icon-tile]]:hidden",
            )}
          >
            <IconTile icon={Search} />
            <div
              className={cn(
                "min-w-0",
                "[&_[data-slot=eyebrow]]:mb-1 [&_[data-slot=eyebrow]]:text-[10px]",
                "[&>p:last-child]:flex [&>p:last-child]:flex-wrap [&>p:last-child]:gap-1.75 [&>p:last-child]:text-[11px] [&>p:last-child]:text-[#5f5379] [&>p:last-child]:mt-1.25",
                "max-xl:[&>p:last-child]:text-[10px]",
                "max-xl:flex-1",
                "max-md:[&>p:last-child]:text-[10px] max-md:[&>p:last-child]:leading-[1.6] max-md:[&>p:last-child]:gap-y-1 max-md:[&>p:last-child]:gap-x-1.5",
                "max-sm:[&>p:last-child]:text-[10px]",
              )}
            >
              <p
                data-slot="eyebrow"
                className="text-eyebrow text-[10px] font-[650] tracking-[0.65px]"
              >
                INVESTIGATION
              </p>
              <h2 className="text-[23px] font-[740] tracking-[-0.7px] max-xl:text-[20px] max-md:text-[19px] max-sm:text-[20px]">
                {investigation.question}
              </h2>
              <p>
                Order #{investigation.id}
                <span>•</span>Created {investigation.created}
                <span>•</span>Customer: {investigation.customer}
              </p>
            </div>
            <div
              className={cn(
                "flex items-center gap-2.5 ml-auto",
                "[&>[data-slot=badge]]:text-[11px] [&>[data-slot=badge]]:py-2 [&>[data-slot=badge]]:px-2.75 [&>[data-slot=badge]]:mr-0.75",
                "[&_[data-slot=icon-button]]:w-9 [&_[data-slot=icon-button]]:h-9",
                "max-xl:basis-full max-xl:justify-end max-xl:-mt-0.5",
                "max-xl:[&>[data-slot=badge]]:mr-auto",
                "max-md:mt-1.25",
                "max-md:[&>[data-slot=badge]]:text-[10px]",
                "max-sm:gap-1.75",
                "max-sm:[&_[data-slot=icon-button]]:w-8 max-sm:[&_[data-slot=icon-button]]:h-8",
                "max-sm:[&>[data-slot=badge]]:py-1.75 max-sm:[&>[data-slot=badge]]:px-2 max-sm:[&>[data-slot=badge]]:text-[9px]",
              )}
            >
              <CompleteBadge>{investigation.status}</CompleteBadge>
              <Button
                variant="outline-icon"
                data-slot="icon-button"
                className={bookmarked ? "text-primary bg-[#eee6ff]!" : ""}
                aria-label={
                  bookmarked ? "Remove bookmark" : "Bookmark investigation"
                }
                aria-pressed={bookmarked}
                onClick={() => {
                  setBookmarked(!bookmarked);
                  setNotice(
                    bookmarked
                      ? "Bookmark removed."
                      : "Bookmarked for this visit.",
                  );
                }}
              >
                <Bookmark
                  size={20}
                  fill={bookmarked ? "currentColor" : "none"}
                />
              </Button>
              <Button
                variant="outline-icon"
                data-slot="icon-button"
                aria-label="Copy investigation link"
                onClick={share}
              >
                <Share2 size={19} />
              </Button>
              <Menu
                label="More investigation options"
                trigger={
                  <Button
                    variant="outline-icon"
                    data-slot="icon-button"
                    aria-label="More investigation options"
                  >
                    <MoreHorizontal size={21} />
                  </Button>
                }
              >
                <MenuItem onSelect={download}>
                  <Download size={16} />
                  Export sample records
                </MenuItem>
                <MenuItem onSelect={() => setRecordId("ORD-4821")}>
                  <FileText size={16} />
                  Inspect source order
                </MenuItem>
                <div className="text-[11px] text-support-muted leading-[1.7] py-2 px-2.5 max-w-75">
                  A prepared, fictional investigation.
                </div>
              </Menu>
            </div>
          </div>
          <ol
            className={cn(
              "grid grid-cols-4 pt-3.5 px-6 pb-0 m-0 list-none",
              "[&>li]:flex [&>li]:gap-3 [&>li]:items-start [&>li]:relative",
              "[&>li::after]:absolute [&>li::after]:content-[''] [&>li::after]:h-0.75 [&>li::after]:top-3 [&>li::after]:left-8 [&>li::after]:right-1 [&>li::after]:bg-(image:--background-image-stage-track) [&>li::after]:z-0",
              "[&>li:last-child::after]:hidden",
              "[&>li>div]:relative [&>li>div]:z-1",
              "[&_strong]:inline-block [&_strong]:text-[12px] [&_strong]:font-[650] [&_strong]:bg-[#fdfcff] [&_strong]:pt-1 [&_strong]:pr-1.5 [&_strong]:pb-1 [&_strong]:pl-0",
              "[&_p]:text-[10px] [&_p]:text-[#605374] [&_p]:mt-0.5 [&_p]:leading-[1.5] [&_p]:bg-[#fdfcff] [&_p]:pr-2",
              "max-xl:px-0.75",
              "max-xl:[&>li]:gap-2",
              "max-xl:[&_strong]:text-[11px]",
              "max-xl:[&_p]:text-[9px]",
              "max-md:grid-cols-[1fr_1fr] max-md:gap-y-5 max-md:gap-x-2.5 max-md:pt-5",
              "max-md:[&_strong]:text-[11px]",
              "max-md:[&_p]:text-[9px]",
              "max-md:[&>li:nth-child(2)::after]:hidden",
              "max-sm:gap-y-4.75 max-sm:gap-x-3",
              "max-sm:[&>li]:gap-2",
              "max-sm:[&_strong]:text-[10px] max-sm:[&_strong]:pt-1.25",
              "max-sm:[&_p]:text-[8px]",
            )}
          >
            {stages.map((stage, index) => (
              <li key={stage.name}>
                <span
                  className={cn(
                    "grid place-items-center shrink-0 w-6.5 h-6.5 text-white rounded-[50%] bg-(image:--background-image-stage-check) border border-[#a273fa] relative z-1 shadow-stage-check",
                    "max-sm:w-6 max-sm:h-6",
                    index === stages.length - 1
                      ? "[outline:2px_solid_#c7afff] outline-offset-[3px]"
                      : "",
                  )}
                >
                  <Check size={18} />
                </span>
                <div>
                  <strong>{stage.name}</strong>
                  <p>{stage.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Card>
      <div
        className={cn(
          "grid grid-cols-[1.92fr_1fr] gap-4 [align-items:start]",
          "max-xl:grid-cols-[1fr]",
        )}
      >
        <div className="grid gap-3.25 min-w-0">
          <Card
            asChild
            className={cn(
              "pt-3.75 px-4 pb-2.5",
              "[&_[data-slot=section-heading]]:mb-3",
              "max-md:px-3",
              "max-sm:[&_[data-slot=section-heading]_h2]:text-[18px]",
            )}
          >
            <section>
              <SectionHeading icon={Sparkles} title="Key Findings">
                <Badge>{findings.length} findings</Badge>
              </SectionHeading>
              <div>
                {findings.map((finding, index) => (
                  <article
                    className={cn(
                      "flex gap-3.5 pt-3 px-3.25 pb-2 rounded-[12px]",
                      "[&>[data-slot=icon-tile]]:w-10.5 [&>[data-slot=icon-tile]]:h-10.5 [&>[data-slot=icon-tile]]:mt-0.25",
                      "[&>div]:min-w-0 [&>div]:flex-1",
                      "[&_p]:text-[11px] [&_p]:leading-[1.55] [&_p]:text-[#5f5477] [&_p]:mt-1",
                      "2xl:[&_h3]:text-[15px]",
                      "2xl:[&_p]:text-[13px]",
                      "max-md:gap-2.75 max-md:px-2.5",
                      "max-md:[&>[data-slot=icon-tile]]:w-8.75 max-md:[&>[data-slot=icon-tile]]:h-8.75",
                      "max-md:[&>[data-slot=icon-tile]>svg]:w-5.5",
                      "max-md:[&_p]:text-[11px]",
                      "max-sm:gap-2.25 max-sm:px-2.25",
                      "max-sm:[&>[data-slot=icon-tile]]:w-7.5 max-sm:[&>[data-slot=icon-tile]]:h-7.5",
                      "max-sm:[&>[data-slot=icon-tile]>svg]:w-4.75",
                      "max-sm:[&_p]:text-[11px]",
                      index === 0
                        ? cn(
                            "bg-[#f4f0ff] border border-[#f1eaff] pt-2.75",
                            "[&>[data-slot=icon-tile]]:border [&>[data-slot=icon-tile]]:border-[#e1d1ff] [&>[data-slot=icon-tile]]:bg-transparent [&>[data-slot=icon-tile]]:bg-(image:--background-image-finding-icon)",
                          )
                        : "",
                    )}
                    key={finding.id}
                  >
                    <IconTile
                      icon={index === 0 ? Boxes : CalendarDays}
                      tone={index === 0 ? "purple" : "blue"}
                    />
                    <div>
                      <div
                        className={cn(
                          "flex items-center gap-2.5 justify-between",
                          "[&>[data-slot=badge]]:text-[9px]",
                          "max-md:items-start max-md:gap-1.75 max-md:flex-wrap",
                          "max-md:[&>[data-slot=badge]]:text-[8px] max-md:[&>[data-slot=badge]]:-order-1",
                        )}
                      >
                        <h3 className="text-[13px] font-bold leading-[1.45] tracking-[-0.2px] max-md:text-[13px] max-sm:text-[12px]">
                          {finding.title}
                        </h3>
                        <Badge tone={index === 0 ? "purple" : "blue"}>
                          {finding.kind}
                        </Badge>
                      </div>
                      <p>{finding.detail}</p>
                      <div
                        className={cn(
                          "flex flex-wrap gap-1.5 mt-1.75",
                          "max-sm:gap-1",
                        )}
                      >
                        {finding.evidenceIds.map((id) => (
                          <button
                            className={cn(
                              "inline-flex items-center gap-1 py-0.5 px-1.25 border border-border-lilac rounded-[4px] text-event-meta bg-surface-glass text-[8px] font-medium",
                              "hover:border-record-accent hover:text-citation hover:bg-white",
                              "max-md:text-[8px] max-md:py-1 max-md:px-1.5",
                              "max-sm:text-[7px] max-sm:py-1 max-sm:px-1.25",
                            )}
                            key={id}
                            onClick={() => setRecordId(id)}
                          >
                            {id}
                            <ArrowUpRight size={11} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </Card>
          <Card
            asChild
            className={cn(
              "pt-3.25 px-4.25 pb-3",
              "[&_[data-slot=section-heading]]:mb-0.75",
              "[&>[data-slot=section-description]]:pl-8.25 [&>[data-slot=section-description]]:text-[11px]",
              "max-sm:[&_[data-slot=section-heading]_h2]:text-[18px]",
              "max-sm:px-3",
              "max-sm:[&>[data-slot=section-description]]:pl-0 max-sm:[&>[data-slot=section-description]]:text-[10px] max-sm:[&>[data-slot=section-description]]:mt-1.5",
            )}
          >
            <section>
              <SectionHeading icon={Clock3} title="Evidence Timeline" />
              <p
                data-slot="section-description"
                className="text-description text-[12px] leading-[1.5]"
              >
                The sequence of events leading to the delay. Select an event to
                inspect its source.
              </p>
              <div
                className={cn(
                  "grid grid-cols-4 gap-2 relative [align-items:start] pt-8.25",
                  "[&::before]:content-[''] [&::before]:absolute [&::before]:left-[11%] [&::before]:right-[12%] [&::before]:top-4.5 [&::before]:h-0.75 [&::before]:bg-(image:--background-image-evidence-track)",
                  "max-md:grid-cols-[1fr_1fr] max-md:gap-y-7.5 max-md:gap-x-3",
                  "max-md:[&::before]:left-[23%] max-md:[&::before]:right-[23%]",
                  "max-sm:gap-y-7.5 max-sm:gap-x-2",
                )}
              >
                {evidence.map((record, index) => (
                  <details
                    data-slot="evidence-event"
                    data-tone={record.tone}
                    className={cn(
                      "relative rounded-[10px] text-[10px] min-w-0",
                      "[&_summary]:block [&_summary]:list-none [&_summary]:pt-2.25 [&_summary]:px-2.25 [&_summary]:pb-1.75",
                      "[&_summary::-webkit-details-marker]:hidden",
                      "[&[open]_[data-slot=evidence-expand]>svg]:[transform:rotate(180deg)]",
                      "max-md:[&:nth-child(n+3)]:mt-0.5",
                      "max-md:[&_summary]:p-2.75",
                      "max-sm:[&_summary]:py-2.5 max-sm:[&_summary]:px-2",
                      toneClasses[record.tone],
                    )}
                    key={record.id}
                  >
                    <summary>
                      <span className="absolute grid place-items-center -top-5.5 left-[calc(50%_-_9px)] w-4.25 h-4.25 border-[2px] border-current bg-white rounded-[50%] shadow-timeline-node">
                        {index === 0 && <Check size={12} />}
                      </span>
                      <span
                        className={cn(
                          "flex items-center gap-1.75",
                          "[&_[data-slot=icon-tile]]:w-6.75 [&_[data-slot=icon-tile]]:h-6.75 [&_[data-slot=icon-tile]]:bg-transparent",
                          "[&_strong]:block [&_strong]:text-[10px] [&_strong]:leading-[1.35] [&_strong]:font-[650] [&_strong]:text-[#29213c]",
                          "[&_small]:block [&_small]:text-[#6e5d7d] [&_small]:text-[8px] [&_small]:mt-0.75 [&_small]:whitespace-nowrap",
                          "2xl:[&_strong]:text-[12px]",
                          "max-md:[&_strong]:text-[11px]",
                          "max-md:[&_small]:text-[9px]",
                          "max-sm:gap-1.25",
                          "max-sm:[&_[data-slot=icon-tile]]:w-5.5 max-sm:[&_[data-slot=icon-tile]]:h-6.25",
                          "max-sm:[&_[data-slot=icon-tile]>svg]:w-4.5",
                          "max-sm:[&_strong]:text-[10px]",
                          "max-sm:[&_small]:text-[8px]",
                        )}
                      >
                        <IconTile
                          icon={eventIcons[index]}
                          tone={record.tone}
                          small
                        />
                        <span>
                          <strong>{record.title}</strong>
                          <small>{record.date}</small>
                        </span>
                      </span>
                      <span
                        className={cn(
                          "block text-[10px] leading-[1.5] text-[#594e6e] mt-2",
                          "2xl:text-[12px]",
                          "max-md:text-[11px]",
                          "max-sm:text-[10px]",
                        )}
                      >
                        {record.summary}
                      </span>
                      <span
                        data-slot="evidence-expand"
                        className={cn(
                          "flex items-center justify-between text-[8px] mt-2 opacity-85",
                          "max-md:text-[9px]",
                        )}
                      >
                        View source <ChevronDown size={12} />
                      </span>
                    </summary>
                    <div
                      className={cn(
                        "pt-0 px-2.25 pb-2.5",
                        "[&_[data-slot=record-fields]]:mt-2",
                        "[&_[data-slot=record-fields]>div]:block [&_[data-slot=record-fields]>div]:py-1.75 [&_[data-slot=record-fields]>div]:px-0",
                        "[&_[data-slot=record-fields]_dt]:text-[8px] [&_[data-slot=record-fields]_dt]:mb-0.75",
                        "[&_[data-slot=record-fields]_dd]:text-[9px]",
                        "[&_[data-slot=text-link]]:text-[9px] [&_[data-slot=text-link]]:mt-2.25",
                      )}
                    >
                      <Badge tone={record.tone}>{record.id}</Badge>
                      <RecordFields record={record} />
                      <Button
                        variant="link"
                        data-slot="text-link"
                        onClick={() => setRecordId(record.id)}
                      >
                        Open full record <ArrowUpRight size={13} />
                      </Button>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </Card>
          <Card
            asChild
            className={cn(
              "py-3 px-4",
              "[&_[data-slot=section-heading]]:mb-2.5",
              "max-sm:[&_[data-slot=section-heading]_h2]:text-[18px]",
              "max-sm:px-3",
              "max-sm:[&_[data-slot=subtle-label]]:text-[8px]",
            )}
          >
            <section>
              <SectionHeading icon={Target} title="Recommendations">
                <span
                  data-slot="subtle-label"
                  className="text-muted-foreground text-[10px]"
                >
                  Suggested next steps
                </span>
              </SectionHeading>
              <div
                className={cn(
                  "grid grid-cols-3 gap-2.25",
                  "max-md:grid-cols-[1fr] max-md:gap-2",
                )}
              >
                {recommendations.map((item, index) => {
                  const Icon = recommendationIcons[index];
                  return (
                    <button
                      key={item.id}
                      data-tone={item.tone}
                      className={cn(
                        "flex items-start gap-2 border-0 rounded-[10px] py-2.75 px-2.25 text-left",
                        "[&>svg:first-child]:w-5 [&>svg:first-child]:h-5 [&>svg:first-child]:mt-0.5",
                        "[&>svg:last-child]:hidden",
                        "[&_strong]:text-[10px] [&_strong]:font-[680] [&_strong]:text-[#302142] [&_strong]:block [&_strong]:leading-[1.4]",
                        "[&_small]:block [&_small]:text-[9px] [&_small]:leading-[1.5] [&_small]:text-[#665375] [&_small]:mt-0.75",
                        "hover:shadow-recommendation-hover hover:[filter:brightness(0.99)]",
                        "2xl:[&_strong]:text-[12px]",
                        "2xl:[&_small]:text-[11px]",
                        "max-md:gap-3 max-md:p-3.25 max-md:items-center",
                        "max-md:[&>span]:flex-1",
                        "max-md:[&>svg:last-child]:block",
                        "max-md:[&_strong]:text-[12px]",
                        "max-md:[&_small]:text-[11px]",
                        toneClasses[item.tone],
                      )}
                      onClick={() => setRecommendationId(item.id)}
                    >
                      <Icon size={23} />
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.summary}</small>
                      </span>
                      <ArrowUpRight size={13} />
                    </button>
                  );
                })}
              </div>
            </section>
          </Card>
        </div>
        <Card
          asChild
          className={cn(
            "pt-4 px-3.25 pb-3.25",
            "[&_[data-slot=section-heading]]:mt-0 [&_[data-slot=section-heading]]:mx-0.75 [&_[data-slot=section-heading]]:mb-1",
            "[&>[data-slot=section-description]]:text-[11px] [&>[data-slot=section-description]]:pl-0.75",
            "max-xl:mt-0",
            "max-sm:[&_[data-slot=section-heading]_h2]:text-[18px]",
          )}
        >
          <aside>
            <SectionHeading icon={Layers} title="Tool Activity">
              <Badge>Simulated</Badge>
            </SectionHeading>
            <p
              data-slot="section-description"
              className="text-description text-[12px] leading-[1.5]"
            >
              Sample tool results used in this investigation.
            </p>
            <div
              className={cn(
                "grid gap-1.75 mt-3.5",
                "max-xl:grid-cols-3",
                "max-lg:grid-cols-[1fr]",
                "max-md:grid-cols-[1fr]",
              )}
            >
              {toolActivity.map((tool, index) => (
                <button
                  key={tool.name}
                  className={cn(
                    "w-full border border-border-soft rounded-[11px] py-2.75 px-2.5 bg-[#fdfbff] flex items-start text-left gap-2.5 shadow-tool-item",
                    "hover:border-[#cabbdf] hover:bg-[#faf6ff]",
                    "[&>[data-slot=icon-tile]]:w-8.5 [&>[data-slot=icon-tile]]:h-9",
                    "[&>svg:last-child]:hidden",
                    "2xl:py-3.5",
                    "max-md:py-3.25 max-md:px-3",
                    "max-md:[&>svg:last-child]:block max-md:[&>svg:last-child]:mt-2.25",
                    "max-sm:[&>svg:last-child]:hidden",
                  )}
                  onClick={() => setRecordId(tool.evidenceId)}
                >
                  <IconTile icon={toolIcons[index]} tone={tool.tone} small />
                  <span className="flex-1 min-w-0">
                    <span
                      className={cn(
                        "flex items-center gap-1.25 justify-between flex-wrap",
                        "[&>[data-slot=badge]]:text-[8px] [&>[data-slot=badge]]:py-0.75 [&>[data-slot=badge]]:px-1.25",
                        "[&_[data-slot=badge]>svg]:w-2.5 [&_[data-slot=badge]>svg]:h-2.5",
                        "max-xl:gap-1.5",
                        "max-md:flex-nowrap",
                        "max-md:[&>[data-slot=badge]]:text-[9px]",
                        "max-sm:[&>[data-slot=badge]]:text-[8px]",
                      )}
                    >
                      <strong className="text-[10px] font-bold wrap-anywhere 2xl:text-[12px] max-md:text-[12px] max-sm:text-[11px]">
                        {tool.name}
                      </strong>
                      <CompleteBadge />
                    </span>
                    <span
                      className={cn(
                        "block mt-1.5 text-[#645576] text-[10px] leading-[1.55]",
                        "2xl:text-[12px]",
                        "max-md:text-[11px]",
                      )}
                    >
                      {tool.description}
                    </span>
                    <span
                      className={cn(
                        "flex gap-2.5 justify-between text-[8px] text-[#766183] mt-1.75 flex-wrap",
                        "max-xl:text-[8px]",
                        "max-md:text-[9px]",
                      )}
                    >
                      {investigation.investigated}
                      <span>{tool.durationMs} ms · sample</span>
                    </span>
                  </span>
                  <ChevronDown size={13} />
                </button>
              ))}
            </div>
            <p
              className={cn(
                "flex items-start gap-1.5 text-[9px] leading-[1.5] text-[#897595] py-3.25 px-1.25",
                "max-xl:pb-2",
              )}
            >
              <FlaskConical size={14} />
              Static activity log. No tools or AI models were executed.
            </p>
            <div
              className={cn(
                "mt-1 border-t border-t-[#ece5f2] pt-3.75",
                "[&>h3>svg]:text-[#8b40f9]",
                "[&>div]:grid [&>div]:grid-cols-4 [&>div]:bg-[#f5f1ff] [&>div]:rounded-[11px] [&>div]:py-3.25 [&>div]:px-0.75",
                "[&>div>div]:flex [&>div>div]:flex-col [&>div>div]:gap-1.5 [&>div>div]:items-center [&>div>div]:border-r [&>div>div]:border-r-[#ded4ec]",
                "[&>div>div:last-child]:border-0",
                "[&_strong]:text-[20px] [&_strong]:font-bold [&_strong]:leading-[1]",
                "[&_span]:text-[8px] [&_span]:text-[#5f5074] [&_span]:text-center [&_span]:leading-[1.4]",
                "max-xl:[&>div]:max-w-125 max-xl:[&>div]:flex-1",
                "max-xl:flex max-xl:gap-6 max-xl:items-center",
                "max-md:block",
                "max-md:[&>div]:max-w-none max-md:[&>div]:py-3.75",
                "max-md:[&_span]:text-[9px]",
              )}
            >
              <h3 className="flex items-center gap-2 text-[13px] font-[650] mt-0 mx-0.75 mb-3 max-xl:m-0 max-md:mb-3">
                <BarChart3 size={21} />
                Data summary
              </h3>
              <div>
                {[
                  { value: investigation.itemCount, label: "Order items" },
                  {
                    value: investigation.allocationFailures,
                    label: "Allocation failure",
                  },
                  { value: investigation.onHand, label: "On-hand (ST-200)" },
                  { value: investigation.backordered, label: "Backordered" },
                ].map((item) => (
                  <div key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </Card>
      </div>
      <QuestionComposer followUp />
      <div
        className={cn(
          "[&:not(:empty)]:fixed [&:not(:empty)]:bottom-6 [&:not(:empty)]:left-1/2 [&:not(:empty)]:[transform:translateX(-50%)] [&:not(:empty)]:z-35 [&:not(:empty)]:flex [&:not(:empty)]:items-center [&:not(:empty)]:gap-2.25 [&:not(:empty)]:py-3 [&:not(:empty)]:px-3.75 [&:not(:empty)]:bg-[#252037] [&:not(:empty)]:text-white [&:not(:empty)]:shadow-toast [&:not(:empty)]:rounded-[11px] [&:not(:empty)]:text-[12px] [&:not(:empty)]:max-w-[calc(100vw_-_30px)]",
          "[&>button]:bg-transparent [&>button]:border-0 [&>button]:text-[#dcd1ed] [&>button]:text-[18px] [&>button]:py-0 [&>button]:px-0.75",
        )}
        role="status"
        aria-live="polite"
      >
        {notice && (
          <>
            <Check size={14} />
            {notice}
            <button
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              ×
            </button>
          </>
        )}
      </div>
      <EvidenceDialog recordId={recordId} onClose={() => setRecordId(null)} />
      <Modal
        open={Boolean(recommendation)}
        onOpenChange={(open) => {
          if (!open) setRecommendationId(null);
        }}
        title={recommendation?.title ?? "Recommendation"}
        description="A suggested next step based on sample records. No action has been taken."
      >
        {recommendation && (
          <>
            <p
              className={cn(
                "text-content-muted text-[13px]",
                "max-sm:text-[12px]",
              )}
            >
              {recommendation.detail}
            </p>
            <div
              className={cn("flex flex-wrap gap-1.5 mt-1.75", "max-sm:gap-1")}
            >
              <button
                className={cn(
                  "inline-flex items-center gap-1 py-0.5 px-1.25 border border-border-lilac rounded-[4px] text-event-meta bg-surface-glass text-[8px] font-medium",
                  "hover:border-record-accent hover:text-citation hover:bg-white",
                  "max-md:text-[8px] max-md:py-1 max-md:px-1.5",
                  "max-sm:text-[7px] max-sm:py-1 max-sm:px-1.25",
                )}
                onClick={() => setRecordId(recommendation.evidenceId)}
              >
                {recommendation.evidenceId}
                <ArrowUpRight size={12} />
              </button>
            </div>
            <p
              className={cn(
                "flex items-start gap-1.75 text-note text-[11px] leading-[1.6] mt-4.25",
                "[&_svg]:mt-0.5",
              )}
            >
              <FlaskConical size={15} />
              Actions and outbound messages are unavailable in this frontend
              demo.
            </p>
            <Button variant="outline" data-slot="secondary-button" disabled>
              Action execution coming later
            </Button>
          </>
        )}
      </Modal>
      <Modal
        open={shareOpen}
        onOpenChange={setShareOpen}
        title="Share this sample investigation"
        description="Copy the URL below. Localhost links only work on your machine."
      >
        <input
          className="w-full p-3 text-[#6e5082] border border-[#e2d6eb] rounded-[9px] text-[12px]"
          aria-label="Investigation URL"
          value={shareUrl}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
        />
      </Modal>
    </>
  );
}
