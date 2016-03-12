
var searchApp = angular.module('search.controller', [])
.directive('resultsPreview', function(){
	return {
		templateUrl: '../views/results.preview.html'
	}
})
.controller('SearchController', function ($scope, SearchService) {


	// $scope.search = function(){
	// 	SearchService.query({q: $scope.keywords}, function(response){
	// 		$scope.results = response;
	// 	});
	// };
	$scope.simResults = '';
	$scope.selectedIndex = -1;
	$scope.getSimilarTerms = function(){
		SearchService.query({q: $scope.keywords}, function(response){
			$scope.simResults = response;

		});
		$scope.similarTerms = [];
		var maxTermList = 0;
		for(var i= 0;i<$scope.simResults.length;i++){
			$scope.similarTerms.push($scope.simResults[i].word);
			maxTermList += 1;
			if(maxTermList === 5){
				break;
			}
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


	}



});
