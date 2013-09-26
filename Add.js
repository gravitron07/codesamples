var Add = (function (outage) {
	
	//private
	var add = Outage.Views.Add = Outage.Views.Add || {},
		latData = {
			formTitle : "Report an Outage",
			submitText : "Save"
		}

	addView = Backbone.View.extend({
		el: "#pageContainer",
		events: {
			'click #addForm .inputBtn' : 'handleAddOutage'
		},
		handleSignin : function(evt){
			evt.preventDefault();
			Outage.User.auth({
				email : $('#emailTxt').val(),
				pw : $('#pwTxt').val()
			});
		},
		template : Outage.templates.addForm,

		initialize: function () {
			this.render();
		},

		render: function () {
			var template = _.template(this.template);

			outage.User.authTest({
				no : function(){
					outage.Views.Signin.init();
				},
				yes : function(){
					latData.userId = Outage.User.userData.userId;
					Outage.contentBox.show({
						content : template(latData)
					});
				}
			});

			return this;
		},
		handleAddOutage : function(evt){
			evt.preventDefault();
			var successTemplate = _.template(Outage.templates.outageSuccess);

			latData.id = $('#userIdTxt').val();
			latData.type = $('#typeSelect').val();
			latData.address = $("#addressTxt").val();

			outage.Loading.show();

			var jqxhr = $.ajax({
				url : "/api/addOutage?address="+latData.address+'&userId='+latData.id+"&outageType="+latData.type+"&lat="+latData.lat+"&lng="+latData.lng
			})
			.done(function(data) {
				if(typeof data.errorCode === 1){
					//showError(self, gs.templates.forms.errors.login);
					console.log(data.errorCode);
				}else{
					Outage.contentBox.show({
						content : successTemplate(latData)
					});
				}
			})
			.fail(function(data) { console.log('Server Error'); console.log(data); })
			.always(function() {
				outage.Loading.hide();
			});
		}
	});

	function buildAddView(){
		var addUI = new addView();
	}

	//public
	add.init = function(lat,lng){
		latData.lat = lat;
		latData.lng = lng;
		latData.address = $('#leaflet-control-geosearch-qry').val();
		buildAddView();
	}

	return outage;

}(Outage || {}));