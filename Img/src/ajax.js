/* 
	==========================================================================================
	======================================== CLASSES =========================================
	==========================================================================================
*/
"use strict";

const TABLE_IDENTIFIER			= '#memeenmeufjesuissurquejsuisunebonne';
const NEPGEAR_DID_NOTHING_WRONG	= '#nepgeardidnothingwrong';
const LIST_XML					= 'xml/list.xml';
var database;

// Base de données contenant toutes les catégories d'image
class Database {
	// Constructeur vide
	constructor() {
		this.databaseList		= [];
		this.currentDatabase	= undefined;
		this.idSelectedDatabase = -1;
	}
	
	// Charge la base de données via le fichier xml donné
	loadDatabase(nomDuFichierXML) {
		var that = this;
		$.ajax({
			type : 'GET',
			url  : nomDuFichierXML
		})
		.done(function (data) {
			that.fillDatabaseFromInfoXML(data);
			that.chargerLaPremiereCategorie();
			$(NEPGEAR_DID_NOTHING_WRONG).html(that.getHtmlListCategories());
		});
	}
	
	// Rempli la liste des bases de données avec un fichier xml
	fillDatabaseFromInfoXML(data) {
		var that = this;
		$(data).find('categorie').each(function() { 
			that.databaseList.push(new Categorie($(this)));
		});
	}
	
	// Créer du code html pour mettre dans un table
	getTableHtmlOfCurrentDatabase() {
		if (this.idSelectedDatabase === -1) {
			return content = '<tr>Pas de base de données</tr>';
		} else {
			return this.currentDatabase.getTableHtml();
		}
	}
	
	// Crée une liste de liens vers les différentes catégories
	getHtmlListCategories() {
		var html = '';
		for (var cat of this.databaseList) {
			html += cat.getli();
		}
		
		html += ' |';
		return html;
	}
	
	// Charge la première catégorie de la liste
	chargerLaPremiereCategorie() {
		if (this.databaseList.length != 0) {
			this.setCurrentDb(0);
		}
	}
	
	// Modifie la base de données actuellement chargée
	setCurrentDb(number) {
		this.idSelectedDatabase = number;
		this.currentDatabase = this.databaseList[number];
		this.currentDatabase.displayWithEventualLoading();
	}
	
	currentDatabasetrier(idTri) {
		this.currentDatabase.trier(idTri);
	}
	
	currentDatabaseddd() {
		this.currentDatabase.ddd();
	}
	
}

// Une catégorie contiennt une banque d'images
class Categorie {
	constructor(elementXML) {
		this.id      		 = elementXML.find('id').text();
		this.fichier 		 = 'xml/' + elementXML.find('fichier').text();
		this.prefixe 		 = elementXML.find('prefixe').text();
		this.nom    		 = elementXML.find('nom').text();
		this.associatedFiles = false;
		this.orders			 = undefined;
		this.colonnes		 = undefined;
		this.currentOrder	 = undefined;
	}
	
	ddd() {
		render();
	}
	
	remplirAssociatedFiles(liste) {
		this.associatedFiles = liste;
		this.ddd();
	}
	
	displayWithEventualLoading() {
		if (this.associatedFiles === false) {
			this.chargerUneListeDimage(this.ddd);
		} else {
			this.ddd();
		}
	}
	
	chargerUneListeDimage(callback) {
		var that = this;
	
		$.ajax({
			type     : 'GET',
			url		 : this.fichier
		})
		.done( function (data) {
			var columns = Column.generateColumnsArray($(data).find('col').find('colonne'));
			var ordering = Ordering.generateOrderingArray($(data).find('orderings').find('ordering'), columns);
			var defaultOrder = Ordering.findDefaultOrder(ordering, $(data).find('orderings').find('default'));
			var liste = Image.makeImageList($(data).find('image'), columns);
			
			that.colonnes = columns;
			that.orders = ordering;
			that.associatedFiles = liste;
			that.defaultOrder = defaultOrder;
			
			that.trier(defaultOrder);
			
			callback();
		})
		.fail( function(request, error) { alert("Echec de " + this.fichier); } );
	};
	
	trier(argument) {
		if (this.currentOrder === undefined || this.currentOrder !== argument) {
			this.currentOrder = argument;
			
			var that = this;
			
			this.associatedFiles.sort(function(e1, e2) { return Utilitaire.comparerAvecListe(e1, e2, that.orders[argument].cols); });
			
			if (this.orders[argument].dragonAscent === false)
				this.associatedFiles.reverse();
			
		} else {
			this.associatedFiles.reverse();
		}
	}
	
	getli() {
		return ' | <a href="#" onclick="setCurrentDb('+ this.id + ')" >'+ this.nom +'</a>';
	}
	
	getTableHtml() {
		var content;
		var that = this;
		content = this.getColumnsHeader();
		
		this.associatedFiles.forEach(function (value) {
			content += value.imageGetHTMLCodeWithCols(that.colonnes);
		});
		
		return content;
	}
	
	getColumnsHeader() {
		var content = '<tr>';
		
		var currentColumn;
		var onclickAction;
		
		for (var i = 0 ; i != this.colonnes.length ; i++) {
			currentColumn = this.colonnes[i];
			onclickAction = currentColumn.onclickAction;
			
			var twobeis = '';			var mywaifu = '';
			if (onclickAction !== '' && onclickAction !== undefined) {
				twobeis = '<a href="#">';	mywaifu = '</a>';
			} else {
				onclickAction = '';
			}
			
			content = content + "<th"+ onclickAction + ">" + twobeis + currentColumn.nom + mywaifu +"</th>";
		}
				
		content = content + "</tr>";
		
		return content;
	}
}

