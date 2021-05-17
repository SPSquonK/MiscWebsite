<?php
class Image {
	public $titre;
	public $date;
	public $media;
	public $source;
	public $commentaire;
	
	
	/**
		Remplis les données de l'image selon un nom de fichier en complétant avec le xml
	*/
	public function recopierXML($xml) {
		$this->titre = $xml->titre;
		$this->date = $xml->date;
		$this->media = $xml->media;
		$this->source = $xml->source;
		$this->commentaire = $xml->commentaire;
	}
	
	/**
		Remplis les données de l'image selon un nom de fichier en complétant avec le xml
	*/
	public function remplirImage($nom, $xml) {
		$this->titre = $nom;
		$this->date = date("Y m d", filectime($nom));
		
		if (!$this->fillFromXml($xml)) {
			$this->media = '';
			$this->source = '';
			$this->commentaire = '';
		}
	}
	
	/**
	   Renvoie vrai si le xml contient des données pour cette image et rempli les champs media source et commentaire
	   Faux sinon
	*/
	public function fillFromXml($xml) {
		$path = substr($this->titre, 0, strrpos($this->titre, "."));;
	
		foreach($xml as $fichier) {
			if ($fichier->nom == $path) {
				$this->media = $fichier->media;
				$this->source = $fichier->source;
				$this->commentaire = $fichier->commentaire;
				
				return true;
			}
		}
		
		return false;
	}
	
	
	/**
	   Affiche l'image
	*/
	public function display() {
		echo '<tr>';
		
		echo '<td style="font-weight: bold;"><a href="'.$this->titre.'>">'.$this->titre.'</a></td>';
		echo '<td>'.$this->date.'</td>';
		echo '<td>'.$this->media.'</td>';
		echo '<td>'.$this->source.'</td>';
		echo '<td>'.$this->commentaire.'</td>';
		
		echo '</tr>';
	}
	
	private function addChamp($nom, $valeur) {
		return "\t\t".'<'.$nom.'>'.$valeur.'</'.$nom.'>'."\n";
	}
	
	public function getXmlRepresentation() {
		$representation = '<image>'."\n"
			.$this->addChamp('titre', $this->titre)
			.$this->addChamp('date', $this->date)
			.$this->addChamp('media', $this->media)
			.$this->addChamp('source', $this->source)
			.$this->addChamp('commentaire', $this->commentaire)
			.'</image>'."\n";
		
		return $representation;
	}
	
}


function compareImgName($image1, $image2) {	return strcmp($image1->titre, $image2->titre); 	}
function compareDateName($image1, $image2) {	return - strcmp($image1->date, $image2->date); 	}
function compareMediaName($image1, $image2) {
	$media = strcmp($image1->media, $image2->media); 
	if ($media != 0)
		return $media;
	
	return strcmp($image1->source, $image2->source);
}

/**
	Renvoie tous le nom de tous les fichiers
*/
function getAllFiles($rep = '.') {
	$tableau = array();
	
	if ($dossier = opendir($rep)) {
		while(false !== ($fichier = readdir($dossier))) {
			if($fichier != '.' && $fichier != '..' && $fichier != 'index.php' && !is_dir($fichier) && $fichier != 'infos.xml' && $fichier != 'infosFixe.xml') {
				if (is_file($fichier))
					$tableau[] = $fichier;
			}
		}
	}
	
	return $tableau;
}

/**
	Renvoie les données contenues dans le fichier infos.xml
*/
function getFichierXML($fileName) {
	$xml = simplexml_load_file($fileName);
	return $xml;
}

/**
	Renvoie un tableau avec une liste d'objets Image à partir de la liste des noms de fichiers et du fichier xml
*/
function applyTableau($tableau, $xml) {
	$imageList = array();
	
	foreach($tableau as $k=>$v) {
		$image = new Image();
		$image->remplirImage($v, $xml);
		$imageList[] = $image;
	}
	
	return $imageList;
}

function writeStableXml($imageList, $fileDest) {
	$file = fopen($fileDest, "w");
	
	fwrite($file, '<fichiers>');
	
	foreach($imageList as $k=>$image) {
		fwrite($file, $image->getXmlRepresentation());
	}
	
	fwrite($file, '</fichiers>');
	
	fclose($file);
}

function genImageListXml($xml) {
	$tab = array();

	foreach($xml as $entree) {
		$img = new Image();
		$img->recopierXML($entree);
		
		$tab[] = $img;
	}
	
	return $tab;
}



if (isset($_GET['GEN'])) {
	$tableau = getAllFiles();
	$xml = getFichierXML('infos.xml');
	$aa = applyTableau($tableau, $xml);
	
	writeStableXml($aa, 'infosFixe.xml');
	
	die();
}

$xml = getFichierXML('infosFixe.xml');
$imageList = genImageListXml($xml);

if ($_GET['tri'] === 'nom') {
	usort($imageList, "compareImgName");
} else if ($_GET['tri'] === 'media') {
	usort($imageList, "compareMediaName");
} else {
	usort($imageList, "compareDateName");
}

?>