import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** "Clinically reviewed by Dr. Christopher B. Wong · Updated <date>" line. */
export function ReviewedBy({
  date,
  className,
}: {
  /** ISO date (YYYY-MM-DD) the page content was last reviewed. */
  readonly date: string;
  readonly className?: string;
}) {
  const label = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <p className={cn("flex items-center gap-3 text-sm text-ink-muted", className)}>
      <Image
        src="/images/about/dr-wong-portrait.webp"
        alt=""
        width={64}
        height={64}
        sizes="32px"
        className="h-8 w-8 rounded-full object-cover object-[50%_25%] ring-2 ring-cream-50"
      />
      <span>
        Clinically reviewed by{" "}
        <Link href="/about" className="link-rooted">
          Dr. Christopher B. Wong
        </Link>{" "}
        · Updated <time dateTime={date}>{label}</time>
      </span>
    </p>
  );
}

export default ReviewedBy;
