"use client";

import { cn } from "@/lib/utils";
import { Database, FlaskConical } from "lucide-react";
import { evidence } from "@/data/investigation";
import { Badge, Modal } from "@/components/ui/primitives";
import type { EvidenceRecord } from "@/types";

export function RecordFields({ record }: { record: EvidenceRecord }) {
  return (
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
      {Object.entries(record.fields).map(([key, value]) => (
        <div key={key}>
          <dt>{key.replaceAll("_", " ")}</dt>
          <dd>
            {Array.isArray(value) ? (
              <ul>
                {value.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              String(value)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function EvidenceDialog({
  recordId,
  onClose,
}: {
  recordId: string | null;
  onClose: () => void;
}) {
  const record = evidence.find((item) => item.id === recordId);
  return (
    <Modal
      open={Boolean(record)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={record?.title ?? "Source record"}
      description="A synthetic source record from the fictional demo workspace."
    >
      {record && (
        <>
          <div
            className={cn(
              "flex items-center gap-2 text-[#694781] text-[11px] p-3 bg-[#f3ecfc] rounded-[9px]",
              "[&>[data-slot=badge]]:ml-auto",
              "max-sm:text-[10px] max-sm:flex-wrap",
              "max-sm:[&>[data-slot=badge]]:ml-0",
            )}
          >
            <Database size={17} />
            <span>{record.source}</span>
            <Badge>{record.id}</Badge>
          </div>
          <RecordFields record={record} />
          <p
            className={cn(
              "flex items-start gap-1.75 text-note text-[11px] leading-[1.6] mt-4.25",
              "[&_svg]:mt-0.5",
            )}
          >
            <FlaskConical size={15} />
            Local sample data. No external service was called.
          </p>
        </>
      )}
    </Modal>
  );
}
