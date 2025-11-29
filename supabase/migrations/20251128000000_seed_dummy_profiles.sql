-- ============================================
-- SEED DATA: 20 Dummy Knjigovođa Profiles
-- ============================================
-- NAPOMENA: Ova migracija kreira testne podatke
-- Za produkciju uklonite ili zakomentarišite ovaj fajl
-- ============================================

-- Kreiraj pomoćnu funkciju za generisanje UUID-a za profile
-- Ovo nam omogućava da referenciramo iste ID-eve u više tabela
DO $$
DECLARE
  -- Profile UUIDs (fiksni za konzistentnost)
  p1 UUID := 'a0000001-0000-0000-0000-000000000001'::UUID;
  p2 UUID := 'a0000001-0000-0000-0000-000000000002'::UUID;
  p3 UUID := 'a0000001-0000-0000-0000-000000000003'::UUID;
  p4 UUID := 'a0000001-0000-0000-0000-000000000004'::UUID;
  p5 UUID := 'a0000001-0000-0000-0000-000000000005'::UUID;
  p6 UUID := 'a0000001-0000-0000-0000-000000000006'::UUID;
  p7 UUID := 'a0000001-0000-0000-0000-000000000007'::UUID;
  p8 UUID := 'a0000001-0000-0000-0000-000000000008'::UUID;
  p9 UUID := 'a0000001-0000-0000-0000-000000000009'::UUID;
  p10 UUID := 'a0000001-0000-0000-0000-000000000010'::UUID;
  p11 UUID := 'a0000001-0000-0000-0000-000000000011'::UUID;
  p12 UUID := 'a0000001-0000-0000-0000-000000000012'::UUID;
  p13 UUID := 'a0000001-0000-0000-0000-000000000013'::UUID;
  p14 UUID := 'a0000001-0000-0000-0000-000000000014'::UUID;
  p15 UUID := 'a0000001-0000-0000-0000-000000000015'::UUID;
  p16 UUID := 'a0000001-0000-0000-0000-000000000016'::UUID;
  p17 UUID := 'a0000001-0000-0000-0000-000000000017'::UUID;
  p18 UUID := 'a0000001-0000-0000-0000-000000000018'::UUID;
  p19 UUID := 'a0000001-0000-0000-0000-000000000019'::UUID;
  p20 UUID := 'a0000001-0000-0000-0000-000000000020'::UUID;
  
  -- City IDs
  sarajevo_id UUID;
  banja_luka_id UUID;
  tuzla_id UUID;
  zenica_id UUID;
  mostar_id UUID;
  brcko_id UUID;
  
  -- Service category IDs
  svc_knjigovodstvo UUID;
  svc_racunovodstvo UUID;
  svc_revizija UUID;
  svc_porez UUID;
  svc_finansije UUID;
  svc_plate UUID;
  svc_konsalting UUID;
  
