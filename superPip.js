
/*	thd.superPIP

	Requires: jquery.min.js, mustache.js

	Function: Acts as controller for superPIP
	
*/

"use strict";

//build namespace
var thd = (window.thd) ? window.thd : {};
thd.superPIP = {};


thd.superPIP = {

	//object used for event controls
	events:{},

	/*
		* @function loads default object in to memory, calls function to binds handlers
	*/
	init:function(){

		var self = this;
		var bp = thd.buildProduct;
		var skuLookup = 0;
		var hash = window.location.hash;

		//get default object, build product option controls
		bp.defaultObj = bp.currentProduct.get(SKU_DATA_JSON.products.product.defaultSku);
		bp.options.build({'currentProduct' : bp.defaultObj});

		//bindings for events
		$(bp.events).bind("defaultChanged", function() {
			var args = {
				'currentProduct' : bp.defaultObj,
				'isDefault' : true
			};
			bp.options.checkAvailibility(args);
			bp.availibility.update(args);
			bp.productTitle.build(args);
			bp.metaInfo.update(args);
			bp.price.update(args);
			bp.MultiViews.updateMainImage(args);
			bp.MultiViews.update(args);
			bp.description.update(args);
			bp.specs.update(args);
			bp.moreInfo.update(args);
			bp.buyBox.update(args);
			bp.irg.refresh({
				'currentProduct' : bp.defaultObj,
				'defaultLoad' : false
			});
			bp.reviews.update(args);
			bp.options.update(args);
			bp.shippingInfo.update(args);
			bp.shipping.update(args);
			bp.updateHash(args);
		});
		$(bp.events).bind("currentChanged", function() {
			var args = {
				'currentProduct' : bp.currentObj, 
				'isDefault' : false
			};
			thd.buildProduct.validOptions = true;

			bp.options.update(args);
			bp.productTitle.build(args);
			bp.metaInfo.update(args);
			bp.MultiViews.updateMainImage(args);
			bp.price.update(args);
		});


		if(hash.indexOf('csku=') > -1){
			hash = parseInt( hash.replace('#csku=','') );
			bp.defaultObj = bp.currentProduct.get(hash);
			bp.currentObj = bp.defaultObj;
			$(bp.events).trigger("currentChanged");
			$(bp.events).trigger("defaultChanged");
		}

	}
};

$(document).ready(function(){
	if(window.SKU_DATA_JSON){
		thd.superPIP.init();
	}
	//buid IRG
	if(window.SKU_RELATED_ITEMS_ID_JSON){
		var bp = thd.buildProduct;
		var irgLoadOnDocReady = f_getUrlParamsObj(window.location.search).irgLoadOnDocReady;
		var doAjaxLoad = (typeof irgLoadOnDocReady !== 'undefined' && irgLoadOnDocReady);

		if(window.SKU_DATA_JSON){
			bp.defaultObj = bp.currentProduct.get(SKU_DATA_JSON.products.product.defaultSku);
		}

		bp.irg.refresh({
			'currentProduct' : bp.defaultObj,
			'maxRelatedLoad' : SKU_RELATED_ITEMS_BUFFER_SIZE,
			'defaultLoad' : !doAjaxLoad
		});
	}
});




/*	thd.buildProduct

	Requires: jquery.min.js

	Object: contains html templates used for building markup, and helper functions for modules
*/
thd.buildProduct = (thd.buildProduct) ? thd.buildProduct : {};
thd.buildProduct = {
	events			: {},
	validOptions	: true,
	templates : {
		'productHeading'		: '{{^genericBrandFlag}}{{brandName}}{{/genericBrandFlag}} {{productLabel}}',
		'windowTitle'			: '{{^genericBrandFlag}}{{brandName}}{{/genericBrandFlag}} {{productLabel}} - {{modelNumber}} at The Home Depot',
		'metaItemTemplate'		: '<h2 class="{{selector}}" style="display: inline">{{name}} <span>{{data}}</span></h2>',
		'priceContainer'		: '<div class="pricingReg"> <span id="ajaxPrice" class="pReg"> ${{specialPrice}} </span> / {{uom}} </div>' +
									'{{#altDisplay}}<div class="pricingStrikeThru">WAS&nbsp;&nbsp;&nbsp;<span id="ajaxPriceStrikeThru">${{originalPrice}} </span></div>{{/altDisplay}}' +
									'{{#sqftCoverageMessage}}<p class="pricingSqFt">{{{sqftCoverageMessage}}}</p>{{/sqftCoverageMessage}}' +
									'{{#quantityLimit}}' +
									'<span class="qty_limit">' +
										' limit {{quantityLimit}} per order' +
									'</span>' +
									'{{/quantityLimit}}' +
									'<div id="bulkPriceParent">' +
									'{{#bulkPriceMessage}}' +
										'<div class="bulkPriceMsgLeft">' +
										'<span class="btn-icon"><i id="bulkPriceIcon" class="icon-info-orange"></i></span>' +
										'</div>'+
										'<div id="bulkPriceMsg" class="normal bulkPriceMsgRight">{{{bulkPriceMessage}}}</div>' +
									'{{/bulkPriceMessage}}' +
									'</div>',

		'longDescription'		: '<p class="normal">{{{description}}}</p>',
		'descriptionBullets'	: '<ul class="bulletList">{{#attribute}}<li>{{{value}}}</li>{{/attribute}}</ul>',
		'specs'					: '<table width="100%" border="0" class="tablePod td_grid_9 tableSplit" cellspacing="0" cellpadding="0">{{#tr}}<tr>{{#.}}<td>{{{name}}}</td><td>{{{value}}}</td>{{/.}}</td></tr>{{/tr}}</table>',
		'moreInfoTemplate'		: '<ul>' +
									'{{#attribute}}' +
									'<li><a class="plus b" href="{{url}}" target="pdf">{{name}}</a></li>' +
									'{{/attribute}}' +
									'</ul>',
		'shippingInfoTemplate'	: '<h4 class="title xlarge">SHIPPING OPTIONS</h4>' +
									'{{#bossFreeShipOn}}<p class="bossMsg_btm" id="bossShipMsg">Your item is available for FREE shipping to your local store!<br><br></p>{{/bossFreeShipOn}}' +
									'{{#shipLeadDaysMsg}}<p>{{shipLeadDaysMsg}}{{/shipLeadDaysMsg}}</p><br /><br />' +
									'{{{shipTabAttributes}}}' +
									'<div class="lower_pod_cta"><a href="#header" class="up_arrow">Return To Top</a></div>',
		'mainImage'				: '<a href="javascript:openFeatureFlex(\'{{zoomUrl}}\',\'\',\'768\',\'705\',true,false,false,false,false,false);" class="iLinks">'+
										'<img src="{{location}}" id="superPIP__productImage">' +
									'</a>',
		'mainImageAlt'			: '<a href="javascript:openLayer(\'popup-enlarge-image\');" class="iLinks">'+
										'<img src="{{location}}" id="superPIP__productImage">' +
									'</a>',
		'ZOOM VIEW'				: "javascript:openFeatureFlex('{{location}}','','768','705',true,false,false,false,false,false)",
		'MORE VIEW'				: "javascript:openFeatureFlex('{{location}}','vpop','768','705',true,false,false,false,false,false);",
		'VIDEO'					: "javascript:openFeatureFlex('{{location}}','','768','705',true,false,false,false,false,false);",
		'360 SPIN'				: "javascript:openFeatureFlex('{{location}}','','768','705',true,false,false,false,false,false);",
		'FEATURES'				: "javascript:openFeatureFlex('{{location}}','','768','705',true,false,false,false,false,false);",
		'swatch'				: '<div class="product_sku_Overlay_ColorSwatch"><ul>{{#options}}<li><a href="#" data-itemid="{{itemID}}"><img src="{{swatchPath}}/{{imgSize}}/{{subFolder}}/{{attributeSwatch}}_{{imgSize}}.jpg" title="{{value}}" alt="{{value}}" /></a></li>{{/options}}</ul></div>',
		'singleAttribute'		: '{{attributeName}} : {{#options}}{{value}}{{/options}}',
		'dropdown'				: '{{attributeName}}<br /><select id="listOption{{index}}" name="listOption{{index}}">{{#options}}<option value="{{itemID}}" data-itemid="{{itemID}}" availablestatus="yes">{{value}}</option>{{/options}}</select>',
		'swatchTitle'			: '<strong>{{attributeName}}</strong>: {{attributeValue}}',
		'irgCat'				: '<div class="productSlider" id="superPIP__slider_{{groupType}}">' +
										'<div class="container">' +
											'<a href="#" class="btn btn_scroll_l disabled"></a>' +
											'<a href="#" class="btn btn_scroll_r"></a>' +
											'<div class="multiPane">' +
												'<div class="items mp_container">' +
													'{{#groupData}}{{>group}}{{/groupData}}' +
												'</div>' +
											'</div>' +
										'</div>' +
									'</div>',
		'irgData'				: {group: '<div class="item border" _catentryid="{{itemId}}" _quickviewurl="{{quickViewUrl}}">' +
										'<div class="pipItems">' +
											'<a href="{{productUrl}}"><img src="{{imageUrl}}"></a>' +
											'<a class="quickView noOutline png_fix" href="{{quickViewUrl}}">quickView</a>' +
											'<p class="pipOfferPrice"><span>${{specialPrice}}</span></p>' +
											'<p class="pipListPrice"><span>{{#showListPrice}}WAS {{originalPrice}}{{/showListPrice}}</span></p>' +
											'<p class="pipDescription"><a href="{{productUrl}}">{{productLabel}}</a></p>' +
										'</div>' +
									'</div>'},
		'irgBuffer'				: '{{#groupData}}{{>group}}{{/groupData}}',
		'RelatedTabTemplate'	: '	<ul class="hd_tabs">' +
										'{{#tab}}' +
										'<li id="tab_{{tabName}}" data-tabId="{{tabData}}">{{tabDisplay}} (<span class="collections_count">{{tabCount}}</span>)</li>' +
										'{{/tab}}' +
									'</ul>',
		'shipping'				:	'{{#shippingMessage2}}<div class="shippingMsg_2 shipSpecial">{{{shippingMessage2}}}</div>{{/shippingMessage2}}' +
									'<div class="produdct_Rebateinfo">' +
									/*
									'<dl>' +
										'{{#promotionEntry}}' +
											'{{#promoDescription}}' +
											'<dd>{{promoDescription}} <a href="#" onclick="javascript:launchNewWindow("{{promoUrl}}",275,565);">Learn More</a></dd>' +
											'{{/promoDescription}}' +
										'{{/promotionEntry}}' +
									'</dl>' +
									*/
									'{{{rebateInfo}}}' +
									'</div>' +

									'{{#excludedShipStates}}' +
									'<div class="shippingMsg_Exclude">'	+
											'<p class="excludedShipStates">{{excludedShipStates}}</p>'	+
									'</div>' +
									'{{/excludedShipStates}}' +
									'<div class="shippingMsg_1">{{{shippingMessage1}}}</div>',
		'backorder'				:	'<div id="backOrdered_wrapper"><div class="backOrderedOnline clear_btn" id="backOrderedOnline"><span class="grey_exclamation">Backordered Online {{backOrderMessage}}</span></div></div>'

	},

	browser : $.browser,

	/**
		* @function - sets the location hash to current object incase of page refresh
	*/
	updateHash : function(){
		var self = this;
		window.location.hash = 'csku=' +self.defaultObj.data.itemId;

		$('#productTabsMenu a, a.up_arrow').unbind('click').bind('click',function(e){
			e.preventDefault();
			if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') 
				&& location.hostname == this.hostname) {
					var $target = $(this.hash);
					$target = $target.length && $target || $('[name=' + this.hash.slice(1) +']');
					if ($target.length) {
						var targetOffset = $target.offset().top;
						$('html,body').animate({scrollTop: targetOffset}, 150);
						return false;
					}
			}
		});
	},

	/**
		* @function - takes values from obj.defaults.elm and stores specified elements to reduce dom queries
		* @returns {object} list of jquery objects
	*/
	getElms : function(obj){
		var domObj	= {};
		var tempObj = {};

		if(obj.defaults.elms){
			for(var i in obj.defaults.elms){
				if((typeof obj.defaults.elms[i]) === 'string'){
					domObj[i] = $(obj.defaults.elms[i]);
				}else{
					tempObj = {};

					for(var j in obj.defaults.elms[i]){
						tempObj[j] = $(obj.defaults.elms[i][j]);
					}
					domObj[i] = tempObj;
				}
			}
			return domObj;
		}else{
			return false;
		}
	},
	/**
		* @function - finds desired template based on param value
		* @returns {string} template value
	*/
	getTemplate : function(template){
		var self = this;
		for (var k in self.templates) {
			if(k === template){
				return self.templates[k];
			}
		}
	},
	/**
		* @function - single values are some times expected to be arrays, converts single object to an array
		* @returns {array}
	*/
	convertToArray: function(obj){
		var tempVal = obj;
		var newObj = [];

		if(typeof obj !== 'undefined'){
			if (!obj.length) {
				newObj[newObj.length] = tempVal;
			}else{
				newObj = obj;
			}
		}

		return newObj;
	},
	/**
		* @function - makes simple jquery ajax call based on url passed
		* @returns {object}
	*/
	getData : function(args){
		var bp = thd.buildProduct;
		$.ajax({
			url: args.url,
			dataType: 'json',
			async: true,

			success: function(data) {
				bp.relatedData = data;
				if(args.callback){args.callback();}
				return true;
			},
			error: function(jqXHR, exception) {
				if(args.error){args.error();}
				bp.logError(jqXHR.responseText + ' - ' + jqXHR.status + ' - ' + exception);
				return false;
			}
		});
	},
	logError : function(message){
		if(console.indexOf !== 'undefined'){
			console.log(message);
		}
	},
	createObject : function () {function NewObj() {}
		return function (objA, objB) {
			NewObj.prototype = objA;
			var createdObj = new NewObj();
			if (objB) {
				$.extend(createdObj, objB);
			}
			return createdObj;
		};
	}()
};

