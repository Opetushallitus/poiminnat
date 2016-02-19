#Poiminta käsittelymaksun maksaneista

##Tiedon lähteet

Tavoitteena on poimia ensimmäisessä vaiheessa kaikki käsittelymaksun maksaneet hakijat. Tiedot löytyvät ulkolomakkeiden osalta Hakuperusteiden Postgres tietokannasta ja sisälomakkeiden osalta Haku-palvelun hakemus-mongokannasta.

Toisessa vaiheessa halutaan kaikki korkeakoulujen yhteishaussa maksetut käsittelymaksut eriteltynä pohjakoulutusmaittain ja korkeakouluittain. Kaikki tarvittavat hakemukset löytyvät Haku-palvelun tietokannasta.

Lisäksi tarvitaan Koodistopalvelusta maakoodien nimet.

##Poiminnan vaiheet

###Koodistopalvelusta haettavat koodistot

[Valtiot ja maat 1](https://virkailija.opintopolku.fi/koodisto-ui/html/index.html#/koodisto/maatjavaltiot1/1) ja [Valtiot ja maat 2](https://virkailija.opintopolku.fi/koodisto-ui/html/index.html#/koodisto/maatjavaltiot2/1) koodistot ladataan CSV-tiedostoina myöhempää käsittelyä varten.

###Kaikki maksaneet

Hakuperusteiden postgreskannasta haetaan kaikki hakemukset ulkolomakkeille ja tallennetaan henkilöiden oidit ja maat CSV:nä.

```
SELECT distinct
  payment.henkilo_oid, 
  application_object.education_country
FROM 
  public.payment,
  public.application_object
WHERE payment.status = 'ok' and payment.henkilo_oid = application_object.henkilo_oid
```

Pienellä koodipätkällä yhdistetään Valtiot ja maat 2 -koodiston suomenkieliset koodiarvot ja edellä luotu lista henkilö-maa pareja. ```1.2.246.562.24.10008050165;586``` -> ```1.2.246.562.24.10008050165;Pakistan```

------

Haku-palvelun kannasta haetaan sellaiset henkilöoidit ja pohjakoulutuksen suoritusmaat, joilla on onnistunut maksu

```
db.getCollection('application').find({requiredPaymentState:"OK"}).forEach(function(s){
    if(s.answers.koulutustausta.pohjakoulutus_ulk_suoritusmaa){
        print(s.personOid + ";" + s.answers.koulutustausta.pohjakoulutus_ulk_suoritusmaa)
    } else if(s.answers.koulutustausta.pohjakoulutus_kk_ulk_maa){
        print(s.personOid + ";" + s.answers.koulutustausta.pohjakoulutus_kk_ulk_maa)
    } else if(s.answers.koulutustausta.pohjakoulutus_yo_ulkomainen_maa){
        print(s.personOid + ";" + s.answers.koulutustausta.pohjakoulutus_yo_ulkomainen_maa)
    }
    })
```

Käytetään yllä mainittua pientä koodinpätkää ja tällä kertaa yhdistetään tietokannan vastaus ja Valtiot ja maat 1 -koodiston arvot: ```1.2.246.562.24.35014735352;CAN```-> ```1.2.246.562.24.35014735352;Kanada```

Yhdistetään listat Excelissä ja poistetaan duplikaatit. QED

###Korkeakoulujen maksutilasto

Haetaan haku-palvelun lomakekannasta korkeakoulujen yhteishaun oidilla kaikkien hakulomakkeiden tiedot. 

```
db.getCollection('application').find({applicationSystemId:"1.2.246.562.29.75203638285", paymentDueDate:{$exists:1}}, 
{
    personOid:1,
    state:1,
    requiredPaymentState:1,
    answers:1
}).forEach(function (s){

    var maa;
    if(s.answers.koulutustausta.pohjakoulutus_ulk_suoritusmaa){
        maa = s.answers.koulutustausta.pohjakoulutus_ulk_suoritusmaa
    } else if(s.answers.koulutustausta.pohjakoulutus_kk_ulk_maa){
        maa = s.answers.koulutustausta.pohjakoulutus_kk_ulk_maa
    } else if(s.answers.koulutustausta.pohjakoulutus_yo_ulkomainen_maa){
        maa = s.answers.koulutustausta.pohjakoulutus_yo_ulkomainen_maa
    }

    print([
        s.personOid,
        s.state,
        s.requiredPaymentState,
        s.answers.hakutoiveet["preference1-Opetuspiste-id"],
        s.answers.hakutoiveet["preference1-Opetuspiste"],
        maa
    ].join(';'))
})
```

Jälleen hyväksikäytetään pientä koodinpätkää, joka yhdistää maakoodin ja maan nimen, ja lisätään riveille koulutusmaan nimi.

Ladataan taulukko Exceliin.

Datassa on mukana duplikaatteja, eli henkilötunnukseton hakija on voinut hakea kahteen kertaan ja maksaa kahteen kertaan. Nämä muutama kymmenen henkilöä pitää karsia käsin, koska ensimmäinen hakutoive merkitsee tässä tapauksessa.

Datasta filteröidään erikseen listat, joissa "hakija on maksanut ja hakemus on aktiivinen" ja "hakija ei ole maksanut ja hakemus ei ole aktiivinen". Tämän jälkeen sopivilla pivottauluilla koostetaan opetuspisteen ja koulutusmaan mukaan lajitellut taulukot. QED