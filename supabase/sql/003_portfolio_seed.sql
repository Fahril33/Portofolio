-- 003_portfolio_seed.sql
-- Seed content + default configs.

insert into public.hero_section (id, greeting, job_title, welcome_title, welcome_text, hero_image_alt)
values (
  1,
  'Hello, I''m',
  'FullStack Web Developer',
  'Ehmm.. Hello!',
  'This site is under development, thank you for coming! Feel free to contact me for any inquiries! :)',
  'Hero illustration'
)
on conflict (id) do update set
  greeting = excluded.greeting,
  job_title = excluded.job_title,
  welcome_title = excluded.welcome_title,
  welcome_text = excluded.welcome_text,
  hero_image_alt = excluded.hero_image_alt;

insert into public.about_section (id, heading, tagline, body, image_alt)
values (
  1,
  'About Me',
  '"Imagine, Design, Code."',
  'I''m a Junior FullStack Web Developer with a passion for creating innovative and user-friendly applications.' || E'\n' ||
  'My goal is to combine creativity and technology to create impactful digital experiences.',
  'Portrait'
)
on conflict (id) do update set
  heading = excluded.heading,
  tagline = excluded.tagline,
  body = excluded.body,
  image_alt = excluded.image_alt;

insert into public.social_links (label, href, icon, sort_order, active)
values
  ('Facebook', 'https://www.facebook.com/ClasherPensiun24', 'facebook', 1, true),
  ('Instagram', 'https://www.instagram.com/muhammad_fchrl', 'instagram', 2, true),
  ('GitHub', 'https://www.github.com/fahril33', 'github', 3, true),
  ('LinkedIn', 'https://www.linkedin.com/in/mfahril', 'linkedin', 4, true)
on conflict do nothing;

insert into public.showcases
  (status, header_title, project_title, description, image_url, image_alt, image_title, tags, sort_order, active)
values
  (
    'current',
    'Ongoing Project',
    'Quick Notes',
    'Quick Notes is a personal scheduler application that is simple and flexible, designed to help users manage their daily routines, weekly schedules, important events, and task lists efficiently.',
    'https://preview-portfolio-7cl47fdfw0aqoci9j.vusercontent.net/placeholder.svg?height=400&width=600',
    'Quick Notes logo (placeholder)',
    'This is a placeholder logo. It will be replaced with a real logo when the project is complete.',
    '[{"label":"Node.js","backgroundColor":"#3C873A","color":"#fff"},{"label":"React","backgroundColor":"#61dafb","color":"#222"},{"label":"TypeScript","backgroundColor":"#3178c6","color":"#fff"},{"label":"CSS","backgroundColor":"#222","color":"#fff"},{"label":"Tailwind CSS","backgroundColor":"#3b82f6","color":"#fff"},{"label":"Supabase","backgroundColor":"#3ecf8e","color":"#fff"}]'::jsonb,
    1,
    true
  ),
  (
    'future',
    'Planned Project',
    'Quick Math',
    'Quick Math is a math game that challenges players to solve math problems as fast as possible.',
    'https://preview-portfolio-7cl47fdfw0aqoci9j.vusercontent.net/placeholder.svg?height=400&width=600',
    'Quick Math logo (placeholder)',
    'This is a placeholder logo. It will be replaced with a real logo when the project is complete.',
    '[{"label":"Node.js","backgroundColor":"#3C873A","color":"#fff"},{"label":"React","backgroundColor":"#61dafb","color":"#222"},{"label":"TypeScript","backgroundColor":"#3178c6","color":"#fff"},{"label":"CSS","backgroundColor":"#222","color":"#fff"},{"label":"Supabase","backgroundColor":"#3ecf8e","color":"#fff"}]'::jsonb,
    1,
    true
  )
on conflict do nothing;

insert into public.skill_categories (id, title, sort_order, active)
values
  (1, 'Programming Language', 1, true),
  (2, 'Framework & Library', 2, true),
  (3, 'UI/UX Design', 3, true),
  (4, 'Database', 4, true)
on conflict (id) do update set
  title = excluded.title,
  sort_order = excluded.sort_order,
  active = excluded.active;

insert into public.skill_items (category_id, label, icon_key, sort_order, active)
values
  (1, 'Javascript', 'javascript', 1, true),
  (1, 'Typescript', 'typescript', 2, true),
  (1, 'PHP', 'php', 3, true),
  (1, 'Python', 'python', 4, true),
  (2, 'NodeJs', 'nodejs', 1, true),
  (2, 'React', 'react', 2, true),
  (3, 'Vanilla CSS', 'css3', 1, true),
  (3, 'Tailwind CSS', 'tailwind', 2, true),
  (3, 'Bootstrap', 'bootstrap', 3, true),
  (3, 'Figma', 'figma', 4, true),
  (4, 'MongoDB', 'mongodb', 1, true),
  (4, 'Supabase', 'supabase', 2, true),
  (4, 'MySQL', 'mysql', 3, true)
on conflict do nothing;

-- Default UI configs
insert into public.app_configs(app, namespace, config)
values
(
  'portfolio',
  'hero',
  '{
    "version": 1,
    "typewriter": {
      "enabled": true,
      "rotate": true,
      "texts": ["ORI7ON_", "FAHRIL"],
      "defaultIndex": 0,
      "typingMs": 70,
      "deletingMs": 40,
      "pauseMs": 1200,
      "loop": true
    },
    "welcomeAlert": { "enabled": true },
    "heroImage": {
      "enabled": true,
      "position": "left",
      "source": "url",
      "url": "",
      "alt": "Hero illustration",
      "storage": { "bucket": "", "path": "", "isPublic": true },
      "size": { "widthPx": null, "heightPx": null, "objectFit": "contain" }
    }
  }'::jsonb
),
(
  'portfolio',
  'about',
  '{
    "version": 1,
    "image": {
      "enabled": true,
      "source": "url",
      "url": "",
      "alt": "Portrait",
      "storage": { "bucket": "", "path": "", "isPublic": true },
      "size": { "widthPx": null, "heightPx": null, "objectFit": "cover" }
    }
  }'::jsonb
)
on conflict (app, namespace) do update set
  config = excluded.config;

-- After you create an Auth user (Dashboard → Authentication → Users),
-- run this (replace UUID) to grant admin access to /lead:
-- insert into public.admin_users(user_id) values ('00000000-0000-0000-0000-000000000000');

