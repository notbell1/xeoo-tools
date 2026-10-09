import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  Construction,
  Laugh,
  LoaderCircle,
  SearchX,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { Link, useParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ToolStatus from "../components/ToolStatus";

import { BACKEND_URL } from "../config/backend";
import { categories as fallbackCategories } from "../data/categories";
import { getCategoryStyle } from "../lib/categoryStyles";
import { getToolIcon } from "../lib/toolIcons";

import { useTools } from "../hooks/useTools";

type DatabaseCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  tool_count: number;
};

type CategoriesResponse = {
  success: boolean;
  message?: string;
  data?: DatabaseCategory[];
};

const ITEMS_PER_PAGE = 8;

const EMPTY_CATEGORY_MESSAGES = [
  {
    title: "Well, that's quiet.",
    description:
      "This category seems to be taking a break from having any tools.",
  },
  {
    title: "Empty. Completely empty.",
    description:
      "We checked every corner of the database. Still, there's nothing hanging around.",
  },
  {
    title: "The tools haven't arrived yet.",
    description:
      "Maybe they're still on the way. Or maybe they're just feeling lazy.",
  },
  {
    title: "This category is unemployed.",
    description: "Not a single tool has volunteered to take a job here yet.",
  },
  {
    title: "It's very quiet here.",
    description:
      "Even the database doesn't know what it's supposed to display.",
  },
  {
    title: "Only hope is present.",
    description:
      "Unfortunately, the tools haven't shown up in this category yet.",
  },
  {
    title: "No victims of clicking yet.",
    description: "There are no tools here for you to put to work just yet.",
  },
  {
    title: "This category is currently empty.",
    description: "Maybe wait a little, but don't get your hopes up too much.",
  },
];

