
#Ammatillinen reformi

1.8.2018 Ammatillinen perustutkinto sekä Ammatillinen perustutkinto näyttönä poistuvat käytöstä. Tarjontaan on tehty esto, ettei näillä koulutustyypeillä voi luoda uusi koulutuksia jotka alkavat 1.8.2018 jälkeen. Tarjonnassa on mahdollista kuitenkin kopioida Hakuja vanhoilla koulutustyypeillä. Näissä hauissa olevat koulutukset joiden tyypit ovat AMMATILLINEN_PERUSTUTKINTO(koulutustyyppi_1) ja AMMATILLINEN_PERUSTUTKINTO_NAYTTOTUTKINTONA(koulutustyyppi_13) tulee kuitenkin vaihaa uuden tyyppiseksi koulutustyypiksi AMMATILLINEN_PERUSTUTKINTO_ALK_2018 (koulutustyyppi_26). Niinpä tarvitaan scripti joka tämän muutoksen osaa tehdä.

Uudessa koulutustyypissä pohjakoulutusvaatimus ei ole pakollinen koulutuksessa, vaan se on siirretty hakukohteelle. Nyt siis tarvitaan scripti joka tietyllä haku.oidilla olevat hakukohteet ja koulutuksille tekee seuraavaa

##Tarkistusscripti joka tekee seuraavaa

1. Tarkistaa että koulutuksilla jotka ovat tyyppiä 1 ja 13 linkitetyillä komotoilla on koulutustyyppi 26 linkitettynä jotta kopiointi ei hajoita mitään.

##Siirtoscripti joka tekee seuraavat

1. Muuntaa koulutustyypeillä 1 ja 13 olevat koulutukset uudelle koulutustyypille 26
2. Siirtää koulutustyypeillä 1 ja 13 olevien koulutuksien pohjakoulutusvaatimukset kopioiduille hakukohteille.
3. Poistaa näiltä koulutustyypeiltä koulutuslajit Aikuiskoulutus, Avoin kaikille sekä Nuorten koulutus jotka ovat poistuneet tuolta uudelta koulutustyypiltä


