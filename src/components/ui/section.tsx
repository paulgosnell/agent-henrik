import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  fullWidth?: boolean;
}

export function Section({ children, className = "", id, fullWidth = false }: SectionProps) {
  return (
    <section id={id} className={`section-padding ${className}`}>
      <div className={fullWidth ? "" : "mx-auto max-w-[1200px] px-6 md:px-12"}>
        {children}
      </div>
    </section>
  );
}
