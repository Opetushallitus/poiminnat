var pg = require('pg')

var pq = {
    'host': 'localhost',
    'port': '5432',
    'user': 'postgres',
    'password': 'postgres',
    'database': 'tarjonta_2017'
};

var con = new pg.Client({
    host: pq.host,
    port: pq.port,
    user: pq.user,
    password: pq.password,
    database: pq.database
})

var haku_oid = '1.2.246.562.29.65903924994';
var haku_id = 0;
var debug = true;

con.connect();
console.log('Haku oid ' + haku_oid);

const updateHakukohdeSQL = 'UPDATE hakukohde SET pohjakoulutusvaatimus_koodi_uri = $1 WHERE id = $2 '
const updateKoulutusSQL = 'UPDATE koulutusmoduuli_toteutus SET pohjakoulutusvaatimus_uri = \'\', koulutustyyppi_uri = $1, toteutustyyppi = $2, viimindeksointipvm = NULL WHERE id = $3 '
const deleteKoulutuslajiSQL = 'DELETE FROM koulutusmoduuli_toteutus_koulutuslaji WHERE koulutusmoduuli_toteutus_id = $1 '

console.log('All good? Switch debug to false.');

function updateHakukohde(values, koulutus_id, hakukohde_id){
    if(debug) {
        console.log('updating hakukohde ' + values + ' koulutus ' + koulutus_id + ' hakukohde ' + hakukohde_id);
        updateKoulutus(['koulutustyyppi_26#1', 'AMMATILLINEN_PERUSTUTKINTO_ALK_2018', koulutus_id], hakukohde_id);
        deleteKoulutuslaji([koulutus_id]);
    } else {
        con.query(updateHakukohdeSQL, values, (err, res) => {
            if(err) {
                console.error(err.stack);
            } else {
                console.log('hakukohde ' + values + " done ");
                updateKoulutus(['koulutustyyppi_26#1', 'AMMATILLINEN_PERUSTUTKINTO_ALK_2018', koulutus_id], hakukohde_id);
                deleteKoulutuslaji([koulutus_id]);
            }
        });
    }
}

function updateKoulutus(values, hakukohde_id){
    if(debug) {
        console.log('updating koulutus ' + values);
    } else {
        con.query(updateKoulutusSQL, values, (err, res) => {
            if(err) {
                console.error(err.stack);
            } else {
                console.log("koulutus " + values + " for hakukohde " + hakukohde_id + " done ");
            }
        });
    }
}

function deleteKoulutuslaji(values){
    if(debug) {
        console.log('deleting koulutuslaji from koulutus ' + values);
    } else {
        con.query(deleteKoulutuslajiSQL, values, (err, res) => {
            if(err) {
                console.error(err.stack);
            } else {
                // console.log("koulutus " + values + " for hakukohde " + hakukohde_id + " done ");
            }
        });
    }
}

function updateHakukohdeAndKoulutus(hakukohde_id){
    con.query('SELECT k.koulutustyyppi_uri, k.id, k.oid, k.pohjakoulutusvaatimus_uri, k.koulutusmoduuli_id ' +
        ' FROM koulutusmoduuli_toteutus AS k ' +
        ' LEFT JOIN hakukohde_koulutusmoduuli_toteutus_tarjoajatiedot AS kh ON k.oid = kh.koulutusmoduuli_toteutus_oid ' +
        ' WHERE (k.koulutustyyppi_uri = \'koulutustyyppi_1#2\' OR k.koulutustyyppi_uri = \'koulutustyyppi_13#2\' OR k.koulutustyyppi_uri = \'koulutustyyppi_1#1\' OR k.koulutustyyppi_uri = \'koulutustyyppi_13#1\') AND kh.hakukohde_id = $1::int ', [hakukohde_id], (err3, res3) => {
            if(err3) {
                console.error(err3.stack);
            } else {
                if(res3.rowCount > 0) {
                    for (var j = 0, len3 = res3.rows.length; j < len3; j++) {
                        // now we have koulutus and hakukohde
                        // ﻿pohjakoulutusvaatimustoinenaste_yo
                        pohjat = res3.rows[j].pohjakoulutusvaatimus_uri.split("#")[0];
                        koulutus_id = res3.rows[j].id;
                        updateHakukohde([pohjat, hakukohde_id], koulutus_id, hakukohde_id);
                    }
                }
            }
    });
}


con.query('SELECT id, oid ' +
    ' FROM haku WHERE oid = $1::text ', [haku_oid], (err, res) => {
    if (err) {
        console.error(err.stack);
    }
    haku_id = res.rows[0].id;
    console.log('Haku id ' + res.rows[0].id);
    con.query('SELECT id, oid, haku_id, pohjakoulutusvaatimus_koodi_uri ' +
        ' FROM hakukohde WHERE haku_id = $1::int ', [haku_id], (err2, res2) => {
        if(err2){
            console.error(err2.stack);
        }
        if(res2.rowCount > 0) {
            var cc = res2.rowCount;
            res2.rows.forEach((row, cc) => {
                updateHakukohdeAndKoulutus(row.id);
            });
        }
    });
});

