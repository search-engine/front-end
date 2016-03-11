angular.module('search.controller', [])
.directive('resultsPreview', function(){
	return {
		templateUrl: '../views/results.preview.html'
	}
})
.controller('SearchController', function ($scope, SearchService) {
	$scope.search = function(){
		SearchService.query({q: $scope.keywords}, function(response){
			//$scope.tvlist = response;
			//console.log(response);
		});
	};
});