//Adds filter method for IE, may want to put in global scripts
if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp */)
  {

    if (this === null)
      throw new TypeError();

    var t = new Object(this);
    var len = t.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }

    return res;
  };
}




/*	thd.buildProduct.currentProduct

	Requires: jquery.min.js

	Function: serves as helper to get product info based on productID json data
	
*/
thd.buildProduct.currentProduct = {
	/**
		* @function
		* @returns {object} product data from json
	*/
	get : function(productID,callback){
		var self = this;
		var skus = SKU_DATA_JSON.products.product.skus.sku;
		//more than one element, type = supersku
		if(skus.length){
			self.type = 'ssku';
			//loop through all skus until productID is matched
			for(var i in skus){
				if(skus[i].itemId === productID){
					return {
						'data':skus[i],
						'type':'ssku'
					};
				}
			}
		//object is regular sku, no need to verify if productID is matched since there is only one
		}else{
			return {
				'data':skus,
				'type':'sku'
			};
		}

		if(callback){callback(this);}
	}
};




/*	thd.buildProduct.options

	Requires: jquery.min.js, mustache.js

	Function: Builds sku options and initializes behaviors
	
*/
thd.buildProduct.options = {
	defaults : {
		elms :{
			'parent'			: '.product_skuoptions'
		},
		'swatchTemplate'	: thd.buildProduct.templates.swatch,
		'singleAttribute'	: thd.buildProduct.templates.singleAttribute,
		'dropDownTemplate'	: thd.buildProduct.templates.dropdown,
		'swatchTitle'		: thd.buildProduct.templates.swatchTitle,
		'currentProduct'	: {},
		'hasSwatch'			: false
	},
	/**
		* @function - builds sku options based on definingAttributes
	*/
	build:function(args,callback){
		var self = this;
		var bp = thd.buildProduct;

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}
		

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length){
			self.definingAttributes = self.getAvailableAttributes();

			self.buildOptionMarkup();

			self.initBehaviors();

			self.update(self.defaults);

			if(callback){callback(this);}
		}
	},

	/**
		* @function - updates view of supersku product controls
	*/
	update:function(args,callback){
		var self = this;
		var bp = thd.buildProduct;
		var swatchAvailable = (self.definingAttributes[0].isSwatch) ? true : false;
		var definingAttributes = {};
		var swatchData = [];
		var attributeData = [];
		var markup = '';
		var currentDropDown = '';

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		if(self.defaults.isDefault){
			$('.product_sku_Overlay_ColorSwatch li',self.cachedElms.parent).removeClass('selected');
			$("a[data-itemid = '"+self.defaults.currentProduct.data.itemId+"']").parent().addClass('selected');
		}

		/**
			* @function - updates swatch color name
		*/
		var updateSwatch = function(){
			definingAttributes = self.defaults.currentProduct.data.definingAttributes;

			definingAttributes.definingAttributeEntry = bp.convertToArray(definingAttributes.definingAttributeEntry);

			//return attribute object that matches the default swatch attribute name
			swatchData = definingAttributes.definingAttributeEntry.filter(function (option) { return option.attributeName === self.definingAttributes[0].attributeName;});

			//build markup from template
			markup = Mustache.to_html(self.defaults.swatchTitle, swatchData[0]);
			$('.product_sku_Overlay_FinishType',self.cachedElms.parent).html(markup);
		};


		/**
			* @function - matches itemId for current option, based on combination of currently selected values
			* @returns {integer|boolean (false)} itemId - if it doesn't find a proper combination, returns false
		*/
		var getSkuValue = function(attributeVal, index){

			var skuData = SKU_DATA_JSON.products.product.skus.sku;
			var currentEntries = bp.convertToArray(self.defaults.currentProduct.data.definingAttributes.definingAttributeEntry);
			var currentVal = '';
			var matchCount = 0;
			var defaultAttributes = [];
			var validSku = '';
			var attrMatch = false;
			var multiVals = '';

			//loops through all skus in main object
			for (var k=0; k<skuData.length; k++){
				//get this sku's attributes so we can compare with current
				defaultAttributes = bp.convertToArray(skuData[k].definingAttributes.definingAttributeEntry);
				
				matchCount = 0;
				
			
					//iterate through currentProduct attributes
					for (var l=0; l<currentEntries.length; l++){
	
						//set value to be used for comparison to either the attribute value that is passed in, or to the current value in currentProduct
						currentVal = (index === l) ? attributeVal : currentEntries[l].attributeValue;
						
						//verify there is more than option
						multiVals = (self.definingAttributes[l].options.length > 1) ? true : false;
						
						
						//verify values match
						attrMatch = (currentVal.toString() === defaultAttributes[l].attributeValue.toString()) ? true : false;


						if(!multiVals) attrMatch = true;

						if(attrMatch){
							matchCount ++;
						}

						
					}

	
					//all values matched, we now have a sku to return
					if(matchCount === currentEntries.length){
						return skuData[k].itemId;
					}

			}

			return false;

		};


		var updateDropDowns = function(){

					$('select',self.cachedElms.parent).each(function(i){
						var select = $(this);
						var index = parseInt( $(this).attr('id').replace('listOption','') );
						var defltDefiningAttributeEntry = bp.convertToArray(self.defaults.currentProduct.data.definingAttributes.definingAttributeEntry);
						var selectedVal = defltDefiningAttributeEntry[index].attributeValue.toString();
						var customSpan = document.getElementById("selectlistOption" + index);

						//when there is no swatch, and multiple dropdowns, don't validate
						var validateNeeded = (i !== 0 && !self.defaults.hasSwatch && $('select',self.cachedElms.parent).length === 1)? false : true;

						if(validateNeeded){
							$('option', select).each(function(){

								var option = $(this);
								var skuValue = '';
								var optionTxt = option.text();
								if(thd.buildProduct.validOptions){
									if(self.definingAttributes.length > 1){

										skuValue = getSkuValue(optionTxt, index);

										if(selectedVal === optionTxt){
											skuValue = self.defaults.currentProduct.data.itemId;
											if(customSpan){
												customSpan.childNodes[0].nodeValue = optionTxt;
											}
										}

										if(skuValue){
											option.attr('availableStatus','yes')
												.attr('data-itemid', skuValue)
												.val(skuValue)
												.css({'color' : '#000'});
										}else{
											option.attr('availableStatus','no')
												.attr('data-itemid', skuValue)
												.val('invalid')
												.css({'color' : '#999'});
										}

										if(selectedVal === optionTxt){
											select.val(option.val());
										}
									}else{
										if(selectedVal === optionTxt){
											select.val(option.val());
										}
									}
								}
							});
						}
					});

		};

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length){
			if(swatchAvailable){
				updateSwatch();
			}
			updateDropDowns();

			if(callback){callback(this);}
		}
	},

	/**
		* @function - checks to see if option combination is currently available
	*/
	checkAvailibility:function(){
		var self = this;
		var bp = thd.buildProduct;
		var index = '';
		var attributeEntry = [];
		var pip = thd.superPIP;

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length){
			$('.product_sku_Overlay_ListBoxes').find('select').each(function(){
				if( $(this).val() === 'invalid'){
					thd.buildProduct.validOptions = false;
					//stop the loop, error is found
					return false;
				}else{
					thd.buildProduct.validOptions = true;
				}
			});
		}
	},


	/**
		* @function - binds behavior functionality to swatches and dropdowns
	*/
	initBehaviors:function(){
		var bp = thd.buildProduct;
		var self = this;
		
		$('.product_sku_Overlay_ColorSwatch li',self.cachedElms.parent).bind('click',function(e){
			e.preventDefault();
			bp.defaultObj = bp.currentObj;
			$(bp.events).trigger("defaultChanged");

		
		}).bind('mouseover',function(e){
			e.preventDefault();
			bp.currentObj = bp.currentProduct.get( parseInt($('a',this).attr('data-itemid')) );
			$(bp.events).trigger("currentChanged");

			//add current class
			if(!$(this).hasClass('selected')){
				$(this).addClass('current');
			}
		
		}).bind('mouseout',function(e){
			e.preventDefault();
			bp.currentObj = bp.defaultObj;

			$(bp.events).trigger("currentChanged");

			//remove current class
			$(this).removeClass('current');
		
		});

		$('.product_sku_Overlay_ListBoxes').find('select').bind('change',function(e){
			bp.defaultObj = bp.currentProduct.get( parseInt($(this).val()) );
			bp.currentObj = bp.defaultObj;
			$(bp.events).trigger("defaultChanged");
		});
	},


	/**
		* @function - creates marks up for sku options
	*/
	buildOptionMarkup:function(){
		var self = this;
		var bp = thd.buildProduct;
		var template = '';
		var markup = '';
		var optionVal = '';

		self.cachedElms.parent.show().find('select').remove();

		for (var i=0; i<self.definingAttributes.length; i++){
			
			self.definingAttributes[i].index = i;
			
			//swatches
			if(self.definingAttributes[i].isSwatch){
				
				self.defaults.hasSwatch = true;

				template = self.defaults.swatchTemplate;
				markup = $(Mustache.to_html(template, self.definingAttributes[i]));
				
				$('a', markup).each(function(){
					var $this = $(this);
					var swatchImg = $('img',$this);
					var swatchVal = swatchImg.attr('alt');
					var definingAttributeEntry = self.defaults.currentProduct.data.definingAttributes.definingAttributeEntry;
					var isDefault = $.grep(definingAttributeEntry, function(a){
						return (a.attributeValue === swatchVal);
					});
					
					//color value matches default. set itemid to default id
					if(isDefault.length > 0){
						$this.attr('data-itemid', SKU_DATA_JSON.products.product.defaultSku)
							.parent().addClass('selected');
					}
				});

				$('.product_sku_Overlay_ColorSwtHolder').append(markup);

			//standard dropdown/single options
			}else if(!self.definingAttributes[i].isSwatch){
				//define template based (single or standard dropdown)
				template = (self.definingAttributes[i].options.length === 1) ? self.defaults.singleAttribute : self.defaults.dropDownTemplate;

				/*
				for (var j=0; j<self.definingAttributes[i].options.length; j++){
					
					optionVal = self.definingAttributes[i].options[j].value;

					if( isNumber(optionVal) ) {
						self.definingAttributes[i].options[j].value = optionVal.toFixed(1);
					}
				}
				*/

				//build markup
				markup = Mustache.to_html(template, self.definingAttributes[i]);
				$('.product_sku_Overlay_ListBoxes_'+i , self.cachedElms.parent).html(markup);
			}
		}

		function isNumber(n) {
			return !isNaN(parseFloat(n)) && isFinite(n);
		}
	},

	/**
		* @function - compiles grouping of available options
		* @returns {object}
	*/
	getAvailableAttributes:function(){
		var self = this;
		var bp = thd.buildProduct;
		var availableAttributes = [];
		var currentData = self.defaults.currentProduct.data;
		var sku = bp.convertToArray(SKU_DATA_JSON.products.product.skus.sku);
		var matchedAttribute = {};
		var definingAttributeEntry = [];
		var inAttributes = '';
		var isSwatch = false;
		var imgSize = 20;
		var subFolder = '';
		var newOption = '';
		var swatchPath = 'http://www.homedepot.com/catalog/swatchImages';

		//when single value, it comes in as a single object. need to convert it to an array when this happens
		currentData.definingAttributes.definingAttributeEntry = bp.convertToArray(currentData.definingAttributes.definingAttributeEntry);

		//get attributes from default object and put them in to available attr object
		for (var k=0; k<currentData.definingAttributes.definingAttributeEntry.length; k++){
				
			isSwatch = (currentData.definingAttributes.definingAttributeEntry[k].attributeSwatch) ? true : false;

			availableAttributes[availableAttributes.length] = {
				'attributeName'	: currentData.definingAttributes.definingAttributeEntry[k].attributeName,
				'options'		: [],
				'isSwatch'		: isSwatch
			};
		}



		//now that we have a list of attributes, now we need to go through the rest of the object and build the options
		for (var i=0; i<availableAttributes.length; i++){
			//loop through each sku to see if it's option is in this attribute's array
			for (var j=0; j<sku.length; j++){
				definingAttributeEntry = bp.convertToArray(sku[j].definingAttributes.definingAttributeEntry);
				//filter out sku attributes that do not match the attribute we're looking for (should only get 1)
				matchedAttribute = definingAttributeEntry.filter(function (entry) { return entry.attributeName === availableAttributes[i].attributeName; });
				
				//now that we have the matched attribute, we need to know if it's value is already in the new attributes array
				inAttributes = availableAttributes[i].options.filter(function (option) { return option.value === matchedAttribute[0].attributeValue; });
				if(inAttributes.length === 0){
					newOption = {
						'itemID'	: sku[j].itemId,
						'value'		: matchedAttribute[0].attributeValue
					};
					if(availableAttributes[i].isSwatch){
						//check to see if current attribute has a swatch value
						if(matchedAttribute[0].attributeSwatch){
							newOption = $.extend(newOption,{
								'imgSize'	: imgSize,
								'subFolder'	: matchedAttribute[0].attributeSwatch.substring(0,2),
								'attributeSwatch' : matchedAttribute[0].attributeSwatch,
								'swatchPath' : swatchPath
							});
						//if no swatch value, revert attribute to dropdown
						}else{
							availableAttributes[i].isSwatch = false;
						}
					}
					availableAttributes[i].options[availableAttributes[i].options.length] = newOption;
				}

				//sort option array
				
				availableAttributes[i].options = availableAttributes[i].options.sort(function(a, b){
					var valueA=a.value.toString().toLowerCase(), valueB=b.value.toString().toLowerCase();
						if (valueA < valueB) //sort string ascending
							return -1 ;
						if (valueA > valueB)
							return 1;
					return 0; //default return value (no sorting);
				});
			}
		}
		return availableAttributes;
	}
};


