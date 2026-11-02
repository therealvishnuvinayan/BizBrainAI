import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/dashboard";

export const metadata: Metadata = { title: "Business Overview" };
export default function OverviewPage() {
  return <Dashboard />;
}
