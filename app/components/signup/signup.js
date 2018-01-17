(function() {
  'use strict';


  angular.module('app')

  		.component('signup', {
	      templateUrl: 'components/signup/signup.html',
	      controller: signupCtrl 
    	});

      
  	// @ngInject
    function signupCtrl($scope, factoryAuth, $state) {

      $scope.newUser = {name: "", email: "", password: "", confirmPassword: ""};

      var regExpName      = /^(?=.*[A-Za-z])[A-Za-z]{3,16}/g;
      var regExpEmail     = /^[_A-Za-z0-9-\+]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,15})$/g;
      var regExpPassword  = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}/g;

      $scope.signup = function() {

        if (!regExpName.test($scope.newUser.name)) {
          angular.element( document.querySelector( '#inputName' ) ).addClass("border-red");
        }
        if (regExpName.test($scope.newUser.name)) {
          angular.element( document.querySelector( '#inputName' ) ).removeClass("border-red"); 
        }

        if (!regExpEmail.test($scope.newUser.email)) {
          angular.element( document.querySelector( '#inputEmail' ) ).addClass("border-red");
        }
        if (regExpEmail.test($scope.newUser.email)) {
          angular.element( document.querySelector( '#inputEmail' ) ).removeClass("border-red"); 
        }

        if (!regExpPassword.test($scope.newUser.password)) {
          angular.element( document.querySelector( '#inputPassword' ) ).addClass("border-red");
        }
        if (regExpPassword.test($scope.newUser.password)) {
          angular.element( document.querySelector( '#inputPassword' ) ).removeClass("border-red"); 
        }

        if ($scope.newUser.password != $scope.newUser.confirmPassword) {
          angular.element( document.querySelector( '#inputConfirmPassword' ) ).addClass("border-red"); 
        }
        if ($scope.newUser.password === $scope.newUser.confirmPassword) {
          angular.element( document.querySelector( '#inputConfirmPassword' ) ).removeClass("border-red"); 
        }

        if (regExpName.test($scope.newUser.name) && regExpEmail.test($scope.newUser.email) && regExpPassword.test($scope.newUser.password) && $scope.newUser.password === $scope.newUser.confirmPassword) {
          factoryAuth.postSignup($scope.newUser).then( function ( d ) {
            if ( d != 'error' ) {
              localStorage.setItem("token", d.data);
              $state.go('home', {});
            } else {
              
            }
          });
        }
      };




		}

})();