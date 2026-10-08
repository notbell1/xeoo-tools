import React from "react";

export type SocialItem = {
  name: string;
  href: string;
  hoverColorClass: string;
  icon: (iconClassName?: string) => React.ReactNode;
};

export const SOCIAL_LINKS: SocialItem[] = [
  {
    name: "GitHub",
    href: "https://github.com/notbell1",
    hoverColorClass:
      "hover:text-xeoo-text hover:border-xeoo-text/40 hover:bg-xeoo-text/5",
    icon: (cls = "h-4.5 w-4.5") => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cls}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
        />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/_ntbbll",
    hoverColorClass:
      "hover:text-[#E4405F] hover:border-[#E4405F]/40 hover:bg-[#E4405F]/5",
    icon: (cls = "h-4.5 w-4.5") => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cls}
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/Zx.Marchia/",
    hoverColorClass:
      "hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5",
    icon: (cls = "h-4.5 w-4.5") => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cls}
        aria-hidden="true"
      >
        <path d="M13.4 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.5V3.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V10H7.5v3h2.7v8h3.2Z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    href: "https://t.me/bellxss",
    hoverColorClass:
      "hover:text-[#0088CC] hover:border-[#0088CC]/40 hover:bg-[#0088CC]/5",
    icon: (cls = "h-4.5 w-4.5") => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cls}
        aria-hidden="true"
      >
        <path d="m21.7 3.2-3.2 15.1c-.2 1.1-.8 1.4-1.6.9l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.8.4l.3-4.6 8.4-7.6c.4-.4-.1-.6-.6-.2l-10.4 6.5-4.5-1.4c-1-.3-1-1 .2-1.5L20.3 2c.9-.3 1.7.2 1.4 1.2Z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/abbel",
    hoverColorClass:
      "hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/5",
    icon: (cls = "h-4.5 w-4.5") => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={cls}
        aria-hidden="true"
      >
        <path d="M6.5 8.3H3.2V21h3.3V8.3ZM4.8 3A2 2 0 1 0 4.8 7a2 2 0 0 0 0-4ZM21 13.7c0-3.8-2-5.6-4.8-5.6-2.2 0-3.2 1.2-3.8 2v-1.8H9.1V21h3.3v-6.3c0-1.7.3-3.4 2.5-3.4 2.1 0 2.1 2 2.1 3.5V21h3.3l-.3-7.3Z" />
      </svg>
    ),
  },
  {
    name: "Email",
    href: "mailto:abbelkadafi@gmail.com",
    hoverColorClass:
      "hover:text-[#EA4335] hover:border-[#EA4335]/40 hover:bg-[#EA4335]/5",
    icon: (cls = "h-4.5 w-4.5") => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cls}
        aria-hidden="true"
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
];

type SocialLinksProps = {
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
};

export default function SocialLinks({
  className = "flex items-center gap-2",
  itemClassName = "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition-all duration-200 hover:scale-105 shadow-xs hover:shadow-md",
  iconClassName = "h-4.5 w-4.5 sm:h-5 sm:w-5 transition-colors",
}: SocialLinksProps) {
  return (
    <div className={className}>
      {SOCIAL_LINKS.map((social) => {
        const isExternal = !social.href.startsWith("mailto:");

        return (
          <a
            key={social.name}
            href={social.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            aria-label={social.name}
            title={social.name}
            className={`${itemClassName} ${social.hoverColorClass}`}
          >
            {social.icon(iconClassName)}
          </a>
        );
      })}
    </div>
  );
}