/*	thd.buildProduct.availibility

	Requires: jquery.min.js, mustache.js

	Function: Handles functionality for displaying availibility in states on PIP and stand alone modules
	
*/
thd.buildProduct.availibility = {
	defaults : {
		elms :{
			'parent'			: '#availabilityStates'
		},
		'currentProduct'	: {}
	},
	/**
		* @function - stores specified elements to reduce dom queries
		* @returns {object} list of jquery objects
	*/
	update:function(args,callback){
		var self = this;
		var bp = thd.buildProduct;

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length){
			$('div.state',self.cachedElms.parent).hide().filter('.state0').show();
		}
	}
};

/*	thd.buildProduct.productTitle

	Requires: jquery.min.js, mustache.js

	Function: Handles functionality for displaying product title on PIP and stand alone modules
	
*/
thd.buildProduct.productTitle = {
	defaults : {
		elms :{
			'parent'			: '.product_title'
		},
		'currentProduct'	: {}
	},
	/**
		* @function - stores specified elements to reduce dom queries
		* @returns {object} list of jquery objects
	*/
	build:function(args,callback){
		var self = this;
		var bp = thd.buildProduct;
		var data = {};
		var titleMarkup = '';

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length){
			if(thd.buildProduct.validOptions){
				data = {
					'brandName'		: self.defaults.currentProduct.data.info.brandName,
					'productLabel'	: self.defaults.currentProduct.data.info.productLabel,
					'modelNumber'	: self.defaults.currentProduct.data.info.modelNumber
				};

				//create product title for page content
				titleMarkup = Mustache.to_html(thd.buildProduct.templates.productHeading, data);

				self.cachedElms.parent.html(titleMarkup);

				//when current object and default object are the same, that means the default object just changed so we need to update the page title
				if(bp.currentObj === bp.defaultObj){
					//create product title for window
					titleMarkup = Mustache.to_html(thd.buildProduct.templates.windowTitle, data);
					window.document.title = titleMarkup;
				}

				if(callback){callback(this);}
			}
		}
	}
};

