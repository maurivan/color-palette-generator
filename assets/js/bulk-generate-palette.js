jQuery(document).on('ready', function() {
	var cpg_colorThief;

	jQuery(document).on('click', '.cpg-button-bulk', function(e){
		e.preventDefault();
		var elem = jQuery(this);
		if(!elem.hasClass('disabled')){
			elem.text(cpg.generating + '...').attr('disabled', 'disabled').addClass('disabled');
		}
		var src = elem.data('src');
		var params = cpg_parseParams( elem.attr('href').split('?')[1] );
		cpg_CreateImg(src, params.post_id, params._wpnonce, params.colors);
	});

	jQuery('.cpg-color-picker').iris({
		mode: 'rgb',
		width: 158,
		change: function(event, ui) {
	        jQuery(event.target).css( 'background-color', ui.color.toString());
	    }
	});

	jQuery(document).on('click', '[data-add-color]', function(e){
		e.preventDefault();
		jQuery(this)
			.parents('td')
			.find('.cpg-color-table__colors')
			.append('<div class="cpg-color-table__div cpg-color-table__div--added">\
				<input type="text" value="" class="cpg-color-picker"/>\
				<button class="cpg-delete-color">&times;</button>\
			</div>');

		jQuery('.cpg-color-table__div--added .cpg-color-picker').iris({
			mode: 'rgb',
			width: 158,
			change: function(event, ui) {
		        jQuery(event.target).css( 'background-color', ui.color.toString());
		    }
		});
	});

	jQuery(document).on('click', '.cpg-delete-color', function(e){
		e.preventDefault();
		jQuery(this).parents('.cpg-color-table__div').remove();
	});

	jQuery(document).on('click', '.cpg-color-table .trash', function(e){
		e.preventDefault();
		jQuery(this).parents('tr').remove();
	});

	jQuery(document).on('click', function(e){
		if( !jQuery(e.target).parent().hasClass('cpg-color-picker-iris') ){
			jQuery('.cpg-color-picker-iris .cpg-color-picker').iris('hide');
			jQuery('.cpg-color-picker-iris').removeClass('cpg-color-picker-iris');
		}
	});

	jQuery(document).on('focus', '.cpg-color-picker', function(e){
		e.preventDefault();
		jQuery('.cpg-color-picker-iris .cpg-color-picker').iris('hide');
		jQuery(this).parent('td, .cpg-color-table__div').addClass('cpg-color-picker-iris');
		jQuery(this).iris('show');
	});

	jQuery(document).on('click', '.cpg-color-table__add-row', function(e){
		e.preventDefault();
		jQuery('.cpg-color-table tbody').append('<tr>\
			<td class="cpg-color-table__div--added">\
				<input type="text"class="cpg-color-picker"/><br/>\
				<div class="row-actions">\
					<span class="trash"><a href="#">Trash</a></span>\
				</div>\
			</td>\
			<td>\
				<input type="text" value="" placeholder="Color name" />\
			</td>\
			<td>\
				<div class="cpg-color-table__colors">\
				</div>\
				<div class="cpg-color-table__div"><button class="button tiny" data-add-color>Add color tint</button></div>\
			</td>\
		</tr>');

		jQuery('.cpg-color-table__div--added .cpg-color-picker').iris({
			mode: 'rgb',
			width: 158,
			change: function(event, ui) {
		        jQuery(event.target).css( 'background-color', ui.color.toString());
		    }
		});
	});

	jQuery(document).on('click', '[data-save-colors]', function(e){
		e.preventDefault();
		console.log(jQuery(this).parents('form').serialize());
	})

	function cpg_CreateImg(src, id, nonce, colors){
		var img = new Image;
		img.src = src;
		img.onload = function(){
		    cpg_colorThief = new ColorThief();
		    var color = cpg_AddColorsForImage(img, id, nonce, colors);
		};
	}

	function cpg_AddColorsForImage(image, id, nonce, colors) {
		colorThiefOutput = {};

		var color = new Promise(function(resolve, reject) {
		  resolve(cpg_colorThief.getColor(image));
		});

		var palette = color.then(function(value){
			colorThiefOutput.dominant = value;
			return new Promise(function(resolve, reject) {
				resolve(cpg_colorThief.getPalette(image, colors));
			});
		});

		palette.then(function(value){
			colorThiefOutput.palette = value;
		}).then(function(){
			jQuery.ajax({
				url: ajaxurl,
	         	type: 'post',
	         	dataType: 'JSON',
	         	timeout: 30000,
	         	data: {
					action: 'cpg_bulk_add_palette',
	         		dominant: colorThiefOutput.dominant,
	         		palette: colorThiefOutput.palette,
					id: id,
					nonce: nonce
	         	},
	         	success: function(response) {
	         		if(response.more){
	         			cpg_CreateImg(response.src, response.id, response.nonce);
	         		}else{
	         			jQuery('.cpg__inside--btn').html(cpg.done);
	         			jQuery('.cpg-hndle small').remove();
	         		}
         			jQuery('[data-with]').html( parseInt(jQuery('[data-with]').html()) + 1);
         			jQuery('[data-without]').html( parseInt(jQuery('[data-total]').html() - jQuery('[data-with]').html()));
	         	},
	         	error: function (jqXHR, exception) {
			        var msg = cpg_showErrors(jqXHR, exception);
			        jQuery('.cpg__inside--btn').html(msg);
			    },
	        });
		});
	}
});
