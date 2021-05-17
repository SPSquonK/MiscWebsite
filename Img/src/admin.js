var currentDate = function() {
	var date = new Date();
	
	var annee = date.getFullYear();
	var mois  = date.getMonth()+1;
	var jour  = date.getDate();
	
	if (mois < 10) {
		mois = '0' + mois;
	}
	if (jour < 10) {
		jour = '0' + jour;
	}
	
	return annee + ' ' + mois + ' ' + jour;
}();


/* ==== NOUVELLES CLASSES ==== */

class ExistingFile {
	constructor(xmlElement) {
		this.titre = xmlElement.find('nom').text();
		this.date  = xmlElement.find('date').text();
	}
	
	static generateList(xmlList) {
		var list = [];
	
		xmlList.each(function () {
			list.push(new ExistingFile($(this)));
		});
		
		return list;
	}
}

/* ==== NOUVELLES METHODES POUR LES CLASSES ==== */

/* == DATABASE == */

Database.prototype.loadEveryXml = function() {
	for (let categorie of this.databaseList) {
		categorie.chargerUneListeDimage(function() {
			categorie.loadRealImagesInRepertory(function() {
				categorie.compareAssociatedAndReal();
				render();
			});
		});
	}
	
	this.addButton();
}

Database.prototype.getXML = function() {
	return this.currentDatabase.getXML();
};

Database.prototype.addButton = function() {
	var submitButton = '<input type="submit" value="Envoyer le formulaire" id="SUBSUB">';
	
	$(TABLE_IDENTIFIER).after(submitButton);
	
	var that = this;
	
	
	$('#SUBSUB').click(function() {
		that.majDatabase();
		var data = that.getXML();
		
		$.ajax({
			type : 'POST',
			url : 'xml/imageList.php?dossier=' + that.currentDatabase.getRepertoryInImage(),
			data : { content: data }
		}).done (function(data) {
			$('body').text(data);
		})
		
	});
	
	
}

Database.prototype.majDatabase = function() {
	this.currentDatabase.majDatabase();
};




/* ============================================================================ */
/* ==================== COLUMN / ORDERING
/* ============================================================================ */


Column.prototype.getXML = function() {
	var content = '';
	
	content += Utilitaire.addBalise('nom'   , this.nom);
	content += Utilitaire.addBalise('balise', this.balise);
	
	return content;
}

Ordering.prototype.getXML = function() {
	var content = '';
	
	
	for (var i = 0 ; i != this.cols.length ; i++) {
		content += Utilitaire.addBalise('balise', this.cols[i]);
	}
	
	content = Utilitaire.addBalise('nom'    , this.nom)
			+ Utilitaire.addBalise('balises', content);
	
	if (this.dragonAscent) {
		content += Utilitaire.addBalise('dragon', 'ascent');
	} else {
		content += Utilitaire.addBalise('dragon', 'not');
	}
	
	return content;
}






/* ============================================================================ */
/* ==================== CATEGORIE
/* ============================================================================ */

Categorie.prototype.getXMLOrders = function() {
	var content = '';
	
	var i;
	var order;
	
	for (i = 1 ; i != this.orders.length ; i++) {
		order = this.orders[i];
	
		content += Utilitaire.addBalise('ordering', order.getXML());
	}
	
	if (this.defaultOrder !== undefined && this.defaultOrder !== 0) {
		content += Utilitaire.addBalise('default', this.orders[this.defaultOrder].nom);
	}
	
	return Utilitaire.addBalise('orderings', content);
}

Categorie.prototype.getXMLImages = function() {
	var content = '';
	var image;
	
	for (image of this.associatedFiles) {
		if (!image.checked) {
			continue;
		}
		
		content += Utilitaire.addBalise('image', image.getXML(this.colonnes));
	}
	
	return content;
}



Categorie.prototype.majDatabase = function() {
	var that = this;
	
	$('input[name=imagesinxml]').each(function () {
		var file = that.associatedFiles[this.value];
		
		file.checked = this.checked;
		
		if (file.checked) {
			file.updateFromForm(that.colonnes);
		}
	});
};

Categorie.prototype.getXML = function() {
	var content = '';
	
	content += this.getXMLColumns();
	content += this.getXMLOrders();
	content += this.getXMLImages();
	
	return Utilitaire.addBalise('fichiers', content);
}

Categorie.prototype.getXMLColumns = function() {
	var content = '';
	
	var i;
	var colonne;
	
	for (i = 2 ; i != this.colonnes.length ; i++) {
		colonne = this.colonnes[i];
	
		content += Utilitaire.addBalise('colonne', colonne.getXML());
	}
	
	return Utilitaire.addBalise('col', content);
}

Categorie.prototype.getRepertoryInImage = function() {
	return this.prefixe.split("/")[1];
}

