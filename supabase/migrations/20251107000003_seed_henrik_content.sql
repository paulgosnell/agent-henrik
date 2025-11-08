-- ==========================================
-- Agent Henrik Content Seeding
-- ==========================================
-- Initial content for Agent Henrik global luxury travel platform
-- - 7 core services
-- - 6 hero destinations across global regions
-- - 4+ press items from major publications
-- ==========================================

-- ==========================================
-- 1. INSERT 7 CORE SERVICES
-- ==========================================

INSERT INTO services (slug, title, excerpt, description, service_type, region_availability, display_order, image_url, site) VALUES

('underground-luxury',
 'Underground Luxury Journeys',
 'Hidden speakeasies, rooftop dinners, secret parties',
 'Exclusive access to the world''s most secretive cultural experiences. From hidden speakeasies in Tokyo to rooftop gatherings in Beirut, we unlock doors that don''t officially exist.',
 'underground',
 ARRAY['Global'],
 1,
 '/images/services/underground.jpg',
 'henrik'),

('lifestyle-culture',
 'Lifestyle & Culture Tours',
 'Gourmet tastings, art studios, nightlife, creative scenes',
 'Immersive journeys through local culture: Michelin kitchens, underground galleries, alternative art spaces, designer studios, and the pulse of authentic nightlife.',
 'lifestyle',
 ARRAY['Global'],
 2,
 '/images/services/lifestyle.jpg',
 'henrik'),

('yacht-sailing',
 'Sea Holidays',
 'Boutique sailing, private charters, hidden coves',
 'Mediterranean freedom aboard carefully selected vessels. Private charters to secluded coves, overnight sailing under stars, access to coastal experiences beyond standard itineraries.',
 'yacht',
 ARRAY['Mediterranean'],
 3,
 '/images/services/yacht.jpg',
 'henrik'),

('brand-experience',
 'Brand Experience Travel',
 'Influencer journeys, launches, cultural activations',
 'Curated experiences for brands and influencers seeking authentic narratives. We design journeys that photograph beautifully while delivering genuine cultural immersion.',
 'brand',
 ARRAY['Global'],
 4,
 '/images/services/brand.jpg',
 'henrik'),

('cool-hunting',
 'Cool Hunting Expeditions',
 'Tokyo, Berlin, Mexico City, Seoul trend scouting',
 'Explore emerging cultural capitals with insider access to the creative vanguard. Meet designers, taste before trends break, visit studios before they''re discovered.',
 'cool-hunting',
 ARRAY['Asia Pacific', 'Americas', 'Nordic'],
 5,
 '/images/services/cool-hunting.jpg',
 'henrik'),

('storytelling',
 'Storytelling Encounters',
 'Curated meetings with chefs, artists, filmmakers, entrepreneurs',
 'Intimate encounters with cultural creators. Private dinners with Michelin chefs, studio visits with emerging artists, conversations with visionaries shaping their fields.',
 'storytelling',
 ARRAY['Global'],
 6,
 '/images/services/storytelling.jpg',
 'henrik'),

('corporate',
 'Corporate & Group Experiences',
 'Incentive trips, retreats, innovation scouting',
 'Cultural activations for companies and agencies. Innovation retreats in Seoul, trend-scouting in Mexico City markets, team incentives that inspire rather than reward.',
 'corporate',
 ARRAY['Global'],
 7,
 '/images/services/corporate.jpg',
 'henrik')

ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- 2. INSERT 6 HERO DESTINATIONS
-- ==========================================

-- First, get service IDs for reference
DO $$
DECLARE
  underground_id UUID;
  lifestyle_id UUID;
  yacht_id UUID;
  storytelling_id UUID;
  cool_hunting_id UUID;
