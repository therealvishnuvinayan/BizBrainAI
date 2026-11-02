import type { Metadata } from "next";
import { InvestigationWorkspace } from "@/components/investigation/investigation-workspace";

export const metadata: Metadata = { title: "Order #4821 Investigation" };
export default function InvestigationPage() {
  return <InvestigationWorkspace />;
}
