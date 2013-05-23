var gs = (typeof window.gs !== 'undefined') ? gs : {};

gs.user = function(){

    function buildUsers(){

      //define product model
      var user = Backbone.Model.extend({
          defaults: {
              img: "images/default.jpg",
              imgHeight : '203'
          }
      });

      var userCollection = Backbone.Collection.extend({
          model: user,
          url : "http://alpha.gigscore.com/api/search"
      });

      var userList =  new userCollection();

      userList.fetch({success: function(){
        //create instance of master view
        var directory = new userListView();
      }});

      var userFullCollection = Backbone.Collection.extend({
          model: user
      });

      //define individual contact view
      var userView = Backbone.View.extend({
          tagName: "div",
          className: "userItem",
          template: gs.templates.user.userListing,
          events: {  
            'click .userImage': 'handleClick'  
          },  
          handleClick: function(e){
            e.preventDefault();
            var href = $(e.currentTarget).attr("href");
            var username = href.split('/user/')[1];
            var fullData = new userFullCollection();
            fullData.url = "http://alpha.gigscore.com/api/user?username=" + username;

            fullData.fetch({
              success: function(collection, response){
                //create instance of master view
                console.log(response);
                var newUserFull = new userFullView({data : response[0]});
              }
          });
            
          },
          render: function () {
              var tmpl = _.template(this.template);
              
              $(this.el).html(tmpl(this.model.toJSON()));
              return this;
          }
      });

      //define master view
      var userFullView = Backbone.View.extend({
          
          template : gs.templates.user.userFull,

          initialize: function () {
              this.render();
          },

          render: function () {
              var tmpl = _.template(this.template);
              var data = this.options.data;
              var loginTmpl = _.template(gs.templates.pageTemplates.login)

              gs.auth.test({
                yes : function(){
                  gs.contentBox.show({
                    content : tmpl(data)
                  });
                },
                no : function(){
                  
                  gs.forms.afterLogin = function(){
                    gs.auth.test({
                      yes : function(){
                        gs.contentBox.show({
                          content : tmpl(data)
                        });
                      }
                    });
                  }

                  gs.contentBox.show({
                    content : loginTmpl({errMsg : '<div class="errorTxt">You must be logged in to view profiles.</div>'})
                  });
                }
              });

              return this;
          }


      });

      //define master view
      var userListView = Backbone.View.extend({
          el: $("#userList"),

          initialize: function () {
              this.collection = userList;
              this.render();
          },

          render: function () {
              var that = this;
              _.each(this.collection.models, function (item) {
                  that.renderUser(item);
              }, this);
              
          },

          renderUser: function (item) {
              var newUser = new userView({
                  model: item
              });

              var newUserEl = $(newUser.render().el);

              $(this.el).append( newUserEl ).isotope( 'appended', newUserEl );
          }

      });


    }

    return {
      init: function(args){
        buildUsers();
      }
    }
}();