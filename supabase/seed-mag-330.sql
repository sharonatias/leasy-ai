-- Seed: MAG 330 Tower (MVP-0 test building)
-- Run manually in Supabase SQL Editor

INSERT INTO projects (name, code, city, country)
VALUES ('MAG 330', '330-927', 'Dubai', 'UAE');

INSERT INTO buildings (project_id, name, developer)
VALUES (
  (SELECT id FROM projects WHERE code = '330-927'),
  'MAG 330 Tower',
  'MAG'
);
