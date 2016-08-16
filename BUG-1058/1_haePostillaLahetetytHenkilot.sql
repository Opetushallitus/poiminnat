SELECT v.oid_henkilo, o.maakoodi
FROM vastaanottaja v
  JOIN vastaanottajaosoite o ON o.vastaanottaja_id = v.id
WHERE v.iposti IN (SELECT id
                   FROM iposti
                   WHERE kirjelahetys_id IN ('19453951', '19468792', '19494342', '19973478'))
