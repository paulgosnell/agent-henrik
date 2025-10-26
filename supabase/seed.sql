-- ==========================================
-- Luxury Travel Sweden - Seed Data
-- ==========================================
-- Run this AFTER schema.sql to populate initial data
--
-- This includes:
-- - 6 Themes
-- - 18 Existing Destinations
-- - Sample static content keys
-- ==========================================

-- ==========================================
-- 1. INSERT THEMES
-- ==========================================

INSERT INTO themes (label, slug, keywords, highlight, color) VALUES
(
  'Nature & Wellness',
  'nature',
  ARRAY['nature', 'forest', 'wellness', 'spa', 'silence', 'lapland', 'outdoor', 'hiking', 'wildlife'],
  'I''ll escort you north to glass-roof lodges in Lapland, where aurora vigils, private sauna rituals, and forest bathing reset every sense.',
  '#4A7C59'
),
(
  'Design & Innovation',
  'design',
  ARRAY['design', 'innovation', 'studio', 'architecture', 'tech', 'creative', 'modern', 'contemporary'],
  'Stockholm''s design houses unlock after-hours, with studio salons and conversations alongside Sweden''s pioneering innovators.',
  '#2C3E50'
),
(
  'Culinary',
  'culinary',
  ARRAY['culinary', 'food', 'gastronomy', 'chef', 'dining', 'story', 'restaurant', 'michelin', 'tasting'],
  'Chefs compose narrative tasting menus aboard an archipelago yacht, threading local producers and storytellers into each course.',
  '#E67E22'
),
(
  'Royal, Art & Culture',
  'royal-culture',
  ARRAY['royal', 'heritage', 'palace', 'history', 'art', 'culture', 'gallery', 'artist', 'museum', 'ancestral'],
  'After-hours access to royal palaces and ancestral estates reveals chambers typically reserved for dignitaries and lineage keepers.',
  '#8E44AD'
),
(
  'Nightlife & Celebrations',
  'nightlife',
  ARRAY['nightlife', 'celebration', 'party', 'gala', 'club', 'music', 'dance', 'entertainment'],
  'Underground speakeasies, bespoke gala choreography, and avant-garde performances ignite nights that stretch toward dawn.',
  '#C0392B'
),
(
  'Legacy & Purpose',
  'legacy',
  ARRAY['legacy', 'impact', 'meaningful', 'philanthropy', 'sustainability', 'purpose', 'conservation', 'community'],
  'Impact encounters connect you with sustainability founders and cultural guardians shaping Sweden''s future.',
  '#16A085'
)
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 2. INSERT DESTINATIONS
-- ==========================================