/*	thd.buildProduct.buyBox

	Requires: jquery.min.js, mustache.js

	Function: Handles functionality for displaying product buyBox on PIP and stand alone modules
	
*/
thd.buildProduct.buyBox = {
	defaults : {
		elms :{
			'parent'					: '#buybox_ctn',
			'messages'					: {
				'OnlineOnly'				: '#OnlineOnly',
				'availableInLocalStore'		: '#availInYourLocalStore',
				'availCheckInStore'			: '#availCheckInStore',
				'BOSSMsg'					: '#store_bossMsg',
				'BOPISMsg'						: '#store_bopisMsg',
				
				'superPIP__prodMsg_1'		: '#superPIP__prodMsg_1'
			},
			'buyBoxForm'				: '#OrderItemAddForm',
			'addToCartBtn'				: '.buybox_crtbtn',
			'qntyLabel'					: "label[for='buybox_quantity_field']",
			'qntyBox'					: '#buybox_quantity_field',
			'bopisButn'					: '#id_PIP_invokeBopisOverlay',
			'bopisLink'					: '#id_PIP_invokeBopisOverlay_link',
			'bossButn'					: '#id_PIP_invokeBossOverlay',
			'bossLink'					: '#id_PIP_invokeBossOverlay_link',
			'errorBox'					: '#errorqty',
			'outOfStockOnline'			: '#outOfStockOnline',
			'checkingimage'				: '#availabilityStates .checkingimage',
			'zipCodeTxt'				: '#zipCodeTxt',
			'zipCodeImg'				: '#zipCodeImg',
			'availabilityStates'		: '#availabilityStates',
			'storeMsgCtn'				: '#productinfo_ctn .storeMsg_ctn',
			'select_StoreLink'			: '#select_StoreLink',
			'qtyLimitDiv'				: '#qtyLimitDiv',
			'rrAvailibityMsg'			: '#rrAvailibityMsg',
			'notSoldOnline'				: '#notSoldOnline',
			'pipZipBlock'				: '#generalPIP_localizescreen'
		},
		'currentProduct'	: {}
	},
	/**
		* @function - stores specified elements to reduce dom queries
		* @returns {object} list of jquery objects
	*/
	update:function(args,callback){
		var self = this;
		var bp = thd.buildProduct;
		var data = {};

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length){
			if(thd.buildProduct.validOptions){
				self.updateFormVals();
				self.showBoxControls();
				self.showBuyMessages();
			}else{
				self.cachedElms.buyBoxForm.hide();
			}
		}
	},

	/**
		* @function - updates required html form elements with correct values
	*/
	showBoxControls:function(){
		var self = this;
		var bp = thd.buildProduct;
		self.messageVals = self.getMessageVals();

		if(!thd.buildProduct.validOptions){
			self.cachedElms.buyBoxForm.hide();
		}else{
			self.cachedElms.buyBoxForm.show();
			self.cachedElms.errorBox.hide();
			if(self.messageVals.buyable && !self.messageVals.notSoldOnline){
				if(self.messageVals.availabilityType !== 'Browse Only' || self.messageVals.showBopis){
					self.cachedElms.qntyBox.show();
					self.cachedElms.qntyLabel.show();
					if(!self.messageVals.showBopis){
						self.cachedElms.addToCartBtn.show();
					}else{
						self.cachedElms.notSoldOnline.hide();
					}
				}else{
					self.cachedElms.qntyLabel.hide();
					self.cachedElms.qntyBox.hide();
					self.cachedElms.addToCartBtn.hide();
					self.cachedElms.notSoldOnline.show();
				}
				self.cachedElms.outOfStockOnline.hide();
			}else{
				self.cachedElms.addToCartBtn.hide();
				self.cachedElms.qntyLabel.hide();
				self.cachedElms.qntyBox.hide();
				if(self.messageVals.availabilityType !== 'Browse Only'){
					self.cachedElms.outOfStockOnline.show();
					self.cachedElms.notSoldOnline.hide();
				}else{
					self.cachedElms.notSoldOnline.show();
				}
			}
		}

		if(self.cachedElms.availabilityStates.length){
			self.cachedElms.checkingimage.hide();
			self.cachedElms.zipCodeImg.show();
			self.cachedElms.zipCodeTxt.show();
		}
	},
	/**
		* @function - updates required html form elements with correct values
	*/
	updateFormVals:function(){
		var self = this;
		var data = self.defaults.currentProduct.data;

		$('[name=modelNumber]').val(data.info.modelNumber);
		$('[name=vendorNumber]').val(data.info.vendorNumber);
		$('[name=productClass]').val(data.info.vendorNumber);
		$('[name=subClassNumber]').val(data.info.productSubClass);
		$('[name=productId]').val(data.itemId);
		$('[name=catEntryId_1]').val(data.itemId);
		$('[name=requiredURLParams]').val('&productId=' + data.itemId + '&superSkuId=' + data.productId); // to update the edit zipcode url
	},
	/**
		* @function - shows appropriate buy messaging based on appropriate flags
	*/
	showBuyMessages:function(){
		var self = this;
		var messageArr = ['OnlineOnly','availInYourLocalStore'/*,'homeDelivery'*/,'availCheckInStore'];
		var markup = '';
		var visibleMsgs = [];

		self.messageVals = self.getMessageVals();

		//show/hide bopis
		if(self.messageVals.showBopis && self.cachedElms.bopisButn.length){
			self.cachedElms.bopisButn.show();

			//update bopis button url to replace id with current sku id
			updateMessageButn(self.cachedElms.bopisButn);

			//update bopis link url to replace id with current sku id
			updateMessageButn(self.cachedElms.bopisLink);

		}else{

		}

		//show/hide boss
		if(self.messageVals.showBoss && !self.messageVals.showBopis && self.cachedElms.bossButn.length){
			//update boss button url to replace id with current sku id
			updateMessageButn(self.cachedElms.bossButn);

			//update boss link url to replace id with current sku id
			updateMessageButn(self.cachedElms.bossLink);

		}

		//run boss update
		window.showBossMessage = self.messageVals.showBoss;
		window.isOnlineExclusive = self.messageVals.OnlineOnly;
		window.outOfStockOnline = self.messageVals.outOfStockOnline;
		window.outOfStockOnline = self.messageVals.outOfStockOnline;

		self.updateBopis();

		if(!self.messageVals.showBopis && typeof thd.pip !== 'undefined'){
			thd.pip.handleBossMessaging.update();
		}

		if(self.messageVals.OnlineOnly){
			self.cachedElms.messages.OnlineOnly.show();
		}else{
			self.cachedElms.messages.OnlineOnly.hide();
		}

		window.productDisplayUrl = window.location;
		

		self.cachedElms.pipZipBlock.hide();
		/*
		if(self.messageVals.availableInLocalStore || self.messageVals.isAppliance){
			self.cachedElms.pipZipBlock.hide();
			_hddata["outOfStock"]= "false";
		}else{
			self.cachedElms.pipZipBlock.show();
			_hddata["outOfStock"]= "true";
		}
		*/

		self.handleBackOrder();

		//handle RR availability messaging
		self.cachedElms.rrAvailibityMsg.show();
		visibleMsgs = $('div', self.cachedElms.rrAvailibityMsg).filter(':visible');

		if(visibleMsgs.length === 0){
			self.cachedElms.rrAvailibityMsg.hide();
		}

		function updateMessageButn(linkElm){
			var newUrl = '';
			newUrl = linkElm.attr('href').replace(/R=(.*?)&/g, 'R='+self.defaults.currentProduct.data.itemId+'&');
			linkElm.attr('href', newUrl);
		}

	},
	handleBackOrder:function(){
		var self = this;
		var bp = thd.buildProduct;
		var availabilityMessageEntry = bp.convertToArray(self.defaults.currentProduct.data.storeSkus.storeSku.storeAvailability.itemAvilabilityMessages.availabilityMessageEntry);
		var storeOnly = false;
		var backorderData = false;
		var backorderMarkup = '';

		for (var i=0; i<availabilityMessageEntry.length; i++){
			if(availabilityMessageEntry[i].messageKey === 'STORE EXCLUSIVE'){
				storeOnly = true;
			}
			if(availabilityMessageEntry[i].messageKey === 'backordered'){
				backorderData = {
					'backOrderMessage' : availabilityMessageEntry[i].messageValue
				};
			}
		}

		if(backorderData){
			backorderMarkup = Mustache.to_html(thd.buildProduct.templates.backorder, backorderData);
			self.cachedElms.qtyLimitDiv.after(backorderMarkup);
		}else{
			$('#backOrdered_wrapper').remove();
		}

		if(storeOnly){
			self.cachedElms.addToCartBtn.hide();
		}

	},
	updateBopis:function(){
		var self = this;
		var getLocStoreNbr = readCookie('THD_NAVLOCALSTORE');

		if(self.messageVals.showBopis){
			self.cachedElms.bopisButn.show();
			self.cachedElms.bopisLink.show();
			self.cachedElms.messages.BOSSMsg.hide();
			self.cachedElms.messages.BOPISMsg.css('display','block');
			self.cachedElms.messages.superPIP__prodMsg_1.hide();
			if (typeof getLocStoreNbr==="undefined" || getLocStoreNbr===null || getLocStoreNbr===""){
				self.cachedElms.select_StoreLink.show();
				self.cachedElms.messages.availCheckInStore.show();
			}
		}else{
			self.cachedElms.bopisButn.hide();
			self.cachedElms.bopisLink.hide();
			self.cachedElms.messages.BOPISMsg.hide();
			if(self.messageVals.availCheckInStore){
				self.cachedElms.messages.availCheckInStore.show();
				self.cachedElms.select_StoreLink.show();
			}else{
				self.cachedElms.messages.availCheckInStore.hide();
				self.cachedElms.select_StoreLink.hide();
			}
		}

	},
	/**
		* @function - shows appropriate buy messaging based on appropriate flags
		* @returns {string}
	*/
	getMessageVals:function(index){



		var self						= this;
		var availability				= self.defaults.currentProduct.data.itemAvailability;
		var availabilityType			= self.defaults.currentProduct.data.availabilityType;
		var storeAvailability			= self.defaults.currentProduct.data.storeSkus.storeSku.storeAvailability;
		var availabilityMessageEntry	= storeAvailability.itemAvilabilityMessages.availabilityMessageEntry
		var info						= self.defaults.currentProduct.data.info;

		var OnlineOnly					= (availabilityType === 'Online') ? true : false;
		var availableInLocalStore		= storeAvailability.availableInLocalStore;
		var availInYourLocalStore		= (availability.availableOnlineStore && storeAvailability.availableInLocalStore) ? true : false;
		var buyable						= (storeAvailability.itemAvailable || availability.showBopisInventoryLink) ? true : false;
		var availCheckInStore			= (availability.availableInStore && !availability.showBopisInventoryLink) ? true : false;

		var showBopis					= (availability.showBopisInventoryLink && !OnlineOnly) ? true : false;
		var showBoss					= info.showBossAvailabilityLink;
		var outOfStockOnline			= (storeAvailability.itemAvilabilityMessages === 'Out Of Stock Online') ? true : false;
		var availabilityType			= self.defaults.currentProduct.data.availabilityType;
		var availableOnlineStore		= availability.availableOnlineStore;
		var notSoldOnline 				= findSoldOnline();
		var isAppliance					= info.isAppliance;
		
		function findSoldOnline(){
			if(typeof availabilityMessageEntry !== 'undefined'){
				for (var i=0; i<availabilityMessageEntry.length; i++){
					if(availabilityMessageEntry[i].messageKey === 'not-sold-online'){
						return true;
					}
				}
			}else{
				return false;
			}
		}

		return {
			OnlineOnly					: OnlineOnly,
			availableInLocalStore		: availableInLocalStore,
			availInYourLocalStore		: availInYourLocalStore,
			availCheckInStore			: availCheckInStore,
			buyable						: buyable,
			showBopis					: showBopis,
			showBoss					: showBoss,
			outOfStockOnline			: outOfStockOnline,
			availabilityType			: availabilityType,
			availableOnlineStore		: availableOnlineStore,
			notSoldOnline				: notSoldOnline,
			isAppliance					: isAppliance
		};
	}
};

