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
            $scope.loading = true;
            AuthService.login.save($scope.data).$promise.then(function(data) {
                if (data.success) {
                    AuthService.setAuthData(data.success);
                    $location.path('/blog/view');
                } else if (data.error) {
                    $scope.error = AuthService.toggleMessage(true, data.error);
                }
            }, function(response) {
                // handle error
            }).finally(function() {
                $scope.loading = false;
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
            $scope.loading = true;
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
            }).finally(function() {
                $scope.loading = false;
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
            $scope.loading = true;
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
                    }).finally(function() {
                        $scope.loading = false;
                    });
            }
        };
        $scope.updateProfile = function(item) {
            $scope.loading = true;
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
                }).finally(function() {
                    $scope.loading = false;
                });
        };
        $scope.resetProfile = function(item) {
            item.editing = false;
        };

        $scope.init();
    }

    BlogViewController.$inject = ['$scope', '$routeParams', '$location', '$route', 'AuthService', 'UserService', 'BlogService', 'TagService'];
    function BlogViewController($scope, $routeParams, $location, $route, AuthService, UserService, BlogService, TagService) {
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
                $scope.loading = true;
                if ($routeParams.blogId) {
                    $scope.states.view = 'blog-view';
                    var payload = $scope.currentUser;
                    payload.blog_id = $routeParams.blogId;
                    // read blog
                    BlogService.query
                        .read(payload)
                        .$promise.then(function(data) {
                            if (data.success) {
                                $scope.blogs = data.success;
                            } else if (data.error) {
                                $scope.error = BlogService.toggleMessage(true, data.error);
                            }
                    }).finally(function() {
                        $scope.loading = false;
                    });
                } else {
                    var payload = $scope.currentUser;
                    if ($routeParams.tag) { // get all blogs with given tag
                        payload.tag = $routeParams.tag;
                    }
                    $scope.states.view = 'blog-view-all';
                    BlogService.queryAll
                        .read(payload)
                        .$promise.then(function(data) {
                            if (data.success) {
                                $scope.blogs = data.success;
                            } else if (data.error) {
                                $scope.error = BlogService.toggleMessage(true, data.error);
                            }
                    }).finally(function() {
                        $scope.loading = false;
                    });
                }
            }
        };
        $scope.deleteBlog = function(blogId) {
            var r = window.confirm("Are you sure to delete this blog?");
            if (r) {
                $scope.loading = true;
                var payload = $scope.currentUser;
                payload.blog_id = blogId;
                BlogService.query
                    .remove(payload)
                    .$promise.then(function(data) {
                        if (data.success) {
                            $location.path('/blog/view');
                            $route.reload();
                        } else if (data.error) {
                            $scope.error = BlogService.toggleMessage(true, data.error);
                        }
                }).finally(function() {
                    $scope.loading = false;
                });
            }
        };
        $scope.addTag = function() {
            $scope.loading = true;
            var payload = $scope.currentUser;
            payload.content = $scope.addTag.content; 
            TagService.query
                .add(payload)
                .$promise.then(function(data) {
                    if (data.success) {
                        if (!TagService.isEmptyObject(data.success)) {
                            $scope.blogs.tags.push(data.success);
                        }
                        $scope.addTag.content = '';
                    } else if (data.error) {
                        $scope.error = BlogService.toggleMessage(true, data.error);
                    }
            }).finally(function() {
                $scope.loading = false;
            });
        };
        $scope.getTags = function(blog, blogId) {
            var payload = $scope.currentUser;
            payload.blog_id = blogId;
            TagService.queryByBlogId
                .read(payload)
                .$promise.then(function(data) {
                    if (data.success) {
                        blog.tags = data.success;
                    } else {
                        blog.tags = [];
                    }
            });
        };
        $scope.removeTag = function(tagId) {
            $scope.loading = true;
            var payload = $scope.currentUser;
            payload.tag_id = tagId;
            TagService.queryByTagId
            .remove(payload)
            .$promise.then(function(data) {
                if (data.success) {
                    for (var i = 0, j = $scope.blogs.tags.length; i < j; i++) {
                        if (tagId == $scope.blogs.tags[i].id) {
                            $scope.blogs.tags.splice(i, 1);
                        }
                    }
                } else if (data.error) {
                    $scope.error = BlogService.toggleMessage(true, data.error);
                }
            }).finally(function() {
                $scope.loading = false;
            });
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
                    $scope.loading = true;
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
                    }).finally(function() {
                        $scope.loading = false;
                    });
                } else {
                    $scope.states.view = 'blog-edit-new';
                    $scope.blog = {};
                }
            }
        };
        $scope.saveBlog = function() {
            $scope.loading = true;
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
                }).finally(function() {
                    $scope.loading = false;
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
                }).finally(function() {
                    $scope.loading = false;
                });
            }
        };
        $scope.cancel = function() {
            window.history.back();
        };

        $scope.init();
    }
})();
