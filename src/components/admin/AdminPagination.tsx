import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * perPage + 1;

  const endItem = Math.min(currentPage * perPage, totalItems);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-col gap-3 border-t border-xeoo-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-[11px] text-xeoo-muted">
        Showing{" "}
        <span className="font-bold text-xeoo-text">{startItem}</span>–
        <span className="font-bold text-xeoo-text">{endItem}</span> of{" "}
        <span className="font-bold text-xeoo-text">{totalItems}</span> tools
      </p>

      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-text transition hover:bg-xeoo-surface-soft disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={
                page === currentPage
                  ? "flex h-8 min-w-8 items-center justify-center rounded-lg bg-xeoo-primary px-2 text-[11px] font-bold text-white shadow-xs"
                  : "flex h-8 min-w-8 items-center justify-center rounded-lg border border-transparent px-2 text-[11px] font-semibold text-xeoo-muted transition hover:border-xeoo-border hover:bg-xeoo-surface-soft hover:text-xeoo-text"
              }
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-text transition hover:bg-xeoo-surface-soft disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
