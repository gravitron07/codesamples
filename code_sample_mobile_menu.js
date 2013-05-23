/*	webmd.m.mainMenu

	Requires: webmd.core.js, webmd.m.sideMenu.js

	Function: calls sidemenu function for global menu, sets up search behavior and hide/show functionality for main menu link
	
	Notes: Executures itself on document.ready to enable any the main men in the header. Added this into scripts as this will be used on every page of the mobile site

*/

webmd.m.mainMenu = {

	init:function(){
		var self = this;
		webmd.m.globalMenu=webmd.object(webmd.m.sideMenu,{
			menu: '#main_menu',
			menuButn: '#main_menu_button',
		});
		webmd.m.globalMenu.init();
		
		self.setupSearch();
		
		self.buildSeeAllLinks();
	},
	setupSearch:function(){
		var self = this,
			storage = self.storageAvailable(),
			firstView = false;
		
		//checks to see if storage is available, then checks to see if first view value has been set
		if(storage){
			firstView = (sessionStorage.getItem( 'firstView' )) ? false : true;
		}
		
		if(firstView){
			sessionStorage.setItem( 'firstView', 'true' );
			$('#top_search, #main_search_button').addClass('active_search');
		}
		
		$('#main_search_button').bind('click',function(e){
			e.preventDefault();
			self.toggleSearch();
		})
		

	},
	toggleSearch:function(){
		var self = this
		if ($('#top_search').hasClass('active_search')) {
			$('#top_search, #main_search_button').removeClass('active_search');
		} else {
			$('#top_search, #main_search_button').addClass('active_search');
		}
	},
	buildSeeAllLinks:function(){
		//creates links to show all items after fifth link in each list
		$('ul','#main_menu').each(function(i){
			var listObj = this,
				
				showAllButn = $('<a href="#" class="showButn">See All</a>').bind('click',function(e){
					//adds class to parent ul, which sets height to auto
					e.preventDefault();
					$(listObj).addClass('full_view');
					$(this).parent().hide();
					
					//reset page height
					webmd.m.globalMenu.calcHeight();
				}),
				
				showLessButn = $('<a href="#" class="hideButn">Show Less</a>').bind('click',function(e){
					//removes active class from parent
					e.preventDefault();
					$(listObj).removeClass('full_view');
					$(showAllButn).parent().show();
					
					//reset page height
					webmd.m.globalMenu.calcHeight();
				});
			
			showAllButn.insertAfter($(listObj).find('li')[5]).wrap('<li></li>');
			showLessButn.appendTo($(listObj)).wrap('<li></li>');
		})
	},
	storageAvailable: function(){
		//returns boolean, first checks if storage is supported by browser, then checks if able to add to storage
		isAvailable = true;
		if(typeof(Storage)!=="undefined"){
			//storage is supported, now check if in private browsing mode
			try {
				sessionStorage.setItem( 'pb', 'false' );
				sessionStorage.removeItem( 'pb' );
			} catch (e) {
				isAvailable = false;
			}
		}else{
			isAvailable = false;
		}
		return isAvailable;
	}
	
};
$(function(){ webmd.m.mainMenu.init(); });



/*	webmd.m.sideMenu

	Requires: webmd.core.js

	Function: creates the main menu for mobile. Adds/removes class to menu selector to toggle active/hidden state, sets height limit for content area so that menu is only scrollable area
	
	Notes: Executures itself on document.ready to enable any the main men in the header. Added this into scripts as this will be used on every page of the mobile site

*/

webmd.m.sideMenu = {
	//
	// Defaults
	//
	// @param string|object menu		Accepts a jQuery selector or a DOM element
	// @param string|object main_menu_button		Accepts a jQuery selector or a DOM element
	// @param string|object mainContainer		Accepts a jQuery selector or a DOM element
	// @param string menuPlacement		accepts 'left' or 'right'
	// @param function		fOpen			Pass a function here to run after the menu has opened.
	// @param function		fClose			Pass a function here to run after the menu has closed.
	//
	
	menu: '#main_menu',
	menuButn: '#main_menu_button',
	mainContainer: '#centering_area',
	menuPlacement: 'left',
	fOpen: function(self) { return self; },
	fClose: function(self) { return self; },
	
	init:function(){
		var self = this;
		self.cacheElms();
		
		//move menu to outside of page area container, have to set display to none so that h-scrolling doesn't happen for right aligned menus.
		
		self.$menu.prependTo(self.$mainContainer)
			.hide()
			.css(self.menuPlacement,'-'+self.$menu.width() + 'px');
		
		// Add open control
		self.$menuButn.click(function(e){
			e.preventDefault();
			self.toggle();
		});

	},
	
	cacheElms: function(){
		var self = this;
		self.$menu = typeof(self.menu == 'string') ? $(self.menu) : self.menu;
		self.$menuButn = typeof(self.menuButn == 'string') ? $(self.menuButn) : self.menuButn;
		self.$mainContainer =  typeof(self.mainContainer == 'string') ? $(self.mainContainer) : self.mainContainer;
		self.$pageArea =  $('#page_area');
		return this;
	},

	toggle:function(){
		var self = this
		if ($('body').hasClass('menu_active')) {
			self.hide();
			if(self.fClose) { self.fClose(self); }
		} else {
			self.show();
			if(self.fOpen) { self.fOpen(self); }
		}
	},

	show:function(){
		var self = this,
			defaults = self.defaults,
			menuWidth = self.$menu.width(),
			tempHeight = self.$menu.height();
			
		$('body').addClass('menu_active');
		
		/* hack for iPhone as the menu doesn't work on top of video objects */
		$('video').hide();

		self.$mainContainer.css(self.menuPlacement, menuWidth + 'px');
		
		self.$menu.show();
		
		
		//creates overlay that goes over visible area of content
		$('<div id="menu_overlay"></div>')
			.prependTo(self.$pageArea)
			.bind('click',function(){
				self.toggle();
			});
			
		self.calcHeight();
	},
	
	calcHeight:function(){
		var self = this,
			defaults = self.defaults,
			tempHeight = self.$menu.height(),
			bodyCss = {
				'overflow':'hidden',
				'height':tempHeight+'px'
			}
		$('body').css(bodyCss);
		$('#menu_overlay').css('height',tempHeight+'px')
	},

	hide:function(){
		var self = this,
			bodyCss = {
				'overflow':'visible',
				'height':'auto'
			}
		/* hack for iPhone as the menu doesn't work on top of video objects */
		$('video').show();

		self.$mainContainer.css(self.menuPlacement, '');
		
		self.$menu.hide();
		
		$('body').css(bodyCss).removeClass('menu_active');
		
		$('#menu_overlay').remove();
	}
	
};