Categorie.prototype.loadRealImagesInRepertory = function(callback) {
	var that = this;
	
	$.ajax({
		type     : 'GET',
		url		 : 'img/imageList.php?dossier=' + that.getRepertoryInImage()
	})
	.done( function (data) {
		var listOfImagesInRep = ExistingFile.generateList($(data).find('image'));
		
		that.imagesInRep = listOfImagesInRep;
		
		if (callback !== undefined)
			callback();
	})
	.fail(function() {alert('marche po')});;
}

Categorie.prototype.getIndexOf = function(imageName) {
	for (i in this.associatedFiles) {
		if (this.associatedFiles[i].titre == imageName) {
			return i;
		}
	}
	
	return undefined;
}

Categorie.prototype.compareAssociatedAndReal = function() {
	var position;
	var newImages = [];
	
	for (image of this.imagesInRep) {
		position = this.getIndexOf(image.titre);
		
		if (position === undefined) {
			newImages.push(new Image().generateFromExisting(image, this.colonnes));
		} else {
			/*if (this.associatedFiles[position].hasOwnProperty('date')) {
				this.associatedFiles[position].date = image.date;
			}*/
		}
	}
	
	this.expandImagesWithCheckbox(newImages);
}

Categorie.prototype.expandImagesWithCheckbox = function(newImages) {
	var image;
	
	for (image of this.associatedFiles) {
		image.checked = true;
	}
	
	
	for (image of newImages) {
		image.checked = false;
	}
	
	this.associatedFiles = this.associatedFiles.concat(newImages);
	
	this.makeIdForImages();
	this.expandColumns();
}

Categorie.prototype.expandColumns = function() {
	var boxColumn = new Column();
	boxColumn.nom = 'X';

	this.colonnes.unshift(boxColumn);
	
	for (var i = 0 ; i != this.colonnes.length ; i++) {
		this.colonnes[i]._id = i;
		
		if (this.colonnes[i].balise == 'date') {
			this.colonnes[i].status = 'UNMUTABLE';
		}
	}
	
	this.colonnes[0].status = 'CHECK';
	this.colonnes[1].status = 'UNMUTABLE';
}

Categorie.prototype.makeIdForImages = function() {
	for (var i = 0 ; i != this.associatedFiles.length ; i++) {
		this.associatedFiles[i]._uid = i;
	}
}


/* ============================================================================ */
/* ==================== IMAGE
/* ============================================================================ */

Image.prototype.generateFromExisting = function (existingImage, columns) {
	var baliseName;
	
	for (var column of columns) {
		baliseName = column.balise;
		this[baliseName] = '';
	}
	
	this.titre = existingImage.titre;
	
	if (this.hasOwnProperty('date')) {
		this.date = currentDate;
	}
	
	return this;
}



Image.prototype.imageGetHTMLCodeWithCols = function(columns) {
	var codeHTML = '';
	
	codeHTML  = Utilitaire.addCheckBalise(this._uid, this.checked);
	codeHTML += Utilitaire.addLinkedBalise('td', this.titre);
	
	var col;
	
	for (var i = 2 ; i != columns.length ; i++) {
		col = columns[i];
		
		if (col.status == 'UNMUTABLE') {
			codeHTML += Utilitaire.addBalise('td', this[columns[i].balise]);
		} else {
			codeHTML += Utilitaire.addInputBalise(this[col.balise], this._uid, i);
		}
	}
	
	return Utilitaire.addBalise('tr', codeHTML);
}


Image.prototype.updateFromForm = function(colonnes) {
	var uid = this._uid;
	
	for (var i = 1 ; i != colonnes.length ; i++) {
		var balise_id = 'champ_' + uid + '_' + i;
		
		var selecteur = $('input[name='+balise_id+']');
		
		if (selecteur.length == 1) {
			this[colonnes[i].balise] = selecteur[0].value;
		}
	}
}

Image.prototype.getXML = function(colonnes) {
	var content = '';
	
	for (var i = 1 ; i != colonnes.length ; i++) {
		content += Utilitaire.addBalise(colonnes[i].balise, this[colonnes[i].balise]);
	}
	
	
	return content;
}

/* ============================================================================ */
/* ==================== UTILITAIRE PROTO
/* ============================================================================ */

UtilitairePROTO.prototype.addInputBalise = function(baseContent, uid, cid) {
	var balise_id = 'champ_' + uid + '_' + cid;
	var content = '';
	if (baseContent !== undefined) {
		content = ' value="'+baseContent+'"';
	}
	
	return '<td><input type="text" id="' + balise_id +'" name="' + balise_id +'"'+content+'></td>';
}

UtilitairePROTO.prototype.addCheckBalise = function(imageID, isChecked) {
	var checkedString = '';
	
	if (isChecked)
		checkedString = ' checked';
	
	return '<td><input type="checkbox" name="imagesinxml" value="'+imageID+'" '+checkedString+'></td>';
}


/* ==== DOCUMENT READY ==== */


$(document).ready( function() {
	setTimeout(function() {database.loadEveryXml(); }, 500);
});

