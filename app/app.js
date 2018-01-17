(function() {
  'use strict';

  var app = angular.module('app', [
      'ui.router',  
      'ngAnimate', 
      'ngMaterial',
      'ngResource'
    ]);


  // @ngInject
  app.config( function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/login");

    $stateProvider
      .state('login', {
        url: "/login",
        template: '<login></login>'
      }); 


    $stateProvider
      .state('signup', {
        url: "/signup",
        template: '<signup></signup>'
      }); 
   

    $stateProvider
      .state('home', {
        url: "/home",
        template: '<home></home>'
      }); 


  });









 // @ngInject
    app.factory('factoryAuth', function($q, $http) {

      function postLogin(user) {
          return $q(function (resolve, reject) {
              $http.post('https://easycode-test-auth-server.herokuapp.com/login', user)
                  .then(function (d) {
                      resolve(d.data);
                  }, function (err) {
                      reject(err);
                  });
          });
      }


      function postSignup(newUser) {
          return $q(function (resolve, reject) {
              $http.post('https://easycode-test-auth-server.herokuapp.com/signup', {name: newUser.name, email: newUser.email, password: newUser.password})
                  .then(function (d) {
                      resolve(d);
                  }, function (err) {
                      reject(err);
                  });
          });
      }


      function postVerify(token) {
          return $q(function (resolve, reject) {
              $http.post('https://easycode-test-auth-server.herokuapp.com/verify', token)
                  .then(function (d) {
                      resolve(d);
                  }, function (err) {
                      reject(err);
                  });
          });
      }



      function getTasks() {
          return $q(function (resolve, reject) {
              $http.get('https://easycode-test-auth-server.herokuapp.com/tasks', {})
                  .then(function (d) {
                      resolve(d);
                  }, function (err) {
                      reject(err);
                  });
          });
      }

 

      return {
          postLogin: postLogin,
          postSignup: postSignup,
          postVerify: postVerify,
          getTasks: getTasks
      };


    });


















})();