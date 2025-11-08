-- ==========================================
-- Seed Agent Henrik Pillars
-- ==========================================
-- Creates 7 service pillars for Agent Henrik global platform

INSERT INTO pillars (slug, title, excerpt, content, section, display_order, icon_name, published, site) VALUES

-- EXPERIENCES SECTION (7 core services)

('underground-luxury',
 'Underground Luxury Journeys',
 'Hidden speakeasies, rooftop dinners, secret parties',
 'Exclusive access to the world''s most secretive cultural experiences. From hidden speakeasies in Tokyo to rooftop gatherings in Beirut, we unlock doors that don''t officially exist. Navigate neon-lit alleyways, unmarked buildings, and invitation-only spaces where the city''s creative rebels gather.',
 'experiences',
 1,
 'eye-off',
 true,
 'henrik'),

('lifestyle-culture',
 'Lifestyle & Culture Tours',
 'Gourmet tastings, art studios, nightlife, creative scenes',
 'Immersive journeys through local culture: Michelin kitchens, underground galleries, alternative art spaces, designer studios, and the pulse of authentic nightlife. Meet the chefs, artists, designers, and cultural architects who define their cities. Each encounter is a window into creativity in motion.',
 'experiences',
 2,
 'palette',
 true,
 'henrik'),

('sea-holidays',
 'Sea Holidays',
 'Boutique sailing, private charters, hidden coves',
 'Mediterranean freedom aboard carefully selected vessels. Private charters to secluded coves in Croatia''s Adriatic, overnight sailing under stars, access to coastal experiences beyond standard itineraries. Where luxury meets authenticity on the water, away from the crowds.',
 'experiences',
 3,
 'anchor',
 true,
 'henrik'),

('brand-experience',
 'Brand Experience Travel',
 'Influencer journeys, launches, cultural activations',
 'Curated experiences for brands and influencers seeking authentic narratives. We design journeys that photograph beautifully while delivering genuine cultural immersion. From product launches in Berlin''s underground to brand activations in Tokyo''s creative districts.',
 'experiences',
 4,
 'camera',
 true,
 'henrik'),

('cool-hunting',
 'Cool Hunting Expeditions',
 'Tokyo, Berlin, Mexico City, Seoul trend scouting',
 'Explore emerging cultural capitals with insider access to the creative vanguard. Meet designers before they trend, taste before flavors break, visit studios before discovery. Tokyo''s neon alleys, Berlin''s techno cathedrals, Mexico City''s art collectives, Seoul''s design futures.',
 'experiences',
 5,
 'compass',
 true,
 'henrik'),

('storytelling',
 'Storytelling Encounters',
 'Curated meetings with chefs, artists, filmmakers, entrepreneurs',
 'Intimate encounters with cultural creators. Private dinners with Michelin chefs who source their own ingredients, studio visits with emerging artists reshaping their mediums, conversations with visionaries shaping their fields. These aren''t interviews — they''re exchanges.',
 'experiences',
 6,
 'message-circle',
 true,
 'henrik'),

('corporate',
 'Corporate & Group Experiences',
 'Incentive trips, retreats, innovation scouting',
 'Cultural activations for companies and agencies. Innovation retreats in Seoul''s tech districts, trend-scouting in Mexico City''s markets, team incentives that inspire rather than reward. Design workshops, startup ecosystem tours, and transformative corporate journeys.',
 'experiences',
 7,
 'briefcase',
 true,
 'henrik')

ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- Success Message
-- ==========================================
DO $$
BEGIN
  RAISE NOTICE 'Agent Henrik pillars seeded successfully!';
  RAISE NOTICE 'Created 7 experience pillars for site=henrik';
END $$;