class Column {
	constructor() {
		this.nom           = undefined;
		this.balise        = undefined;
		this.onclickAction = undefined;
	}
	
	becomeTitleColumn() {
		this.nom		   = 'Titre';
		this.balise        = 'titre';
		this.onclickAction = ' onclick="trier(0)"';
		
		return this;
	}
	
	genFromXML(xmlElement) {
		this.nom			= xmlElement.find('nom').text();
		this.balise			= xmlElement.find('balise').text();
		this.onclickAction	= '';
		
		return this;
	}
	
	static generateColumnsArray(xmlColonnesBalises) {
		var columns = [];
		columns.push(new Column().becomeTitleColumn());
		
		xmlColonnesBalises.each(function() {
			columns.push(new Column().genFromXML($(this)));
		});
		
		return columns;
	}
}

class Ordering {
	constructor() {
		this.nom			= undefined;
		this.cols			= undefined;
		this.dragonAscent	= undefined;
	}
	
	becomeTitleOrdering() {
		this.nom			= 'Ban Landorus Therian pls';
		this.cols			= ['titre'];
		this.dragonAscent	= true;
		
		return this;
	}
	
	genFromXML(xmlElement) {
		var listeColonnes = [];
		
		xmlElement.find('balise').each(function() {
			listeColonnes.push($(this).text());
		});
		
		this.nom			= xmlElement.find('nom').text();
		this.cols			= listeColonnes;
		this.dragonAscent	= xmlElement.find('dragon').length == 0 || xmlElement.find('dragon').text == 'ascent';
		
		return this;
	}
	
	static generateOrderingArray(xmlOrderingBalises, existingColumns) {
		var tableau = [];
		
		tableau.push(new Ordering().becomeTitleOrdering());
		
		xmlOrderingBalises.each(function() {
			tableau.push(new Ordering().genFromXML($(this)));
			
			var premiereCol = $(this).find('balise').first().text();
			
			for (var i = 0 ; i != existingColumns.length ; i++) {
				if (existingColumns[i].balise == premiereCol) {
					existingColumns[i].onclickAction = ' onclick="trier(' + i + ')"';
					break;
				}
			}
			
		});
		
		return tableau;
	}
	
	static findDefaultOrder(orderingArray, baseValueDefaultOrder) {
		var defaultOrder = baseValueDefaultOrder;
		
		if (defaultOrder.length == 0) {
			defaultOrder = 0;
		} else {
			var funfind = function (col, value) {
				for (var i = 0 ; i != col.length ; i++) {
					if (col[i].nom == value)
						return i;
				}
				return 0;
			}
			
			defaultOrder = funfind(orderingArray, defaultOrder.text());
		}
		
		return defaultOrder;
	}
}

class Image {
	constructor(xmlElement, columns) {
		if (xmlElement === undefined)
			return;
	
		var baliseName;
		var baliseInXML;
	
		for (var column of columns) {
			baliseName = column.balise;
			baliseInXML = xmlElement.find(baliseName);
			
			if (baliseInXML.length != 0) {
				this[baliseName] = baliseInXML.text();
			} else {
				this[baliseName] = '';
			}
		}
	}
	
	static makeImageList(xmlList, columns) {
		var liste = [];
		
		xmlList.each(
			function() { liste.push(new Image(($(this)), columns)); }
		);
		
		return liste;
	}
	
	imageGetHTMLCodeWithCols(columns) {
		var codeHTML = '';
		
		// Il y a toujours un titre
		codeHTML += Utilitaire.addLinkedBalise('td', this.titre);
		
		for (var i = 1 ; i != columns.length ; i++) {
			codeHTML += Utilitaire.addBalise('td', this[columns[i].balise]);
		}
		
		return Utilitaire.addBalise('tr', codeHTML);
	}
}

/* 
	==========================================================================================
	==========================================================================================
	==========================================================================================
*/



/* ====================== */

var UtilitairePROTO = function() {
	this.addBalise = function (baliseName, content) {
		return "<" + baliseName + ">" + content + "</" + baliseName + ">"
	};
	
	this.addLinkedBalise = function (baliseName, content) {
		var newContent = "<a class=\"linkToPic\" href=\"" + database.currentDatabase.prefixe + content + "\">" + content + "</a>";
	
		return this.addBalise(baliseName, newContent);
	};
	
	/* On garde */
	this.comparerAvecListe = function(element1, element2, liste) {
		var nomArg;
		for (var i = 0 ; i != liste.length ; i++) {
			nomArg = liste[i];
		
			if (element1[nomArg] < element2[nomArg])
				return -1;
			
			if (element1[nomArg] > element2[nomArg])
				return 1;
		}
		
		return 0;
	}
}

var Utilitaire = new UtilitairePROTO();


/* ==================== ORTIES - SEXE DROGUE HORREUR ================ */

var setCurrentDb = function (number) {
	database.setCurrentDb(number);
}

/*
	Rempli le tableau avec le contenu de la base actuellement chargée
*/
var render = function () {
	$(TABLE_IDENTIFIER).html(database.getTableHtmlOfCurrentDatabase());
};


/* onclickfunction */
var trier = function(argument) {
	database.currentDatabasetrier(argument);
	render();
}

$(document).ready(
	function() {
		database = new Database();
		database.loadDatabase(LIST_XML);
	}
);



