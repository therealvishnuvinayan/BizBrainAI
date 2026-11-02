import type { Connection, TrendPoint } from "@/types";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  percentageChange,
} from "@/lib/format";

export const business = {
  name: "Northstar Outfitters",
  description: "Outdoor essentials for the everyday explorer",
  initials: "NO",
  snapshot: "Nov 24, 2026",
  currency: "USD",
  revenue: 428310,
  previousRevenue: 398842,
  orders: 12946,
  previousOrders: 12219,
  fulfilled: 12480,
  previousFulfilled: 11632,
  atRiskSkus: 24,
  totalSkus: 353,
  previousInventoryRisk: 8.9,
  highRiskSkus: 3,
  delayTarget: 2.5,
  previousLeadTime: 4.8,
  currentLeadTime: 7.1,
  campingGrowth: 18,
  hikingGrowth: 11,
  additionalCategoryOrders: 727,
} as const;

export const metrics = {
  revenueGrowth: percentageChange(business.revenue, business.previousRevenue),
  orderGrowth: percentageChange(business.orders, business.previousOrders),
  fulfillmentGrowth: percentageChange(
    business.fulfilled,
    business.previousFulfilled,
  ),
  inventoryRisk: (business.atRiskSkus / business.totalSkus) * 100,
  fulfillmentRate: (business.fulfilled / business.orders) * 100,
  previousFulfillmentRate:
    (business.previousFulfilled / business.previousOrders) * 100,
  delayRate: ((business.orders - business.fulfilled) / business.orders) * 100,
};

// Weekly snapshots; the last two points also power the KPI comparisons.
export const weeklyTrend: TrendPoint[] = [
  { date: "Oct 6", revenue: 361480, orders: 11220, fulfilled: 10850 },
  { date: "Oct 13", revenue: 378620, orders: 11690, fulfilled: 11290 },
  { date: "Oct 20", revenue: 357940, orders: 11510, fulfilled: 11160 },
  { date: "Oct 27", revenue: 379160, orders: 11980, fulfilled: 11580 },
  { date: "Nov 3", revenue: 402750, orders: 11820, fulfilled: 11420 },
  { date: "Nov 10", revenue: 396420, orders: 12110, fulfilled: 11680 },
  {
    date: "Nov 17",
    revenue: business.previousRevenue,
    orders: business.previousOrders,
    fulfilled: business.previousFulfilled,
  },
  {
    date: "Nov 24",
    revenue: business.revenue,
    orders: business.orders,
    fulfilled: business.fulfilled,
  },
];

export const kpis = [
  {
    id: "revenue",
    label: "Revenue",
    value: formatCurrency(business.revenue),
    change: `+${formatPercent(metrics.revenueGrowth)}`,
    comparison: `vs. ${formatCurrency(business.previousRevenue)} last week`,
    tone: "purple",
    direction: "up",
  },
  {
    id: "orders",
    label: "Orders",
    value: formatNumber(business.orders),
    change: `+${formatPercent(metrics.orderGrowth)}`,
    comparison: `vs. ${formatNumber(business.previousOrders)} last week`,
    tone: "blue",
    direction: "up",
  },
  {
    id: "inventory",
    label: "Inventory Risk",
    value: formatPercent(metrics.inventoryRisk),
    change: `−${(business.previousInventoryRisk - metrics.inventoryRisk).toFixed(1)} pp`,
    comparison: `of SKUs at risk (vs. ${formatPercent(business.previousInventoryRisk)})`,
    tone: "amber",
    direction: "down",
  },
  {
    id: "fulfillment",
    label: "Fulfillment SLA",
    value: formatPercent(metrics.fulfillmentRate),
    change: `+${(metrics.fulfillmentRate - metrics.previousFulfillmentRate).toFixed(1)} pp`,
    comparison: `within SLA (vs. ${formatPercent(metrics.previousFulfillmentRate)})`,
    tone: "green",
    direction: "up",
  },
] as const;

