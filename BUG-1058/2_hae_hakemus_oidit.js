var fs = require('fs');
var csv = require('fast-csv');

var writeStream = csv.createWriteStream({headers: false});
var writableStream = fs.createWriteStream("hakemukset.csv");
writeStream.pipe(writableStream);

var MongoClient = require('mongodb').MongoClient;
var user = "oph";
var password = "[PASSWD]";
var mongoUrl = "mongodb://localhost:26666/sijoitteludb";

var henkilotJaMaat = require('./postillaLahetetytHenkilotJaMaat.json');
var organisaatios = require('./hakukohdeToOrganisaatio.json');

MongoClient.connect(mongoUrl, function (err, db) {
    if (!err) {
        db.authenticate(user, password, function (err) {
            if (!err) {
                haeTiedot(db);
            } else {
                console.log(err);
            }
        });
    } else {
        console.log(err);
    }
});

var counter = 0;
function haeTiedot(db) {
    var dbStream = db.collection('Hakukohde').find({sijoitteluajoId: 1468555556014}, {
        oid: 1,
        "valintatapajonot.hakemukset": 1
    }).stream();
    dbStream.on('data', function (doc) {
        console.log(++counter + " " + doc.oid);
        parseResult(doc);
    }).on('error', function (err) {
        console.log(err);
    }).on('end', function () {
        Object.keys(parsedHenkilos).forEach(function (oid) {
            writeStream.write(parsedHenkilos[oid]);
        });
        console.log("end");
        db.close()
    });
}

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
                    newHakija.organisaatio = organisaatios[hakukohde.oid];

                    if (!!henkilotJaMaat[newHakija.hakijaOid]) {
                        newHakija.alue = getAlue(henkilotJaMaat[newHakija.hakijaOid]);
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

