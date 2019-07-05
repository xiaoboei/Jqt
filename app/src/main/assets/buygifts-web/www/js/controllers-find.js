// 发现主页-购物
ctrlApp.controller("ctrlFind", function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup,$ionicSlideBoxDelegate) {
	//初始化
	$scope.init = function(){		
		$scope.$on('$ionicView.beforeEnter', function() {
			$rootScope.hideTabs = false;
			//微信分享
        	$rootScope.wxShare('在线购物', '途礼游', '');
		});
		//loading.....
		var loadding = true;		
		//空列表提示
		$scope.listHint = false;

		$ionicLoading.show({
			template: "数据正在加载中..."
		});
		//超时
		// setTimeout(function () {
		// 	if (loadding) {
		// 		$scope.showTips("请检查网络或者稍后再试！");
		// 	};
		// },8000);
			
		//城市名称
		$scope.cityName = localStorage.getItem('w-cityName'); 	
		console.log($scope.cityName);	
		//获取url
		$scope.tabUrl = '/index/find';
		//菜单隐藏
		$scope.menu_show = false;
		//获取城市id	
		$scope.getCityIdByName();		
		//获取分类菜单
		$scope.getClassifyUrl();
	}	

    // 获取分类菜单
    $scope.getClassifyUrl = function(){    	
	    $http.get(API.product_classify).success(function(response) {
	        $ionicLoading.hide();
	        loadding = false;
	        $scope.menuData = response.RESPONSE_INFO.list;        
	    });    
    }

	// 获取焦点图 和标签	
	$scope.getBanner = function(){		
		var getbannerUrl = API.product_getbanner + '?city_id=' + $scope.cityId;	
		$http.get(getbannerUrl).success(function(response) {		
			if (response.RESPONSE_STATUS == 100) {
				$ionicLoading.hide();
				loadding = false;
				console.log("获取焦点图成功");
				$scope.bannerData = response.RESPONSE_INFO.banner;			
				$scope.tagData = response.RESPONSE_INFO.tag;
				$ionicSlideBoxDelegate.update();
			}else {
				$scope.showTips(response.Tips);
				loadding = false;
			};
		});
	}
	
	// 获取当前城市ID
    $scope.getCityIdByName = function () {
        var url = API.get_city_id + '?name=' + $scope.cityName;
        $http.get(url).success(function (response) {
            if(response.RESPONSE_INFO.region){                    
                $scope.cityId = response.RESPONSE_INFO.region.id;
                //获取焦点图、标签
				$scope.getBanner();
				// 产品列表
				// 排序类型，1最新2销量3价格下4价格上
				$scope.getProductData(1);
            }
        })
    }
	
	//获取列表
	$scope.loadMoreData = function() {
		if ($scope.currentPage < $scope.pageCount) {
			$scope.currentPage++;			
			$scope.loadText = "正在加载中";
			// 获取最新商品
			$http.get(API.product_index + "?" + $rootScope.serialize({
				user_id: $rootScope.user_id,
				auth_token: $rootScope.auth_token,
				type: $scope.type,
				page: $scope.currentPage,
				city_id: $scope.cityId
			})).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {					
					$ionicLoading.hide();
					$scope.pageCount = response.RESPONSE_INFO.page.pageCount;					
					$scope.itemCount = response.RESPONSE_INFO.page.itemCount;
					var data = response.RESPONSE_INFO.product;
					for (var i = 0; i < data.length; i++) {
						$scope.itemsData.push(data[i]);
					};
					if ($scope.currentPage < $scope.pageCount) {
						$scope.loadText = "点击加载更多";
					} else {
						$scope.loadText = "没有更多数据了";
					};
				} else {					
					$scope.showTips(response.Tips);
				};
				$scope.$broadcast('scroll.infiniteScrollComplete');
				if($scope.itemsData.length === 0){
					$scope.listHint = true;
				}
			});
		}else {
			$scope.loadText = "没有更多数据了";
		};
	};

	//获取产品列表数据
	$scope.getProductData = function (type) {
		$scope.type = type;
		$scope.loadText = "点击加载更多";
		$scope.itemsData = [];
		// 初始化参数 | currentPage：第几页 | pageCount：总页数 |　itemCount：数据总条数
		$scope.currentPage = 0;
		$scope.itemCount = 0;
		$scope.pageCount = 1;			
		$scope.loadMoreData();
	}

	$scope.getPriceProductData = function () {
		if ($scope.type != 4) {
			$scope.type = 4;
		}else if ($scope.type == 4) {
			$scope.type = 3;
		};
		$scope.loadText = "点击加载更多";
		$scope.itemsData = [];
		$scope.currentPage = 0;
		$scope.itemCount = 0;
		$scope.pageCount = 1;
		$scope.loadMoreData();
	}

	// 收藏商品
	$scope.collectPro = function (obj) {
		if (obj.is_fans == 1) {
			$ionicLoading.show({
				template: "正在处理..."
			});
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消收藏");
					obj.is_fans = 0;
					obj.collection--;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消收藏失败");
			})
		}else {
			$ionicLoading.show({
				template: "正在处理..."
			});
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					busines_id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("收藏成功");
					obj.is_fans = 1;
					obj.collection++;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("收藏失败");
			})
		};
	}
	
	//菜单显示隐藏
	$scope.menu_click = function(){
		$scope.menu_show = !$scope.menu_show;
	}

	$scope.hide_menu = function(){
		if($scope.menu_show){
			$scope.menu_show = false;	
			$scope.$evalAsync();
		}
	}

	//初始化
	$scope.init();
	//选择城市
	$rootScope.$on('cityName',function(){		
		//初始化
		$scope.init();		
	})	

	//重新加载banner
	$rootScope.$on('initBanner',function(){
		//加载banner
		$scope.getBanner();
		$scope.menu_show = false;
	})
})

// 扫描内容
ctrlApp.controller("ctrlFindScan", function($scope,$state,$rootScope) {
	//console.log("ctrlFindScan");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

	// console.log(localStorage.t_scan == undefined);
	$scope.scanText = localStorage.t_scan ? localStorage.t_scan : "";
	localStorage.removeItem("t_scan");
})

// 发现-菜单
ctrlApp.controller("ctrlFindMenu", function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup) {
	//console.log("ctrlFindMenu");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

	var loadding = true;
	$ionicLoading.show({
		template: "数据正在加载中..."
	});
	setTimeout(function () {
		if (loadding) {
			$scope.showTips("请检查网络或者稍后再试！");
		};
	},8000);

	$scope.show = function (obj) {
		for (var i = 0; i < $scope.menuData.length; i++) {
			$scope.menuData[i].is_show = 0;
		};
		obj.is_show = 1;
	}

	// 获取最新商品
	$http.get(API.product_classify).success(function(response) {
		$ionicLoading.hide();
		loadding = false;
		//console.log(response);
		$scope.menuData = response.RESPONSE_INFO.list;
		// 设置第一个为显示
		for (var i = 0; i < $scope.menuData.length; i++) {
			if (i == 0) {
				$scope.menuData[i].is_show = 1;
			}else {
				$scope.menuData[i].is_show = 0;
			};
		};
	});


	$scope.search = function() {
		var keyword = '';
		var $inp = $('.Jinput');
		$inp.each(function(e) {
			if (this.value) {
				keyword = this.value;
			}
		})
		if (!keyword) return;
		location.href = '#/index/find/search/' + keyword;
	}	
})

// 发现-类型
ctrlApp.controller("ctrlFindClassify", function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup) {	

	//初始化
	$scope.init = function(){
		$scope.$on('$ionicView.beforeEnter', function() {
			$rootScope.hideTabs = true;
		});
		$scope.class_id = $state.params.id;
		$scope.class_name = "";

		var loadding = true;
		$ionicLoading.show({
			template: "数据正在加载中..."
		});	

		//城市名称
		$scope.cityName = localStorage.getItem('w-cityName');

		//获取当前城市ID
		$scope.getCityIdByName();

	}

	// 获取当前城市ID
    $scope.getCityIdByName = function () {
        var url = API.get_city_id + '?name=' + $scope.cityName;
        $http.get(url).success(function (response) {
            if(response.RESPONSE_INFO.region){                    
                $scope.cityId = response.RESPONSE_INFO.region.id;
                // 排序类型，1最新2销量3价格下4价格上
				// 列表
				$scope.getProductData(1);
            }
        })
    }

	//加载列表
	$scope.loadMoreData = function() {
		if ($scope.currentPage < $scope.pageCount) {
			$scope.currentPage++;
			$scope.loadText = "正在加载中";

			// 获取最新商品
			$http.get(API.product_index + "?" + $rootScope.serialize({
				user_id: $rootScope.user_id,
				auth_token: $rootScope.auth_token,
				type:$scope.type,
				class_id:$scope.class_id,
				page:$scope.currentPage,
				city_id:$scope.cityId
			})).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					console.log("获取数据成功");
					$ionicLoading.hide();
					loadding = false;
					$scope.pageCount = response.RESPONSE_INFO.page.pageCount;
					$scope.itemCount = response.RESPONSE_INFO.page.itemCount;
					$scope.class_name = response.RESPONSE_INFO.tag.tag_name;
					var data = response.RESPONSE_INFO.product;
					for (var i = 0; i < data.length; i++) {
						$scope.itemsData.push(data[i]);
					};

					if ($scope.currentPage < $scope.pageCount) {
						$scope.loadText = "点击加载更多";
					}else {
						$scope.loadText = "没有更多数据了";
					};
					if (parseInt($scope.pageCount) == 0) {
						$scope.loadText = "暂无数据";
					};
				}else {
					console.log("获取数据失败");
					$scope.showTips(response.Tips);
					loadding = false;
				};
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		}else {
			$scope.loadText = "没有更多数据了";
		};
	};


	// 排序类型，1最新2销量3价格下4价格上
	// 初始化参数 | currentPage：第几页 | pageCount：总页数 |　itemCount：数据总条数	
	$scope.getProductData = function (type) {
		$scope.type = type;
		$scope.loadText = "点击加载更多";
		$scope.itemsData = [];
		$scope.currentPage = 0;
		$scope.itemCount = 0;
		$scope.pageCount = 1;
		$scope.loadMoreData();

	}



	$scope.getPriceProductData = function () {
		if ($scope.type != 4) {
			$scope.type = 4;
		}else if ($scope.type == 4) {
			$scope.type = 3;
		};
		$scope.loadText = "点击加载更多";
		$scope.itemsData = [];
		$scope.currentPage = 0;
		$scope.itemCount = 0;
		$scope.pageCount = 1;
		$scope.loadMoreData();
	}	




	// 收藏商品
	$scope.collectPro = function (obj) {
		if (obj.is_fans == 1) {
			$ionicLoading.show({
				template: "正在处理..."
			});
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消收藏");
					obj.is_fans = 0;
					obj.collection--;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消收藏失败");
			})
		}else {
			$ionicLoading.show({
				template: "正在处理..."
			});
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					busines_id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("收藏成功");
					obj.is_fans = 1;
					obj.collection++;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("收藏失败");
			})
		};
	}

	//初始化
	$scope.init();
})

// 商家商品-类型
ctrlApp.controller("ctrlFindShopClassify", function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup) {	
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});
	$scope.class_id = $state.params.id;
	$scope.class_name = "";

	var loadding = true;
	$ionicLoading.show({
		template: "数据正在加载中..."
	});
	setTimeout(function () {
		if (loadding) {
			$scope.showTips("请检查网络或者稍后再试！");
		};
	},8000);

	// 加载
	$scope.loadText = "点击加载更多";
	$scope.itemsData = [];
	// 初始化参数 | currentPage：第几页 | pageCount：总页数 |　itemCount：数据总条数	

	$scope.loadMoreData = function() {
		if ($scope.currentPage < $scope.pageCount) {
			$scope.currentPage++;
			$scope.loadText = "正在加载中";

			// 获取最新商品
			$http.get(API.product_index + "?" + $rootScope.serialize({
				user_id: $rootScope.user_id,
				auth_token: $rootScope.auth_token,
				type:$scope.type,
				shop_class_id:$scope.class_id,
				page:$scope.currentPage
			})).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					console.log("获取数据成功");
					$ionicLoading.hide();
					loadding = false;
					$scope.pageCount = response.RESPONSE_INFO.page.pageCount;
					$scope.itemCount = response.RESPONSE_INFO.page.itemCount;
					$scope.class_name = response.RESPONSE_INFO.tag.tag_name;
					var data = response.RESPONSE_INFO.product;
					for (var i = 0; i < data.length; i++) {
						$scope.itemsData.push(data[i]);
					};

					if ($scope.currentPage < $scope.pageCount) {
						$scope.loadText = "点击加载更多";
					}else {
						$scope.loadText = "没有更多数据了";
					};
					if (parseInt($scope.pageCount) == 0) {
						$scope.loadText = "暂无数据";
					};					
				}else {
					console.log("获取数据失败");
					$scope.showTips(response.Tips);
					loadding = false;
				};
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		}else {
			$scope.loadText = "没有更多数据了";
		};
	};


	// 排序类型，1最新2销量3价格下4价格上
	$scope.type = 0;
	$scope.getProductData = function (type) {
		$scope.type = type;
		$scope.loadText = "点击加载更多";
		$scope.itemsData = [];
		$scope.currentPage = 0;
		$scope.itemCount = 0;
		$scope.pageCount = 1;
		$scope.loadMoreData();

	}



	$scope.getPriceProductData = function () {
		if ($scope.type != 4) {
			$scope.type = 4;
		}else if ($scope.type == 4) {
			$scope.type = 3;
		};
		$scope.loadText = "点击加载更多";
		$scope.itemsData = [];
		$scope.currentPage = 0;
		$scope.itemCount = 0;
		$scope.pageCount = 1;
		$scope.loadMoreData();
	}
	$scope.getProductData(1);




	// 收藏商品
	$scope.collectPro = function (obj) {
		if (obj.is_fans == 1) {
			$ionicLoading.show({
				template: "正在处理..."
			});
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消收藏");
					obj.is_fans = 0;
					obj.collection--;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消收藏失败");
			})
		}else {
			$ionicLoading.show({
				template: "正在处理..."
			});
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					busines_id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("收藏成功");
					obj.is_fans = 1;
					obj.collection++;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("收藏失败");
			})
		};
	}
})