/*	thd.buildProduct.shipping

	Requires: jquery.min.js, mustache.js

	Function: Handles functionality for displaying product shipping info on PIP and stand alone modules
	
*/
thd.buildProduct.shipping = {
	defaults : {
		elms :{
			'parent'		: '.shippingmsg_ctn'
		},
		'shippingTemplate'	: thd.buildProduct.templates.shipping,
		'currentProduct'	: {}
	},
	/**
		* @function - stores specified elements to reduce dom queries
		* @returns {object} list of jquery objects
	*/
	update:function(args,callback){
		var self = this;
		var bp = thd.buildProduct;
		var shippingMarkup = '';

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		self.shippingData = {};

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length && thd.buildProduct.validOptions){

			self.shippingData = $.extend(self.defaults.currentProduct.data.shipping, self.defaults.currentProduct.data.promotions);

			shippingMarkup = Mustache.to_html(self.defaults.shippingTemplate, self.shippingData);
			self.cachedElms.parent.html($(shippingMarkup));

			if(callback){callback(this);}


		}
	}
};



/*	thd.buildProduct.specs

	Requires: jquery.min.js, mustache.js

	Function: Handles functionality for displaying product specs on PIP and stand alone modules
	
*/
thd.buildProduct.specs = {
	defaults : {
		elms : {
			'parent'			: '#specifications'
		},
		'specs'	: thd.buildProduct.templates.specs,
		'currentProduct'	: {}
	},
	update : function(args){
		var self = this;
		var bp = thd.buildProduct;
		var markup = '';
		var data = {};
		var specData = {};
		var maxCols = 2;
		var curCols = 0;
		var tableObj = {
			'tr':[]
		};
		var tempTr = [];

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length && thd.buildProduct.validOptions){

			//shortening path to object data
			data = self.defaults.currentProduct.data;

			//find description object
			specData = self.buildSpecObj(data.attributeGroups);

			if(specData){
				//need to define what a row is before we send it to the template to build
				for (var i=0; i<specData.length; i++){
					tempTr[tempTr.length] = specData[i];
					curCols += 1;
					if(curCols === maxCols){
						//max cols hit, adding to object
						tableObj.tr[tableObj.tr.length] = tempTr;
						
						//reset temp array
						tempTr = [];
						curCols = 0;
					}else if(i === specData.length-1){
						tableObj.tr[tableObj.tr.length] = tempTr;
					}

				}


				markup = $( Mustache.to_html(self.defaults.specs, tableObj) );

				markup.find('tr:even').addClass('even');

				self.cachedElms.parent.find('table').replaceWith(markup);
			}
		}
	},
	/**
		* @function - builds single object for specs and alphabetizes it
		* @returns {object} spec data paired by key : value
	*/
	buildSpecObj:function(obj){
		var invalidGroups = ['descriptive','related products','pdf documents'];
		var bp = thd.buildProduct;
		var finalObj	= [];
		var tempObj		= [];
		var isValid		= false;
		var groupExists	= false;
		var attributeArr = [];

		//get all specs in to single object
		for (var i=0; i<obj.group.length; i++){
			isValid		= ($.inArray(obj.group[i].groupType , invalidGroups) === -1) ? true : false;
			groupExists	= (obj.group[i].entries.attribute) ? true : false;
			if(isValid && groupExists){
				attributeArr = bp.convertToArray(obj.group[i].entries.attribute);
				for (var j=0; j<attributeArr.length; j++){
					tempObj[tempObj.length] = attributeArr[j];
				}
			}
		}

		//alphabetize object
		finalObj = tempObj.sort(sortObj('name'));



		function sortObj(property) {
			return function (a,b) {
				return (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			};
		}

		return finalObj;
		
	}
};





/*	thd.buildProduct.description

	Requires: jquery.min.js, mustache.js

	Function: Handles functionality for displaying product description on PIP and stand alone modules
	
*/
thd.buildProduct.description = {
	defaults : {
		elms : {
			'parent'			: '#product_description'
		},
		'longDescription'	: thd.buildProduct.templates.longDescription,
		'descriptionBullets'	: thd.buildProduct.templates.descriptionBullets,
		'currentProduct'	: {}
	},
	update : function(args){
		var self = this;
		var bp = thd.buildProduct;
		var markup = '';
		var data = {};
		var descriptionData = {};

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length && thd.buildProduct.validOptions){

			//shortening path to object data
			data = self.defaults.currentProduct.data;

			//build markup for long description paragraph
			markup = Mustache.to_html(self.defaults.longDescription, data.info);
			self.cachedElms.parent.find('p.normal').replaceWith(markup);
			

			//find description object
			descriptionData = self.getDescriptionGroup();

			if(descriptionData){
				markup = Mustache.to_html(self.defaults.descriptionBullets, descriptionData);
				self.cachedElms.parent.find('ul').replaceWith(markup);
			}
		}
	},
	/**
		* @function - parses through attributeGroups object to find description group
		* @returns {object} raw description group object
	*/
	getDescriptionGroup:function(){
		var self = this;
		var bulletList = [];
		var groups = self.defaults.currentProduct.data.attributeGroups;
		var attributes = {};

		for (var i=0; i<groups.group.length; i++){
			if(groups.group[i].groupType === 'descriptive'){
				attributes.attribute = self.buildBulletList(groups.group[i].entries.attribute);
				return attributes;
			}
		}

		return false;
	},
	/**
		* @function - parses through object, sorts it by bullet sequence, then adds in bullets with name/value pairs
		* @returns {object} sorted bullet group
	*/
	buildBulletList:function(obj){
		var self = this;
		var bulletList = [];
		var nonBulletList = [];
		var nonBulletItem = {};
		var newVal = '';
		var bulletName = '';

		for (var i=0; i<obj.length; i++){

			if(obj[i].bulletedAttr){
				//regular bullet, just add to bullet list to be sorted
				bulletList[bulletList.length] = obj[i];
			}else{
				
				//add name to bullet value
				newVal = obj[i].name + ": "+ obj[i].value;
				bulletName = obj[i].name;

				nonBulletItem = {
					'name' : bulletName,
					'value' : newVal
				};
				
				nonBulletList[nonBulletList.length] = nonBulletItem;
			}
		}

		bulletList = bulletList.sort(sortObj('name'));
		nonBulletList = nonBulletList.sort(sortObj('value'));

		return bulletList.concat(nonBulletList);


		function sortObj(property) {
			return function (a,b) {
				return (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			};
		}

	}
};




/*	thd.buildProduct.moreInfo

	Requires: jquery.min.js, mustache.js

	Function: Handles functionality for displaying product moreInfo on PIP and stand alone modules
	
*/

