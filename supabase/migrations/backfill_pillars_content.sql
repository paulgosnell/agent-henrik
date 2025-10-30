-- ==========================================
-- Backfill Pillars Content - Experiences & Corporate Sections
-- ==========================================

INSERT INTO pillars (
  slug,
  title,
  excerpt,
  content,
  hero_image_url,
  icon_name,
  section,
  display_order,
  cta_text,
  liv_context_type,
  liv_context_name,
  published
) VALUES
-- ==========================================
-- EXPERIENCES SECTION (6 pillars)
-- ==========================================
(
  'nature-wellness',
  'Nature & Wellness',
  'Disappear into silence and reconnect with yourself. Stay in glass igloos under the Northern Lights, mirrored forest cabins, or private archipelago villas.',
  '<p>Disappear into silence and reconnect with yourself. Stay in glass igloos under the Northern Lights, mirrored forest cabins, or private archipelago villas. Practice sauna rituals, forest meditation, and guided digital detoxes. For those who seek more, Sweden's biohacking pioneers and longevity experts curate programs blending nature with the science of performance and wellbeing.</p>

<h3>Signature Wellness Sanctuaries</h3>
<p>Discover Sweden''s most restorative destinations:</p>
<ul>
  <li>Icehotel, Jukkasjärvi — Sleep in rooms carved from ice beneath the auroras</li>
  <li>Arctic Bath, Harads — Float in the Lule River within a mirrored spa</li>
  <li>Treehotel, Harads — Sustainably designed cabins suspended in ancient forest</li>
  <li>Fjällnäs, Funäsdalen — Remote mountain lodge for mindfulness and silence</li>
  <li>Yasuragi Hasseludden, Nacka — Japanese-inspired wellness retreat near Stockholm</li>
  <li>Thermal Bathing & Spa Journeys at Raison d''Être Spa, Grand Hôtel Stockholm</li>
</ul>

<h3>Transformative Wellness Journeys</h3>
<p>For those seeking more than rest, Sweden's wellness innovators and longevity experts design holistic programs that merge nature, neuroscience, and nutrition—helping you recharge, rebalance, and reconnect in one of the world's most peaceful settings.</p>',
  'https://images.pexels.com/photos/2024881/pexels-photo-2024881.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
  'leaf',
  'experiences',
  1,
  'Design my journey',
  'experience',
  'Nature & Wellness',
  true
),
(
  'design-innovation',
  'Design & Innovation',
  'Stockholm is one of the world's unicorn capitals — a cradle of startups and cutting-edge design. We open doors to private design studios, fashion ateliers, and sustainable innovation labs.',
  '<p>Stockholm is one of the world's unicorn capitals — a cradle of startups and cutting-edge design. We open doors to private design studios, fashion ateliers, and sustainable innovation labs. Meet the entrepreneurs behind global icons and enjoy one-on-one encounters with Sweden's creatives and thinkers.</p>',
  'https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
  'palette',
  'experiences',
  2,
  'Design my journey',
  'experience',
  'Design & Innovation',
  true
),
(
  'royal-art-culture',
  'Royal, Art & Culture',
  'Discover Sweden's refined blend of heritage and creativity. Explore private castles and royal palaces after hours, then step into the world of contemporary art, design studios, and collector salons.',
  '<p>Discover Sweden's refined blend of heritage and creativity. Explore private castles and royal palaces after hours, then step into the world of contemporary art, design studios, and collector salons. A journey where history, culture, and innovation meet in timeless Scandinavian style.</p>',
  'https://images.pexels.com/photos/18499031/pexels-photo-18499031.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
  'crown',
  'experiences',
  3,
  'Design my journey',
  'experience',
  'Royal, Art & Culture',
  true
),
(
  'culinary',
  'Culinary Experiences',
  'Discover Sweden through its flavors. Join Michelin-trained chefs in hands-on cooking sessions inspired by the seasons. Forage for wild herbs and mushrooms with local experts.',
  '<p>Discover Sweden through its flavors. Join Michelin-trained chefs in hands-on cooking sessions inspired by the seasons. Forage for wild herbs and mushrooms with local experts, then dine in forest kitchens where nature sets the table. Enjoy gourmet food tours, private tasting visits, and warm home dinners that open the door to authentic Swedish life. Hear Sami stories and share traditional dishes around the fire — each meal a chapter of Sweden's land, culture, and culinary heritage.</p>',
  'https://images.pexels.com/photos/4253312/pexels-photo-4253312.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
  'utensils',
  'experiences',
  4,
  'Design my journey',
  'experience',
  'Culinary Experiences',
  true
),
(
  'nightlife-celebration',
  'Nightlife & Celebration',
  'Swedes know how to party — and we bring you inside their most exclusive scenes. Sip champagne in members-only clubs, dance under the midnight sun.',
  '<p>Swedes know how to party — and we bring you inside their most exclusive scenes. Sip champagne in members-only clubs, dance under the midnight sun at a private island midsummer gala, or host your own soirée in a designer's loft. For the bold, rent out a mansion and let us curate an unforgettable night with live acts, local creatives, and a guest list to remember.</p>',
  'https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
  'sparkles',
  'experiences',
  5,
  'Design my journey',
  'experience',
  'Nightlife & Celebration',
  true
),
(
  'legacy-meaningful-travel',
  'Legacy & Meaningful Travel',
  'Travel with purpose and perspective. Support Sami heritage projects, experience rewilding initiatives, or participate in sustainable design collaborations.',
  '<p>Travel with purpose and perspective. Support Sami heritage projects, experience rewilding initiatives, or participate in sustainable design collaborations. Every journey leaves a positive footprint — giving back to the land, the culture, and the communities that make Sweden unique.</p>',
  'https://images.pexels.com/photos/2879991/pexels-photo-2879991.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
  'globe-2',
  'experiences',
  6,
  'Design my journey',
  'experience',
  'Legacy & Meaningful Travel',
  true
),

