import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Wrench } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { BACKEND_URL } from "../config/backend";
import { categories as defaultCategoryList } from "../data/categories";
import { getCategoryIcon } from "../lib/toolIcons";

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

type CategoryStyle = {
  border: string;
  icon: string;
  badge: string;
  text: string;
};

const ITEMS_PER_PAGE = 8;

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

export default function Categories() {
  const [categories, setCategories] = useState<DatabaseCategory[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        setLoading(true);
        setError("");

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
          throw new Error(`Failed to load categories. HTTP ${response.status}`);
        }

        const result = (await response.json()) as CategoriesResponse;

        if (!result.success) {
          throw new Error(result.message || "Failed to load categories.");
        }

        const rawCategories = result.data ?? [];
        const liveSlugs = new Set(rawCategories.map((c) => c.slug));
        const missingFromDefaults: DatabaseCategory[] = defaultCategoryList
          .filter(
            (c) =>
              !liveSlugs.has(c.slug) &&
              !liveSlugs.has(`${c.slug}-tools`) &&
              !liveSlugs.has(c.slug.replace(/-tools$/, "")),
          )
          .map((c, index) => ({
            id: 500 + index,
            name: c.name,
            slug: c.slug,
            description: c.description,
            icon: c.slug === "ai" ? "sparkles" : "wrench",
            color: c.slug === "ai" ? "sky" : "slate",
            tool_count: c.count,
          }));

        if (active) {
          setCategories([...rawCategories, ...missingFromDefaults]);
          setCurrentPage(1);
        }
      } catch (err) {
        if (!active) {
          return;
        }

        const fallbackList: DatabaseCategory[] = defaultCategoryList.map(
          (c, index) => ({
            id: 500 + index,
            name: c.name,
            slug: c.slug,
            description: c.description,
            icon: c.slug === "ai" ? "sparkles" : "wrench",
            color: c.slug === "ai" ? "sky" : "slate",
            tool_count: c.count,
          }),
        );
        setCategories(fallbackList);
        setError("");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(categories.length / ITEMS_PER_PAGE));

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return categories.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [categories, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex min-h-dvh flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8">
          <section className="mb-4">
            <h1 className="mt-1 text-2xl font-black tracking-tight text-xeoo-text sm:text-3xl">
              Categories
            </h1>

            <p className="mt-1 max-w-2xl text-[13px] leading-5 text-xeoo-muted">
              Explore all tool categories available in XeooTools.
            </p>
          </section>

          {loading ? (
            <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-xeoo-border bg-xeoo-surface p-3.5"
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-xeoo-surface-soft" />

                    <div className="h-5 w-16 rounded-full bg-xeoo-surface-soft" />
                  </div>

                  <div className="mt-2.5 h-4 w-24 rounded bg-xeoo-surface-soft" />

                  <div className="mt-1.5 h-3 w-full rounded bg-xeoo-surface-soft" />

                  <div className="mt-1 h-3 w-2/3 rounded bg-xeoo-surface-soft" />

                  <div className="mt-2.5 h-3 w-20 rounded bg-xeoo-surface-soft" />
                </div>
              ))}
            </section>
          ) : error ? (
            <section className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
              <p className="text-[13px] font-semibold text-red-700">{error}</p>
            </section>
          ) : categories.length === 0 ? (
            <section className="rounded-2xl border border-xeoo-border bg-xeoo-surface px-5 py-8 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-xeoo-surface-soft text-xeoo-muted">
                <Wrench size={20} strokeWidth={1.8} />
              </div>

              <h2 className="mt-2.5 text-sm font-bold text-xeoo-text">
                No categories available
              </h2>

              <p className="mt-1 text-xs text-xeoo-muted">
                There are no categories available in the database yet.
              </p>
            </section>
          ) : (
            <section className="flex min-h-0 flex-1 flex-col">
              <div className="grid content-start grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedCategories.map((category) => {
                  const Icon = getCategoryIcon(category.icon);

                  const style = getCategoryStyle(category.color);

                  const displayName = category.name
                    .replace(/\s+Tools$/i, "")
                    .trim();

                  return (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className={[
                        "group relative min-w-0 rounded-2xl border",
                        "bg-xeoo-surface p-3.5",
                        "shadow-sm transition-all duration-200",
                        "hover:-translate-y-0.5 hover:shadow-md",
                        style.border,
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div
                          className={[
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                            style.icon,
                          ].join(" ")}
                        >
                          <Icon size={17} strokeWidth={1.8} />
                        </div>

                        <span
                          className={[
                            "shrink-0 rounded-full border px-2 py-1",
                            "text-[9px] font-bold leading-none",
                            style.badge,
                          ].join(" ")}
                        >
                          {category.tool_count} tools
                        </span>
                      </div>

                      <h2
                        className={[
                          "mt-2.5 truncate text-sm font-bold",
                          style.text,
                        ].join(" ")}
                      >
                        {displayName}
                      </h2>

                      <p className="mt-1 line-clamp-2 min-h-8 text-[12px] leading-4 text-xeoo-muted">
                        {category.description ||
                          "Explore the tools available in this category."}
                      </p>

                      <div
                        className={[
                          "mt-2.5 text-[11px] font-bold",
                          style.text,
                        ].join(" ")}
                      >
                        View category →
                      </div>
                    </Link>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-auto pt-4">
                  <div className="flex flex-col gap-2.5 border-t border-xeoo-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[11px] text-xeoo-muted">
                      Showing{" "}
                      <span className="font-semibold text-xeoo-text">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold text-xeoo-text">
                        {Math.min(
                          currentPage * ITEMS_PER_PAGE,
                          categories.length,
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-xeoo-text">
                        {categories.length}
                      </span>{" "}
                      categories
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:border-xeoo-primary/30 hover:text-xeoo-primary disabled:pointer-events-none disabled:opacity-40"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1,
                      ).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => handlePageChange(page)}
                          aria-label={`Go to page ${page}`}
                          aria-current={
                            currentPage === page ? "page" : undefined
                          }
                          className={[
                            "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-[11px] font-semibold transition",
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
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:border-xeoo-primary/30 hover:text-xeoo-primary disabled:pointer-events-none disabled:opacity-40"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
