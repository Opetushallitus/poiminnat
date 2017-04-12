
var MongoClient = require('mongodb').MongoClient;
var user = "oph";
var password = "oph";
var mongoUrl = "mongodb://localhost:27017/hakulomake";

var vaihdaKoodi = "ROM";
var vaihdaKoodiksi = "ROU";

MongoClient.connect(mongoUrl, function (err, db) {
    if (!err) {
        db.authenticate(user, password, function (err) {
            if (!err) {
                updateAsuinmaa(db, vaihdaKoodi, vaihdaKoodiksi, function () { updateKansalaisuus(db, vaihdaKoodi, vaihdaKoodiksi) });
            } else {
                console.log(err);
            }
        });
    } else {
        console.log(err);
    }
});

function updateAsuinmaa(db, fromCode, toCode, cb) {
    console.log('asuinmaa');
    var dbStream = db.collection('application').find({"answers.henkilotiedot.asuinmaa": fromCode}).stream();
    dbStream.on('data', function (doc) {
        console.log(doc.oid);
    }).on('error', function (err) {
        console.log(err);
    }).on('end', function () {
        db.collection('application').update({"answers.henkilotiedot.asuinmaa": fromCode}, { $set: {"answers.henkilotiedot.asuinmaa": toCode}}, {multi: true});
        cb();
    });
}

function updateKansalaisuus(db, fromCode, toCode) {
    console.log("kansalaisuus");
    var dbStream = db.collection('application').find({"answers.henkilotiedot.kansalaisuus": fromCode}).stream();
    dbStream.on('data', function (doc) {
        console.log(doc.oid);
    }).on('error', function (err) {
        console.log(err);
    }).on('end', function () {
        db.collection('application').update({"answers.henkilotiedot.kansalaisuus": fromCode}, { $set: {"answers.henkilotiedot.kansalaisuus": toCode}}, {multi: true});
    });
}



