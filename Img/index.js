"use strict";

/* La table des images*/
const TABLE_IDENTIFIER			= '#memeenmeufjesuissurquejsuisunebonne';
/* La liste des catégories */
const NEPGEAR_DID_NOTHING_WRONG	= '#nepgeardidnothingwrong';
/* Le fichier xml qui contient les catégories */
const LIST_XML					= 'xml/categories.json';

// Base de données contenant toutes les catégories d'image
class Database {
	// Constructeur vide
	constructor(categoriesPath) {
		this.databaseList    = {};
		this.currentDatabase = undefined;
		
		// Charge la base de données via le fichier xml donné
		$.ajax({
			type : 'GET',
			url  : categoriesPath,
			dataType: "json"
		}).done(data => {
			// Remplir la liste des bases de données
			data.categories.map(category => [category.id, new Categorie(category)])
				.forEach(cat => this.databaseList[cat[0]] = cat[1]);

			// Charger la première catégorie
			this.setCurrentDb(data.defaultCategory);

			// Faire le rendu de la liste des catégories
			$(NEPGEAR_DID_NOTHING_WRONG).html(this.getRenderCategoryList());
		});
	}
	
	// Crée une liste de liens vers les différentes catégories
	getRenderCategoryList() {
		return '| ' + Object.values(this.databaseList).map(cat => cat.getli()).join(" | ") + ' |';
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
		if (this.currentDatabase) {
			this.currentDatabase.displayWithEventualLoading();
		}
	}
	
	currentDatabasetrier(idTri) {
		this.currentDatabase.trier(idTri);
	}
}

// Une catégorie contiennt une banque d'images
class Categorie {
	constructor(dict) {
		this.id      		 = dict.id;
		this.fichier 		 = 'xml/' + dict.fichier;
		this.prefixe 		 = dict.prefixe;
		this.nom    		 = dict.nom;
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
		$.ajax({
			type    : 'GET',
			url		: this.fichier,
			dataType: "json"
		})
		.done(data => {
			this.colonnes = Column.generateColumnsArray(data.colonnes || []);
			this.orders = Ordering.generateOrderingArray(data.ordres || [], this.colonnes);
			this.associatedFiles = Image.makeImageList(data.images, this.colonnes);			
			this.trier(data.ordreParDefaut);
			
			callback();
		})
		.fail((_request, _error) => alert("Echec de " + this.fichier));
	};
	
	trier(argument) {
		if (argument === undefined) argument = "Titre";
		
		const requestedOrder = this.orders.find(order => order.nom === argument);

		if (this.currentOrder !== requestedOrder) {
			this.currentOrder = requestedOrder;
						
			this.associatedFiles.sort(
				(e1, e2) => Utilitaire.comparerAvecListe(e1, e2, requestedOrder.cols)
			);
			
			if (requestedOrder.dragonAscent === false)
				this.associatedFiles.reverse();
			
		} else {
			this.associatedFiles.reverse();
		}
	}
	
	getli() {
		return `<a href="#" onclick="setCurrentDb('${this.id}')" >${this.nom}</a>`;
	}
	
	getTableHtml() {
		return this.getColumnsHeader()
			+ this.associatedFiles.map(
				value => value.imageGetHTMLCodeWithCols(this.colonnes)
			).join('');
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
			this.onclickAction = ' onclick="trier(\'Ban Landorus Therian pls\')"';
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
				columns[i].onclickAction = ` onclick="trier('${this.nom}')"`;
			}
		}
	}
	
	static generateOrderingArray(orderingTags, existingColumns) {
		return [
			new Ordering(),
			...orderingTags.map(tag => new Ordering(tag, existingColumns))
		]
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
