"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";

type NavState = "pinned" | "show" | "hidden";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navState, setNavState] = useState<NavState>("pinned");
  const lastScrollYRef = useRef(0);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const closeMenuOnNav = useCallback(() => {
    setMenuOpen(false);
    setNavState("hidden");
    lastScrollYRef.current = window.scrollY;
  }, []);

  useEffect(() => {
    const heroEl = document.getElementById("hero");
    let heroVisible = false;

    const updateFromScroll = () => {
      const current = window.scrollY;
      const last = lastScrollYRef.current;

      if (heroVisible) {
        setNavState("pinned");
      } else if (current > last && current > 80) {
        setNavState("hidden");
      } else {
        setNavState("show");
      }

      lastScrollYRef.current = current;
    };

    if (heroEl) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          heroVisible = entry.isIntersecting;
          if (heroVisible) {
            setNavState("pinned");
          } else {
            setNavState("show");
          }
        },
        { threshold: 0.05 }
      );
      observer.observe(heroEl);
      window.addEventListener("scroll", updateFromScroll, { passive: true });
      updateFromScroll();

      return () => {
        observer.disconnect();
        window.removeEventListener("scroll", updateFromScroll);
      };
    } else {
      setNavState("show");
      window.addEventListener("scroll", updateFromScroll, { passive: true });
      return () => window.removeEventListener("scroll", updateFromScroll);
    }
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", onKey);
    document.body.classList.add("nav-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("nav-open");
    };
  }, [menuOpen, closeMenu]);

  const isCompact = navState !== "pinned";

  return (
    <>
      {/* Background bar */}
      <header className={`nav-header ${navState}`} aria-hidden="true" />

      {/* Logo */}
      <Link
        href="/"
        className={`site-logo${isCompact ? " compact" : ""}`}
        onClick={menuOpen ? closeMenu : undefined}
      >
        <img
          src="/logo.png"
          alt="Agent Henrik"
          className="site-logo-img"
        />
      </Link>

      {/* MENU / CLOSE button */}
      <button
        className={`menu-toggle${menuOpen ? " is-open" : ""}${isCompact ? " compact" : ""}`}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? "CLOSE" : "MENU"}
      </button>

      {/* Full-screen nav overlay */}
      <nav className={`nav-menu${menuOpen ? " open" : ""}`} aria-hidden={!menuOpen}>
        <div className="nav-main">
          <ul className="nav-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="nav-link" onClick={closeMenuOnNav}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
