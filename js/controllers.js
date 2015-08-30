(function() {
    'use strict';

    angular
        .module('blogControllers', [])
        .controller('HomeController', HomeController)
        .controller('RegisterController', RegisterController)
        .controller('DashboardController', DashboardController);

    HomeController.$inject = ['$scope', '$rootScope', '$location', 'AuthService'];
    function HomeController($scope, $rootScope, $location, AuthService) {
        $scope.init = function() {
            $scope.layoutId = 'home';
            $scope.error = {};
            $scope.goto = {
                url : '/dashboard',
                text : 'Dashboard'
            };
        };
        $scope.login = function() {
            AuthService.login.save($scope.data).$promise.then(function(data) {
                if (data.success) {
                    AuthService.setAuthData(data.success);
                    $location.path('/dashboard');
                } else if (data.error) {
                    $scope.error = {
                        show : true,
                        messages : data.error
                    };
                }
            });
        };
        $scope.logout = function() {
            AuthService.logout
                .save(AuthService.getAuthData().currentUser)
                .$promise.then(function(data) {
                    if (data.success) {
                        AuthService.clearAuthData();
                        $location.path('/');
                    } else if (data.error) {
                    }
                });
        };
        $scope.init();
    }

    RegisterController.$inject = ['$scope', 'AuthService'];
    function RegisterController($scope, AuthService) {
        $scope.init = function() {
            $scope.layoutId = 'home';
            $scope.error = {};
            $scope.success = {};
        };
        $scope.register = function() {
            AuthService.register.save($scope.data).$promise.then(function(data) {
                if (data.success) {
                    $scope.error.show = false;
                    $scope.success = {
                        show : true,
                        user : data.success.username
                    };
                } else if (data.error) {
                    $scope.error = {
                        show : true,
                        messages : data.error
                    };
                }
            });
        };
        $scope.init();
    }

    DashboardController.$inject = ['$scope', '$cookieStore', '$location', 'AuthService'];
    function DashboardController($scope, $cookieStore, $location, AuthService) {
        $scope.init = function() {
            $scope.layoutId = 'dashboard';
            $scope.goto = {
                url : '/',
                text : 'Home'
            };
        };
        $scope.logout = function() {
            AuthService.logout
                .save(AuthService.getAuthData().currentUser)
                .$promise.then(function(data) {
                    if (data.success) {
                        AuthService.clearAuthData();
                        $location.path('/');
                    } else if (data.error) {
                    }
                });
        };
        $scope.init();
    }
})();