// 发现-标签
ctrlApp.controller("ctrlFindTag", function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup) {
	
	//初始化
	$scope.init = function(){
		$scope.$on('$ionicView.beforeEnter', function() {
			$rootScope.hideTabs = true;
		});
		$scope.tag_id = $state.params.id;
		$scope.tag_name = "";

		var loadding = true;
		$ionicLoading.show({
			template: "数据正在加载中..."
		});

		//城市名称
		$scope.cityName = localStorage.getItem('w-cityName');
		
		//获取城市id
		$scope.getCityIdByName();		
	}

	// 获取当前城市ID
    $scope.getCityIdByName = function () {
        var url = API.get_city_id + '?name=' + $scope.cityName;
        $http.get(url).success(function (response) {
            if(response.RESPONSE_INFO.region){                    
                $scope.cityId = response.RESPONSE_INFO.region.id;                
				// 列表
				$scope.getProductData(1);
            }
        })
    }
	
	//列表加载
	$scope.loadMoreData = function() {
		if ($scope.currentPage < $scope.pageCount) {
			$scope.currentPage++;
			$scope.loadText = "正在加载中";

			// 获取最新商品
			$http.get(API.product_index + "?" + $rootScope.serialize({
				user_id: $rootScope.user_id,
				auth_token: $rootScope.auth_token,
				type:$scope.type,
				tag_id:$scope.tag_id,
				page:$scope.currentPage,
				city_id:$scope.cityId
			})).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					console.log("获取数据成功");
					$ionicLoading.hide();
					loadding = false;
					$scope.pageCount = response.RESPONSE_INFO.page.pageCount;
					$scope.itemCount = response.RESPONSE_INFO.page.itemCount;
					$scope.tag_name = response.RESPONSE_INFO.tag.tag_name;
					var data = response.RESPONSE_INFO.product;
					for (var i = 0; i < data.length; i++) {
						$scope.itemsData.push(data[i]);
					};

					if ($scope.currentPage < $scope.pageCount) {
						$scope.loadText = "点击加载更多";
					}else {
						$scope.loadText = "没有更多数据了";
					};
					if (parseInt($scope.pageCount) == 0) {
						$scope.loadText = "暂无数据";
					};					
				}else {
					//console.log("获取数据失败");
					$scope.showTips(response.Tips);
					loadding = false;
				};
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		}else {
			$scope.loadText = "没有更多数据了";
		};
	};

	// 排序类型，1最新2销量3价格下4价格上	
	// 初始化参数 | currentPage：第几页 | pageCount：总页数 |　itemCount：数据总条数	
	$scope.getProductData = function (type) {
		$scope.type = type;
		$scope.loadText = "点击加载更多";
		$scope.itemsData = [];
		$scope.currentPage = 0;
		$scope.itemCount = 0;
		$scope.pageCount = 1;
		$scope.loadMoreData();
	}

	$scope.getPriceProductData = function () {
		if ($scope.type != 4) {
			$scope.type = 4;
		}else if ($scope.type == 4) {
			$scope.type = 3;
		};
		$scope.loadText = "点击加载更多";
		$scope.itemsData = [];
		$scope.currentPage = 0;
		$scope.itemCount = 0;
		$scope.pageCount = 1;
		$scope.loadMoreData();
	}	

	// 收藏商品
	$scope.collectPro = function (obj) {
		$ionicLoading.show({
			template: "正在处理..."
		});
		if (obj.is_fans == 1) {
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					id : obj.id
				})
			}).success(function(response) {				
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消收藏");
					obj.is_fans = 0;
					obj.collection--;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消收藏失败");
			})
		}else {
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					busines_id : obj.id
				})
			}).success(function(response) {				
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("收藏成功");
					obj.is_fans = 1;
					obj.collection++;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("收藏失败");
			})
		};
	}

	//初始化
	$scope.init();
})


// 发现-达人
ctrlApp.controller("ctrlFindTalent", function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup,$location) {		
	//初始化
	$scope.init = function(){		
		$scope.$on('$ionicView.beforeEnter', function() {
			$rootScope.hideTabs = false;
            //微信分享
            $rootScope.wxShare('达人主页', '途礼游', '');
		});
		//loading.....
		var loadding = true;
		//空列表提示
		$scope.listHint = false;

		$scope.hotArticle = false;

		$ionicLoading.show({
			template: "数据正在加载中..."
		});	
		
		//城市名称
		$scope.cityName = localStorage.getItem('w-cityName');
		
		//获取url
		$scope.tabUrl = '/index/find/talent';

		//获取当前城市ID
		$scope.getCityIdByName();

		//获取达人分类
		$scope.getTalentClass();
		
	}	
    
    //获取达人分类
    $scope.getTalentClass = function(){
	    $http.get(API.talent_class).success(function(response) {
	        $ionicLoading.hide();
	        loadding = false;
	        $scope.menuData = response.RESPONSE_INFO.list;
	    });
    }    

    // 获取当前城市ID
    $scope.getCityIdByName = function () {
        var url = API.get_city_id + '?name=' + $scope.cityName;
        $http.get(url).success(function (response) {
            if(response.RESPONSE_INFO.region){                    
                $scope.cityId = response.RESPONSE_INFO.region.id;

                //获取推荐达人                
				if($location.$$url.indexOf('/index/find/talent-article') !== -1){
					$scope.hotArticle = false;
				}else{
					$scope.getTalentRecommend();
				}

				// 默认加载最新数据
				$scope.getTalentData(2);
            }
        })
    }

	// 获取推荐达人
	$scope.getTalentRecommend = function(){
		$http.get(API.talent_recommend + "?" + $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				city_id : $scope.cityId
			})).success(function(response) {
			if (response.RESPONSE_STATUS == 100) {
				console.log("获取推荐达人数据成功");
				$scope.talentRecommendData = response.RESPONSE_INFO;				
				console.log($scope.talentRecommendData.talent.length);
				if($scope.talentRecommendData.talent.length !=0){
					$scope.hotArticle = true;					
				}		
				$scope.talentRecommendData.talent.is_fans_text = ($scope.talentRecommendData.talent.is_fans == 1) ? '已关注' : '<i class="ion-plus-round"></i>关注';
			}else {
				$scope.showTips(response.Tips);
			};
		});
	}	
	
	//加载达人列表
	$scope.loadMoreData = function() {
		if ($scope.currentPage < $scope.pageCount) {
			$scope.currentPage++;
			$scope.loadText = "正在加载中";
            $class_id = $state.params.class_id;
			// 获取最新商品
			$http.get(API.find_article + "?" + $rootScope.serialize({
				user_id: $rootScope.user_id,
                class_id: $class_id ? $class_id : '',
				auth_token: $rootScope.auth_token,
				order:$scope.order,
				page:$scope.currentPage,
				city_id:$scope.cityId
			})).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$ionicLoading.hide();
					loadding = false;
					$scope.pageCount = response.RESPONSE_INFO.page.pageCount;
					$scope.itemCount = response.RESPONSE_INFO.page.itemCount;
					var data = response.RESPONSE_INFO.article;
					for (var i = 0; i < data.length; i++) {
						data[i].talent.is_fans_text = (data[i].talent.is_fans == 1) ? '已关注' : '<i class="ion-plus-round"></i>关注';
						$scope.itemsData.push(data[i]);
					};
					// console.log($scope.itemsData);					
					if ($scope.currentPage < $scope.pageCount) {
						$scope.loadText = "点击加载更多";
					}else {
						$scope.loadText = "没有更多数据了";
					};
					$scope.$broadcast('scroll.infiniteScrollComplete');
					if($scope.itemsData.length === 0){
						$scope.listHint = true;
					}
				}else {
					console.log("获取数据失败");
					$scope.showTips(response.Tips);
					loadding = false;
				};				
				
			});
		}else {
			$scope.noload = false;
			$scope.loadText = "没有更多数据了";
		};
	};

	// 1为热门 2 为最新	
	// 初始化参数 | currentPage：第几页 | pageCount：总页数 |　itemCount：数据总条数
	$scope.getTalentData = function (type) {
		$scope.order = type;
		$scope.loadText = "点击加载更多";
		$scope.itemsData = [];
		$scope.currentPage = 0;
		$scope.itemCount = 0;
		$scope.pageCount = 1;
		$scope.noload = true;
		$scope.loadMoreData();
	}	


	// 收藏达人
	$scope.collectTalent = function (obj) {

		$ionicLoading.show({
			template: "正在处理..."
		});
		if (obj.is_fans == 1) {
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 1,
					id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消关注");
					obj.is_fans = 0;
					obj.is_fans_text = '<i class="ion-plus-round"></i>关注';

					// 遍历数据,找出相同达人,赋予同样的关注状态
					for (var i = 0; i < $scope.itemsData.length; i++) {
						if (obj.id == $scope.itemsData[i].talent.id) {
							$scope.itemsData[i].talent.is_fans = obj.is_fans;
							$scope.itemsData[i].talent.is_fans_text = obj.is_fans_text;
						};
					};
					if (obj.id == $scope.talentRecommendData.talent.id) {
						$scope.talentRecommendData.talent.is_fans = obj.is_fans;
						$scope.talentRecommendData.talent.is_fans_text = obj.is_fans_text;
					};

				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消关注失败");
			})
		}else {
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 1,
					busines_id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("关注成功");
					obj.is_fans = 1;
					obj.is_fans_text = '已关注';

					// 遍历数据,找出相同达人,赋予同样的关注状态
					for (var i = 0; i < $scope.itemsData.length; i++) {
						if (obj.id == $scope.itemsData[i].talent.id) {
							$scope.itemsData[i].talent.is_fans = obj.is_fans;
							$scope.itemsData[i].talent.is_fans_text = obj.is_fans_text;
						};
					};
					if (obj.id == $scope.talentRecommendData.talent.id) {
						$scope.talentRecommendData.talent.is_fans = obj.is_fans;
						$scope.talentRecommendData.talent.is_fans_text = obj.is_fans_text;
					};

				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("关注不成功");
			})
		};
	}

	// 收藏商品
	$scope.collectPro = function (obj) {
		$ionicLoading.show({
			template: "正在处理..."
		});
		if (obj.is_fans == 1) {
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消收藏");
					obj.is_fans = 0;
					obj.collection--;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消收藏失败");
			})
		}else {
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					busines_id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("收藏成功");
					obj.is_fans = 1;
					obj.collection++;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("收藏不成功");
			})
		};
	}

	// 点赞文章
	$scope.collectArt = function (obj) {
		$ionicLoading.show({
			template: "正在处理..."
		});
		if (obj.is_fans == 1) {
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 5,
					id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消点赞");
					obj.is_fans = 0;
					obj.likes--;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消点赞失败");
			})
		}else {
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 5,
					busines_id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("点赞成功");
					obj.is_fans = 1;
					obj.likes++;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("点赞不成功");
			})
		};
	}

	$scope.menu_show = false;
	//菜单显示隐藏
	$scope.menu_click = function(){
		$scope.menu_show = !$scope.menu_show;
	}

	$scope.hide_menu = function(){		
		if($scope.menu_show){
			$scope.menu_show = false;	
			$scope.$evalAsync();			
		}
	}

	//初始化
	$scope.init();
	//选择城市
	$rootScope.$on('cityName',function(){		
		//初始化
		$scope.init();
		console.log('关我鸟事');				
	})

	$rootScope.$on('initBanner',function(){
		$scope.menu_show = false;	
	})
});

