var pg = require('pg')

var pq = {
    'host': 'db',
    'port': '5432',
    'user': 'oph',
    'password': 'pass',
    'database': 'tarjonta'
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
var hakukohde_id = 0;
var koulutus_id = 0;
var allDone = 1;

con.connect();
console.log('Haku oid ' + haku_oid);

function getHakukohdeKoulutus(hakukohde_id){
    con.query('SELECT k.koulutustyyppi_uri, k.id, k.oid, k.pohjakoulutusvaatimus_uri ' +
        ' FROM koulutusmoduuli_toteutus AS k ' +
        ' LEFT JOIN hakukohde_koulutusmoduuli_toteutus_tarjoajatiedot AS kh ON k.oid = kh.koulutusmoduuli_toteutus_oid ' +
        ' WHERE (k.koulutustyyppi_uri = \'koulutustyyppi_1#2\' OR k.koulutustyyppi_uri = \'koulutustyyppi_13#2\') AND kh.hakukohde_id = $1::int LIMIT 200', [hakukohde_id], (err3, res3) => {
            if(err3) {
                console.log(err3.stack);
            } else {
                if(res3.rowCount > 0) {
            for (var j = 0, len3 = res3.rows.length; j < len3; j++) {
                koulutus_id = res3.rows[j].id;
                console.log('Koulutus oid: ' + res3.rows[j].oid + ' ' + hakukohde_id);
            }
        }
    }
    });
}

con.query('SELECT id, oid ' +
    ' FROM haku WHERE oid = $1::text ', [haku_oid], (err, res) => {
    if (err) {
        console.log(err.stack);
        exit();
    }
    haku_id = res.rows[0].id;
    console.log('Haku id ' + res.rows[0].id);
    con.query('SELECT id, oid, haku_id, pohjakoulutusvaatimus_koodi_uri ' +
        ' FROM hakukohde WHERE haku_id = $1::int LIMIT 100', [haku_id], (err2, res2) => {
        if(err2){
            console.log(err2.stack);
        }
        if(res2.rowCount > 0) {
            var cc = res2.rowCount;
            res2.rows.forEach((row, cc) => {
                console.log('Hakukohde id: ' + row.id);
                getHakukohdeKoulutus(row.id, () =>{
                    allDone++;
                    if(allDone === cc) {
                        con.end();
                    }
                });
            });
        }
    });
});

