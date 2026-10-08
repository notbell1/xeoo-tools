import {
  ArrowUpRight,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Construction,
  Laugh,
  Search,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ToolStatus from "../components/ToolStatus";

import { BACKEND_URL } from "../config/backend";
import { getCategoryIcon, getToolIcon } from "../lib/toolIcons";

type ToolStatusValue = "ready" | "maintenance" | "upcoming";

type Tool = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  status: ToolStatusValue;
  category_name: string;
  category_slug: string;
};

type DatabaseCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  tool_count: number;
};

type ToolsResponse = {
  success: boolean;
  message?: string;
  data?: Tool[];
};

type CategoriesResponse = {
  success: boolean;
  message?: string;
  data?: DatabaseCategory[];
};

type CategoryStyle = {
  border: string;
  icon: string;
  badge: string;
  text: string;
};

const ITEMS_PER_PAGE = 8;

const EMPTY_TOOL_MESSAGES = [
  {
    title: "Well, that is empty.",
    description:
      "The tool you are looking for seems to be pretending it does not exist.",
  },
  {
    title: "Nothing found.",
    description:
      "We searched around, but the result is still nowhere to be found.",
  },
  {
    title: "The tool escaped.",
    description: "It might be avoiding the task you were about to give it.",
  },
  {
    title: "Search result: empty.",
    description: "Even the server seems a little confused by that search.",
  },
  {
    title: "No luck.",
    description: "The keyword looks fine. The tool simply disagreed.",
  },
  {
    title: "The answer is no.",
    description: "Try another search term before blaming the system.",
  },
  {
    title: "Empty space.",
    description: "No matching tool was found. At least the page looks clean.",
  },
  {
    title: "No results here.",
    description: "Do not worry. It may just be the wrong keyword.",
  },
];

