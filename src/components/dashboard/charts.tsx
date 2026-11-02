"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, SectionHeading } from "@/components/ui/primitives";
import { business, metrics, weeklyTrend } from "@/data/business";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

function PeriodSelect({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <select
      className={cn(
        "text-[#423751] border border-[#ded9eb] rounded-[7px] py-1.25 px-1.5 text-[9px] bg-white min-w-24 h-7",
        "max-lg:min-w-22.5",
      )}
      aria-label={label}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      <option value={8}>Last 8 weeks</option>
      <option value={4}>Last 4 weeks</option>
    </select>
  );
}

const tooltipStyle = {
  border: "1px solid #e5dff5",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 8px 24px #30245a14",
};

export function RevenueChart() {
  const [period, setPeriod] = useState(8);
  return (
    <Card
      asChild
      className={cn(
        "pt-4 px-3.75 pb-2.5 relative",
        "[&_[data-slot=section-heading]]:mb-2.25",
        "[&_[data-slot=section-heading]_h2]:text-[16px] [&_[data-slot=section-heading]_h2]:whitespace-nowrap",
        "max-lg:px-3.25",
        "max-lg:[&_[data-slot=section-heading]]:gap-1.25 max-lg:[&_[data-slot=section-heading]]:flex-wrap",
        "max-lg:[&_[data-slot=section-heading]_h2]:text-[15px]",
        "max-md:[&_[data-slot=section-heading]_h2]:text-[17px]",
        "max-md:pt-4",
        "max-sm:px-3.75",
        "max-sm:[&_[data-slot=section-heading]]:flex-nowrap max-sm:[&_[data-slot=section-heading]]:mb-3",
        "max-sm:[&_[data-slot=section-heading]_h2]:text-[17px]",
      )}
    >
      <section aria-label="Weekly revenue chart">
        <SectionHeading title="Revenue Trend">
          <PeriodSelect
            label="Revenue chart period"
            value={period}
            onChange={setPeriod}
          />
        </SectionHeading>
        <div className="flex items-center gap-3">
          <strong className="text-[24px] leading-[1.2] font-[740] tracking-[-0.65px] max-sm:text-[26px]">
            {formatCurrency(business.revenue)}
          </strong>
          <Badge tone="green">▲ +{formatPercent(metrics.revenueGrowth)}</Badge>
        </div>
        <p className="mt-0.75 text-[#6e6684] text-[11px]">
          Latest week&apos;s revenue · vs. previous week
        </p>
        <div
          className={cn(
            "h-38.5 w-full min-w-0 mt-1.25",
            "2xl:h-48.75",
            "max-md:h-46.25",
            "max-sm:h-49",
          )}
          role="img"
          aria-label={`Revenue over ${period} weeks, ending at ${formatCurrency(business.revenue)}. Detailed values are available in the data table below.`}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            initialDimension={{ width: 400, height: 180 }}
          >
            <AreaChart
              data={weeklyTrend.slice(-period)}
              margin={{ top: 17, right: 12, bottom: 0, left: -17 }}
              accessibilityLayer
            >
              <defs>
                <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8045fc" stopOpacity={0.23} />
                  <stop offset="100%" stopColor="#8045fc" stopOpacity={0.025} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--chart-axis)", fontSize: 10 }}
                tickMargin={10}
                minTickGap={10}
              />
              <YAxis
                domain={[300000, 500000]}
                ticks={[300000, 350000, 400000, 450000, 500000]}
                tickFormatter={(value: number) => `$${value / 1000}K`}
                tick={{ fill: "var(--chart-axis)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [
                  formatCurrency(Number(value)),
                  "Revenue",
                ]}
              />
              <Area
                name="Revenue"
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-revenue)"
                strokeWidth={2.5}
                fill="url(#revenue-fill)"
                activeDot={{ r: 5, stroke: "white", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <details
          data-slot="chart-data"
          className={cn(
            "text-[9px] mt-1 text-[#777088]",
            "[&>summary]:inline-block [&>summary]:py-0.75 [&>summary]:px-0 [&>summary]:underline-offset-[2px]",
            "[&>summary:hover]:text-primary [&>summary:hover]:underline",
            "[&_table]:mt-2 [&_table]:w-full [&_table]:text-[11px] [&_table]:text-left [&_table]:border-collapse",
            "[&_td]:p-1.75 [&_td]:border-b [&_td]:border-b-border-subtle",
            "[&_th]:p-1.75 [&_th]:border-b [&_th]:border-b-border-subtle",
            "[&_tbody_th]:font-medium",
          )}
        >
          <summary>View chart data</summary>
          <div className="relative overflow-x-auto max-w-full">
            <table>
              <caption className="sr-only">Weekly revenue in USD</caption>
              <thead>
                <tr>
                  <th scope="col">Week ending</th>
                  <th scope="col">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {weeklyTrend.slice(-period).map((item) => (
                  <tr key={item.date}>
                    <th scope="row">{item.date}</th>
                    <td>{formatCurrency(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>
    </Card>
  );
}

export function OrdersChart() {
  const [period, setPeriod] = useState(8);
  return (
    <Card
      asChild
      className={cn(
        "pt-4 px-3.75 pb-2.5 relative",
        "[&_[data-slot=section-heading]]:mb-2.25",
        "[&_[data-slot=section-heading]_h2]:text-[16px] [&_[data-slot=section-heading]_h2]:whitespace-nowrap",
        "max-lg:px-3.25",
        "max-lg:[&_[data-slot=section-heading]]:gap-1.25 max-lg:[&_[data-slot=section-heading]]:flex-wrap",
        "max-lg:[&_[data-slot=section-heading]_h2]:text-[15px]",
        "max-md:[&_[data-slot=section-heading]_h2]:text-[17px]",
        "max-md:pt-4",
        "max-sm:px-3.75",
        "max-sm:[&_[data-slot=section-heading]]:flex-nowrap max-sm:[&_[data-slot=section-heading]]:mb-3",
        "max-sm:[&_[data-slot=section-heading]_h2]:text-[17px]",
      )}
    >
      <section aria-label="Weekly orders and fulfillment chart">
        <SectionHeading title="Orders & Fulfillment">
          <PeriodSelect
            label="Orders chart period"
            value={period}
            onChange={setPeriod}
          />
        </SectionHeading>
        <div
          className={cn(
            "leading-[1.2] grid grid-cols-[1fr_1fr] gap-2 min-h-11.75",
            "[&>div>div]:flex [&>div>div]:items-center [&>div>div]:gap-1.75 [&>div>div]:mt-1 [&>div>div]:mr-0 [&>div>div]:mb-0 [&>div>div]:ml-3.5",
            "[&_strong]:text-[18px] [&_strong]:tracking-[-0.6px] [&_strong]:leading-[1.2]",
            "[&_[data-slot=badge]]:text-[9px] [&_[data-slot=badge]]:py-0.75 [&_[data-slot=badge]]:px-1.5",
            "max-lg:gap-0.75",
            "max-lg:[&>div>div]:gap-1 max-lg:[&>div>div]:ml-0",
            "max-lg:[&_strong]:text-[17px]",
            "max-lg:[&_[data-slot=badge]]:text-[8px]",
            "max-sm:[&_strong]:text-[20px]",
            "max-sm:[&>div>div]:ml-3.25 max-sm:[&>div>div]:gap-2.25",
            "max-sm:[&_[data-slot=badge]]:text-[10px]",
          )}
        >
          <div>
            <span
              className={cn(
                "flex items-center gap-1.5 text-[10px] text-[#625674]",
                "[&_i]:w-2 [&_i]:h-2 [&_i]:rounded-[50%]",
                "max-sm:text-[11px]",
              )}
            >
              <i className="bg-[#974cff]" />
              Orders
            </span>
            <div>
              <strong>{formatNumber(business.orders)}</strong>
              <Badge tone="green">
                ▲ +{formatPercent(metrics.orderGrowth)}
              </Badge>
            </div>
          </div>
          <div>
            <span
              className={cn(
                "flex items-center gap-1.5 text-[10px] text-[#625674]",
                "[&_i]:w-2 [&_i]:h-2 [&_i]:rounded-[50%]",
                "max-sm:text-[11px]",
              )}
            >
              <i className="bg-[#00b9c3]" />
              Fulfilled on time
            </span>
            <div>
              <strong>{formatNumber(business.fulfilled)}</strong>
              <Badge tone="green">
                ▲ +{formatPercent(metrics.fulfillmentGrowth)}
              </Badge>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "h-38.5 w-full min-w-0 mt-1.25",
            "2xl:h-48.75",
            "max-md:h-46.25",
            "max-sm:h-49",
          )}
          role="img"
          aria-label={`Orders and on-time fulfillment over ${period} weeks. Detailed values are available below.`}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            initialDimension={{ width: 360, height: 180 }}
          >
            <AreaChart
              data={weeklyTrend.slice(-period)}
              margin={{ top: 17, right: 12, bottom: 0, left: -25 }}
              accessibilityLayer
            >
              <defs>
                <linearGradient id="orders-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a246ff" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#a246ff" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient
                  id="fulfillment-fill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#06c3ca" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#06c3ca" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--chart-axis)", fontSize: 10 }}
                tickMargin={10}
                minTickGap={8}
              />
              <YAxis
                domain={[10000, 14000]}
                ticks={[10000, 11000, 12000, 13000, 14000]}
                tickFormatter={(value: number) => `${value / 1000}K`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--chart-axis)", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => [formatNumber(Number(value)), name]}
              />
              <Area
                name="Orders"
                type="monotone"
                dataKey="orders"
                stroke="var(--chart-orders)"
                strokeWidth={2.3}
                fill="url(#orders-fill)"
                isAnimationActive={false}
              />
              <Area
                name="Fulfilled on time"
                type="monotone"
                dataKey="fulfilled"
                stroke="var(--chart-fulfilled)"
                strokeWidth={2.3}
                fill="url(#fulfillment-fill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <details
          data-slot="chart-data"
          className={cn(
            "text-[9px] mt-1 text-[#777088]",
            "[&>summary]:inline-block [&>summary]:py-0.75 [&>summary]:px-0 [&>summary]:underline-offset-[2px]",
            "[&>summary:hover]:text-primary [&>summary:hover]:underline",
            "[&_table]:mt-2 [&_table]:w-full [&_table]:text-[11px] [&_table]:text-left [&_table]:border-collapse",
            "[&_td]:p-1.75 [&_td]:border-b [&_td]:border-b-border-subtle",
            "[&_th]:p-1.75 [&_th]:border-b [&_th]:border-b-border-subtle",
            "[&_tbody_th]:font-medium",
          )}
        >
          <summary>View chart data</summary>
          <div className="relative overflow-x-auto max-w-full">
            <table>
              <caption className="sr-only">
                Weekly order counts and on-time fulfillment
              </caption>
              <thead>
                <tr>
                  <th scope="col">Week</th>
                  <th scope="col">Orders</th>
                  <th scope="col">On time</th>
                </tr>
              </thead>
              <tbody>
                {weeklyTrend.slice(-period).map((item) => (
                  <tr key={item.date}>
                    <th scope="row">{item.date}</th>
                    <td>{formatNumber(item.orders)}</td>
                    <td>{formatNumber(item.fulfilled)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>
    </Card>
  );
}
