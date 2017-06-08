Tällä scriptillä saa päivitettyä Suoritusrekisteristä KESKEN olevia suorituksia valmis-tilaisiksi
AJA ENSIN TARKISTUS HAUT, JOILLA TARKISTAT LUVUT JA SITTEN AJA PÄIVITYKSET

-- Yhteensä
SELECT count(*) FROM suoritus;
-- 841779
--------------------------------------------------------------

-- Sitten päivitettävien suoritusten lukumäärä
SELECT COUNT(*)
FROM suoritus 
WHERE (
    (komo in(
        '1.2.246.562.13.62959769647',
        '1.2.246.562.13.86722481404',
        '1.2.246.562.5.2013112814572435044876',
        '1.2.246.562.5.2013061010184614853416',
        '1.2.246.562.5.2013112814572438136372',
        'kansanopisto',
        '1.2.246.562.5.2013112814572429142840',
        '1.2.246.562.5.2013112814572435755085',
        'valma',
        'telma'
    ) AND vahvistettu = true
) OR (
    komo = 'TODO lukio komo oid'
    AND vahvistettu = false
))
AND valmistuminen >= '2017-01-01' 
AND valmistuminen <= '2017-06-03'
AND tila = 'KESKEN'
AND current = true;

-- 2984
-- (sama luku tulee jos AND kuvaus IS NULL;)

--------------------------------------------------------------

-- Tarkistus kuinka monta current = true tilaista suoritusta on 
-- tila ehto on pois

SELECT COUNT(*)
FROM suoritus 
WHERE (
    (komo in(
        '1.2.246.562.13.62959769647',
        '1.2.246.562.13.86722481404',
        '1.2.246.562.5.2013112814572435044876',
        '1.2.246.562.5.2013061010184614853416',
        '1.2.246.562.5.2013112814572438136372',
        'kansanopisto',
        '1.2.246.562.5.2013112814572429142840',
        '1.2.246.562.5.2013112814572435755085',
        'valma',
        'telma'
    ) AND vahvistettu = true
) OR (
    komo = 'TODO lukio komo oid'
    AND vahvistettu = false
))
AND valmistuminen >= '2017-01-01' 
AND valmistuminen <= '2017-06-03'
AND current = true;

-- 63593

--------------------------------------------------------------

-- sitten tarkistetaan että näitä on 0 kappaletta tuo kuvaus is not null on se tärkeä, koska 
-- uusilla kantaan lisätyillä tulee olemaan kuvaus 'INSERTED'

SELECT COUNT(*)
FROM suoritus 
WHERE (
    (komo in(
        '1.2.246.562.13.62959769647',
        '1.2.246.562.13.86722481404',
        '1.2.246.562.5.2013112814572435044876',
        '1.2.246.562.5.2013061010184614853416',
        '1.2.246.562.5.2013112814572438136372',
        'kansanopisto',
        '1.2.246.562.5.2013112814572429142840',
        '1.2.246.562.5.2013112814572435755085',
        'valma',
        'telma'
    ) AND vahvistettu = true
) OR (
    komo = 'TODO lukio komo oid'
    AND vahvistettu = false
))
AND valmistuminen >= '2017-01-01' 
AND valmistuminen <= '2017-06-03'
AND tila = 'VALMIS'
AND current = true
AND kuvaus IS NOT NULL;

-- 0
-- 0 PITÄÄ TULLA result 0 myös ilman tila ehtoa

--------------------------------------------------------------

-- sitten lasketaan kuinka monta samanlaista on jo olemassa joita olemme lisäämässä
-- **** käytä lopuksi tarkistuslaskennassa ****

SELECT COUNT(*)
FROM suoritus
WHERE (
    (komo in(
        '1.2.246.562.13.62959769647',
        '1.2.246.562.13.86722481404',
        '1.2.246.562.5.2013112814572435044876',
        '1.2.246.562.5.2013061010184614853416',
        '1.2.246.562.5.2013112814572438136372',
        'kansanopisto',
        '1.2.246.562.5.2013112814572429142840',
        '1.2.246.562.5.2013112814572435755085',
        'valma',
        'telma'
    ) AND vahvistettu = true
) OR (
    komo = 'TODO lukio komo oid'
    AND vahvistettu = false
))
AND valmistuminen >= '2017-01-01' 
AND valmistuminen <= '2017-06-03'
AND tila = 'VALMIS'
AND current = true;