// 发现-达人-具体达人主页
ctrlApp.controller("ctrlFindTalentMain", function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup,$timeout,$ionicHistory) {
	
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

	var loadding = true;
	$ionicLoading.show({
		template: "数据正在加载中..."
	});	

	$scope.talentId = $state.params.id;

	// 以往发布 达人介绍
	$scope.currentTab = 'index';

	// 获取达人介绍数据
	$http.get(API.talent_introduce + "?" + $rootScope.serialize({
		id: $scope.talentId
	})).success(function(response) {
		//console.log(response);
		if (response.RESPONSE_STATUS == 100) {
			console.log("获取达人介绍数据成功");
			$scope.talentIntroduceData = response.RESPONSE_INFO.talent;
		}else {
			$scope.showTips(response.Tips);
		};
	});

	// 达人主页数据
	// 加载
	$scope.loadText = "点击加载更多";
	$scope.itemsData = [];
	// 初始化参数 | currentPage：第几页 | pageCount：总页数 |　itemCount：数据总条数
	$scope.currentPage = 0;
	$scope.itemCount = 0;
	$scope.pageCount = 1;

	$scope.loadMoreData = function() {
		if ($scope.currentPage < $scope.pageCount) {
			$scope.currentPage++;
			$scope.loadText = "正在加载中";

			// 获取最新商品
			$http.get(API.talent_index + "?" + $rootScope.serialize({
				user_id: $rootScope.user_id,
				auth_token: $rootScope.auth_token,
				id: $scope.talentId,
				page:$scope.currentPage
			})).success(function(response) {				
				if (response.RESPONSE_STATUS == 100) {
					console.log("获取数据成功");
					$ionicLoading.hide();
					loadding = false;
					$scope.pageCount = response.RESPONSE_INFO.article.page.pageCount;
					$scope.itemCount = response.RESPONSE_INFO.article.page.itemCount;
					var data = response.RESPONSE_INFO.article.list;
					for (var i = 0; i < data.length; i++) {
						$scope.itemsData.push(data[i]);
					};

					if ($scope.currentPage < $scope.pageCount) {
						$scope.loadText = "点击加载更多";
					}else {
						$scope.loadText = "没有更多数据了";
					};
				}else {
					console.log("获取数据失败");
					$scope.showTips(response.Tips);
					loadding = false;
				};
				$scope.$broadcast('scroll.infiniteScrollComplete');
			});
		}else {
			$scope.loadText = "没有更多数据了";
		};
	};
	$scope.loadMoreData();





	// 收藏达人
	$scope.value = '<i class="ion-plus-round"></i>关注';
	$scope.collectTalent = function (id) {
		$ionicLoading.show({
			template: "正在处理..."
		});

		var that = this;
		if (that.value == "已关注") {
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 1,
					id : id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消关注");
					that.value = '<i class="ion-plus-round"></i>关注';
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消关注失败");
			})
		}else {
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 1,
					busines_id : id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("关注成功");
					that.value = '已关注';
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("关注不成功");
			})
		};

	}
	// 监测是否收藏这个达人
	$scope.checkCollectTalent = function (id) {
		$http({
			url: API.fans_check,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				type : 1,
				id : id
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				console.log("检测成功");
				if (parseInt(response.RESPONSE_INFO.fans.is_fans)) {
					$scope.value = '已关注';
				}
			}
		}).error(function() {
			console.log("检测不成功");
		})
	}
	$scope.checkCollectTalent($scope.talentId);




	// 收藏商品
	$scope.collectPro = function (obj) {
		$ionicLoading.show({
			template: "正在处理..."
		});
		if (obj.is_fans == 1) {
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消收藏");
					obj.is_fans = 0;
					obj.collection--;
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消收藏失败");
			})
		}else {
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					busines_id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("收藏成功");
					obj.is_fans = 1;
					obj.collection++;
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("收藏不成功");
			})
		};
	}


	// 点赞文章
	$scope.collectArt = function (obj) {
		$ionicLoading.show({
			template: "正在处理..."
		});
		if (obj.is_fans == 1) {
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 5,
					id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消点赞");
					obj.is_fans = 0;
					obj.likes--;
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消点赞失败");
			})
		}else {
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 5,
					busines_id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("点赞成功");
					obj.is_fans = 1;
					obj.likes++;
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("点赞不成功");
			})
		};
	}	

})
// 达人文章
ctrlApp.controller("ctrlFindTalentArt", function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup, $ionicScrollDelegate,$timeout,$ionicHistory) {
	//console.log("ctrlFindTalentArt");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

	var loadding = true;
	$ionicLoading.show({
		template: "数据正在加载中..."
	});
	setTimeout(function () {
		if (loadding) {
			$scope.showTips("请检查网络或者稍后再试！");
		};
	},8000);


	$scope.artId = $state.params.id;
	// $scope.tabTitle = "达人文章";
	// 获取达人文章数据
	$http.get(API.talent_article + "?" + $rootScope.serialize({
		user_id : $rootScope.user_id,
		auth_token : $rootScope.auth_token,
		id: $scope.artId
	})).success(function(response) {
		//console.log(response);
		if (response.RESPONSE_STATUS == 100) {
			//console.log("获取达人文章数据成功");
			$ionicLoading.hide();
			loadding = false;
			$scope.artData = response.RESPONSE_INFO;

            //微信分享
            $rootScope.wxShare($scope.artData.article.title, $scope.artData.article.title, $scope.artData.article.upfile);

			var a = $scope.artData.article.content;
			$("#Jcon").html(a);
			// console.log($("#Jcon :contains('#推荐商品')").map(function () {
			// 	// console.log($(this).text().indexOf("#推荐商品") == 0);
			// 	if ($(this).html().indexOf("#推荐商品") == 0) {
			// 		return this;
			// 	}
			// }).parents("[id!='Jcon']"));
			//
			//
			//
			var b = $scope.artData.product;
			$("#Jcon :contains('#推荐商品')").map(function () {
				if ($(this).html().indexOf("#推荐商品") != -1 && $(this).children().length == 0) {
					// console.log($(this).children().length);
					return this;
				}
			}).each(function (i,item) {
				var index = parseInt($(item).text().split("#推荐商品")[1].split("#")[0]);
				if (b[index-1]) {
					var itemEle = $("<div>", {
						"class": "t-topman-pro-item",
						html: '<div class="t-topman-pro-pic" style="background-image:url('+b[index-1].upfile+')"></div><div class="t-topman-pro-tit">'+b[index-1].name+'</div><div class="t-topman-pro-tf"><div class="t-topman-pro-tf-price">￥'+b[index-1].price+'</div><div data-id="'+b[index-1].id+'" class="t-topman-pro-tf-collect '+(b[index-1].is_fans ? 't-topman-pro-tf-collect-cur' : '')+'">'+b[index-1].collection+'</div></div><a data-value="false" class="t-topman-pro-xq" href="#/index/find/art/'+b[index-1].id+'">查看详情</a>'
					});
					$(item).replaceWith(itemEle);

					itemEle.find(".t-topman-pro-tf-collect").on("click",function () {
						var that = $(this);
						if (that.hasClass("t-topman-pro-tf-collect-cur")) {
							$ionicLoading.show({
								template: "正在处理..."
							});
							$http({
								url: API.fans_cancel,
								method: "POST",
								headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
								data: $rootScope.serialize({
									user_id : $rootScope.user_id,
									auth_token : $rootScope.auth_token,
									type : 4,
									id : that.attr("data-id")
								})
							}).success(function(response) {
								//console.log(response);
								if (response.RESPONSE_STATUS == 100) {
									$scope.showTips("您已取消收藏");
									that.html(parseInt(that.html())-1).removeClass("t-topman-pro-tf-collect-cur");
									// 清除缓存
									$timeout(function() {
										$ionicHistory.clearCache();
									}, 1000);
								}else {
									$scope.showTips(response.Tips);
								}
							}).error(function() {
								$scope.showTips("取消收藏失败");
							})
						}else {
							$ionicLoading.show({
								template: "正在处理..."
							});
							$http({
								url: API.fans_focus,
								method: "POST",
								headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
								data: $rootScope.serialize({
									user_id : $rootScope.user_id,
									auth_token : $rootScope.auth_token,
									type : 4,
									busines_id : that.attr("data-id")
								})
							}).success(function(response) {
								//console.log(response);
								if (response.RESPONSE_STATUS == 100) {
									$scope.showTips("收藏成功");
									that.html(parseInt(that.html())+1).addClass("t-topman-pro-tf-collect-cur");
									// 清除缓存
									$timeout(function() {
										$ionicHistory.clearCache();
									}, 1000);

								}else {
									$scope.showTips(response.Tips);
								}
							}).error(function() {
								$scope.showTips("收藏失败");
							})
						};
					})

				};
			})

			// 检测所有a链接
			$("#Jcon a").click(function (e) {
				e.preventDefault();
                var is_browser = $(this).attr('data-value');
				var url = $(this).attr("href");
				if (url.indexOf(location.origin) != -1 && url.indexOf("#/index/") != -1) {
					$scope.jumpUrl(url);
				}else {
					if ($rootScope.isWebView) {
                        if (is_browser=='false') {
                            $scope.jumpUrl(url);
                        } else {
                            cordova.InAppBrowser.open(url, '_blank', 'location=yes,toolbarposition=top,closebuttoncaption=返回');
                        }
					}else {
						$scope.jumpUrl(url);
					};
				};
			})



			// 重置标题
			$scope.tabTitle = $scope.artData.article.title;
			sessionStorage["t-talent-art-share"] = $scope.tabTitle;


			if (/MicroMessenger/i.test(navigator.userAgent)) {
				var data = {
					title: $scope.tabTitle,
					link: location.origin + "/www/index.html" + location.hash,
					desc: $scope.tabTitle,
					imgUrl: location.origin + "/www/img/logo.png"
				}
				wx.ready(function() {
					wx.onMenuShareTimeline(data);
					wx.onMenuShareAppMessage(data);
					wx.onMenuShareQQ(data);
					wx.onMenuShareWeibo(data);
					wx.onMenuShareQZone(data);
				});
			}


			// 监测是否收藏这个达人
			$scope.checkCollectTalent($scope.artData.talent.id);
		}else {
			$scope.showTips(response.Tips);
			loadding = false;
		};
	});



	$scope.cmtText = "写评论";

	$scope.reply = function (item) {
		console.log(item);
		var name = item.nickname?item.nickname:$scope.telHide(item.username);
		$scope.cmtText = "回复" + name + "：";
		sessionStorage.t_cmtText = $scope.cmtText;

		// console.log(item.nickname?item.nickname:$scope.telHide(item.username));
	}

	// 看过该片文章的用户
	$http.get(API.talent_article_view_user + "?" + $rootScope.serialize({
			id : $scope.artId,
			page : 1
		})).success(function(response) {
		//console.log(response);
		if (response.RESPONSE_STATUS == 100) {
			console.log("获取看过该片文章的用户成功");
			$scope.hasLookUserData = response.RESPONSE_INFO.user;
			if(Math.floor((window.screen.width-20)/40) < $scope.hasLookUserData.length){
				$scope.number = Math.floor((window.screen.width-20)/50) - 1;
				$scope.toggleImg = 'img/111.png';
				$scope.toggleOpen = true;				
			}
		}else {

		};
	});

	//收藏人展开、收起
	$scope.coolectUserToggle = function(){
		if($scope.number === $scope.hasLookUserData.length){
			$scope.number = Math.floor((window.screen.width-20)/50) -1;
			$scope.toggleImg = 'img/111.png';
		}else{
			$scope.number = $scope.hasLookUserData.length;
			$scope.toggleImg = 'img/222.png';
		}
	}


	// 加载评论
	$scope.loadText = "点击加载更多";
	$scope.itemsData = [];
	// 初始化参数 | currentPage：第几页 | pageCount：总页数 |　itemCount：数据总条数
	var currentPage = 0;
	$scope.itemCount = 0;
	var pageCount = 1;

	$scope.loadMoreData = function() {
		if (currentPage < pageCount) {
			currentPage++;
			$scope.loadText = "正在加载中";

			$http.get(API.talent_article_comment_list + "?" + $rootScope.serialize({
				page : currentPage,
				id: $scope.artId
			})).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					//console.log("获取评论数据成功");
					pageCount = response.RESPONSE_INFO.page.pageCount;
					$scope.itemCount = response.RESPONSE_INFO.page.itemCount;
					var data = response.RESPONSE_INFO.comment;
					for (var i = 0; i < data.length; i++) {
						$scope.itemsData.push(data[i]);
					};
					// if (currentPage > 1) {
					// 	$ionicScrollDelegate.$getByHandle('myScroll').resize();
					// };

					if (currentPage < pageCount) {
						$scope.loadText = "点击加载更多";
					}else {
						$scope.loadText = "没有更多数据了";
					};
				}else {
					//console.log("获取评论数据失败");
					$scope.showTips(response.Tips);
				};
			});

		}else {
			$scope.loadText = "没有更多数据了";
		};
	};
	// 第一次加载
	$scope.loadMoreData();




	// 收藏达人
	$scope.value = '<i class="ion-plus-round"></i>关注';
	$scope.collectTalent = function () {
		$ionicLoading.show({
			template: "正在处理..."
		});
		var that = this;
		if (that.value == "已关注") {
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 1,
					id : $scope.artData.talent.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消关注");
					that.value = '<i class="ion-plus-round"></i>关注';
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消关注失败");
			})
		}else {
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 1,
					busines_id : $scope.artData.talent.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("关注成功");
					that.value = '已关注';
				}else {
					if (response.Tips == "你已关注过这个达人了") {
						that.value = '已关注';
					};
					$scope.showTips(response.Tips);
				}
				// 清除缓存
				$timeout(function() {
					$ionicHistory.clearCache();
				}, 1000);
			}).error(function() {
				$scope.showTips("关注不成功");
			})
		};
	}

	// 监测是否收藏这个达人
	$scope.checkCollectTalent = function (id) {
		$http({
			url: API.fans_check,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				type : 1,
				id : id
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				console.log("检测成功");
				if (parseInt(response.RESPONSE_INFO.fans.is_fans)) {
					$scope.value = '已关注';
				}
			}
		}).error(function() {
			console.log("检测不成功");
		})
	}






	// 点赞文章
	$scope.isCollectArt = false;
	$scope.collectArt = function () {
		if ($scope.isCollectArt == false) {
			$ionicLoading.show({
				template: "请稍候..."
			});
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 5,
					busines_id : $scope.artId
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("点赞成功");
					$scope.isCollectArt = true;
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("点赞不成功");
			})
		}else {
			$ionicLoading.show({
				template: "请稍候..."
			});
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 5,
					id : $scope.artId
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消点赞");
					$scope.isCollectArt = false;
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消点赞失败");
			})
		};
	}

	// 监测是否点赞文章
	$scope.checkCollectArt = function () {
		$http({
			url: API.fans_check,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				type : 5,
				id : $scope.artId
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				console.log("检测文章是否点赞成功");
				if (parseInt(response.RESPONSE_INFO.fans.is_fans)) {
					$scope.isCollectArt = true;
				}else {
					$scope.isCollectArt = false;
				};
			}else {
				$scope.isCollectArt = false;
			}
		}).error(function() {
			$scope.isCollectArt = false;
			console.log("检测文章是否点赞不成功");
		})
	}
	$scope.checkCollectArt();








	// 收藏商品
	$scope.collectPro = function (obj) {
		if (obj.is_fans == 1) {
			$ionicLoading.show({
				template: "正在处理..."
			});
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消收藏");
					obj.is_fans = 0;
					obj.collection--;
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消收藏失败");
			})
		}else {
			$ionicLoading.show({
				template: "正在处理..."
			});
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					busines_id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("收藏成功");
					obj.is_fans = 1;
					obj.collection++;
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("收藏失败");
			})
		};
	}

	// 跳评论
	$scope.gotocmt = function() {
		if (!$rootScope.isLoged) {
			$scope.showTips("您还未登录，请先登录");
		} else {
			$state.go("index.find-talent-art-comment", {
				id: $scope.artId
			});
		};
	}

})

