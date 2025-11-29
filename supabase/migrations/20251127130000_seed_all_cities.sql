-- ============================================
-- SEED DATA: Kompletna lista gradova BiH
-- ============================================
-- Ovaj fajl dodaje sve gradove BiH sa:
-- - Poštanskim brojevima
-- - Entitetima (FBiH, RS, Brčko)
-- - Kantonima (za FBiH)
-- ============================================

-- Prvo obrišimo postojeće gradove da izbjegnemo duplikate
-- (zadržavamo samo one koji su referencirani u profiles)
DELETE FROM cities WHERE id NOT IN (
  SELECT DISTINCT personal_city_id FROM profiles WHERE personal_city_id IS NOT NULL
  UNION
  SELECT DISTINCT business_city_id FROM profiles WHERE business_city_id IS NOT NULL
);

-- ============================================
-- REPUBLIKA SRPSKA - GRADOVI
-- ============================================

DO $$
DECLARE
  rs_id UUID;
BEGIN
  SELECT id INTO rs_id FROM entities WHERE code = 'rs';
  
  -- Regija Trebinje (Istočna Hercegovina)
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Bileća', '89230', rs_id, NULL),
  ('Gacko', '89240', rs_id, NULL),
  ('Nevesinje', '88280', rs_id, NULL),
  ('Trebinje', '89101', rs_id, NULL)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- Regija Foča
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Čajniče', '73280', rs_id, NULL),
  ('Foča', '73300', rs_id, NULL),
  ('Kalinovik', '71230', rs_id, NULL),
  ('Istočni Mostar', '88104', rs_id, NULL)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- Regija Sarajevsko-romanijska (Istočno Sarajevo)
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Istočna Ilidža', '71216', rs_id, NULL),
  ('Istočni Stari Grad', '71144', rs_id, NULL),
  ('Istočno Sarajevo', '71123', rs_id, NULL),
  ('Pale', '71420', rs_id, NULL),
  ('Sokolac', '71350', rs_id, NULL),
  ('Trnovo', '71220', rs_id, NULL)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- Regija Srednje Podrinje (Zvornik)
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Bratunac', '75420', rs_id, NULL),
  ('Han Pijesak', '71360', rs_id, NULL),
  ('Milići', '75446', rs_id, NULL),
  ('Osmaci', '75439', rs_id, NULL),
  ('Rogatica', '73220', rs_id, NULL),
  ('Šekovići', '75450', rs_id, NULL),
  ('Srebrenica', '75430', rs_id, NULL),
  ('Višegrad', '73240', rs_id, NULL),
  ('Vlasenica', '75440', rs_id, NULL),
  ('Zvornik', '75400', rs_id, NULL),
  ('Novo Goražde', '73202', rs_id, NULL),
  ('Rudo', '73260', rs_id, NULL)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- Regija Bijeljina (Semberija)
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Bijeljina', '76300', rs_id, NULL),
  ('Lopare', '75240', rs_id, NULL),
  ('Ugljevik', '76330', rs_id, NULL)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- Regija Doboj
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Brod', '74450', rs_id, NULL),
  ('Derventa', '74400', rs_id, NULL),
  ('Doboj', '74000', rs_id, NULL),
  ('Donji Žabar', '76273', rs_id, NULL),
  ('Modriča', '74480', rs_id, NULL),
  ('Pelagićevo', '76256', rs_id, NULL),
  ('Petrovo', '74317', rs_id, NULL),
  ('Šamac', '76230', rs_id, NULL),
  ('Stanari', '74208', rs_id, NULL),
  ('Teslić', '74270', rs_id, NULL),
  ('Vukosavlje', '74470', rs_id, NULL)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- Regija Banja Luka
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Banja Luka', '78000', rs_id, NULL),
  ('Čelinac', '78240', rs_id, NULL),
  ('Gradiška', '78400', rs_id, NULL),
  ('Jezero', '70206', rs_id, NULL),
  ('Kneževo', '70260', rs_id, NULL),
  ('Kostajnica', '79224', rs_id, NULL),
  ('Kotor Varoš', '78220', rs_id, NULL),
  ('Kozarska Dubica', '79240', rs_id, NULL),
  ('Krupa na Uni', '79208', rs_id, NULL),
  ('Laktaši', '78250', rs_id, NULL),
  ('Mrkonjić Grad', '70260', rs_id, NULL),
  ('Novi Grad', '79220', rs_id, NULL),
  ('Oštra Luka', '79290', rs_id, NULL),
  ('Prijedor', '79101', rs_id, NULL),
  ('Prnjavor', '78430', rs_id, NULL),
  ('Ribnik', '79288', rs_id, NULL),
  ('Šipovo', '70270', rs_id, NULL),
  ('Srbac', '78420', rs_id, NULL)
  ON CONFLICT (name, postal_code) DO NOTHING;

END $$;

-- ============================================
-- FEDERACIJA BIH - GRADOVI PO KANTONIMA
-- ============================================

