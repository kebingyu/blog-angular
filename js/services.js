(function() {
    'use strict';

    //var apiEndpoint = "http://api.laravel.com"; // php end point
    var apiEndpoint = "http://localhost:3000"; // node.js end point
    angular
        .module('blogServices', ['ngResource'])
        .factory('AuthService', AuthService)
        .factory('UserService', UserService)
        .factory('BlogService', BlogService)
        .factory('TagService', TagService);

    AuthService.$inject = ['$cookieStore', '$rootScope', '$timeout', '$http', '$resource'];
    function AuthService($cookieStore, $rootScope, $timeout, $http, $resource) {
        var service = {};
        service.login = $resource(apiEndpoint + '/login');
        service.logout = $resource(apiEndpoint + '/logout');
        service.register = $resource(apiEndpoint + '/v1/user');
        service.setAuthData = setAuthData;
        service.getAuthData = getAuthData;
        service.clearAuthData = clearAuthData;
        service.toggleMessage = toggleMessage;

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
        function toggleMessage(show, messages) {
            return {
                show : show,
                messages : messages || []
            };
        }
    }

    UserService.$inject = ['$resource'];
    function UserService($resource) {
        var api = apiEndpoint + '/v1/user/:user_id?user_id=:user_id&token=:token';
        var service = {};
        service.query = $resource(api, {
            user_id : '@user_id',
            token : '@token'
        }, {
            read : {
                method : 'GET'
            },
            update : {
                method : 'PUT'
            },
            remove : {
                method : 'DELETE'
            }
        });
        service.toggleMessage = function(show, messages) {
            return {
                show : show,
                messages : messages || []
            };
        };

        return service;
    }

    BlogService.$inject = ['$resource'];
    function BlogService($resource) {
        var api = apiEndpoint + '/v1/blog/:blog_id?user_id=:user_id&token=:token';
        var apiAll = apiEndpoint + '/v1/blog?user_id=:user_id&token=:token&tag=:tag';
        var service = {};
        service.query = $resource(api, {
            blog_id : '@blog_id',
            user_id : '@user_id',
            token : '@token'
        }, {
            read : {
                method : 'GET'
            },
            update : {
                method : 'PUT'
            },
            remove : {
                method : 'DELETE'
            }
        });
        service.queryAll = $resource(apiAll, {
            user_id : '@user_id',
            token : '@token',
            tag : '@tag'
        }, {
            add : {
                method : 'POST'
            },
            read : {
                method : 'GET'
            },
            remove : {
                method : 'DELETE'
            }
        });
        service.toggleMessage = function(show, messages) {
            return {
                show : show,
                messages : messages || []
            };
        };

        return service;
    }

    TagService.$inject = ['$resource'];
    function TagService($resource) {
        var service = {};
        service.query = $resource(apiEndpoint + '/v1/tag?user_id=:user_id&token=:token', {
            user_id : '@user_id',
            token : '@token'
        }, {
            add : {
                method : 'POST'
            }
        });
        service.queryByTagId = $resource(apiEndpoint + '/v1/tag/:tag_id?user_id=:user_id&token=:token', {
            tag_id : '@tag_id',
            user_id : '@user_id',
            token : '@token'
        }, {
            read : {
                method : 'GET'
            },
            remove : {
                method : 'DELETE'
            }
        });
        service.queryByBlogId = $resource(apiEndpoint + '/v1/tag/blog/:blog_id?user_id=:user_id&token=:token', {
            blog_id : '@blog_id',
            user_id : '@user_id',
            token : '@token'
        }, {
            read : {
                method : 'GET'
            },
            remove : {
                method : 'DELETE'
            }
        });
        service.queryByUserId = $resource(apiEndpoint + '/v1/tag/user/:user_id?user_id=:user_id&token=:token', {
            user_id : '@user_id',
            token : '@token'
        }, {
            read : {
                method : 'GET'
            },
            remove : {
                method : 'DELETE'
            }
        });
        service.toggleMessage = function(show, messages) {
            return {
                show : show,
                messages : messages || []
            };
        };
        service.isEmptyObject = function(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }
            return true;
        };

        return service;
    }
})();
