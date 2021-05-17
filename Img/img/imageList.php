<?php

$url = $_GET['dossier'];

if (!ctype_alpha($url)) {
	die('url n\'est pas composé que de lettres');
}

header('Content-Type: text/xml');

$tableau = array();
if ($dossier = opendir($url)) {
	while(false !== ($fichier = readdir($dossier))) {
		if($fichier != '.' && $fichier != '..' && $fichier != 'index.php') {
			$tableau[] = $fichier;
		}
	}
}

?>
<images>
<?php
	foreach($tableau as $k=>$v) {
		echo '<image><nom>'.$v.'</nom><taille>'.filesize($url.'/'.$v).'</taille><date>'.date ("Y m d", filemtime($url . '/'.$v)).'</date></image>';
	}
?>
</images>

