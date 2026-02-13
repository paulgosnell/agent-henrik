import Link from "next/link";
import { Instagram, Youtube, Linkedin } from "lucide-react";
import { FOOTER_COLUMNS, SOCIAL_LINKS, SITE_NAME } from "@/lib/constants";
import { ThemeToggle } from "./theme-toggle";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-12">
        {/* Column Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Explore */}
          <div>
            <h4 className="nav-text mb-4 text-foreground">Explore</h4>
            <ul className="space-y-2">
              {FOOTER_COLUMNS.explore.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="nav-text mb-4 text-foreground">About</h4>
            <ul className="space-y-2">
              {FOOTER_COLUMNS.about.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="nav-text mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2">
              {FOOTER_COLUMNS.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Extras */}
          <div>
            <h4 className="nav-text mb-4 text-foreground">Connect</h4>
            <div className="flex items-center gap-4">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Instagram size={18} />
              </a>
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Youtube size={18} />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Linkedin size={18} />
              </a>
            </div>
            <div className="mt-4">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
