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
var hakukohde_id = 0;
var koulutus_id = 0;

con.connect();
console.log('Haku oid ' + haku_oid);

function getHakukohdeKoulutus(hakukohde_id){
    con.query('SELECT k.koulutustyyppi_uri, k.id, k.oid, k.pohjakoulutusvaatimus_uri, k.koulutusmoduuli_id ' +
        ' FROM koulutusmoduuli_toteutus AS k ' +
        ' LEFT JOIN hakukohde_koulutusmoduuli_toteutus_tarjoajatiedot AS kh ON k.oid = kh.koulutusmoduuli_toteutus_oid ' +
        ' WHERE (k.koulutustyyppi_uri = \'koulutustyyppi_1#2\' OR k.koulutustyyppi_uri = \'koulutustyyppi_13#2\') AND kh.hakukohde_id = $1::int ', [hakukohde_id], (err3, res3) => {
            if(err3) {
                console.error(err3.stack);
            } else {
                if(res3.rowCount > 0) {
                    for (var j = 0, len3 = res3.rows.length; j < len3; j++) {
                        koulutus_id = res3.rows[j].id;
                        koulutus_oid = res3.rows[j].oid;
                        koulutusmoduuli_id = res3.rows[j].koulutusmoduuli_id;
                        hasCorrentKoulutustyyppi(koulutus_id, koulutus_oid, koulutusmoduuli_id);
    //                    console.log('Koulutus oid: ' + res3.rows[j].oid + ' ' + hakukohde_id);
                    }
                }
            }
    });
}

function parentHasKoulutus(koulutus_id) {
    con.query('SELECT k.koulutustyyppi_uri, k.koulutus_uri, k.id, ksk.koulutus_sisaltyvyys_id, ks.parent_id ' +
        ' FROM koulutus_sisaltyvyys_koulutus AS ksk ' +
        ' LEFT JOIN koulutus_sisaltyvyys AS ks ON ksk.koulutus_sisaltyvyys_id = ks.id ' +
        ' LEFT JOIN koulutusmoduuli AS k ON ks.parent_id = k.id ' +
        ' WHERE ksk.koulutusmoduuli_id = $1::int ', [koulutus_id], (err, res) => {
        if(err) {
            console.error(err.stack);
        } else {
            if(res.rowCount > 0) {
                if(res.rows[0].id != null) { // parent exists
                    parent_koulutus_uri = res.rows[0].koulutus_uri;
                    parent_koulutustyyppi_uri = res.rows[0].koulutustyyppi_uri;
                    parent_koulutus_id = res.rows[0].id;
                    if (parent_koulutustyyppi_uri != null && parent_koulutustyyppi_uri.search("koulutustyyppi_26") > -1) {
                        return true;
                    } else if (alreadyLogged.indexOf(parent_koulutus_uri) == -1) {
                        if (parent_koulutustyyppi_uri == null) {
                            parent_koulutustyyppi_uri = '|';
                        }
                        alreadyLogged.push(koulutus_uri);
                        console.log('Ei koulutustyyppia 26 parent koulutuksella ' + parent_koulutus_uri);
                        console.log('UPDATE koulutusmoduuli SET koulutustyyppi_uri = \'' + parent_koulutustyyppi_uri + 'koulutustyyppi_26|\' WHERE id = ' + parent_koulutus_id);
                        return false;
                    }
                }
            } else {
                return false;
            }
        }
    });
}

function hasCorrentKoulutustyyppi(koulutus_id, koulutus_oid, koulutusmoduuli_id){
    con.query('SELECT koulutustyyppi_uri, id, oid, koulutus_uri ' +
        ' FROM koulutusmoduuli ' +
        ' WHERE id = $1::int ', [koulutusmoduuli_id], (err, res) => {
        if(err) {
            console.error(err.stack);
        } else {
            if(res.rowCount > 0) {
                koulutus_uri = res.rows[0].koulutus_uri;
                koulutus_id = res.rows[0].id;
                koulutustyyppi_uri = res.rows[0].koulutustyyppi_uri;
//                    console.log(koulutustyyppi_uri + ' ' + koulutus_uri);
                if(koulutustyyppi_uri != null && koulutustyyppi_uri.search("koulutustyyppi_26") > -1){
                    // console.log('Found ' + koulutus_uri);
                } else if(alreadyLogged.indexOf(koulutus_uri) == -1){
                    if(!parentHasKoulutus(koulutus_id)) {
                        if(koulutustyyppi_uri == null){
                            koulutustyyppi_uri = '|';
                        }
                        alreadyLogged.push(koulutus_uri);
                        console.log('Ei koulutustyyppia 26 koulutuksella '  + koulutus_uri);
                        console.log('UPDATE koulutusmoduuli SET koulutustyyppi_uri = \''+koulutustyyppi_uri+'koulutustyyppi_26|\' WHERE id = '+koulutus_id);
                    }
                }
            }
        }
    });
}

var alreadyLogged = [];
con.query('SELECT id, oid ' +
    ' FROM haku WHERE oid = $1::text ', [haku_oid], (err, res) => {
    if (err) {
        console.error(err.stack);
        exit();
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
//                console.log('Hakukohde id: ' + row.id);
                getHakukohdeKoulutus(row.id);
            });
        }
    });
});

