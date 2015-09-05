(function() {
    'use strict';

    angular
        .module('blogApp', [
            'ngRoute',
            'ngCookies',
            'blogControllers',
            'blogServices'
        ])
        .config(config)
        .run(run);

    config.$inject = ['$routeProvider', '$locationProvider'];
    function config($routeProvider, $locationProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'partials/login.html',
            controller: 'HomeController'
        }).
        when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'RegisterController'
        }).
        when('/profile', {
            templateUrl: 'partials/profile.html',
            controller: 'ProfileController'
        }).
        when('/blog/view/:blogId?', {
            templateUrl: 'partials/blog-view.html',
            controller: 'BlogViewController'
        }).
        when('/blog/edit/:blogId?', {
            templateUrl: 'partials/blog-edit.html',
            controller: 'BlogEditController'
        }).
        when('/logout', {
            resolve: {
                logout: function ($location, $http, AuthService) {
                    AuthService.logout
                    .save(AuthService.getAuthData().currentUser)
                    .$promise.then(function(data) {
                        if (data.error) {
                            // log the error
                        }
                        AuthService.clearAuthData();
                        $location.path('/');
                    });
                }
            }
        }).
        otherwise({
            redirectTo: '/'
        });

        if (window.history && window.history.pushState) {
            $locationProvider.html5Mode(true);
        }
    }

    run.$inject = ['$rootScope', '$location', '$cookieStore', '$http'];
    function run($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.token;
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            var publicUrl = ['/', '/register'],
                restricted = true,
                currUrl = $location.path();
            for (var i = 0, j = publicUrl.length; i <j; i++) {
                if (currUrl == publicUrl[i]) {
                    restricted = false;
                    break;
                }
            }
            // redirect to login page if not logged in and trying to access a restricted page
            var loggedIn = $rootScope.globals.currentUser;
            if (restricted && !loggedIn) {
                $location.path('/');
            }
        });
    }
})();
