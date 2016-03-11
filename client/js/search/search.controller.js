angular.module('search.controller', [])
.directive('resultsPreview', function(){
	return {
		templateUrl: '../views/results.preview.html'
	}
})
.controller('SearchController', function ($scope, SearchService) {
	$scope.search = function(){
		SearchService.get({q: $scope.keywords}, function(response){
			try {
				$scope.results = response;
			}catch(err) {
				console.log(err);
			}
		});
	};
});