thd.buildProduct.moreInfo = {
	defaults : {
		elms : {
			'parent'			: '#more_info'
		},
		'moreInfoTemplate'	: thd.buildProduct.templates.moreInfoTemplate
	},
	update : function(args){
		var self = this;
		var bp = thd.buildProduct;
		var pdfData = {};
		var markup = '';

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length && thd.buildProduct.validOptions){

			//shortening path to object data
			pdfData = self.getPdfGroup();

			markup = Mustache.to_html(self.defaults.moreInfoTemplate, pdfData);
			self.cachedElms.parent.find('ul').replaceWith(markup);

		}
	},
	/**
		* @function - parses through attributeGroups object to find description group
		* @returns {object} raw description group object
	*/

	getPdfGroup:function(){
		var self = this;
		var bulletList = [];
		var groups = self.defaults.currentProduct.data.attributeGroups;
		var attributes = {};

		for (var i=0; i<groups.group.length; i++){
			if(groups.group[i].groupType === 'pdf documents'){

				return groups.group[i].entries;
			}
		}

		return false;
	}
};





/*	thd.buildProduct.shippingInfo

	Requires: jquery.min.js, mustache.js

	Function: Handles functionality for displaying product shippingInfo on PIP and stand alone modules
	
*/
thd.buildProduct.shippingInfo = {
	defaults : {
		elms : {
			'parent'			: '#shipping_options',
			'shipTabAttributes' : '#shipTabAttributes'
		},
		'shippingInfoTemplate'	: thd.buildProduct.templates.shippingInfoTemplate
	},
	update : function(args){
		var self = this;
		var bp = thd.buildProduct;
		var shippingData = {};
		var markup = '';

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length && thd.buildProduct.validOptions){
			self.defaults.currentProduct.data.shipping.bossFreeShipOn = self.defaults.currentProduct.data.info.showBossFreeShippingMsg;

			self.defaults.currentProduct.data.shipping.shipTabAttributes = self.cachedElms.shipTabAttributes.html();

			markup = Mustache.to_html(self.defaults.shippingInfoTemplate, self.defaults.currentProduct.data.shipping);
			self.cachedElms.parent.html(markup);

		}
	}
};




/*	thd.buildProduct.metaInfo

	Requires: jquery.min.js, mustache.js

	Function: Handles functionality for displaying metaInfo on PIP and stand alone modules
	
*/
thd.buildProduct.metaInfo = {
	// default object used to control build/update functions
	defaults : {
		elms : {
			'parent' : '.product_modelnumbers'
		},

		'itemTemplate'			: thd.buildProduct.templates.metaItemTemplate,

		metaItems : [
			{'selector' : 'modelNo', 'name' : 'Model #', 'display' : true},
			{'selector' : 'internetNo', 'name' : 'Internet #', 'display' : true},
			{'selector' : 'soSku', 'name' : 'Store SKU #', 'display' : true},
			{'selector' : 'soSku', 'name' : 'Store SO SKU#', 'display' : true},
		],

		'modelNoSelector'		: 'modelNo',
		'internetNoSelector'	: 'internetNo',
		'skuSelector'			: 'storeSku',
		'soSkuSelector'			: 'soSku',

		'currentProduct'		: {}
	},

	update:function(args){
		var self = this;
		var bp = thd.buildProduct;
		var metaMarkup = '';
		var data = {};

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length && thd.buildProduct.validOptions){
			self.cachedElms.parent.find('h2').remove();

			//shortening path to info object;
			data = self.defaults.currentProduct.data;

			//map data values to metaItems object
			if(data.info.modelNumber){
				//model #
				self.defaults.metaItems[0].data = data.info.modelNumber;
				self.defaults.metaItems[0].display = true;
			}else{
				self.defaults.metaItems[0].display = false;
			}
			
			if(data.itemId){
				//internet #
				self.defaults.metaItems[1].data = data.itemId;
				self.defaults.metaItems[1].display = true;
			}else{
				self.defaults.metaItems[1].display = false;
			}

			if(data.info.storeSkuNumber && data.info.storeSkuNumber !== ''){
				//store sku#
				self.defaults.metaItems[2].data = data.info.storeSkuNumber;
				self.defaults.metaItems[2].display = true;
			}else{
				self.defaults.metaItems[2].display = false;
			}
			
			
			if(data.info.specialOrderSKU && data.info.specialOrderSKU !== ''){
				//store SO #
				self.defaults.metaItems[3].data = data.info.specialOrderSKU;
				self.defaults.metaItems[3].display = true;
			}else{
				self.defaults.metaItems[3].display = false;
			}

			for (var i=0; i<self.defaults.metaItems.length; i++){
				if(self.defaults.metaItems[i] && self.defaults.metaItems[i].display){
					//build markup based on data and template from default object
					metaMarkup = Mustache.to_html(self.defaults.itemTemplate, self.defaults.metaItems[i]);

					//insert markup into dom
					self.cachedElms.parent.append(metaMarkup);
				}
			}
		}
	}
};





/*	thd.buildProduct.price

	Requires: jquery.min.js, mustache.js

	Function: Handles functionality for displaying product price on PIP and stand alone modules
	
*/
thd.buildProduct.price = {

	// default object used to control build/update functions
	defaults : {
		elms : {
			'parent'		: '.product_containerprice'
		},
		'priceTemplate' : thd.buildProduct.templates.priceContainer,
		'currentProduct' : {}
	},

	/**
		@function - builds price markup based on current product and attaches to dom
	*/

	build:function(args,callback){

		//
		// Defaults
		//
		// @param	string		parent			selector to let function know what element to place price in
		// @param	object		templates		mustache templates to be used for building markup, must set 'strikeThru' and 'price'
		// @param	object		currentProduct
		// @param	function	callback		optional function that can be called after build is finished
		//

		var self = this;
		var currentPricing ={};
		var pricingMarkup = '';

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		if(thd.buildProduct.validOptions){
			//build markup based on data and template from default object
			currentPricing = self.defaults.currentProduct.data.storeSkus.storeSku.pricing;

			if(currentPricing !== null && typeof currentPricing !== 'undefined'){
				currentPricing.altDisplay = (parseInt(currentPricing.originalPrice) > parseInt(currentPricing.specialPrice)) ? true : false;
				currentPricing.quantityLimit = self.defaults.currentProduct.data.info.quantityLimit;
			}else{
				currentPricing = false;
			}

			if(currentPricing){
				pricingMarkup = Mustache.to_html(self.defaults.priceTemplate, currentPricing);
			}

			//insert markup into dom
			self.cachedElms.parent.append(pricingMarkup);


			if(callback){callback(this);}
		}

	},
	update:function(args){

		//
		// Defaults
		//
		// @param	string		parent			selector to let function know what element to place price in
		// @param	object		priceTemplate	mustache template to be used for building markup
		// @param	object		currentProduct
		//

		var self = this;
		var bp = thd.buildProduct;

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}
		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length && thd.buildProduct.validOptions){
			//clear container element
			self.cachedElms.parent.html('');

			//update price markup, no need to pass params because the default object has already been updated with current sku data
			self.build();
		}
	}
};



/*	thd.buildProduct.MultiViews

	Requires: jquery.min.js

	Function: Handles functionality for displaying product Views
	
*/
thd.buildProduct.MultiViews = {
	// default object used to control build/update functions
	defaults : {
		elms : {
			'parent'			: '.product_containerimg',
			'imageContainer'	: '.product_mainimg',
			'linkContainer'		: '.product_imgctrl',
			'imageError'		: '.sku_pip_imageunavailable'
		},
		'currentProduct'	: {}
	},

	elms : {},

	updateMainImage: function(args,callback){
		//
		// Defaults
		// @param	object		currentProduct
		// @param	function	callback		optional function that can be called after build is finished
		//
		var self = this;
		var bp = thd.buildProduct;
		var newLink = '';

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length){
			//self.cachedElms.linkContainer.css('display','table');

			var mainImage = self.getMainImage();

			self.cachedElms.imageError.hide();

			if(mainImage){
				if(mainImage.zoomUrl){
					newLink = $(Mustache.to_html(thd.buildProduct.templates.mainImage, mainImage));
				}else{
					newLink = $(Mustache.to_html(thd.buildProduct.templates.mainImageAlt, mainImage));
					$('img','#popup-enlarge-image').attr('src',mainImage.altZoomUrl);
				}
				$('a:first' , self.cachedElms.imageContainer).replaceWith(newLink);
				$('a.iLinks','#nlp_link').attr('href',newLink.attr('href'));
			}else{
				self.cachedElms.imageError.show();
			}
			if(thd.buildProduct.validOptions){
				self.cachedElms.imageError.hide();
			}else{
				self.cachedElms.imageError.show();
			}
		}
	},

	getMainImage: function(){
		var self = this;
		var mediaEntry = '';
		var altZoomUrl = '';
		var zoomUrl = false;

		try{
			mediaEntry = self.defaults.currentProduct.data.media.mediaEntry;
		}
		catch(err){
			return false;
		}

		for (var i=0; i<mediaEntry.length; i++){
			if(mediaEntry[i].width === 300){
				//found main image, now get zoom url
				for (var j=0; j<mediaEntry.length; j++){
					if(mediaEntry[j].mediaType === 'ZOOM VIEW'){
						zoomUrl = mediaEntry[j].location;
					}
					if(mediaEntry[j].mediaType === 'IMAGE' && mediaEntry[j].width === 400){
						altZoomUrl = mediaEntry[j].location;
					}
				}
				
				return {
					'location'	: mediaEntry[i].location,
					'zoomUrl'	: zoomUrl,
					'altZoomUrl' : altZoomUrl
				};
			}
		}
		
		//found nothing, die
		return false;
		
	},

	update: function(args,callback){
		//
		// Defaults
		//
		// @param	string		parent			selector to let function know what element to control views from
		// @param	object		templates		mustache templates to be used for building markup
		// @param	object		currentProduct
		// @param	function	callback		optional function that can be called after build is finished
		//
		
		var self = this;
		var mediaEntry = [];
		var numOfHiddenVenIcons = 0;
		var template = '';
		var location = '';

		//link mapping to each mediaType
		var viewLinks = {
			'ZOOM VIEW'		: '.magnify_icon',
			'MORE VIEW'		: '.more_views',
			'360 SPIN'		: '.view_360',
			'VIDEO'			: '.video_grey_icon',
			'FEATURES'		: '.features_icon'
		};


		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);
		
		//if parent is not on the page, don't do anything
		if(self.cachedElms.linkContainer.length && thd.buildProduct.validOptions){

			$('a' , self.cachedElms.linkContainer).hide();

			mediaEntry = self.defaults.currentProduct.data.media.mediaEntry;
			for (var i=0; i<mediaEntry.length; i++){
				if($(viewLinks[mediaEntry[i].mediaType]).length){
					template = thd.buildProduct.getTemplate(mediaEntry[i].mediaType);
					location = encodeURIComponent(mediaEntry[i].location);
					$(viewLinks[mediaEntry[i].mediaType]).parent().css('display','inline').attr('href', Mustache.to_html(template, {'location' : location}) );
				}
			}

			if(callback){callback(this);}
		}

	}
};



