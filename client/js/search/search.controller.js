
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

		$scope.checkDownKey = function(event){
			if(event.keyCode === 40){
				event.preventDefault();
				if($scope.selectedIndex+1 !== $scope.similarTerms.length){
					$scope.selectedIndex++;
				}
			}else if (event.keyCode === 38) {
				event.preventDefault();
				if($scope.selectedIndex-1 !== -1){
					$scope.selectedIndex--;
				}
			}else if (event.keyCode === 13) {
				event.preventDefault();
				$scope.similarTerms = [];
			}
		}

		$scope.checkUpKey = function(event){
			if(event.keyCode !== 8 || event.keyCode !== 46){
				if($scope.keywords == ""){
					$scope.similarTerms = [];
				}
			}
		}

		$scope.selectedValue = function(index){
			$scope.keywords = $scope.similarTerms[index];
			$scope.similarTerms = [];
		}
});