// 达人文章评论
ctrlApp.controller("ctrlFindTalentArtComment", function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup) {
	//console.log("ctrlFindTalentArtComment");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.disableScroll(true);
    }

	$scope.artId = $state.params.id
	$scope.dataObject = {
		content: ""
	};
	//console.log(sessionStorage.t_cmtText);
	// console.log(localStorage.t_scan == undefined);
	$scope.dataObject.content = sessionStorage.t_cmtText ? sessionStorage.t_cmtText : "";
	//console.log($scope.dataObject.content);
	sessionStorage.removeItem("t_cmtText");

	// 发表评论
	$scope.postCmt = function () {
		console.log($scope.dataObject.content);
		if ($scope.dataObject.content == "") {
			$ionicLoading.show({
				duration: "800",
				template: "请输入您的评论"
			});
		} else {
			$ionicLoading.show({
				template: "正在处理..."
			});
			$http({
				url: API.talent_article_comment_create,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					article_id : $scope.artId,
					content : $scope.dataObject.content
				})
			}).success(function(response) {

				$ionicLoading.hide();
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您的评论已经成功提交。");
					setTimeout(function () {
						$state.go("index.find-talent-art",{id:$scope.artId});
					},1500)
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$ionicLoading.hide();
				//console.log("发表评论失败");
			})
		}
	}
})



/*搜索*/
ctrlApp.controller("ctrlFindSearch", function($scope, $state, $http, $ionicLoading, $rootScope, $ionicPopup) {
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});	
    $scope.isSearch = false;
    $scope.isEmpty = true;
    $scope.keyword = $state.params.text;
    $scope.searchHistory = localStorage['w-search-history'] ? JSON.parse(localStorage['w-search-history']) : [];
    $scope.$watch('$viewContentLoaded', function() {
        Utils.search();
    });
    // document.getElementById('_keyword').oninput = function (e) {
    //     console.log(e);
    // }
    var Utils = {};
    Utils.post = function(url, params, callback,err) {
        params.user_id = $rootScope.user_id;
        params.auth_token = $rootScope.auth_token;
        $http({
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            url: url,
            data: $rootScope.serialize(params)
        }).success(function(response) {
            if (response.RESPONSE_STATUS == 100) {
                callback && callback(response.RESPONSE_INFO);
            }else {
            	err && err(response)
            }
        })
    }
        // 用户收藏
    Utils.focus = function(type, id, callback) {
        // 1达人2景点3商家4商品5文章
        Utils.post(API.fans_focus, {
            type: type,
            busines_id: id
        }, callback,function (response) {
        	$scope.showTips(response.Tips);
        });
    }
        // 取消收藏
    Utils.cancel = function(type, id, callback) {
        Utils.post(API.fans_cancel, {
            type: type,
            id: id
        }, callback);
    }
        // 判断是否收藏
    Utils.check = function(params, callback) {
        Utils.post(API.fans_check, params, callback);
    }
    // 执行搜索
    Utils.search = function () {    	
        var keyword = $scope.keyword;
        var pages = {
        	scenic : 1,
        	article : 1,
        	talent : 1,
        	store : 1,
        	product : 1
        }
        if (!keyword) {
            $('.Jinput').val('');
            return;
        };


        var idx = $scope.searchHistory.indexOf(keyword);
        if (idx != -1) {
            $scope.searchHistory.splice(idx, 1);
        }
        $scope.searchHistory.unshift(keyword);
        if ($scope.searchHistory.length > 5) {
            $scope.searchHistory.pop();
        }
        localStorage['w-search-history'] = JSON.stringify($scope.searchHistory);

        var doSearch = function(type) {
            var url = API['search_' + type] + '?keyword=' + keyword + '&page=' + pages[type];
            $http.get(url).success(function(response) {
                $('.Jinput').val(keyword);
                if (response.RESPONSE_INFO.page.itemCount != 0) {
                    $scope.isEmpty = false;
                }
                if (response.RESPONSE_INFO.page.currentPage == 1) {
                    $scope[type + 'Data'] = response.RESPONSE_INFO;
                }else {
                    $scope[type + 'Data'][type] = $scope[type + 'Data'][type].concat(response.RESPONSE_INFO[type]);
                }
                $scope[type + 'Data'].page.currentPage = response.RESPONSE_INFO.page.currentPage;

                if (type=='product') {
                    check_isfan();
                }

                $scope.isSearch = true;
            });
        }

        for (var i in pages) {
        	doSearch(i);
        }

        $scope.getMore = function (type) {
        	pages[type] ++ ;
        	doSearch(type);
        }

        function check_isfan() {
            var product = $scope.productData.product;
            for (var i = 0, len = product.length; i < len; i++) {
            	$scope.productData.product[i].is_fans = '0';
                (function(m) {
                    var p = product[m];
                    Utils.check({
                        type: 4,
                        id: p.id
                    }, function(ret) {
                        $scope.productData.product[m].is_fans = ret.fans.is_fans;
                    })
                })(i);
            }
        }

    }
        // 产品收藏
    $scope.focus = function(item) {
        // 已收藏
        if (item.is_fans == '1') {
            Utils.cancel(4, item.id, function(ret) {
                item.collection--;
                item.is_fans = '0';
            })
        } else {
            Utils.focus(4, item.id, function(ret) {
                item.collection++;
                item.is_fans = '1';
            })
        }
    }
    $scope.search = function () {
        var keyword = '';
        var $inp = $('[nav-bar="active"]').find('.Jinput');
        keyword = $inp.get(0).value;
        // $inp.each(function (e) {
        //     if (this.value) {
        //         keyword = this.value;
        //     }
        // })
        if (!keyword) return;
        location.href = '#/index/search/'+keyword;
    }
    // $scope.search = function(keyword) {
        // var inp = document.getElementById('_keyword');
        // var keyword = keyword || inp.value;
        // if (keyword == '') return;
        // inp.value = keyword;
        // $scope.isSearch = true;
        // var idx = $scope.searchHistory.indexOf(keyword);
        // if (idx != -1) {
        //     $scope.searchHistory.splice(idx, 1);
        // }
        // $scope.searchHistory.unshift(keyword);
        // if ($scope.searchHistory.length > 5) {
        //     $scope.searchHistory.pop();
        // }
        // localStorage['w-search-history'] = JSON.stringify($scope.searchHistory);
        // // 景点搜索
        // $http.get(API.search_scenic + "?keyword=" + keyword).success(function(response) {
        //     $scope.scenicData = response.RESPONSE_INFO;
        // });
        // // 文章搜索
        // $http.get(API.search_article + "?keyword=" + keyword).success(function(response) {
        //     $scope.articleData = response.RESPONSE_INFO;
        // });
        // // 达人搜索
        // $http.get(API.search_talent + "?keyword=" + keyword).success(function(response) {
        //     $scope.talentData = response.RESPONSE_INFO;
        // });
        // // 商家搜索
        // $http.get(API.search_store + "?keyword=" + keyword).success(function(response) {
        //     $scope.storeData = response.RESPONSE_INFO;
        // });
        // // 产品搜索
        // $http.get(API.search_product + "?keyword=" + keyword).success(function(response) {
        //     $scope.productData = response.RESPONSE_INFO;
        //     var product = response.RESPONSE_INFO.product;
        //     for (var i = 0, len = product.length; i < len; i++) {
        //         (function(m) {
        //             var p = product[m];
        //             Utils.check({
        //                 type: 4,
        //                 id: p.id
        //             }, function(ret) {
        //                 $scope.productData.product[m].is_fans = ret.fans.is_fans;
        //             })
        //         })(i);
        //     }
        // });
    // }
    //
})


// 商家主页
ctrlApp.controller("ctrlFindShop", function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup) {

	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

	var loadding = true;
	$ionicLoading.show({
		template: "数据正在加载中..."
	});
	setTimeout(function () {
		if (loadding) {
			$scope.showTips("请检查网络或者稍后再试！");
		};
	},8000);

	$scope.shopId = $state.params.id;

	// 获取商家数据
	$http.get(API.store_view + "?" + $rootScope.serialize({
			user_id : $rootScope.user_id,
			auth_token : $rootScope.auth_token,
			id : $scope.shopId
		})).success(function(response) {
		//console.log(response);
		if (response.RESPONSE_STATUS == 100) {
			$ionicLoading.hide();
			loadding = false;
			//console.log("获取商家数据成功");

			$scope.storeData_custom = response.RESPONSE_INFO.store_custom;
			if ($scope.storeData_custom.length==0) {

				$scope.storeData = response.RESPONSE_INFO.store;

                //微信分享
                $rootScope.wxShare($scope.storeData.name, $scope.storeData.name, $scope.storeData.upfile);
				
				// 初始化参数 | currentPage：第几页 | pageCount：总页数 |　itemCount：数据总条数				

				$scope.loadMoreData = function() {
					if ($scope.currentPage < $scope.pageCount) {
						$scope.currentPage++;
						$scope.loadText = "正在加载中";

						// 获取最新商品
						$http.get(API.store_product + "?" + $rootScope.serialize({
							user_id: $rootScope.user_id,
							auth_token: $rootScope.auth_token,
							id:$scope.shopId,
							type:$scope.type,
							page:$scope.currentPage
						})).success(function(response) {
							//console.log(response);
							if (response.RESPONSE_STATUS == 100) {
								console.log("获取数据成功");
								$ionicLoading.hide();
								$scope.pageCount = response.RESPONSE_INFO.page.pageCount;
								$scope.itemCount = response.RESPONSE_INFO.page.itemCount;
								var data = response.RESPONSE_INFO.product;
								for (var i = 0; i < data.length; i++) {
									$scope.itemsData.push(data[i]);
								};

								if ($scope.currentPage < $scope.pageCount) {
									$scope.loadText = "点击加载更多";
								}else {
									$scope.loadText = "没有更多数据了";
								};
							}else {
								console.log("获取数据失败");
								$scope.showTips(response.Tips);
							};
							$scope.$broadcast('scroll.infiniteScrollComplete');
						});
					}else {
						$scope.loadText = "没有更多数据了";
					};
				};


				// 排序类型，1最新2销量3价格下4价格上				
				$scope.getProductData = function (type) {
					$scope.type = type;
					$scope.loadText = "点击加载更多";
					$scope.itemsData = [];
					$scope.currentPage = 0;
					$scope.itemCount = 0;
					$scope.pageCount = 1;
					$scope.loadMoreData();

				}

				$scope.getPriceProductData = function () {
					if ($scope.type != 4) {
						$scope.type = 4;
					}else if ($scope.type == 4) {
						$scope.type = 3;
					};
					$scope.loadText = "点击加载更多";
					$scope.itemsData = [];
					$scope.currentPage = 0;
					$scope.itemCount = 0;
					$scope.pageCount = 1;
					$scope.loadMoreData();
				}
				$scope.getProductData(1);
			}else {
				// 处理导航
				$scope.classifyData = [];
				var a = 1;
				for (var i = 0; i < $scope.storeData_custom.length; i++) {
					if ($scope.storeData_custom[i].type == "3") {
						if (a==1) {
							$scope.storeData_custom[i].show = 1;
						};
						a++;
						$scope.classifyData.push($scope.storeData_custom[i]);
					};
				};
				for (var i = 0; i < $scope.classifyData.length; i++) {
					if ($scope.classifyData[i].ids[0].id != "") {
						$scope.classifyData[i].ids[0].href = "#/index/find/art/" + $scope.classifyData[i].ids[0].id;
					}else if ($scope.classifyData[i].ids[0].class_third != "") {
						$scope.classifyData[i].ids[0].href = "#/index/find/shop/classify/" + $scope.classifyData[i].ids[0].class_third;
					}else if ($scope.classifyData[i].ids[0].class_second != "") {
						$scope.classifyData[i].ids[0].href = "#/index/find/shop/classify/" + $scope.classifyData[i].ids[0].class_second;
					}else if ($scope.classifyData[i].ids[0].class_first != "") {
						$scope.classifyData[i].ids[0].href = "#/index/find/shop/classify/" + $scope.classifyData[i].ids[0].class_first;
					}else {
						$scope.classifyData[i].ids[0].href = "#/index/find";
					};;
				};
			}


		}else {
			$scope.showTips(response.Tips);
			loadding = false;
		};
	});



	// 收藏商品
	$scope.collectPro = function (obj) {
		if (obj.is_fans == 1) {
			$ionicLoading.show({
				template: "正在处理..."
			});
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消收藏");
					obj.is_fans = 0;
					obj.collection--;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("取消收藏失败");
			})
		}else {
			$ionicLoading.show({
				template: "正在处理..."
			});
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					busines_id : obj.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("收藏成功");
					obj.is_fans = 1;
					obj.collection++;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("收藏失败");
			})
		};
	}





	// 收藏商家
	$scope.isCollectShop = false;
	$scope.collectShop = function () {
		if ($scope.isCollectShop == false) {
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 3,
					busines_id : $scope.shopId
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("收藏成功");
					$scope.isCollectShop = true;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				console.log("收藏不成功");
			})
		}else {
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 3,
					id : $scope.shopId
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消收藏");
					$scope.isCollectShop = false;
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				console.log("取消收藏失败");
			})
		};
	}

	// 监测是否收藏这个商家
	$scope.checkCollectShop = function () {
		$http({
			url: API.fans_check,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				type : 3,
				id : $scope.shopId
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				console.log("检测成功");
				if (parseInt(response.RESPONSE_INFO.fans.is_fans)) {
					$scope.isCollectShop = true;
				}else {
					$scope.isCollectShop = false;
				};
			}else {
				$scope.isCollectShop = false;
			}
		}).error(function() {
			$scope.isCollectShop = false;
			console.log("检测不成功");
		})
	}
	$scope.checkCollectShop();

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


