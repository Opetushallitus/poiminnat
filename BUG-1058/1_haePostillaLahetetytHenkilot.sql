SELECT v.oid_henkilo, o.maakoodi
FROM vastaanottaja v
  JOIN vastaanottajaosoite o ON o.vastaanottaja_id = v.id
WHERE v.iposti IN (SELECT i.id
                   FROM iposti i
                   WHERE i.lahetetty IS NOT NULL
                    AND i.kirjelahetys_id IN (SELECT id
                                             FROM kirjelahetys
                                             WHERE aikaleima > '2016-06-30'
                                              AND aikaleima < '2016-07-03'
                                               AND haku = '1.2.246.562.29.75203638285'))


