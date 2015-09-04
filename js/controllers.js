(function() {
    'use strict';

    angular
        .module('blogControllers', [])
        .controller('HomeController', HomeController)
        .controller('RegisterController', RegisterController)
        .controller('ProfileController', ProfileController)
        .controller('BlogEditController', BlogEditController)
        .controller('BlogViewController', BlogViewController);

    HomeController.$inject = ['$scope', '$location', 'AuthService'];
    function HomeController($scope, $location, AuthService) {
        $scope.init = function() {
            $scope.layoutId = 'home';
            $scope.error = {};
            $scope.states = {
                view : 'home'
            };
        };
        $scope.login = function() {
            AuthService.login.save($scope.data).$promise.then(function(data) {
                if (data.success) {
                    AuthService.setAuthData(data.success);
                    $location.path('/blog/view');
                } else if (data.error) {
                    $scope.error = AuthService.toggleMessage(true, data.error);
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
                    $scope.error = AuthService.toggleMessage(true, data.error);
                }
            });
        };

        $scope.init();
    }

    ProfileController.$inject = ['$scope', '$location', 'AuthService', 'UserService'];
    function ProfileController($scope, $location, AuthService, UserService) {
        $scope.reset = function() {
            $scope.error = {};
            $scope.success = {};
        };
        $scope.init = function() {
            $scope.layoutId = 'profile';
            $scope.states = {};
            $scope.currentUser = AuthService.getAuthData().currentUser;
            $scope.viewProfile();
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

        $scope.init();
    }

    BlogViewController.$inject = ['$scope', '$routeParams', '$location', 'AuthService', 'UserService', 'BlogService'];
    function BlogViewController($scope, $routeParams, $location, AuthService, UserService, BlogService) {
        $scope.reset = function() {
            $scope.error = {};
            $scope.success = {};
        };
        $scope.init = function() {
            $scope.layoutId = 'blog-view';
            $scope.states = {};
            $scope.currentUser = AuthService.getAuthData().currentUser;
            $scope.viewBlog();
        };
        $scope.viewBlog = function() {
            $scope.reset();
            if (!$scope.blogs) {
                if ($routeParams.blogId) {
                    $scope.states.view = 'blog-view';
                    var payload = $scope.currentUser;
                    payload.blog_id = $routeParams.blogId;
                    BlogService.query
                        .read(payload)
                        .$promise.then(function(data) {
                            if (data.success) {
                                $scope.blogs = data.success;
                            } else if (data.error) {
                                $scope.error = BlogService.toggleMessage(true, data.error);
                            }
                    });
                } else {
                    $scope.states.view = 'blog-view-all';
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
            }
        };
        $scope.deleteBlog = function(blogId) {
            var r = window.confirm("Are you sure to delete this blog?");
            if (r) {
                var payload = $scope.currentUser;
                payload.blog_id = blogId;
                BlogService.query
                    .remove(payload)
                    .$promise.then(function(data) {
                        if (data.success) {
                            delete $scope.blogs;
                            $scope.viewBlog();
                        } else if (data.error) {
                            $scope.error = BlogService.toggleMessage(true, data.error);
                        }
                });
            }
        };

        $scope.init();
    }

    BlogEditController.$inject = ['$scope', '$routeParams', '$location', 'AuthService', 'UserService', 'BlogService'];
    function BlogEditController($scope, $routeParams, $location, AuthService, UserService, BlogService) {
        $scope.reset = function() {
            $scope.error = {};
            $scope.success = {};
        };
        $scope.init = function() {
            $scope.layoutId = 'blog-edit';
            $scope.states = {};
            $scope.currentUser = AuthService.getAuthData().currentUser;
            $scope.editBlog();
        };
        $scope.editBlog = function() {
            $scope.reset();
            if (!$scope.blog) {
                if ($routeParams.blogId) {
                    $scope.states.view = 'blog-edit';
                    var payload = $scope.currentUser;
                    payload.blog_id = $routeParams.blogId;
                    BlogService.query
                        .read(payload)
                        .$promise.then(function(data) {
                            if (data.success) {
                                $scope.blog = data.success;
                            } else if (data.error) {
                                $scope.error = BlogService.toggleMessage(true, data.error);
                            }
                    });
                } else {
                    $scope.states.view = 'blog-edit-new';
                    $scope.blog = {};
                }
            }
        };
        $scope.saveBlog = function() {
            if ($routeParams.blogId) {
                var payload = $scope.currentUser;
                payload.title = $scope.blog.title;
                payload.content = $scope.blog.content;
                BlogService.query
                    .update(payload)
                    .$promise.then(function(data) {
                        if (data.success) {
                            $scope.success = BlogService.toggleMessage(true, 
                                ['Blog updated.']);
                            $location.path('/blog/view/' + data.success.id);
                        } else if (data.error) {
                            $scope.error = BlogService.toggleMessage(true, data.error);
                        }
                });
            } else {
                var payload = $scope.currentUser;
                payload.title = $scope.blog.title;
                payload.content = $scope.blog.content;
                BlogService.queryAll
                    .add(payload)
                    .$promise.then(function(data) {
                        if (data.success) {
                            $scope.success = BlogService.toggleMessage(true, 
                                ['Blog created.']);
                            $location.path('/blog/view/' + data.success.id);
                        } else if (data.error) {
                            $scope.error = BlogService.toggleMessage(true, data.error);
                        }
                });
            }
        };
        $scope.cancel = function() {
            window.history.back();
        };

        $scope.init();
    }
})();