BEGIN
  -- Dohvati ID-eve gradova
  SELECT id INTO sarajevo_id FROM cities WHERE name = 'Sarajevo' LIMIT 1;
  SELECT id INTO banja_luka_id FROM cities WHERE name = 'Banja Luka' LIMIT 1;
  SELECT id INTO tuzla_id FROM cities WHERE name = 'Tuzla' LIMIT 1;
  SELECT id INTO zenica_id FROM cities WHERE name = 'Zenica' LIMIT 1;
  SELECT id INTO mostar_id FROM cities WHERE name = 'Mostar' LIMIT 1;
  SELECT id INTO brcko_id FROM cities WHERE name = 'Brčko' LIMIT 1;
  
  -- Dohvati ID-eve usluga
  SELECT id INTO svc_knjigovodstvo FROM service_categories WHERE name = 'Knjigovodstvene usluge' LIMIT 1;
  SELECT id INTO svc_racunovodstvo FROM service_categories WHERE name = 'Računovodstvene usluge' LIMIT 1;
  SELECT id INTO svc_revizija FROM service_categories WHERE name = 'Revizorske usluge' LIMIT 1;
  SELECT id INTO svc_porez FROM service_categories WHERE name = 'Porezno savjetovanje' LIMIT 1;
  SELECT id INTO svc_finansije FROM service_categories WHERE name = 'Finansijsko planiranje' LIMIT 1;
  SELECT id INTO svc_plate FROM service_categories WHERE name = 'Obračun plata' LIMIT 1;
  SELECT id INTO svc_konsalting FROM service_categories WHERE name = 'Konsultantske usluge' LIMIT 1;

  -- ============================================
  -- KREIRAJ AUTH KORISNIKE U auth.users TABELI
  -- Ovi korisnici imaju lažnu lozinku i služe samo za prikaz
  -- ============================================
  
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, 
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin
  ) VALUES
  (p1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'amina.hadzic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p2, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'miroslav.petrovic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p3, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lejla.memic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p4, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dragan.kovacevic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p5, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'selma.begovic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p6, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nedim.hodzic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p7, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ivana.markovic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p8, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emir.salihovic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p9, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aldina.dzeko@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p10, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'goran.simic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p11, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aida.mujkic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p12, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'borislav.djuric@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p13, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'jasmina.halilovic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p14, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mladen.todorovic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p15, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emina.kovac@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p16, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nikola.jovanovic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p17, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sabina.music@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p18, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dino.hasanovic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p19, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vedrana.ilic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false),
  (p20, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'adnan.becirovic@demo.ba', crypt('DemoPassword123!', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', false)
  ON CONFLICT (id) DO NOTHING;

  -- Kreiraj identitete za korisnike (potrebno za Supabase auth)
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES
  (p1, p1, jsonb_build_object('sub', p1, 'email', 'amina.hadzic@demo.ba'), 'email', p1, NOW(), NOW(), NOW()),
  (p2, p2, jsonb_build_object('sub', p2, 'email', 'miroslav.petrovic@demo.ba'), 'email', p2, NOW(), NOW(), NOW()),
  (p3, p3, jsonb_build_object('sub', p3, 'email', 'lejla.memic@demo.ba'), 'email', p3, NOW(), NOW(), NOW()),
  (p4, p4, jsonb_build_object('sub', p4, 'email', 'dragan.kovacevic@demo.ba'), 'email', p4, NOW(), NOW(), NOW()),
  (p5, p5, jsonb_build_object('sub', p5, 'email', 'selma.begovic@demo.ba'), 'email', p5, NOW(), NOW(), NOW()),
  (p6, p6, jsonb_build_object('sub', p6, 'email', 'nedim.hodzic@demo.ba'), 'email', p6, NOW(), NOW(), NOW()),
  (p7, p7, jsonb_build_object('sub', p7, 'email', 'ivana.markovic@demo.ba'), 'email', p7, NOW(), NOW(), NOW()),
  (p8, p8, jsonb_build_object('sub', p8, 'email', 'emir.salihovic@demo.ba'), 'email', p8, NOW(), NOW(), NOW()),
  (p9, p9, jsonb_build_object('sub', p9, 'email', 'aldina.dzeko@demo.ba'), 'email', p9, NOW(), NOW(), NOW()),
  (p10, p10, jsonb_build_object('sub', p10, 'email', 'goran.simic@demo.ba'), 'email', p10, NOW(), NOW(), NOW()),
  (p11, p11, jsonb_build_object('sub', p11, 'email', 'aida.mujkic@demo.ba'), 'email', p11, NOW(), NOW(), NOW()),
  (p12, p12, jsonb_build_object('sub', p12, 'email', 'borislav.djuric@demo.ba'), 'email', p12, NOW(), NOW(), NOW()),
  (p13, p13, jsonb_build_object('sub', p13, 'email', 'jasmina.halilovic@demo.ba'), 'email', p13, NOW(), NOW(), NOW()),
  (p14, p14, jsonb_build_object('sub', p14, 'email', 'mladen.todorovic@demo.ba'), 'email', p14, NOW(), NOW(), NOW()),
  (p15, p15, jsonb_build_object('sub', p15, 'email', 'emina.kovac@demo.ba'), 'email', p15, NOW(), NOW(), NOW()),
  (p16, p16, jsonb_build_object('sub', p16, 'email', 'nikola.jovanovic@demo.ba'), 'email', p16, NOW(), NOW(), NOW()),
  (p17, p17, jsonb_build_object('sub', p17, 'email', 'sabina.music@demo.ba'), 'email', p17, NOW(), NOW(), NOW()),
  (p18, p18, jsonb_build_object('sub', p18, 'email', 'dino.hasanovic@demo.ba'), 'email', p18, NOW(), NOW(), NOW()),
  (p19, p19, jsonb_build_object('sub', p19, 'email', 'vedrana.ilic@demo.ba'), 'email', p19, NOW(), NOW(), NOW()),
  (p20, p20, jsonb_build_object('sub', p20, 'email', 'adnan.becirovic@demo.ba'), 'email', p20, NOW(), NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- SADA KREIRAJ PROFILE
  -- ============================================
  
  INSERT INTO profiles (
    id, email, first_name, last_name, phone, profile_image_url, slug,
    personal_city_id, business_type, company_name, website, tax_id,
    business_street, business_city_id, years_experience,
    short_description, long_description,
    works_online, has_physical_office, works_locally_only,
    latitude, longitude, linkedin_url, facebook_url,
    license_type, license_number, is_license_verified,
    is_active, registration_completed
  ) VALUES
  
  -- 1. Amina Hadžić - Sarajevo
  (p1, 'amina.hadzic@demo.ba', 'Amina', 'Hadžić', '+387 61 123 456',
   'https://ui-avatars.com/api/?name=Amina+Hadzic&background=3b82f6&color=fff&size=200',
   'amina-hadzic', sarajevo_id, 'individual', NULL,
   'https://www.aminahadzic-racunovodstvo.ba', '123456789012',
   'Ferhadija 15', sarajevo_id, 12,
   'Certificirana računovođa sa 12 godina iskustva u malim i srednjim preduzećima.',
   'Pružam kompletne knjigovodstvene i računovodstvene usluge za mala i srednja preduzeća. Specijalizirana sam za IT sektor i startupe. Nudim personaliziran pristup svakom klijentu i garantujem tačnost i pravovremeno izvještavanje. Radim sa najmodernijim softverskim rješenjima i nudim mogućnost online saradnje.',
   true, true, false, 43.8563, 18.4131, 'https://linkedin.com/in/aminahadzic', NULL,
   'certified_accountant', 'CA-2012-001', true, true, true),
  
  -- 2. Miroslav Petrović - Banja Luka
  (p2, 'miroslav.petrovic@demo.ba', 'Miroslav', 'Petrović', '+387 65 234 567',
   'https://ui-avatars.com/api/?name=Miroslav+Petrovic&background=10b981&color=fff&size=200',
   'miroslav-petrovic', banja_luka_id, 'company', 'Petrović Računovodstvo d.o.o.',
   'https://www.petrovicracunovodstvo.ba', '987654321098',
   'Kralja Petra I 42', banja_luka_id, 18,
   'Vlasnik računovodstvene agencije sa preko 18 godina iskustva.',
   'Petrović Računovodstvo d.o.o. je vodeća računovodstvena agencija u Banjoj Luci sa timom od 5 certificiranih računovođa. Pružamo kompletne usluge od vođenja poslovnih knjiga, obračuna plata, poreskog savjetovanja do finansijskog planiranja. Imamo iskustva sa svim vrstama djelatnosti.',
   true, true, false, 44.7722, 17.1910, 'https://linkedin.com/in/miroslavpetrovic', 'https://facebook.com/petrovicracunovodstvo',
   'certified_accountant', 'CA-2006-042', true, true, true),
  
  -- 3. Lejla Memić - Tuzla
  (p3, 'lejla.memic@demo.ba', 'Lejla', 'Memić', '+387 62 345 678',
   'https://ui-avatars.com/api/?name=Lejla+Memic&background=8b5cf6&color=fff&size=200',
   'lejla-memic', tuzla_id, 'individual', NULL,
   NULL, '456789012345',
   'Turalibegova 28', tuzla_id, 8,
   'Mlada i ambiciozna računovođa specijalizirana za e-commerce.',
   'Specijalizirana sam za pružanje računovodstvenih usluga online trgovcima i e-commerce preduzećima. Razumijem specifičnosti digitalnog poslovanja, uključujući PDV za online prodaju, devizno poslovanje i povezivanje sa platformama poput WooCommerce, Shopify i sličnim. Nudim fleksibilno radno vrijeme i brzu komunikaciju.',
   true, false, false, 44.5384, 18.6763, NULL, 'https://facebook.com/lejlamemicracunovodstvo',
   'certified_accounting_technician', 'CAT-2016-089', true, true, true),
  
  -- 4. Dragan Kovačević - Zenica
  (p4, 'dragan.kovacevic@demo.ba', 'Dragan', 'Kovačević', '+387 63 456 789',
   'https://ui-avatars.com/api/?name=Dragan+Kovacevic&background=f59e0b&color=fff&size=200',
   'dragan-kovacevic', zenica_id, 'company', 'KovačRačun d.o.o.',
   'https://www.kovacracun.ba', '567890123456',
   'Maršala Tita 55', zenica_id, 22,
   'Iskusni revizor i računovođa sa fokusom na proizvodne kompanije.',
   'Sa preko 22 godine iskustva u reviziji i računovodstvu, specijaliziran sam za proizvodne kompanije i industrijski sektor. Pružam usluge eksterne revizije, internog audita, implementacije računovodstvenih sistema i savjetovanja prilikom reorganizacije poslovanja. Moja agencija KovačRačun već 15 godina uspješno sarađuje sa vodećim kompanijama u regiji.',
   false, true, false, 44.2017, 17.9078, 'https://linkedin.com/in/dragankovacevic', NULL,
   'certified_accountant', 'CA-2002-015', true, true, true),
  
  -- 5. Selma Begović - Mostar
  (p5, 'selma.begovic@demo.ba', 'Selma', 'Begović', '+387 66 567 890',
   'https://ui-avatars.com/api/?name=Selma+Begovic&background=ec4899&color=fff&size=200',
   'selma-begovic', mostar_id, 'individual', NULL,
   'https://www.selmabegovicfinansije.ba', '678901234567',
   'Kneza Domagoja 12', mostar_id, 10,
   'Stručnjak za porezno savjetovanje i optimizaciju.',
   'Pružam usluge poreznog savjetovanja sa fokusom na legalne načine optimizacije poreskih obaveza. Pomažem klijentima da razumiju složene poreske propise i iskoriste sve dostupne olakšice. Imam veliko iskustvo sa međunarodnim poslovanjem i transfernim cijenama. Organizujem edukacije za firme o poreskim novitetima.',
   true, true, false, 43.3438, 17.8078, 'https://linkedin.com/in/selmabegovic', 'https://facebook.com/selmabegovicfinansije',
   'certified_accountant', 'CA-2014-078', true, true, true),
  
  -- 6. Nedim Hodžić - Sarajevo
  (p6, 'nedim.hodzic@demo.ba', 'Nedim', 'Hodžić', '+387 61 678 901',
   'https://ui-avatars.com/api/?name=Nedim+Hodzic&background=06b6d4&color=fff&size=200',
   'nedim-hodzic', sarajevo_id, 'company', 'NH Consulting d.o.o.',
   'https://www.nhconsulting.ba', '789012345678',
   'Titova 7', sarajevo_id, 15,
   'Finansijski konsultant i savjetnik za investicije.',
   'NH Consulting pruža vrhunske konsultantske usluge iz oblasti finansija, računovodstva i poslovnog savjetovanja. Pomažemo firmama u izradi poslovnih planova, aplikacijama za kredite i EU fondove, te optimizaciji poslovnih procesa. Tim od 3 stručnjaka sa međunarodnim iskustvom.',
   true, true, false, 43.8598, 18.4315, 'https://linkedin.com/in/nedimhodzic', NULL,
   'certified_accountant', 'CA-2009-033', true, true, true),
  
  -- 7. Ivana Marković - Banja Luka
  (p7, 'ivana.markovic@demo.ba', 'Ivana', 'Marković', '+387 65 789 012',
   'https://ui-avatars.com/api/?name=Ivana+Markovic&background=84cc16&color=fff&size=200',
   'ivana-markovic', banja_luka_id, 'individual', NULL,
   NULL, '890123456789',
   'Vidovdanska 18', banja_luka_id, 5,
   'Računovođa specijalizirana za obračun plata i HR.',
   'Specijalizirana sam za obračun plata, kadrovsku evidenciju i sve što je vezano za radne odnose. Pomažem malim firmama koje nemaju vlastiti HR odjel da vode urednu dokumentaciju o zaposlenicima. Nudim mjesečni paket usluga po pristupačnim cijenama.',
   true, false, true, 44.7661, 17.1821, NULL, 'https://facebook.com/ivanamarkovichr',
   'certified_accounting_technician', 'CAT-2019-156', true, true, true),
  
  -- 8. Emir Salihović - Brčko
  (p8, 'emir.salihovic@demo.ba', 'Emir', 'Salihović', '+387 49 890 123',
   'https://ui-avatars.com/api/?name=Emir+Salihovic&background=f97316&color=fff&size=200',
   'emir-salihovic', brcko_id, 'individual', NULL,
   'https://www.emirsalihovic.ba', '901234567890',
   'Bulevar mira 33', brcko_id, 9,
   'Stručnjak za Brčko Distrikt poreske propise.',
   'Kao računovođa sa sjedištem u Brčko Distriktu, dobro poznajem specifičnosti poreskog sistema ovog područja. Pružam usluge knjigovodstva, računovodstva i poreznog savjetovanja za firme registrovane u Brčkom. Pomažem i firmama iz entiteta koje žele poslovati na području Distrikta.',
   true, true, false, 44.8725, 18.8096, 'https://linkedin.com/in/emirsalihovic', NULL,
   'certified_accountant', 'CA-2015-102', true, true, true),
  
  -- 9. Aldina Džeko - Tuzla
  (p9, 'aldina.dzeko@demo.ba', 'Aldina', 'Džeko', '+387 62 901 234',
   'https://ui-avatars.com/api/?name=Aldina+Dzeko&background=a855f7&color=fff&size=200',
   'aldina-dzeko', tuzla_id, 'company', 'Džeko Finansije d.o.o.',
   'https://www.dzekofinansije.ba', '012345678901',
   'Slatina 5', tuzla_id, 14,
   'Računovodstvena agencija sa kompletnom ponudom usluga.',
   'Džeko Finansije je porodična firma sa tradicijom od 14 godina. Pružamo kompletne računovodstvene usluge za preduzeća svih veličina. Naš tim od 4 računovođe garantuje profesionalnost, tačnost i povjerljivost. Radimo sa klijentima iz različitih industrija uključujući trgovinu, ugostiteljstvo, IT i proizvodnju.',
   true, true, false, 44.5403, 18.6729, 'https://linkedin.com/in/aldinadzeko', 'https://facebook.com/dzekofinansije',
   'certified_accountant', 'CA-2010-067', true, true, true),
  
  -- 10. Goran Simić - Zenica
  (p10, 'goran.simic@demo.ba', 'Goran', 'Simić', '+387 63 012 345',
   'https://ui-avatars.com/api/?name=Goran+Simic&background=14b8a6&color=fff&size=200',
   'goran-simic', zenica_id, 'individual', NULL,
   NULL, '123456789012',
   'Londža 8', zenica_id, 7,
   'Mladi računovođa fokusiran na digitalizaciju.',
   'Pomažem firmama da digitalizuju svoje poslovanje i pređu na elektronsko knjigovodstvo. Specijaliziran sam za implementaciju ERP sistema, automatizaciju fakturisanja i integraciju sa e-fiskalizacijom. Ako želite modernizirati vaše računovodstvo, ja sam pravi izbor.',
   true, false, false, 44.2032, 17.9019, 'https://linkedin.com/in/goransimic', NULL,
   'certified_accounting_technician', 'CAT-2017-201', true, true, true),
  
  -- 11. Aida Mujkić - Sarajevo
  (p11, 'aida.mujkic@demo.ba', 'Aida', 'Mujkić', '+387 61 111 222',
   'https://ui-avatars.com/api/?name=Aida+Mujkic&background=e11d48&color=fff&size=200',
   'aida-mujkic', sarajevo_id, 'individual', NULL,
   'https://www.aidamujkic.ba', '234567890123',
   'Mejtaš 22', sarajevo_id, 11,
   'Ekspert za neprofitne organizacije i udruženja.',
   'Specijalizirana sam za računovodstvo neprofitnih organizacija, udruženja građana, fondacija i humanitarnih organizacija. Razumijem specifične zahtjeve ovog sektora uključujući izvještavanje donatorima, projekte finansirane iz EU fondova i transparentnost poslovanja.',
   true, true, false, 43.8622, 18.4188, NULL, 'https://facebook.com/aidamujkicracunovodstvo',
   'certified_accountant', 'CA-2013-055', true, true, true),
  
  -- 12. Borislav Đurić - Banja Luka
  (p12, 'borislav.djuric@demo.ba', 'Borislav', 'Đurić', '+387 65 222 333',
   'https://ui-avatars.com/api/?name=Borislav+Djuric&background=7c3aed&color=fff&size=200',
   'borislav-djuric', banja_luka_id, 'company', 'Đurić & Partneri d.o.o.',
   'https://www.djuricpartneri.ba', '345678901234',
   'Mladena Stojanovića 15', banja_luka_id, 25,
   'Renomirana revizorska kuća sa dugogodišnjom tradicijom.',
   'Đurić & Partneri je vodeća revizorska kuća u Republici Srpskoj sa 25 godina iskustva. Pružamo usluge zakonske revizije, revizije projekata, due diligence, procjene vrijednosti preduzeća i forenzičke revizije. Naš tim čine certificirani revizori, računovođe i finansijski analitičari.',
   false, true, false, 44.7701, 17.1877, 'https://linkedin.com/in/borislavdjuric', NULL,
   'certified_accountant', 'CA-1999-008', true, true, true),
  
  -- 13. Jasmina Halilović - Mostar
  (p13, 'jasmina.halilovic@demo.ba', 'Jasmina', 'Halilović', '+387 66 333 444',
   'https://ui-avatars.com/api/?name=Jasmina+Halilovic&background=0ea5e9&color=fff&size=200',
   'jasmina-halilovic', mostar_id, 'individual', NULL,
   NULL, '456789012345',
   'Ante Starčevića 9', mostar_id, 6,
   'Računovođa za male poduzetnike i obrtnike.',
   'Pružam pristupačne računovodstvene usluge za male poduzetnike, obrtnike i freelancere. Razumijem izazove malog biznisa i nudim fleksibilne pakete usluga prilagođene vašim potrebama i budžetu. Besplatne konsultacije za nove klijente!',
   true, false, true, 43.3442, 17.8130, NULL, 'https://facebook.com/jasminahalilovicracunovodstvo',
   'certified_accounting_technician', 'CAT-2018-178', true, true, true),
  
  -- 14. Mladen Todorović - Tuzla
  (p14, 'mladen.todorovic@demo.ba', 'Mladen', 'Todorović', '+387 62 444 555',
   'https://ui-avatars.com/api/?name=Mladen+Todorovic&background=22c55e&color=fff&size=200',
   'mladen-todorovic', tuzla_id, 'individual', NULL,
   'https://www.mladentodorovic.ba', '567890123456',
   'Džindić mahala 17', tuzla_id, 16,
   'Iskusni računovođa za građevinske firme.',
   'Specijaliziran sam za računovodstvo građevinskih firmi i projektno računovodstvo. Imam veliko iskustvo sa praćenjem troškova projekata, privremenim situacijama, garancijama i specifičnostima PDV-a u građevinarstvu. Pomažem i kod javnih nabavki.',
   false, true, false, 44.5361, 18.6717, 'https://linkedin.com/in/mladentodorovic', NULL,
   'certified_accountant', 'CA-2008-044', true, true, true),
  
  -- 15. Emina Kovač - Sarajevo
  (p15, 'emina.kovac@demo.ba', 'Emina', 'Kovač', '+387 61 555 666',
   'https://ui-avatars.com/api/?name=Emina+Kovac&background=f43f5e&color=fff&size=200',
   'emina-kovac', sarajevo_id, 'company', 'EK Accounting d.o.o.',
   'https://www.ekaccounting.ba', '678901234567',
   'Obala Kulina bana 30', sarajevo_id, 13,
   'Moderna računovodstvena agencija za međunarodne kompanije.',
   'EK Accounting je specijalizirana agencija za pružanje usluga međunarodnim kompanijama koje posluju u BiH. Nudimo usluge na engleskom jeziku, IFRS izvještavanje, transferne cijene i podršku kod M&A transakcija. Tim sa iskustvom iz Big4 kompanija.',
   true, true, false, 43.8589, 18.4214, 'https://linkedin.com/in/eminakovac', NULL,
   'certified_accountant', 'CA-2011-061', true, true, true),
  
  -- 16. Nikola Jovanović - Banja Luka
  (p16, 'nikola.jovanovic@demo.ba', 'Nikola', 'Jovanović', '+387 65 666 777',
   'https://ui-avatars.com/api/?name=Nikola+Jovanovic&background=6366f1&color=fff&size=200',
   'nikola-jovanovic', banja_luka_id, 'individual', NULL,
   NULL, '789012345678',
   'Ivana Franje Jukića 1', banja_luka_id, 4,
   'Mladi računovođa sa konkurentnim cijenama.',
   'Nudim kvalitetne računovodstvene usluge po vrlo konkurentnim cijenama. Idealan izbor za startupe i mlade firme koje tek počinju sa poslovanjem. Fleksibilan, dostupan i posvećen svakom klijentu.',
   true, false, false, 44.7755, 17.1922, NULL, NULL,
   'certified_accounting_technician', 'CAT-2020-234', true, true, true),
  
  -- 17. Sabina Mušić - Zenica
  (p17, 'sabina.music@demo.ba', 'Sabina', 'Mušić', '+387 63 777 888',
   'https://ui-avatars.com/api/?name=Sabina+Music&background=d946ef&color=fff&size=200',
   'sabina-music', zenica_id, 'company', 'Mušić Računovodstvo',
   'https://www.musicracunovodstvo.ba', '890123456789',
   'Masarykova 46', zenica_id, 19,
   'Porodična računovodstvena agencija sa tradicijom.',
   'Mušić Računovodstvo je porodična firma koju je osnovao moj otac prije 30 godina. Nastavljam tradiciju kvalitetnog i pouzdanog pružanja usluga. Imamo bazu od preko 50 lojalnih klijenata iz različitih industrija. Ponosimo se ličnim pristupom i dostupnošću.',
   true, true, false, 44.1998, 17.9044, 'https://linkedin.com/in/sabinamusic', 'https://facebook.com/musicracunovodstvo',
   'certified_accountant', 'CA-2005-029', true, true, true),
  
  -- 18. Dino Hasanović - Brčko
  (p18, 'dino.hasanovic@demo.ba', 'Dino', 'Hasanović', '+387 49 888 999',
   'https://ui-avatars.com/api/?name=Dino+Hasanovic&background=ea580c&color=fff&size=200',
   'dino-hasanovic', brcko_id, 'individual', NULL,
   NULL, '901234567890',
   'Dubrave 12', brcko_id, 3,
   'Novi računovođa sa svježim znanjem.',
   'Kao novo certificirani računovodstveni tehničar, nudim moderne pristupe i svježe znanje. Pratim sve zakonske promjene i koristim najnovije softverske alate. Posebno dobro radim sa mladim preduzetnicima koji traže nekoga ko razumije digitalno poslovanje.',
   true, false, false, 44.8698, 18.8109, NULL, 'https://facebook.com/dinohasanovicracunovodstvo',
   'certified_accounting_technician', 'CAT-2022-312', false, true, true),
  
  -- 19. Vedrana Ilić - Mostar
  (p19, 'vedrana.ilic@demo.ba', 'Vedrana', 'Ilić', '+387 66 999 000',
   'https://ui-avatars.com/api/?name=Vedrana+Ilic&background=16a34a&color=fff&size=200',
   'vedrana-ilic', mostar_id, 'company', 'Ilić Tax Advisory d.o.o.',
   'https://www.ilictax.ba', '012345678901',
   'Kralja Tvrtka 8', mostar_id, 17,
   'Vodeći stručnjak za porezno savjetovanje u Hercegovini.',
   'Ilić Tax Advisory je specijalizirana firma za porezno savjetovanje i planiranje. Pružamo usluge porezne optimizacije, zastupanja pred poreznim organima, izrade poreznih prijava i savjetovanja kod kompleksnih transakcija. Radimo i sa fizičkim licima koja imaju kompleksnu imovinsku situaciju.',
   true, true, false, 43.3470, 17.8011, 'https://linkedin.com/in/vedranailic', NULL,
   'certified_accountant', 'CA-2007-038', true, true, true),
  
  -- 20. Adnan Bećirović - Sarajevo
  (p20, 'adnan.becirovic@demo.ba', 'Adnan', 'Bećirović', '+387 61 000 111',
   'https://ui-avatars.com/api/?name=Adnan+Becirovic&background=0891b2&color=fff&size=200',
   'adnan-becirovic', sarajevo_id, 'individual', NULL,
   'https://www.adnanbecirovic.ba', '123456789012',
   'Zmaja od Bosne 50', sarajevo_id, 20,
   'Višegodišnji stručnjak za finansijsko izvještavanje.',
   'Sa 20 godina iskustva u finansijskom izvještavanju, pomažem kompanijama da pripreme kvalitetne finansijske izvještaje u skladu sa MRS/MSFI standardima. Radim kao eksterni CFO za više kompanija i pružam strateško finansijsko savjetovanje upravi i vlasnicima.',
   true, true, false, 43.8519, 18.3899, 'https://linkedin.com/in/adnanbecirovic', NULL,
   'certified_accountant', 'CA-2004-021', true, true, true)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- DODAJ USLUGE ZA PROFILE
  -- ============================================
  
  INSERT INTO profile_services (profile_id, service_id) VALUES
  -- Amina - Knjigovodstvo, Računovodstvo, Obračun plata
  (p1, svc_knjigovodstvo), (p1, svc_racunovodstvo), (p1, svc_plate),
  -- Miroslav - Sve usluge
  (p2, svc_knjigovodstvo), (p2, svc_racunovodstvo), (p2, svc_porez), (p2, svc_finansije), (p2, svc_plate), (p2, svc_konsalting),
  -- Lejla - Knjigovodstvo, Računovodstvo
  (p3, svc_knjigovodstvo), (p3, svc_racunovodstvo),
  -- Dragan - Revizija, Računovodstvo, Konsalting
  (p4, svc_revizija), (p4, svc_racunovodstvo), (p4, svc_konsalting),
  -- Selma - Porez, Finansije, Konsalting
  (p5, svc_porez), (p5, svc_finansije), (p5, svc_konsalting),
  -- Nedim - Finansije, Konsalting
  (p6, svc_finansije), (p6, svc_konsalting),
  -- Ivana - Obračun plata
  (p7, svc_plate),
  -- Emir - Knjigovodstvo, Računovodstvo, Porez
  (p8, svc_knjigovodstvo), (p8, svc_racunovodstvo), (p8, svc_porez),
  -- Aldina - Knjigovodstvo, Računovodstvo, Plate
  (p9, svc_knjigovodstvo), (p9, svc_racunovodstvo), (p9, svc_plate),
  -- Goran - Knjigovodstvo, Konsalting
  (p10, svc_knjigovodstvo), (p10, svc_konsalting),
  -- Aida - Knjigovodstvo, Računovodstvo
  (p11, svc_knjigovodstvo), (p11, svc_racunovodstvo),
  -- Borislav - Revizija, Finansije, Konsalting
  (p12, svc_revizija), (p12, svc_finansije), (p12, svc_konsalting),
  -- Jasmina - Knjigovodstvo, Plate
  (p13, svc_knjigovodstvo), (p13, svc_plate),
  -- Mladen - Knjigovodstvo, Računovodstvo
  (p14, svc_knjigovodstvo), (p14, svc_racunovodstvo),
  -- Emina - Računovodstvo, Porez, Finansije, Konsalting
  (p15, svc_racunovodstvo), (p15, svc_porez), (p15, svc_finansije), (p15, svc_konsalting),
  -- Nikola - Knjigovodstvo
  (p16, svc_knjigovodstvo),
  -- Sabina - Knjigovodstvo, Računovodstvo, Plate
  (p17, svc_knjigovodstvo), (p17, svc_racunovodstvo), (p17, svc_plate),
  -- Dino - Knjigovodstvo
  (p18, svc_knjigovodstvo),
  -- Vedrana - Porez, Finansije, Konsalting
  (p19, svc_porez), (p19, svc_finansije), (p19, svc_konsalting),
  -- Adnan - Računovodstvo, Finansije, Konsalting
  (p20, svc_racunovodstvo), (p20, svc_finansije), (p20, svc_konsalting)
  ON CONFLICT (profile_id, service_id) DO NOTHING;

  -- ============================================
  -- DODAJ RADNO VRIJEME (za neke profile)
  -- ============================================
  
  -- Amina - Ponedjeljak do Petak 8-16
  INSERT INTO working_hours (profile_id, day_of_week, start_time, end_time, is_closed) VALUES
  (p1, 1, '08:00', '16:00', false), (p1, 2, '08:00', '16:00', false),
  (p1, 3, '08:00', '16:00', false), (p1, 4, '08:00', '16:00', false),
  (p1, 5, '08:00', '16:00', false), (p1, 6, NULL, NULL, true), (p1, 0, NULL, NULL, true)
  ON CONFLICT (profile_id, day_of_week) DO NOTHING;
  
  -- Miroslav - Ponedjeljak do Subota
  INSERT INTO working_hours (profile_id, day_of_week, start_time, end_time, is_closed) VALUES
  (p2, 1, '08:00', '17:00', false), (p2, 2, '08:00', '17:00', false),
  (p2, 3, '08:00', '17:00', false), (p2, 4, '08:00', '17:00', false),
  (p2, 5, '08:00', '17:00', false), (p2, 6, '09:00', '13:00', false), (p2, 0, NULL, NULL, true)
  ON CONFLICT (profile_id, day_of_week) DO NOTHING;
  
  -- Selma - Fleksibilno
  INSERT INTO working_hours (profile_id, day_of_week, start_time, end_time, is_closed) VALUES
  (p5, 1, '09:00', '18:00', false), (p5, 2, '09:00', '18:00', false),
  (p5, 3, '09:00', '18:00', false), (p5, 4, '09:00', '18:00', false),
  (p5, 5, '09:00', '15:00', false), (p5, 6, NULL, NULL, true), (p5, 0, NULL, NULL, true)
  ON CONFLICT (profile_id, day_of_week) DO NOTHING;
  
  -- Nedim - Standardno
  INSERT INTO working_hours (profile_id, day_of_week, start_time, end_time, is_closed) VALUES
  (p6, 1, '08:30', '16:30', false), (p6, 2, '08:30', '16:30', false),
  (p6, 3, '08:30', '16:30', false), (p6, 4, '08:30', '16:30', false),
  (p6, 5, '08:30', '16:30', false), (p6, 6, NULL, NULL, true), (p6, 0, NULL, NULL, true)
  ON CONFLICT (profile_id, day_of_week) DO NOTHING;
  
  -- Borislav - Revizorska kuća
  INSERT INTO working_hours (profile_id, day_of_week, start_time, end_time, is_closed) VALUES
  (p12, 1, '07:30', '16:00', false), (p12, 2, '07:30', '16:00', false),
  (p12, 3, '07:30', '16:00', false), (p12, 4, '07:30', '16:00', false),
  (p12, 5, '07:30', '16:00', false), (p12, 6, NULL, NULL, true), (p12, 0, NULL, NULL, true)
  ON CONFLICT (profile_id, day_of_week) DO NOTHING;
  
  -- Emina - Međunarodna agencija
  INSERT INTO working_hours (profile_id, day_of_week, start_time, end_time, is_closed) VALUES
  (p15, 1, '09:00', '17:00', false), (p15, 2, '09:00', '17:00', false),
  (p15, 3, '09:00', '17:00', false), (p15, 4, '09:00', '17:00', false),
  (p15, 5, '09:00', '17:00', false), (p15, 6, NULL, NULL, true), (p15, 0, NULL, NULL, true)
  ON CONFLICT (profile_id, day_of_week) DO NOTHING;

  -- ============================================
  -- DODAJ REFERENCE KLIJENATA (za neke profile)
  -- ============================================
  
  INSERT INTO client_references (profile_id, client_name, description) VALUES
  -- Miroslav
  (p2, 'Metalpromet d.o.o.', 'Vođenje kompletnog računovodstva već 10 godina'),
  (p2, 'AutoKuća Petrović', 'Obračun plata za 25 zaposlenika'),
  (p2, 'Hotel Bosna', 'Porezno savjetovanje i optimizacija'),
  -- Dragan
  (p4, 'Zenica Steel', 'Eksterna revizija finansijskih izvještaja'),
  (p4, 'Građevinar d.d.', 'Implementacija novog ERP sistema'),
  -- Nedim
  (p6, 'TechStart d.o.o.', 'Finansijsko savjetovanje za startup'),
  (p6, 'Green Energy BiH', 'Izrada poslovnog plana za EU fondove'),
  -- Aldina
  (p9, 'Trgopromet Tuzla', 'Kompletno računovodstvo'),
  (p9, 'Restoran Stari Grad', 'Knjigovodstvo i obračun plata'),
  -- Borislav
  (p12, 'Telekom Srpske', 'Zakonska revizija'),
  (p12, 'Rudnik Prijedor', 'Due diligence prije akvizicije'),
  (p12, 'NLB Banka', 'Procjena vrijednosti nekretnina'),
  -- Emina
  (p15, 'Siemens BiH', 'IFRS izvještavanje za matičnu kompaniju'),
  (p15, 'DHL Express', 'Mjesečno računovodstvo i reporting'),
  -- Sabina
  (p17, 'Zenica Commerce', 'Dugogodišnja saradnja na knjigovodstvu'),
  (p17, 'Pekara Mušić', 'Porodični biznis - kompletne usluge'),
  -- Vedrana
  (p19, 'Aluminij d.d.', 'Porezno savjetovanje'),
  (p19, 'HT Mostar', 'Izrada transfernih cijena'),
  -- Adnan
  (p20, 'Energopetrol', 'Eksterni CFO usluge'),
  (p20, 'BBI Banka', 'Konsultacije za MSFI 9 implementaciju');

END $$;

-- ============================================
-- NAPOMENA: Za produkciju
-- ============================================
-- Ova migracija dodaje testne podatke SA auth.users zapisima
-- Korisnici imaju lozinku: DemoPassword123!
-- Za pravu produkciju, uklonite ovu migraciju
-- ili obrišite ove korisnike iz auth.users tabele
-- ============================================
