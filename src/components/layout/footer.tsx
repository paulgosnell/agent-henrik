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

          {/* Contact */}
          <div>
            <h4 className="nav-text mb-4 text-foreground">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Henrik Tidefjard</p>
              <p>Founder & Creative Director</p>
              <p>
                <a href="tel:+46703872264" className="transition-colors hover:text-foreground">
                  +46 (0)70 38 722 64
                </a>
              </p>
              <p>
                <a href="mailto:henrik@agenthenrik.com" className="transition-colors hover:text-foreground">
                  henrik@agenthenrik.com
                </a>
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="text-sm text-foreground underline underline-offset-4 transition-opacity hover:opacity-80"
                >
                  Start Your Journey
                </Link>
              </div>
              <div className="flex items-center gap-4 pt-3">
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
            </div>
          </div>

          {/* Extras */}
          <div>
            <h4 className="nav-text mb-4 text-foreground">Stay Inspired</h4>
            <div className="flex items-center gap-4 mb-4">
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
            <div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:justify-between">
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <div className="flex gap-4">
            {FOOTER_COLUMNS.legal.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