/*	thd.buildProduct.reviews

	Requires: jquery.min.js

	Function: Builds reviews/comment section for ssku
	
*/
thd.buildProduct.reviews = {
	// default object used to control build/update functions
	defaults : {
		elms : {
			'tabParent' : '#BVRRContainer'
		},
		'currentProduct'	: {}
	},
	update: function(args){
		//
		// Defaults
		// @param	object		dataSet
		//
		var self = this;
		var bp = thd.buildProduct;

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);
		self.cachedElms = bp.getElms(self);


		//if parent on tab section is not on the page, don't do anything
		if(self.cachedElms.tabParent.length){

			if (window.$BV) {
				$BV.ui("rr", "show_reviews", {
					productId: self.defaults.currentProduct.data.itemId,
					onEvent: function(json) {
						if(json.eventSource == "Display"){
							showRatingsDisplayed(json.attributes.numReviews);
						}
					}
				});
			}

		}

	}
};


/*	thd.buildProduct.irg

	Requires: jquery.min.js

	Function: Handles functionality for displaying irg
	
*/
thd.buildProduct.irg = {
	// default object used to control build/update functions
	defaults : {
		elms : {
			'parent'	: '#irg_wrapper',
			'loader'	: '#irgLoader'
		},
		'catTemplate'		: thd.buildProduct.templates.irgCat,
		'catData'			: thd.buildProduct.templates.irgData,
		'irgBuffer'			: thd.buildProduct.templates.irgBuffer,
		'RelatedTabTemplate'	: thd.buildProduct.templates.RelatedTabTemplate,
		'dataSet'	: {},
		'currentProduct'	: thd.buildProduct.defaultObj,
		'defaultLoad' : true,
		'buffer' : function(){return (this.defaults.maxRelatedLoad !== 0);},
		'defltRelatedItemsLimit' : 0
	},

	elms : {},

	activeTab : '',

	relatedItemGroups : {},

	sliderInstances : {},

	build: function(){

		var self = this;
		var bp = thd.buildProduct;
		var activeTabs = '';

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length){

			self.cachedElms.parent.show();

			self.buildTabs();
			
			//show default slider
			self.showActiveTab();

			//configureSliders
			self.setupSliders();

			//configure quick view
			self.setupQuickView();

		}
	},

	buildTabs: function(){
		var self = this;
		var bp = thd.buildProduct;
		var tabData = {};
		var markup = '';
		var tabDisplay = '';
		var itemGroup = [];
		var itemIdArr;

		itemGroup = self.relatedItems;

		//build temp object to pass to mustache
		tabData.tab = [];
		
		for (var i=0; i<itemGroup.length; i++){
			switch (itemGroup[i].groupType) {
				case 'ACCESSORY':
					tabDisplay = 'ACCESSORIES';
				break;
				case 'COLLECTION':
					tabDisplay = 'COLLECTIONS';
				break;
				case 'COOR_ITEMS':
					tabDisplay = 'COORDINATING ITEMS';
				break;

				default:
				tabDisplay =  itemGroup[i].groupType;
			}
			if(itemGroup[i].groupItemIds){
				itemIdArr = bp.convertToArray(itemGroup[i].groupItemIds.itemId);

				if(itemIdArr.length && typeof itemIdArr[0] !== 'object'){
					tabData.tab[tabData.tab.length] = {
						tabName : tabDisplay.replace(/ /g,''),
						tabDisplay : tabDisplay,
						tabData : itemGroup[i].groupType,
						tabCount : itemIdArr.length
					};
				}
			}
		}

		markup = $(Mustache.to_html(self.defaults.RelatedTabTemplate, tabData));
		markup.find('li').each(function(){
			$(this).unbind('click').bind('click',function(e){
				self.activeTab = $(this);
				self.showActiveTab();
			});
		});

		$('.slidersTabControl' , self.cachedElms.parent).html(markup);

		self.cachedElms.tabs = $('.hd_tabs li', self.cachedElms.parent);
		self.activeTab = self.cachedElms.tabs.filter(':first');
	},

	showActiveTab: function(){
		var self = this;
		var defaultSlider = '';
		var slideUpdate = true;
		var sliderID = '';
		
		//hide all sliders
		self.cachedElms.sliders.hide();

		//remove active class from all tabs
		self.cachedElms.tabs.removeClass('tabs_Active');
		//add active class to active tab
		self.activeTab.addClass('tabs_Active');

		sliderID = self.activeTab.attr('id').replace('tab_','superPIP__slider_');

		//show active slider
		if(self.activeTab.length){
			self.cachedElms.parent.show();
			self.defaultSlider = $('#' + sliderID);
			self.defaultSlider.show();
		}else{
			self.cachedElms.parent.hide();
		}
		
		if(typeof self.sliderInstances[sliderID] !== 'undefined'){
			self.sliderInstances[sliderID].getTabBuffer();
		}
	},

	formatData: function(){
		var self = this;
		var dataSet = self.defaults.dataSet;
		var originalPrice = '';
		var specialPrice = '';

		for (var key in dataSet) {
			for (var i=0; i<dataSet[key].length; i++){
				originalPrice = parseInt(dataSet[key][i].originalPrice);
				specialPrice = parseInt(dataSet[key][i].specialPrice);
				dataSet[key][i].showListPrice = (specialPrice < originalPrice) ? true : false;
			}
		}

		self.defaults.dataSet = dataSet;
	},

	update: function(args){
		//
		// Defaults
		// @param	object		dataSet
		//
		var self = this;
		var bp = thd.buildProduct;
		var irgList= [];
		var catMarkup = '';
		var irgContainer = '';

		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);
		self.cachedElms = bp.getElms(self);

		//massages data for easier use
		self.formatData();

		irgContainer = $('.inner' , self.cachedElms.parent);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		//if parent is not on the page, don't do anything
		if(self.cachedElms.parent.length){
			//reset inner html
			irgContainer.html('');

			for (var i=0; i<self.relatedItems.length; i++){
				catMarkup = self.createItemGroupMarkup(self.relatedItems[i].groupType);
				$(catMarkup).appendTo(irgContainer);
				self.cachedElms.sliders = $('.productSlider', self.cachedElms.parent);
			}

			self.build();
		}

	},

	toggleLoadMessage: function(){
		var self = this;
		if(self.defaults.buffer){
			if(self.cachedElms.loader.length){
				if(self.cachedElms.loader.css('display') === 'none'){
					self.cachedElms.loader.show();
				}else{
					self.cachedElms.loader.hide();
				}
			}
		}

	},

	setupQuickView: function(){
		var self = this;

		$('.item',self.cachedElms.parent).unbind('mouseover').bind('mouseover', function(e) {
			$(this).find('a.quickView').show(0);
		}).each(function(){
			$(this).find('a.quickView').hide();
		});

		self.cachedElms.parent.find('.productSlider .item').unbind('mouseleave').bind('mouseleave', function(e) {
			self.cachedElms.parent.find('.productSlider .item a.quickView').hide(0); //hide all
		});

		self.cachedElms.parent.find('.productSlider .item a.quickView').unbind('click').bind('click', function(e) {
			e.preventDefault();
			var quickViewURL = $(this).parent().attr('_quickViewURL');
			var quickViewCatEntryID = $(this).parent().attr('_catentryid');

			//test
			//$superPIP.quickViewResults(123456789);
			//adjust size
			//$('#fancybox-outer').width(670);
			//$('#fancybox-outer').height(800);
			//$('#fancybox-inner').height(800);
			$('#fancybox-close').hide();
			//$('#fancybox-overlay').hide();
			return false;

		}).fancybox({
			'width'				: 710,
			'height'			: 500,
			'autoScale'			: false,
			'transitionIn'		: 'none',
			'transitionOut'		: 'none',
			'scrolling'			: 'no',
			'showCloseButton'	: false,
			'overlayOpacity'    : 0,
			'hideOnOverlayClick': false,
			//'onStart'         : function() {alert($(this).attr('productIds'))},
			//'index'           : alert(SSku_FB_Layover.attr("productIds")),
			'type'				: 'iframe'
		});

	},

	createItemGroupMarkup: function(key){
		var self = this;
		var bp = thd.buildProduct;
		var catMarkup = '';
		var dataSet = self.defaults.dataSet;
		var skuData = {};

		switch (key) {
			case 'ACCESSORY':
				key = 'ACCESSORIES';
			break;
			case 'COLLECTION':
				key = 'COLLECTIONS';
			break;
			case 'COOR_ITEMS':
				key = 'COORDINATING ITEMS';
			break;
		}

		skuData.groupData = dataSet[key];
		skuData.groupType = key.replace(/ /g,'');
		return Mustache.to_html(self.defaults.catTemplate, skuData, self.defaults.catData);

	},


	setupSliders: function(){
		var self = this;
		var sliders = self.cachedElms.parent.find('.productSlider');
		var sliderID = '';
		var slideWidth = self.cachedElms.parent.find('.slidersContainer').width();
		var itemWidth = $('.item',self.cachedElms.parent).width();
		var itemsPerSlide = Math.floor(slideWidth / itemWidth);

		sliders.each(function(){
			sliderID = $(this).attr('id');

			var tabID = sliderID.replace('superPIP__slider_','tab_');
			var totalSlides =  Math.ceil(parseInt($('span', '#'+tabID).text()) / itemsPerSlide);

			self.sliderInstances[sliderID] = thd.buildProduct.createObject(thd.irgSlider, {
				'slider' : this,
				'slideWidth' : slideWidth,
				'itemsPerSlide' : itemsPerSlide,
				'totalSlides' : totalSlides
			});
			self.sliderInstances[sliderID].build();
		});
	},

	refresh: function(args){
		//
		// Defaults
		// @param	object	args
		//
		var self = this;
		var bp = thd.buildProduct;
		var dataString = '';
		var dataUrl = '/p/getProductRelatedItemsData?relatedItemIds=';
		var tempObj = {};
		var itemGroup = [];
		
		//merge default object with params passed to function
		self.defaults = $.extend(self.defaults,args);

		//cache page elements so we don't have to query dom every time function called
		if(!self.cachedElms){
			self.cachedElms = bp.getElms(self);
		}

		if(typeof self.defaults.currentProduct !== 'undefined'){

			self.relatedItems = self.defaults.currentProduct.data.relatedItemGroups.itemGroup;
		}else{
			//regular sku, use only data from related items json
			for (var key in SKU_RELATED_ITEMS_ID_JSON) {
				tempObj = {
					groupItemIds : {
						itemId : SKU_RELATED_ITEMS_ID_JSON[key]
					},
					groupType : key
				};

				itemGroup[itemGroup.length] = tempObj;
			}
			self.relatedItems = itemGroup;
		}

		self.loadedRelatedItems = {};
		dataString = self.parseData();

		if(dataString){
			
			self.cachedElms.parent.show();

			if(self.defaults.defaultLoad){
				//initial page view, only load what is in SKU_RELATED_ITEMS_JSON
				bp.irg.update({'dataSet' : SKU_RELATED_ITEMS_JSON});
			}else{
				//All other IRG updates
				if(dataString !== ''){
					self.toggleLoadMessage();
					dataUrl = dataUrl + dataString;

					bp.getData({
						url : dataUrl,
						error : function(){
							bp.logError('Error, could not retreive data.');
							bp.logError(dataUrl);
						},
						callback : function(){
							if(bp.relatedData){
								bp.irg.update({'dataSet' : bp.relatedData});
								bp.irg.toggleLoadMessage();
							}
						}
					});

				}
			}
		}else{
			self.cachedElms.parent.hide();
		}
	},

	parseData: function(groupType){
		var self = this;
		var bp = thd.buildProduct;
		var itemId = '';
		var dataString = '';
		var groupItemIds = {};
		var delim = '';
		var itemsArr = [];
		var start = 0;
		var maxLoad = (self.defaults.buffer) ? self.defaults.maxRelatedLoad : false;
		var firstLoad = false;
		var limitReached = false;


		bp.relatedData = false;
		//format relatedItems so that it fits dataString expected format
		for (var i=0; i<self.relatedItems.length; i++){
			if(typeof groupType === 'undefined'){
				//first load, get a limit of 10 (or buffer size) from groupItemIds
				groupItemIds = self.relatedItems[i].groupItemIds;
				firstLoad = true;
				if(i === 0){
					//first pass, need to always reset
					self.defaults.defltRelatedItemsLimit = 0;
				}
			}else{
				//now looking for specific group type
				if(self.relatedItems[i].groupType === groupType){
					groupItemIds = self.relatedItems[i].groupItemIds;
					start = self.loadedRelatedItems[self.relatedItems[i].groupType].length;
				}else{
					groupItemIds = false;
				}
				firstLoad = false;
			}

			if(groupItemIds){


				dataString += '|' + self.relatedItems[i].groupType + ':';

				itemsArr = bp.convertToArray(groupItemIds.itemId);

				//create blank array for current type
				if(typeof self.loadedRelatedItems[self.relatedItems[i].groupType] === 'undefined'){
					self.loadedRelatedItems[self.relatedItems[i].groupType] = [];
				}

				if(!maxLoad){
					maxLoad = itemsArr.length;
				}

				//loop through ids and append to data string
				for (var j=start; j<(maxLoad + start); j++){
					/*
						This gets a little complicated. The functionality is when the flag to do an ajax load on document ready is true, only load a max
						of ten items, from any of the related items arrays. (i.e. If there are 25 Collections and 30 Accessories, only get 10 Collections.
						If there are 4 Collections and 20 Accessories, grab 4 collections and 6 Accessories.

						Otherwise, if the flag is false or loading because an arrow button was clicked, just grab the next buffered max.
					*/
					if(firstLoad){
						limitReached = (self.defaults.defltRelatedItemsLimit >= self.defaults.maxRelatedLoad) ? true : false;
					}else{
						//not a first load, always false
						limitReached = false;
					}

					if(itemsArr[j] && !limitReached){
						delim = ( (j === itemsArr.length - 1)) ? '|' : ',';


						self.defaults.defltRelatedItemsLimit += 1;
						
						dataString += itemsArr[j] + delim;
						//add item to current group's array
						self.loadedRelatedItems[self.relatedItems[i].groupType].push(itemsArr[j]);
					}
				}
			}
		}

		//massaging url, remove extra pip at beginning of string, and replacing any occurance of ',|' with |
		dataString = ( dataString.substring(0,1) === '|' ) ? dataString.replace('|','').replace(/\,\|/g , '|') : dataString.replace(/\,\|/g , '|');
		return dataString;
	},

	bufferData: function(callback){
		var self = this;
		var bp = thd.buildProduct;
		var dataString = '';
		var dataUrl = '/p/getProductRelatedItemsData?relatedItemIds=';
		var activeTab = self.activeTab.attr('data-tabid');
		var itemTotal = parseInt( self.activeTab.find('span').html() );

		if(self.loadedRelatedItems[activeTab].length < itemTotal){

			dataString = self.parseData(activeTab);

			if(dataString !== ''){
				bp.irg.toggleLoadMessage();
				dataUrl = dataUrl + dataString;

				bp.getData({
					url : dataUrl,
					error : function(){
						bp.logError('Error, could not retreive data.');
						bp.logError(dataUrl);
						bp.irg.toggleLoadMessage();
						return false;
					},
					callback : function(){
						if(bp.relatedData){
							bp.irg.loadBufferedData({'dataSet' : bp.relatedData});

							if(callback){callback(this);}
							bp.irg.toggleLoadMessage();
							return true;
						}
					}
				});


			}
			

			return true;
		}else{
			return false;
		}
	},
	loadBufferedData: function(args){
		var self = this;
		var bp = thd.buildProduct;
		var dataSet = {};
		var markup = '';
		
		for (var key in args.dataSet) {
			dataSet['groupData'] = args.dataSet[key];
		}

		markup = Mustache.to_html(self.defaults.irgBuffer, dataSet);

		$('div.items' , self.defaultSlider).append(markup);

		self.setupQuickView();

	}
};