// 商品详情
ctrlApp.controller("ctrlFindArt", function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup,$ionicHistory,$ionicSlideBoxDelegate,$ionicScrollDelegate,$timeout,$location,$filter) {
	//console.log("ctrlFindArt");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

	var loadding = true;
	$ionicLoading.show({
		template: "数据正在加载中..."
	});
	setTimeout(function () {
		if (loadding) {
			$scope.showTips("请检查网络或者稍后再试！");
		};
	},8000);

	$scope.proId = $state.params.id;
	$scope.init = true;

	// 如果有上一页,并且上一页是达人文章,则记录下该篇达人文章id
	$scope.talentArticleId = "";
	if ($ionicHistory.viewHistory().backView != null && $ionicHistory.viewHistory().backView.stateName == "index.find-talent-art") {
		if ($ionicHistory.viewHistory().backView.stateName == "index.find-talent-art") {
			$scope.talentArticleId = $ionicHistory.viewHistory().backView.url.split("/index/find/talent/art/")[1];
		};

		// 如果是从达人文章的热门产品过来的，则不传达人文章id
		if ($state.params.id.indexOf("hot-")!=-1) {
			$scope.proId = $state.params.id.split("hot-")[1];
			$scope.talentArticleId = "";
		};
	};

	// 获取商品数据
	$http.get(API.product_view + "?" + $rootScope.serialize({
			user_id : $rootScope.user_id,
			auth_token : $rootScope.auth_token,
			article_id : $scope.talentArticleId,
			id : $scope.proId
		})).success(function(response) {
		//console.log(response);
		if (response.RESPONSE_STATUS == 100) {
			$ionicLoading.hide();
			loadding = false;
			//console.log("获取商品数据成功");
			$scope.proData = response.RESPONSE_INFO;

            //微信分享朋友
            $rootScope.wxShare($scope.proData.product.name, $scope.proData.product.name, $scope.proData.product.share_image);

			// 选择样式
			$scope.selectTypeId = "";
			// 如只有一种款式，则默认选中该款式
			if ($scope.proData.style.length == 1) {
				$scope.selectTypeId = $scope.proData.style[0].id;
				$scope.leftNum = parseInt($scope.proData.style[0].num);
			};

			// 重置标题
			setTimeout(function () {
				document.title = $scope.proData.product.name;
			},200);

			$ionicSlideBoxDelegate.update();
			$ionicSlideBoxDelegate.loop(true);
			$scope.checkCollectShop();

		}else {
			$scope.showTips(response.Tips);
			loadding = false;
		};
	});


	// 获取收藏过的用户
	$http.get(API.fans_list_fans + "?" + $rootScope.serialize({
			type : 4,
			id : $scope.proId,
			page : 1
		})).success(function(response) {
		//console.log(response);
		if (response.RESPONSE_STATUS == 100) {
			console.log("获取获取收藏过的用户成功");
			$scope.collectUserData = response.RESPONSE_INFO.user;
			if(Math.floor((window.screen.width-20)/40) < $scope.collectUserData.length){
				$scope.number = Math.floor((window.screen.width-20)/50) - 1;
				$scope.toggleImg = 'img/111.png';
				$scope.toggleOpen = true;				
			}
			// $scope.collectPageData = response.RESPONSE_INFO.page;
		}else {

		};
	});

	//收藏人展开、收起
	$scope.coolectUserToggle = function(){
		if($scope.number === $scope.collectUserData.length){
			$scope.number = Math.floor((window.screen.width-20)/50) -1;
			$scope.toggleImg = 'img/111.png';
		}else{
			$scope.number = $scope.collectUserData.length;
			$scope.toggleImg = 'img/222.png';
		}
	}


	// 显示隐藏款式和参数和数量
	$scope.isShowType = true;
	$scope.toggleType = function () {
		$scope.isShowType = !$scope.isShowType;
		fff();
	}
	$scope.isShowOption = true;
	$scope.toggleOption = function () {
		$scope.isShowOption = !$scope.isShowOption;
		fff();
	}
	$scope.isShowNum = true;
	$scope.toggleNum = function () {
		$scope.isShowNum = !$scope.isShowNum;
		fff();
	}

	// 用户选择的数量
	$scope.num = 1;
	$scope.leftNum = 0;
	// 加
	$scope.add = function() {
		if ($scope.selectTypeId == "") {
			$ionicLoading.show({
				duration: "1500",
				template: "请先选择款式"
			});
		}else {
			if ($scope.num >= $scope.leftNum) {
				$ionicLoading.show({
					duration: "1500",
					template: "库存不够"
				});
			}else {
				$scope.num++
			};

		}
	}
	// 减
	$scope.minus = function() {
		if ($scope.selectTypeId == "") {
			$ionicLoading.show({
				duration: "1500",
				template: "请先选择款式"
			});
		}else {
			if ($scope.num > 1) {
				$scope.num--;
			};
		}
	}


	// $scope.infinite = true;
	$scope.tabshow = true;		
	// 详情和评论切换
	// $scope.isShowXQ = false;
	$scope.ShowXQ = function(num) {				
		if (num == 1) {
			// $scope.isShowXQ = true;			
			// $scope.tabshow = false;
			// $scope.infinite = false;
			// $("#JtopTab a").eq(0).removeClass("cur");
			// $("#JtopTab a").eq(1).addClass("cur");			
			// setTimeout("$('#xScroll').scrollTop(1105);",300);//延时0.3秒 
			var scroHeight = $("#JmainScroll").height();
			// console.log(scroHeight);
			$ionicScrollDelegate.scrollTo(0,scroHeight);
		}else if(num == 0){			
			
			// $scope.isShowXQ = false;
			//$scope.tabshow = true;
			// $("#JtopTab a").eq(0).addClass("cur");
			// $("#JtopTab a").eq(1).removeClass("cur");
			//$scope.infinite = true;					
			

			//返回顶部
			// $ionicScrollDelegate.scrollTo(0,0);		
			$ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
		};		
		$scope.tabshow = num;

		/*if($scope.tabshow != $scope.tabshow){
			alert("aa");
			$ionicScrollDelegate.scrollTop();
		}*/
	}

	$scope.isQieHuan = true;
	function fff() {
		if ($scope.isShowType && $scope.isShowOption && $scope.isShowNum) {
			$scope.isQieHuan = true;
		}else {
			$scope.isQieHuan = false;
		};
	}
	// $scope.loadMore = function(){
	// 	$scope.ShowXQ(1);		
	// }
	$scope.onscroll = function(){
		if(!$scope.init){			
			var JmainScroll = document.getElementById("JmainScroll");					
			var b = JmainScroll.scrollHeight - JmainScroll.clientHeight;		
			var con = $ionicScrollDelegate.$getByHandle('mainScroll').getScrollPosition().top;
			var clientHeight = $ionicScrollDelegate._instances[0].element.clientHeight;		
			var num = clientHeight + parseInt(con);	
			// console.log(JmainScroll.scrollHeight+ ","+num+","+con);	
			if(JmainScroll.scrollHeight-num<100){			
				// $("#JtopTab a").eq(1).addClass("cur");
				// $("#JtopTab a").eq(0).removeClass("cur");				
				$scope.tabshow = 1;				
			}
			else{
				// $("#JtopTab a").eq(0).addClass("cur");
				// $("#JtopTab a").eq(1).removeClass("cur");
				$scope.tabshow = 0;
				
			}		
			$scope.$evalAsync();
			// console.log($scope.tabshow);
		}else{
			$scope.init = false;

		}		
	}	

	// 如果是最后一屏跳到第一 则跳到详情页
	var last = 0;
	$scope.slideHasChanged = function (index) {
		if (index == 0 && last == $scope.proData.product.upfile.length-1) {
			// $scope.ShowXQ(1);
		};
		last = index;
	}


	// 选择样式
	$scope.selectType = function (id,num) {
		$scope.num = 1;
		$scope.leftNum = num;
		// 如果没货了
		if (num == 0) {

		}else {
			$scope.selectTypeId = id;
		};
	}
	// 加入购物车
	$scope.addCart = function () {

		// 监测是否登录
		if (!$rootScope.isLoged) {
			$scope.showTips("您还未登录，请先登录");
			return false;
		};

		if ($scope.selectTypeId == "") {
			$ionicLoading.show({
				duration: "1500",
				template: "请先选择款式"
			});
		}else {
			$http({
				url: API.cart_addcart,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
                    type: 1, //普通加入购入车
                    product_id: $scope.proId,
					style_id : $scope.selectTypeId,
					article_id : $scope.talentArticleId,
					num : $scope.num
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.cartNum = $scope.cartNum + $scope.num;

					$ionicLoading.show({
						duration: "1500",
						template: "您已成功将该商品加入购物车"
					});

				}else {
					$scope.showTips(response.Tips);
				}

			}).error(function() {
				console.log("error");
			})

		};
	}

	$scope.buyThing = function (product_id,selectTypeId,num) {
		// 先把商品添加进购物车
		$http({
			url: API.cart_addcart,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
                type: 2, // 立即购买
                product_id: product_id,
				style_id : selectTypeId,
				article_id : $scope.talentArticleId,
				num : num
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				// 跳到订单确认页
				//console.log(response.RESPONSE_INFO.id,$scope.num);
				localStorage.t_wantToBuyIds = response.RESPONSE_INFO.id;
				localStorage.t_wantToBuyNums = $scope.num;
				$state.go("index.find-order");
			}else {
				$scope.showTips(response.Tips);
			}

		}).error(function() {
			console.log("error");
		})
	}

	// 如果有记录买东西的cookie , 则调用购买流程
	if (sessionStorage.t_buyHistory) {
		var historyObj = JSON.parse(sessionStorage.t_buyHistory);
		sessionStorage.removeItem("t_buyHistory");
		$scope.buyThing($scope.proId,historyObj.style_id,historyObj.num);
	}

    // 马上购买
    $scope.buy = function () {
        if ($scope.selectTypeId == "") {
            $ionicLoading.show({
                duration: "1500",
                template: "请先选择款式"
            });
        }else {
            // 监测是否登录
            if (!$rootScope.isLoged) {
                sessionStorage.setItem("t_buyHistory", JSON.stringify({
                    style_id : $scope.selectTypeId,
                    num : $scope.num
                }));
                $scope.showTips("您还未登录，请先登录");
                return false;
            };

            $scope.buyThing($scope.proId, $scope.selectTypeId, $scope.num);
        }
    }

	$scope.cartData = [];
	$scope.cartNum = 0;
	// 获取购物车数据
	function getCartData(callback) {
		$http({
			url: API.cart_index,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				//console.log("获取购物车商品数量成功");
				$scope.cartData = response.RESPONSE_INFO.data;
				// 获取购物车商品数量
				for (var i = 0; i < $scope.cartData.length; i++) {
					var pros = $scope.cartData[i].product;
					for (var j = 0; j < pros.length; j++) {
						$scope.cartNum = $scope.cartNum + parseInt(pros[j].num);
					};
				};
				if (typeof(callback) != "undefined" && typeof(callback) == "function") {
					callback();
				};
			}
		})
	}
	getCartData();




	// 收藏商家
	$scope.isCollectShop = false;
	$scope.collectShop = function () {
		// 监测是否登录
		if (!$rootScope.isLoged) {
			$scope.showTips("您还未登录，请先登录");
			return false;
		};
		
		if ($scope.isCollectShop == false) {
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 3,
					busines_id : $scope.proData.store.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("收藏成功");
					$scope.proData.store.favorite_counts = parseInt($scope.proData.store.favorite_counts) + 1;
					$scope.isCollectShop = true;
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				console.log("收藏不成功");
			})
		}else {
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 3,
					id : $scope.proData.store.id
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消收藏");
					$scope.proData.store.favorite_counts = parseInt($scope.proData.store.favorite_counts) - 1;
					$scope.isCollectShop = false;
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				console.log("取消收藏失败");
			})
		};

	}
	// 监测是否收藏这个商家
	$scope.checkCollectShop = function () {
		$http({
			url: API.fans_check,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				type : 3,
				id : $scope.proData.store.id
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {

				//console.log("检测成功");
				if (parseInt(response.RESPONSE_INFO.fans.is_fans)) {
					$scope.isCollectShop = true;
				}else {
					$scope.isCollectShop = false;
				};
			}else {
				$scope.isCollectShop = false;
			}
		}).error(function() {
			$scope.isCollectShop = false;
			console.log("检测不成功");
		})
	}

	// 收藏商品
	$scope.isCollectPro = false;
	$scope.collectPro = function () {
		// 监测是否登录
		if (!$rootScope.isLoged) {
			$scope.showTips("您还未登录，请先登录");
			return false;
		};

		// 清除缓存
		$timeout(function() {
			$ionicHistory.clearCache();
		}, 1000);

		if ($scope.isCollectPro == false) {
			$http({
				url: API.fans_focus,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					busines_id : $scope.proId
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("收藏成功");
					$scope.proData.product.collection++;
					$scope.isCollectPro = true;
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				console.log("收藏不成功");
			})
		}else {
			$http({
				url: API.fans_cancel,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					type : 4,
					id : $scope.proId
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已取消收藏");
					$scope.proData.product.collection--;
					$scope.isCollectPro = false;
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
					}, 1000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				console.log("取消收藏失败");
			})
		};

	}
	// 监测是否收藏这个商品
	$scope.checkCollectPro = function () {
		$http({
			url: API.fans_check,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				type : 4,
				id : $scope.proId
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				//console.log("检测成功");
				if (parseInt(response.RESPONSE_INFO.fans.is_fans)) {
					$scope.isCollectPro = true;
				}else {
					$scope.isCollectPro = false;
				};
			}else {
				$scope.isCollectPro = false;
			}
		}).error(function() {
			$scope.isCollectPro = false;
			//console.log("检测不成功");
		})
	}
	$scope.checkCollectPro();

	// 加载评论
	$scope.loadText = "点击加载更多";
	$scope.itemsData = [];
	// 初始化参数 | currentPage：第几页 | pageCount：总页数 |　itemCount：数据总条数
	var currentPage = 0;
	$scope.itemCount = 0;
	var pageCount = 1;

	$scope.loadMoreData = function() {
		if (currentPage < pageCount) {
			currentPage++;
			$scope.loadText = "正在加载中";

			$http.get(API.product_comment_list + "?" + $rootScope.serialize({
				page : currentPage,
				id: $scope.proId
			})).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					//console.log("获取评论数据成功");
					pageCount = response.RESPONSE_INFO.page.pageCount;
					$scope.itemCount = response.RESPONSE_INFO.page.itemCount;
					var data = response.RESPONSE_INFO.comment;
					for (var i = 0; i < data.length; i++) {
						$scope.itemsData.push(data[i]);  
					};

					if (currentPage < pageCount) {
						$scope.loadText = "点击加载更多";
					}else {
						$scope.loadText = "没有更多数据了";
					};
					$scope.ShowXQ(0);
				}else {
					//console.log("获取评论数据失败");
					$scope.showTips(response.Tips);
				};
			});

		}else {
			$scope.loadText = "没有更多数据了";
		};
	};
	// 第一次加载
	$scope.loadMoreData();	
	// 评论切换
	$scope.isShowCmt = false;
	$scope.showCmt = function() {
		$scope.isShowCmt = !$scope.isShowCmt;
	}
})

