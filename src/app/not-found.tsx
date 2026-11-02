import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main
      className={cn(
        "min-h-svh flex items-center justify-center flex-col gap-5 p-6.25 text-center bg-(image:--background-image-not-found)",
        "[&>svg]:text-[#9362d0]",
        "[&_h1]:text-[34px] [&_h1]:tracking-[-1px]",
        "[&_p]:text-[#8e6da3] [&_p]:text-[14px]",
      )}
    >
      <Compass size={46} />
      <h1>This trail ends here.</h1>
      <p>That page isn’t part of the demo workspace.</p>
      <Link
        className={buttonVariants({ variant: "default" })}
        href="/demo/overview"
      >
        Back to overview
      </Link>
    </main>
  );
}