-- Get theme IDs for reference (we'll need these)
DO $$
DECLARE
  theme_nature UUID;
  theme_design UUID;
  theme_culinary UUID;
  theme_royal_culture UUID;
  theme_nightlife UUID;
  theme_legacy UUID;
BEGIN
  -- Fetch theme IDs
  SELECT id INTO theme_nature FROM themes WHERE slug = 'nature';
  SELECT id INTO theme_design FROM themes WHERE slug = 'design';
  SELECT id INTO theme_culinary FROM themes WHERE slug = 'culinary';
  SELECT id INTO theme_royal_culture FROM themes WHERE slug = 'royal-culture';
  SELECT id INTO theme_nightlife FROM themes WHERE slug = 'nightlife';
  SELECT id INTO theme_legacy FROM themes WHERE slug = 'legacy';

  -- Insert destinations with proper theme relationships
  INSERT INTO destinations (slug, title, description, image_url, latitude, longitude, category, seasons, theme_ids, published) VALUES
  (
    'stockholm',
    'Stockholm',
    'Sweden''s capital blends royal heritage, innovative design, and vibrant cultural scenes. Explore after-hours palace access, Michelin dining, and Stockholm''s creative underground.',
    'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    59.3293,
    18.0686,
    'city',
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    ARRAY[theme_nature, theme_design, theme_royal_culture, theme_culinary, theme_nightlife],
    true
  ),
  (
    'gothenburg',
    'Gothenburg',
    'Sweden''s west coast gem combines maritime heritage with innovative cuisine. Explore seafood markets, contemporary art museums, and the charming Haga district.',
    'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    57.7089,
    11.9746,
    'city',
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    ARRAY[theme_culinary, theme_royal_culture, theme_design],
    true
  ),
  (
    'gotland',
    'Gotland & Visby',
    'Medieval walls surround Visby on this Baltic island paradise. Discover ancient rune stones, limestone formations, and summer festivals in Sweden''s sunniest region.',
    'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    57.6348,
    18.2948,
    'seaside',
    ARRAY['Spring', 'Summer', 'Autumn'],
    ARRAY[theme_royal_culture, theme_nature],
    true
  ),
  (
    'dalarna',
    'Dalarna',
    'The heart of Swedish folklore and tradition. Experience genuine Swedish culture, traditional crafts, Lake Siljan, and the iconic red Dala horses.',
    'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    60.6034,
    14.5636,
    'province',
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    ARRAY[theme_royal_culture, theme_legacy, theme_nature],
    true
  ),
  (
    'lapland',
    'Lapland',
    'Enter the Arctic wilderness for aurora vigils, glass-roof lodges, and transformative silence. Experience indigenous Sámi culture and winter''s profound beauty.',
    'https://images.pexels.com/photos/2024881/pexels-photo-2024881.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    67.9222,
    23.6850,
    'province',
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    ARRAY[theme_nature, theme_legacy],
    true
  ),
  (
    'archipelago',
    'Stockholm Archipelago',
    'Over 30,000 islands form Sweden''s maritime playground. Private yacht journeys, foraging expeditions, and hidden island retreats await your discovery.',
    'https://images.pexels.com/photos/3408353/pexels-photo-3408353.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    59.4500,
    18.5500,
    'seaside',
    ARRAY['Spring', 'Summer', 'Autumn'],
    ARRAY[theme_nature, theme_culinary],
    true
  ),
  (
    'malmo',
    'Malmö',
    'Sweden''s gateway to Europe combines Scandinavian cool with continental flair. Explore sustainable architecture, diverse culinary scenes, and proximity to Copenhagen.',
    'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    55.6050,
    13.0038,
    'city',
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    ARRAY[theme_design, theme_culinary, theme_royal_culture],
    true
  ),
  (
    'abisko',
    'Abisko National Park',
    'Prime aurora viewing location in Swedish Lapland. Experience the Midnight Sun, pristine wilderness, and some of Europe''s clearest skies for northern lights.',
    'https://images.pexels.com/photos/2024881/pexels-photo-2024881.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    68.3540,
    18.8306,
    'park',
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    ARRAY[theme_nature],
    true
  ),
  (
    'vastergotland',
    'Västergötland',
    'Ancient Viking heritage meets rolling countryside. Discover medieval churches, archaeological sites, and the birthplace of Swedish history.',
    'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    58.3,
    13.4,
    'province',
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    ARRAY[theme_royal_culture, theme_legacy],
    true
  ),
  (
    'uppsala',
    'Uppsala',
    'Sweden''s ancient university city combines academic excellence with Viking heritage. Explore Scandinavia''s largest cathedral and historic botanical gardens.',
    'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    59.8586,
    17.6389,
    'city',
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    ARRAY[theme_royal_culture, theme_legacy],
    true
  ),
  (
    'skane',
    'Skåne Region',
    'Southern Sweden''s fertile plains offer castle trails, sandy beaches, and Europe''s leading New Nordic cuisine scene.',
    'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    55.9,
    13.5,
    'beach',
    ARRAY['Spring', 'Summer', 'Autumn'],
    ARRAY[theme_culinary, theme_royal_culture, theme_nature],
    true
  ),
  (
    'orebro',
    'Örebro',
    'Lakeside charm with a fairytale castle. Experience innovative Swedish design, vibrant cultural scenes, and authentic local traditions.',
    'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    59.2753,
    15.2134,
    'city',
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    ARRAY[theme_royal_culture, theme_design],
    true
  ),
  (
    'jamtland',
    'Jämtland',
    'Mountain wilderness perfect for outdoor adventures. Discover ski resorts, hiking trails, and authentic Sami cultural experiences.',
    'https://images.pexels.com/photos/2024881/pexels-photo-2024881.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    63.2,
    14.6,
    'ski',
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    ARRAY[theme_nature, theme_legacy],
    true
  ),
  (
    'storyteller-astrid',
    'Astrid''s Sweden',
    'Follow the literary journey of Astrid Lindgren. Explore Vimmerby, storytelling experiences, and the landscapes that inspired Pippi Longstocking.',
    'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    57.6681,
    15.8551,
    'storyteller',
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    ARRAY[theme_royal_culture, theme_legacy],
    true
  ),
  (
    'storyteller-bergman',
    'Bergman''s Fårö',
    'Discover Ingmar Bergman''s island retreat. Explore film locations, the director''s home, and the stark landscapes that shaped cinematic masterpieces.',
    'https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    57.95,
    19.1,
    'storyteller',
    ARRAY['Spring', 'Summer', 'Autumn'],
    ARRAY[theme_royal_culture, theme_nature],
    true
  ),
  (
    'storyteller-abba',
    'ABBA Experience',
    'Immerse yourself in ABBA''s musical legacy. Visit the interactive museum, recording studios, and Stockholm venues where the legends performed.',
    'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    59.32,
    18.09,
    'storyteller',
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    ARRAY[theme_royal_culture, theme_nightlife],
    true
  ),
  (
    'storyteller-nobel',
    'Nobel Legacy',
    'Trace Alfred Nobel''s footsteps through Stockholm. Experience the Nobel Prize Museum, annual ceremony venues, and the inventor''s innovative spirit.',
    'https://images.pexels.com/photos/1388030/pexels-photo-1388030.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
    59.325,
    18.07,
    'storyteller',
    ARRAY['Spring', 'Summer', 'Autumn', 'Winter'],
    ARRAY[theme_legacy, theme_design, theme_royal_culture],
    true
  )
  ON CONFLICT (slug) DO NOTHING;

  RAISE NOTICE '✅ Seeded % destinations', (SELECT COUNT(*) FROM destinations);
END $$;

-- ==========================================
-- 3. INSERT SAMPLE STATIC CONTENT
-- ==========================================

INSERT INTO static_content (key, value, section, description) VALUES
-- Hero Section
('hero.headline', 'Discover Hidden Sweden', 'hero', 'Main headline on homepage hero'),
('hero.subheadline', 'Luxury travel experiences crafted for discerning explorers', 'hero', 'Hero subheadline'),
('hero.cta.primary', 'Start Your Journey', 'hero', 'Primary CTA button text'),
('hero.cta.secondary', 'Explore Destinations', 'hero', 'Secondary CTA button text'),

-- About Section
('about.headline', 'Your Personal Sweden Curator', 'about', 'About section headline'),
('about.description', 'LIV crafts bespoke Swedish journeys that unlock hidden experiences, private access, and transformative moments.', 'about', 'About section description'),

-- Map Section
('map.headline', 'Where Will LIV Take You?', 'map', 'Map section headline'),
('map.subheadline', 'Explore curated destinations across Sweden', 'map', 'Map section subheadline'),

-- LIV Modal
('modal.liv.welcome', 'Welcome. I''m LIV, your Swedish journey architect.', 'modal', 'LIV chat welcome message'),
('modal.liv.intro', 'Let me compose something extraordinary for you.', 'modal', 'LIV chat intro message'),

-- Footer
('footer.tagline', 'Extraordinary journeys. Expertly curated.', 'footer', 'Footer tagline'),
('footer.copyright', '© 2025 Luxury Travel Sweden. All rights reserved.', 'footer', 'Copyright text'),

-- Contact
('contact.headline', 'Let''s Craft Your Journey', 'contact', 'Contact section headline'),
('contact.description', 'Share your vision, and we''ll compose an unforgettable Swedish experience.', 'contact', 'Contact section description')

ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- ==========================================
-- 4. INSERT SAMPLE PRESS QUOTES (OPTIONAL)
-- ==========================================

INSERT INTO press_quotes (quote, source, author, display_order, published) VALUES
('The most refined way to experience Sweden''s hidden treasures.', 'Forbes Travel', 'Sarah Mitchell', 1, true),
('LIV transforms luxury travel into an art form.', 'Condé Nast Traveler', null, 2, true),
('Unparalleled access to Sweden''s cultural crown jewels.', 'Travel + Leisure', 'James Cooper', 3, true)
ON CONFLICT DO NOTHING;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
DECLARE
  theme_count INT;
  dest_count INT;
  content_count INT;
BEGIN
  SELECT COUNT(*) INTO theme_count FROM themes;
  SELECT COUNT(*) INTO dest_count FROM destinations;
  SELECT COUNT(*) INTO content_count FROM static_content;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Seed data inserted successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '- % themes created', theme_count;
  RAISE NOTICE '- % destinations created', dest_count;
  RAISE NOTICE '- % static content keys created', content_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create a Storage bucket named "media"';
  RAISE NOTICE '2. Make the bucket public';
  RAISE NOTICE '3. Create your admin user account';
  RAISE NOTICE '4. Update your frontend to connect to Supabase';
END $$;
