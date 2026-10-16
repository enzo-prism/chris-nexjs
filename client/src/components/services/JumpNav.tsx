import { cn } from "@/lib/utils";

/** "On this page" chips: quick jumps on long service pages (zero JS). */
export function JumpNav({
  items,
  className,
}: {
  readonly items: readonly { readonly href: string; readonly label: string }[];
  readonly className?: string;
}) {
  return (
    <nav aria-label="On this page" className={cn("-mx-4 sm:mx-0", className)}>
      <ul className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-0">
        <li className="flex shrink-0 items-center pr-1 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
          On this page
        </li>
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <a
              href={item.href}
              className="pill min-h-11 whitespace-nowrap transition-colors hover:border-evergreen-400 hover:text-evergreen-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen-500"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default JumpNav;
