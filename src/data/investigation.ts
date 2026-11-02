import type { EvidenceRecord, Finding, ToolActivity } from "@/types";

export const investigation = {
  id: "4821",
  question: "Why is order #4821 delayed?",
  customer: "Ridgeway Outdoors",
  created: "Nov 17, 2026",
  investigated: "Nov 24, 2026 · 10:24 AM",
  status: "Investigation complete",
  itemCount: 4,
  allocationFailures: 1,
  onHand: 0,
  backordered: 12,
  sku: "ST-200",
  product: "Summit 2P Tent",
  incomingDate: "Nov 25",
  proposedDispatch: "Nov 26",
  daysOverdue: 2,
} as const;

export const stages = [
  { name: "Understand", description: "Clarify the question & scope" },
  { name: "Gather evidence", description: "Collect sample source records" },
  { name: "Analyze", description: "Find patterns & root cause" },
  { name: "Synthesize", description: "Summarize findings & next steps" },
] as const;

export const evidence: EvidenceRecord[] = [
  {
    id: "ORD-4821",
    title: "Order created",
    date: "Nov 17, 10:24 AM",
    summary:
      "Order #4821 created with 4 items, including ST-200 (Summit 2P Tent).",
    source: "Shopify · sample order",
    tone: "green",
    fields: {
      order_id: "4821",
      customer: investigation.customer,
      created_at: "2026-11-17T10:24:00Z",
      line_items: [
        "ST-200 · Summit 2P Tent × 1",
        "SP-110 · Trail Rest Sleeping Pad × 1",
        "CS-310 · Alpine Camp Stove × 1",
        "WB-100 · Trail Water Bottle × 1",
      ],
      status: "unfulfilled",
      promised_dispatch: "2026-11-22",
      partial_shipments: "not permitted",
    },
  },
  {
    id: "ALLOC-882",
    title: "Allocation failed",
    date: "Nov 18, 9:17 AM",
    summary: "System failed to allocate ST-200 due to insufficient stock.",
    source: "NetSuite · sample allocation",
    tone: "amber",
    fields: {
      allocation_id: "ALLOC-882",
      order_id: "4821",
      sku: "ST-200",
      requested_quantity: 1,
      allocated_quantity: 0,
      reason: "INSUFFICIENT_STOCK",
      occurred_at: "2026-11-18T09:17:00Z",
    },
  },
  {
    id: "INV-ST200",
    title: "Stock unavailable",
    date: "Nov 18, 9:17 AM",
    summary:
      "Inventory check: ST-200 on-hand = 0, available = 0, backordered = 12.",
    source: "NetSuite · sample inventory",
    tone: "purple",
    fields: {
      sku: "ST-200",
      product: investigation.product,
      on_hand: 0,
      available: 0,
      backordered: 12,
      incoming_quantity: 12,
      purchase_order: "PO-1092",
      expected_arrival: "2026-11-25",
      checked_at: "2026-11-18T09:17:00Z",
    },
  },
  {
    id: "FUL-4821",
    title: "Dispatch promise missed",
    date: "Nov 22, 11:59 PM",
    summary:
      "The promised dispatch date passed with the order still unfulfilled.",
    source: "ShipStation · sample fulfillment",
    tone: "rose",
    fields: {
      order_id: "4821",
      promised_dispatch: "2026-11-22",
      shipment_created: "false",
      fulfillment_status: "awaiting_stock",
      checked_at: "2026-11-24T10:24:00Z",
      days_overdue: investigation.daysOverdue,
    },
  },
];

export const findings: Finding[] = [
  {
    id: "root",
    title:
      "Order #4821 is delayed because one required item could not be allocated due to insufficient stock.",
    detail:
      "The item “Summit 2P Tent” (SKU: ST-200) was out of stock at allocation. The order does not allow partial shipments, blocking the entire dispatch.",
    kind: "Root cause",
    evidenceIds: ["ORD-4821", "ALLOC-882", "INV-ST200"],
  },
  {
    id: "impact",
    title: `The promised dispatch date was missed and the order is now ${investigation.daysOverdue} days overdue.`,
    detail:
      "Dispatch was promised for Nov 22. As of Nov 24, no shipment has been created because the stock issue is unresolved.",
    kind: "Impact",
    evidenceIds: ["FUL-4821"],
  },
];

export const toolActivity: ToolActivity[] = [
  {
    name: "orders.get_order",
    description:
      "Retrieved sample order #4821 details (4 items, status, promised dates).",
    durationMs: 412,
    tone: "blue",
    evidenceId: "ORD-4821",
  },
  {
    name: "inventory.get_item_history",
    description:
      "Read sample inventory history for ST-200 (allocation, stock, backorders).",
    durationMs: 689,
    tone: "green",
    evidenceId: "INV-ST200",
  },
  {
    name: "fulfillment.get_events",
    description:
      "Read sample fulfillment events and dispatch status for order #4821.",
    durationMs: 377,
    tone: "purple",
    evidenceId: "FUL-4821",
  },
];

export const recommendations = [
  {
    id: "stock",
    title: "Allocate incoming supply",
    summary: "Prioritize this order from 12 units expected Nov 25.",
    detail:
      "Review PO-1092 with the supplier. Once the 12 incoming units are received on Nov 25, prioritize one ST-200 for order #4821. All 12 units already have backorders, so stock is not yet guaranteed.",
    evidenceId: "INV-ST200",
    tone: "purple",
  },
  {
    id: "customer",
    title: "Update the customer",
    summary: "Propose a new dispatch date of Nov 26.",
    detail:
      "Suggested message: Hi Ridgeway Outdoors, your order #4821 is waiting for the Summit 2P Tent. We expect replenishment on Nov 25 and propose dispatch on Nov 26, subject to receipt. We’re sorry for the delay and will confirm once your order ships.",
    evidenceId: "FUL-4821",
    tone: "blue",
  },
  {
    id: "prevent",
    title: "Prevent future delays",
    summary: "Review a low-stock alert at 5 units and reorder rules.",
    detail:
      "Suggested policy: flag ST-200 when available stock falls to 5 units. Review lead times and backorder demand before defining a reorder point. This demo does not create alerts or change inventory settings.",
    evidenceId: "INV-ST200",
    tone: "green",
  },
] as const;

export const followUpAnswers = [
  {
    id: "stock",
    label: "When will stock arrive?",
    answer:
      "The sample purchase order PO-1092 expects 12 units of ST-200 on Nov 25. They are already backordered; receipt and allocation still need confirmation. A Nov 26 dispatch is a recommendation, not a confirmed promise.",
    evidenceIds: ["INV-ST200"],
  },
  {
    id: "customer",
    label: "What should we tell the customer?",
    answer: recommendations[1].detail,
    evidenceIds: ["FUL-4821", "INV-ST200"],
  },
] as const;
