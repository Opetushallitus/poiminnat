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
var runFix = false;
var runOsaamisala = true;

con.connect();

console.log('Haku oid ' + haku_oid);

// Helper for
//﻿ UPDATE koulutusmoduuli_toteutus SET viimindeksointipvm = NULL WHERE id IN (SELECT k.id FROM koulutusmoduuli_toteutus k LEFT JOIN koulutus_hakukohde kh ON kh.koulutus_id = k.id LEFT JOIN hakukohde h ON kh.hakukohde_id = h.id WHERE h.haku_id = xxxx);

const updateKoulutusSQL = 'UPDATE hakukohde_koulutusmoduuli_toteutus_tarjoajatiedot SET koulutusmoduuli_toteutus_oid = $1 WHERE koulutusmoduuli_toteutus_oid = $2 '
const updateKoulutusSQL2 = 'UPDATE koulutus_hakukohde SET koulutus_id = $1 WHERE koulutus_id = $2 '
const deleteKoulutusSQL = 'UPDATE koulutusmoduuli_toteutus SET tila = $1, unique_external_id = NULL, viimindeksointipvm = NULL WHERE oid = $2 '

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

if(runFix){
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

} // end if run fix

// koodisto stuff
if(runOsaamisala) {
    var osaamisalaMap = [

        {'from' : '1607', 'to': '1703'},
        {'from' : '1641', 'to': '1704'},
        {'from' : '1642', 'to': '1705'},

        {'from' : '1643', 'to': '1717'},
        {'from' : '1644', 'to': '1718'},

        {'from' : '1525', 'to': '1719'},
        {'from' : '1526', 'to': '1720'},
        {'from' : '1527', 'to': '1721'},
        {'from' : '1528', 'to': '1722'},
        {'from' : '1622', 'to': '1723'},
        {'from' : '1529', 'to': '1724'},

        {'from' : '1549', 'to': '1725'},
        {'from' : '1550', 'to': '1726'},
        {'from' : '1551', 'to': '1727'},
        {'from' : '1552', 'to': '1728'},

        {'from' : '1661', 'to': '1729'},
        {'from' : '1662', 'to': '1730'},

        {'from' : '1651', 'to': '1731'},
        {'from' : '1530', 'to': '1732'},

        {'from' : '1531', 'to': '1733'},
        {'from' : '1617', 'to': '1734'},
        {'from' : '1532', 'to': '1735'},

        {'from' : '1657', 'to': '1736'},
        {'from' : '1658', 'to': '1737'},

        {'from' : '1553', 'to': '1740'},
        {'from' : '1556', 'to': '1741'},
        {'from' : '1555', 'to': '1742'},
        {'from' : '1554', 'to': '1743'},

        {'from' : '1544', 'to': '1748'},
        {'from' : '2256', 'to': '1749'},
        {'from' : '1660', 'to': '1750'},
        {'from' : '1652', 'to': '1751'},
        {'from' : '1523', 'to': '1752'},
        {'from' : '1501', 'to': '1753'},
        {'from' : '1653', 'to': '1754'},

        // four same rows in excel

        {'from' : '1666', 'to': '1537'},

        {'from' : '1630', 'to': '1756'},
        {'from' : '1504', 'to': '1757'},
        {'from' : '1505', 'to': '1758'},
        {'from' : '1506', 'to': '1759'},

        {'from' : '1648', 'to': '1760'},
        {'from' : '1646', 'to': '1761'},
        {'from' : '1647', 'to': '1762'},
        {'from' : '1645', 'to': '1763'},

        {'from' : '1591', 'to': '1764'},
        {'from' : '1592', 'to': '1765'},
        {'from' : '1590', 'to': '1766'},

        {'from' : '1621', 'to': '1767'},
        {'from' : '1620', 'to': '1768'},
        {'from' : '1580', 'to': '1769'},
        {'from' : '1582', 'to': '1770'},

        {'from' : '1632', 'to': '1771'},
        {'from' : '1623', 'to': '1772'},
        {'from' : '1588', 'to': '1773'},
        {'from' : '1587', 'to': '1774'},

        {'from' : '1585', 'to': '1775'},
        {'from' : '1583', 'to': '1776'},
        {'from' : '1584', 'to': '1777'},

        {'from' : '1615', 'to': '1785'},
        {'from' : '1600', 'to': '1786'},
        {'from' : '1655', 'to': '1788'},
        {'from' : '1510', 'to': '1790'},
        {'from' : '1656', 'to': '1791'},
        {'from' : '1511', 'to': '1792'},
        {'from' : '1513', 'to': '1794'},

        {'from' : '1568', 'to': '1796'},
        {'from' : '1636', 'to': '1797'},
        {'from' : '1637', 'to': '1798'}
    ];
    // ------- RUN THESE IN PSQL CONSOLE!
    con.query('SELECT id, oid ' +
        ' FROM haku WHERE oid = $1::text ', [haku_oid], (err, res) => {
        if (err) {
            console.error(err.stack);
        }
        haku_id = res.rows[0].id;
        osaamisalaMap.forEach(function (item){
            var sql = "UPDATE koulutusmoduuli_toteutus " +
                " SET viimindeksointipvm = NULL, osaamisala_uri = 'osaamisala_" + item["to"]+ "#1' " +
                " WHERE id IN (SELECT k.id FROM koulutusmoduuli_toteutus k " +
                " LEFT JOIN koulutus_hakukohde kh ON kh.koulutus_id = k.id " +
                " LEFT JOIN hakukohde h ON kh.hakukohde_id = h.id WHERE h.haku_id = " + haku_id + ") AND " +
                " osaamisala_uri LIKE 'osaamisala_" + item["from"] + "#%' ;";
            console.log(sql);
        });
    });
}

