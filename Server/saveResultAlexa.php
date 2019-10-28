<?php
	$result = $_GET["json"];
	echo $result;
	$result = str_replace("\\","", $result);

	$fn = "./voiceControl.json";
	$fp = fopen($fn,"w+");

	fwrite($fp, $result);
	fclose($fp);
?>