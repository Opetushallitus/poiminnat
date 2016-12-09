var fs = require('fs');
var csv = require('fast-csv');

var writeStream = csv.createWriteStream({headers: false, delimiter: ';'});
var writableStream = fs.createWriteStream("hakemukset.csv");
writeStream.pipe(writableStream);

var MongoClient = require('mongodb').MongoClient;
var user = "oph";
var password = "[PASS]";
var mongoUrl = "mongodb://localhost:1339/sijoitteludb";

var henkilotJaMaat = require('./postillaLahetetytHenkilotJaMaat.json');
var organisaatios = require('./hakukohdeToOrganisaatio.json');

// helpers
var hylattyOrg = null;
var inserted = null;

MongoClient.connect(mongoUrl, function (err, db) {
    if (!err) {
        db.authenticate(user, password, function (err) {
            if (!err) {
                var doMe = function (){
                    Object.keys(parsedHenkilos).forEach(function (oid) {

                        if(!hakijaOnHyvaksytty(parsedHenkilos[oid])){
                            parsedHenkilos[oid].laskuriHelper = hylsyt[oid].length;
                            writeStream.write(parsedHenkilos[oid]);
                            var hylatty = parsedHenkilos[oid];
                            inserted = [parsedHenkilos[oid].organisaatio];
                            hylsyt[oid].forEach(function (hylattyOrganisaatio){
                                if(inserted.indexOf(hylattyOrganisaatio) == -1){
                                    hylatty.organisaatio = hylattyOrganisaatio;
                                    hylatty.organisaatioNimi = organisaatios[hylattyOrganisaatio];
                                    hylatty.laskuriHelper = hylsyt[oid].length;
                                    writeStream.write(hylatty);
                                    inserted.push(hylattyOrganisaatio);
                                }
                            });
                        } else {
                            parsedHenkilos[oid].laskuriHelper = 1;
                            writeStream.write(parsedHenkilos[oid]);
                        }
                    });
                    db.close();
                    // console.log(hylsyt);
                };
                haeTiedot(db, doMe);
            } else {
                console.log(err);
            }
        });
    } else {
        console.log(err);
    }
});

var counter = 0;
function haeTiedot(db, cb) {
    var itemcount = Object.keys(organisaatios).length;
    console.log('items to loop ' + itemcount);
    Object.keys(organisaatios).forEach(function (hakukohdeOid) {
        // laita tähän viimeisin sijoitteluajoId - tulokset eivät muutu
        var dbStream = db.collection('Hakukohde').find({oid: hakukohdeOid, sijoitteluajoId: 1481173250509}, {
            oid: 1,
            "valintatapajonot.hakemukset": 1,
            "limit": 1
        }).stream();

        dbStream.on('data', function (doc) {
            console.log(" " + doc.oid);
            parseResult(doc);
        }).on('error', function (err) {
            console.log(err);
        }).on('end', function () {
            counter++;
            console.log(counter);
            // kaikki ajettu
            if(counter == itemcount){
                console.log("all items looped");
                cb();
            }
        });
    });

//
}

var hylsyt = {};
var parsedHenkilos = {};
function parseResult(hakukohde) {
    if (hakukohde && hakukohde.valintatapajonot) {
        hakukohde.valintatapajonot.forEach(function (vtj) {
            if (vtj.hakemukset)
                vtj.hakemukset.forEach(function (rawhakija) {
                    var newHakija = {};
                    newHakija.hakijaOid = rawhakija.hakijaOid;
                    newHakija.hakemusOid = rawhakija.hakemusOid;
                    newHakija.prioriteetti = rawhakija.prioriteetti;
                    newHakija.tila = rawhakija.tila;
                    newHakija.hakukohde = hakukohde.oid;
                    newHakija.organisaatio = hakukohde.oid;
                    newHakija.organisaatioNimi = organisaatios[hakukohde.oid];

                    if(!hakijaOnHyvaksytty(newHakija)){
                        if(hylsyt[newHakija.hakijaOid] == undefined){
                            hylsyt[newHakija.hakijaOid] = [hakukohde.oid];
                        } else if(hylsyt[newHakija.hakijaOid].indexOf(hakukohde.oid) == -1){
                            hylsyt[newHakija.hakijaOid].push(hakukohde.oid);
                        }
                    }

                    if (!!henkilotJaMaat[newHakija.hakijaOid]) {
                        newHakija.alue = getAlue(henkilotJaMaat[newHakija.hakijaOid]);
                        newHakija.laskuriHelper = 1;
                        var existingHakija = parsedHenkilos[newHakija.hakijaOid];
                        if (!existingHakija ||
                            (!hakijaOnHyvaksytty(existingHakija) && hakijaOnHyvaksytty(newHakija)) ||
                            existingHakija.prioriteetti > newHakija.prioriteetti) {
                            parsedHenkilos[newHakija.hakijaOid] = newHakija;
                        }
                    }
                });
        });
    }
}

function hakijaOnHyvaksytty(h) {
    return h.tila == "HYVAKSYTTY" || h.tila == "VARASIJALTA_HYVAKSYTTY";
}

function getAlue(maa){
    if(maa){
        switch(maa){
            case 'FIN':
            case 'ALA':
                return 'SUOMI';
            case 'EST':
                return 'VIRO';
            case 'LVA':
                return 'LATVIA';
            case 'LTU':
                return 'LIETTUA';

            default:
                if(eurooppa.indexOf(maa) > -1)
                    return 'EUROOPPA';
                return 'MUU MAAILMA'
        }
    }
    return null;
}


var eurooppa = [
    'NDL',
    'BEL',
    'BGR',
    'ESP',
    'IRL',
    'GBR',
    'IMN',
    'ITA',
    'AUT',
    'GRC',
    'HRV',
    'CYP',
    'LVA',
    'LTU',
    'LUX',
    'MLT',
    'MCO',
    'PRT',
    'POL',
    'FRA',
    'ROM',
    'SWE',
    'DEU',
    'SVK',
    'SVN',
    'DNK',
    'CZE',
    'HUN',
    'EST',
    'ALB',
    'AND',
    'BIH',
    'FRO',
    'GIB',
    'GRL',
    'ISL',
    'XKK',
    'LIE',
    'MKD',
    'MYT',
    'MDA',
    'MNE',
    'NOR',
    'SPM',
    'SMR',
    'SRB',
    'CHE',
    'TUR',
    'UKR',
    'BLR',
    'VAT',
    'RUS'
];

