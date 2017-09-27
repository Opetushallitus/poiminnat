var pg = require('pg')

var pq = {
    'host': 'localhost',
    'port': '5432',
    'user': 'oph',
    'password': 'oph',
    'database': 'tarjonta_2017'
};

var con = new pg.Client({
    host: pq.host,
    port: pq.port,
    user: pq.user,
    password: pq.password,
    database: pq.database
})

var haku_oid = '1.2.246.562.29.72521052067';
var haku_id = 0;

con.connect();
console.log('Haku oid ' + haku_oid);

const updateHakukohdeSQL = 'UPDATE hakukohde SET pohjakoulutusvaatimus_koodi_uri = $1 WHERE id = $2 '
const updateKoulutusSQL = 'UPDATE koulutusmoduuli_toteutus SET pohjakoulutusvaatimus_uri = \'\', koulutustyyppi_uri = $1 WHERE id = $2 '

console.log('Have you run check_komotos.js? If yes and all is well, comment exit row!');
process.exit(1);

function updateHakukohde(values, cb){
    console.log("hakukohde");
    console.log(values);
    con.query(updateHakukohdeSQL, values, (err, res) => {
        if (err) {
            console.error(err.stack);
        } else {
            console.log('done ' + values);
            cb();
        }
    });
}

function updateKoulutus(values, hakukohde_id){
    console.log("koulutus for hakukohde " + hakukohde_id);
    console.log(values);
    con.query(updateKoulutusSQL, values, (err, res) => {
        if (err) {
            console.error(err.stack);
        } else {
            console.log('done ' + values);
        }
    });
}

function updateHakukohdeAndKoulutus(hakukohde_id){
    con.query('SELECT k.koulutustyyppi_uri, k.id, k.oid, k.pohjakoulutusvaatimus_uri, k.koulutusmoduuli_id ' +
        ' FROM koulutusmoduuli_toteutus AS k ' +
        ' LEFT JOIN hakukohde_koulutusmoduuli_toteutus_tarjoajatiedot AS kh ON k.oid = kh.koulutusmoduuli_toteutus_oid ' +
        ' WHERE (k.koulutustyyppi_uri = \'koulutustyyppi_1#2\' OR k.koulutustyyppi_uri = \'koulutustyyppi_13#2\') AND kh.hakukohde_id = $1::int ', [hakukohde_id], (err3, res3) => {
            if(err3) {
                console.error(err3.stack);
            } else {
                if(res3.rowCount > 0) {
                    for (var j = 0, len3 = res3.rows.length; j < len3; j++) {
                        // now we have koulutus and hakukohde
                        // ﻿pohjakoulutusvaatimustoinenaste_yo
                        pohjat = res3.rows[j].pohjakoulutusvaatimus_uri.split("#")[0];
                        updateHakukohde([pohjat, hakukohde_id], function(){ updateKoulutus(['koulutustyyppi_26', res3.rows[j].id], hakukohde_id);});
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