/*	thd.irgSlider

	Requires: jquery.min.js

	Function: Builds slider for irg
	
*/
thd.irgSlider = {
	build: function(args){
		var self = this;
		var bp = thd.buildProduct;
		var slideUpdate = true;
		var btns = '';
		
		self.sliderElm = $(self.slider);
		self.reset();
		btns = self.sliderElm.find('.btn');

		self.currentSlide		= 0;
		self.multiPane			= self.sliderElm.find('.multiPane');

		if(self.totalSlides > 1){
			btns.bind('click',function(e){
				e.preventDefault();
				if($(this).hasClass('btn_scroll_l')){
					self.slideLeft();
				}else{
					self.slideRight(function(){
						if(bp.irg.defaults.buffer){
							var reset = function(){
								self.reset();
							};
							slideUpdate = bp.irg.bufferData(reset);
						}
					});
				}
			});
		}else{
			btns.hide();
		}

	},

	getTabBuffer : function(){
		var self = this;
		var bp = thd.buildProduct;
		var dataReceived = true;
		var reset = function(){
			self.reset();
		};
		if(bp.irg.defaults.buffer){
			dataReceived = bp.irg.bufferData(reset);
		}
	},

	reset: function(){
		var self = this;
		var sliderElm = $(self.slider);

		self.itemsTotalWidth	= self.slideWidth * (self.totalSlides - 1);
	},
	
	slideLeft: function(callback){
		var self = this;
		if(callback){callback(this);}
		self.move(1);
	},

	slideRight: function(callback){
		var self = this;
		if(callback){callback(this);}
		self.move(-1);
	},

	move: function(index){
		var self = this;
		var newPosition = 0;
		var maxLeft = self.itemsTotalWidth - self.slideWidth;
		var tooFarLeft = false;
		var tooFarRight = false;

		self.curPosition = (typeof self.curPosition === 'undefined') ? 0 : self.curPosition;

		newPosition = index * self.slideWidth + self.curPosition;
		
		if(newPosition % self.slideWidth === 0){
			//verify new position is valid

			tooFarLeft = ( index === 1 && newPosition > 0 ) ? true : false;
			tooFarRight =  ( (index === -1) && (newPosition < -(self.itemsTotalWidth)) ) ? true : false;

			if( tooFarLeft || tooFarRight){
				newPosition = self.curPosition;
			}

			self.curPosition = newPosition;

			//remove disabled class
			self.sliderElm.find('.btn').removeClass('disabled');

			self.multiPane.animate({
				left: newPosition + 'px'
			}, 400);

			//set arrow classes
			if(newPosition === 0){
				self.sliderElm.find('.btn_scroll_l').addClass('disabled');
			}else if(newPosition < -(maxLeft)){
				self.sliderElm.find('.btn_scroll_r').addClass('disabled');
			}
		}
	}
};