-- ==========================================
-- CORPORATE & INCENTIVES SECTION (6 pillars)
-- ==========================================
(
  'innovation-creativity',
  'Innovation & Creativity',
  'Step into Sweden''s innovation playground — a nation of unicorns, sustainability pioneers, and design visionaries.',
  '<p><strong>Where bold ideas meet Nordic design and future thinking.</strong></p>
<p>Step into Sweden''s innovation playground — a nation of unicorns, sustainability pioneers, and design visionaries. Here, creativity thrives in co-working lofts, waterfront tech hubs, and repurposed industrial spaces turned into idea labs.</p>
<p>Bring your team into this dynamic environment where business meets inspiration. Meet startup founders and green-tech trailblazers, join hands-on workshops in innovation and leadership, and explore how Swedish culture turns collaboration into creation. Each experience is designed to spark ideas, strengthen team connection, and ignite forward-thinking energy that lasts long after the trip ends.</p>

<h3>Innovation Safaris</h3>
<p>Discover the ideas shaping the future. Guided tours and encounters that reveal Sweden''s creative ecosystem.</p>
<ul>
  <li>Startup & Scaleup Tours — Visit leading tech hubs and incubators in Stockholm and Gothenburg</li>
  <li>Green-Tech Encounters — Explore labs pioneering clean energy, recycling tech, and circular economy solutions</li>
  <li>Founder Meetups — Learn directly from entrepreneurs and changemakers</li>
  <li>Innovation Labs — Join hands-on sessions in AI, biotech, and smart mobility</li>
  <li>Trend Scouting Expeditions — Spot emerging ideas in design, lifestyle, and sustainability</li>
</ul>

<h3>Creative Incentives</h3>
<p>Boost creativity and team spirit through inspiring, interactive experiences.</p>
<ul>
  <li>Archipelago Sailing Races — Collaborative team challenges on the Baltic Sea</li>
  <li>Nordic Gastronomy Contests — Cook with top chefs using local, sustainable ingredients</li>
  <li>Entrepreneurial Workshops — Build innovation leadership and agile mindsets</li>
  <li>Cool Hunting & Design Walks — Explore Stockholm''s trendsetting districts, concept stores, and studios</li>
  <li>Design Sprints & Creative Hackathons — Co-create ideas guided by Swedish designers</li>
  <li>Music & Innovation Experiences — Learn from world-leading producers and creative entrepreneurs</li>
</ul>

<h3>Transformative Learning Journeys</h3>
<p>For teams seeking meaningful growth, Sweden offers immersive programs that blend innovation with wellbeing. Tailored learning journeys combine startup insights, creative collaboration, and leadership development — turning inspiration into actionable strategy.</p>',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
  'lightbulb',
  'corporate',
  1,
  'Design with LIV',
  'corporate',
  'Innovation & Creativity',
  true
),
(
  'leadership-retreats',
  'Leadership Retreats',
  'Swap the boardroom for a castle, a mirrored forest lodge, or a private island villa. Executive retreats combine strategic focus with Swedish wellness.',
  '<p>Swap the boardroom for a castle, a mirrored forest lodge, or a private island villa. Executive retreats combine strategic focus with Swedish wellness: sauna rituals, guided silence, and outdoor adventure.</p>',
  'https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
  'mountain',
  'corporate',
  2,
  'Design with LIV',
  'corporate',
  'Leadership Retreats',
  true
),
(
  'celebration-recognition',
  'Celebration & Recognition',
  'Business milestones deserve more than a ballroom. Celebrate with a Scandi White Party on a private island, a royal gala in a candlelit palace.',
  '<p>Business milestones deserve more than a ballroom. Celebrate with a Scandi White Party on a private island, a royal gala in a candlelit palace, or an Innovation Party Night with startup founders and Michelin catering.</p>',
  'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
  'party-popper',
  'corporate',
  3,
  'Design with LIV',
  'corporate',
  'Celebration & Recognition',
  true
),
(
  'culture-purpose',
  'Culture & Purpose',
  'Sweden''s cultural and social legacy inspires transformation. Backstage access to Stockholm Fashion Week, private design fairs, or CSR narratives.',
  '<p>Sweden''s cultural and social legacy inspires transformation. Backstage access to Stockholm Fashion Week, private design fairs, or CSR narratives supporting Sami communities and eco-startups.</p>',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
  'heart',
  'corporate',
  4,
  'Design with LIV',
  'corporate',
  'Culture & Purpose',
  true
),
(
  'wellness-biohacking',
  'Wellness & Biohacking',
  'Executive performance meets longevity. Transform your leadership team through cutting-edge wellness protocols, Nordic cold therapy.',
  '<p>Executive performance meets longevity. Transform your leadership team through cutting-edge wellness protocols, Nordic cold therapy, and personalized biohacking experiences in pristine Swedish nature.</p>',
  'https://images.pexels.com/photos/3771097/pexels-photo-3771097.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
  'activity',
  'corporate',
  5,
  'Design with LIV',
  'corporate',
  'Wellness & Biohacking',
  true
),
(
  'creative-incentives',
  'Creative Incentives',
  'Reward your team with unforgettable experiences. Sailing races through the archipelago, gastronomy contests with Michelin chefs.',
  '<p>Reward your team with unforgettable experiences. Sailing races through the archipelago, gastronomy contests with Michelin chefs, design sprints in iconic studios, or adventure challenges in Lapland.</p>',
  'https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&dpr=1',
  'trophy',
  'corporate',
  6,
  'Design with LIV',
  'corporate',
  'Creative Incentives',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  hero_image_url = EXCLUDED.hero_image_url,
  icon_name = EXCLUDED.icon_name,
  section = EXCLUDED.section,
  display_order = EXCLUDED.display_order,
  cta_text = EXCLUDED.cta_text,
  liv_context_type = EXCLUDED.liv_context_type,
  liv_context_name = EXCLUDED.liv_context_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Pillars content backfilled successfully!';
  RAISE NOTICE '   Experiences: 6 pillars';
  RAISE NOTICE '   Corporate & Incentives: 6 pillars';
  RAISE NOTICE '   Total: 12 pillars';
END $$;
