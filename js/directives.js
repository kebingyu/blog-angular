(function() {
    'use strict';

    angular
        .module('blogApp')
        .directive('toggleClass', function() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    element.bind('click', function() {
                        element.toggleClass(attrs.toggleClass);
                    });
                }
            };
        });
})();