BEGIN
  -- Get service IDs
  SELECT id INTO underground_id FROM services WHERE slug = 'underground-luxury' AND site = 'henrik';
  SELECT id INTO lifestyle_id FROM services WHERE slug = 'lifestyle-culture' AND site = 'henrik';
  SELECT id INTO yacht_id FROM services WHERE slug = 'yacht-sailing' AND site = 'henrik';
  SELECT id INTO storytelling_id FROM services WHERE slug = 'storytelling' AND site = 'henrik';
  SELECT id INTO cool_hunting_id FROM services WHERE slug = 'cool-hunting' AND site = 'henrik';

  -- Insert destinations
  INSERT INTO destinations (slug, title, excerpt, description, region, latitude, longitude, category, service_ids, published, video_url, press_featured, site) VALUES

  ('beirut-rooftops',
   'Beirut Rooftops',
   'Sunset cultural mixology at the edge of the Mediterranean',
   'Experience Beirut''s renaissance through rooftop gatherings where East meets West. Golden hour overlooking the Mediterranean, conversations with local artists, underground music scenes, and culinary fusion that tells the story of a city''s resilience.',
   'Mediterranean',
   33.8886,
   35.4955,
   'city',
   ARRAY[underground_id, lifestyle_id, storytelling_id],
   true,
   '/video/destinations/beirut-intro.mp4',
   true,
   'henrik'),

  ('tokyo-neon',
   'Tokyo Neon Alleys',
   'Fast, vibrant nightlife energy in the world''s coolest city',
   'Navigate Tokyo''s hidden nightlife through neon-lit alleyways. Exclusive izakayas, underground clubs, designer bars in unmarked buildings, and encounters with the city''s creative rebels.',
   'Asia Pacific',
   35.6762,
   139.6503,
   'city',
   ARRAY[underground_id, lifestyle_id, cool_hunting_id],
   true,
   '/video/destinations/tokyo-intro.mp4',
   true,
   'henrik'),

  ('berlin-underground',
   'Berlin Underground',
   'Raw, strobe-lit, edgy techno cathedral experiences',
   'Access Berlin''s legendary underground club culture. From Berghain to secret warehouse parties, experience the city that never sleeps through the lens of its counterculture pioneers.',
   'Nordic',
   52.5200,
   13.4050,
   'city',
   ARRAY[underground_id, lifestyle_id, cool_hunting_id],
   true,
   '/video/destinations/berlin-intro.mp4',
   false,
   'henrik'),

  ('croatia-yacht',
   'Croatian Adriatic',
   'Sailing, exclusivity, hidden coves along the Dalmatian coast',
   'Boutique sailing through the Adriatic''s most pristine waters. Private charters to islands where luxury meets authenticity, overnight anchoring in secluded bays, access to coastal villages before they trend.',
   'Mediterranean',
   43.5081,
   16.4402,
   'seaside',
   ARRAY[yacht_id],
   true,
   '/video/destinations/croatia-intro.mp4',
   false,
   'henrik'),

  ('swedish-mountain',
   'Swedish Mountain',
   'Mystical, crisp Nordic light under the midnight sun',
   'Experience Sweden''s northern wilderness under impossible light. Glass igloos beneath aurora borealis, forest bathing with wellness experts, encounters with Sami culture, and design-forward lodges in absolute silence.',
   'Nordic',
   67.8558,
   20.2253,
   'park',
   ARRAY[lifestyle_id, storytelling_id],
   true,
   '/video/destinations/sweden-intro.mp4',
   true,
   'henrik'),

  ('rio-ipanema',
   'Rio de Janeiro',
   'Tropical, sensual, iconic Ipanema Beach with Dois Irmãos mountain',
   'Rio beyond the postcard: underground samba clubs, favela art tours led by local artists, beachfront encounters with cultural creators, and the pulse of a city that dances its philosophy.',
   'Americas',
   -22.9868,
   -43.2048,
   'beach',
   ARRAY[underground_id, lifestyle_id, storytelling_id],
   true,
   '/video/destinations/rio-intro.mp4',
   true,
   'henrik')

  ON CONFLICT (slug) DO NOTHING;

END $$;

-- ==========================================
-- 3. INSERT PRESS ITEMS
-- ==========================================

INSERT INTO press_items (title, description, source, quote, published_at, pdf_url, thumbnail_url, image_url, link_url, display_order, site, featured) VALUES

('The New Face of Luxury Travel',
 'New York Times feature on transformative luxury travel',
 'New York Times',
 'Redefines what luxury travel means in the 21st century',
 '2024-06-15',
 '/press/pdfs/nyt-2024.pdf',
 '/press/thumbs/nyt.jpg',
 '/press/thumbs/nyt.jpg',
 '/press/pdfs/nyt-2024.pdf',
 1,
 'henrik',
 true),

('Underground Luxury',
 'Forbes coverage of exclusive cultural journeys',
 'Forbes',
 'The most exclusive cultural journeys in the world',
 '2024-08-22',
 '/press/pdfs/forbes-2024.pdf',
 '/press/thumbs/forbes.jpg',
 '/press/thumbs/forbes.jpg',
 '/press/pdfs/forbes-2024.pdf',
 2,
 'henrik',
 true),

('Cultural Curation at Its Finest',
 'Condé Nast Traveler profile on insider access',
 'Condé Nast Traveler',
 'Where insider access meets editorial storytelling',
 '2024-09-10',
 '/press/pdfs/conde-nast-2024.pdf',
 '/press/thumbs/conde-nast.jpg',
 '/press/thumbs/conde-nast.jpg',
 '/press/pdfs/conde-nast-2024.pdf',
 3,
 'henrik',
 true),

('Design-Led Travel Experiences',
 'Wallpaper* feature on cinematic journeys',
 'Wallpaper*',
 'Cinematic journeys for the culturally curious',
 '2024-07-03',
 '/press/pdfs/wallpaper-2024.pdf',
 '/press/thumbs/wallpaper.jpg',
 '/press/thumbs/wallpaper.jpg',
 '/press/pdfs/wallpaper-2024.pdf',
 4,
 'henrik',
 true),

('The Art of the Journey',
 'Monocle coverage of transformative experiences',
 'Monocle',
 'Agent Henrik transforms travel into transformative narrative experiences',
 '2024-10-12',
 '/press/pdfs/monocle-2024.pdf',
 '/press/thumbs/monocle.jpg',
 '/press/thumbs/monocle.jpg',
 '/press/pdfs/monocle-2024.pdf',
 5,
 'henrik',
 true),

('Beyond Luxury: Cultural Intelligence',
 'The Guardian feature on experiential travel paradigm',
 'The Guardian',
 'A new paradigm in experiential travel for the discerning explorer',
 '2024-11-01',
 '/press/pdfs/guardian-2024.pdf',
 '/press/thumbs/guardian.jpg',
 '/press/thumbs/guardian.jpg',
 '/press/pdfs/guardian-2024.pdf',
 6,
 'henrik',
 true)

ON CONFLICT DO NOTHING;

-- ==========================================
-- Success Message
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Agent Henrik content seeding completed!';
  RAISE NOTICE 'Inserted: 7 services, 6 destinations, 6 press items';
  RAISE NOTICE 'All content tagged with site = ''henrik''';
  RAISE NOTICE 'Ready to launch Agent Henrik platform!';
END $$;
