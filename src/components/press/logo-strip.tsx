import { Section } from "@/components/ui/section";

const PRESS_LOGOS = [
  { name: "Forbes", placeholder: "Forbes" },
  { name: "NYT", placeholder: "The New York Times" },
  { name: "Conde Nast Traveler", placeholder: "Conde Nast Traveler" },
  { name: "Wallpaper", placeholder: "Wallpaper*" },
  { name: "Monocle", placeholder: "Monocle" },
];

export function LogoStrip() {
  return (
    <Section className="border-y border-border py-12">
      <p className="mb-8 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
        As seen in
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
        {PRESS_LOGOS.map((logo) => (
          <span
            key={logo.name}
            className="font-serif text-lg font-light text-muted-foreground transition-colors hover:text-foreground md:text-xl"
          >
            {logo.placeholder}
          </span>
        ))}
      </div>
    </Section>
  );
}
