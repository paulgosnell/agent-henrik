-- ==========================================
-- Initialize Static Content for Inline Editor
-- Luxury Travel Sweden
-- ==========================================
--
-- This script populates the static_content table with default values
-- for all editable elements in the website.
--
-- Run this in Supabase SQL Editor to set up initial content.
-- Use ON CONFLICT DO NOTHING to avoid overwriting existing values.
-- ==========================================

-- Hero Section
INSERT INTO static_content (key, value, section, description) VALUES
  ('hero.headline.line1', 'Sweden, Composed For You', 'hero', 'Hero headline - first line'),
  ('hero.headline.line2', 'Curated by Insiders', 'hero', 'Hero headline - second line'),
  ('hero.cta.explore', 'START EXPLORE', 'hero', 'Explore button text'),
  ('hero.cta.design', 'DESIGN MY JOURNEY WITH LIV', 'hero', 'Design journey button text'),
  ('hero.cta.enter', 'ENTER THE EXPERIENCE', 'hero', 'Enter experience button text')
ON CONFLICT (key) DO NOTHING;

-- Map/Destinations Section
INSERT INTO static_content (key, value, section, description) VALUES
  ('map.eyebrow', 'Explore Sweden & Beyond', 'map', 'Map section label'),
  ('map.headline', 'Tap a destination to discover your journey', 'map', 'Map section headline'),
  ('map.description', 'Tap a destination to explore a region, city, place or hidden gem. Whether you're drawn to Stockholm's history, Lapland's auroras, or the archipelago's private islands, each pin opens the gateway to your journey with help of LIV.', 'map', 'Map section description')
ON CONFLICT (key) DO NOTHING;

-- Six Pillars Section
INSERT INTO static_content (key, value, section, description) VALUES
  ('pillars.eyebrow', 'Experiences', 'pillars', 'Pillars section label'),
  ('pillars.headline', 'Six pillars to compose your narrative.', 'pillars', 'Pillars section headline'),
  ('pillars.description', 'For discerning travelers who want more than a holiday — who want to step into Sweden's soul. Our journeys are cinematic narratives, curated with exclusive access, emotional storytelling, and ultra-luxury comfort.', 'pillars', 'Pillars section description')
ON CONFLICT (key) DO NOTHING;

-- Corporate & Incentives Section
INSERT INTO static_content (key, value, section, description) VALUES
  ('corporate.eyebrow', 'Corporate & Incentives', 'corporate', 'Corporate section label'),
  ('corporate.headline', 'Create experiences that move the company culture forward', 'corporate', 'Corporate section headline'),
  ('corporate.description', 'Sweden is not only a destination — it is a stage for creativity, inspiration, and transformation. We design corporate journeys that reward, engage, and inspire through experiences no traditional DMC can offer.', 'corporate', 'Corporate section description')
ON CONFLICT (key) DO NOTHING;

-- Storytellers Section
INSERT INTO static_content (key, value, section, description) VALUES
  ('stories.eyebrow', 'Featured Storytellers', 'stories', 'Storytellers section label'),
  ('stories.headline', 'Experience Sweden Beyond the Ordinary', 'stories', 'Storytellers section headline'),
  ('stories.description', 'Led by local storytellers — from Sami elders and Michelin chefs to artists, designers, and innovators — each encounter offers an authentic glimpse into Swedish life, culture, and creativity. Whether you travel solo or with others, our curated experiences, workshops, and destinations promise meaningful connections and stories that stay with you long after the journey ends.', 'stories', 'Storytellers main description'),
  ('stories.subheadline', 'You need inspiration? Take a peek at our curated selection of storytellers, destinations, workshops, and businesses for eventful, meaningful trips.', 'stories', 'Storytellers secondary headline')
ON CONFLICT (key) DO NOTHING;

-- Concierge Section
INSERT INTO static_content (key, value, section, description) VALUES
  ('concierge.eyebrow', 'CONCIERGE', 'concierge', 'Concierge section label'),
  ('concierge.headline', 'Meet LIV — Luxury Itinerary Visionary.', 'concierge', 'Concierge section headline'),
  ('concierge.description', 'Embedded across the experience, LIV begins your dialogue, sketches the first draft of your itinerary, and invites you to pass the narrative to our human curators for refinement.', 'concierge', 'Concierge section description')
ON CONFLICT (key) DO NOTHING;

-- Journal Section
INSERT INTO static_content (key, value, section, description) VALUES
  ('journal.eyebrow', 'Journal', 'journal', 'Journal section label'),
  ('journal.headline', 'Editorial previews from the Journal.', 'journal', 'Journal section headline'),
  ('journal.description', 'Editorial previews from our latest scoops.', 'journal', 'Journal section description')
ON CONFLICT (key) DO NOTHING;

-- Press & Media Section
INSERT INTO static_content (key, value, section, description) VALUES
  ('press.eyebrow', 'Press & Media', 'press', 'Press section label'),
  ('press.headline', 'What Media Says About Us', 'press', 'Press section headline'),
  ('press.description', 'Our work has been recognized by the world's leading voices in luxury and travel.', 'press', 'Press section description')
ON CONFLICT (key) DO NOTHING;

-- Instagram Section
INSERT INTO static_content (key, value, section, description) VALUES
  ('instagram.eyebrow', 'Follow Our Discoveries', 'instagram', 'Instagram section label'),
  ('instagram.headline', '@LuxuryTravelSweden', 'instagram', 'Instagram section headline'),
  ('instagram.description', 'Follow us on Instagram', 'instagram', 'Instagram section description (note: contains link in HTML)')
ON CONFLICT (key) DO NOTHING;

-- Contact Section
INSERT INTO static_content (key, value, section, description) VALUES
  ('contact.eyebrow', 'CONTACT', 'contact', 'Contact section label'),
  ('contact.headline', 'Ready to create your Swedish adventure?', 'contact', 'Contact section headline'),
  ('contact.description', 'Share your ambitions and we will reply within 24 hours with the next steps, schedule a call, or deliver a curated dossier. Every enquiry is handled by a personal curator, who will design a bespoke narrative just for you.', 'contact', 'Contact section description')
ON CONFLICT (key) DO NOTHING;

-- Footer
INSERT INTO static_content (key, value, section, description) VALUES
  ('footer.newsletter.title', 'Stay Inspired', 'footer', 'Footer newsletter title'),
  ('footer.newsletter.description', 'Join our community and receive exclusive stories, insider tips, and curated experiences from Sweden.', 'footer', 'Footer newsletter description'),
  ('footer.copyright', '© 2025 Luxury Travel Sweden', 'footer', 'Footer copyright text'),
  ('footer.tagline', 'Crafted with passion in Sweden', 'footer', 'Footer tagline')
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- Verify Installation
-- ==========================================

-- Check how many records were inserted
SELECT
  section,
  COUNT(*) as item_count
FROM static_content
GROUP BY section
ORDER BY section;

-- Display all static content
SELECT
  key,
  LEFT(value, 50) as value_preview,
  section,
  updated_at
FROM static_content
ORDER BY section, key;
