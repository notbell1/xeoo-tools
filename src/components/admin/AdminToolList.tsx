import { Check, CircleAlert, LoaderCircle, Trash2 } from "lucide-react";

import type { AdminTool } from "../../types/admin";
import type { ToolStatus } from "../../types/admin";

import { getCategoryIcon, getToolIcon } from "../../lib/toolIcons";

interface AdminToolListProps {
  tools: AdminTool[];
  loading?: boolean;
  statusBusyId?: number | null;
  deleteBusyId?: number | null;
  onStatusChange: (tool: AdminTool, status: ToolStatus) => void;
  onDelete: (tool: AdminTool) => void;
}

export default function AdminToolList({
  tools,
  loading = false,
  statusBusyId,
  deleteBusyId,
  onStatusChange,
  onDelete,
}: AdminToolListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-3xl border border-xeoo-border bg-xeoo-surface"
          />
        ))}
      </div>
    );
  }

  if (!tools.length) {
    return (
      <div className="rounded-3xl border border-dashed border-xeoo-border-dark bg-xeoo-surface px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-xeoo-surface-soft text-xeoo-muted">
          <CircleAlert size={25} />
        </div>

        <h3 className="mt-4 text-sm font-bold text-xeoo-text">
          No tools found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-xeoo-muted">
          No tools match the selected filter.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tools.map((tool) => {
        const ToolIcon = getToolIcon(tool.icon);

        const CategoryIcon = getCategoryIcon(tool.category_slug);

        const statusBusy = statusBusyId === tool.id;

        const deleteBusy = deleteBusyId === tool.id;

        return (
          <article
            key={tool.id}
            className={[
              "group rounded-3xl border",
              "border-xeoo-border bg-xeoo-surface",
              "p-4 shadow-sm",
              "transition-all duration-200",
              "hover:border-xeoo-border-dark",
              "hover:shadow-lg hover:shadow-black/5",
            ].join(" ")}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className={[
                    "flex h-12 w-12 shrink-0 items-center justify-center",
                    "rounded-2xl border",
                    "border-xeoo-primary/15",
                    "bg-xeoo-primary-soft",
                    "text-xeoo-primary",
                  ].join(" ")}
                >
                  <ToolIcon size={21} strokeWidth={1.8} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-xeoo-text">
                      {tool.name}
                    </h3>

                    <span className="rounded-md bg-xeoo-surface-soft px-2 py-0.5 text-[10px] font-semibold text-xeoo-muted">
                      #{tool.id}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-1 text-xs text-xeoo-muted">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "inline-flex items-center gap-1.5",
                    "rounded-xl border px-3 py-2",
                    "text-xs font-semibold",
                    "border-xeoo-border bg-xeoo-surface-soft",
                    "text-xeoo-text-soft",
                  ].join(" ")}
                  title={tool.category_name}
                >
                  <CategoryIcon size={14} strokeWidth={1.9} />

                  <span>{tool.category_name}</span>
                </span>

                <span
                  className={[
                    "rounded-xl border px-3 py-2",
                    "text-[10px] font-bold tracking-[0.12em]",
                    tool.status === "ready"
                      ? "border-xeoo-success/20 bg-xeoo-success-soft text-xeoo-success"
                      : "border-xeoo-warning/20 bg-xeoo-warning-soft text-xeoo-warning",
                  ].join(" ")}
                >
                  {tool.status === "ready" ? "READY" : "MAINTENANCE"}
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div
                  className={[
                    "flex items-center rounded-2xl",
                    "border border-xeoo-border",
                    "bg-xeoo-surface-soft p-1",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    disabled={statusBusy || tool.status === "ready"}
                    onClick={() => onStatusChange(tool, "ready")}
                    className={[
                      "inline-flex items-center gap-1.5",
                      "rounded-xl px-3 py-2",
                      "text-xs font-bold",
                      "transition-all duration-200",
                      "disabled:cursor-not-allowed",
                      tool.status === "ready"
                        ? ["bg-xeoo-success", "text-white", "shadow-sm"].join(
                            " ",
                          )
                        : [
                            "text-xeoo-muted",
                            "hover:bg-xeoo-surface",
                            "hover:text-xeoo-success",
                          ].join(" "),
                    ].join(" ")}
                  >
                    {statusBusy && tool.status !== "ready" ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    READY
                  </button>

                  <button
                    type="button"
                    disabled={statusBusy || tool.status === "maintenance"}
                    onClick={() => onStatusChange(tool, "maintenance")}
                    className={[
                      "inline-flex items-center gap-1.5",
                      "rounded-xl px-3 py-2",
                      "text-xs font-bold",
                      "transition-all duration-200",
                      "disabled:cursor-not-allowed",
                      tool.status === "maintenance"
                        ? ["bg-xeoo-warning", "text-white", "shadow-sm"].join(
                            " ",
                          )
                        : [
                            "text-xeoo-muted",
                            "hover:bg-xeoo-surface",
                            "hover:text-xeoo-warning",
                          ].join(" "),
                    ].join(" ")}
                  >
                    {statusBusy && tool.status !== "maintenance" ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <CircleAlert size={14} />
                    )}
                    MAINTENANCE
                  </button>
                </div>

                <button
                  type="button"
                  disabled={statusBusy || deleteBusy}
                  onClick={() => onDelete(tool)}
                  className={[
                    "inline-flex items-center justify-center gap-2",
                    "rounded-2xl border px-3 py-2",
                    "text-xs font-bold",
                    "transition-all duration-200",
                    "disabled:cursor-not-allowed",
                    "border-xeoo-danger/15",
                    "bg-xeoo-danger-soft",
                    "text-xeoo-danger",
                    "hover:border-xeoo-danger/30",
                    "hover:bg-xeoo-danger",
                    "hover:text-white",
                  ].join(" ")}
                >
                  {deleteBusy ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
