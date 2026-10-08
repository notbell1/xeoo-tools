const socials = [
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4.5 w-4.5"
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
    href: "#",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4.5 w-4.5"
        aria-hidden="true"
      >
        <path d="M13.4 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.5V3.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V10H7.5v3h2.7v8h3.2Z" />
      </svg>
    ),
  },

  {
    name: "YouTube",
    href: "#",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4.5 w-4.5"
        aria-hidden="true"
      >
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.8V8.2l6.4 3.8-6.4 3.8Z" />
      </svg>
    ),
  },

  {
    name: "Telegram",
    href: "#",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4.5 w-4.5"
        aria-hidden="true"
      >
        <path d="m21.7 3.2-3.2 15.1c-.2 1.1-.8 1.4-1.6.9l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.8.4l.3-4.6 8.4-7.6c.4-.4-.1-.6-.6-.2l-10.4 6.5-4.5-1.4c-1-.3-1-1 .2-1.5L20.3 2c.9-.3 1.7.2 1.4 1.2Z" />
      </svg>
    ),
  },

  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4.5 w-4.5"
        aria-hidden="true"
      >
        <path d="M6.5 8.3H3.2V21h3.3V8.3ZM4.8 3A2 2 0 1 0 4.8 7a2 2 0 0 0 0-4ZM21 13.7c0-3.8-2-5.6-4.8-5.6-2.2 0-3.2 1.2-3.8 2v-1.8H9.1V21h3.3v-6.3c0-1.7.3-3.4 2.5-3.4 2.1 0 2.1 2 2.1 3.5V21h3.3l-.3-7.3Z" />
      </svg>
    ),
  },
];

function Footer() {
  return (
    <footer
      id="footer"
      className="mt-auto border-t border-xeoo-border bg-xeoo-surface"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Copyright */}
          <p className="text-center text-xs text-xeoo-muted sm:text-left sm:text-sm">
            © {new Date().getFullYear()} XeooTools. All rights reserved.
          </p>

          {/* Social */}
          <div className="flex items-center gap-2">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                aria-label={social.name}
                title={social.name}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition hover:border-xeoo-border-dark hover:bg-xeoo-surface-soft hover:text-xeoo-text"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