export default function Category() {
  const { slug = "" } = useParams<{
    slug: string;
  }>();

  const { tools, loading, error } = useTools();

  const [categories, setCategories] = useState<DatabaseCategory[]>([]);

  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        setCategoriesLoading(true);

        const response = await fetch(
          `${BACKEND_URL}/api/categories.php?_=${Date.now()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const result = (await response.json()) as CategoriesResponse;

        if (!result.success) {
          throw new Error(result.message || "Failed to load categories.");
        }

        if (active) {
          setCategories(result.data ?? []);
        }
      } catch (err) {
        console.error("Category load error:", err);

        if (active) {
          setCategories([]);
        }
      } finally {
        if (active) {
          setCategoriesLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const category = useMemo(() => {
    const found =
      categories.find((item) => item.slug === slug) ||
      (slug === "psychology-tools"
        ? categories.find((item) => item.slug === "psychology")
        : undefined) ||
      (slug === "psychology"
        ? categories.find((item) => item.slug === "psychology-tools")
        : undefined) ||
      (slug === "ai-tools"
        ? categories.find((item) => item.slug === "ai")
        : undefined) ||
      (slug === "ai"
        ? categories.find((item) => item.slug === "ai-tools")
        : undefined) ||
      (slug === "design-tools"
        ? categories.find((item) => item.slug === "design")
        : undefined) ||
      (slug === "design"
        ? categories.find((item) => item.slug === "design-tools")
        : undefined);

    if (found) return found;

    const fallback =
      fallbackCategories.find((item) => item.slug === slug) ||
      (slug === "ai-tools"
        ? fallbackCategories.find((item) => item.slug === "ai")
        : undefined) ||
      (slug === "ai"
        ? fallbackCategories.find((item) => item.slug === "ai-tools")
        : undefined) ||
      (slug === "design-tools"
        ? fallbackCategories.find((item) => item.slug === "design")
        : undefined) ||
      (slug === "design"
        ? fallbackCategories.find((item) => item.slug === "design-tools")
        : undefined) ||
      (slug === "psychology-tools"
        ? fallbackCategories.find((item) => item.slug === "psychology")
        : undefined) ||
      (slug === "psychology"
        ? fallbackCategories.find((item) => item.slug === "psychology-tools")
        : undefined);

    if (fallback) {
      return {
        id: fallback.slug === "design" ? 17 : 16,
        name: fallback.name,
        slug: fallback.slug,
        description: fallback.description,
        icon: fallback.slug === "design" ? "palette" : "sparkles",
        color: fallback.slug === "design" ? "fuchsia" : "sky",
        tool_count: fallback.count,
      };
    }

    return undefined;
  }, [categories, slug]);

  const categoryTools = useMemo(() => {
    return tools.filter((tool) => {
      if (tool.category_slug === slug) return true;
      if (
        (slug === "psychology-tools" || slug === "psychology") &&
        (tool.category_slug === "psychology-tools" ||
          tool.category_slug === "psychology")
      ) {
        return true;
      }
      if (
        (slug === "ai" || slug === "ai-tools") &&
        (tool.category_slug === "ai" || tool.category_slug === "ai-tools")
      ) {
        return true;
      }
      if (
        (slug === "design" || slug === "design-tools") &&
        (tool.category_slug === "design" || tool.category_slug === "design-tools")
      ) {
        return true;
      }
      return false;
    });
  }, [tools, slug]);

  const totalPages = Math.max(
    1,
    Math.ceil(categoryTools.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [slug]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return categoryTools.slice(start, start + ITEMS_PER_PAGE);
  }, [categoryTools, currentPage]);

  const pageStart =
    categoryTools.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, categoryTools.length);

  const emptyCategoryMessage = useMemo(() => {
    const index =
      Math.abs(slug.length + categoryTools.length) %
      EMPTY_CATEGORY_MESSAGES.length;

    return EMPTY_CATEGORY_MESSAGES[index];
  }, [slug, categoryTools.length]);

  const categoryStyle = getCategoryStyle(slug);

  if (categoriesLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
        <Header />

        <main className="flex flex-1 items-center justify-center px-4">
          <div className="flex items-center gap-2.5 text-sm text-xeoo-muted">
            <LoaderCircle size={17} className="animate-spin" />
            Loading categories...
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
        <Header />

        <main className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-xeoo-border bg-xeoo-surface-soft text-xeoo-muted">
            <SearchX size={27} strokeWidth={1.8} />
          </div>

          <h1 className="mt-4 text-xl font-bold">Category not found</h1>

          <p className="mt-1.5 text-sm text-xeoo-muted">
            Category not available.
          </p>

          <Link
            to="/categories"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-xeoo-text bg-xeoo-text px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-xeoo-black hover:shadow-md"
          >
            <ArrowLeft size={15} />
            All categories
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  const CategoryIcon = getToolIcon(category.icon || "wrench");

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 rounded-lg border border-xeoo-border bg-xeoo-surface px-3 py-2 text-xs font-semibold text-xeoo-text shadow-sm transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft"
        >
          <ArrowLeft size={14} />
          All categories
        </Link>

        {/* Category header */}
        <section className="mt-5">
          <div className="flex items-center gap-3">
            <div
              className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                categoryStyle.icon,
              ].join(" ")}
            >
              <CategoryIcon size={20} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-xeoo-text sm:text-2xl">
                {category.name}
              </h1>

              <p className="mt-0.5 line-clamp-2 max-w-2xl text-xs leading-5 text-xeoo-muted">
                {category.description ||
                  "Explore the tools available in this category."}
              </p>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section className="mt-7">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-base font-bold text-xeoo-text">Tools</h2>

            <span
              className={[
                "rounded-full border px-2 py-0.5",
                "text-[10px] font-bold",
                categoryStyle.badge,
              ].join(" ")}
            >
              {categoryTools.length}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center rounded-xl border border-xeoo-border bg-xeoo-surface">
              <div className="flex items-center gap-2.5 text-sm text-xeoo-muted">
                <LoaderCircle size={17} className="animate-spin" />
                Loading tools...
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-xeoo-danger/20 bg-xeoo-danger-soft px-5 py-8 text-center">
              <h2 className="text-sm font-semibold text-xeoo-danger">
                Failed to load tools
              </h2>

              <p className="mt-1 text-xs text-xeoo-danger/80">{error}</p>
            </div>
          ) : categoryTools.length === 0 ? (
            <div className="relative overflow-hidden rounded-xl border border-xeoo-border bg-xeoo-surface px-5 py-10 text-center">
              <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full bg-xeoo-primary-soft/40 blur-3xl" />

              <div className="relative">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-xeoo-border bg-xeoo-surface-soft">
                  <Laugh
                    size={23}
                    strokeWidth={1.8}
                    className="text-xeoo-muted"
                  />
                </div>

                <h2 className="mt-3 text-sm font-bold text-xeoo-text">
                  {emptyCategoryMessage.title}
                </h2>

                <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-xeoo-muted">
                  {emptyCategoryMessage.description}
                </p>

                <span className="mt-3 inline-flex rounded-full border border-xeoo-border bg-xeoo-surface-soft px-3 py-1.5 text-[10px] font-semibold text-xeoo-muted">
                  {category.name} • 0 tools
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Tool grid */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {paginatedTools.map((tool) => {
                  const Icon = getToolIcon(tool.icon);

                  const isReady = tool.status === "ready";
                  const isUpcoming = tool.status === "upcoming";

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
                      {tool.status !== "ready" && (
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
                          <h3 className="truncate text-sm font-bold leading-5 text-xeoo-text">
                            {tool.name}
                          </h3>
                        </div>
                      </div>

                      <div className="mt-2 min-h-8">
                        <p className="line-clamp-2 text-[12px] leading-4 text-xeoo-text-muted">
                          {tool.description}
                        </p>
                      </div>

                      <div className="mt-2.5 border-t border-xeoo-border pt-2.5">
                        <div className="flex h-7 items-center justify-between gap-2">
                          <span
                            className={[
                              "min-w-0 truncate rounded-full border px-2 py-0.5",
                              "text-[9px] font-semibold uppercase tracking-wide",
                              categoryStyle.badge,
                            ].join(" ")}
                          >
                            {tool.category_name}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-3 border-t border-xeoo-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] text-xeoo-muted">
                    {pageStart}–{pageEnd} dari {categoryTools.length} tools
                  </p>

                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-text-muted transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Prev page"
                    >
                      <ArrowLeft size={13} />
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
                        className={[
                          "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-bold transition",
                          page === currentPage
                            ? "border-xeoo-text bg-xeoo-text text-white"
                            : "border-xeoo-border bg-xeoo-surface text-xeoo-muted hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text",
                        ].join(" ")}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-text-muted transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Next page"
                    >
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