function getCategoryStyle(color: string): CategoryStyle {
  switch (color) {
    case "slate":
      return {
        border: "border-slate-200 hover:border-slate-300",
        icon: "border-slate-200 bg-slate-50 text-slate-700",
        badge: "border-slate-200 bg-slate-50 text-slate-700",
        text: "text-slate-700",
      };

    case "gray":
      return {
        border: "border-gray-200 hover:border-gray-300",
        icon: "border-gray-200 bg-gray-50 text-gray-700",
        badge: "border-gray-200 bg-gray-50 text-gray-700",
        text: "text-gray-700",
      };

    case "zinc":
      return {
        border: "border-zinc-200 hover:border-zinc-300",
        icon: "border-zinc-200 bg-zinc-50 text-zinc-700",
        badge: "border-zinc-200 bg-zinc-50 text-zinc-700",
        text: "text-zinc-700",
      };

    case "neutral":
      return {
        border: "border-neutral-200 hover:border-neutral-300",
        icon: "border-neutral-200 bg-neutral-50 text-neutral-700",
        badge: "border-neutral-200 bg-neutral-50 text-neutral-700",
        text: "text-neutral-700",
      };

    case "stone":
      return {
        border: "border-stone-200 hover:border-stone-300",
        icon: "border-stone-200 bg-stone-50 text-stone-700",
        badge: "border-stone-200 bg-stone-50 text-stone-700",
        text: "text-stone-700",
      };

    case "red":
      return {
        border: "border-red-200 hover:border-red-300",
        icon: "border-red-200 bg-red-50 text-red-700",
        badge: "border-red-200 bg-red-50 text-red-700",
        text: "text-red-700",
      };

    case "orange":
      return {
        border: "border-orange-200 hover:border-orange-300",
        icon: "border-orange-200 bg-orange-50 text-orange-700",
        badge: "border-orange-200 bg-orange-50 text-orange-700",
        text: "text-orange-700",
      };

    case "amber":
      return {
        border: "border-amber-200 hover:border-amber-300",
        icon: "border-amber-200 bg-amber-50 text-amber-700",
        badge: "border-amber-200 bg-amber-50 text-amber-700",
        text: "text-amber-700",
      };

    case "yellow":
      return {
        border: "border-yellow-200 hover:border-yellow-300",
        icon: "border-yellow-200 bg-yellow-50 text-yellow-700",
        badge: "border-yellow-200 bg-yellow-50 text-yellow-700",
        text: "text-yellow-700",
      };

    case "lime":
      return {
        border: "border-lime-200 hover:border-lime-300",
        icon: "border-lime-200 bg-lime-50 text-lime-700",
        badge: "border-lime-200 bg-lime-50 text-lime-700",
        text: "text-lime-700",
      };

    case "green":
      return {
        border: "border-green-200 hover:border-green-300",
        icon: "border-green-200 bg-green-50 text-green-700",
        badge: "border-green-200 bg-green-50 text-green-700",
        text: "text-green-700",
      };

    case "emerald":
      return {
        border: "border-emerald-200 hover:border-emerald-300",
        icon: "border-emerald-200 bg-emerald-50 text-emerald-700",
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
        text: "text-emerald-700",
      };

    case "teal":
      return {
        border: "border-teal-200 hover:border-teal-300",
        icon: "border-teal-200 bg-teal-50 text-teal-700",
        badge: "border-teal-200 bg-teal-50 text-teal-700",
        text: "text-teal-700",
      };

    case "cyan":
      return {
        border: "border-cyan-200 hover:border-cyan-300",
        icon: "border-cyan-200 bg-cyan-50 text-cyan-700",
        badge: "border-cyan-200 bg-cyan-50 text-cyan-700",
        text: "text-cyan-700",
      };

    case "sky":
      return {
        border: "border-sky-200 hover:border-sky-300",
        icon: "border-sky-200 bg-sky-50 text-sky-700",
        badge: "border-sky-200 bg-sky-50 text-sky-700",
        text: "text-sky-700",
      };

    case "blue":
      return {
        border: "border-blue-200 hover:border-blue-300",
        icon: "border-blue-200 bg-blue-50 text-blue-700",
        badge: "border-blue-200 bg-blue-50 text-blue-700",
        text: "text-blue-700",
      };

    case "indigo":
      return {
        border: "border-indigo-200 hover:border-indigo-300",
        icon: "border-indigo-200 bg-indigo-50 text-indigo-700",
        badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
        text: "text-indigo-700",
      };

    case "violet":
      return {
        border: "border-violet-200 hover:border-violet-300",
        icon: "border-violet-200 bg-violet-50 text-violet-700",
        badge: "border-violet-200 bg-violet-50 text-violet-700",
        text: "text-violet-700",
      };

    case "purple":
      return {
        border: "border-purple-200 hover:border-purple-300",
        icon: "border-purple-200 bg-purple-50 text-purple-700",
        badge: "border-purple-200 bg-purple-50 text-purple-700",
        text: "text-purple-700",
      };

    case "fuchsia":
      return {
        border: "border-fuchsia-200 hover:border-fuchsia-300",
        icon: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
        badge: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
        text: "text-fuchsia-700",
      };

    case "pink":
      return {
        border: "border-pink-200 hover:border-pink-300",
        icon: "border-pink-200 bg-pink-50 text-pink-700",
        badge: "border-pink-200 bg-pink-50 text-pink-700",
        text: "text-pink-700",
      };

    case "rose":
      return {
        border: "border-rose-200 hover:border-rose-300",
        icon: "border-rose-200 bg-rose-50 text-rose-700",
        badge: "border-rose-200 bg-rose-50 text-rose-700",
        text: "text-rose-700",
      };

    default:
      return {
        border: "border-xeoo-border hover:border-xeoo-primary/30",
        icon: "border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted",
        badge: "border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted",
        text: "text-xeoo-text",
      };
  }
}

function normalizeCategoryName(name: string) {
  return name.replace(/\s+Tools$/i, "").trim();
}

