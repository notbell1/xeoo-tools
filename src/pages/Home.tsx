import { motion, useReducedMotion } from "motion/react";

import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Construction,
  Search,
  Wrench,
} from "lucide-react";

import { Link } from "react-router-dom";

import Header from "../components/Header";

import Footer from "../components/Footer";

import SocialLinks from "../components/SocialLinks";

import ToolStatus from "../components/ToolStatus";

import { BACKEND_URL } from "../config/backend";

import { getCategoryIcon, getToolIcon } from "../lib/toolIcons";

import { getCategoryStyle } from "../lib/categoryStyles";

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

const HERO_EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: HERO_EASE,
    },
  },
};

const heroStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

function CategoryTypewriter({
  categories,
  reducedMotion,
}: {
  categories: DatabaseCategory[];
  reducedMotion: boolean;
}) {
  const phrases = useMemo(() => {
    if (categories.length > 0) {
      return categories.map((category) => category.name);
    }

    return ["Math Tools"];
  }, [categories]);

  const [phraseIndex, setPhraseIndex] = useState(0);

  const [displayText, setDisplayText] = useState(phrases[0] ?? "");

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (phrases.length === 0) {
      return;
    }

    setPhraseIndex((current) => Math.min(current, phrases.length - 1));
  }, [phrases]);

  useEffect(() => {
    if (phrases.length === 0) {
      return;
    }

    const target = phrases[phraseIndex % phrases.length] ?? "";

    if (reducedMotion) {
      setDisplayText(target);
      setIsDeleting(false);
      return;
    }

    let timeoutId: number;

    if (!isDeleting && displayText === target) {
      timeoutId = window.setTimeout(() => {
        setIsDeleting(true);
      }, 1450);
    } else if (isDeleting && displayText === "") {
      timeoutId = window.setTimeout(() => {
        setIsDeleting(false);

        setPhraseIndex((current) => (current + 1) % phrases.length);
      }, 260);
    } else {
      timeoutId = window.setTimeout(
        () => {
          const nextLength = isDeleting
            ? Math.max(displayText.length - 1, 0)
            : Math.min(displayText.length + 1, target.length);

          setDisplayText(target.slice(0, nextLength));
        },
        isDeleting ? 32 : 55,
      );
    }

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [displayText, isDeleting, phraseIndex, phrases, reducedMotion]);

  return (
    <span className="flex min-h-[1.2em] w-full items-center justify-center">
      <span className="block w-[22ch] max-w-full text-center text-[0.92em] font-bold leading-[1.2] sm:w-[28ch]">
        <span className="bg-linear-to-r from-xeoo-primary via-indigo-500 to-sky-500 bg-clip-text text-transparent">
          {displayText}
        </span>
      </span>
    </span>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState<DatabaseCategory[]>([]);

  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const { tools: liveTools } = useTools();

  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = "smooth";

    return () => {
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

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
          throw new Error(result.message || "Gagal memuat kategori.");
        }

        if (active) {
          setCategories(result.data ?? []);
        }
      } catch (error) {
        console.error("Home categories error:", error);

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

  const homeCategories = useMemo(() => {
    return categories.slice(0, 4);
  }, [categories]);

  const filteredHomeTools = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const statusOrder: Record<string, number> = {
      ready: 0,
      upcoming: 1,
      maintenance: 2,
    };

    const filtered =
      keyword === ""
        ? liveTools
        : liveTools.filter((tool) => {
            return (
              tool.name.toLowerCase().includes(keyword) ||
              tool.description.toLowerCase().includes(keyword) ||
              tool.category_name.toLowerCase().includes(keyword) ||
              tool.category_slug.toLowerCase().includes(keyword)
            );
          });

    return [...filtered]
      .sort(
        (a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99),
      )
      .slice(0, 4);
  }, [liveTools, search]);

  const readyToolCount = useMemo(() => {
    return liveTools.filter((tool) => tool.status === "ready").length;
  }, [liveTools]);

  const maintenanceToolCount = useMemo(() => {
    return liveTools.filter((tool) => tool.status === "maintenance").length;
  }, [liveTools]);

  const upcomingToolCount = useMemo(() => {
    return liveTools.filter((tool) => tool.status === "upcoming").length;
  }, [liveTools]);

  const totalCategoryTools = useMemo(() => {
    return categories.reduce(
      (total, category) => total + category.tool_count,
      0,
    );
  }, [categories]);

  const handleSearchJump = () => {
    document.getElementById("tools")?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const heroTransition = reducedMotion ? { duration: 0 } : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-xeoo-bg text-xeoo-text">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section
          id="home"
          className="relative isolate min-h-dvh overflow-hidden border-b border-xeoo-border bg-xeoo-surface"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-xeoo-primary-soft/60 blur-3xl"
              animate={
                reducedMotion
                  ? undefined
                  : {
                      x: [0, 18, 0],
                      y: [0, 12, 0],
                      scale: [1, 1.05, 1],
                    }
              }
              transition={
                reducedMotion
                  ? heroTransition
                  : {
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            />

            <motion.div
              aria-hidden="true"
              className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-xeoo-accent-soft/50 blur-3xl"
              animate={
                reducedMotion
                  ? undefined
                  : {
                      x: [0, -14, 0],
                      y: [0, -10, 0],
                      scale: [1, 1.04, 1],
                    }
              }
              transition={
                reducedMotion
                  ? heroTransition
                  : {
                      duration: 12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />
          </div>

          <div className="relative mx-auto flex min-h-dvh max-w-7xl items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <motion.div
              className="mx-auto w-full max-w-3xl text-center"
              variants={heroStagger}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={fadeUp}
                className="mb-5 flex justify-center"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-xeoo-border bg-xeoo-surface/90 px-3 py-1.5 text-[10px] font-bold text-xeoo-text-soft shadow-sm backdrop-blur sm:text-xs">
                  Simple tools for everyday work
                </div>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mx-auto max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-xeoo-text sm:text-5xl lg:text-6xl"
              >
                <span className="block">Make everyday tasks</span>

                <span className="mt-2 block">easier with</span>

                <span className="mt-2 block w-full">
                  <CategoryTypewriter
                    categories={categories}
                    reducedMotion={Boolean(reducedMotion)}
                  />
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-xeoo-text-soft sm:text-base"
              >
                XeooTools is a collection of simple online tools for
                calculations, images, networking, security, coding, SEO and
                everyday tasks.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mx-auto mt-7 max-w-xl sm:mt-8"
              >
                <motion.div
                  whileHover={
                    reducedMotion
                      ? undefined
                      : {
                          y: -1,
                        }
                  }
                  transition={{
                    duration: 0.2,
                    ease: HERO_EASE,
                  }}
                  className="group flex items-center gap-2 rounded-2xl border border-xeoo-border bg-xeoo-surface p-2 shadow-sm transition-shadow duration-200 focus-within:border-xeoo-primary/40 focus-within:shadow-md"
                >
                  <Search
                    size={18}
                    className="ml-2 shrink-0 text-xeoo-muted transition-colors duration-200 group-focus-within:text-xeoo-primary"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSearchJump();
                      }
                    }}
                    placeholder="Search tools..."
                    aria-label="Search tools"
                    className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-xeoo-text outline-none placeholder:text-xeoo-muted"
                  />

                  <button
                    type="button"
                    onClick={handleSearchJump}
                    className="hidden shrink-0 rounded-xl bg-xeoo-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-xeoo-black sm:block"
                  >
                    Search
                  </button>
                </motion.div>

                <div className="mt-2.5 flex justify-center">
                  <span className="text-[10px] text-xeoo-muted">
                    Press Enter to explore tools
                  </span>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-xeoo-muted sm:mt-7 sm:text-sm"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-xeoo-success" />
                  Free to use
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-xeoo-success" />
                  Simple interface
                </span>

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-xeoo-success" />
                  Mobile friendly
                </span>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex justify-center sm:mt-10"
              >
                <button
                  type="button"
                  onClick={handleSearchJump}
                  className="group inline-flex items-center gap-2 rounded-full border border-xeoo-border bg-xeoo-surface/80 px-3 py-2 text-[10px] font-semibold text-xeoo-muted shadow-sm backdrop-blur transition hover:border-xeoo-primary/30 hover:text-xeoo-primary sm:text-xs"
                >
                  Explore tools
                  <ArrowRight
                    size={12}
                    className="transition-transform duration-200 group-hover:translate-y-0.5"
                  />
                </button>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mt-5 flex justify-center"
              >
                <SocialLinks
                  className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
                  itemClassName="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-xeoo-border bg-xeoo-surface/90 text-xeoo-muted transition-all duration-200 hover:scale-110 hover:bg-xeoo-surface-soft shadow-xs hover:shadow-md"
                  iconClassName="h-4.5 w-4.5 sm:h-5 sm:w-5 transition-colors"
                />
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xeoo-muted sm:flex"
            animate={
              reducedMotion
                ? undefined
                : {
                    y: [0, 5, 0],
                    opacity: [0.45, 0.8, 0.45],
                  }
            }
            transition={
              reducedMotion
                ? heroTransition
                : {
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
            }
          >
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
              Scroll
            </span>

            <ArrowRight size={12} className="rotate-90" />
          </motion.div>
        </section>

        {/* CATEGORIES */}
        <section
          id="categories"
          className="mx-auto max-w-7xl scroll-mt-20 px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-xeoo-primary">
                Categories
              </p>

              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-xeoo-text sm:text-3xl">
                Find the right tool
              </h2>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-xeoo-muted">
                Browse tools by category and discover utilities built for
                different everyday needs.
              </p>
            </div>

            <Link
              to="/categories"
              className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-xeoo-text-soft transition hover:text-xeoo-primary"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-2xl border border-xeoo-border bg-xeoo-surface p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-10 w-10 rounded-xl bg-xeoo-surface-soft" />

                    <div className="h-5 w-16 rounded-full bg-xeoo-surface-soft" />
                  </div>

                  <div className="mt-3 h-4 w-24 rounded bg-xeoo-surface-soft" />

                  <div className="mt-2 h-3 w-full rounded bg-xeoo-surface-soft" />

                  <div className="mt-1.5 h-3 w-2/3 rounded bg-xeoo-surface-soft" />

                  <div className="mt-3 h-3 w-20 rounded bg-xeoo-surface-soft" />
                </div>
              ))}
            </div>
          ) : homeCategories.length > 0 ? (
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {homeCategories.map((category) => {
                const Icon = getCategoryIcon(category.icon);
                const style = getCategoryStyle(category.slug);

                return (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    className={[
                      "group relative min-w-0 rounded-2xl border",
                      "bg-xeoo-surface p-4",
                      "shadow-sm transition-all duration-200",
                      "hover:-translate-y-0.5 hover:shadow-md",
                      style.border,
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className={[
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                          style.icon,
                        ].join(" ")}
                      >
                        <Icon size={19} strokeWidth={1.8} />
                      </div>

                      <span
                        className={[
                          "shrink-0 rounded-full border px-2 py-1",
                          "text-[10px] font-bold leading-none",
                          style.badge,
                        ].join(" ")}
                      >
                        {category.tool_count} tools
                      </span>
                    </div>

                    <h3
                      className={[
                        "mt-3 truncate text-sm font-bold",
                        style.text,
                      ].join(" ")}
                    >
                      {category.name}
                    </h3>

                    <p className="mt-1.5 line-clamp-2 min-h-8 text-xs leading-4.5 text-xeoo-muted">
                      {category.description ||
                        "Explore available tools within this category."}
                    </p>

                    <div
                      className={[
                        "mt-3 flex items-center gap-1 text-xs font-bold",
                        style.text,
                      ].join(" ")}
                    >
                      View category
                      <ArrowRight
                        size={13}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-7 rounded-2xl border border-xeoo-border bg-xeoo-surface px-6 py-10 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-xeoo-surface-soft text-xeoo-muted">
                <Wrench size={21} strokeWidth={1.8} />
              </div>

              <h3 className="mt-3 text-sm font-bold text-xeoo-text">
                No categories available
              </h3>

              <p className="mt-1.5 text-xs text-xeoo-muted">
                Categories are currently not available in the database.
              </p>
            </div>
          )}
        </section>

        {/* FEATURED TOOLS */}
        <section
          id="tools"
          className="scroll-mt-20 border-y border-xeoo-border bg-xeoo-surface"
        >
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-xeoo-primary">
                  Featured Tools
                </p>

                <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-xeoo-text sm:text-3xl">
                  Start using a tool
                </h2>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-xeoo-muted">
                  Explore some of the tools currently available in XeooTools.
                </p>
              </div>

              <Link
                to="/tools"
                className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-xeoo-text-soft transition hover:text-xeoo-primary"
              >
                View all
                <ArrowRight size={14} />
              </Link>
            </div>

            {filteredHomeTools.length > 0 ? (
              <div className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                {filteredHomeTools.map((tool) => {
                  const Icon = getToolIcon(tool.icon);
                  const isReady = tool.status === "ready";
                  const isUpcoming = tool.status === "upcoming";
                  const categoryStyle = getCategoryStyle(tool.category_slug);

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
                              "min-w-0 truncate rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
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
            ) : (
              <div className="mt-7 rounded-xl border border-xeoo-border bg-xeoo-bg px-6 py-10 text-center">
                <Search size={24} className="mx-auto text-xeoo-muted" />

                <h3 className="mt-4 text-base font-semibold text-xeoo-text">
                  No tools found
                </h3>

                <p className="mt-1 text-sm text-xeoo-muted">
                  Try another keyword.
                </p>

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 rounded-lg bg-xeoo-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-xeoo-primary-hover"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-xeoo-dark px-6 py-9 sm:px-8 sm:py-10 lg:px-10 lg:py-11">
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-xeoo-primary/15 blur-3xl"
              animate={
                reducedMotion
                  ? undefined
                  : {
                      x: [0, -10, 0],
                      y: [0, 10, 0],
                      scale: [1, 1.04, 1],
                    }
              }
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      duration: 12,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            />

            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl"
              animate={
                reducedMotion
                  ? undefined
                  : {
                      x: [0, 10, 0],
                      y: [0, -8, 0],
                    }
              }
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      duration: 14,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            />

            <div className="relative">
              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                    About XeooTools
                  </p>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    Everything you need,
                    <br className="hidden sm:block" />
                    <span className="text-white/55">
                      {" "}
                      in one simple toolbox.
                    </span>
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-[15px]">
                    XeooTools is a growing collection of practical online
                    utilities designed to help with everyday tasks without
                    unnecessary complexity. From calculations and image
                    processing to networking, security, coding, SEO and more.
                  </p>

                  <p className="mt-3 max-w-xl text-xs leading-5 text-white/40">
                    Everything is organized into focused categories so you can
                    quickly find the right utility for the task at hand.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-white/55">
                      Simple interface
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-white/55">
                      Fast access
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-white/55">
                      Mobile friendly
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-white/55">
                      Growing library
                    </span>
                  </div>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      to="/tools"
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-xeoo-dark transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100"
                    >
                      Explore all tools
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </Link>

                    <Link
                      to="/categories"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/9"
                    >
                      Browse categories
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-2xl border border-white/10 bg-white/4.5 p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/35">
                      Categories
                    </p>

                    <p className="mt-2 text-2xl font-black tracking-tight text-white">
                      {categories.length}
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-white/40">
                      Categories available
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/4.5 p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/35">
                      Total tools
                    </p>

                    <p className="mt-2 text-2xl font-black tracking-tight text-white">
                      {liveTools.length}
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-white/40">
                      Tools currently listed
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/4.5 p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/35">
                      Ready now
                    </p>

                    <p className="mt-2 text-2xl font-black tracking-tight text-emerald-400">
                      {readyToolCount}
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-white/40">
                      Available to use
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/4.5 p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/35">
                      In progress
                    </p>

                    <p className="mt-2 text-2xl font-black tracking-tight text-amber-300">
                      {maintenanceToolCount + upcomingToolCount}
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-white/40">
                      Maintenance or upcoming
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                      Current library
                    </p>

                    <p className="mt-2 text-xs leading-5 text-white/55">
                      {totalCategoryTools} tools are represented across the
                      current category structure.
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                      What you can do
                    </p>

                    <p className="mt-2 text-xs leading-5 text-white/55">
                      Calculate, generate, inspect, optimize and work with
                      practical utilities from one place.
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                      What comes next
                    </p>

                    <p className="mt-2 text-xs leading-5 text-white/55">
                      More categories, more tools, smoother workflows and
                      continuous interface improvements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] font-medium text-white/35">
                  XeooTools · Simple tools for everyday work
                </p>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-300 transition-colors hover:text-white"
                >
                  Have feedback or a tool idea?
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
