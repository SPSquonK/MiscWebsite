﻿<!DOCTYPE html>
<!--
	Versions :
	3.1a- 03/02/18 : Le fichier xml auto généré ne modifie désormais la date que pour les nouvelles entrées
	3.1 - 02/02/18 : Améliorations mineures du code javascript, section admin
	3.0 - 31/01/18 : Mise en place de plusieurs catégories.
	2.4 - 30/01/18 : AJAX
	2.3 - 11/01/18 : Lien vers mes images Megadimension ajoute
	2.2 - 09/01/18 : Ajout d'un fichier xml qui est créé à partir de la liste des fichiers et du fichier xml d'informations complémentaires.
	                 Ce fichier étant statique, on a un gain de performance (au lieu de chercher à chaque fois tous lse fichiers et chercher si il y
				     a une entrée)
	2.1 - 07/01/18 : Ajout de la fonction de tri
	2.0 - ??/11/17 : Mise en place d'un affichage sous forme de tableau avec fichier xml pour les informations complémentaires
	1.0 - ??/??/?? : Création de la page sous forme de liste

	Projets :
	- Avoir des miniatures. Avoir des images qui s'ouvrent comme sur le site du deux six.

-->
<html>
	<head>
		<meta charset="UTF-8" />
		<title>SquonK - Pics</title>
		<style>			
			table {
				margin:auto;
			}
			
			table, tr, td, th {
				border : 1px black solid;
				border-collapse: collapse;
			}
			
			.linkToPic { font-weight: bold; }
			
			#nepgeardidnothingwrong {
				text-align: center;
				font-size: 1.5em;
			}
			
		</style>
		<script type="text/javascript" src="src/jquery.js"></script>
		<script type="text/javascript" src="src/ajax.js"></script>

	</head>
	<body>
		<h1 style="text-align: center;">Les images pas drôles de SquonK</h1>

		<p id="nepgeardidnothingwrong">Chargement en cours</p>

		<table id="memeenmeufjesuissurquejsuisunebonne">
			<tr> <td></td> </tr>
		</table>
	</body>
</html>

