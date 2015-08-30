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
        when('/dashboard', {
            templateUrl: 'partials/dashboard.html',
            controller: 'DashboardController'
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
                restricted = false,
                currUrl = $location.path();
            for (var i = 0, j = publicUrl.length; i <j; i++) {
                if (currUrl !== publicUrl[i]) {
                    restricted = true;
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
