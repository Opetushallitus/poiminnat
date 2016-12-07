<?php
/**
* USAGE php lapio.php > haku.csv
*/
date_default_timezone_set ("Europe/Helsinki");
/**
* MongoDB equires composer
* https://getcomposer.org/
*/
require 'vendor/autoload.php';

// tarjonta


$mongouser = "oph";
$mongopassword = "pass";
$mongohost = "kanta";
$mongoport = "27017";

$mongo = new MongoDB\Driver\Manager("mongodb://$mongouser:$mongopassword@$mongohost:$mongoport");

// pick this application id
$appId = "1.2.246.562.29.00000";

// mongo query
$filter = ['applicationSystemId' => $appId, 'state' => array('$in' => array("ACTIVE", "INCOMPLETE"))];

$options = ['limit' => 100]; 
// no limit
$options = [];

$query = new MongoDB\Driver\Query($filter, $options);
$readPreference = new MongoDB\Driver\ReadPreference(MongoDB\Driver\ReadPreference::RP_PRIMARY);
$rows = $mongo->executeQuery('hakulomake.application', $query, $readPreference);

// pickable datas
$henkilo = array("Etunimet", "Sukunimi", "kansalaisuus", "asuinmaa", "lahiosoite", "Postinumero", "postitoimipaikka", "kotikunta", "aidinkieli", "syntymaaika", "SUKUPUOLI");
$hakutoiveet = array("Koulutus-id", "Koulutus-id-aoIdentifier", "Koulutus", "Opetuspiste-id", "Opetuspiste", "Koulutus-educationDegree");
$koulutustausta = array("amk_ope_opintoala", "amk_ope_tutkinto", "muu_tutkinto_am", "muu_tutkinto_am_nimi", "amk_ope_tutkinto_vuosi", "amk_ope_tutkinnontaso", "ei_korkeakoulututkintoa", "muu_tutkinto_amt", "muu_tutkinto_amt_nimi", "muu_tutkinto_kk", "muu_tutkinto_kk_nimi", "muu_tutkinto_tri", "muu_tutkinto_tri_nimi", "amk_ope_ulkomainen_tutkinto", "opettajana_ammatillisessa_tutkinto_yhteisten_opettajana", "opettajana_ammatillisessa_kuvaus", "opettajana_ammatillisessa_tyopaikka", "opettajana_ammatillisessa_tutkinto_tehtavanimike", "opettajana_ammatillisessa_tutkinto_ammattillisten_opettajana", "opettajana_ammatillisessa_tutkinto_tyopaikka");

// separator
$sep = '";"';

// make data nice
$replaT = array("<F6>", "<E4>", "Ã¤", "Ã¶");
$replaW = array("ö", "ä", "ä", "ö");

// number of koulutuspreferences
$prefs = 4;
// debug or not
$printer = true;

$footer = "";
// ---------------------- make csv header
if($printer){
  print '"';
  print "oid".$sep;
  print "personOid".$sep;
  print "state".$sep;
  foreach($henkilo AS $key => $v){ print $v.$sep; }
  for($c = 1;$c <= $prefs;$c++){
    foreach($hakutoiveet AS $key => $v){
      $v = "preference".$c."-".$v;
      print $v.$sep;
    }
    print "preference-".$c."-EligibilitiesStatus".$sep;
    print "preference-".$c."-EligibilitiesSource".$sep;
  }
  foreach($koulutustausta AS $key => $v){ print $v.$sep; }
  print '"';
  print "\n";
}
  
// ---------------------- loop data
foreach($rows as $r){
  if($printer){ print '"'; }
  if($printer){
    print $r->oid.$sep;
    print $r->personOid.$sep;
    print $r->state.$sep;
  }
  //if(isset($r->answers->henkilotiedot)){
  foreach($henkilo AS $key => $v){
    if(isset($r->answers->henkilotiedot->$v)){
      // clean data
      if($v == "syntymaaika"){
        $d = explode(".", $r->answers->henkilotiedot->$v);
        if($printer){ print date("Y-m-d", mktime(0,0,0,$d[1], $d[0], $d[2])).$sep; }
      } else {
        if($printer){ print utf8_decode(str_replace($replaT, $replaW, $r->answers->henkilotiedot->$v)).$sep; }
      }
    } else {
      if($printer){ print $sep; }
    }
  }
  for($c = 1;$c <= $prefs;$c++){
    foreach($hakutoiveet AS $key => $v){
      $v = "preference".$c."-".$v;
      if(isset($r->answers->hakutoiveet->$v)){
        if($printer){ print utf8_decode(str_replace($replaT, $replaW, $r->answers->hakutoiveet->$v)).$sep; }
      } else {
        if($printer){ print $sep; }
      }
    }
    if(isset($r->preferenceEligibilities[($c-1)]->status)){
      if($printer){ print $r->preferenceEligibilities[($c-1)]->status.$sep; }
    } else {
      if($printer){ print $sep; }
    }
    if(isset($r->preferenceEligibilities[($c-1)]->source)){
      if($printer){ print $r->preferenceEligibilities[($c-1)]->source.$sep; }
    } else {
      if($printer){ print $sep; }
    }
  } // end foreach
  
  if(isset($r->answers->koulutustausta)){
    foreach($koulutustausta AS $key => $v){
      if(isset($r->answers->koulutustausta->$v)){
        if($printer){ print utf8_decode(str_replace($replaT, $replaW, $r->answers->koulutustausta->$v)) .$sep; }
      } else {
        if($printer){ print $sep; }
      }
    }
  }
  if($printer){ 
    print '"';
    print "\n";
  }
}

