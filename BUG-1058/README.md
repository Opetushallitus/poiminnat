# Kevään 2016 Korkeakouluhaun tuloskirjeiden poiminta

Tässä poiminnassa haetaan haussa lähetettyjen tuloskirjeiden määrä eriteltynä korkeakouluittain ja kirjetyypeittäin. Tämä sen vuoksi, että OPH lähettää kirjeet, mutta kouluilta peritään korvaus hakijamäärien suhteessa.

###Alkuvalmistelut

1. Asenna node.

1. Aja `npm install`.

1. Hae Tarjontapalvelun haun hallinnasta exceltiedosto haun hakukohteista. Ota siitä talteen hakukohteen oidi ja vastaavan organisaation nimi. Tallenna tämä JSONin `hakukohdeToOrganisaatio.json` tiedostoksi. Katso esimerkkitiedostosta mallia.

    https://virkailija.opintopolku.fi/tarjonta-app/index.html#/haku/1.2.246.562.29.75203638285

1. Päivitä tiedostosta `1_haePostillaLahetetytHenkilot.sql` tarvittavat päivämärät ja haun oid. Vaihtoehdoisesti voit määritellä tunnetut kirjelähetys idt käsin.

    ```
    SELECT * 
        FROM kirjeet.kirjelahetys k
        WHERE k.aikaleima > '[start]' AND k.aikaleima < '[end]' AND k.iposti = true;
    ```

1. Päivitä tiedostosta `2_hae_hakemus_oidit.js` password ja mongoUrl vastaamaan virkailijamongon (`mongodb1.prod.oph.ware.fi`) tietoja.

1. Avaa ssh putket kantoihin:

        viestinta-db.prod.oph.ware.fi:5432
        mongodb1.prod.oph.ware.fi:27017
            - mahdollisesti 2 tai 3 riippuen mikä koneista on master

###Poiminta

1. Aja `1_haePostillaLahetetytHenkilot.sql` viestinta-db.prod.oph.ware.fi:5432 kantaa vasten ja tallenna tulokset csv:nä. `postillaLahetetytHenkilotJaMaat.csv`.
    1. Tai vaihtoehtoisesti kopioi sql-kysely pgAdminiin ja "Query execute to file", Quote char tyhjä ja lisää tiedostoon {} alkuun ja loppuun sekä poista lopusta viimeinen , (pilkku) jolloin saat valmiiksi kohdassa kaksi tarvittavan json-tiedoston.

1. Muokkaa csv:stä json tiedosto `postillaLahetetytHenkilotJaMaat.json`, jossa jokaista henkilöoidia vastaa maakoodi. Katso esimerkkitiedostosta mallia.

1. Poimi sijoitteluajoId hakemalla tuotannosta jonkin hakukohteen suurin sijoitteluajoId ja laita se 2_hae_hakemus_oidit.js tiedostoon.

1. Aja `node 2_hae_hakemus_oidit.js` (tässä kohdassa tarvitset yhteyden Mongoon.)

1. Ota tulokset tiedostosta `hakemukset.csv` Exceliin ja muokkaa virkailijayhteensopivaksi.