export const overviewFindings = [
  {
    id: "revenue",
    tone: "green",
    title: `Revenue increased ${formatPercent(metrics.revenueGrowth)} (+${formatCurrency(business.revenue - business.previousRevenue)}), driven by higher demand in Camping (+${business.campingGrowth}%) and Hiking (+${business.hikingGrowth}%).`,
    detail: `Evidence: ${formatNumber(business.additionalCategoryOrders)} more orders in these categories vs. the previous week.`,
    source: "SALES-W48 · Weekly category sales sample",
  },
  {
    id: "delays",
    tone: "purple",
    title: `Order delays remain above target at ${formatPercent(metrics.delayRate)}, with longer supplier lead times on ${business.highRiskSkus} SKUs.`,
    detail: `Evidence: Average supplier lead time increased from ${business.previousLeadTime} to ${business.currentLeadTime} days for tents, sleeping pads, and camp stoves.`,
    source: "SUP-W48 · Supplier lead-time sample",
  },
] as const;

export const investigations = [
  {
    id: "4821",
    question: "Why is order #4821 delayed?",
    created: "Nov 24, 10:24 AM",
    result: "Insufficient stock · ST-200",
    status: "Completed",
    href: "/demo/investigations/4821",
  },
  {
    id: "sales",
    question: "Why did revenue increase last week?",
    created: "Nov 24, 9:17 AM",
    result: `+${formatPercent(metrics.revenueGrowth)} from category demand`,
    status: "Sample summary",
    href: "/demo/overview#ai-findings",
  },
  {
    id: "inventory",
    question: "Which SKUs are at inventory risk?",
    created: "Nov 23, 4:02 PM",
    result: `${business.atRiskSkus} SKUs (${formatPercent(metrics.inventoryRisk)} of catalog)`,
    status: "Sample summary",
    href: "/demo/overview#operational-alerts",
  },
] as const;

export const connections: Connection[] = [
  {
    id: "shopify",
    name: "Shopify",
    category: "Commerce",
    description:
      "Sample orders, line items, and customer records for the fictional Northstar store.",
    records: business.orders,
    color: "#689b25",
    initials: "S",
  },
  {
    id: "netsuite",
    name: "NetSuite",
    category: "Inventory & ERP",
    description:
      "Sample stock levels, allocation attempts, and incoming purchase orders.",
    records: business.totalSkus,
    color: "#27658c",
    initials: "N",
  },
  {
    id: "shipstation",
    name: "ShipStation",
    category: "Fulfillment",
    description:
      "Sample dispatch promises, shipment events, and fulfillment statuses.",
    records: business.fulfilled,
    color: "#4e973e",
    initials: "S",
  },
  {
    id: "analytics",
    name: "Google Analytics",
    category: "Web analytics",
    description:
      "Sample weekly category demand and traffic trends. No analytics tracking is installed.",
    records: weeklyTrend.length,
    color: "#d18a00",
    initials: "G",
  },
];

export const inventoryItems = [
  {
    sku: "ST-200",
    name: "Summit 2P Tent",
    onHand: 0,
    incoming: 12,
    available: "Nov 25",
    status: "Out of stock",
  },
  {
    sku: "SP-110",
    name: "Trail Rest Sleeping Pad",
    onHand: 8,
    incoming: 30,
    available: "Nov 27",
    status: "5 days of stock",
  },
  {
    sku: "CS-310",
    name: "Alpine Camp Stove",
    onHand: 6,
    incoming: 24,
    available: "Nov 29",
    status: "7 days of stock",
  },
] as const;

export const alerts = [
  {
    id: "inventory",
    title: `${business.highRiskSkus} SKUs at high inventory risk`,
    description: "One out of stock; two may run out in 5–7 days.",
    tone: "amber",
  },
  {
    id: "delays",
    title: "Order delay rate above target",
    description: `${formatPercent(metrics.delayRate)} (target ≤ ${formatPercent(business.delayTarget)}).`,
    tone: "purple",
  },
] as const;