DO $$
DECLARE
  fbih_id UUID;
  kanton_sarajevo UUID;
  kanton_hnk UUID;
  kanton_zhk UUID;
  kanton_sbk UUID;
  kanton_bpk UUID;
  kanton_zdk UUID;
  kanton_tk UUID;
  kanton_posavski UUID;
  kanton_usk UUID;
  kanton_10 UUID;
BEGIN
  SELECT id INTO fbih_id FROM entities WHERE code = 'fbih';
  
  -- Dohvati kantone
  SELECT id INTO kanton_sarajevo FROM cantons WHERE name = 'Kanton Sarajevo' AND entity_id = fbih_id;
  SELECT id INTO kanton_hnk FROM cantons WHERE name = 'Hercegovačko-neretvanski kanton' AND entity_id = fbih_id;
  SELECT id INTO kanton_zhk FROM cantons WHERE name = 'Zapadnohercegovački kanton' AND entity_id = fbih_id;
  SELECT id INTO kanton_sbk FROM cantons WHERE name = 'Srednjobosanski kanton' AND entity_id = fbih_id;
  SELECT id INTO kanton_bpk FROM cantons WHERE name = 'Bosansko-podrinjski kanton' AND entity_id = fbih_id;
  SELECT id INTO kanton_zdk FROM cantons WHERE name = 'Zeničko-dobojski kanton' AND entity_id = fbih_id;
  SELECT id INTO kanton_tk FROM cantons WHERE name = 'Tuzlanski kanton' AND entity_id = fbih_id;
  SELECT id INTO kanton_posavski FROM cantons WHERE name = 'Posavski kanton' AND entity_id = fbih_id;
  SELECT id INTO kanton_usk FROM cantons WHERE name = 'Unsko-sanski kanton' AND entity_id = fbih_id;
  SELECT id INTO kanton_10 FROM cantons WHERE name = 'Kanton 10' AND entity_id = fbih_id;
  
  -- ============================================
  -- KANTON SARAJEVO
  -- ============================================
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Sarajevo', '71000', fbih_id, kanton_sarajevo),
  ('Hadžići', '71240', fbih_id, kanton_sarajevo),
  ('Ilidža', '71210', fbih_id, kanton_sarajevo),
  ('Ilijaš', '71380', fbih_id, kanton_sarajevo),
  ('Sarajevo - Centar', '71000', fbih_id, kanton_sarajevo),
  ('Sarajevo - Novi Grad', '71000', fbih_id, kanton_sarajevo),
  ('Sarajevo - Novo Sarajevo', '71000', fbih_id, kanton_sarajevo),
  ('Sarajevo - Stari Grad', '71000', fbih_id, kanton_sarajevo),
  ('Vogošća', '71320', fbih_id, kanton_sarajevo)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- ============================================
  -- ZAPADNOHERCEGOVAČKI KANTON
  -- ============================================
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Grude', '88340', fbih_id, kanton_zhk),
  ('Ljubuški', '88320', fbih_id, kanton_zhk),
  ('Posušje', '88240', fbih_id, kanton_zhk),
  ('Široki Brijeg', '88220', fbih_id, kanton_zhk)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- ============================================
  -- HERCEGOVAČKO-NERETVANSKI KANTON
  -- ============================================
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Mostar', '88000', fbih_id, kanton_hnk),
  ('Čapljina', '88300', fbih_id, kanton_hnk),
  ('Čitluk', '88260', fbih_id, kanton_hnk),
  ('Jablanica', '88420', fbih_id, kanton_hnk),
  ('Konjic', '88400', fbih_id, kanton_hnk),
  ('Neum', '88390', fbih_id, kanton_hnk),
  ('Prozor', '88440', fbih_id, kanton_hnk),
  ('Ravno', '88370', fbih_id, kanton_hnk),
  ('Stolac', '88360', fbih_id, kanton_hnk)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- ============================================
  -- SREDNJOBOSANSKI KANTON
  -- ============================================
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Travnik', '72270', fbih_id, kanton_sbk),
  ('Bugojno', '70230', fbih_id, kanton_sbk),
  ('Busovača', '72260', fbih_id, kanton_sbk),
  ('Dobretići', '70287', fbih_id, kanton_sbk),
  ('Donji Vakuf', '70220', fbih_id, kanton_sbk),
  ('Fojnica', '71270', fbih_id, kanton_sbk),
  ('Gornji Vakuf-Uskoplje', '70240', fbih_id, kanton_sbk),
  ('Jajce', '70101', fbih_id, kanton_sbk),
  ('Kiseljak', '71250', fbih_id, kanton_sbk),
  ('Kreševo', '71260', fbih_id, kanton_sbk),
  ('Novi Travnik', '72290', fbih_id, kanton_sbk),
  ('Vitez', '72250', fbih_id, kanton_sbk)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- ============================================
  -- BOSANSKO-PODRINJSKI KANTON
  -- ============================================
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Goražde', '73000', fbih_id, kanton_bpk),
  ('Ustikolina', '73040', fbih_id, kanton_bpk)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- ============================================
  -- ZENIČKO-DOBOJSKI KANTON
  -- ============================================
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Zenica', '72000', fbih_id, kanton_zdk),
  ('Breza', '71370', fbih_id, kanton_zdk),
  ('Doboj Jug', '74203', fbih_id, kanton_zdk),
  ('Kakanj', '72240', fbih_id, kanton_zdk),
  ('Maglaj', '74250', fbih_id, kanton_zdk),
  ('Olovo', '71340', fbih_id, kanton_zdk),
  ('Tešanj', '74260', fbih_id, kanton_zdk),
  ('Usora', '74230', fbih_id, kanton_zdk),
  ('Vareš', '71330', fbih_id, kanton_zdk),
  ('Visoko', '71300', fbih_id, kanton_zdk),
  ('Zavidovići', '72220', fbih_id, kanton_zdk),
  ('Žepče', '72230', fbih_id, kanton_zdk)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- ============================================
  -- TUZLANSKI KANTON
  -- ============================================
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Tuzla', '75000', fbih_id, kanton_tk),
  ('Banovići', '75290', fbih_id, kanton_tk),
  ('Čelić', '75246', fbih_id, kanton_tk),
  ('Doboj Istok', '74207', fbih_id, kanton_tk),
  ('Gračanica', '75320', fbih_id, kanton_tk),
  ('Gradačac', '76250', fbih_id, kanton_tk),
  ('Kalesija', '75260', fbih_id, kanton_tk),
  ('Kladanj', '75280', fbih_id, kanton_tk),
  ('Lukavac', '75300', fbih_id, kanton_tk),
  ('Sapna', '75411', fbih_id, kanton_tk),
  ('Srebrenik', '75350', fbih_id, kanton_tk),
  ('Teočak', '75414', fbih_id, kanton_tk),
  ('Živinice', '75270', fbih_id, kanton_tk)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- ============================================
  -- POSAVSKI KANTON
  -- ============================================
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Orašje', '76270', fbih_id, kanton_posavski),
  ('Domaljevac', '76233', fbih_id, kanton_posavski),
  ('Odžak', '76290', fbih_id, kanton_posavski)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- ============================================
  -- UNSKO-SANSKI KANTON
  -- ============================================
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Bihać', '77000', fbih_id, kanton_usk),
  ('Bosanska Krupa', '77240', fbih_id, kanton_usk),
  ('Bosanski Petrovac', '77250', fbih_id, kanton_usk),
  ('Bužim', '77223', fbih_id, kanton_usk),
  ('Cazin', '77220', fbih_id, kanton_usk),
  ('Ključ', '79280', fbih_id, kanton_usk),
  ('Sanski Most', '79260', fbih_id, kanton_usk),
  ('Velika Kladuša', '77230', fbih_id, kanton_usk)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- ============================================
  -- KANTON 10 (LIVANJSKI / HERCEGBOSANSKI)
  -- ============================================
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Livno', '80101', fbih_id, kanton_10),
  ('Bosansko Grahovo', '80270', fbih_id, kanton_10),
  ('Drvar', '80260', fbih_id, kanton_10),
  ('Glamoč', '80230', fbih_id, kanton_10),
  ('Kupres', '80320', fbih_id, kanton_10),
  ('Tomislavgrad', '80240', fbih_id, kanton_10)
  ON CONFLICT (name, postal_code) DO NOTHING;

