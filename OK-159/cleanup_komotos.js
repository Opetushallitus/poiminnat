var pg = require('pg')

var pq = {
    'host': 'localhost',
    'port': '5432',
    'user': 'oph',
    'password': 'oph',
    'database': 'tarjonta'
};

var con = new pg.Client({
    host: pq.host,
    port: pq.port,
    user: pq.user,
    password: pq.password,
    database: pq.database
})

var haku_oid = '1.2.246.562.29.98069713083';
var haku_id = 0;
var debug = true;

con.connect();
console.log('Haku oid ' + haku_oid);

//﻿UPDATE koulutusmoduuli_toteutus SET viimindeksointipvm = NULL WHERE id IN (SELECT k.id FROM koulutusmoduuli_toteutus k LEFT JOIN koulutus_hakukohde kh ON kh.koulutus_id = k.id LEFT JOIN hakukohde h ON kh.hakukohde_id = h.id WHERE h.haku_id = xxxx);

const updateKoulutusSQL = 'UPDATE hakukohde_koulutusmoduuli_toteutus_tarjoajatiedot SET koulutusmoduuli_toteutus_oid = $1 WHERE koulutusmoduuli_toteutus_oid = $2 '
const updateKoulutusSQL2 = 'UPDATE koulutus_hakukohde SET koulutus_id = $1 WHERE koulutus_id = $2 '
const deleteKoulutusSQL = 'UPDATE koulutusmoduuli_toteutus SET tila = $1, unique_external_id = NULL, viimpaivityspvm = NULL WHERE oid = $2 '

console.log('All good? Switch debug to false.');



function deleteKoulutus(values){
    if(debug) {
        console.log('deleting koulutus ' + values);
    } else {
        con.query(deleteKoulutusSQL, values, (err, res) => {
            if(err) {
                console.error(err.stack);
            } else {
                console.log('delete ' + values + " done ");
            }
        });
    }
}

function updateKoulutus(values, values2){
    if(debug) {
        console.log('updating koulutus ' + values);
        console.log('updating koulutus ' + values2);
    } else {
        con.query(updateKoulutusSQL, values, (err, res) => {
            if(err) {
                console.error(err.stack);
            } else {
                console.log("update " + values + " done ");
            }
        });
        con.query(updateKoulutusSQL2, values2, (err2, res2) => {
            if(err2) {
                console.error(err2.stack);
            } else {
                console.log("update " + values2 + " done ");
            }
        });
    }
}


/*
check that if there is two same koulutus that link to different hakukohde

before

koulutus_id_1, tarjoaja_1, koulutusmoduuli_1, koulutus_uri_1, koulutustyyppi_uri_1 - hakukohde pk
koulutus_id_2, tarjoaja_1, koulutusmoduuli_1, koulutus_uri_1, koulutustyyppi_uri_1 - hakukohde yo

after

koulutus_id_1, tarjoaja_1, koulutusmoduuli_1, koulutus_uri_1, koulutustyyppi_uri_1 - hakukohde pk
DELETE ROW koulutus_id_2
NEW ROW INTO LINK TABLE SO THAT koulutus_id_1 links to - hakukohde yo

*/

con.query('SELECT id, oid ' +
    ' FROM haku WHERE oid = $1::text ', [haku_oid], (err, res) => {
    if (err) {
        console.error(err.stack);
    }
    haku_id = res.rows[0].id;
    console.log('Haku id ' + res.rows[0].id);
    con.query('SELECT id, oid, haku_id, pohjakoulutusvaatimus_koodi_uri ' +
        ' FROM hakukohde WHERE haku_id = $1::int AND pohjakoulutusvaatimus_koodi_uri = \'pohjakoulutusvaatimustoinenaste_yo\'; ', [haku_id], (err2, res2) => {
        if(err2){
            console.error(err2.stack);
        }
        if(res2.rowCount > 0) {
            res2.rows.forEach((row, cc) => {
                console.log(row.id);
                con.query('SELECT k.koulutustyyppi_uri, k.id, k.oid, k.pohjakoulutusvaatimus_uri, k.koulutusmoduuli_id, ' +
                    ' k.koulutus_uri, k.tarjoaja, k.koulutustyyppi_uri ' +
                    ' FROM koulutusmoduuli_toteutus AS k ' +
                    ' LEFT JOIN koulutus_hakukohde AS kh ON k.id = kh.koulutus_id ' +
                    ' WHERE kh.hakukohde_id = $1::int AND k.id IS NOT NULL ', [row.id], (err3, res3) => {
                    if(err3) {
                        console.error(err3.stack);
                    } else if(res3.rows[0]){
                        var r = res3.rows[0];
                        // now we have yo koulutus
                        // check if we have "same" pk koulutus
                        // same haku and same other stuff
                        con.query('SELECT k.id, k.oid, k.koulutustyyppi_uri, k.pohjakoulutusvaatimus_uri, k.koulutusmoduuli_id, ' +
                            ' k.koulutus_uri, k.tarjoaja, k.koulutustyyppi_uri, h.id AS hk_id ' +
                            ' FROM koulutusmoduuli_toteutus AS k ' +
                            ' LEFT JOIN koulutus_hakukohde AS kh ON k.id = kh.koulutus_id ' +
                            ' LEFT JOIN hakukohde AS h ON kh.hakukohde_id = h.id ' +
                            ' WHERE h.haku_id = $1::int AND h.pohjakoulutusvaatimus_koodi_uri = \'pohjakoulutusvaatimustoinenaste_pk\' AND ' +
                            ' k.koulutustyyppi_uri = $2 AND k.pohjakoulutusvaatimus_uri = $3 AND ' +
                            ' k.koulutusmoduuli_id = $4 AND k.koulutus_uri = $5 AND k.tarjoaja = $6 ', [haku_id, r.koulutustyyppi_uri, r.pohjakoulutusvaatimus_uri, r.koulutusmoduuli_id, r.koulutus_uri, r.tarjoaja], (err4, res4) => {
                            if(err4) {
                                console.error(err4.stack);
                            } else {
                                if(res4.rowCount > 0) {
                                    console.log('keep this');
                                    console.log(res4.rows[0].id + ' ' + res4.rows[0].oid);

                                    console.log('delete this');
                                    console.log(r.id + ' ' + r.oid);

                                    updateKoulutus([res4.rows[0].oid, r.oid], [res4.rows[0].id, r.id]);
                                    deleteKoulutus(['POISTETTU', r.oid]);
                                }
                            }
                        });
                    }
                });
            });
        }
    });
});

