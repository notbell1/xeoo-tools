import SocialLinks from "./SocialLinks";

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
          <SocialLinks
            className="flex flex-wrap items-center justify-center gap-2"
            itemClassName="flex h-9 w-9 items-center justify-center rounded-lg border border-xeoo-border bg-xeoo-surface text-xeoo-muted transition-all duration-200 hover:scale-105 hover:bg-xeoo-surface-soft shadow-xs"
            iconClassName="h-4.5 w-4.5 transition-colors"
          />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
