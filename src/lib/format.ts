export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;
export const percentageChange = (current: number, previous: number) =>
  ((current - previous) / previous) * 100;
