
/**
	C'est un jeu stupide que j'ai conçu en une demi matinée.
	Le code est largement améliorable (par exemple en faisant passer des fonctions
		de calcul des nouvelles coordonnées quand on flip le plateau, en faisant des
		retour de tableau si ça un sens un javascript etc)

	Le concept en lui même est largement améliorable, mais atm flemme.
*/

var representation;
var copie;
var tailleDuJeu;
var record;
record = 0;

var listenerActiv = false;

function initialize(taille) {
	var table = document.getElementById("game");
	var ligne;
	var cellule;	var i, j;
	
	table.innerHTML = "";
	
	listenerActiv = true;
	
	for (i = 0 ; i < taille ;i++) {
		ligne = table.insertRow(i);
		
		for (j = 0 ; j < taille ; j++) {
			cellule = ligne.insertCell(j);
			cellule.id = "cell_" + (i+1) + "_" + (j+1);
			cellule.className = "inactiv";
		}
		
	}
	
}

function etablirLeTableau(taille) {
	representation = [];
	
	var i, j;
	
	for (i = 0 ; i < taille ; i++) {
		representation[i] = [];
		
		for (j = 0 ; j < taille ; j++) {
			representation[i][j] = false;
		}
	}
	
	tailleDuJeu = taille;
}

function changeColor(i, j) {
	var cell;
	
	representation[i-1][j-1] = !representation[i-1][j-1];
	
	cell = document.getElementById("cell_"+(i)+"_"+(j));
	
	if (representation[i-1][j-1]) {
		cell.className = "black";
	} else {
		cell.className = "white";
	}
}

function nada(ebt) {
	
}

function laPuissance() {
	var i, j;
	var texte;
	
	var nbDeCasesNoires;
	
	nbDeCasesNoires = 0;
	
	for (j = 0 ; j < tailleDuJeu ; j++) {
		if (representation[0][j]) {
			nbDeCasesNoires++;
		}
	}
	
	texte = document.getElementById("textePretencieux");
	if (record < nbDeCasesNoires) {
		var txt;
		record = nbDeCasesNoires;
		if (nbDeCasesNoires == tailleDuJeu) {
			txt = "Sincèrement je pensais pas que quelqu'un chercherait vraiment à le faire."
				 + "<br />Du coup j'ai eu la flemme de mettre ne place un moyen de communication."
				 + "<br />Mais je suis impressioné, vraiment.";
				 document.onkeydown = nada;
				 
				 for (i = 0; i < tailleDuJeu ; i++) {
					 for (j = 0 ; j < tailleDuJeu ; j++) {
						 document.getElementById("cell_" + (i+1) + "_" + (j+1)).className = "inactiv";
					 }
				 }
		} else if (nbDeCasesNoires == tailleDuJeu -1) {
			txt = "C'est dommage il manque un petit carré noir. Allez ma belle, ne m'abandonne pas *-*";
		} else if (nbDeCasesNoires == tailleDuJeu -2) {
			txt = "Plus que deux. Je sens que tu es la bonne. <br />Si on se met ensemble, nos enfants conquéreront surement le monde.";
		} else if (nbDeCasesNoires >= tailleDuJeu / 2) {
			txt = "Tu as réussi à en mettre plus de la moitié (" + record +" pour être précis. Courage !)"
				+ "<br />Si jamais tu cesses de croire en toi pour finir, Sache que moi je crois en toi."
				+ "<br />Alors crois en moi parce que je crois en toi.";
		} else if (nbDeCasesNoires == 1) {
			txt = "En soit, en mettre une seule est un évènement."
			+ "<br />Je suis sincère, si on appuie juste sur haut, on arrive à 2 ..."
			+ "<br />Du coup ça veut dire que tu as réfléchi à comment en mettre qu'un pour voir si il n'y avait pas un message caché";
			// Ou que tu es en train de regarder le code qui est dégueulasse :|
		} else {
			txt = "Ton record est de " + nbDeCasesNoires + " !";
		}
		
		
		texte.innerHTML = txt;
		
	}
	

	
}


function actualiserPlateau() {
	var i, j;
	var cell;
	
	for (i = 0 ; i < tailleDuJeu ; i++) {
		for (j = 0 ; j < tailleDuJeu ; j++) {
			cell = document.getElementById("cell_" + (i+1) + "_" + (j+1));
			
			if (representation[i][j]) {
				cell.className="black";
			} else {
				cell.className="white";
			}
		}
	}
	
	laPuissance();
}

