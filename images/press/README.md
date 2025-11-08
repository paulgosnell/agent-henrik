# Press Logo Images

This directory contains press publication logos for the Agent Henrik press section.

## Required Logo Files

Place the following SVG logo files in this directory:

1. `nyt-logo.svg` - New York Times logo
2. `forbes-logo.svg` - Forbes logo
3. `conde-nast-logo.svg` - Condé Nast Traveler logo
4. `wallpaper-logo.svg` - Wallpaper* magazine logo
5. `monocle-logo.svg` - Monocle logo
6. `guardian-logo.svg` - The Guardian logo

## Logo Specifications

- **Format**: SVG (preferred) or PNG with transparent background
- **Color**: Logos will be filtered to grayscale in CSS and inverted on hover
- **Size**: Original size (will be scaled via CSS)
- **Naming**: Use lowercase with hyphens (e.g., `nyt-logo.svg`)

## Usage

These logos appear in two places:
1. **Homepage Press Strip** - After the hero section
2. **Press Page** - In press cards linked to articles

## CSS Filters Applied

```css
.press-logo {
    filter: grayscale(100%) invert(1) brightness(0.6);
    opacity: 0.7;
}

.press-logo:hover {
    filter: grayscale(0%) invert(0) brightness(1);
    opacity: 1;
}
```

## Placeholder

Until you add the actual logo files, the images will show as broken image icons. This is expected and will be resolved once you upload the logos.
