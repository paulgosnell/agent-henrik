import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface CTAButtonProps {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
  showArrow?: boolean;
  className?: string;
}

export function CTAButton({
  href,
  children,
  variant = "primary",
  showArrow = true,
  className = "",
}: CTAButtonProps) {
  const base =
    "inline-flex items-center gap-2 nav-text px-6 py-3 transition-all duration-400 cursor-pointer";
  const variants = {
    primary:
      "bg-foreground text-background hover:opacity-90",
    outline:
      "border border-foreground text-foreground hover:bg-foreground hover:text-background",
  };

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
      {showArrow && <ArrowRight size={14} />}
    </Link>
  );
}