// 购物车
ctrlApp.controller("ctrlFindCart", function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup) {
	//console.log("ctrlFindCart");

	// $scope.$on('$ionicView.enter', function() {
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});




		var loadding = true;
		$ionicLoading.show({
			template: "数据正在加载中..."
		});
		setTimeout(function () {
			if (loadding) {
				$scope.showTips("请检查网络或者稍后再试！");
			};
		},8000);





		// 监测是否登录
		if (!$rootScope.isLoged) {
			$scope.showTips("您还未登录 功能暂不可用");
			loadding = false;
		};




		// 购物车数据
		$scope.cartData = [];
		// 想要买的东西
		$scope.wantToBuyData = [];
		// 想要买的东西的价格
		$scope.wantToBuyPrice = 0;


		// 获取购物车数据
		function getCartData(callback) {
			$http({
				url: API.cart_index,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$ionicLoading.hide();
					loadding = false;
					$scope.cartData = response.RESPONSE_INFO.data;
					// 如果购物车没东西，显示空空如也
					$scope.isCartDataNone = ($scope.cartData.length == 0 ? true : false);
					// 初始化添加checked参数
					for (var i = 0; i < $scope.cartData.length; i++) {
						$scope.cartData[i].checked = false;
						var pros = $scope.cartData[i].product;
						for (var j = 0; j < pros.length; j++) {
							pros[j].checked = false;
						};
					};
					if (typeof(callback) != "undefined" && typeof(callback) == "function") {
						callback();
					};
				}else {
					$scope.showTips(response.Tips);
					loadding = false;
				}

			}).error(function() {
				console.log("error");
			})
		}
		getCartData();

		// 购物车数据
		// $scope.cartData = [{
		// 	"name": "旗舰店",
		// 	"img": "http://temp.im/400x400",
		// 	"id": 124856,
		// 	"product": [{
		// 		"name": "水果1水果1水果1水果1水果1水果1水果1水水果1水果1水果1水果1水果1",
		// 		"img":"http://temp.im/400x400",
		// 		"des": "古代宫廷灯",
		// 		"num": 10,
		// 		"price": 17.5
		// 	}, {
		// 		"name": "水果1",
		// 		"img":"http://temp.im/400x400",
		// 		"des": "古代宫廷灯",
		// 		"num": 1,
		// 		"price": 17.5
		// 	}]
		// }];

		// 计算多少东西多少钱
		function dealCartData() {
			$scope.wantToBuyData = [];
			$scope.wantToBuyPrice = 0;
			for (var i = 0; i < $scope.cartData.length; i++) {
				if ($scope.cartData[i].checked) {
					var pros = $scope.cartData[i].product;
					for (var j = 0; j < pros.length; j++) {
						if (pros[j].checked) {
							$scope.wantToBuyData.push(pros[j]);
						};
					};
				}
			};
			//console.log($scope.wantToBuyData);
			for (var i = 0; i < $scope.wantToBuyData.length; i++) {
				$scope.wantToBuyPrice += $scope.wantToBuyData[i].num*$scope.wantToBuyData[i].price;
			};
		};

		// 点击商家时执行
		$scope.dealShopCheckbox = function (obj) {
			// 选中商家所有商品或者全不选
			var pros = obj.item.product;
			for (var j = 0; j < pros.length; j++) {
				pros[j].checked = obj.item.checked;
			};
			$scope.isSelectAllCartDataFun();
			// 计算
			dealCartData();
		}

		// 点击checkbox时执行
		$scope.dealProCheckbox = function (obj) {
			// 如果选中商品，则商家也选中
			if (obj.proItem.checked) {
				obj.$parent.item.checked = true;
			}else {
				// 如果商家的商品都没选，则商家也不选
				var pros = obj.$parent.item.product;
				var count = 0;
				for (var i = 0; i < pros.length; i++) {
					if (pros[i].checked == false) {
						count++;
					};
				};
				if (count ==  pros.length) {
					obj.$parent.item.checked = false;
				};
			};
			$scope.isSelectAllCartDataFun();
			// 计算
			dealCartData();
		}

		// 加
		$scope.add = function(obj,$event) {
			obj.proItem.num++
			// 计算
			dealCartData();
			if (typeof(setTimeAdd)!="undefined") {
				clearTimeout(setTimeAdd);
			};
			setTimeAdd = setTimeout(function () {
				// 更新商品数量
				$http({
					url: API.cart_update,
					method: "POST",
					headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
					data: $rootScope.serialize({
						id : obj.proItem.id,
						num : obj.proItem.num,
						user_id : $rootScope.user_id,
						auth_token : $rootScope.auth_token
					})
				}).success(function(response) {
					//console.log(response);
					if (response.RESPONSE_STATUS == 100) {

					}else {
						$scope.showTips(response.Tips);
					}
				}).error(function() {
					console.log("error");
				})
			},500);
		}
		// 减
		$scope.minus = function(obj,$event) {
			if (obj.proItem.num > 1) {
				obj.proItem.num--;
				dealCartData();

				if (typeof(setTimeMinus)!="undefined") {
					clearTimeout(setTimeMinus);
				};
				setTimeMinus = setTimeout(function () {
					// 更新商品数量
					$http({
						url: API.cart_update,
						method: "POST",
						headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
						data: $rootScope.serialize({
							id : obj.proItem.id,
							num : obj.proItem.num,
							user_id : $rootScope.user_id,
							auth_token : $rootScope.auth_token
						})
					}).success(function(response) {
						//console.log(response);
						if (response.RESPONSE_STATUS == 100) {

						}else {
							$scope.showTips(response.Tips);
						}
					}).error(function() {
						console.log("error");
					})
				},500);

			};

		}







		// 是否全选
		$scope.isSelectAllCartData = false;
		$scope.selectAllCartData = function () {
			if ($scope.isSelectAllCartData) {
				for (var i = 0; i < $scope.cartData.length; i++) {
					$scope.cartData[i].checked = true;
					var pros = $scope.cartData[i].product;
					for (var j = 0; j < pros.length; j++) {
						pros[j].checked = true;
					};
				};
			}else {
				for (var i = 0; i < $scope.cartData.length; i++) {
					$scope.cartData[i].checked = false;
					var pros = $scope.cartData[i].product;
					for (var j = 0; j < pros.length; j++) {
						pros[j].checked = false;
					};
				};
			};
			// 计算
			dealCartData();
		}

		// 判断是否全选
		$scope.isSelectAllCartDataFun = function () {
			for (var i = 0; i < $scope.cartData.length; i++) {
				if ($scope.cartData[i].checked == false) {
					$scope.isSelectAllCartData = false;
					break;
				}else {
					var pros = $scope.cartData[i].product;
					for (var j = 0; j < pros.length; j++) {
						if (pros[j].checked == false) {
							$scope.isSelectAllCartData = false;
							break;
						}else {
							$scope.isSelectAllCartData = true;
						};
					};
				};
			};
		}









		// 点击删除
		$scope.delCartData = function () {
			var selectData = [];
			for (var i = 0; i < $scope.cartData.length; i++) {
				if ($scope.cartData[i].checked) {
					var pros = $scope.cartData[i].product;
					for (var j = 0; j < pros.length; j++) {
						if (pros[j].checked) {
							selectData.push(pros[j]);
						}
					};
				}
			};
			//console.log(selectData);
			// id和数量
			var ids = "";
			for (var i = 0; i < selectData.length; i++) {
				if (i == selectData.length - 1) {
					ids += selectData[i].id;
				}else {
					ids += selectData[i].id + ",";
				};
			};
			//console.log(ids);

			// 批量删除商品
			$http({
				url: API.cart_delete_batch,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					ids : ids,
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					// 重新更新购物车数据
					getCartData(function () {
						// 计算
						dealCartData();
						// 点击删除后显示结算
						$scope.edit();
					});
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				console.log("error");
			})

		}

		// 立即结算
		$scope.goToCheck = function () {
			//console.log($scope.cartData);
			var count = 0;
			for (var i = 0; i < $scope.cartData.length; i++) {
				if ($scope.cartData[i].checked) {
					count++;
				}
			};
			if (count == 0) {
				$ionicLoading.show({
					duration: "1500",
					template: "请先选择商品"
				});
			}else {
				// 点击结算
				var selectData = [];
				for (var i = 0; i < $scope.cartData.length; i++) {
					if ($scope.cartData[i].checked) {
						var pros = $scope.cartData[i].product;
						for (var j = 0; j < pros.length; j++) {
							if (pros[j].checked) {
								selectData.push(pros[j]);
							}
						};
					}
				};
				//console.log(selectData);

				// id和数量
				var ids = "";
				var nums = "";
				for (var i = 0; i < selectData.length; i++) {
					if (i == selectData.length - 1) {
						ids += selectData[i].id;
						nums += selectData[i].num;
					}else {
						ids += selectData[i].id + ",";
						nums += selectData[i].num + ",";
					};
				};
				//console.log(ids,nums);
				localStorage.t_wantToBuyIds = ids;
				localStorage.t_wantToBuyNums = nums;

				//$state.go("index.find-order");
                $http({
                    url: API.judge_purchase,
                    method: "POST",
                    headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
                    data: $rootScope.serialize({
                        ids : ids,
                        nums : nums,
                        user_id : $rootScope.user_id,
                        auth_token : $rootScope.auth_token
                    })
                }).success(function(response) {
                    //console.log(response);
                    if (response.RESPONSE_STATUS == 100) {
                        $state.go("index.find-order");
                    }else {
                        $ionicPopup.alert({
                            title: "以下商品超出限购数量，请修改",
                            template: response.Tips,
                            okText: "关闭",
                            okType: "button-assertive"
                        })
                        loadding = false;
                    }

                }).error(function() {
                    console.log("获取订单数据不成功");
                })


			}
		}

		// 显示删除 or 显示结算
		$scope.isEdit = false;
		$scope.edit = function () {
			$scope.isEdit = !$scope.isEdit;
		}

	// });

})

