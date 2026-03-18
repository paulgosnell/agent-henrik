"use client";

interface PageContentProps {
  html: string;
}

export function PageContent({ html }: PageContentProps) {
  return (
    <div
      className="page-content space-y-4 text-sm leading-relaxed text-muted-foreground [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-light [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:font-serif [&_h3]:text-lg [&_h3]:font-light [&_h3]:text-foreground [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_p+p]:mt-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
