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
            $scope.states = {
                view : 'home'
            };
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
                    $scope.error = AuthService.toggleMessage(true, data.error);
                }
            });
        };
        $scope.init();
        $scope.logout = function() {
            AuthService.logout
                .save(AuthService.getAuthData().currentUser)
                .$promise.then(function(data) {
                    if (data.success) {
                        AuthService.clearAuthData();
                        $location.path('/');
                    } else if (data.error) {
                        $scope.error = AuthService.toggleMessage(true, data.error);
                    }
                });
        };
    }

    RegisterController.$inject = ['$scope', 'AuthService'];
    function RegisterController($scope, AuthService) {
        $scope.init = function() {
            $scope.layoutId = 'home';
            $scope.error = {};
            $scope.success = {};
        };
        $scope.init();
        $scope.register = function() {
            AuthService.register.save($scope.data).$promise.then(function(data) {
                if (data.success) {
                    $scope.error.show = false;
                    $scope.success = {
                        show : true,
                        user : data.success.username
                    };
                } else if (data.error) {
                    $scope.error = AuthService.toggleMessage(true, data.error);
                }
            });
        };
    }

    DashboardController.$inject = ['$scope', '$location', 'AuthService', 'UserService', 'BlogService'];
    function DashboardController($scope, $location, AuthService, UserService, BlogService) {
        $scope.reset = function() {
            $scope.error = {};
            $scope.success = {};
        };
        $scope.init = function() {
            $scope.layoutId = 'dashboard';
            $scope.states = {};
            $scope.goto = {
                url : '/',
                text : 'Home'
            };
            $scope.currentUser = AuthService.getAuthData().currentUser;
            $scope.viewBlog();
        };
        $scope.logout = function() {
            AuthService.logout
                .save($scope.currentUser)
                .$promise.then(function(data) {
                    if (data.success) {
                        AuthService.clearAuthData();
                        $location.path('/');
                    } else if (data.error) {
                        $scope.error = UserService.toggleMessage(true, data.error);
                    }
                });
        };
        $scope.viewProfile = function() {
            $scope.states.view = 'profile';
            $scope.reset();
            if (!$scope.userProfile) {
                UserService.query
                    .read($scope.currentUser)
                    .$promise.then(function(data) {
                        if (data.success) {
                            $scope.userProfile = [
                                {
                                    field : 'username',
                                    label : 'User name',
                                    value : data.success.username,
                                    editable : false
                                },
                                {
                                    field : 'email',
                                    label : 'Email address',
                                    value : data.success.email,
                                    editable : true
                                },
                                {
                                    field : 'created_at',
                                    label : 'Member since',
                                    value : data.success.created_at.date
                                }
                            ];
                        } else if (data.error) {
                            $scope.error = UserService.toggleMessage(true, data.error);
                        }
                    });
            }
        };
        $scope.updateProfile = function(item) {
            var data = $scope.currentUser;
            data[item.field] = item.value;
            UserService.query
                .update(data)
                .$promise.then(function(data) {
                    $scope.reset();
                    if (data.success) {
                        for (var i = 0, j = $scope.userProfile.length; i < j; i++)
                        {
                            if ($scope.userProfile[i].field == item.field)
                            {
                                $scope.userProfile[i].editing = false;
                                break;
                            }
                        }
                        $scope.success = UserService.toggleMessage(true, 
                            [item.field + ' is updated to ' + item.value + '.']);
                    } else if (data.error) {
                        $scope.error = UserService.toggleMessage(true, data.error);
                    }
                });
        };
        $scope.resetProfile = function(item) {
            item.editing = false;
        };
        $scope.viewBlog = function() {
            $scope.reset();
            $scope.states.view = 'blog';
            if (!$scope.blogs) {
                BlogService.queryAll
                    .read($scope.currentUser)
                    .$promise.then(function(data) {
                        if (data.success) {
                            $scope.blogs = data.success;
                        } else if (data.error) {
                            $scope.error = BlogService.toggleMessage(true, data.error);
                        }
                    });
            }
        };

        $scope.init();
    }
})();
