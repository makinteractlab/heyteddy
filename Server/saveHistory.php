<?php
	$result = $_GET["json"];
	echo $result;
	$result = str_replace("\\","", $result);
    $result = str_replace("[\n  {\n    \"id\"", "  {\n    \"id\"", $result);
    $result = str_replace("\n]",",", $result);

	$fn = "./commandHistory.json";
	$fp = fopen($fn,"r+");
    fseek($fp, -6, SEEK_END);
	fwrite($fp, $result."\n  ]\n}\n");

	fclose($fp);
?>