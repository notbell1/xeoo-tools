import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Globe,
  Laptop,
  LoaderCircle,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { showConfirm, showError, showSuccess, showWarning } from "../../alert";
import { BACKEND_URL } from "../../config/backend";
import { getToolIcon } from "../../lib/toolIcons";
import type {
  TrafficPeriod,
  TrafficStatsData,
  TrafficStatsResponse,
} from "../../types/traffic";

interface AdminTrafficProps {
  onUnauthorized?: () => void;
}

export default function AdminTraffic({ onUnauthorized }: AdminTrafficProps) {
  const [period, setPeriod] = useState<TrafficPeriod>("7d");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  // Pagination states
  const [activityPage, setActivityPage] = useState<number>(1);
  const [toolsPage, setToolsPage] = useState<number>(1);
  const [pagesPage, setPagesPage] = useState<number>(1);

  const [pageTypeFilter, setPageTypeFilter] = useState<
    "all" | "tool" | "category" | "general"
  >("all");

  const [data, setData] = useState<TrafficStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportingPdf, setExportingPdf] = useState<boolean>(false);

  // Chart tooltip hover state
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    x: number;
    y: number;
    date: string;
    pageviews: number;
    unique_visitors: number;
  } | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("period", period);
      params.append("page", activityPage.toString());
      params.append("per_page", "10");

      if (period === "custom") {
        if (customStart) params.append("start_date", customStart);
        if (customEnd) params.append("end_date", customEnd);
      }

      const response = await fetch(
        `${BACKEND_URL}/api/traffic/stats.php?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (response.status === 401) {
        if (onUnauthorized) onUnauthorized();
        setError("Invalid or expired session. Please log in again.");
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const result: TrafficStatsResponse = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        if (
          period === "custom" &&
          !customStart &&
          result.data.period?.start_date
        ) {
          setCustomStart(result.data.period.start_date);
        }
        if (period === "custom" && !customEnd && result.data.period?.end_date) {
          setCustomEnd(result.data.period.end_date);
        }
      } else {
        setError(result.message || "Failed to load traffic statistics.");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "An error occurred while loading data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [period, customStart, customEnd, activityPage, onUnauthorized]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handle Export CSV
  const handleExportCSV = async () => {
    const confirmed = await showConfirm(
      "Export Traffic CSV",
      "Do you want to export and download the traffic analytics CSV report?",
    );
    if (!confirmed) return;

    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.append("period", period);
      if (period === "custom") {
        if (customStart) params.append("start_date", customStart);
        if (customEnd) params.append("end_date", customEnd);
      }

      const exportUrl = `${BACKEND_URL}/api/traffic/export.php?${params.toString()}`;

      const res = await fetch(exportUrl, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        if (onUnauthorized) onUnauthorized();
        await showError(
          "Authentication Required",
          "Your admin session has expired. Please log in again to export data.",
        );
        return;
      }

      if (!res.ok) {
        throw new Error(`Export server responded with status ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `xeootools_traffic_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      await showSuccess(
        "Export Successful",
        "Traffic CSV report has been downloaded.",
      );
    } catch (err: unknown) {
      console.error("Export error:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Unable to export CSV.";
      await showError("Export Failed", errorMsg);
    } finally {
      setExporting(false);
    }
  };

  // Handle Export PDF via Print-to-PDF Document
  const handleExportPDF = async () => {
    if (!data) {
      await showWarning(
        "No Data Available",
        "Please wait until traffic analytics data finishes loading.",
      );
      return;
    }

    const confirmed = await showConfirm(
      "Export Traffic PDF",
      "Do you want to generate and print the traffic analytics PDF report?",
    );
    if (!confirmed) return;

    setExportingPdf(true);
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        await showError(
          "Popup Blocked",
          "Please allow popups in your browser to open and print the PDF report.",
        );
        return;
      }

      const generatedAt = new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      const periodLabel =
        period === "today"
          ? "Today"
          : period === "7d"
            ? "Last 7 Days"
            : period === "30d"
              ? "Last 30 Days"
              : period === "all"
                ? "All Time"
                : `Custom (${data.period.start_date} to ${data.period.end_date})`;

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>XeooTools Traffic Report - ${periodLabel}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #17191c; margin: 0; padding: 20px; font-size: 11px; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 18px; font-weight: 800; color: #17191c; margin: 0; }
    .subtitle { font-size: 11px; color: #69707a; margin-top: 3px; }
    .meta-box { text-align: right; font-size: 11px; color: #69707a; }
    .meta-box strong { color: #17191c; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
    .card { border: 1px solid #dfe3e8; border-radius: 8px; padding: 10px; background: #fafafa; }
    .card-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #69707a; margin-bottom: 3px; }
    .card-val { font-size: 18px; font-weight: 800; color: #17191c; }
    .card-sub { font-size: 9px; color: #69707a; margin-top: 3px; }
    .section-title { font-size: 12px; font-weight: 700; margin: 18px 0 6px 0; border-bottom: 1px solid #dfe3e8; padding-bottom: 4px; display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 14px; }
    th { text-align: left; padding: 5px 6px; background: #f3f4f6; color: #475569; font-weight: 700; border-bottom: 1px solid #dfe3e8; }
    td { padding: 5px 6px; border-bottom: 1px solid #f1f5f9; }
    .text-right { text-align: right; }
    .badge { display: inline-block; padding: 2px 5px; border-radius: 4px; font-size: 9px; font-weight: 700; background: #e0e7ff; color: #3730a3; }
    .footer { margin-top: 24px; border-top: 1px solid #dfe3e8; padding-top: 8px; font-size: 9px; color: #94a3b8; text-align: center; }
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">XeooTools — Traffic & Analytics Report</h1>
      <div class="subtitle">Official Website Traffic, Visitors, Popular Tools & Demographics</div>
    </div>
    <div class="meta-box">
      <div>Period: <strong>${periodLabel}</strong></div>
      <div>Generated: <strong>${generatedAt}</strong></div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-label">Total Pageviews</div>
      <div class="card-val">${data.summary.total_pageviews.toLocaleString("en-US")}</div>
      <div class="card-sub">${data.summary.pageviews_change >= 0 ? "+" : ""}${data.summary.pageviews_change}% vs previous</div>
    </div>
    <div class="card">
      <div class="card-label">Unique Visitors</div>
      <div class="card-val">${data.summary.unique_visitors.toLocaleString("en-US")}</div>
      <div class="card-sub">${data.summary.visitors_change >= 0 ? "+" : ""}${data.summary.visitors_change}% vs previous</div>
    </div>
    <div class="card">
      <div class="card-label">Today's Visits</div>
      <div class="card-val">${data.summary.today_pageviews.toLocaleString("en-US")}</div>
      <div class="card-sub">Recorded visits today</div>
    </div>
    <div class="card">
      <div class="card-label">Daily Average</div>
      <div class="card-val">${data.summary.daily_avg_pageviews.toLocaleString("en-US")}</div>
      <div class="card-sub">Over ${data.period.num_days} days</div>
    </div>
  </div>

  <div class="section-title">
    <span>Popular Tools (Top ${Math.min(15, data.top_tools.length)})</span>
    <span style="font-weight: normal; font-size: 10px; color: #64748b;">Total Tool Views: ${data.total_tool_views.toLocaleString("en-US")}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 35px;">Rank</th>
        <th>Tool Name</th>
        <th>Category</th>
        <th class="text-right">Pageviews</th>
        <th class="text-right">Unique Visitors</th>
        <th class="text-right">Share</th>
      </tr>
    </thead>
    <tbody>
      ${data.top_tools
        .slice(0, 15)
        .map(
          (tool, idx) => `
        <tr>
          <td><strong>#${idx + 1}</strong></td>
          <td>${tool.tool_name}</td>
          <td><span class="badge">${tool.category_name}</span></td>
          <td class="text-right"><strong>${tool.pageviews.toLocaleString("en-US")}</strong></td>
          <td class="text-right">${tool.unique_visitors}</td>
          <td class="text-right">${tool.percentage}%</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <div class="section-title">
    <span>Popular Pages (Top ${Math.min(15, data.popular_pages.length)})</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Path / Route</th>
        <th>Page Title</th>
        <th>Type</th>
        <th class="text-right">Pageviews</th>
        <th class="text-right">Share</th>
      </tr>
    </thead>
    <tbody>
      ${data.popular_pages
        .slice(0, 15)
        .map(
          (page) => `
        <tr>
          <td style="font-family: monospace;">${page.path}</td>
          <td>${page.page_title}</td>
          <td><span class="badge" style="background:#f1f5f9; color:#334155;">${page.page_type}</span></td>
          <td class="text-right"><strong>${page.pageviews.toLocaleString("en-US")}</strong></td>
          <td class="text-right">${page.percentage}%</td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>

  <div class="section-title">
    <span>Demographics & Traffic Acquisition Summary</span>
  </div>
  <table style="margin-bottom: 0;">
    <thead>
      <tr>
        <th style="width: 33%;">Devices</th>
        <th style="width: 33%;">Top Browsers</th>
        <th style="width: 34%;">Traffic Sources</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="vertical-align: top;">
          ${data.demographics.devices.map((d) => `<div>${d.name}: <strong>${d.count}</strong> (${d.percentage}%)</div>`).join("")}
        </td>
        <td style="vertical-align: top;">
          ${data.demographics.browsers
            .slice(0, 3)
            .map(
              (b) => `<div>${b.name}: <strong>${b.percentage}%</strong></div>`,
            )
            .join("")}
        </td>
        <td style="vertical-align: top;">
          ${data.sources.breakdown.map((s) => `<div>${s.label}: <strong>${s.count}</strong> (${s.percentage}%)</div>`).join("")}
        </td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    Report generated by XeooTools Admin Panel • Confidential
  </div>
</body>
</html>`;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
      }, 400);

      await showSuccess("PDF Ready", "Print to PDF dialog has been opened.");
    } catch (err) {
      console.error("PDF export error:", err);
      await showError(
        "PDF Export Failed",
        "Unable to generate printable PDF document.",
      );
    } finally {
      setExportingPdf(false);
    }
  };

  // Popular Tools Pagination (5 per page)
  const toolsPerPage = 5;
  const topToolsList = data?.top_tools || [];
  const totalToolsPages = Math.max(
    1,
    Math.ceil(topToolsList.length / toolsPerPage),
  );
  const pagedTools = topToolsList.slice(
    (toolsPage - 1) * toolsPerPage,
    toolsPage * toolsPerPage,
  );

  // Popular Pages Filter & Pagination (10 per page, no scroll)
  const pagesPerPage = 10;
  const filteredPopularPages = (data?.popular_pages || []).filter((item) => {
    if (pageTypeFilter === "all") return true;
    return item.page_type === pageTypeFilter;
  });
  const totalPagesPages = Math.max(
    1,
    Math.ceil(filteredPopularPages.length / pagesPerPage),
  );
  const pagedPopularPages = filteredPopularPages.slice(
    (pagesPage - 1) * pagesPerPage,
    pagesPage * pagesPerPage,
  );

  // Calculate SVG Chart coordinates
  const timeSeries = data?.time_series || [];
  const chartWidth = 800;
  const chartHeight = 220;
  const chartPadding = { top: 35, right: 25, bottom: 32, left: 42 };

  const usableWidth = chartWidth - chartPadding.left - chartPadding.right;
  const usableHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  const rawMax = Math.max(
    1,
    ...timeSeries.map((p) => Math.max(p.pageviews, p.unique_visitors)),
  );
  // Add headroom so peak chart values never collide with the top border or labels
  const maxVal = Math.max(5, Math.ceil(rawMax * 1.2));

  const getX = (index: number) => {
    if (timeSeries.length <= 1) return chartPadding.left + usableWidth / 2;
    return chartPadding.left + (index / (timeSeries.length - 1)) * usableWidth;
  };

  const getY = (val: number) => {
    return chartPadding.top + usableHeight - (val / maxVal) * usableHeight;
  };

  const pageviewsPoints = timeSeries
    .map((p, i) => `${getX(i)},${getY(p.pageviews)}`)
    .join(" ");
  const visitorsPoints = timeSeries
    .map((p, i) => `${getX(i)},${getY(p.unique_visitors)}`)
    .join(" ");

  const pageviewsArea =
    timeSeries.length > 0
      ? `${chartPadding.left},${getY(0)} ${pageviewsPoints} ${getX(timeSeries.length - 1)},${getY(0)}`
      : "";

  return (
    <div className="space-y-3.5 pb-10">
      {/* ==============================================================
          A. FILTER CONTROLS & EXPORT ACTIONS (COMPACT TOOLBAR)
      ============================================================== */}
      <div className="flex flex-col gap-2 rounded-xl border border-xeoo-border bg-xeoo-surface p-2 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-2.5">
        {/* Left: Period selector pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
          <div className="flex items-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-0.5 text-xs font-semibold">
            {(
              [
                { id: "today", label: "Today" },
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "all", label: "All Time" },
                { id: "custom", label: "Custom" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPeriod(item.id);
                  setActivityPage(1);
                  setToolsPage(1);
                  setPagesPage(1);
                }}
                className={[
                  "rounded-md px-2.5 py-1 text-xs transition",
                  period === item.id
                    ? "bg-xeoo-text text-xeoo-surface shadow-xs font-bold"
                    : "text-xeoo-muted hover:text-xeoo-text",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions (Export CSV & Export PDF) */}
        <div className="flex items-center gap-2">
          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={exporting || loading}
            title="Download traffic analytics as CSV"
            className="flex items-center gap-1.5 rounded-lg border border-xeoo-border bg-xeoo-surface px-2.5 py-1.5 text-xs font-semibold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft hover:text-xeoo-text disabled:opacity-50"
          >
            {exporting ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}
            <span>Export CSV</span>
          </button>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exportingPdf || loading}
            title="Export and print traffic report as PDF"
            className="flex items-center gap-1.5 rounded-lg bg-xeoo-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-xeoo-primary-hover disabled:opacity-50"
          >
            {exportingPdf ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : (
              <FileText size={13} />
            )}
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker (shown when period === "custom") */}
      {period === "custom" && (
        <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-xeoo-border bg-xeoo-surface-soft/60 px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-xeoo-text">
            <Calendar size={13} className="text-xeoo-primary" />
            <span>Date Range:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-xeoo-muted">Start:</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-7 rounded-md border border-xeoo-border bg-xeoo-surface px-2 text-xs text-xeoo-text outline-none focus:border-xeoo-primary"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-xeoo-muted">End:</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-7 rounded-md border border-xeoo-border bg-xeoo-surface px-2 text-xs text-xeoo-text outline-none focus:border-xeoo-primary"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setActivityPage(1);
              setToolsPage(1);
              setPagesPage(1);
              fetchStats();
            }}
            className="h-7 rounded-md bg-xeoo-text px-3 text-xs font-bold text-xeoo-surface transition hover:opacity-90"
          >
            Apply
          </button>
        </div>
      )}

      {/* Error state alert */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle size={15} className="shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state skeleton */}
      {loading && !data && (
        <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-xeoo-border bg-xeoo-surface p-6 text-center"></div>
      )}

      {/* ==============================================================
          B. 4 METRIC SUMMARY CARDS (COMPACT & RESPONSIVE)
      ============================================================== */}
      {data && (
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
          {/* Card 1: Total Pageviews */}
          <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-2.5 shadow-xs sm:p-3">
            <div className="flex items-center justify-between">
              <span className="truncate text-[11px] font-semibold text-xeoo-muted">
                Total Pageviews
              </span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Eye size={13} />
              </span>
            </div>
            <p className="mt-1 text-base font-bold tracking-tight text-xeoo-text sm:text-lg lg:text-xl">
              {data.summary.total_pageviews.toLocaleString("en-US")}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[10px]">
              {data.summary.pageviews_change !== null &&
              data.summary.pageviews_change !== undefined ? (
                data.summary.pageviews_change >= 0 ? (
                  <span className="flex items-center font-bold text-emerald-600">
                    <ArrowUpRight size={11} />+{data.summary.pageviews_change}%
                  </span>
                ) : (
                  <span className="flex items-center font-bold text-red-500">
                    <ArrowDownRight size={11} />
                    {data.summary.pageviews_change}%
                  </span>
                )
              ) : (
                <span className="font-semibold text-xeoo-muted">0%</span>
              )}
              <span className="truncate text-xeoo-muted">vs previous</span>
            </div>
          </div>

          {/* Card 2: Unique Visitors */}
          <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-2.5 shadow-xs sm:p-3">
            <div className="flex items-center justify-between">
              <span className="truncate text-[11px] font-semibold text-xeoo-muted">
                Unique Visitors
              </span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Users size={13} />
              </span>
            </div>
            <p className="mt-1 text-base font-bold tracking-tight text-xeoo-text sm:text-lg lg:text-xl">
              {data.summary.unique_visitors.toLocaleString("en-US")}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[10px]">
              {data.summary.visitors_change !== null &&
              data.summary.visitors_change !== undefined ? (
                data.summary.visitors_change >= 0 ? (
                  <span className="flex items-center font-bold text-emerald-600">
                    <ArrowUpRight size={11} />+{data.summary.visitors_change}%
                  </span>
                ) : (
                  <span className="flex items-center font-bold text-red-500">
                    <ArrowDownRight size={11} />
                    {data.summary.visitors_change}%
                  </span>
                )
              ) : (
                <span className="font-semibold text-xeoo-muted">0%</span>
              )}
              <span className="truncate text-xeoo-muted">vs previous</span>
            </div>
          </div>

          {/* Card 3: Today's Visits */}
          <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-2.5 shadow-xs sm:p-3">
            <div className="flex items-center justify-between">
              <span className="truncate text-[11px] font-semibold text-xeoo-muted">
                Today&apos;s Visits
              </span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CalendarDays size={13} />
              </span>
            </div>
            <p className="mt-1 text-base font-bold tracking-tight text-xeoo-text sm:text-lg lg:text-xl">
              {data.summary.today_pageviews.toLocaleString("en-US")}
            </p>
            <div className="mt-1 text-[10px] text-xeoo-muted">
              Visits recorded today
            </div>
          </div>

          {/* Card 4: Daily Average */}
          <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-2.5 shadow-xs sm:p-3">
            <div className="flex items-center justify-between">
              <span className="truncate text-[11px] font-semibold text-xeoo-muted">
                Daily Average
              </span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <TrendingUp size={13} />
              </span>
            </div>
            <p className="mt-1 text-base font-bold tracking-tight text-xeoo-text sm:text-lg lg:text-xl">
              {data.summary.daily_avg_pageviews.toLocaleString("en-US")}
            </p>
            <div className="mt-1 text-[10px] text-xeoo-muted">
              Over {data.period.num_days} days in period
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          C. TIME SERIES CHART (TRAFFIC & VISITOR TREND)
      ============================================================== */}
      {data && (
        <div className="rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xs font-bold text-xeoo-text">
                Traffic & Visitor Trend
              </h2>
              <p className="text-[11px] text-xeoo-muted">
                Daily pageviews and unique visitors dynamics
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span className="text-xeoo-text-soft">Total Pageviews</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xeoo-text-soft">Unique Visitors</span>
              </div>
            </div>
          </div>

          {/* SVG Chart Container */}
          <div className="relative mt-3 w-full">
            {timeSeries.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-xs text-xeoo-muted">
                No traffic data recorded in this period.
              </div>
            ) : (
              <div className="relative w-full">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full overflow-visible"
                  style={{ minHeight: "200px" }}
                >
                  <defs>
                    <linearGradient
                      id="pageviewGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#2563eb"
                        stopOpacity="0.18"
                      />
                      <stop
                        offset="100%"
                        stopColor="#2563eb"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                    const y = chartPadding.top + usableHeight * (1 - pct);
                    const val = Math.round(maxVal * pct);
                    return (
                      <g key={i}>
                        <line
                          x1={chartPadding.left}
                          y1={y}
                          x2={chartWidth - chartPadding.right}
                          y2={y}
                          stroke="#e5e7eb"
                          strokeDasharray="3,3"
                          strokeWidth="1"
                        />
                        <text
                          x={chartPadding.left - 6}
                          y={y + 3}
                          fontSize="9"
                          fill="#9ca3af"
                          textAnchor="end"
                          fontFamily="sans-serif"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fill for pageviews */}
                  {timeSeries.length > 1 && (
                    <polygon points={pageviewsArea} fill="url(#pageviewGrad)" />
                  )}

                  {/* Pageviews Line */}
                  {timeSeries.length > 1 ? (
                    <polyline
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={pageviewsPoints}
                    />
                  ) : null}

                  {/* Unique Visitors Line */}
                  {timeSeries.length > 1 ? (
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="4,2"
                      points={visitorsPoints}
                    />
                  ) : null}

                  {/* Data Points / Interactive Circles */}
                  {timeSeries.map((p, i) => {
                    const cx = getX(i);
                    const cy1 = getY(p.pageviews);
                    const cy2 = getY(p.unique_visitors);
                    const isHovered = hoveredPoint?.index === i;

                    return (
                      <g key={i}>
                        {/* Vertical hover guide */}
                        {isHovered && (
                          <line
                            x1={cx}
                            y1={chartPadding.top}
                            x2={cx}
                            y2={chartPadding.top + usableHeight}
                            stroke="#94a3b8"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                          />
                        )}

                        {/* Pageview circle */}
                        <circle
                          cx={cx}
                          cy={cy1}
                          r={isHovered ? 5 : 3}
                          fill="#2563eb"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="transition-all duration-150"
                        />

                        {/* Visitor circle */}
                        <circle
                          cx={cx}
                          cy={cy2}
                          r={isHovered ? 4.5 : 2.5}
                          fill="#10b981"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="transition-all duration-150"
                        />

                        {/* Transparent touch/hover hit zone */}
                        <rect
                          x={
                            cx -
                            usableWidth / Math.max(1, timeSeries.length) / 2
                          }
                          y={chartPadding.top}
                          width={usableWidth / Math.max(1, timeSeries.length)}
                          height={usableHeight}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() =>
                            setHoveredPoint({
                              index: i,
                              x: cx,
                              y: cy1,
                              date: p.formatted_date || p.date,
                              pageviews: p.pageviews,
                              unique_visitors: p.unique_visitors,
                            })
                          }
                          onMouseLeave={() => setHoveredPoint(null)}
                        />

                        {/* X-axis date labels */}
                        {(timeSeries.length <= 10 ||
                          i % Math.ceil(timeSeries.length / 8) === 0 ||
                          i === timeSeries.length - 1) && (
                          <text
                            x={cx}
                            y={chartHeight - 8}
                            fontSize="9"
                            fill="#64748b"
                            textAnchor="middle"
                            fontFamily="sans-serif"
                          >
                            {p.formatted_date || p.date}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip Box */}
                {hoveredPoint && (
                  <div
                    className="pointer-events-none absolute z-30 rounded-lg border border-xeoo-border bg-xeoo-text px-2.5 py-1.5 text-white shadow-xl transition-all duration-75"
                    style={{
                      left: `${Math.min(90, Math.max(10, (hoveredPoint.x / chartWidth) * 100))}%`,
                      top: `${(hoveredPoint.y / chartHeight) * 100}%`,
                      transform:
                        hoveredPoint.y < 85
                          ? "translate(-50%, 14px)"
                          : "translate(-50%, calc(-100% - 12px))",
                    }}
                  >
                    <p className="text-[10px] font-bold text-gray-300">
                      {hoveredPoint.date}
                    </p>
                    <div className="mt-1 space-y-0.5 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        <span>
                          Pageviews: <strong>{hoveredPoint.pageviews}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>
                          Visitors:{" "}
                          <strong>{hoveredPoint.unique_visitors}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==============================================================
          D. POPULAR TOOLS & E. POPULAR PAGES (BOTH WITH FIXED STABLE HEIGHT)
      ============================================================== */}
      {data && (
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          {/* D. POPULAR TOOLS (PAGINATED 5 / PAGE, PROPORTIONED HEIGHT - NO CLIPPING) */}
          <div className="flex flex-col justify-between rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs sm:p-3.5 min-h-[510px] lg:h-[510px]">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between border-b border-xeoo-border pb-2.5 shrink-0">
                <div>
                  <h2 className="text-xs font-bold text-xeoo-text">
                    Popular Tools
                  </h2>
                  <p className="text-[10px] text-xeoo-muted">
                    Ranked by direct visits to tool pages
                  </p>
                </div>
                <span className="rounded-md bg-xeoo-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-xeoo-primary">
                  {topToolsList.length} Tools
                </span>
              </div>

              <div className="mt-2.5 flex-1 min-h-0 flex flex-col justify-start space-y-2">
                {pagedTools.length === 0 ? (
                  <div className="my-auto py-12 text-center text-xs text-xeoo-muted">
                    No tool visits recorded in this period.
                  </div>
                ) : (
                  pagedTools.map((tool, idx) => {
                    const globalRank = (toolsPage - 1) * toolsPerPage + idx + 1;
                    const ToolIcon =
                      getToolIcon(tool.icon || tool.tool_slug) || Wrench;
                    const rankColors = [
                      "bg-amber-500 text-white shadow-xs", // #1
                      "bg-slate-400 text-white", // #2
                      "bg-amber-700 text-white", // #3
                      "bg-xeoo-surface-soft text-xeoo-text",
                      "bg-xeoo-surface-soft text-xeoo-text",
                    ];

                    return (
                      <div
                        key={tool.tool_id || idx}
                        className="group rounded-lg border border-xeoo-border bg-xeoo-surface p-2 transition hover:border-xeoo-primary/40 hover:bg-xeoo-surface-soft/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            {/* Rank badge */}
                            <span
                              className={[
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-black",
                                globalRank <= 3
                                  ? rankColors[globalRank - 1]
                                  : "bg-xeoo-surface-soft text-xeoo-text",
                              ].join(" ")}
                            >
                              {globalRank}
                            </span>

                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-xeoo-surface-soft text-xeoo-text-soft">
                              <ToolIcon size={12} />
                            </span>

                            <div className="min-w-0">
                              <a
                                href={`/tools/${tool.tool_slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs font-bold leading-tight text-xeoo-text hover:text-xeoo-primary hover:underline"
                              >
                                <span className="truncate">
                                  {tool.tool_name}
                                </span>
                                <ExternalLink
                                  size={9}
                                  className="shrink-0 opacity-50"
                                />
                              </a>
                              <span className="block truncate text-[10px] leading-none text-xeoo-muted mt-0.5">
                                {tool.category_name}
                              </span>
                            </div>
                          </div>

                          {/* Counts */}
                          <div className="text-right shrink-0">
                            <p className="text-xs font-black leading-tight text-xeoo-text">
                              {tool.pageviews.toLocaleString("en-US")}{" "}
                              <span className="text-[10px] font-normal text-xeoo-muted">
                                views
                              </span>
                            </p>
                            <p className="text-[10px] leading-none text-xeoo-muted mt-0.5">
                              {tool.unique_visitors} visitors
                            </p>
                          </div>
                        </div>

                        {/* Percentage progress bar */}
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-xeoo-surface-soft">
                            <div
                              className="h-full rounded-full bg-xeoo-primary transition-all duration-300"
                              style={{
                                width: `${Math.min(100, tool.percentage)}%`,
                              }}
                            />
                          </div>
                          <span className="w-7 text-right text-[9px] font-bold text-xeoo-muted">
                            {tool.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Popular Tools Pagination (Persistent and pinned for height stability) */}
            <div className="mt-auto shrink-0 flex items-center justify-between border-t border-xeoo-border pt-2 text-[11px]">
              <span className="text-xeoo-muted">
                Page <strong>{toolsPage}</strong> of{" "}
                <strong>{totalToolsPages}</strong> ({topToolsList.length} tools)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={toolsPage <= 1}
                  onClick={() => setToolsPage((p) => Math.max(1, p - 1))}
                  className="flex h-6 items-center gap-1 rounded-md border border-xeoo-border px-2 text-[10px] font-semibold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={11} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  disabled={toolsPage >= totalToolsPages}
                  onClick={() =>
                    setToolsPage((p) => Math.min(totalToolsPages, p + 1))
                  }
                  className="flex h-6 items-center gap-1 rounded-md border border-xeoo-border px-2 text-[10px] font-semibold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight size={11} />
                </button>
              </div>
            </div>
          </div>

          {/* E. POPULAR PAGES (PAGINATED 10 / PAGE, FULL VISIBILITY OF ALL 10 ITEMS - NO OVERLAP) */}
          <div className="flex flex-col justify-between rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs sm:p-3.5 min-h-[510px] lg:h-[510px]">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between border-b border-xeoo-border pb-2.5 shrink-0">
                <div>
                  <h2 className="text-xs font-bold text-xeoo-text">
                    Popular Pages
                  </h2>
                  <p className="text-[10px] text-xeoo-muted">
                    Traffic activity grouped by route path
                  </p>
                </div>

                {/* Filter Tabs in English */}
                <div className="flex items-center rounded-lg border border-xeoo-border bg-xeoo-surface-soft p-0.5 text-[10px] font-semibold">
                  {(
                    [
                      { id: "all", label: "All" },
                      { id: "tool", label: "Tools" },
                      { id: "category", label: "Categories" },
                      { id: "general", label: "General" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setPageTypeFilter(tab.id);
                        setPagesPage(1);
                      }}
                      className={[
                        "rounded-md px-2 py-0.5 transition",
                        pageTypeFilter === tab.id
                          ? "bg-xeoo-text text-xeoo-surface shadow-xs font-bold"
                          : "text-xeoo-muted hover:text-xeoo-text",
                      ].join(" ")}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table with Zebra striping, table-fixed, clear vertical column borders - ALL 10 ROWS VISIBLE */}
              <div className="mt-2.5 flex-1 min-h-0 flex flex-col justify-start rounded-lg border border-xeoo-border overflow-x-auto">
                {pagedPopularPages.length === 0 ? (
                  <div className="my-auto py-12 text-center text-xs text-xeoo-muted">
                    No page views recorded for this filter.
                  </div>
                ) : (
                  <table className="w-full table-fixed min-w-[340px] lg:min-w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-xeoo-surface-soft text-[10px] font-bold uppercase tracking-wider text-xeoo-muted border-b border-xeoo-border">
                        <th className="w-[62%] py-2 px-2.5 border-r border-xeoo-border truncate">
                          Path / Page
                        </th>
                        <th className="w-[20%] py-2 px-2 text-right border-r border-xeoo-border truncate">
                          Pageviews
                        </th>
                        <th className="w-[18%] py-2 px-2 text-right truncate">
                          Share
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-xeoo-border">
                      {pagedPopularPages.map((page, i) => (
                        <tr
                          key={i}
                          className={[
                            "transition-colors",
                            i % 2 === 0
                              ? "bg-xeoo-surface"
                              : "bg-xeoo-surface-soft/60",
                            "hover:bg-xeoo-primary-soft/30",
                          ].join(" ")}
                        >
                          <td className="py-1.5 px-2.5 border-r border-xeoo-border truncate">
                            <div className="min-w-0 truncate">
                              <p className="truncate font-semibold text-xeoo-text leading-tight">
                                {page.page_title || page.path}
                              </p>
                              <p className="truncate font-mono text-[10px] text-xeoo-muted leading-none mt-0.5">
                                {page.path}
                              </p>
                            </div>
                          </td>
                          <td className="py-1.5 px-2 text-right font-bold text-xeoo-text border-r border-xeoo-border truncate">
                            {page.pageviews.toLocaleString("en-US")}
                          </td>
                          <td className="py-1.5 px-2 text-right truncate">
                            <span className="rounded bg-xeoo-surface-soft px-1.5 py-0.5 text-[10px] font-bold text-xeoo-text-soft">
                              {page.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Popular Pages Pagination (Persistent and pinned for height stability) */}
            <div className="mt-auto shrink-0 flex items-center justify-between border-t border-xeoo-border pt-2 text-[11px]">
              <span className="text-xeoo-muted">
                Page <strong>{pagesPage}</strong> of{" "}
                <strong>{totalPagesPages}</strong> (
                {filteredPopularPages.length} pages)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={pagesPage <= 1}
                  onClick={() => setPagesPage((p) => Math.max(1, p - 1))}
                  className="flex h-6 items-center gap-1 rounded-md border border-xeoo-border px-2 text-[10px] font-semibold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={11} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  disabled={pagesPage >= totalPagesPages}
                  onClick={() =>
                    setPagesPage((p) => Math.min(totalPagesPages, p + 1))
                  }
                  className="flex h-6 items-center gap-1 rounded-md border border-xeoo-border px-2 text-[10px] font-semibold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          F. VISITOR DEMOGRAPHICS & G. TRAFFIC SOURCES (FIXED COMPACT HEIGHT - NO SCROLL)
      ============================================================== */}
      {data && (
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
          {/* F1. DEVICES */}
          <div className="flex flex-col justify-between rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs h-[215px]">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center gap-2 border-b border-xeoo-border pb-2 shrink-0">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Laptop size={13} />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-xeoo-text">
                    Visitor Devices
                  </h3>
                  <p className="text-[10px] text-xeoo-muted">
                    Desktop vs mobile distribution
                  </p>
                </div>
              </div>

              <div className="mt-2 flex-1 min-h-0 flex flex-col justify-between space-y-1.5">
                {data.demographics.devices.slice(0, 3).map((dev, i) => {
                  const getDevIcon = (name: string) => {
                    const n = name.toLowerCase();
                    if (n === "mobile") return Smartphone;
                    if (n === "tablet") return Tablet;
                    return Monitor;
                  };
                  const DevIcon = getDevIcon(dev.name);

                  return (
                    <div key={i} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-1.5 text-xeoo-text">
                          <DevIcon size={11} className="text-xeoo-muted" />
                          <span className="capitalize">{dev.name}</span>
                        </div>
                        <span className="text-xeoo-text-soft">
                          {dev.count} ({dev.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-xeoo-surface-soft">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${dev.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* F2. BROWSER & OS */}
          <div className="flex flex-col justify-between rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs h-[215px]">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center gap-2 border-b border-xeoo-border pb-2 shrink-0">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-50 text-purple-600">
                  <Compass size={13} />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-xeoo-text">
                    Browser & OS
                  </h3>
                  <p className="text-[10px] text-xeoo-muted">
                    User platform breakdown
                  </p>
                </div>
              </div>

              <div className="mt-1.5 flex-1 min-h-0 flex flex-col justify-between text-xs">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-xeoo-muted mb-1">
                    Top Browsers
                  </p>
                  <div className="space-y-1">
                    {data.demographics.browsers.slice(0, 2).map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-xeoo-text">
                          {b.name}
                        </span>
                        <span className="font-bold text-xeoo-muted">
                          {b.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="my-1 border-t border-xeoo-border" />

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-xeoo-muted mb-1">
                    Top Operating Systems
                  </p>
                  <div className="space-y-1">
                    {data.demographics.operating_systems
                      .slice(0, 2)
                      .map((os, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-xeoo-text">
                            {os.name}
                          </span>
                          <span className="font-bold text-xeoo-muted">
                            {os.percentage}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* G. TRAFFIC SOURCES & REFERRERS */}
          <div className="flex flex-col justify-between rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs h-[215px]">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex items-center gap-2 border-b border-xeoo-border pb-2 shrink-0">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                  <Globe size={13} />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-xeoo-text">
                    Traffic Sources
                  </h3>
                  <p className="text-[10px] text-xeoo-muted">
                    Visitor acquisition channels
                  </p>
                </div>
              </div>

              <div className="mt-1.5 flex-1 min-h-0 flex flex-col justify-between">
                <div className="space-y-1.5">
                  {data.sources.breakdown.slice(0, 2).map((src, i) => (
                    <div key={i} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-xeoo-text">{src.label}</span>
                        <span className="text-xeoo-text-soft">
                          {src.count} ({src.percentage}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-xeoo-surface-soft">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${src.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {data.sources.top_referrers.length > 0 && (
                  <div className="mt-1">
                    <div className="my-1 border-t border-xeoo-border" />
                    <p className="text-[9px] font-bold uppercase tracking-wider text-xeoo-muted mb-1">
                      Top Referrer Hosts
                    </p>
                    <div className="space-y-1">
                      {data.sources.top_referrers
                        .slice(0, 2)
                        .map((ref, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="truncate font-mono text-xeoo-text-soft">
                              {ref.referrer_host}
                            </span>
                            <span className="font-bold text-xeoo-muted">
                              {ref.count}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          H. RECENT VISIT ACTIVITY (PAGINATED, NO COLUMN, TABLE-FIXED, ZEBRA STYLE - FULL VISIBILITY)
      ============================================================== */}
      {data && (
        <div className="flex flex-col justify-between rounded-xl border border-xeoo-border bg-xeoo-surface p-3 shadow-xs sm:p-3.5 min-h-[570px] lg:h-[570px]">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between border-b border-xeoo-border pb-2.5 shrink-0">
              <div>
                <h2 className="text-xs font-bold text-xeoo-text">
                  Recent Visit Activity
                </h2>
                <p className="text-[10px] text-xeoo-muted">
                  Real-time visit stream with client and referrer details
                </p>
              </div>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Total{" "}
                {data.recent_activity.pagination.total.toLocaleString("en-US")}{" "}
                Logs
              </span>
            </div>

            {/* Table with Zebra striping, table-fixed, clear vertical column borders - ALL 10 ROWS VISIBLE */}
            <div className="mt-2.5 flex-1 min-h-0 flex flex-col justify-start rounded-lg border border-xeoo-border overflow-x-auto">
              {data.recent_activity.items.length === 0 ? (
                <div className="my-auto py-16 text-center text-xs text-xeoo-muted">
                  No recent visit activity found.
                </div>
              ) : (
                <table className="w-full table-fixed min-w-[620px] lg:min-w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-xeoo-surface-soft text-[10px] font-bold uppercase tracking-wider text-xeoo-muted border-b border-xeoo-border">
                      <th className="w-12 py-2 px-2 text-center border-r border-xeoo-border truncate">
                        No
                      </th>
                      <th className="w-[38%] py-2 px-2.5 border-r border-xeoo-border truncate">
                        Page / Route
                      </th>
                      <th className="w-20 py-2 px-2 text-center border-r border-xeoo-border truncate">
                        Type
                      </th>
                      <th className="w-[24%] py-2 px-2.5 border-r border-xeoo-border truncate">
                        Device / Browser
                      </th>
                      <th className="w-[24%] py-2 px-2.5 truncate">
                        Source / Referrer
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-xeoo-border">
                    {data.recent_activity.items.map((act, idx) => {
                      const perPage =
                        data.recent_activity.pagination.per_page || 10;
                      const rowNo =
                        (data.recent_activity.pagination.page - 1) * perPage +
                        idx +
                        1;

                      return (
                        <tr
                          key={act.id}
                          className={[
                            "transition-colors",
                            idx % 2 === 0
                              ? "bg-xeoo-surface"
                              : "bg-xeoo-surface-soft/60",
                            "hover:bg-xeoo-primary-soft/30",
                          ].join(" ")}
                        >
                          {/* Column NO (Strictly numeric, never NaN) */}
                          <td className="whitespace-nowrap py-1.5 px-2 text-center font-mono font-bold text-xeoo-muted border-r border-xeoo-border truncate">
                            {rowNo}
                          </td>

                          {/* Column Page / Route with timestamp */}
                          <td className="py-1.5 px-2.5 border-r border-xeoo-border truncate">
                            <div className="min-w-0 truncate">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="truncate font-semibold text-xeoo-text leading-tight">
                                  {act.page_title}
                                </span>
                                <span className="shrink-0 text-[10px] font-mono text-xeoo-muted">
                                  • {act.time_ago}
                                </span>
                              </div>
                              <p className="truncate font-mono text-[10px] text-xeoo-muted leading-none mt-0.5">
                                {act.path}
                              </p>
                            </div>
                          </td>

                          {/* Column Type */}
                          <td className="whitespace-nowrap py-1.5 px-2 text-center border-r border-xeoo-border truncate">
                            <span
                              className={[
                                "inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                                act.page_type === "tool"
                                  ? "bg-blue-50 text-blue-700"
                                  : act.page_type === "category"
                                    ? "bg-purple-50 text-purple-700"
                                    : "bg-gray-100 text-gray-700",
                              ].join(" ")}
                            >
                              {act.page_type}
                            </span>
                          </td>

                          {/* Column Device / Browser */}
                          <td className="whitespace-nowrap py-1.5 px-2.5 border-r border-xeoo-border truncate">
                            <div className="text-[11px] font-semibold text-xeoo-text truncate leading-tight">
                              <span className="capitalize">
                                {act.device_type}
                              </span>{" "}
                              • {act.browser}
                            </div>
                            <div className="text-[10px] text-xeoo-muted truncate leading-none mt-0.5">
                              {act.os}
                            </div>
                          </td>

                          {/* Column Source / Referrer */}
                          <td className="whitespace-nowrap py-1.5 px-2.5 text-[11px] text-xeoo-text-soft truncate">
                            {act.utm_source ? (
                              <span className="font-mono text-purple-600 truncate">
                                UTM: {act.utm_source}
                              </span>
                            ) : act.referrer_host ? (
                              <span className="truncate font-mono text-[10px] text-xeoo-muted">
                                {act.referrer_host}
                              </span>
                            ) : act.referrer_type &&
                              act.referrer_type !== "direct" ? (
                              <span className="capitalize text-xeoo-muted truncate">
                                {act.referrer_type}
                              </span>
                            ) : (
                              <span className="text-xeoo-muted truncate">
                                Direct
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Activity Pagination Controls (Persistent and pinned for height stability) */}
          <div className="mt-auto shrink-0 flex items-center justify-between border-t border-xeoo-border pt-2 text-[11px]">
            <span className="text-xeoo-muted">
              Page <strong>{data.recent_activity.pagination.page}</strong> of{" "}
              <strong>{data.recent_activity.pagination.total_pages}</strong>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={data.recent_activity.pagination.page <= 1}
                onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                className="flex h-6 items-center gap-1 rounded-md border border-xeoo-border px-2 text-[10px] font-semibold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={11} />
                <span>Prev</span>
              </button>

              <button
                type="button"
                disabled={
                  data.recent_activity.pagination.page >=
                  data.recent_activity.pagination.total_pages
                }
                onClick={() => setActivityPage((p) => p + 1)}
                className="flex h-6 items-center gap-1 rounded-md border border-xeoo-border px-2 text-[10px] font-semibold text-xeoo-text-soft transition hover:bg-xeoo-surface-soft disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