// 订单
ctrlApp.controller("ctrlFindOrder", function($scope,$rootScope,$ionicPopup,$state,$http,$ionicLoading ,addressData,couponData,invoiceData) {
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

	var loadding = true;
	$ionicLoading.show({
		template: "数据正在加载中..."
	});
	setTimeout(function () {
		if (loadding) {
			$scope.showTips("请检查网络或者稍后再试！");
		};
	},8000);

	// 监测是否登录
	if (!$rootScope.isLoged) {
		$scope.showTips("您还未登录 功能暂不可用");
		loadding = false;
	};

	// 从cookie中获取商品id和数量
	var ids = localStorage.getItem("t_wantToBuyIds");
	var nums = localStorage.getItem("t_wantToBuyNums");
	// 订单总价格
	$scope.pay = 0;
	if (!ids || !nums) {
		$scope.showTips("请返回上一步选择商品");
		return false;
	};

	// 优惠券码
	var coupon_code = "";
	// 获取选定的购物车数据
	$http({
		url: API.cart_comfirm,
		method: "POST",
		headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
		data: $rootScope.serialize({
			ids : ids,
			nums : nums,
			user_id : $rootScope.user_id,
			auth_token : $rootScope.auth_token
		})
	}).success(function(response) {
		//console.log(response);
		if (response.RESPONSE_STATUS == 100) {
			//console.log("获取订单数据成功");
			$ionicLoading.hide();
			loadding = false;
			$scope.wantToBuyData = response.RESPONSE_INFO;
			localStorage.t_wantToBuyData = JSON.stringify($scope.wantToBuyData);
			$scope.productData = response.RESPONSE_INFO.product;

			// 优惠券
			$scope.coupon_price = 0;
			$scope.coupon_price_count = 0;
			if (couponData.dataObject.coupon_code != "") {
				coupon_code = couponData.dataObject.coupon_code;
			};
			if (coupon_code != "") {
				$http({
					url: API.coupon_check_code,
					method: "POST",
					headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
					data: $rootScope.serialize({
						user_id : $rootScope.user_id,
						auth_token : $rootScope.auth_token,
						coupon_code : coupon_code
					})
				}).success(function(response) {
					//console.log(response);
					if (response.RESPONSE_STATUS == 100) {
						//console.log("获取优惠信息成功");
						$scope.old_coupon_price = response.RESPONSE_INFO.price;
                        $scope.coupon_price = $scope.old_coupon_price;
                        //优惠券最多抵用商品金额
                        if (parseFloat($scope.wantToBuyData.total_price)-parseFloat($scope.old_coupon_price) <= 0) {
                               $scope.coupon_price = $scope.wantToBuyData.total_price;
                        }
                        $scope.payCount = parseFloat($scope.wantToBuyData.pay) - parseFloat($scope.coupon_price);
                        $scope.coupon_price_count = ($scope.payCount<0) ? parseFloat($scope.wantToBuyData.pay) : $scope.coupon_price;
                        $scope.pay = ($scope.payCount<0) ? 0 : $scope.payCount;

					}else {
						//console.log("获取优惠信息失败");
						$scope.showTips(response.Tips);
					}
				})
			}else {
				$scope.pay = parseFloat($scope.wantToBuyData.total_price) + parseFloat($scope.wantToBuyData.total_exp_charge) - parseFloat($scope.coupon_price);
			}

		}else {
			$scope.showTips(response.Tips);
			loadding = false;
		}

	}).error(function() {
		console.log("获取订单数据不成功");
	})

	// 获取地址列表
	var address_id = "";
	$http.get(API.address_addresslist + "?" + $rootScope.serialize({
		user_id : $rootScope.user_id,
		auth_token : $rootScope.auth_token,
		p : 1
	})).success(function(response) {
		//console.log(response);
		if (response.RESPONSE_STATUS == 100) {
			//console.log("获取地址列表成功");
			$scope.addressData = response.RESPONSE_INFO.list;
			if (addressData.selectId.address_id != "") {
				// alert("9");
				var selectId = addressData.selectId.address_id;
				// 使用后清空
				addressData.selectId = {
					address_id : ""
				}
				for (var i = 0; i < $scope.addressData.length; i++) {
					if ($scope.addressData[i].id == selectId) {
						$scope.rightAddress = $scope.addressData[i];
						address_id = selectId;
					};
				};
			}else {

				for (var i = 0; i < $scope.addressData.length; i++) {
					if ($scope.addressData[i].is_default == "1") {
						$scope.rightAddress = $scope.addressData[i];
						address_id = $scope.rightAddress.id;
					};
				};
			};
			// 如果没有默认地址和用户选定的地址 则默认用第一个
			if (!$scope.rightAddress) {
				if ($scope.addressData.length > 0) {
					$scope.rightAddress = $scope.addressData[0];
					address_id = $scope.addressData[0].id;
				};
			};

		}else {
			 $scope.showTips(response.Tips);
		};
	});

	// 发票
	var invoice = "";
	$scope.invoiceData = invoiceData.dataObject;
	if (invoiceData.dataObject.head == "") {
		invoice = "";
	}else {
		for (var x in invoiceData.dataObject) {
			invoice += x + ":" + invoiceData.dataObject[x] + "|"
		}
		invoice = invoice.substring(0, invoice.length - 1);
	};

    $scope.order_data = {buyer_message: ''}
	// 创建订单
	$scope.goToCreate = function () {

		// 创建订单
		$http({
			url: API.cart_create_product,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				ids : ids,
				nums : nums,
				coupon_code : (typeof(coupon_code) == "undefined")?"":coupon_code,
				address_id : address_id,
				invoice : invoice,
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
                buyer_message: $scope.order_data.buyer_message
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				// 创建订单成功之后清楚数据
				couponData.dataObject.coupon_code = "";
				invoiceData.dataObject = {
					type: "",
					head: "",
					content: ""
				};
				localStorage.removeItem("t_wantToBuyIds");
				localStorage.removeItem("t_wantToBuyNums");
				localStorage.removeItem("t_wantToBuyData");
				// 跳到支付页 如果是0元商品 直接跳到支付成功页
				if (response.RESPONSE_INFO.no_pay == 1) {
                    $state.go("index.sum-find-payok",{id:response.RESPONSE_INFO.order_id});
                    //客户端
                    //if ($rootScope.isWebView) {
                    //    $state.go("index.find-payok",{id:response.RESPONSE_INFO.order_id});
                    //} else {
                    //    $link = window.location.hostname;
                    //    window.location.href = 'http://'+$link+'/www/#/index/find/payok/'+(response.RESPONSE_INFO.order_id);
                    //}
				}else {
                    if ($rootScope.isWebView) {
                        $state.go("index.sum-find-pay", {id: response.RESPONSE_INFO.order_id});
                    } else {
                        $link = window.location.hostname;
                        window.location.href = 'http://'+$link+'/www/#/index/find/sum-pay/'+(response.RESPONSE_INFO.order_id);
                    }
                };

			}else {
                if (response.RESPONSE_STATUS == 400) {
                    $ionicPopup.alert({
                        title: "以下商品超出限购数量，请修改",
                        template: response.Tips,
                        okText: "关闭",
                        okType: "button-assertive"
                    })
                }else {
                    $scope.showTips(response.Tips);
                }
			}
		}).error(function() {
			console.log("error");
		})

	}

})



// 订单-发票
ctrlApp.controller("ctrlFindOrderBill", function($scope,$rootScope,$ionicPopup,$state,$http,$ionicLoading,invoiceData,$ionicHistory) {
	//console.log("ctrlFindOrderBill");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});


	$scope.dataObject = {
		type: "",
		head: "",
		content: ""
	};

	// 处理内容选择
	$scope.billData = [{
		text: "电脑配件",
		value: false
	}, {
		text: "明细",
		value: false
	}, {
		text: "办公用品",
		value: false
	}, {
		text: "耗材",
		value: false
	}];
	var last = 0;
	$scope.selectText = "";
	$scope.aaa = function (obj,index) {
		$scope.billData[last].value = false;
		obj.value = true;
		$scope.selectText = $scope.dataObject.content = obj.text;
		last = index;
	}

	// 处理类型选择
	$scope.isSelectTyoe = false;
	$scope.selectTyoe = function () {
		if ($scope.isSelectTyoe) {
			$scope.isSelectTyoe = false;
			$scope.dataObject.type = "";
			$scope.dataObject.head = "";
			$scope.dataObject.content = "";
			for (var i = 0; i < $scope.billData.length; i++) {
				$scope.billData[i].value = false;
			};
		}else {
			$scope.isSelectTyoe = true;
			$scope.dataObject.type = "纸质发票";
		};
	}







	$scope.useBill = function (dataForm) {
		//console.log($scope.dataObject);
		//console.log($scope.selectText);
		if ($scope.isSelectTyoe == false) {
			$ionicLoading.show({
				duration: "800",
				template: "请选择发票类型"
			});
		}else if (dataForm.head.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请选择发票内容"
			});
		}else if ($scope.selectText == "") {
			$ionicLoading.show({
				duration: "800",
				template: "请选择发票内容"
			});
		} else {
			invoiceData.dataObject = $scope.dataObject;
			$ionicHistory.goBack();
		}
	}



})



// 优惠券
ctrlApp.controller("ctrlFindOrderCoupon", function($scope,$rootScope,$ionicPopup,$state,$http,$ionicLoading,$ionicHistory,couponData) {
	//console.log("ctrlFindOrderCoupon");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

	// 订单id
	$scope.order_id = $state.params.id;

	// 优惠券code
	$scope.dataObject = {
		code: ""
	};
	if (couponData.dataObject.coupon_code != "") {
		$scope.dataObject.code = couponData.dataObject.coupon_code;
	};


	// 优惠券
	$scope.useCoupon = function (dataForm) {
		if (dataForm.code.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请输入您的优惠券"
			});
		} else if (dataForm.code.$error.minlength || dataForm.code.$error.maxlength) {
			$ionicLoading.show({
				duration: "800",
				template: "兑换码是16位"
			});
		}else {

			$http({
				url: API.coupon_check_code,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					coupon_code : $scope.dataObject.code
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					//console.log("获取优惠信息成功");
					// if (parseFloat(response.RESPONSE_INFO.price) >= parseFloat(JSON.parse(localStorage.getItem("t_wantToBuyData")).pay)) {
					// 	$scope.showTips("优惠券金额不得大于订单总金额");
					// 	$scope.dataObject.code = "";
					// 	couponData.dataObject.coupon_code = "";
					// }else {
						couponData.dataObject.coupon_code = $scope.dataObject.code;
						$ionicHistory.goBack();
					// };
				}else {
					//console.log("获取优惠信息失败");
					$scope.showTips(response.Tips);
				}
			})


		}
	}

	$scope.cancelUseCoupon = function () {
		$scope.dataObject.code = "";
		couponData.dataObject.coupon_code = "";
		$ionicHistory.goBack();
	}

})

// 支付-收银台
ctrlApp.controller("ctrlFindPay", function($scope,$rootScope,$ionicPopup,$state,$http, $ionicLoading, $q) {
	//console.log("ctrlFindPay");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});
    //alert($rootScope.isShowAlipay);

    $scope.isShowAlipay = $rootScope.isShowAlipay;

	var loadding = true;
	$ionicLoading.show({
		template: "数据正在加载中..."
	});
	setTimeout(function () {
		if (loadding) {
			$scope.showTips("请检查网络或者稍后再试！");
		};
	},8000);

	// 监测是否登录
	if (!$rootScope.isLoged) {
		$scope.showTips("您还未登录 功能暂不可用");
		loadding = false;
	};

	// 订单id
	$scope.order_id = $state.params.id;
    $scope.pay_type = $state.params.type;
	$http({
		url: API.order_orderdetail,
		method: "POST",
		headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
		data: $rootScope.serialize({
			order_id : $scope.order_id,
			user_id : $rootScope.user_id,
			auth_token : $rootScope.auth_token
		})
	}).success(function(response) {
		//console.log(response);
		if (response.RESPONSE_STATUS == 100) {
			$ionicLoading.hide();
			loadding = false;
			$scope.orderData = response.RESPONSE_INFO.list.order;
		}else {
			$scope.showTips(response.Tips);
			loadding = false;
		}

	}).error(function() {
		console.log("error");
	})


	// 微信支付
	$scope.wechatPay = function () {
		// alert("微信支付");
		if (navigator.userAgent.toLowerCase().match(/micromessenger/i) == "micromessenger") {
            //if (localStorage.wechat_openid=="" || localStorage.wechat_openid==undefined || localStorage.wechat_openid=="undefined") {
            //    $rootScope.getWechatAccount();
            //} else {
                // 在微信内支付
                $http({
                    url: API.pay_weixin,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    data: $rootScope.serialize({
                        order_id: $scope.order_id,
                        openid: $rootScope.wechat_openid,
                        user_id: $rootScope.user_id,
                        auth_token: $rootScope.auth_token
                    })
                }).success(function (response) {
                    if (response.RESPONSE_STATUS == 100) {
                        // 请求成功后调起支付
                        function onBridgeReady() {
                            WeixinJSBridge.invoke('getBrandWCPayRequest', response.RESPONSE_INFO.data, function (res) {
                                if (res.err_msg == "get_brand_wcpay_request:ok") {
                                    // 跳去支付成功页
                                    $state.go("index.find-payok", {id: $scope.order_id});
                                } else {
                                    $scope.showTips("支付失败");
                                }
                            });
                        }

                        if (typeof WeixinJSBridge == "undefined") {
                            if (document.addEventListener) {
                                document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                            } else if (document.attachEvent) {
                                document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                                document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                            }
                        } else {
                            onBridgeReady();
                        }

                    } else {
                        $scope.showTips(response.Tips);
                    }
                }).error(function () {
                    console.log("error");
                })
            //}
		}else {
			// 在app里面支付
			if ($rootScope.isWebView) {
				$http({
					url: API.pay_weixin_open,
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
					},
					data: $rootScope.serialize({
						order_id: $scope.order_id,
						user_id: $rootScope.user_id,
						auth_token: $rootScope.auth_token
					})
				}).success(function(response) {
					if (response.RESPONSE_STATUS == 100) {
						// for (var x in response.RESPONSE_INFO.data) {
						// 	alert(response.RESPONSE_INFO.data[x]);
						// }
						// 调起支付
						Wechat.sendPaymentRequest(response.RESPONSE_INFO.data, function() {
							// alert("Success");
							$state.go("index.find-payok",{id:$scope.order_id});
						}, function(reason) {
							// alert("Failed: " + reason);
							$scope.showTips("支付失败:" + reason);
						});
					} else {
						$scope.showTips(response.Tips);
					}
				}).error(function() {
					console.log("error");
				})
			}else {
				$scope.showTips("网页端暂不支持支付功能");
			};
		};
	}

	// 如果是在app里面，则显示支付宝支付
	$scope.isAlipay = false;
	// $scope.isAlipay = true;
	if ($rootScope.isWebView && $rootScope.isShowAlipay) {
		$scope.isAlipay = true;
	};
	// 支付宝支付 自己拼
	$scope.aliPay = function() {
		// alert("支付宝支付");
		$http({
			url: API.pay_alipay_open,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				order_id: $scope.order_id,
				user_id: $rootScope.user_id,
				auth_token: $rootScope.auth_token
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				var data = response.RESPONSE_INFO;
				//console.log(data);
				// alert(data.ali_url);
				var alipay = cordova.require('cordova-plugin-alipay.alipay');
				alipay.pay({
						tradeNo: data.pay_number,
						subject: data.subject,
						body: data.body,
						price: data.price,
						notifyUrl: data.ali_url
					},
					function(successResults) {
						// alert(successResults);
						$state.go("index.find-payok",{id:$scope.order_id});
					},
					function(errorResults) {
						// alert(errorResults);
						$scope.showTips("支付失败");
					}
				);
			}else {
				$scope.showTips(response.Tips);
			}
		}).error(function() {
			console.log("error");
		})

	}
})

