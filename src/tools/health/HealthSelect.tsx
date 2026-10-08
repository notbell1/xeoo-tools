import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface HealthSelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  badge?: string;
}

interface HealthSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: HealthSelectOption<T>[];
  id?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export default function HealthSelect<T extends string = string>({
  value,
  onChange,
  options,
  id,
  label,
  disabled = false,
  className = "",
  placeholder = "Select an option",
}: HealthSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const autoId = useId();
  const selectId = id || autoId;

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Scroll focused option into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll("li");
      const target = items[focusedIndex];
      if (target) {
        target.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex, isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen) {
          if (focusedIndex >= 0 && focusedIndex < options.length) {
            onChange(options[focusedIndex].value);
            setIsOpen(false);
          }
        } else {
          setIsOpen(true);
          const idx = options.findIndex((opt) => opt.value === value);
          setFocusedIndex(idx >= 0 ? idx : 0);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.length - 1);
        } else {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;

      case "Escape":
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
        }
        break;

      case "Tab":
        if (isOpen) {
          setIsOpen(false);
        }
        break;

      default:
        break;
    }
  };

  const handleSelect = (optValue: T) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full text-left ${className}`}
    >
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1 block text-xs font-medium text-xeoo-text"
        >
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            const idx = options.findIndex((opt) => opt.value === value);
            setFocusedIndex(idx >= 0 ? idx : 0);
          }
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-xeoo-bg px-2.5 py-1.5 text-xs text-xeoo-text transition-colors outline-none ${
          disabled
            ? "cursor-not-allowed opacity-50 border-xeoo-border"
            : isOpen
              ? "border-xeoo-primary ring-1 ring-xeoo-primary/30"
              : "border-xeoo-border hover:border-xeoo-border-dark focus:border-xeoo-primary"
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-xeoo-muted transition-transform duration-200 ${
            isOpen ? "rotate-180 text-xeoo-primary" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <ul
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={selectId}
          className="absolute left-0 right-0 z-50 mt-1 max-h-56 w-full min-w-0 overflow-y-auto rounded-lg border border-xeoo-border bg-xeoo-surface p-1 shadow-lg backdrop-blur-xs outline-none animate-in fade-in zoom-in-95 duration-100"
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isFocused = idx === focusedIndex;

            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setFocusedIndex(idx)}
                className={`flex cursor-pointer items-start justify-between gap-2 rounded-md px-2 py-1.5 text-xs transition-colors ${
                  isSelected
                    ? "bg-xeoo-primary/10 text-xeoo-primary font-semibold"
                    : isFocused
                      ? "bg-xeoo-surface-soft text-xeoo-text"
                      : "text-xeoo-text-soft hover:bg-xeoo-surface-soft hover:text-xeoo-text"
                }`}
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && (
                      <span className="rounded bg-xeoo-surface-soft px-1 py-0.2 text-[9px] font-mono text-xeoo-muted">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  {opt.description && (
                    <span className="text-[10px] text-xeoo-muted line-clamp-1">
                      {opt.description}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-xeoo-primary mt-0.5" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

