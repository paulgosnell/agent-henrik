-- ==========================================
-- Add Initial Storytellers to Stories Table
-- ==========================================

INSERT INTO stories (
  slug,
  title,
  excerpt,
  content,
  hero_image_url,
  category,
  author,
  published_at,
  featured,
  display_order
) VALUES
-- Story 1: Mogens & Lena
(
  'mogens-lena-historical-mansion',
  'Dine with the priests Mogens & Lena in a historical mansion',
  'This is the story of two priests - Mogens & Lena - who found the perfect place to host intimate gatherings that blend spirituality, history, and culinary excellence in their beautifully restored mansion.',
  '<p>This is the story of two priests - Mogens & Lena - who found the perfect place to host intimate gatherings that blend spirituality, history, and culinary excellence in their beautifully restored mansion.</p>
<p>Nestled in the Swedish countryside, their historical mansion tells centuries of stories through its walls. Mogens and Lena have transformed this sacred space into a destination where guests can experience authentic Swedish hospitality, meaningful conversations, and exquisite locally-sourced cuisine.</p>
<p>Each dining experience is a carefully orchestrated journey through Swedish traditions, seasonal ingredients, and the profound connection between place, people, and purpose. Their gatherings are intimate by design, creating space for reflection, connection, and transformation.</p>',
  'https://sverigeagenten.com/wp-content/uploads/2021/04/Priest-couple-Staircase-scaled_small-uai-258x172.jpg',
  'Storyteller',
  'LIV Team',
  NOW(),
  true,
  1
),
-- Story 2: Robert & Mikael - THE VILLA
(
  'robert-mikael-the-villa',
  'THE VILLA – A bizarre dinner gathering with Robert & Mikael',
  'With the slogan "Louder music, Less conversations" Robert Pihl and Mikael Wennerros create unforgettable evenings where sound, atmosphere, and unexpected encounters take center stage.',
  '<p>With the slogan "Louder music, Less conversations" Robert Pihl and Mikael Wennerros create unforgettable evenings where sound, atmosphere, and unexpected encounters take center stage.</p>
<p>THE VILLA is not your typical dinner party. It''s an immersive experience where boundaries blur between performance art, culinary excellence, and social experimentation. The duo believes in the power of sound to create connection, letting music speak where words often fail.</p>
<p>Guests arrive not knowing what to expect and leave transformed by an evening that challenges convention. Each gathering is unique, carefully curated to surprise, delight, and push the boundaries of what a dinner party can be.</p>',
  'https://sverigeagenten.com/wp-content/uploads/2021/04/Founders-OOOW-Profile-scaled_small-uai-258x172.jpg',
  'Storyteller',
  'LIV Team',
  NOW(),
  true,
  2
),
-- Story 3: Trend Stefan
(
  'trend-stefan-stockholm-design',
  'A Stockholm design tour with Trend Stefan',
  'Trend Stefan is recognized as one of the foremost trend scouts of Sweden and he reveals the hidden design gems, emerging studios, and creative spaces that define Stockholm''s innovative spirit.',
  '<p>Trend Stefan is recognized as one of the foremost trend scouts of Sweden and he reveals the hidden design gems, emerging studios, and creative spaces that define Stockholm''s innovative spirit.</p>
<p>With decades of experience in Swedish design, Stefan has his finger on the pulse of Stockholm''s creative scene. He knows the studios before they''re famous, the designers before they break through, and the spaces where innovation happens.</p>
<p>His tours are not about visiting tourist attractions—they''re about understanding the DNA of Swedish design. From underground workshops to cutting-edge showrooms, Stefan opens doors that remain closed to most visitors, offering insights into the philosophy, process, and people behind Sweden''s design revolution.</p>',
  'https://sverigeagenten.com/wp-content/uploads/2021/04/Potrait-Trendstefan-scaled_small-uai-258x172.jpg',
  'Storyteller',
  'LIV Team',
  NOW(),
  true,
  3
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  hero_image_url = EXCLUDED.hero_image_url,
  category = EXCLUDED.category,
  published_at = EXCLUDED.published_at,
  featured = EXCLUDED.featured,
  display_order = EXCLUDED.display_order;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Initial storytellers added successfully!';
  RAISE NOTICE '   - Mogens & Lena';
  RAISE NOTICE '   - Robert & Mikael (THE VILLA)';
  RAISE NOTICE '   - Trend Stefan';
END $$;
