-- ============================================================
-- MSI UTHM Companion — Seed Data
-- Run AFTER the initial schema migration.
-- ============================================================

-- Insert MSI mosque with fixed UUID for dev consistency
INSERT INTO public.mosques (id, name, address, lat, lng, zone_code, contact_info)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Masjid Sultan Ibrahim, UTHM',
  'Universiti Tun Hussein Onn Malaysia, 86400 Parit Raja, Batu Pahat, Johor',
  1.8575,
  103.0861,
  'JHR01',
  '{"phone": "07-453 7000", "email": "masjid@uthm.edu.my"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Default iqamah settings (offset in minutes after azan)
INSERT INTO public.iqamah_settings (mosque_id, prayer_name, offset_minutes) VALUES
  ('00000000-0000-0000-0000-000000000001', 'subuh', 15),
  ('00000000-0000-0000-0000-000000000001', 'zohor', 10),
  ('00000000-0000-0000-0000-000000000001', 'asar', 10),
  ('00000000-0000-0000-0000-000000000001', 'maghrib', 5),
  ('00000000-0000-0000-0000-000000000001', 'isyak', 10)
ON CONFLICT (mosque_id, prayer_name) DO NOTHING;

-- Sample facilities
INSERT INTO public.facilities (mosque_id, name, description, category, location_hint, has_wheelchair_access) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Tandas Lelaki', 'Tandas awam untuk jemaah lelaki. Dijaga bersih setiap hari.', 'Tandas / Toilet', 'Berdekatan pintu masuk utama, tingkat bawah', false),
  ('00000000-0000-0000-0000-000000000001', 'Tandas Wanita', 'Tandas awam untuk jemaah wanita.', 'Tandas / Toilet', 'Bahagian belakang masjid, tingkat bawah', false),
  ('00000000-0000-0000-0000-000000000001', 'Tempat Wuduk Lelaki', 'Tempat wuduk dengan air bersih dan paip yang mencukupi.', 'Tempat Wuduk / Wudu', 'Bersebelahan tandas lelaki', true),
  ('00000000-0000-0000-0000-000000000001', 'Tempat Wuduk Wanita', 'Tempat wuduk khas untuk jemaah wanita.', 'Tempat Wuduk / Wudu', 'Bersebelahan tandas wanita', true),
  ('00000000-0000-0000-0000-000000000001', 'Dewan Solat Utama (Muslimin)', 'Dewan solat utama untuk jemaah lelaki. Boleh memuatkan ~500 jemaah.', 'Dewan Solat / Prayer Hall', 'Tingkat utama', true),
  ('00000000-0000-0000-0000-000000000001', 'Dewan Solat Muslimat', 'Ruang solat khas untuk jemaah wanita.', 'Dewan Solat / Prayer Hall', 'Tingkat atas / bahagian khas', true),
  ('00000000-0000-0000-0000-000000000001', 'Tempat Letak Kereta', 'Parkir terbuka di kawasan masjid.', 'Tempat Letak Kereta / Parking', 'Hadapan masjid dan tepi jalan', true),
  ('00000000-0000-0000-0000-000000000001', 'Ruang Rehat Musafir', 'Ruang rehat untuk tetamu dan musafir. Sila hubungi pihak masjid jika perlukan penginapan sementara.', 'Ruang Rehat / Rest Area', 'Sila tanya petugas masjid', false);

-- Sample donation info
INSERT INTO public.donation_info (mosque_id, bank_name, account_number, account_name, notes)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Bank Islam Malaysia Berhad',
  '0200-0000-0000-00',
  'Tabung Masjid Sultan Ibrahim UTHM',
  'Sumbangan anda amat dihargai. Semua sumbangan digunakan untuk penyelenggaraan masjid dan aktiviti dakwah.'
);

-- Sample announcement
INSERT INTO public.announcements (mosque_id, title, body, category, is_published, pinned)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Selamat Datang ke MSI UTHM Companion',
  'Aplikasi rasmi Masjid Sultan Ibrahim, UTHM kini tersedia! Dapatkan waktu solat, maklumat program, dan kemudahan masjid di hujung jari anda.',
  'general',
  true,
  true
);

-- Sample event
INSERT INTO public.events (mosque_id, title, description, start_at, end_at, location, tags, is_published)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Kuliah Maghrib Mingguan',
  'Kuliah maghrib setiap Khamis oleh ustaz jemputan. Terbuka untuk semua jemaah.',
  (CURRENT_DATE + INTERVAL '3 days' + TIME '19:30')::timestamptz,
  (CURRENT_DATE + INTERVAL '3 days' + TIME '20:30')::timestamptz,
  'Dewan Solat Utama',
  ARRAY['Ceramah', 'Tazkirah'],
  true
);
