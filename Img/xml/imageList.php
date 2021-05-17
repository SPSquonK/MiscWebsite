<?php
$url = $_GET['dossier'];

if (!ctype_alpha($url)) {
	die('url n\'est pas composé que de lettres');
}

//header('Content-Type: text/xml');


if (isset($_POST['content'])) {

	echo $_POST['content'];

	if ($_COOKIE['canuseadmin'] !== 'zarojurbzao')
		die();
	
	$file = fopen($url.'.xml', "w");
	if ($file === null) {
		die('erreur file');
	}
	
	fwrite($file,$_POST['content']);
	fclose($file);

}

?>