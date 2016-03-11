angular.module('search.controller', [])
.directive('resultsPreview', function(){
	return {
		templateUrl: '../views/results.preview.html'
	}
})
.controller('SearchController', function ($scope, SearchService) {
	$scope.search = function(){
		SearchService.query({q: $scope.keywords}, function(response){
			try {
				$scope.results = JSON.parse(response);
				console.log(response);
			}catch(err) {
				console.log(err);
			}
		});
	};
});