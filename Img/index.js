"use strict";

/* La table des images*/
const TABLE_IDENTIFIER			= '#memeenmeufjesuissurquejsuisunebonne';
/* La liste des catégories */
const NEPGEAR_DID_NOTHING_WRONG	= '#nepgeardidnothingwrong';
/* Le fichier xml qui contient les catégories */
const LIST_XML					= 'xml/list.xml';

// Base de données contenant toutes les catégories d'image
class Database {
	// Constructeur vide
	constructor(nomDuFichierXML) {
		this.databaseList		= [];
		this.currentDatabase	= undefined;
		
		// Charge la base de données via le fichier xml donné
		let that = this;
		$.ajax({
			type : 'GET',
			url  : nomDuFichierXML
		}).done(function (data) {
			// Remplir la liste des bases de données
			$(data).find('categorie').each(function() { 
				that.databaseList.push(new Categorie($(this)));
			});

			// Charger la première catégorie
			if (that.databaseList.length != 0) {
				that.setCurrentDb(0);
			}

			// Faire le rendu de la liste des catégories
			$(NEPGEAR_DID_NOTHING_WRONG).html(that.getRenderCategoryList());
		});
	}
	
	// Crée une liste de liens vers les différentes catégories
	getRenderCategoryList() {
		return '| ' + this.databaseList.map(cat => cat.getli()).join(" | ") + ' |';
	}

	// Créer du code html pour mettre dans un table
	getRenderCurrentCategory() {
		if (this.currentDatabase === undefined) {
			return '<tr>Pas de base de données</tr>';
		} else {
			return this.currentDatabase.getTableHtml();
		}
	}
	
	// Modifie la base de données actuellement chargée
	setCurrentDb(number) {
		this.currentDatabase = this.databaseList[number];
		this.currentDatabase.displayWithEventualLoading();
	}
	
	currentDatabasetrier(idTri) {
		this.currentDatabase.trier(idTri);
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
	
	displayWithEventualLoading() {
		if (this.associatedFiles === false) {
			this.chargerUneListeDimage(render);
		} else {
			render();
		}
	}
	
	chargerUneListeDimage(callback) {
		var that = this;
	
		$.ajax({
			type    : 'GET',
			url		: this.fichier,
			dataType: "json"
		})
		.done(function (data) {
			let columns = Column.generateColumnsArray(data.colonnes || []);
			let ordering = Ordering.generateOrderingArray(data.ordres || [] , columns);
			let defaultOrder = Ordering.findDefaultOrder(ordering, data.ordreParDefaut);
			let liste = Image.makeImageList(data.images, columns);
			
			that.colonnes = columns;
			that.orders = ordering;
			that.associatedFiles = liste;
			that.defaultOrder = defaultOrder;
			
			that.trier(defaultOrder);
			
			callback();
		})
		.fail(function(_request, _error) { alert("Echec de " + this.fichier); } );
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
		return '<a href="#" onclick="setCurrentDb('+ this.id + ')" >'+ this.nom +'</a>';
	}
	
	getTableHtml() {
		let that = this;
		let content = this.getColumnsHeader();
		
		this.associatedFiles.forEach(function (value) {
			content += value.imageGetHTMLCodeWithCols(that.colonnes);
		});
		
		return content;
	}
	
	getColumnsHeader() {
		return '<tr>' + this.colonnes.map(currentColumn => {
			const onclickAction = currentColumn.onclickAction;

			if (onclickAction === '') {
				return `<th>${currentColumn.nom}</th>`;
			} else {
				return `<th${onclickAction}><a href="#">${currentColumn.nom}</a></th>`;
			}
		}).join("") + '</tr>';
	}
}

class Column {
	constructor(colonne) {
		if (colonne === undefined) {
			this.nom		   = 'Titre';
			this.balise        = 'titre';
			this.onclickAction = ' onclick="trier(0)"';
		} else {
			this.nom			= colonne.nom;
			this.balise			= colonne.balise;
			this.onclickAction	= '';
		}
	}
	
	static generateColumnsArray(colonnes) {
		return [
			new Column(),
			...colonnes.map(colonne => new Column(colonne))
		];
	}
}

class Ordering {
	constructor(content, columns) {
		if (content === undefined) {
			this.nom			= 'Ban Landorus Therian pls';
			this.cols			= ['titre'];
			this.dragonAscent	= true;
		} else {
			this.nom = content.nom;
			this.cols = content.balises;
			this.dragonAscent = content.dragon === undefined || content.dragon === 'ascent';
			
			const nomPremiereColonne = this.cols[0];
			
			const i = columns.findIndex(col => col.balise === nomPremiereColonne);
			if (i !== -1) {
				columns[i].onclickAction = ' onclick="trier(' + i + ')"';
			}
		}
	}
	
	static generateOrderingArray(orderingTags, existingColumns) {
		return [
			new Ordering(),
			...orderingTags.map(tag => new Ordering(tag, existingColumns))
		]
	}
	
	static findDefaultOrder(orderingArray, defaultOrderInFile) {
		if (defaultOrderInFile === undefined) {
			return 0;
		}

		let defaultIndex = orderingArray.findIndex(ordering => ordering.nom === defaultOrderInFile);
		return defaultIndex !== -1 ? defaultIndex : 0;
	}
}

class Image {
	constructor(xmlElement, columns) {
		for (let column of columns) {
			let baliseName = column.balise;
			this[baliseName] = xmlElement[baliseName];
		}
	}
	
	static makeImageList(xmlList, columns) {
		return xmlList.map(element => new Image(element, columns));
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

let Utilitaire = {
	addBalise: function (baliseName, content) {
		return "<" + baliseName + ">" + content + "</" + baliseName + ">"
	},
	
	addLinkedBalise: function (baliseName, content) {
		var newContent = "<a class=\"linkToPic\" href=\"" + database.currentDatabase.prefixe + content + "\">" + content + "</a>";
	
		return this.addBalise(baliseName, newContent);
	},
	
	comparerAvecListe: function(element1, element2, liste) {
		for (let i = 0 ; i != liste.length ; i++) {
			let nomArg = liste[i];
		
			if (element1[nomArg] < element2[nomArg])
				return -1;
			
			if (element1[nomArg] > element2[nomArg])
				return 1;
		}
		
		return 0;
	}
}


/* ==================== ORTIES - SEXE DROGUE HORREUR ================ */

let database;

/** Change la catégorie actuellement affichée */
function setCurrentDb(number) {
	database.setCurrentDb(number);
}

/* Rempli le tableau avec le contenu de la base actuellement chargée */
function render() {
	$(TABLE_IDENTIFIER).html(database.getRenderCurrentCategory());
};

/* Change le tri selon la catégorie dont le numéro est donné */
function trier(argument) {
	database.currentDatabasetrier(argument);
	render();
}

$(document).ready(() => { database = new Database(LIST_XML); });
