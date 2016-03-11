angular.module('app',
	['ngRoute', 'ngResource'])
	.config(['$routeProvider', '$locationProvider',
		function ($routeProvider, $locationProvider) {

			// $routeProvider
			// 	.when('/', {
			// 		templateUrl: 'views/fact.html',
			// 		controller: 'FactController'
			// 	})
			// 	.when('/file', {
			// 		templateUrl: 'views/file.html',
			// 		controller: 'FileController'
			// 	})
			// 	.otherwise({
			// 		redirectTo: '/'
			// 	});

			$locationProvider.html5Mode(true);
	}]);
