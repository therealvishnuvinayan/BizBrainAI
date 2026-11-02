import { AppShell } from "@/components/layout/app-shell";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
