// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('myCtrl', function($window, $scope,$http, $ionicPopup, $ionicLoading, $cordovaSms){

  var fetchData = function()
  {
    Parse.initialize("eWhdkaASJ2BVx7oFd0o5fBk6ZtBZ3KVRXduOH1D7", "cPH2rkZ1hrFjPbF8qNjwIYATrV3CXWdKUWlC40ro");

    var query = new Parse.Query('friendslist');

    $ionicLoading.show({ template: '<ion-spinner class="spinner-assertive" icon="spiral"></ion-spinner>' });
    query.find({
      success: function(results){
        var temp = JSON.parse(JSON.stringify(results));
        $scope.data = temp;
        $scope.searchText ='';
        $scope.$apply();
        $ionicLoading.hide();
        console.log(temp);
      },
      error: function(object, error){
        console.log(error);
      }

    })
  }


  fetchData();
  
  $http.get('js/addressbook.json').success(function(data)
  {
    $scope.data = data;
    $scope.searchText = '';

    $scope.dorefresh = function(){
      fetchData();
      $scope.searchText ='';
      $scope.$apply();
      $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.onDelete = function(item){
      
      var friend = Parse.Object.extend('friendslist');
      var query = new Parse.Query(friend);

      query.get(item.objectId, {
        success: function(results){
          results.destroy();
          $ionicPopup.alert({title:'Friend Deleted', template: '<center>Friend has been successfully deleted from the list</center>'});
          fetchData();
          $scope.$apply();
        },
        error: function(obj, err){
          console.log(err);
        }
      })

    }

    $scope.moveItem = function(item, fromIndex, toIndex){
      $scope.data.splice(fromIndex, 1);
      $scope.data.splice(toIndex, 0, item);
    }


    $scope.showEditPopup = function(item){
      $scope.edit = {};
      $scope.edit.personName = item.personName;
      $scope.edit.personContact = item.personContact;
      $scope.edit.personEmail = item.personEmail;
      $scope.edit.personDisplayPicture = item.personDisplayPicture;

      var myPopup = $ionicPopup.show({
        template: '<input type="text" placeholder="Name" ng-model="edit.personName"/><br/><input type="text" placeholder="Phone" ng-model="edit.personContact"/><br/><input type="text" placeholder="Email" ng-model="edit.personEmail"/><br/><input type="text" placeholder="Display Picture URL" ng-model="edit.personDisplayPicture"/>',
        title: 'Edit Friend',
        subtitle: '',
        scope: $scope,
        buttons: [{ text: 'Cancel'},{ text: 'Save', type:'button-assertive', onTap: function(e){

          var friend = Parse.Object.extend('friendslist');
          var query = new Parse.Query(friend);

          query.get(item.objectId, {
            success: function(results){
              results.set('personName', $scope.edit.personName);
              results.set('personContact', $scope.edit.personContact);
              results.set('personEmail', $scope.edit.personEmail);
              results.set('personDisplayPicture', $scope.edit.personDisplayPicture);

              results.save({success: function(result){
                $ionicPopup.alert({title:'Friend Saved', template: '<center>Friend has been successfully updated.</center>'});
                fetchData();
                $scope.$apply();
              }});

              
            },
            error: function(obj, err){
              console.log(err);
            }
          })

        }}]
      })
    }

    $scope.new = {};



    $scope.showAddPopup = function(){
      var myPopup = $ionicPopup.show({
        template: '<input type="text" placeholder="Name" ng-model="new.personName"/><br/><input type="text" placeholder="Phone" ng-model="new.personContact"/><br/><input type="text" placeholder="Email" ng-model="new.personEmail"/><br/><input type="text" placeholder="Display Picture URL" ng-model="new.personDisplayPicture"/>',
        title: 'Enter Details',
        subtitle: '',
        scope: $scope,
        buttons: [{text: 'Cancel'},{ text: 'OK', type: 'button-assertive', onTap: function(e)
        {
          var newFriend = Parse.Object.extend('friendslist');

          var friend = new  newFriend();

          friend.save({personName: $scope.new.personName,
                        personEmail: $scope.new.personEmail,
                        personContact: $scope.new.personContact,
                        personDisplayPicture: $scope.new.personDisplayPicture}).then(function(object){
            $ionicPopup.alert({
              title:'Friend Added',
              template: 'Friend has been successfully added to the list.'
            });
            fetchData();
          })

        }}]
      });
    }

    $scope.call = function(number){
      $window.location.href = "tel:"+number;
    }

    $scope.mail = function(Email){
      $window.location.href = "mailto:"+Email;
    }
    
  });

  $scope.sendSms = function(friend){
    $scope.sms = {};
    $scope.sms.number = friend.personContact;
    alert(JSON.stringify($scope.sms))
    $scope.sms.message = '';

    $ionicPopup.show({
      title: 'Send SMS',
      template: "<input type='text' placeholder='Phone Number' ng-model='sms.number'/><br/><textarea ng-model='sms.message' rows='5' placeholder='Message'></textarea>",
      scope: $scope,
      buttons: [{text: 'Cancel'},{
        text:'Send',
        type: 'button-assertive',
        onTap: function(e){
          var option = {
            replaceLineBreaks: true,
            android: {
              intent: 'INTENT'
            }
          }
          $cordovaSms.send($scope.sms.number, $scope.sms.message,options, success, error);
        }
      }]
    });

    var success = function(){alert("success")}
    var error = function(e){
      alert(e);
    }
  }
  
});

  