END $$;

-- ============================================
-- BRČKO DISTRIKT
-- ============================================

DO $$
DECLARE
  brcko_id UUID;
BEGIN
  SELECT id INTO brcko_id FROM entities WHERE code = 'brcko';
  
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Brčko', '76100', brcko_id, NULL)
  ON CONFLICT (name, postal_code) DO NOTHING;
  
  -- Brekovići - ovo je naselje u Brčkom
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Brekovići', '76100', brcko_id, NULL)
  ON CONFLICT (name, postal_code) DO NOTHING;

END $$;

-- ============================================
-- TRNOVO - Napomena: Postoje dva Trnova
-- Jedno u RS (već dodano gore), jedno u FBiH
-- ============================================

DO $$
DECLARE
  fbih_id UUID;
  kanton_sarajevo UUID;
BEGIN
  SELECT id INTO fbih_id FROM entities WHERE code = 'fbih';
  SELECT id INTO kanton_sarajevo FROM cantons WHERE name = 'Kanton Sarajevo' AND entity_id = fbih_id;
  
  -- Trnovo FBiH (ima drugačiji poštanski broj od RS Trnova)
  INSERT INTO cities (name, postal_code, entity_id, canton_id) VALUES
  ('Trnovo', '71223', fbih_id, kanton_sarajevo)
  ON CONFLICT (name, postal_code) DO NOTHING;

END $$;

-- ============================================
-- STATISTIKA
-- ============================================
-- Ukupno gradova: ~130
-- RS: ~55 gradova
-- FBiH: ~73 grada (po kantonima)
-- Brčko Distrikt: 2
-- ============================================
