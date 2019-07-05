var directiveApp = angular.module("starter.directive", []);
directiveApp.directive("backOrHome", function($state,$ionicHistory,$rootScope) {
	return {
		restrict: "A",
		template: "<button ng-class=\"{true:'button icon ion-ios-arrow-back button-clear',false:'button icon ion-ios-arrow-back button-clear'}[haveHistory]\" ng-click=\"back()\"></button>",
		// template: "<button ng-class=\"{true:'button icon ion-ios-arrow-back button-clear',false:'button icon ion-home button-clear'}[haveHistory]\"></button>",
		link: function($scope, $el) {
			if ($ionicHistory.viewHistory().backView == null) {
				$scope.haveHistory = false;
			} else {
				$scope.haveHistory = true;
			};
			// $el.bind('click', function() {
			// 	$scope.haveHistory ? $ionicHistory.goBack() : $state.go("index.map");
			// });
			$scope.back = function () {	
				$rootScope.shouldReturnPos = true;							
				if ($scope.haveHistory) {										
					if ($ionicHistory.viewHistory().backView.stateName == "index.mine" || $ionicHistory.viewHistory().backView.stateName == "index.find" || $ionicHistory.viewHistory().backView.stateName == "index.map") {												
						$rootScope.hideTabs = false;												
					}else {																		
						$rootScope.hideTabs = true;						
					};										
					$ionicHistory.goBack();															
				}else {																			
					$state.go("index.map",{city:(localStorage.getItem("w-cityName") ? localStorage.getItem("w-cityName") : "")});
				};

			};
		}
	};
})
// .directive("hideTabs", function($rootScope) {
// 	return {
// 		restrict: "A",
// 		// link: function($scope, $el) {
// 		// 	$rootScope.hideTabs = true;
// 		// 	$scope.$on("$destroy", function() {
// 		// 		$rootScope.hideTabs = false;
// 		// 	});
// 		// }
// 		// link: function($scope, element, attributes) {
// 		// 	$scope.$on('$ionicView.beforeEnter', function() {
// 		// 		$scope.$watch(attributes.hideTabs, function(value) {
// 		// 			console.log(value);
// 		// 			$rootScope.hideTabs = value;
// 		// 		});
// 		// 	});
// 		// 	$scope.$on('$ionicView.beforeLeave', function() {
// 		// 		$rootScope.hideTabs = false;
// 		// 	});
// 		// }

// 		link: function($scope, element, attributes) {
// 			$scope.$watch(attributes.hideTabs, function(value) {
// 				$rootScope.hideTabs = value;
// 			});
// 			$scope.$on("$destroy", function() {
// 				$rootScope.hideTabs = false;
// 			});
// 		}


// 	};
// })

.directive('hideTabs', function($rootScope) {
	return {
		restrict: 'A',
		link: function(scope, element, attributes) {

			scope.$on('$ionicView.beforeEnter', function() {
				scope.$watch(attributes.hideTabs, function(value) {
					$rootScope.hideTabs = true;
				});
			});

			scope.$on('$ionicView.beforeLeave', function() {
				scope.$watch(attributes.hideTabs, function(value) {
					$rootScope.hideTabs = true;
				});
				scope.$watch('$destroy', function() {
					$rootScope.hideTabs = false;
				})
			});
		}
	};
})
// html内容
.filter("trustHtml", function($sce) {
	return function(input) {
		var input = input || "";
		// 格式化html标签
		input = input.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"");
		// input = input.replace(/nbsp/g, " o");
		return $sce.trustAsHtml(input);
	}
})


// html内容
.filter("trustHtmla", function($sce) {
	return function(input,ddd) {
		var input = input || "";
		input = input.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"");
		input = input.replace(/大/g, " o");
		return $sce.trustAsHtml(input);
	}
})





.filter('capitalize_as_you_want', function() {
	return function(input, capitalize_index, specified_char) {
		input = input || '';
		var output = '';
		var customCapIndex = capitalize_index || -1;

		var specifiedChar = specified_char || '';

		for (var i = 0; i < input.length; i++) {
			// 首字母肯定是大写的， 指定的index的字母也大写
			if (i === 0 || i === customCapIndex) {
				output += input[i].toUpperCase();
			} else {
				// 指定的字母也大写
				if (specified_char != '' && input[i] === specified_char) {
					output += input[i].toUpperCase();
				} else {
					output += input[i];
				}
			}
		}

		return output;
	};
})