function actionDeJeu() {
	var nextStep;
	var i, j;
	
	function positionner(x, y) {
		if (x < 0 || x >= tailleDuJeu)
			return;
			
		if (y < 0 || y >= tailleDuJeu)
			return;
		
		nextStep[x][y]++;
	}
	
	nextStep = [];
	for (i = 0 ; i < tailleDuJeu ; i++) {
		nextStep[i] = []
		
		for (j = 0 ; j < tailleDuJeu ; j++) {
			nextStep[i][j] = 0;
		}
	}
	
	for (i = 0 ; i < tailleDuJeu ; i++) {
		for (j = 0 ; j < tailleDuJeu ; j++) {
			if (copie[i][j]) {
				positionner(i-1, j-2);
				positionner(i-2, j);
				positionner(i-1, j+2);
				
			}
		}
	}
	
	for (i = 0 ; i < tailleDuJeu ; i++) {
		for (j = 0 ; j < tailleDuJeu ; j++) {
			if (nextStep[i][j]%2 == 0) {
				copie[i][j] = false;
			} else {
				copie[i][j] = true;
			}
		}
	}
	
}

function inverserPlateau(original) {
	var copycat;
	var i, j;
	var tabOriginal;
	
	copycat = []
	
	if (original) {
		tabOriginal = copie;
	} else {
		tabOriginal = representation;
	}
	
	for (i = 0 ; i < tailleDuJeu ; i++) {
		copycat[i] = [];
		
		for (j = 0 ; j < tailleDuJeu ; j++) {
			copycat[i][j] = tabOriginal[tailleDuJeu - 1 - i][j];
		}
	}
	
	if (original) {
		representation = copycat;
	} else {
		copie = copycat;
	}
}

function tournerDroitePlateau(original) {
	var copycat;
	var i, j;
	var tabOriginal;
	
	copycat = []
	
	if (original) {
		tabOriginal = copie;
	} else {
		tabOriginal = representation;
	}
	
	for (i = 0 ; i < tailleDuJeu ; i++) {
		copycat[i] = [];
		
		for (j = 0 ; j < tailleDuJeu ; j++) {
			copycat[i][j] = tabOriginal[tailleDuJeu - 1 - j][i];
		}
	}
	
	if (original) {
		representation = copycat;
	} else {
		copie = copycat;
	}
}

function tournerGauchePlateau(original) {
	var copycat;
	var i, j;
	var tabOriginal;
	
	copycat = []
	
	if (original) {
		tabOriginal = copie;
	} else {
		tabOriginal = representation;
	}
	
	for (i = 0 ; i < tailleDuJeu ; i++) {
		copycat[i] = [];
		
		for (j = 0 ; j < tailleDuJeu ; j++) {
			copycat[i][j] = tabOriginal[j][tailleDuJeu - 1 - i];
		}
	}
	
	if (original) {
		representation = copycat.slice(0);
	} else {
		copie = copycat.slice(0);
	}
}

function copierPlateau(original) {
	var copycat;
	var i, j;
	var tabOriginal;
	
	copycat = []
	
	if (original) {
		tabOriginal = copie;
	} else {
		tabOriginal = representation;
	}
	
	for (i = 0 ; i < tailleDuJeu ; i++) {
		copycat[i] = [];
		
		for (j = 0 ; j < tailleDuJeu ; j++) {
			copycat[i][j] = tabOriginal[i][j];
		}
	}
	
	if (original) {
		representation = copycat.slice(0);
	} else {
		copie = copycat.slice(0);
	}
}

function pressTouche(event) {
	if (!listenerActiv)
		return;
	
	
	var key = event.which || event.keyCode;
	
	if (key == 81) { // Gauche
		tournerDroitePlateau(false);
		actionDeJeu();
		tournerGauchePlateau(true);
	} else if (key == 68) { // Droite
		tournerGauchePlateau(false);
		actionDeJeu();
		tournerDroitePlateau(true);
	} else if (key == 83) { // Bas
		inverserPlateau(false);
		actionDeJeu();
		inverserPlateau(true);
	} else if (key == 90) { // Haut
		copierPlateau(false);
		actionDeJeu();
		copierPlateau(true);
	}
	
	actualiserPlateau();
}

var nbDeLancements = 0;

function initialiserJeu() {
	initialize(15);
	etablirLeTableau(15);
	changeColor(14,8);
	record = 0;

	nbDeLancements ++;
	if (nbDeLancements < 10) {
	document.getElementById("textePretencieux").innerHTML = "Je cherche une femelle pour transmettre au futur ma puissance."
				+"<br />Mais comme je veux aussi une femelle puissante, si tu penses en être une, je t'invite à jouer à ce petit jeu."
				+"<br />Le but est simple : il faut que la ligne du haut soit entièrement noir.";
	} else {
	document.getElementById("textePretencieux").innerHTML = "Comme tu sembles vraiment tenir à me rencontrer, je te donne les premiers chiffres de mon téléphone :"
				+"<br />+337 (comme je suis sympathique, c'est le numéro internationnal)";
	}
}

document.onkeydown = pressTouche;