export default function Tools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categoriesData, setCategoriesData] = useState<DatabaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        // --- INSTANT LOAD DARI CACHE ---
        const cachedTools = localStorage.getItem("xeoo_tools_cache");
        const cachedCategories = localStorage.getItem("xeoo_categories_cache");

        if (cachedTools && cachedCategories) {
          setTools(JSON.parse(cachedTools));
          setCategoriesData(JSON.parse(cachedCategories));
          setLoading(false);
        } else {
          setLoading(true);
        }

        setError("");

        // --- FETCH DATA TERBARU  ---
        const [toolsResponse, categoriesResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/tools.php?_=${Date.now()}`, {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: { Accept: "application/json" },
          }),
          fetch(`${BACKEND_URL}/api/categories.php?_=${Date.now()}`, {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: { Accept: "application/json" },
          }),
        ]);

        if (!toolsResponse.ok) {
          throw new Error(`Failed to load tools. HTTP ${toolsResponse.status}`);
        }

        if (!categoriesResponse.ok) {
          throw new Error(
            `Failed to load categories. HTTP ${categoriesResponse.status}`,
          );
        }

        const toolsResult = (await toolsResponse.json()) as ToolsResponse;
        const categoriesResult =
          (await categoriesResponse.json()) as CategoriesResponse;

        if (!toolsResult.success) {
          throw new Error(toolsResult.message || "Failed to load tools.");
        }

        if (!categoriesResult.success) {
          throw new Error(
            categoriesResult.message || "Failed to load categories.",
          );
        }

        if (active) {
          const freshTools = toolsResult.data ?? [];
          const freshCategories = categoriesResult.data ?? [];

          setTools(freshTools);
          setCategoriesData(freshCategories);

          // Update cache
          localStorage.setItem("xeoo_tools_cache", JSON.stringify(freshTools));
          localStorage.setItem(
            "xeoo_categories_cache",
            JSON.stringify(freshCategories),
          );
        }
      } catch (err) {
        if (!active) return;

        const hasCache = localStorage.getItem("xeoo_tools_cache") !== null;
        if (!hasCache) {
          setError(
            err instanceof Error ? err.message : "Failed to load tools.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const categoryMap = useMemo(() => {
    const map = new Map<string, DatabaseCategory>();
    for (const item of categoriesData) {
      map.set(item.slug, item);
    }
    return map;
  }, [categoriesData]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const tool of tools) {
      if (!map.has(tool.category_slug)) {
        const databaseCategory = categoryMap.get(tool.category_slug);
        map.set(
          tool.category_slug,
          databaseCategory?.name ?? tool.category_name,
        );
      }
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [tools, categoryMap]);

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();

    const statusOrder: Record<string, number> = {
      ready: 0,
      upcoming: 1,
      maintenance: 2,
    };

    return tools
      .filter((tool) => {
        const matchesSearch =
          !query ||
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.category_name.toLowerCase().includes(query);

        const matchesCategory =
          category === "all" || tool.category_slug === category;

        return matchesSearch && matchesCategory;
      })
      .sort(
        (a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99),
      );
  }, [tools, search, category]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTools.length / ITEMS_PER_PAGE),
  );

  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTools.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTools, currentPage]);

  const pageStart =
    filteredTools.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredTools.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function handleCategorySelect(value: string) {
    setCategory(value);
    setCategoryOpen(false);
  }

  const selectedCategoryData =
    category === "all" ? null : categoryMap.get(category);

  const selectedCategoryName =
    category === "all"
      ? "All categories"
      : normalizeCategoryName(
          selectedCategoryData?.name ??
            categories.find(([slug]) => slug === category)?.[1] ??
            "All categories",
        );

  const selectedCategoryCount =
    category === "all"
      ? tools.length
      : tools.filter((tool) => tool.category_slug === category).length;

  const emptyToolMessage = useMemo(() => {
    return EMPTY_TOOL_MESSAGES[
      Math.floor(Math.random() * EMPTY_TOOL_MESSAGES.length)
    ];
  }, [search, category]);

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-text lg:h-screen lg:overflow-hidden">
      <Header />

      <main className="min-h-0 flex-1">
        <div className="mx-auto flex max-w-7xl flex-col px-4 py-5 sm:px-6 lg:h-full lg:px-8">
          <section className="shrink-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <h1 className="mt-1 text-2xl font-black tracking-tight text-xeoo-text sm:text-3xl">
                  All Tools
                </h1>

                <p className="mt-1.5 text-[11px] leading-5 text-xeoo-muted sm:text-xs">
                  Find tools by name or category. Ready tools are available now,
                  while maintenance tools are being worked on.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-4 shrink-0">
            <div className="grid gap-1.5 sm:grid-cols-[minmax(0,1fr)_210px]">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xeoo-muted"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search tools..."
                  className="h-9 w-full rounded-lg border border-xeoo-border bg-xeoo-surface pl-8 pr-3 text-sm text-xeoo-text outline-none transition-colors placeholder:text-xeoo-muted focus:border-xeoo-primary"
                />
              </div>

              <div ref={categoryRef} className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((open) => !open)}
                  className={[
                    "flex h-9 w-full items-center justify-between rounded-lg border",
                    "bg-xeoo-surface px-3",
                    "text-left transition-all",
                    categoryOpen
                      ? "border-xeoo-primary shadow-sm"
                      : "border-xeoo-border hover:border-xeoo-border-dark",
                  ].join(" ")}
                  aria-haspopup="listbox"
                  aria-expanded={categoryOpen}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {selectedCategoryData ? (
                      (() => {
                        const CategoryIcon = getCategoryIcon(
                          selectedCategoryData.icon,
                        );

                        const style = getCategoryStyle(
                          selectedCategoryData.color,
                        );

                        return (
                          <span
                            className={[
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                              style.icon,
                            ].join(" ")}
                          >
                            <CategoryIcon size={12} strokeWidth={1.9} />
                          </span>
                        );
                      })()
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted">
                        <Wrench size={12} strokeWidth={1.9} />
                      </span>
                    )}

                    <span className="truncate text-sm font-semibold text-xeoo-text">
                      {selectedCategoryName}
                    </span>

                    <span className="shrink-0 rounded-full bg-xeoo-surface-soft px-1.5 py-0.5 text-xs font-bold text-xeoo-muted">
                      {selectedCategoryCount}
                    </span>
                  </span>

                  <ChevronDown
                    size={14}
                    className={[
                      "shrink-0 text-xeoo-muted transition-transform",
                      categoryOpen ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {categoryOpen && (
                  <div
                    className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface shadow-xl shadow-black/10"
                    role="listbox"
                  >
                    <div className="max-h-64 overflow-y-auto p-1.5">
                      <button
                        type="button"
                        role="option"
                        aria-selected={category === "all"}
                        onClick={() => handleCategorySelect("all")}
                        className={[
                          "flex w-full items-center justify-between rounded-lg px-2.5 py-2",
                          "text-left transition-colors",
                          category === "all"
                            ? "bg-xeoo-text text-xeoo-surface"
                            : "text-xeoo-text hover:bg-xeoo-surface-soft",
                        ].join(" ")}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={[
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                              category === "all"
                                ? "border-xeoo-surface/15 bg-xeoo-surface/10"
                                : "border-xeoo-border bg-xeoo-surface-soft",
                            ].join(" ")}
                          >
                            <Wrench size={12} strokeWidth={1.9} />
                          </span>

                          <span className="truncate text-sm font-semibold">
                            All categories
                          </span>
                        </span>

                        <span
                          className={[
                            "rounded-full px-1.5 py-0.5 text-xs font-bold",
                            category === "all"
                              ? "bg-xeoo-surface/15 text-xeoo-surface"
                              : "bg-xeoo-surface-soft text-xeoo-muted",
                          ].join(" ")}
                        >
                          {tools.length}
                        </span>
                      </button>

                      {categories.map(([slug, name]) => {
                        const active = category === slug;

                        const count = tools.filter(
                          (tool) => tool.category_slug === slug,
                        ).length;

                        const databaseCategory = categoryMap.get(slug);

                        const CategoryIcon = getCategoryIcon(
                          databaseCategory?.icon ?? "",
                        );

                        const style = getCategoryStyle(
                          databaseCategory?.color ?? "",
                        );

                        const displayName = normalizeCategoryName(
                          databaseCategory?.name ?? name,
                        );

                        return (
                          <button
                            key={slug}
                            type="button"
                            role="option"
                            aria-selected={active}
                            onClick={() => handleCategorySelect(slug)}
                            className={[
                              "mt-0.5 flex w-full items-center justify-between rounded-lg px-2.5 py-2",
                              "text-left transition-colors",
                              active
                                ? "bg-xeoo-text text-xeoo-surface"
                                : "text-xeoo-text hover:bg-xeoo-surface-soft",
                            ].join(" ")}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <span
                                className={[
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                                  active
                                    ? "border-xeoo-surface/15 bg-xeoo-surface/10 text-xeoo-surface"
                                    : style.icon,
                                ].join(" ")}
                              >
                                <CategoryIcon size={12} strokeWidth={1.9} />
                              </span>

                              <span className="min-w-0 truncate text-sm font-medium">
                                {displayName}
                              </span>
                            </span>

                            <span
                              className={[
                                "shrink-0 rounded-full px-1.5 py-0.5 text-xs font-bold",
                                active
                                  ? "bg-xeoo-surface/15 text-xeoo-surface"
                                  : "bg-xeoo-surface-soft text-xeoo-muted",
                              ].join(" ")}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-3 min-h-0 flex-1">
            {loading ? (
              <div className="rounded-xl border border-xeoo-border bg-xeoo-surface px-4 py-8 text-center">
                <p className="text-xs text-xeoo-muted">Loading tools...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center">
                <p className="text-xs font-medium text-red-700">{error}</p>
              </div>
            ) : filteredTools.length === 0 ? (
              <div className="relative overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface px-4 py-10 text-center">
                <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full bg-xeoo-primary-soft/40 blur-3xl" />

                <div className="relative">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-xeoo-border bg-xeoo-surface-soft shadow-sm">
                    <Laugh
                      size={26}
                      strokeWidth={1.8}
                      className="text-xeoo-muted"
                    />
                  </div>

                  <p className="mt-4 text-base font-bold tracking-tight text-xeoo-text">
                    {emptyToolMessage.title}
                  </p>

                  <p className="mx-auto mt-1.5 max-w-md text-sm leading-5 text-xeoo-muted">
                    {emptyToolMessage.description}
                  </p>

                  <div className="mx-auto mt-4 inline-flex rounded-full border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-xs font-semibold text-xeoo-muted">
                    {search
                      ? `Search: "${search}"`
                      : category !== "all"
                        ? "This category is currently quiet."
                        : "There are no tools to show yet."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-col lg:h-full">
                <div className="grid grid-cols-1 content-start gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {paginatedTools.map((tool) => {
                    const Icon = getToolIcon(tool.icon);

                    const isReady = tool.status === "ready";
                    const isUpcoming = tool.status === "upcoming";

                    const databaseCategory = categoryMap.get(
                      tool.category_slug,
                    );

                    const categoryStyle = getCategoryStyle(
                      databaseCategory?.color ?? "",
                    );

                    const CategoryIcon = getCategoryIcon(
                      databaseCategory?.icon ?? "",
                    );

                    const displayCategoryName = normalizeCategoryName(
                      databaseCategory?.name ?? tool.category_name,
                    );

                    return (
                      <article
                        key={tool.id}
                        className={[
                          "group relative flex min-w-0 flex-col overflow-hidden rounded-xl border",
                          "bg-xeoo-surface p-3.5",
                          "transition-all duration-200",
                          isReady
                            ? [
                                "border-xeoo-border",
                                "hover:-translate-y-0.5",
                                "hover:border-xeoo-primary/30",
                                "hover:shadow-md",
                              ].join(" ")
                            : isUpcoming
                              ? [
                                  "border-sky-300/80",
                                  "bg-linear-to-br from-white via-sky-50/30 to-blue-50/50 dark:from-slate-900 dark:via-sky-950/20 dark:to-slate-900",
                                ].join(" ")
                              : [
                                  "border-amber-300/80",
                                  "bg-linear-to-br from-white via-amber-50/30 to-orange-50/50 dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-900",
                                ].join(" "),
                        ].join(" ")}
                      >
                        {!isReady && (
                          <ToolStatus
                            status={tool.status}
                            name={tool.name}
                            variant="ribbon"
                          />
                        )}

                        <div className="flex min-h-10 items-center gap-2.5 pr-7">
                          <div
                            className={[
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                              categoryStyle.icon,
                            ].join(" ")}
                          >
                            <Icon size={15} strokeWidth={1.9} />
                          </div>

                          <div className="min-w-0">
                            <h2 className="truncate text-sm font-bold leading-5 text-xeoo-text">
                              {tool.name}
                            </h2>
                          </div>
                        </div>

                        <div className="mt-2 min-h-8">
                          <p className="line-clamp-2 text-[12px] leading-4 text-xeoo-muted">
                            {tool.description}
                          </p>
                        </div>

                        <div className="mt-2.5 border-t border-xeoo-border pt-2.5">
                          <div className="flex h-7 items-center justify-between gap-2">
                            <span
                              className={[
                                "flex min-w-0 max-w-[65%] items-center gap-1.5 truncate rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
                                categoryStyle.badge,
                              ].join(" ")}
                            >
                              <CategoryIcon
                                size={10}
                                strokeWidth={1.9}
                                className="shrink-0"
                              />

                              <span className="truncate">
                                {displayCategoryName}
                              </span>
                            </span>

                            {isReady ? (
                              <Link
                                to={`/tools/${encodeURIComponent(tool.slug)}`}
                                className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-xeoo-text bg-xeoo-text px-2.5 text-[9px] font-bold text-xeoo-surface transition-colors hover:bg-xeoo-text-soft"
                              >
                                Open
                                <ArrowUpRight size={10} />
                              </Link>
                            ) : isUpcoming ? (
                              <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-sky-300 bg-sky-100 dark:border-sky-800 dark:bg-sky-950 px-2.5 text-[9px] font-bold uppercase tracking-wide text-sky-800 dark:text-sky-300">
                                <CalendarClock size={9} />
                                Soon
                              </span>
                            ) : (
                              <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-amber-300 bg-amber-100 dark:border-amber-800 dark:bg-amber-950 px-2.5 text-[9px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                                <Construction size={9} />
                                Hold
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="mt-auto flex flex-col gap-2.5 border-t border-xeoo-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-xeoo-muted">
                    Showing{" "}
                    <span className="font-semibold text-xeoo-text">
                      {pageStart}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold text-xeoo-text">
                      {pageEnd}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-xeoo-text">
                      {filteredTools.length}
                    </span>{" "}
                    tools
                  </p>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCurrentPage((page) => page - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:border-xeoo-primary/30 hover:text-xeoo-primary disabled:pointer-events-none disabled:opacity-40"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      {Array.from(
                        {
                          length: totalPages,
                        },
                        (_, index) => index + 1,
                      ).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          aria-label={`Go to page ${page}`}
                          aria-current={
                            currentPage === page ? "page" : undefined
                          }
                          className={[
                            "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2.5 text-[11px] font-semibold transition",
                            currentPage === page
                              ? "border-xeoo-primary bg-xeoo-primary text-white"
                              : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-primary/30 hover:text-xeoo-primary",
                          ].join(" ")}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setCurrentPage((page) => page + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:border-xeoo-primary/30 hover:text-xeoo-primary disabled:pointer-events-none disabled:opacity-40"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