-- 59358
-- ELI 59358 kappaletta noita samanlaisia valmistilaisia, joita olemme lisäämässä
-- tähän tulee tuo 2984 lisää insertin jälkeen)

--------------------------------------------------------------

-- SITTEN INSERTTI JONKA PITÄISI LISÄTÄ 2984

INSERT INTO suoritus (resource_id, komo, myontaja, tila, valmistuminen, henkilo_oid, yksilollistaminen, suoritus_kieli, inserted, deleted, source, kuvaus, vuosi, tyyppi, index, vahvistettu, current) 

SELECT resource_id, komo, myontaja, 'VALMIS', valmistuminen, henkilo_oid, yksilollistaminen, suoritus_kieli, ROUND(1000*extract(epoch from now())), deleted, source, 'INSERTED', vuosi, tyyppi, index, vahvistettu, current
FROM suoritus 
WHERE (
    (komo in(
        '1.2.246.562.13.62959769647',
        '1.2.246.562.13.86722481404',
        '1.2.246.562.5.2013112814572435044876',
        '1.2.246.562.5.2013061010184614853416',
        '1.2.246.562.5.2013112814572438136372',
        'kansanopisto',
        '1.2.246.562.5.2013112814572429142840',
        '1.2.246.562.5.2013112814572435755085',
        'valma',
        'telma'
    ) AND vahvistettu = true
) OR (
    komo = 'TODO lukio komo oid'
    AND vahvistettu = false
))
AND valmistuminen >= '2017-01-01' 
AND valmistuminen <= '2017-06-03'
AND tila = 'KESKEN'
AND current = true;


-- result 2984

--------------------------------------------------------------
-- VANHOJEN suoritusten päivitys joissa ajetaan tuo current falseksi

UPDATE suoritus SET current = false WHERE (
    (komo in(
        '1.2.246.562.13.62959769647',
        '1.2.246.562.13.86722481404',
        '1.2.246.562.5.2013112814572435044876',
        '1.2.246.562.5.2013061010184614853416',
        '1.2.246.562.5.2013112814572438136372',
        'kansanopisto',
        '1.2.246.562.5.2013112814572429142840',
        '1.2.246.562.5.2013112814572435755085',
        'valma',
        'telma'
    ) AND vahvistettu = true
) OR (
    komo = 'TODO lukio komo oid'
    AND vahvistettu = false
))
AND valmistuminen >= '2017-01-01' 
AND valmistuminen <= '2017-06-03'
AND tila = 'KESKEN'
AND current = true
AND kuvaus IS NULL;

-- result 2984

--------------------------------------------------------------
-- sitten päivitetään noissa lisätyissä tuo kuvaus null:iksi

UPDATE suoritus SET kuvaus = NULL WHERE (
    (komo in(
        '1.2.246.562.13.62959769647',
        '1.2.246.562.13.86722481404',
        '1.2.246.562.5.2013112814572435044876',
        '1.2.246.562.5.2013061010184614853416',
        '1.2.246.562.5.2013112814572438136372',
        'kansanopisto',
        '1.2.246.562.5.2013112814572429142840',
        '1.2.246.562.5.2013112814572435755085',
        'valma',
        'telma'
    ) AND vahvistettu = true
) OR (
    komo = 'TODO lukio komo oid'
    AND vahvistettu = false
))
AND valmistuminen >= '2017-01-01' 
AND valmistuminen <= '2017-06-03'
AND tila = 'VALMIS'
AND current = true
AND kuvaus IS NOT NULL;


-- result 2984

--------------------------------------------------------------
-- tarkistuslaskenta
SELECT count(*) FROM suoritus;

-- 844763
-- lisäystä 2984
-- HUOM! tässä voi tulla enemmänkin, jos suorituksia lisätään käsin samaan aikaan

