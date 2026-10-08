import {
  CalendarClock,
  Check,
  CircleAlert,
  FolderOpen,
  Wrench,
} from "lucide-react";

interface AdminStatsProps {
  total: number;
  ready: number;
  maintenance: number;
  upcoming: number;
  categories: number;
}

type StatItem = {
  label: string;
  value: number;
  description: string;
  icon: typeof Wrench;
  iconClass: string;
  valueClass: string;
};

export default function AdminStats({
  total,
  ready,
  maintenance,
  upcoming,
  categories,
}: AdminStatsProps) {
  const readyPercentage = total > 0 ? Math.round((ready / total) * 100) : 0;

  const stats: StatItem[] = [
    {
      label: "Total Tools",
      value: total,
      description: "All catalog tools",
      icon: Wrench,
      iconClass: "bg-xeoo-primary-soft text-xeoo-primary",
      valueClass: "text-xeoo-text",
    },
    {
      label: "Ready",
      value: ready,
      description: `${readyPercentage}% of catalog`,
      icon: Check,
      iconClass: "bg-xeoo-success-soft text-xeoo-success",
      valueClass: "text-xeoo-success",
    },
    {
      label: "Maintenance",
      value: maintenance,
      description: "Requires attention",
      icon: CircleAlert,
      iconClass: "bg-xeoo-warning-soft text-xeoo-warning",
      valueClass: "text-xeoo-warning",
    },
    {
      label: "Upcoming",
      value: upcoming,
      description: "In development",
      icon: CalendarClock,
      iconClass: "bg-sky-500/10 text-sky-600",
      valueClass: "text-sky-600",
    },
    {
      label: "Categories",
      value: categories,
      description: "Active categories",
      icon: FolderOpen,
      iconClass: "bg-xeoo-surface-soft text-xeoo-text-soft",
      valueClass: "text-xeoo-text",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.label}
            className={[
              "min-w-0 rounded-xl border border-xeoo-border",
              "bg-xeoo-surface shadow-sm",
              "px-2.5 py-2.5 sm:px-3 sm:py-3",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-2">
              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.04em] text-xeoo-muted sm:text-[10px]">
                  {stat.label}
                </p>

                <p
                  className={[
                    "mt-0.5 truncate",
                    "text-lg font-extrabold leading-none tracking-tight",
                    "sm:text-xl",
                    stat.valueClass,
                  ].join(" ")}
                >
                  {stat.value}
                </p>
              </div>

              {/* Icon */}
              <div
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  "sm:h-8 sm:w-8",
                  stat.iconClass,
                ].join(" ")}
              >
                <Icon size={14} strokeWidth={2} />
              </div>
            </div>

            {/* Description */}
            <p className="mt-1.5 truncate text-[10px] font-medium leading-tight text-xeoo-muted sm:mt-2 sm:text-[10px]">
              {stat.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
