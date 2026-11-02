"use client";

import { cn } from "@/lib/utils";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Send, Sparkles, FlaskConical } from "lucide-react";
import { Modal } from "@/components/ui/primitives";
import { EvidenceDialog } from "@/components/shared/evidence-dialog";
import { overviewFindings, inventoryItems, business } from "@/data/business";
import { followUpAnswers, investigation } from "@/data/investigation";

const supportedQuestions = [
  investigation.question,
  "Why did revenue increase last week?",
  "Which SKUs are at inventory risk?",
];
type Answer = {
  title: string;
  body: string;
  evidenceIds?: readonly string[];
  source?: string;
};

function normalizeQuestion(question: string) {
  return question
    .trim()
    .toLowerCase()
    .replace(/[?#.,!]/g, "")
    .replace(/\s+/g, " ");
}

export function QuestionComposer({ followUp = false }: { followUp?: boolean }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const router = useRouter();
  const suggestions = followUp
    ? followUpAnswers.map((item) => item.label)
    : supportedQuestions;

  function ask(value: string) {
    const normalized = normalizeQuestion(value);
    if (!normalized) return;
    setQuestion("");
    if (
      [
        normalizeQuestion(investigation.question),
        "why is order 4821 late",
        "order 4821",
        "4821",
      ].includes(normalized)
    ) {
      setAnswer(null);
      router.push("/demo/investigations/4821");
      return;
    }
    const followUpAnswer = followUpAnswers.find(
      (item) => normalizeQuestion(item.label) === normalized,
    );
    if (followUpAnswer) {
      setAnswer({
        title: followUpAnswer.label,
        body: followUpAnswer.answer,
        evidenceIds: followUpAnswer.evidenceIds,
      });
    } else if (
      normalizeQuestion(supportedQuestions[1]) === normalized ||
      normalized === "why did revenue increase"
    ) {
      setAnswer({
        title: supportedQuestions[1],
        body: `${overviewFindings[0].title} ${overviewFindings[0].detail}`,
        source: overviewFindings[0].source,
      });
    } else if (
      normalizeQuestion(supportedQuestions[2]) === normalized ||
      normalized === "inventory risk"
    ) {
      setAnswer({
        title: supportedQuestions[2],
        body: `The highest-risk sample items are ${inventoryItems.map((item) => `${item.name} (${item.sku}): ${item.status.toLowerCase()}`).join("; ")}. These are the ${business.highRiskSkus} most urgent of ${business.atRiskSkus} at-risk SKUs.`,
        evidenceIds: ["INV-ST200"],
      });
    } else {
      setAnswer({
        title: "This question is outside the demo",
        body: "This workspace has a small set of prepared investigations. It does not run an AI model or query live business data. Try one of the sample questions below.",
      });
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    ask(question);
  }

  return (
    <div
      className={cn(
        "relative mb-4.25",
        "max-md:mb-4.5",
        followUp
          ? cn(
              "mt-4.25 mb-0",
              "[&_[data-slot=question-composer]]:h-12.25",
              "max-md:mt-4.25",
            )
          : "",
      )}
    >
      <form
        data-slot="question-composer"
        className={cn(
          "flex items-center gap-4.25 h-12.75 border-[1.2px] border-[#a57aff] rounded-[14px] bg-[#ffffffda] shadow-question-composer pt-1.5 pr-2 pb-1.5 pl-4.75 [transition:box-shadow_0.2s]",
          "focus-within:shadow-composer-focus",
          "[&_input]:min-w-0 [&_input]:w-full [&_input]:outline-none [&_input]:border-0 [&_input]:bg-transparent [&_input]:text-[14px] [&_input]:text-[#453c61]",
          "[&_input:focus-visible]:outline-none",
          "max-md:h-12.25 max-md:rounded-[12px] max-md:pl-3.25 max-md:gap-2.5",
          "max-md:[&_input]:text-[12px]",
        )}
        onSubmit={submit}
      >
        <Sparkles
          className={cn("text-[#8046ff]", "max-md:w-5.25")}
          size={25}
          fill="currentColor"
          strokeWidth={1}
          aria-hidden="true"
        />
        <label
          className="sr-only"
          htmlFor={followUp ? "follow-up" : "business-question"}
        >
          {followUp ? "Ask a follow-up question" : "Ask a business question"}
        </label>
        <input
          id={followUp ? "follow-up" : "business-question"}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={
            followUp
              ? "Ask a follow-up question, explore a related issue, or request an action…"
              : "Ask BizBrain why revenue changed, why orders are delayed, or what needs attention…"
          }
          autoComplete="off"
          maxLength={500}
        />
        <button
          className={cn(
            "w-11 h-8.5 grid place-items-center bg-(image:--background-image-send-button) border border-[#c19bff] rounded-[9px] shadow-send-button text-white shrink-0",
            "hover:enabled:bg-[#7c39f2] hover:enabled:bg-none",
            "disabled:opacity-68",
            "max-md:w-9.25 max-md:h-8.25",
          )}
          type="submit"
          disabled={!question.trim()}
          aria-label="Ask question"
        >
          <Send size={19} />
        </button>
      </form>
      <div
        className={cn(
          "flex items-center gap-3 pt-2 px-0.5 pb-0 flex-wrap",
          "[&>span]:text-[9px] [&>span]:text-[#736580]",
          "[&>button]:bg-transparent [&>button]:border-0 [&>button]:p-0 [&>button]:flex [&>button]:gap-0.75 [&>button]:items-center [&>button]:text-[9px] [&>button]:text-[#776291]",
          "[&>button:hover]:text-[#672ce8] [&>button:hover]:underline",
          "max-md:gap-y-1.75 max-md:gap-x-2.75 max-md:pt-2.25",
          "max-md:[&>span]:hidden",
          "max-md:[&>button]:text-[9px]",
        )}
      >
        <span>Try asking</span>
        {suggestions.map((item) => (
          <button key={item} onClick={() => ask(item)}>
            {item}
            <ArrowUpRight size={11} />
          </button>
        ))}
      </div>
      <Modal
        open={Boolean(answer)}
        onOpenChange={(open) => {
          if (!open) setAnswer(null);
        }}
        title={answer?.title ?? "Sample answer"}
        description="Prepared demo response · no AI model is running"
      >
        <p
          className={cn("text-content-muted text-[13px]", "max-sm:text-[12px]")}
        >
          {answer?.body}
        </p>
        {answer?.source && (
          <p className="text-[#796087] text-[10px] p-3 mt-3.5 bg-[#f5f0fa] rounded-[7px]">
            Source: {answer.source}
          </p>
        )}
        {answer?.evidenceIds && (
          <div className={cn("flex flex-wrap gap-1.5 mt-1.75", "max-sm:gap-1")}>
            {answer.evidenceIds.map((id) => (
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
                <ArrowUpRight size={12} />
              </button>
            ))}
          </div>
        )}
        <div
          className={cn(
            "mt-6.25 border-t border-t-[#ece2f4] pt-4.75",
            "[&>[data-slot=eyebrow]]:mb-2.5",
            "[&>button]:flex [&>button]:w-full [&>button]:justify-between [&>button]:gap-3 [&>button]:items-center [&>button]:bg-[#f6f0fd] [&>button]:border-0 [&>button]:text-[#714a93] [&>button]:p-3 [&>button]:rounded-[8px] [&>button]:text-[11px] [&>button]:text-left [&>button]:mt-1.75",
            "[&>button:hover]:bg-[#eee3fc]",
          )}
        >
          <p
            data-slot="eyebrow"
            className="text-eyebrow text-[10px] font-[650] tracking-[0.65px]"
          >
            Explore a sample question
          </p>
          {[
            ...supportedQuestions,
            ...(followUp ? followUpAnswers.map((item) => item.label) : []),
          ].map((item) => (
            <button key={item} onClick={() => ask(item)}>
              {item}
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
        <p
          className={cn(
            "flex items-start gap-1.75 text-note text-[11px] leading-[1.6] mt-4.25",
            "[&_svg]:mt-0.5",
          )}
        >
          <FlaskConical size={14} />
          All responses use local, fictional business records.
        </p>
      </Modal>
      <EvidenceDialog recordId={recordId} onClose={() => setRecordId(null)} />
    </div>
  );
}
