(function() {
    'use strict';

    var apiEndpoint = "http://api.laravel.com";
    angular
        .module('blogServices', ['ngResource'])
        .factory('AuthService', AuthService);

    AuthService.$inject = ['$cookieStore', '$rootScope', '$timeout', '$http', '$resource'];
    function AuthService($cookieStore, $rootScope, $timeout, $http, $resource) {
        var service = {};
        service.login = $resource(apiEndpoint + '/login');
        service.logout = $resource(apiEndpoint + '/logout');
        service.register = $resource(apiEndpoint + '/v1/user');
        service.setAuthData = setAuthData;
        service.getAuthData = getAuthData;
        service.clearAuthData = clearAuthData;

        return service;

        function setAuthData(data) {
            $rootScope.globals = {
                currentUser: {
                    username : data.username,
                    user_id  : data.user_id,
                    token    : data.token
                }
            };

            $http.defaults.headers.common['Authorization'] = 'Basic ' + data.token;
            $cookieStore.put('globals', $rootScope.globals);
        }

        function getAuthData() {
            return $cookieStore.get('globals');
        }

        function clearAuthData() {
            $rootScope.globals.currentUser = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        }
    };
})();
