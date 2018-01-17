(function() {
  'use strict';


  angular.module('app')

  		.component('home', {
	      templateUrl: 'components/home/home.html',
	      controller: homeCtrl
    	});

      
  	// @ngInject
    function homeCtrl($scope, $state, $stateParams, $q, $http, factoryAuth) {


      $scope.token = localStorage.getItem("token");

      function getName(local) {
        factoryAuth.postVerify({token: local}).then( function ( d ) {
            if ( d.statusText == "OK" ) {
                      $scope.name = d.data;
            } else {
            }
        });
      }
      getName($scope.token);




      function getTasks() {
        factoryAuth.getTasks().then( function ( d ) {
            if ( d.statusText == "OK" ) {
              $scope.ollTasks = d.data;
            } else {
            }
        });
      }
      getTasks();





		}

})();