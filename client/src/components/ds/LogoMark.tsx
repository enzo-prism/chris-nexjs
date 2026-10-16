import { cn } from "@/lib/utils";

type LogoMarkProps = {
  readonly className?: string;
  readonly title?: string;
};

// Vector take on the practice mark: a tooth whose crown holds a coast
// redwood (Palo Alto's namesake tree) and whose roots form the trunk's arch.
export function LogoMark({ className, title }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn("h-10 w-10", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
    >
      <path
        d="M24 9.6c-3.6-2.5-7.8-3.4-11.3-1.8-4.4 2-5.6 6.9-4.8 11.8.8 4.9 3.1 8.4 4.1 12.9 1 4.5 1.4 9 4.1 9.4 2.6.4 3.2-4.4 4-7.9.8-3.5 2-5.4 3.9-5.4s3.1 1.9 3.9 5.4c.8 3.5 1.4 8.3 4 7.9 2.7-.4 3.1-4.9 4.1-9.4 1-4.5 3.3-8 4.1-12.9.8-4.9-.4-9.8-4.8-11.8-3.5-1.6-7.7-.7-11.3 1.8Z"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M19.6 10.4c1.6-.9 3.1-1.1 4.4-.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M24 11.6 21 15.9h1.6l-2.9 3.6h1.9l-3.3 4h4.3v4.9h2.8v-4.9h4.3l-3.3-4h1.9l-2.9-3.6H27Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default LogoMark;
