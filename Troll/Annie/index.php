<?php


/* CLASSE ANNIE
   Permet de formaliser ce qu'est un artwork de annie
*/
class Annie {
	var $image;
	var $auteur;
	var $lien;
	var $bg;
	
	function __construct($image, $auteur, $lien, $bg, $black) {
		$this->image  = $image;
		$this->auteur = $auteur;
		$this->lien =   $lien;
		
		if ($bg == null) {
			$this->bg = '';
		} else {
			if ($black) {
				$this->bg = ' body { background-color: '.$bg.'; color: white;} ';
			} else {
				$this->bg = ' body { background-color: '.$bg.'; color: black;} ';
			}
		
		}
		
	}
	
	function choisir() {
		global $lien_image, $credits, $css;
		$lien_image = $this->image;
		
		if ($this->auteur != null) {
			$credits = '<h4>Artiste : <a href="'.$this->lien.'">'.$this->auteur.'</a></h4><br />';
		} else {
			$credits = '';
		}
		
		$css = $this->bg;
	}
}


/* 
	Ajouter les images de annie disponible
*/

$tableau = array();

// Lien, Auteur, Url, Fond, true si le bg est black
$tableau[] = new Annie('anniegasai.jpg', null, null, '#3A0000', true);
$tableau[] = new Annie('vine_1_lq_rick_by_anjolendario-d9b85od.jpg', 'anjolendario', 'http://anjolendario.deviantart.com/', '#CBE5FC', false);
//$tableau[] = new Annie('Nanabe.jpg', 'ななべ', 'http://www.pixiv.net/member.php?id=12762035', 'white', false);
$tableau[] = new Annie('Cicely.jpg', 'Cicely', 'http://www.pixiv.net/member.php?id=1420241', 'black', true);
$tableau[] = new Annie('Annie.(League.of.Legends).full.1838394.jpg', null, null, 'white', false);
$tableau[] = new Annie('Citemer.jpg', 'Citemer', 'http://citemer.deviantart.com', 'rgb(45, 62, 106)', true);
$tableau[] = new Annie('Dakun.jpg', 'Dakun', 'http://dakun87.deviantart.com', 'rgb(223, 212, 191)', false);
$tableau[] = new Annie('Oiru.jpg', 'Oiru', 'http://www.pixiv.net/member.php?id=2120007', 'white', false);
$tableau[] = new Annie('Opalheart.jpg', 'Opalheart', 'http://blog.naver.com/opalheart', 'white', false);
$tableau[] = new Annie('Opalheart2.jpg', 'Opalheart', 'http://blog.naver.com/opalheart', 'white', false);



/* 
	Tirer au hasard une Annie
*/
	if (isset($_GET['yandere'])) {
		$annie_choisie = 0;
	} else {
		$annie_choisie = rand(0, count($tableau) -1);
	}
	$tableau[$annie_choisie]->choisir();

?>
<!-- mettre el doctype -->
<html>

	<head>
		<title>Annie est moe</title>
		<!-- Charset utf8 -->
		
		<style>
			div {
				/*margin-top: 50vh;*/
				margin-left: auto;
				margin-right: auto;
				/*transform: translateY(-50%);*/
				
				position: absolute;
				top: 50%;
				left: 50%;	
				transform: translate(-50%, -50%);
			}
			
			p, h3, h4, h5 {
				text-align: center;
				font-weight: normal;
			}
			
			h3 {
				margin-bottom: 0px;
			}
			
			h4, h5 {
				margin-top: 0px;
				margin-bottom: 0px;
			}
			
			
			a {
				font-weight: bold;
				color: inherit;
				text-decoration: inherit;
			}
			
			img {
				/*
				height: auto;
				max-height: 80%;
				width:auto;
				*/
				
			}
			
			
			<?php echo $css; ?>
		</style>
	</head>

	<body>
		<div>
			<p><a href=""><img src="<?php echo $lien_image; ?>" /></a></p>
			<?php echo $credits; ?>
			<h4><a href="?yandere" class="hidden">Annie</a> est un personnage du jeu <a href="http://euw.leagueoflegends.com/">League of Legends</a>.</h4>
			<h5>Votre artwork est trop moe pour apparaître ou ne pas apparaître ? contact[AT]annie.moe</h5>
		</div>
	</body>
</html>