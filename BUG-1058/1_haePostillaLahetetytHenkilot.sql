SELECT concat('"', concat_ws('":"', v.oid_henkilo, o.maakoodi),'", ')
FROM vastaanottaja v
  JOIN vastaanottajaosoite o ON o.vastaanottaja_id = v.id
WHERE v.iposti IN (SELECT i.id
                   FROM iposti i
                   WHERE i.lahetetty IS NOT NULL
                    AND i.kirjelahetys_id IN (SELECT id
                                             FROM kirjelahetys
                                             WHERE aikaleima > '2016-10-09'
                                              AND aikaleima < '2016-12-08'
                                               AND haku = '1.2.246.562.29.87593180141'))


