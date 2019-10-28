<?php
	$result = $_GET["json"];
	echo $result;
	$result = "{\n  \"commands\": [\n  ]\n}\n";

	$fn = "./voiceControl.json";
	$fp = fopen($fn,"w+");

	fwrite($fp, $result);
	fclose($fp);
?>