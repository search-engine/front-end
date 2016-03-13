
var searchApp = angular.module('search.controller', [])
.directive('resultsPreview', function(){
	return {
		templateUrl: '../views/results.preview.html'
	}
})
.controller('SearchController', function ($scope, SearchService) {
	$scope.simResults = '';
	$scope.selectedIndex = -1;
	$scope.search = function(){
		if($scope.keywords === '') {
			$scope.similarTerms = [];
			$scope.results = [];
		}
		SearchService.get({q: $scope.keywords}, function(response){
			try {
				$scope.results = response.urls;
				$scope.similarTerms = response.similarTerms;
			}catch(err) {
				console.log(err);
			}
		});
	}
		$scope.similarTerms = [];
		for(var i= 0;i<$scope.simResults.length;i++){
			$scope.similarTerms.push($scope.simResults[i].word);
		}

		$scope.$watch('selectedIndex',function(val){
			if(val !== -1){
				$scope.keywords = $scope.similarTerms[$scope.selectedIndex];
				$scope.similarTerms = [];
			}
		});

		$scope.selectedValue = function(index){
			$scope.keywords = $scope.similarTerms[index].word;
			$scope.similarTerms = [];
		}
});