// 合并订单支付-收银台
ctrlApp.controller("ctrlSumFindPay", function($scope,$rootScope,$ionicPopup,$state,$http, $ionicLoading, $q) {
    //console.log("ctrlSumFindPay");
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = true;
    });

    var loadding = true;
    $ionicLoading.show({
        template: "数据正在加载中..."
    });
    setTimeout(function () {
        if (loadding) {
            $scope.showTips("请检查网络或者稍后再试！");
        };
    },8000);

    // 监测是否登录
    if (!$rootScope.isLoged) {
        $scope.showTips("您还未登录 功能暂不可用");
        loadding = false;
    };

    // 订单id
    $scope.order_id = $state.params.id;
    $http({
        url: API.order_orderdetail,
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        data: $rootScope.serialize({
            type: 1, //合并订单支付
            order_id : $scope.order_id,
            user_id : $rootScope.user_id,
            auth_token : $rootScope.auth_token
        })
    }).success(function(response) {
        //console.log(response);
        if (response.RESPONSE_STATUS == 100) {
            $ionicLoading.hide();
            loadding = false;
            $scope.orderData = response.RESPONSE_INFO.list.order;
        }else {
            $scope.showTips(response.Tips);
            loadding = false;
        }

    }).error(function() {
        console.log("error");
    })


    // 微信支付
    $scope.wechatPay = function () {
        // alert("微信支付");
        if (navigator.userAgent.toLowerCase().match(/micromessenger/i) == "micromessenger") {
            // 在微信内支付
            $http({
                url: API.pay_weixin,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                },
                data: $rootScope.serialize({
                    type: 1,
                    order_id: $scope.order_id,
                    openid: $rootScope.wechat_openid,
                    user_id: $rootScope.user_id,
                    auth_token: $rootScope.auth_token
                })
            }).success(function(response) {
                if (response.RESPONSE_STATUS == 100) {
                    // 请求成功后调起支付
                    function onBridgeReady() {
                        WeixinJSBridge.invoke('getBrandWCPayRequest', response.RESPONSE_INFO.data, function(res) {
                            if (res.err_msg == "get_brand_wcpay_request:ok") {
                                // 跳去支付成功页
                                $state.go("index.sum-find-payok",{id:$scope.order_id});
                            } else {
                                $scope.showTips("支付失败");
                            }
                        });
                    }

                    if (typeof WeixinJSBridge == "undefined") {
                        if (document.addEventListener) {
                            document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                        } else if (document.attachEvent) {
                            document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                            document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                        }
                    } else {
                        onBridgeReady();
                    }


                } else {
                    $scope.showTips(response.Tips);
                }
            }).error(function() {
                console.log("error");
            })
        }else {
            // 在app里面支付
            if ($rootScope.isWebView) {
                $http({
                    url: API.pay_weixin_open,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    data: $rootScope.serialize({
                        type: 1,
                        order_id: $scope.order_id,
                        user_id: $rootScope.user_id,
                        auth_token: $rootScope.auth_token
                    })
                }).success(function(response) {
                    if (response.RESPONSE_STATUS == 100) {
                        // for (var x in response.RESPONSE_INFO.data) {
                        // 	alert(response.RESPONSE_INFO.data[x]);
                        // }
                        // 调起支付
                        Wechat.sendPaymentRequest(response.RESPONSE_INFO.data, function() {
                            // alert("Success");
                            $state.go("index.sum-find-payok",{id:$scope.order_id});
                        }, function(reason) {
                            // alert("Failed: " + reason);
                            $scope.showTips("支付失败:" + reason);
                        });
                    } else {
                        $scope.showTips(response.Tips);
                    }
                }).error(function() {
                    console.log("error");
                })
            }else {
                $scope.showTips("网页端暂不支持支付功能");
            };
        };
    }

    // 如果是在app里面，则显示支付宝支付
    $scope.isAlipay = false;
    // $scope.isAlipay = true;
    if ($rootScope.isWebView && $rootScope.isShowAlipay) {
        $scope.isAlipay = true;
    };
    // 支付宝支付 自己拼
    $scope.aliPay = function() {
        // alert("支付宝支付");
        $http({
            url: API.pay_alipay_open,
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
            data: $rootScope.serialize({
                type: 1,
                order_id: $scope.order_id,
                user_id: $rootScope.user_id,
                auth_token: $rootScope.auth_token
            })
        }).success(function(response) {
            //console.log(response);
            if (response.RESPONSE_STATUS == 100) {
                var data = response.RESPONSE_INFO;
                //console.log(data);
                // alert(data.ali_url);
                var alipay = cordova.require('cordova-plugin-alipay.alipay');
                alipay.pay({
                        tradeNo: data.pay_number,
                        subject: data.subject,
                        body: data.body,
                        price: data.price,
                        notifyUrl: data.ali_url
                    },
                    function(successResults) {
                        // alert(successResults);
                        $state.go("index.sum-find-payok",{id:$scope.order_id});
                    },
                    function(errorResults) {
                        // alert(errorResults);
                        $scope.showTips("支付失败");
                    }
                );
            }else {
                $scope.showTips(response.Tips);
            }
        }).error(function() {
            console.log("error");
        })

    };
})

// 订单-商品详情
ctrlApp.controller("ctrlFindOrderProduct", function($scope,$rootScope,$ionicPopup,$state,$http) {
	//console.log("ctrlFindOrderProduct");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});
	// 监测是否登录
	if (!$rootScope.isLoged) {
		$scope.showTips("您还未登录 功能暂不可用");
	};

	$scope.wantToBuyData = JSON.parse(localStorage.getItem("t_wantToBuyData"));


})




// 订单-地址
ctrlApp.controller("ctrlFindAddress", function($scope,$rootScope,$ionicPopup,$state,$http) {
	//console.log("ctrlFindAddress");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

	// 监测是否登录
	if (!$rootScope.isLoged) {
		$scope.showTips("您还未登录 功能暂不可用");
	};
})

// 支付成功
ctrlApp.controller("ctrlFindPayok", function($scope,$rootScope,$ionicPopup,$state,$http,$ionicLoading) {
	//console.log("ctrlFindPayok");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});
	var loadding = true;
	$ionicLoading.show({
		template: "数据正在加载中..."
	});
	setTimeout(function () {
		if (loadding) {
			$scope.showTips("请检查网络或者稍后再试！");
		};
	},8000);


	// 监测是否登录
	if (!$rootScope.isLoged) {
		$scope.showTips("您还未登录 功能暂不可用");
		loadding = false;
	};

	// 订单id
	$scope.order_id = $state.params.id;
	$http({
		url: API.order_orderdetail,
		method: "POST",
		headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
		data: $rootScope.serialize({
			order_id : $scope.order_id,
			user_id : $rootScope.user_id,
			auth_token : $rootScope.auth_token
		})
	}).success(function(response) {
		//console.log(response);
		if (response.RESPONSE_STATUS == 100) {
			$ionicLoading.hide();
			loadding = false;
			$scope.orderData = response.RESPONSE_INFO.list.order;
			// $scope.orderNumber = $scope.orderData.productlist.number;//订单号

		}else {
			$scope.showTips(response.Tips);
			loadding = false;
		}

	}).error(function() {
		console.log("error");
	})
})

// 合并订单支付成功
ctrlApp.controller("ctrlSumFindPayok", function($scope,$rootScope,$ionicPopup,$state,$http,$ionicLoading) {
    //console.log("ctrlFindPayok");
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = true;
    });
    var loadding = true;
    $ionicLoading.show({
        template: "数据正在加载中..."
    });
    setTimeout(function () {
        if (loadding) {
            $scope.showTips("请检查网络或者稍后再试！");
        };
    },8000);


    // 监测是否登录
    if (!$rootScope.isLoged) {
        $scope.showTips("您还未登录 功能暂不可用");
        loadding = false;
    };

    // 订单id
    $scope.order_id = $state.params.id;
    $http({
        url: API.sum_order_orderdetail,
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
        data: $rootScope.serialize({
            order_id : $scope.order_id,
            user_id : $rootScope.user_id,
            auth_token : $rootScope.auth_token
        })
    }).success(function(response) {
        //console.log(response);
        if (response.RESPONSE_STATUS == 100) {
            $ionicLoading.hide();
            loadding = false;
            $scope.orderData = response.RESPONSE_INFO.list;
            $scope.child_len = $scope.orderData.length;
            // $scope.orderNumber = $scope.orderData.productlist.number;//订单号

        }else {
            $scope.showTips(response.Tips);
            loadding = false;
        }

    }).error(function() {
        console.log("error");
    })

})

// 支付不成功
ctrlApp.controller("ctrlFindPayfail", function($scope,$rootScope,$ionicPopup,$state,$http,$ionicLoading) {
	//console.log("ctrlFindPayfail");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

	var loadding = true;
	$ionicLoading.show({
		template: "数据正在加载中..."
	});
	setTimeout(function () {
		if (loadding) {
			$scope.showTips("请检查网络或者稍后再试！");
		};
	},8000);


	// 监测是否登录
	if (!$rootScope.isLoged) {
		$scope.showTips("您还未登录 功能暂不可用");
		loadding = false;
	};
	// 订单id
	$scope.order_id = $state.params.id;
    $scope.type = $state.params.type;
    var params = {
        order_id : $scope.order_id,
        user_id : $rootScope.user_id,
        auth_token : $rootScope.auth_token
    }
    if ($scope.type==1) {
        params.type = "1";
    }
    //console.log(params);
	$http({
		url: API.order_orderdetail,
		method: "POST",
		headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
		data: $rootScope.serialize(params)
	}).success(function(response) {
		//console.log(response);
		if (response.RESPONSE_STATUS == 100) {
			$ionicLoading.hide();
			loadding = false;
			$scope.orderData = response.RESPONSE_INFO.list.order;

		}else {
			$scope.showTips(response.Tips);
			loadding = false;
		}

	}).error(function() {
		console.log("error");
	})
})

ctrlApp.controller("ctrlTalentList", function($scope,$rootScope,$ionicPopup,$state,$http,$ionicLoading) {
    $scope.nickname  = 3333;


    $scope.loadText = "点击加载更多";
    $scope.itemsData = [];
    // 初始化参数 | currentPage：第几页 | pageCount：总页数 |　itemCount：数据总条数
    var currentPage = 0;
    $scope.itemCount = 0;
    var pageCount = 1;
    $scope.loadMoreData = function() {
        if (currentPage < pageCount) {
            currentPage++;
            $scope.loadText = "正在加载中";

            // 获取最新商品
            $http.get(API.talent_region + "?" + $rootScope.serialize({
                id: $state.params.id,
                user_id: $rootScope.user_id,
                auth_token: $rootScope.auth_token,
                page:currentPage
            })).success(function(response) {
                //console.log(response);
                if (response.RESPONSE_STATUS == 100) {
                    $ionicLoading.hide();
                    loadding = false;
                    pageCount = response.RESPONSE_INFO.page.pageCount;
                    $scope.itemCount = response.RESPONSE_INFO.page.itemCount;
                    var data = response.RESPONSE_INFO.talent;
                    for (var i = 0; i < data.length; i++) {
                        data[i].is_fans_text = (data[i].is_fans == 1) ? '已关注' : '<i class="ion-plus-round"></i>关注';
                        $scope.itemsData.push(data[i]);
                    };

                    if (currentPage < pageCount) {
                        $scope.loadText = "点击加载更多";
                    }else {
                        $scope.loadText = "没有更多数据了";
                    };
                }else {
                    $scope.showTips(response.Tips);
                    loadding = false;
                };
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }else {
            $scope.loadText = "没有更多数据了";
        };
    };

    // 第一次加载
    $scope.loadMoreData();

    // 收藏达人
    $scope.collectTalent = function (obj) {
        $ionicLoading.show({
            template: "正在处理..."
        });
        if (obj.is_fans == 1) {
            $http({
                url: API.fans_cancel,
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
                data: $rootScope.serialize({
                    user_id : $rootScope.user_id,
                    auth_token : $rootScope.auth_token,
                    type : 1,
                    id : obj.busines_id
                })
            }).success(function(response) {
                //console.log(response);
                if (response.RESPONSE_STATUS == 100) {
                    $scope.showTips("您已取消关注");
                    obj.is_fans = 0;
                    obj.is_fans_text = '<i class="ion-plus-round"></i>关注';
                }else {
                    $scope.showTips(response.Tips);
                }
            }).error(function() {
                $scope.showTips("取消关注失败");
            })
        }else {
            $http({
                url: API.fans_focus,
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
                data: $rootScope.serialize({
                    user_id : $rootScope.user_id,
                    auth_token : $rootScope.auth_token,
                    type : 1,
                    busines_id : obj.busines_id
                })
            }).success(function(response) {
                //console.log(response);
                if (response.RESPONSE_STATUS == 100) {
                    $scope.showTips("关注成功");
                    obj.is_fans = 1;
                    obj.is_fans_text = '已关注';
                }else {
                    $scope.showTips(response.Tips);
                }
            }).error(function() {
                $scope.showTips("关注不成功");
            })
        };
    }
});


