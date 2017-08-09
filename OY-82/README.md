Tehtävä:
Ne henkilöt, joilla on perusopetuksen tai kymppiluokan suoritus 2017, mutta eivät ole hakeneet missään perusopetusen jälkeisen koulutuksen haussa tai lisähaussa.

Haetaan suoritukset suresta:

https://virkailija.opintopolku.fi/suoritusrekisteri/rest/v1/suoritukset/?komo=1.2.246.562.13.62959769647&vuosi=2017 > sure_ysi.json
https://virkailija.opintopolku.fi/suoritusrekisteri/rest/v1/suoritukset/?komo=1.2.246.562.5.2013112814572435044876&vuosi=2017 > sure_kymppi.json

Grepataan henkilöt ulos suorituksista

```
python -mjson.tool sure_ysi.json | grep 'henkiloOid": ".*"' -o | sed 's/henkiloOid": "//' | sed 's/"//' | uniq | sort > sure_ysi_henkilot.csv
python -mjson.tool sure_kymppi.json | grep 'henkiloOid": ".*"' -o | sed 's/henkiloOid": "//' | sed 's/"//' | uniq | sort > sure_kymppi_henkilot.csv
```

Tiedot halutaan näihin hakuihin

- Yhteishaku ammatilliseen ja lukioon, kevät 2017 https://virkailija.opintopolku.fi/tarjonta-app/#/haku/1.2.246.562.29.10108985853
- Lisähaku kevään 2017 ammatillisen ja lukiokoulutuksen yhteishaussa vapaaksi jääneille opiskelupaikoille https://virkailija.opintopolku.fi/tarjonta-app/#/haku/1.2.246.562.29.62377116603
- Perusopetuksen jälkeisen valmistavan koulutuksen kevään 2017 haku https://virkailija.opintopolku.fi/tarjonta-app/#/haku/1.2.246.562.29.57768753733
- Perusopetuksen jälkeisen valmistavan koulutuksen kevään 2017 lisähaku https://virkailija.opintopolku.fi/tarjonta-app/#/haku/1.2.246.562.29.48353453128
- Haku erityisopetuksena järjestettävään ammatilliseen koulutukseen, kevät 2017 https://virkailija.opintopolku.fi/tarjonta-app/#/haku/1.2.246.562.29.57263577488
- Lisähaku erityisopetuksena järjestettävään ammatilliseen koulutukseen, kevät 2017 https://virkailija.opintopolku.fi/tarjonta-app/#/haku/1.2.246.562.29.59213949841

Hakuappista hakeneiden tiedot:

```
db.application.find({applicationSystemId:{$in:['1.2.246.562.29.10108985853','1.2.246.562.29.62377116603','1.2.246.562.29.57768753733','1.2.246.562.29.48353453128','1.2.246.562.29.57263577488','1.2.246.562.29.59213949841']}}, {personOid:1, applicationSystemId:1}).forEach(function(a){print(a.personOid + "," + a.applicationSystemId)}) //hakeneet_haut.csv

db.application.find({applicationSystemId:{$in:['1.2.246.562.29.10108985853','1.2.246.562.29.62377116603','1.2.246.562.29.57768753733','1.2.246.562.29.48353453128','1.2.246.562.29.57263577488','1.2.246.562.29.59213949841']}}, {personOid:1, applicationSystemId:1}).forEach(function(a){print(a.personOid)}) // hakeneet.csv
```

Valintarekisteristä valinnantulokset.csv:
```
select vt.henkilo_oid
from valinnantilat vt
  join hakukohteet h on h.hakukohde_oid = vt.hakukohde_oid
where h.haku_oid in ('1.2.246.562.29.10108985853', '1.2.246.562.29.57768753733', '1.2.246.562.29.57263577488') and
      vt.tila in ('VarasijaltaHyvaksytty', 'Hyvaksytty');
```


###Yhteenveto
####Valmistuneet
```
wc -l sure_ysi_henkilot.csv //58578
wc -l sure_kymppi_henkilot.csv //1616

```

####Hakeneet
```
grep '1.2.246.562.29.10108985853' -c hakeneet_haut.csv 
grep '1.2.246.562.29.62377116603' -c hakeneet_haut.csv 
grep '1.2.246.562.29.57768753733' -c hakeneet_haut.csv 
grep '1.2.246.562.29.48353453128' -c hakeneet_haut.csv 
grep '1.2.246.562.29.57263577488' -c hakeneet_haut.csv 
grep '1.2.246.562.29.59213949841' -c hakeneet_haut.csv 
```

####Valmistuneet mutteivät valitut
```
comm -23 sure_ysi_henkilot.csv hakeneet.csv | wc -l
comm -23 sure_ysi_henkilot.csv valinnantulokset.csv | wc -l
comm -23 sure_kymppi_henkilot.csv hakeneet.csv | wc -l
comm -23 sure_kymppi_henkilot.csv valinnantulokset.csv | wc -l
```
Käsipelillä tehdään vähennuslasku valinnantuloksettomat - ei-hakeneet, niin saadaan hakenee, mutta hylätyt. 

###Tulokset
####valmistuneet
```
ysiltä 58578
kympiltä 1616
```

####Hakeneet
```
Yhteishaku ammatilliseen ja lukioon, kevät 2017     73537
Lisähaku kevään 2017 ammatillisen ja lukiokoulutuksen yhteishaussa vapaaksi jääneille opiskelupaikoille     3421
Perusopetuksen jälkeisen valmistavan koulutuksen kevään 2017 haku   5422
Perusopetuksen jälkeisen valmistavan koulutuksen kevään 2017 lisähaku   71
Haku erityisopetuksena järjestettävään ammatilliseen koulutukseen, kevät 2017   3109
Lisähaku erityisopetuksena järjestettävään ammatilliseen koulutukseen, kevät 2017   72
```
####Puuttuvat
```
Valmistui ysiltä, ei hakenut         790
Valmistui ysiltä, haki muttei valittu         2596
Valmistui kympiltä, ei hakenut          843
Valmistui kympiltä, haki muttei valittu           105
```


