import { holidayHours, officeInfo } from "@/lib/data";
import { cn } from "@/lib/utils";

type OfficeHoursSummaryProps = {
  variant?: "stacked" | "grid" | "inline";
  className?: string;
  hoursClassName?: string;
  noteClassName?: string;
};

const regularHours = [
  { label: "Monday - Thursday", shortLabel: "Mon-Thu", value: officeInfo.hours.monday },
  { label: "Friday", shortLabel: "Fri", value: officeInfo.hours.friday },
  { label: "Saturday - Sunday", shortLabel: "Sat-Sun", value: officeInfo.hours.saturday },
] as const;

const OfficeHoursSummary = ({
  variant = "stacked",
  className,
  hoursClassName,
  noteClassName,
}: OfficeHoursSummaryProps) => {
  const temporaryNotice = holidayHours.active ? (
    <p
      className={cn(
        "text-xs leading-relaxed",
        variant === "inline" ? "mt-1" : "mt-3",
        noteClassName,
      )}
    >
      <span className="font-semibold">Temporary update:</span>{" "}
      {holidayHours.shortNotice}
    </p>
  ) : null;

  if (variant === "grid") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className={cn("grid grid-cols-2 gap-x-3 gap-y-2", hoursClassName)}>
          {regularHours.map((item) => (
            <div key={item.label} className="contents">
              <div className="font-medium">{item.label}</div>
              <div>{item.value}</div>
            </div>
          ))}
        </div>
        {temporaryNotice}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("space-y-1", className)}>
        <p className={cn("leading-relaxed", hoursClassName)}>
          Regular hours:{" "}
          {regularHours
            .map((item) => `${item.shortLabel}: ${item.value}`)
            .join(" · ")}
        </p>
        {temporaryNotice}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className={cn("leading-relaxed", hoursClassName)}>
        {regularHours.map((item) => (
          <div key={item.label}>
            {item.shortLabel}: {item.value}
          </div>
        ))}
      </div>
      {temporaryNotice}
    </div>
  );
};

export default OfficeHoursSummary;
