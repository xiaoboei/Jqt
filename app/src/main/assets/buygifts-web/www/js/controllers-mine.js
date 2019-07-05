ctrlApp.controller("ctrlMine", function($scope,$state,$rootScope,$ionicLoading,$http,$ionicPopup) {
	//console.log("ctrlMine");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = false;
        //微信分享
        $rootScope.wxShare('个人中心', '途礼游', '');
	});

    //点击客户拨打电话
    $scope.contactServer = function(){
        if ($rootScope.isWebView) {
            cordova.InAppBrowser.open('tel:400-9018-168');
        } else {
            location.href="tel:400-9018-168";
        }
    }


    // 优先读缓存
	if (sessionStorage.t_loginHistory) {
		var historyObj = JSON.parse(sessionStorage.t_loginHistory);
		sessionStorage.removeItem("t_loginHistory");
		$state.go(historyObj.stateName, historyObj.stateParams);
	}

	// 退出
	$scope.logout = function () {
		$http({
			url: API.user_logout,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				// 一个提示对话框
				$ionicPopup.alert({
					title: "退出成功",
					template: "您已成功退出。",
					okText: "好的",
					okType: "button-assertive"
				}).then(function(res) {
					dele();
				});
			}else {
				dele();
			}
		}).error(function() {
			console.log("error");
			dele();

		})
	}


	function dele() {
		// 删除用户信息
		$rootScope.delUserInfo();
		// 更新用户信息
		$rootScope.getUserInfo();
		// 清空收藏的达人
		$scope.talentData = [];
		// 清空关注的商家
		$scope.businesData = [];
		// 清空收藏的商品
		$scope.productNum = 0;
		$scope.is_read = 0;
		// 清空头像
		$scope.avt = $rootScope.upfile?$rootScope.upfile:"img/avt.png";
	}

	function init() {
		if (!$rootScope.isLoged) {
			dele();
		}else {
			$scope.avt = $rootScope.upfile?$rootScope.upfile:"img/avt.png";
			getBusinesData();
			getTalentData();
			getProductData();
			getReadData();
		};
	}
	init();
	// 获取用户关注商家数据
	function getBusinesData() {
		$scope.businesData = [];
		$http({
			url: API.fans_getfans,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				type : 3
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				$scope.businesData = response.RESPONSE_INFO.list;
				console.log("获取用户关注商家数据成功");
			}else {
			}
		}).error(function() {
			console.log("error");
		})
	}


	// 获取用户关注达人数据

	function getTalentData() {
		$scope.talentData = [];
		$http({
			url: API.fans_getfans,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				type : 1
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				$scope.talentData = response.RESPONSE_INFO.list;
				console.log("获取用户关注达人数据成功");
			}else {
			}
		}).error(function() {
			console.log("error");
		})
	}


	// 获取用户收藏商品数据
	function getProductData() {
		$scope.productData = {};
		$scope.productNum = 0;
		$http({
			url: API.fans_getfans,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				type : 4
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				$scope.productData = response.RESPONSE_INFO.list;
				console.log("获取用户收藏商品数据成功");
				// 计算数量
				$scope.productNum = $scope.productData.one_month.length + $scope.productData.third_month.length + $scope.productData.older_month.length;

			}
		}).error(function() {
			console.log("error");
		})
	}


	//判断是否有未读消息
	function getReadData() {
		$scope.is_read = 0;
		$http.get(API.notice_is_read + "?" + $rootScope.serialize({
			user_id : $rootScope.user_id,
			auth_token : $rootScope.auth_token
		})).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				console.log("判断是否有未读消息");
				$scope.is_read = response.RESPONSE_INFO.is_read;
			}else {
			};
		});
	}
    
})

// 我的账户
.controller("ctrlMineInfo", function($scope, $state, $ionicLoading, $http, $rootScope, $ionicHistory, $ionicPopup ,$ionicActionSheet) {
	//console.log("hello world");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

    $scope.goBack = function(){
        $state.go("index.mine",{random:CF.randomString(16)});
    }

    //console.log($rootScope.sex);
    $scope.dataObject = {sex: $rootScope.sex}
    //修改性别
    $scope.editSex = function(){
        $http({
            url: API.user_edituser,
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
            data: $rootScope.serialize({
                user_id : $rootScope.user_id,
                auth_token : $rootScope.auth_token,
                sex : $scope.dataObject.sex
            })
        }).success(function(response) {
            //console.log(response);
            if (response.RESPONSE_STATUS == 100) {
                localStorage.sex = $rootScope.sex = $scope.dataObject.sex;
            }else {
                $scope.showTips(response.Tips);
            };

        }).error(function() {
            console.log("error");
        })
    }

	$scope.avt = $rootScope.upfile?$rootScope.upfile:"img/avt.png";
	// 文件地址
	function getObjectURL(file) {
		var url = null;
		if (window.createObjectURL != undefined) { // basic
			url = window.createObjectURL(file);
		} else if (window.URL != undefined) { // mozilla(firefox)
			url = window.URL.createObjectURL(file);
		} else if (window.webkitURL != undefined) { // webkit or chrome
			url = window.webkitURL.createObjectURL(file);
		}
		return url;
	}

	$("#upfile").change(function() {
		$ionicLoading.show({
			template: "图片正在上传中..."
		});

		var file = $('#upfile')[0].files[0];

		var formData = new FormData();
		formData.append('upfile', file);
		formData.append('user_id', $rootScope.user_id);
		formData.append('auth_token', $rootScope.auth_token);
		//console.log(formData);
		$.ajax({
			type: "POST",
			url: API.user_edituser,
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
			success: function(result) {
				//console.log(result);
				if (result.RESPONSE_STATUS == 100) {
					// 更新用户信息
					localStorage.upfile = $rootScope.upfile = result.RESPONSE_INFO.user.upfile;
					$scope.avt = $rootScope.upfile?$rootScope.upfile:"img/avt.png";
					// $("#Jpic").attr("src",localStorage.upfile);
					$("#Jpic").attr("src",getObjectURL(file));
					$scope.showTips("图片上传成功");
				}
			},
			error:function (result) {
				$scope.showTips(result);
			}
		});
	})

        //$scope.user_upload = function() {
        //    $ionicLoading.show({
        //        template: "图片正在上传中..."
        //    });
        //
        //    var file = $('#upfile')[0].files[0];
        //    console.log(file);return;
        //    var formData = new FormData();
        //    formData.append('upfile', file);
        //    formData.append('user_id', $rootScope.user_id);
        //    formData.append('auth_token', $rootScope.auth_token);
        //    //console.log(formData);
        //    $.ajax({
        //        type: "POST",
        //        url: API.user_edituser,
        //        data: formData,
        //        cache: false,
        //        contentType: false,
        //        processData: false,
        //        success: function(result) {
        //            //console.log(result);
        //            if (result.RESPONSE_STATUS == 100) {
        //                // 更新用户信息
        //                localStorage.upfile = $rootScope.upfile = result.RESPONSE_INFO.user.upfile;
        //                $scope.avt = $rootScope.upfile?$rootScope.upfile:"img/avt.png";
        //                // $("#Jpic").attr("src",localStorage.upfile);
        //                $("#Jpic").attr("src",getObjectURL(file));
        //                $scope.showTips("图片上传成功");
        //            }
        //        },
        //        error:function (result) {
        //            $scope.showTips(result);
        //        }
        //    });
        //}

	
})


// 我的账户-用户名
.controller("ctrlMineInfoUsername", function($scope, $state, $ionicLoading, $http,$rootScope, $ionicPopup,$rootScope) {
	//console.log("ctrlMineInfoUsername");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});
	// 获取字符创长度
	function getLength(str) {
		var realLength = 0,
			len = str.length,
			charCode = -1;
		for (var i = 0; i < len; i++) {
			charCode = str.charCodeAt(i);
			if (charCode >= 0 && charCode <= 128) realLength += 1;
			else realLength += 2;
		}
		return realLength;
	};

	$scope.dataObject = {
		nickname: $rootScope.nickname
	};
	$scope.edit = function(dataForm){
		//console.log($scope.dataObject);
		if (dataForm.nickname.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填写新的用户名"
			});
		} else if (getLength($scope.dataObject.nickname)<4 || getLength($scope.dataObject.nickname)>20) {
			$ionicLoading.show({
				duration: "800",
				template: "4-20个字符"
			});
		} else {
			//console.log($scope.dataObject);

			$http({
				url: API.user_edituser,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					nickname: $scope.dataObject.nickname
				})
			}).success(function(response) {
				if (response.RESPONSE_STATUS == 100) {
					// 更新用户信息
					localStorage.nickname = $rootScope.nickname = $scope.dataObject.nickname;

					$ionicPopup.alert({
						title: "恭喜您！修改用户名成功！",
						template: "马上返回上一页。",
						okText: "好的",
						okType: "button-assertive"
					}).then(function(res) {
						$state.go("index.mine-info",{random:CF.randomString(16)});
					});
				}else {
					$scope.showTips(response.Tips);
				};

			}).error(function() {
				console.log("error");
			})


		}
	}
})

// 我的账户-手机号码
.controller("ctrlMineInfoTelephone", function($scope, $state, $ionicLoading, $http,$rootScope, $ionicPopup, $rootScope) {
    //console.log("ctrlMineInfoUsername");
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = true;
    });
    // 获取字符创长度
    function getLength(str) {
        var realLength = 0,
            len = str.length,
            charCode = -1;
        for (var i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128) realLength += 1;
            else realLength += 2;
        }
        return realLength;
    };

    $scope.dataObject = {
        telephone: $rootScope.telephone
    };
    $scope.edit = function(dataForm){
        //console.log($scope.dataObject);
        if (dataForm.telephone.$error.required) {
            $ionicLoading.show({
                duration: "800",
                template: "请填写手机号码"
            });
        } else if (getLength($scope.dataObject.telephone) != 11) {
            $ionicLoading.show({
                duration: "800",
                template: "手机号码最多11位"
            });
        } else {
            //console.log($scope.dataObject);

            $http({
                url: API.user_edituser,
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
                data: $rootScope.serialize({
                    user_id : $rootScope.user_id,
                    auth_token : $rootScope.auth_token,
                    nickname: $scope.dataObject.nickname
                })
            }).success(function(response) {
                if (response.RESPONSE_STATUS == 100) {
                    // 更新用户信息
                    localStorage.nickname = $rootScope.nickname = $scope.dataObject.nickname;

                    $ionicPopup.alert({
                        title: "恭喜您！修改手机号码功！",
                        template: "马上返回上一页。",
                        okText: "好的",
                        okType: "button-assertive"
                    }).then(function(res) {
                        $state.go("index.mine-info",{random:CF.randomString(16)});
                    });
                }else {
                    $scope.showTips(response.Tips);
                };

            }).error(function() {
                console.log("error");
            })
        }
    }

        // 发验证码
        $scope.sendVerifyCodeDisable = false;
        $scope.sendVerifyCodeText = "获取验证码";
        $scope.sendVerifyCodeNum = 60;
        $scope.sendVerifyCode = function(form){
            if ($rootScope.telephone != $scope.dataObject.telephone) {
                $ionicLoading.show({
                    duration:"800",
                    template: "不能修改相一个号码"
                });
            }else if (form.telephone.$error.required) {
                $ionicLoading.show({
                    duration:"800",
                    template: "请填手机号码"
                });
            }else if (form.telephone.$error.pattern) {
                $ionicLoading.show({
                    duration:"800",
                    template: "请输入正确的手机号码"
                });
            }else {
                $http({
                    url: API.user_sendsms,
                    method: "POST",
                    headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
                    data: $rootScope.serialize({
                        type: "update_tel",
                        username: $scope.dataObject.telephone
                    })
                }).success(function(response) {
                    //console.log(response);
                    if (response.RESPONSE_STATUS == 100) {
                        $scope.showTips(response.Tips);

                        $scope.sendVerifyCodeDisable = true;
                        $scope.sendVerifyCodeNum = 60;

                        function countdown() {
                            if ($scope.sendVerifyCodeNum == -1) {
                                clearInterval(bbb);
                                $scope.sendVerifyCodeDisable = false;
                                $scope.sendVerifyCodeText = "获取验证码";
                            }else {
                                $scope.sendVerifyCodeText = "重新发送(" + $scope.sendVerifyCodeNum + ")";
                                $scope.sendVerifyCodeNum --;
                            };
                        };
                        var bbb = setInterval(function() {
                            $scope.$apply(countdown);
                        }, 1000);
                        //console.log(form.username.$viewValue);


                    }else {
                        $scope.showTips(response.Tips);
                    };

                }).error(function() {
                    console.log("error");
                })
            }
        }
})

// 消息
.controller("ctrlMineMessage", function($scope,$state,$rootScope,$ionicLoading,$http) {
	//console.log("ctrlMineMessage");
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




	// 加载评论
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

			$http.get(API.notice_noticelist + "?" + $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				page : $scope.currentPage
			})).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$ionicLoading.hide();
					loadding = false;
					console.log("获取通知成功");
					$scope.pageCount = response.RESPONSE_INFO.page.totalPages;
					$scope.itemCount = response.RESPONSE_INFO.page.totalRows;
					var data = response.RESPONSE_INFO.list;
					for (var i = 0; i < data.length; i++) {
						$scope.itemsData.push(data[i]);
					};
					
					if ($scope.currentPage < $scope.pageCount) {
						$scope.loadText = "点击加载更多";
					}else {
						$scope.loadText = "没有更多数据了";
					};
					$scope.$broadcast('scroll.infiniteScrollComplete');
				}else {
					console.log("获取通知失败");
					$scope.showTips(response.Tips);
					loadding = false;
				};
			});

		}else {
			$scope.loadText = "没有更多数据了";
		};
	};
	// 第一次加载
	$scope.loadMoreData();


	$scope.goDetail = function (obj) {
		obj.is_read = "1";
		$state.go("index.mine-message-detail",{id:obj.id});
	}

})

// 消息
.controller("ctrlMineMessageDetail", function($scope,$state,$rootScope,$ionicLoading,$http) {
	//console.log("ctrlMineMessageDetail");
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


    //判断是否有未读消息
    function getReadData() {
        $scope.is_read = 0;
        $http.get(API.notice_is_read + "?" + $rootScope.serialize({
            user_id : $rootScope.user_id,
            auth_token : $rootScope.auth_token
        })).success(function(response) {
            //console.log(response);
            if (response.RESPONSE_STATUS == 100) {
                var is_read = response.RESPONSE_INFO.is_read
                //console.log(is_read);
                window.plugins.jPushPlugin.setBadge(is_read);
                plugins.jPushPlugin.setApplicationIconBadgeNumber(is_read);
            }else {
            };
        });
    }

    $scope.messageId = $state.params.id;
	// 获取商品数据
	$http.get(API.notice_view + "?" + $rootScope.serialize({
			user_id : $rootScope.user_id,
			auth_token : $rootScope.auth_token,
			id : $scope.messageId
		})).success(function(response) {
		//console.log(response);
		if (response.RESPONSE_STATUS == 100) {
			$ionicLoading.hide();
			loadding = false;
			console.log("获取商品数据成功");
			$scope.messageData = response.RESPONSE_INFO.notice;

            if ($rootScope.isWebView) {
                getReadData();
            }
		}else {
			$scope.showTips(response.Tips);
			loadding = false;
		};
	});

    })

// 全部订单
.controller("ctrlMineOrder", function($scope,$state,$rootScope,$ionicLoading,$http) {
	//console.log("ctrlMineOrder");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
        //微信分享
        $rootScope.wxShare('我的订单', '途礼游', '');
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



	// 订单类型id 全部类型为空
	$scope.type_id = $state.params.id;
	$scope.type_name = "我的订单";
	if ($scope.type_id == 1) {
		$scope.type_name = "待付款";
	}else if ($scope.type_id == 2) {
		$scope.type_name = "待发货";
	}else if ($scope.type_id == 3) {
		$scope.type_name = "待收货";
	};
	$scope.dataObject = {
		search: ""
	};

	console.log($scope.type_id);

	// 加载
	$scope.loadText = "点击加载更多";
	$scope.itemsData = [];
	// 初始化参数 | currentPage：第几页 | pageCount：总页数 |　itemCount：数据总条数
	$scope.currentPage = 0;
	$scope.itemCount = 0;
	$scope.pageCount = 1;

	$scope.loadMoreData = function() {		
		console.log('aaaa');
		if ($scope.currentPage < $scope.pageCount) {
			$scope.currentPage++;
			$scope.loadText = "正在加载中";

			$http({
				url: API.order_myorder,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					status : $scope.type_id,
					search : (typeof($scope.dataObject.search)=="undefined")?"":$scope.dataObject.search,
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					p : $scope.currentPage
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					//console.log("获取数据成功");
					$ionicLoading.hide();
					loadding = false;
					$scope.pageCount = response.RESPONSE_INFO.page.pageCount;
					$scope.itemCount = response.RESPONSE_INFO.page.itemCount;
					var data = response.RESPONSE_INFO.list;
					for (var i = 0; i < data.length; i++) {
						$scope.itemsData.push(data[i]);
					};

					if ($scope.currentPage < $scope.pageCount) {
						$scope.loadText = "点击加载更多";
					}else {
						$scope.loadText = "没有更多数据了";
					};					
					$scope.$broadcast('scroll.infiniteScrollComplete');
				}else {
					$scope.showTips(response.Tips);
					loadding = false;
				};
			}).error(function() {
				$scope.showTips("获取数据失败");
				loadding = false;
			});
		}else {
			$scope.loadText = "没有更多数据了";
		};		
	};
	// 第一次加载
	$scope.loadMoreData();





	// 搜索
	$scope.search = function (dataForm) {
		document.getElementById("Jsearch").blur();
		$scope.loadText = "点击加载更多";
		$scope.itemsData = [];
		$scope.currentPage = 0;
		$scope.itemCount = 0;
		$scope.pageCount = 1;
		$scope.loadMoreData();
	}




})




// 订单详情
.controller("ctrlMineOrderDetail", function($scope,$state,$rootScope,$ionicLoading,$http,$ionicPopup,$location) {

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

    //调整支付
    $scope.locationPay = function(id){
        $link = window.location.hostname;
        window.location.href = 'http://'+$link+'/www/#/index/find/pay/'+id;
    }


	$scope.order_id = $state.params.id;
	$scope.getOrderData = function () {
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
				console.log("获取订单数据成功");
				$scope.orderDate = response.RESPONSE_INFO.list.order;
				$scope.orderCreateTime = $scope.unixToTime($scope.orderDate.create_time);
				$scope.orderSendTime = $scope.unixToTime($scope.orderDate.send_time);

				// 剩余时间
				$scope.leftTime = 24 - (($scope.orderDate.server_time - $scope.orderDate.create_time)/3600);
				$scope.leftTimeAAA = "0小时0分钟";
				if ($scope.leftTime < 0) {
					$scope.leftTime = 0;
				}else {
					$scope.leftTime = $scope.leftTime.toFixed(2);
					$scope.leftTimeParseInt = parseInt($scope.leftTime);
					$scope.leftTimeAAA = ($scope.leftTimeParseInt + "小时") + parseInt((($scope.leftTime - $scope.leftTimeParseInt) * 60)) + "分钟";
				};

				// var aaa = "type:纸质发票|head:dddd|content:电脑配件";
				var aaa = $scope.orderDate.invoice;
				$scope.invoice = aaa.split("|");
				if ($scope.invoice.length > 1) {
					$scope.invoiceHead = $scope.invoice[1].split(":")[1];
					$scope.invoiceContent = $scope.invoice[2].split(":")[1];
				};
				
				if ($scope.orderDate.pay_type == 2) {
					$scope.payType = "微信支付";
				}else if ($scope.orderDate.pay_type == 1) {
					$scope.payType = "支付宝支付";
				}else if ($scope.orderDate.pay_type == 0) {
					$scope.payType = "在线支付";
				}else if ($scope.orderDate.pay_type == 3) {
					$scope.payType = "微信支付";
				}else {
					$scope.payType = "在线支付";
				}
				//console.log($scope.orderDate.address);
				$scope.addressDate = JSON.parse($scope.orderDate.address);
			}else {
				console.log("获取订单数据不成功");
				$scope.showTips(response.Tips);
				loadding = false;
			}
		}).error(function() {
			console.log("error");
		})
	}
	$scope.getOrderData();

    //查看物流信息
    /*$scope.search_express = function() {
        var express = $scope.orderDate.express;
        var express_code = $scope.orderDate.express_code;
        var express_sn = $scope.orderDate.express_sn;
        var code = '';
        if (express_code) {
            code = express_code;
        } else if (express){
            code = express;
        } else {
            $scope.showTips('物流信息不齐全，联系管理人员查看');
            return;
        }
        var callbackurl = encodeURIComponent($location.absUrl());
        var url = "http://m.kuaidi100.com/index_all.html?type="+code+"&postid="+express_sn+"&callbackurl="+callbackurl;
        //console.log(callbackurl); return;
        if ($rootScope.isWebView) {
            cordova.InAppBrowser.open(url, '_blank', 'location=yes,toolbarposition=top,closebuttoncaption=关闭');
        } else {
            location.href = url;
        }
    }*/

	// 确认收货
	$scope.receiptOrder = function () {
        // 确认对话框
        $ionicPopup.confirm({
            title: "系统提示",
            template: "您要确认收货吗？",
            cancelText: "取消",
            cancelType: "button-outline",
            okText: "确认",
            okType: "button-assertive button-outline"
        }).then(function (res) {

            if (res) {
                $ionicLoading.show({
                    template: "请稍候..."
                });
                $http({
                    url: API.order_receipt,
                    method: "POST",
                    headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
                    data: $rootScope.serialize({
                        order_id: $scope.order_id,
                        user_id: $rootScope.user_id,
                        auth_token: $rootScope.auth_token
                    })
                }).success(function (response) {
                    //console.log(response);
                    if (response.RESPONSE_STATUS == 100) {
                        $scope.showTips("您已确认收货");
                        $scope.getOrderData();
                    } else {
                        console.log("确认收货不成功");
                        $scope.showTips(response.Tips);
                    }
                }).error(function () {
                    $scope.showTips("确认收货不成功");
                })
            } else {
                console.log("取消");
            }
        });
    }

	// 取消订单
	$scope.cancelOrder = function () {
        // 确认对话框
        $ionicPopup.confirm({
            title: "系统提示",
            template: "您确定要取消该订单吗？",
            cancelText: "不取消",
            cancelType: "button-outline",
            okText: "取消",
            okType: "button-assertive button-outline"
        }).then(function (res) {
            //console.log(res);
            if (res) {
                $ionicLoading.show({
                    template: "请稍候..."
                });
                $http({
                    url: API.order_order_cancel,
                    method: "POST",
                    headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
                    data: $rootScope.serialize({
                        order_id: $scope.order_id,
                        user_id: $rootScope.user_id,
                        auth_token: $rootScope.auth_token
                    })
                }).success(function (response) {
                    //console.log(response);
                    if (response.RESPONSE_STATUS == 100) {
                        //$scope.showTips("取消订单成功");
                        $scope.getOrderData();
                    } else {
                        //console.log("取消订单失败");
                        $scope.showTips(response.Tips);
                    }
                }).error(function () {
                    $scope.showTips("取消订单失败");
                })
            } else {
                console.log("取消");
            }
        });
    }

    //查看物流
    $scope.search_express = function() {
        var express = $scope.orderDate.express;
        var express_code = $scope.orderDate.express_code; console.log(express_code);
        var express_sn = $scope.orderDate.express_sn;
        var code = '';
        if (express_code) {
            code = express_code;
        } else if (express){
            code = express;
        } else {
            $scope.showTips('物流信息不齐全，联系管理人员查看');
            return;
        }
        $state.go('index.mine-express',{com:code, nu:express_sn});
    }

})

//查看物流信息
.controller('ctrlFindExpress', function($scope,$state,$rootScope,$ionicLoading,$http,$sce){

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

        // 获取订单评论数据
        $scope.com = $state.params.com;
        $scope.nu = $state.params.nu;
        $scope.findExpress = function () {
            $http.get(API.search_express + "?" + $rootScope.serialize({
                auth_token : $rootScope.auth_token,
                user_id : $rootScope.user_id,
                com : $scope.com,
                nu : $scope.nu
            })).success(function(response) {
                //console.log(response);
                if (response.RESPONSE_STATUS == 100) {
                    $ionicLoading.hide();
                    loadding = false;
                    //$scope.link = $sce.trustAsResourceUrl(response.RESPONSE_INFO.url)
                    //console.log($scope.link);
                    $scope.expressData = response.RESPONSE_INFO;

                }else {
                    $scope.showTips(response.Tips);
                    loadding = false;
                };
            });
        }
        $scope.findExpress();

        //跳转
        $scope.cordovaOpen = function(url){
            if ($rootScope.isWebView) {
                cordova.InAppBrowser.open(url, '_blank', 'location=yes,toolbarposition=top,closebuttoncaption=关闭');
            } else {
                location.href = url;
            }
        }

    })

// 订单评价
.controller("ctrlMineOrderComment", function($scope,$state,$rootScope,$ionicLoading,$http) {
	//console.log("ctrlMineOrderComment");
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

	$scope.order_id = $state.params.id;

	$scope.writeStartsObj = function (num) {
		var startsItem = [];
		for (var i = 0; i < 5; i++) {
			if (i<num) {
				startsItem.push({
					star: true
				});
			}else {
				startsItem.push({
					star: false
				});
			};
		};
		return startsItem;
	}

	// 获取订单评论数据
	$scope.getCommentData = function () {
		$http.get(API.order_comment_list + "?" + $rootScope.serialize({
			user_id : $rootScope.user_id,
			auth_token : $rootScope.auth_token,
			id : $scope.order_id
		})).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				$ionicLoading.hide();
				loadding = false;
				//console.log("获取订单评论数据成功");
				$scope.commentData = response.RESPONSE_INFO.comment;

				for (var i = 0; i < $scope.commentData.length; i++) {
					if ($scope.commentData[i].star == "") {
						$scope.commentData[i].star = 0;
					};
					$scope.commentData[i].starObj = $scope.writeStartsObj($scope.commentData[i].star);
				};

			}else {
				$scope.showTips(response.Tips);
				loadding = false;
			};
		});
	}
	$scope.getCommentData();

	// $scope.commentData = [
	// 	{
	// 		/*用户已经评论但还没审核*/
	// 		content:"质量很好哈哈哈哈哈哈",
	// 		create_time:"1459096893",
	// 		id:"3",
	// 		product_id:"8",
	// 		upfile:"http://buygifts.3ncto.com.cn/uploads/Images/Product/20160201/56af57e816dc8.jpg",
	// 		star:4,
	// 		shenhe:0
	// 	},
	// 	{
	// 		/*用户已经评论并且审核通过*/
	// 		content:"质量很好哈哈哈哈哈哈",
	// 		create_time:"1459096893",
	// 		id:"3",
	// 		product_id:"9",
	// 		upfile:"http://buygifts.3ncto.com.cn/uploads/Images/Product/20160201/56af57e816dc8.jpg",
	// 		star:2,
	// 		shenhe:1
	// 	},
	// 	{
	// 		/*用户未评论*/
	// 		content:"",
	// 		create_time:"",
	// 		id:"",
	// 		product_id:"455",
	// 		upfile:"http://buygifts.3ncto.com.cn/uploads/Images/Product/20160201/56af57e816dc8.jpg",
	// 		star:0,
	// 		shenhe:0
	// 	},
	// 	{
	// 		/*用户未评论*/
	// 		content:"",
	// 		create_time:"",
	// 		id:"",
	// 		product_id:"45",
	// 		upfile:"http://buygifts.3ncto.com.cn/uploads/Images/Product/20160201/56af57e816dc8.jpg",
	// 		star:0,
	// 		shenhe:0
	// 	}
	// ]






	$scope.setStarts = function (obj,num) {
		obj.item.star = num;
		obj.item.starObj = $scope.writeStartsObj(num);
		// console.log($scope.commentData);
	}

	// 发表商品评论
	$scope.postCmt = function (obj) {
		//console.log(obj);
		if (obj.content == "") {
			$scope.showTips("请输入评论");
		}else if (obj.star == 0) {
			$scope.showTips("请评分");
		}else {
			$ionicLoading.show({
				template: "正在发表中..."
			});
			$http({
				url: API.order_evaluate,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					order_id : $scope.order_id,
					product_id : obj.product_id,
					star : obj.star,
					content : obj.content,
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					// 设置id为1只是为了改变评论成已发表样式
					obj.id = 1;
					$scope.showTips("发表商品评论成功");
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("操作失败");
			})





		}
		

	}
	// $scope.postCmt(8);



})




// 退换货
.controller("ctrlMineReturn", function($scope,$state,$rootScope,$ionicLoading,$http) {
	//console.log("ctrlMineReturn");
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
	$scope.dataObject = {
		search: ""
	};
	
	// $scope.getOrderData = function (dataForm) {
	// 	$http({
	// 		url: API.orderReturn_myorder,
	// 		method: "POST",
	// 		headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
	// 		data: $rootScope.serialize({
	// 			user_id : $rootScope.user_id,
	// 			auth_token : $rootScope.auth_token,
	// 			p : 1,
	// 			search : (typeof($scope.dataObject.search)=="undefined")?"":$scope.dataObject.search
	// 		})
	// 	}).success(function(response) {
	// 		console.log(response);
	// 		if (response.RESPONSE_STATUS == 100) {
	// 			console.log("获取数据成功");
	// 			var orderData = response.RESPONSE_INFO.list.list;
	// 			$scope.itemsData = [];
	// 			for (var i = 0; i < orderData.length; i++) {
	// 				var proData = orderData[i].product;
	// 				for (var j = 0; j < proData.length; j++) {
	// 					proData[j].create_time = orderData[i].create_time;
	// 					proData[j].number = orderData[i].number;
	// 					proData[j].order_id = orderData[i].order_id;
	// 					$scope.itemsData.push(proData[j]);
	// 				};
	// 			};
	// 			console.log($scope.itemsData);

	// 		}else {
	// 			$scope.showTips(response.Tips);
	// 		}
	// 	}).error(function() {
	// 		$scope.showTips("获取数据失败");
	// 	})
	// }
	// $scope.getOrderData();







	$scope.dataObject = {
		search: ""
	};


	// 加载
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

			$http({
				url: API.orderReturn_myorder,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					search : (typeof($scope.dataObject.search)=="undefined")?"":$scope.dataObject.search,
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					p : currentPage
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					console.log("获取数据成功");
					$ionicLoading.hide();
					loadding = false;

					pageCount = response.RESPONSE_INFO.page.pageCount;
					$scope.itemCount = response.RESPONSE_INFO.page.itemCount;
					var data = response.RESPONSE_INFO.list;
					for (var i = 0; i < data.length; i++) {
						$scope.itemsData.push(data[i]);
					};

					if (currentPage < pageCount) {
						$scope.loadText = "点击加载更多";
					}else {
						$scope.loadText = "没有更多数据了";
					};
				}else {
					console.log("获取数据失败");
					$scope.showTips(response.Tips);
					loadding = false;
				};
			}).error(function() {
				console.log("error");
				$scope.showTips("获取数据失败");
				loadding = false;
			});
		}else {
			$scope.loadText = "没有更多数据了";
		};
	};
	// 第一次加载
	$scope.loadMoreData();





	// 搜索
	$scope.search = function (dataForm) {
		$scope.loadText = "点击加载更多";
		$scope.itemsData = [];
		currentPage = 0;
		$scope.itemCount = 0;
		pageCount = 1;
		$scope.loadMoreData();
	}



	$scope.goToReturn = function (obj) {
		//console.log(obj);
		localStorage.t_wantToReturnData = JSON.stringify(obj);
		$state.go("index.mine-return-1");
	}



})
// 退换货-1
.controller("ctrlMineReturn1", function($scope,$state,$rootScope,$ionicLoading) {
	//console.log("ctrlMineReturn1");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});
	$scope.wantToReturnData = JSON.parse(localStorage.t_wantToReturnData);
	$scope.wantToSubmitReturnData = {
		user_id:$rootScope.user_id,
		auth_token:$rootScope.auth_token,
		pro_id:$scope.wantToReturnData.id,
		// 退货件数 默认1
		num:1,
		content:"",
		// 服务类型 默认退货
		return_type:1,
		upfile:"",
		true_name:"",
		telephone:""
	}

	// 选择服务类型
	$scope.selectReturnType = function (id) {
		$scope.wantToSubmitReturnData.return_type = id;
	}

	// 用户选择的数量
	// 加
	$scope.add = function() {
		if ($scope.wantToSubmitReturnData.num >= $scope.wantToReturnData.product_json.num) {
			$ionicLoading.show({
				duration: "1500",
				template: "数量超出"
			});
		}else {
			$scope.wantToSubmitReturnData.num++
		};
	}
	// 减
	$scope.minus = function() {
		if ($scope.wantToSubmitReturnData.num > 1) {
			$scope.wantToSubmitReturnData.num--;
		};
	}

	// 文件地址
	function getObjectURL(file) {
		var url = null;
		if (window.createObjectURL != undefined) { // basic
			url = window.createObjectURL(file);
		} else if (window.URL != undefined) { // mozilla(firefox)
			url = window.URL.createObjectURL(file);
		} else if (window.webkitURL != undefined) { // webkit or chrome
			url = window.webkitURL.createObjectURL(file);
		}
		return url;
	}



	// CF.needJS("", FILEPATH + "lib/jquery-2.2.1.min.js", function() {
		// 图片上传
		$("#JuploadPic input").change(function() {
			//console.log($("#Jpic .upload-pic-item").length);
			if ($("#Jpic .upload-pic-item").length >= 3) {
				$scope.showTips("图片最多上传3张");
				return false;
			};
			var file = $(this)[0].files;
			for (var i = 0; i < file.length; i++) {
				(function (m) {
					var data = new FormData();
					data.append("upfile", file[m]);
					data.append('user_id', $rootScope.user_id);
					data.append('auth_token', $rootScope.auth_token);
					var imgObj = $("<div>", {
						"class": "upload-pic-item",
						"data-loadding": 1,
						"style": 'background-image:url(' + getObjectURL(file[i]) + ');',
						html: '<span class="upload-pic-item-loadding"></span><i class="upload-pic-item-del"></i>'
					});
					$("#Jpic").append(imgObj);
					imgObj.find(".upload-pic-item-del").on("click",function (e) {
						imgObj.remove();
					})

					$.ajax({
						type: "POST",
						url: API.orderReturn_upload,
						data: data,
						cache: false,
						contentType: false,
						processData: false,
						success: function(result) {
							//console.log(result);
							if (result.RESPONSE_STATUS == 100) {
								imgObj.removeAttr("data-loadding").attr("data-url",result.RESPONSE_INFO);
								imgObj.find(".upload-pic-item-loadding").remove();
							}
						},
						error:function (result) {
							$scope.showTips(result);
						}
					});
				})(i);
			};
		});



		$scope.next = function () {
			if ($scope.wantToSubmitReturnData.content == "" || typeof($scope.wantToSubmitReturnData.content) == "undefined") {
				$scope.showTips("请填写问题详细描述");
			}else {

				if ($("#Jpic .upload-pic-item").length == 0) {
					$scope.showTips("请上传图片");
					return false;
				};

				// 作品正在上传中
				var isLoadding = false;
				$("#Jpic .upload-pic-item").each(function (i) {
					if ($(this).attr("data-loadding")) {
						isLoadding = true;
						return false;
					}else {
						isLoadding = false;
					};
				});

				if (isLoadding) {
					$scope.showTips("图片正在上传中...");
					return false;
				};

				var product_pic_url = "";
				$("#Jpic .upload-pic-item").each(function (i) {
					product_pic_url += $(this).attr("data-url") + ",";
				});
				product_pic_url = product_pic_url.substring(0, product_pic_url.length - 1);


				$scope.wantToSubmitReturnData.upfile = product_pic_url;

				//console.log($scope.wantToSubmitReturnData);
				localStorage.t_wantToSubmitReturnData = JSON.stringify($scope.wantToSubmitReturnData);
				$state.go("index.mine-return-2");
			};
		}


	// });





















})
// 退换货-2
.controller("ctrlMineReturn2", function($scope,$state,$rootScope,$ionicLoading,$http) {
	//console.log("ctrlMineReturn2");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});
	$scope.wantToReturnData = JSON.parse(localStorage.t_wantToReturnData);
	$scope.wantToSubmitReturnData = JSON.parse(localStorage.t_wantToSubmitReturnData);




	// 提交
	$scope.submitReturn = function (dataForm) {
		if (dataForm.true_name.$error.required) {
			$scope.showTips("请填写您的姓名");
		} else if (dataForm.telephone.$error.required) {
			$scope.showTips("请填写您的手机号码");
		} else if (dataForm.telephone.$error.pattern) {
			$scope.showTips("请输入正确的手机号码");
		} else {
			//console.log($scope.wantToSubmitReturnData);
			localStorage.t_wantToSubmitReturnData = JSON.stringify($scope.wantToSubmitReturnData);
			$http({
				url: API.orderReturn_applyservice,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize($scope.wantToSubmitReturnData)
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					console.log("提交退换货订单成功");
					localStorage.t_wantToSubmitReturnId = response.RESPONSE_INFO.id;
					localStorage.t_wantToSubmitReturnNumber = response.RESPONSE_INFO.number;
					$state.go("index.mine-return-3");
				}else {
					$scope.showTips(response.Tips);
				}
			})
		};
	}
})
// 退换货-3
.controller("ctrlMineReturn3", function($scope,$state,$rootScope,$ionicLoading) {
	//console.log("ctrlMineReturn3");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});
	$scope.wantToReturnData = JSON.parse(localStorage.t_wantToReturnData);
	$scope.wantToSubmitReturnData = JSON.parse(localStorage.t_wantToSubmitReturnData);
	$scope.wantToSubmitReturnId = localStorage.t_wantToSubmitReturnId;
	$scope.wantToSubmitReturnNumber = localStorage.t_wantToSubmitReturnNumber;

	// 查看服务单
	$scope.goDetail = function () {
		localStorage.removeItem("t_wantToReturnData");
		localStorage.removeItem("t_wantToSubmitReturnData");
		localStorage.removeItem("t_wantToSubmitReturnId");
		localStorage.removeItem("t_wantToSubmitReturnNumber");
		$state.go("index.mine-return-detail",{id:$scope.wantToSubmitReturnId});
	}
})
// 退换货进度
.controller("ctrlMineReturnRate", function($scope,$state,$rootScope,$ionicLoading,$http) {
	//console.log("ctrlMineReturnRate");
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

			$http({
				url: API.orderReturn_retunlist,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					page : currentPage
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$ionicLoading.hide();
					loadding = false;
					console.log("获取数据成功");
					pageCount = response.RESPONSE_INFO.page.pageCount;
					$scope.itemCount = response.RESPONSE_INFO.page.itemCount;
					var data = response.RESPONSE_INFO.list;
					for (var i = 0; i < data.length; i++) {
						$scope.itemsData.push(data[i]);
					};

					if (currentPage < pageCount) {
						$scope.loadText = "点击加载更多";
					}else {
						$scope.loadText = "没有更多数据了";
					};
				}else {
					console.log("获取数据失败");
					$scope.showTips(response.Tips);
					loadding = false;
				};
			});
		}else {
			$scope.loadText = "没有更多数据了";
		};
	};
	// 第一次加载
	$scope.loadMoreData();







})
// 退换货详情
.controller("ctrlMineReturnDetail", function($scope,$state,$rootScope,$ionicLoading,$http) {
	//console.log("ctrlMineReturnDetail");
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

	$scope.return_id = $state.params.id;


	// 详情
	$http({
		url: API.orderReturn_retundetail,
		method: "POST",
		headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
		data: $rootScope.serialize({
			user_id : $rootScope.user_id,
			auth_token : $rootScope.auth_token,
			return_id : $scope.return_id
		})
	}).success(function(response) {
		//console.log(response);
		if (response.RESPONSE_STATUS == 100) {
			$ionicLoading.hide();
			loadding = false;
			console.log("查询退换货详情成功");
			$scope.returnData = response.RESPONSE_INFO.return;
		}else {
			$scope.showTips(response.Tips);
			loadding = false;
		}
	})




})


// 收藏-达人
.controller("ctrlMineCollectTalent", function($scope, $state, $ionicLoading, $http, $rootScope, $ionicHistory,$ionicPopup) {
	//console.log("ctrlMineCollectTalent");
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


	$scope.getTalentData = function () {
		$http({
			url: API.fans_getfans,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				type : 1
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				$ionicLoading.hide();
				loadding = false;
				console.log("获取收藏的达人成功");
				$scope.talentData = response.RESPONSE_INFO.list;
			}else {
				$scope.showTips(response.Tips);
				loadding = false;
			}
		}).error(function() {
			console.log("获取收藏的达人不成功");
		})
	}

	$scope.getTalentData();

})
// 收藏-商店
.controller("ctrlMineCollectShop", function($scope, $state, $ionicLoading, $http, $rootScope, $ionicHistory,$ionicPopup) {
	//console.log("ctrlMineCollectShop");
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


	$scope.getShopData = function () {
		$http({
			url: API.fans_getfans,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				type : 3
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				$ionicLoading.hide();
				loadding = false;
				console.log("获取收藏的商家成功");
				$scope.shopData = response.RESPONSE_INFO.list;
			}else {
				$scope.showTips(response.Tips);
				loadding = false;
			}
		}).error(function() {
			console.log("获取收藏的商家不成功");
		})
	}
	$scope.getShopData();
	$scope.getScenicData = function () {
		$http({
			url: API.fans_getfans,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				type : 2
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				console.log("获取收藏的景点成功");
				$scope.scenicData = response.RESPONSE_INFO.list;
			}else {
				$scope.showTips(response.Tips);
			}
		}).error(function() {
			console.log("获取收藏的景点不成功");
		})
	}
	$scope.getScenicData();
})
// 收藏-商品
.controller("ctrlMineCollectProduct", function($scope, $state, $ionicLoading, $http, $rootScope, $ionicHistory,$ionicPopup) {
	//console.log("ctrlMineCollectProduct");
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

	$scope.getProductData = function () {
		$http({
			url: API.fans_getfans,
			method: "POST",
			headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
			data: $rootScope.serialize({
				user_id : $rootScope.user_id,
				auth_token : $rootScope.auth_token,
				type : 4
			})
		}).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {

				$ionicLoading.hide();
				loadding = false;
				console.log("获取收藏的商品数据成功");
				$scope.productData = response.RESPONSE_INFO.list;
			}else {
				$scope.showTips(response.Tips);
			}
		}).error(function() {
			console.log("获取收藏的商品数据不成功");
		})
	}

	$scope.getProductData();

})

// 关于
.controller("ctrlMineAbout", function($scope,$state,$rootScope) {
	//console.log("ctrlMineAbout");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});
})

// 用户反馈
.controller("ctrlMineFeedback", function($scope,$rootScope,$ionicPopup,$state,$http,$ionicLoading) {
	//console.log("ctrlMineFeedback");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

	$scope.dataObject = {
		content: ""
	};
	$scope.feedback = function (dataForm) {
		if (dataForm.content.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请输入您的建议"
			});
		} else {
			$http({
				url: API.user_feedback,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					nick_name : ($rootScope.nickname ? $rootScope.nickname : $rootScope.username),
					content : $scope.dataObject.content
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您的建议已经成功提交");
					$scope.dataObject.content = "";
					setTimeout(function () {
						if ($ionicHistory.viewHistory().backView == null) {
							$state.go("index.mine");
						} else {
							$ionicHistory.goBack();
						};
					},1500);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				console.log("反馈失败");
			})
		}
	}

})
// 我的邀请码
.controller("ctrlMineInvite", function($scope,$rootScope,$ionicPopup,$state,$http,$ionicLoading,$ionicHistory) {
	//console.log("ctrlMineInvite");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});
	// 邀请码code
	$scope.dataObject = {
		number: ""
	};


	// 优惠券
	$scope.invite = function (dataForm) {
		if (dataForm.number.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请输入您的邀请码"
			});
		} else {
			$http({
				url: API.user_invite,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					number : $scope.dataObject.number
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					console.log("输入邀请码成功");
					$rootScope.busines_id = localStorage.busines_id = $scope.dataObject.number;
					$scope.showTips(response.Tips);
					setTimeout(function () {
						$ionicHistory.goBack();
					},2000);
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				console.log("输入邀请码失败");
			})
		}
	}


})
// 申请成为达人
.controller("ctrlMineApply", function($scope, $state, $ionicLoading, $http, $rootScope, $ionicHistory,$ionicPopup,addressData) {
	//console.log("ctrlMineApply");
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



	$scope.talentLink = location.origin + "/TalentManager/Public/login";

	// 初始化
	$scope.status = 99;

	$scope.check = function () {
		$http({
			url: API.talentApply_isapply,
			// url: API.talentApply_gettalent,
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
				//console.log("获取验证达人数据成功");
				// 状态：-1.未申请过，0.正在审核中，1.已成为达人，2.审核不通过
				$scope.status = response.RESPONSE_INFO.status;
				// $scope.status = -1;
				if ($scope.status == 1) {
					$http({
						// url: API.talentApply_isapply,
						url: API.talentApply_gettalent,
						method: "POST",
						headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
						data: $rootScope.serialize({
							user_id : $rootScope.user_id,
							auth_token : $rootScope.auth_token
						})
					}).success(function(response) {
						//console.log(response);
						if (response.RESPONSE_STATUS == 100) {
							console.log("获取验证达人数据成功");
							$scope.true_name = response.RESPONSE_INFO.talent.true_name;
							$scope.telephone = response.RESPONSE_INFO.talent.telephone;
							$scope.password = response.RESPONSE_INFO.talent.password;
							$scope.user_id = response.RESPONSE_INFO.talent.user_id;
						}else {
							$scope.showTips(response.Tips);
						}
					}).error(function() {
						console.log("获取验证达人数据失败");
					})

				};
			}else {
				$scope.showTips(response.Tips);
				loadding = false;
			}
		}).error(function() {
			console.log("获取验证达人数据失败");
		})
	}

	$scope.check();

	// 申请达人
	$scope.dataObject = {
		true_name: "",
		telephone: ""
	};
	// 申请达人
	$scope.apply = function (dataForm) {
		if (dataForm.true_name.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请输入您的名字"
			});
		}else if (dataForm.telephone.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请输入您的联系电话"
			});
		}else if (dataForm.telephone.$error.pattern) {
			$ionicLoading.show({
				duration: "800",
				template: "请输入正确的手机号码"
			});
		}else {
			$ionicLoading.show({
				template: "正在发送申请..."
			});
			$http({
				url: API.talentApply_applytalent,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					true_name : $scope.dataObject.true_name,
					telephone : $scope.dataObject.telephone,
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips("您已成功发送申请");
					//console.log("申请达人数据成功");
					$scope.check();
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				$scope.showTips("发送失败");
			})
		}
	}
	// 再次申请
	$scope.applyAgain = function () {
		$scope.status = -1;
	}

})


// 达人规则
.controller("ctrlMineApplyRule", function($scope,$state, $rootScope) {
	//console.log("ctrlMineApplyRule");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});
})
// 地址
.controller("ctrlMineAddress", function($scope, $state, $ionicLoading, $http, $rootScope, $ionicHistory,$ionicPopup,addressData) {
	//console.log("ctrlMineAddress");
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


	// 如果上一页是从订单页过来的
	if ($ionicHistory.viewHistory().backView != null) {
		if ($ionicHistory.viewHistory().backView.stateName == "index.find-order") {
			$scope.isFromOrder = true;
		};
	};
	//console.log(addressData.selectId.address_id);
	// 订单页选择地址 传用户选定的id
	$scope.selectAddress = function (id) {
		if ($scope.isFromOrder) {
			addressData.selectId = {
				address_id : id
			}
			$ionicHistory.goBack();
		};
	}

	// 添加修改地址成功之后清空原来填写的内容
	addressData.dataObject = {
		region_id: "",
		true_name: "",
		telephone: "",
		address: ""
	};
	addressData.dataText = {
		provinceText :"",
		cityText :"",
		areaText :""
	};

	// 获取地址列表
	$scope.getAddressData = function () {
		$http.get(API.address_addresslist + "?" + $rootScope.serialize({
			user_id : $rootScope.user_id,
			auth_token : $rootScope.auth_token,
			p : 1
		})).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				$ionicLoading.hide();
				loadding = false;

				//console.log("获取地址列表成功");
				$scope.addressData = response.RESPONSE_INFO.list;
			}else {
				$scope.showTips(response.Tips);
				loadding = false;
			};
		});
	}

	$scope.getAddressData();

	$scope.delAddress = function (id) {
		//console.log(id);
		// 确认对话框
		$ionicPopup.confirm({
			title: "系统提示",
			template: "您确定要将该地址删除吗？",
			cancelText: "取消",
			cancelType: "button-outline",
			okText: "确定",
			okType: "button-assertive button-outline"
		}).then(function(res) {
			//console.log(res);
			if (res) {
				//console.log("确定");
				$http({
					url: API.address_delete,
					method: "POST",
					headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
					data: $rootScope.serialize({
						user_id : $rootScope.user_id,
						auth_token : $rootScope.auth_token,
						id : id
					})
				}).success(function(response) {
					//console.log(response);
					if (response.RESPONSE_STATUS == 100) {
						//console.log("删除地址成功");
						$scope.getAddressData();
					}else {
						$scope.showTips(response.Tips);
					}
				}).error(function() {
					//console.log("删除地址不成功");
				})
			} else {
				console.log("取消");
			}
		});
	}
	// $scope.delAddress(2);


	$scope.setDefaultAddress = function (id) {
		//console.log(id);
		// 确认对话框
		$ionicPopup.confirm({
			title: "系统提示",
			template: "您确定要将该地址设置为默认地址吗？",
			cancelText: "取消",
			cancelType: "button-outline",
			okText: "确定",
			okType: "button-assertive button-outline"
		}).then(function(res) {
			//console.log(res);
			if (res) {
				//console.log("确定");
				$http({
					url: API.address_set_default,
					method: "POST",
					headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
					data: $rootScope.serialize({
						user_id : $rootScope.user_id,
						auth_token : $rootScope.auth_token,
						id : id
					})
				}).success(function(response) {
					//console.log(response);
					if (response.RESPONSE_STATUS == 100) {
						//console.log("设置默认地址成功");
						$scope.getAddressData();
					}else {
						$scope.showTips(response.Tips);
					}
				}).error(function() {
					console.log("设置默认地址不成功");
				})
			} else {
				console.log("取消");
			}
		});

	}
	// $scope.setDefaultAddress(3);



})
.controller("ctrlMineAddressEdit", function($scope, $state, $ionicLoading, $http, $rootScope, $ionicHistory,$ionicPopup,addressData) {
	//console.log("ctrlMineAddressEdit");
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

	$scope.addressId = $state.params.id;

	$scope.dataObject = addressData.dataObject;
	$scope.dataText = addressData.dataText;
	console.log($scope.dataText);

	$scope.addRegion = function () {
		addressData.dataObject = $scope.dataObject;
		addressData.dataText = $scope.dataText;
		console.log(addressData.dataObject);
		console.log(addressData.dataText);
		$state.go("index.mine-address-add-region");
	}

	// 获取地址详细
	$scope.getAddressData = function () {
		$http.get(API.address_detail + "?" + $rootScope.serialize({
			user_id : $rootScope.user_id,
			auth_token : $rootScope.auth_token,
			id : $scope.addressId
		})).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				$ionicLoading.hide();
				loadding = false;
				//console.log("获取地址详细成功");

				$scope.dataObject = {
					region_id: addressData.dataObject.region_id ? addressData.dataObject.region_id : response.RESPONSE_INFO.address.region_id,
					true_name: addressData.dataObject.true_name ? addressData.dataObject.true_name : response.RESPONSE_INFO.address.true_name,
					region_text: (addressData.dataText.provinceText + addressData.dataText.cityText + addressData.dataText.areaText == "") ? response.RESPONSE_INFO.address.region_text : (addressData.dataText.provinceText + addressData.dataText.cityText + addressData.dataText.areaText),
					telephone: addressData.dataObject.telephone ? addressData.dataObject.telephone : response.RESPONSE_INFO.address.telephone,
					address: addressData.dataObject.address ? addressData.dataObject.address : response.RESPONSE_INFO.address.address
				};
			}else {
				$scope.showTips(response.Tips);
				loadding = false;
			};
		});
	}

	$scope.getAddressData();


	$scope.editAddress = function (dataForm) {
		//console.log($scope.dataObject);
		if (dataForm.true_name.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填写收货人"
			});
		} else if (dataForm.telephone.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填手机号码"
			});
		} else if (dataForm.telephone.$error.pattern) {
			$ionicLoading.show({
				duration: "800",
				template: "请输入正确的手机号码"
			});
		} else if (dataForm.address.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填写详细地址"
			});
		} else {
			$http({
				url: API.address_update,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					id : $scope.addressId,
					region_id : $scope.dataObject.region_id,
					true_name : $scope.dataObject.true_name,
					telephone : $scope.dataObject.telephone,
					address : $scope.dataObject.address
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					console.log("编辑地址成功");
					$state.go("index.mine-address");
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				console.log("编辑地址不成功");
			})
		}

	}

})
.controller("ctrlMineAddressAdd", function($scope, $state, $ionicLoading, $http, $rootScope, $ionicHistory,$ionicPopup,addressData) {
	//console.log("ctrlMineAddressAdd");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});
	
	$scope.dataObject = addressData.dataObject;
	$scope.dataText = addressData.dataText;
	//console.log($scope.dataText);

	$scope.addRegion = function () {
		addressData.dataObject = $scope.dataObject;
		addressData.dataText = $scope.dataText;
		$state.go("index.mine-address-add-region");
	}
	$scope.regionText = $scope.dataText.provinceText + $scope.dataText.cityText + $scope.dataText.areaText;

	$scope.addAddress = function (dataForm) {
		console.log();
		if (dataForm.true_name.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填写收货人"
			});
		} else if ($scope.dataObject.region_id == "") {
			$ionicLoading.show({
				duration: "800",
				template: "所在地区不能为空"
			});
		} else if (dataForm.telephone.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填手机号码"
			});
		} else if (dataForm.telephone.$error.pattern) {
			$ionicLoading.show({
				duration: "800",
				template: "请输入正确的手机号码"
			});
		} else if (dataForm.address.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填写详细地址"
			});
		} else {
			$http({
				url: API.address_create,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					user_id : $rootScope.user_id,
					auth_token : $rootScope.auth_token,
					region_id : $scope.dataObject.region_id,
					true_name : $scope.dataObject.true_name,
					telephone : $scope.dataObject.telephone,
					address : $scope.dataObject.address
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					//console.log("添加地址成功");
					// $state.go("index.mine-address");
					$ionicHistory.goBack();
				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				console.log("添加地址不成功");
			})

		}

	}

})
.controller("ctrlMineAddressAddRegion", function($scope, $state, $ionicLoading, $http, $rootScope, $ionicHistory,$ionicPopup,addressData) {
	//console.log("ctrlMineAddressAddRegion");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});


	$scope.dataObject = addressData.dataObject;
	$scope.dataText = addressData.dataText;


	$scope.getRegionData = function () {
		$http.get(API.address_getregion + "?" + $rootScope.serialize({
			user_id : $rootScope.user_id,
			auth_token : $rootScope.auth_token
		})).success(function(response) {
			//console.log(response);
			if (response.RESPONSE_STATUS == 100) {
				//console.log("获取区域信息成功");
				$scope.regionData = response.RESPONSE_INFO.region;
			}else {
				$scope.showTips(response.Tips);
			};
		});
	}
	$scope.getRegionData();

	$scope.isCityOpen = false;
	$scope.toggleCity = function (id,text) {
		this.isCityOpen = !this.isCityOpen;
		if (this.isCityOpen) {
			$scope.dataText.provinceText = text;
		};
	}
	$scope.isAreaOpen = false;
	$scope.toggleArea = function (id,text) {
		this.isAreaOpen = !this.isAreaOpen;
		if (this.isAreaOpen) {
			$scope.dataText.cityText = text;
		};
	}
	$scope.selectArea = function (id,text) {
		
		$scope.dataText.areaText = text;
		$scope.dataObject.region_id = id;

		addressData.dataObject = $scope.dataObject;
		addressData.dataText = $scope.dataText;
		//console.log(addressData.dataObject);
		///(addressData.dataText);
		$state.go("index.mine-address-add");

		// 如果有上一页，回到上一页，如果没有回到地址页面
		if ($ionicHistory.viewHistory().backView == null) {
			$state.go("index.mine-address");
		} else {
			$ionicHistory.goBack();
		};

	}

})

// 登录
.controller("ctrlMineLogin", function($scope, $state, $ionicLoading, $http, $rootScope, $ionicHistory,$ionicPopup,$timeout) {
	//console.log("ctrlMineLogin");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
        //微信分享
        $rootScope.wxShare('欢迎登录', '途礼游', '');
	});


	// 把上一页存入cookie
	if ($ionicHistory.viewHistory().backView != null) {
		var data = {
			stateName:$ionicHistory.viewHistory().backView.stateName,
			stateParams:$ionicHistory.viewHistory().backView.stateParams,
            url: $ionicHistory.viewHistory().backView.url
		}
        //console.log($ionicHistory.viewHistory().backView);
		sessionStorage.t_loginHistory = JSON.stringify(data);
	};

	// // 登录之前先授权
	// setTimeout(function () {
	// 	$rootScope.getWechatInfo();
	// },100);

	// 登录成功后返回
	function goback() {
		// 优先读缓存
		if (sessionStorage.t_loginHistory) {
			var historyObj = JSON.parse(sessionStorage.t_loginHistory);
			sessionStorage.removeItem("t_loginHistory");
			$state.go(historyObj.stateName, historyObj.stateParams);
		} else {
			// 如果有上一页，回到上一页，如果没有回到首页
			if ($ionicHistory.viewHistory().backView == null) {
				$state.go("index.mine", {
					random: CF.randomString(16)
				});
			} else {
				if ($ionicHistory.viewHistory().backView.stateName == "index.mine") {
					$state.go("index.mine", {
						random: CF.randomString(16)
					});
				} else {
					$ionicHistory.goBack();
				};
			};
		}
	}

	//登陆
	$scope.dataObject = {
		username: "",
		password: ""
	};
	$scope.login = function(dataForm) {
        sessionStorage["t_loginWechat"] = "account";
        if (sessionStorage.store_key) {
            $scope.dataObject.store_key = sessionStorage.store_key;
        }
		if (dataForm.username.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填手机号码"
			});
		} else if (dataForm.username.$error.pattern) {
			$ionicLoading.show({
				duration: "800",
				template: "请输入正确的手机号码"
			});
		} else if (dataForm.password.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填写密码"
			});
		} else if (dataForm.password.$error.minlength || dataForm.password.$error.maxlength) {
			$ionicLoading.show({
				duration: "800",
				template: "密码位数是6到16之间"
			});
		} else {
			$http({
				url: API.user_login,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize($scope.dataObject)
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
                    sessionStorage.removeItem('store_key'); //删除商户编码
					// 把用户信息存到localStorage
					var userData = response.RESPONSE_INFO.user;  //console.log(userData);
					localStorage.auth_token = userData.auth_token;
					localStorage.nickname = userData.nickname;
                    localStorage.telephone = userData.telephone;
					localStorage.upfile = userData.upfile;
					localStorage.user_id = userData.user_id;
					localStorage.username = userData.username;
                    localStorage.sex = userData.sex;
					localStorage.busines_id = userData.busines_id;
					localStorage.isLoged = true;
					// 更新用户信息
					$rootScope.getUserInfo();
					// 清除缓存
					$timeout(function() {
						$ionicHistory.clearCache();
						goback();
                        //$rootScope.getWechatAccount();
                    }, 500);

				}else {
					$scope.showTips(response.Tips);
				}
			}).error(function() {
				console.log("error");
			})
		};
	}
	$scope.isShowWechatLogin = false;
	if (/MicroMessenger/i.test(navigator.userAgent)) {
		$scope.isShowWechatLogin = true;
	}else {
		if ($rootScope.isWebView) {
			$scope.isShowWechatLogin = true;
		}else {
			$scope.isShowWechatLogin = false;
		};
	}

	// 第三方账号登录
	$scope.wechatLogin = function () {
        //微信公账号登录
		if (/MicroMessenger/i.test(navigator.userAgent)) {

			//$http({
			//	url: API.connect_login,
			//	method: "POST",
			//	headers: {
			//		"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
			//	},
			//	data: $rootScope.serialize({
			//		openid: $rootScope.wechat_unionid,
			//		nickname: $rootScope.wechat_nickname,
			//		headimgurl: $rootScope.wechat_headimgurl,
             //       sex:  $rootScope.wechat_sex,
			//		source: "微信公众号",
			//		type: 0
			//	})
			//}).success(function(response) {
			//	// var aaa = response.RESPONSE_INFO.user;
			//	// for (var x in aaa) {
			//	// 	alert(x + ":" + aaa[x]);
			//	// }
            //
			//	if (response.RESPONSE_STATUS == 100) {
			//		// 把用户信息存到localStorage
			//		var userData = response.RESPONSE_INFO.user;
			//		localStorage.auth_token = userData.auth_token;
			//		localStorage.nickname = userData.nickname;
             //       localStorage.telephone = userData.telephone;
			//		localStorage.upfile = userData.upfile;
			//		localStorage.user_id = userData.user_id;
			//		localStorage.username = userData.username;
             //       localStorage.sex = userData.sex;
			//		localStorage.busines_id = userData.busines_id;
			//		localStorage.isLoged = true;
			//		// 更新用户信息
			//		$rootScope.getUserInfo();
			//		// 清除缓存
			//		$timeout(function() {
			//			$ionicHistory.clearCache();
			//			// 如果有上一页，回到上一页，如果没有回到首页
			//			if ($ionicHistory.viewHistory().backView == null) {
			//				$state.go("index.mine",{random:CF.randomString(16)});
			//			} else {
			//				if ($ionicHistory.viewHistory().backView.stateName == "index.mine") {
			//					$state.go("index.mine",{random:CF.randomString(16)});
			//				}else {
			//					$ionicHistory.goBack();
			//				};
			//			};
			//		}, 500);
			//	} else {
			//		$scope.showTips(response.Tips);
			//	}
			//}).error(function() {
			//	// alert("error");
			//	console.log("error");
			//})
            //$rootScope.delUserInfo();
			sessionStorage["t_loginWechat"] = "wechat"; //点击微信图片发起的登录，用于调整判断
            //`jsessionStorage["is_WechatLogin"] = 1;  //微信登录
			// 登录之前先授权
			$rootScope.getWechatInfo(
                $rootScope.wechatAutoLogin()
            );
		}else {
			if ($rootScope.isWebView) {
				// $scope.showTips("APP暂不支持微信联合登录");

				//微信授权，获取code
				Wechat.auth("snsapi_userinfo", function(response) {
					// alert(JSON.stringify(response));
					$rootScope.wechat_appid = localStorage.wechat_appid = CONST.appId;
					$rootScope.wechat_appsecret = localStorage.wechat_appsecret = CONST.appSecret;
					$rootScope.wechat_code = localStorage.wechat_code = response.code;

					// 获取微信unionid 和 openid
					// $http.get(API.weixin_get_weixin_user + "?" + $rootScope.serialize({
					$http.get(APIPATH + 'weixin/get_weixin_open_user' + "?" + $rootScope.serialize({
						code: $rootScope.wechat_code
					})).success(function(response) {
						// alert(JSON.stringify(response));
						// alert(JSON.stringify(response.RESPONSE_INFO.weixin));
						var weixin = response.RESPONSE_INFO.weixin;

						$rootScope.wechat_unionid = localStorage.wechat_unionid = weixin.unionid;
						$rootScope.wechat_openid = localStorage.wechat_openid = weixin.openid;
						$rootScope.wechat_nickname = localStorage.wechat_nickname = weixin.nickname;
						$rootScope.wechat_sex = localStorage.wechat_sex = weixin.sex;
						$rootScope.wechat_language = localStorage.wechat_language = weixin.language;
						$rootScope.wechat_city = localStorage.wechat_city = weixin.city;
						$rootScope.wechat_province = localStorage.wechat_province = weixin.province;
						$rootScope.wechat_country = localStorage.wechat_country = weixin.country;
						$rootScope.wechat_headimgurl = localStorage.wechat_headimgurl = weixin.headimgurl;


						$http({
							url: API.connect_login,
							method: "POST",
							headers: {
								"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
							},
							data: $rootScope.serialize({
                                key: sessionStorage.store_key ? sessionStorage.store_key : "",
								openid: $rootScope.wechat_unionid,
								nickname: $rootScope.wechat_nickname,
								headimgurl: $rootScope.wechat_headimgurl,
                                sex: $rootScope.wechat_sex,
								source: "APP",
								type: 0
							})
						}).success(function(response) {
							// var aaa = response.RESPONSE_INFO.user;
							// for (var x in aaa) {
							// 	alert(x + ":" + aaa[x]);
							// }

							if (response.RESPONSE_STATUS == 100) {
								// 把用户信息存到localStorage
								var userData = response.RESPONSE_INFO.user;
								localStorage.auth_token = userData.auth_token;
								localStorage.nickname = userData.nickname;
                                localStorage.telephone = userData.telephone;
                                localStorage.sex = userData.sex;
								localStorage.upfile = userData.upfile;
								localStorage.user_id = userData.user_id;
								localStorage.username = userData.username;
								localStorage.busines_id = userData.busines_id;
								localStorage.isLoged = true;
								// 更新用户信息
								$rootScope.getUserInfo();

                                sessionStorage.removeItem('store_key'); //删除商户编码

								// 清除缓存
								$timeout(function() {
									$ionicHistory.clearCache();
									goback();
								}, 500);
							} else {
								$scope.showTips(response.Tips);
							}
						}).error(function() {
							// alert("error");
							console.log("error");
						})
					});
				}, function(reason) {
					$scope.showTips("授权失败:" + reason);
				});
			}else {
				$scope.showTips("网页端暂不支持微信联合登录");
			};
		}
	}

})
// 注册
.controller("ctrlMineRegister", function($scope, $state, $ionicLoading, $http,$rootScope, $ionicPopup,$ionicHistory, $timeout) {
	//console.log("ctrlMineRegister");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
        //微信分享
        $rootScope.wxShare('欢迎注册', '途礼游', '');
	});


	$scope.back = function () {
		if ($ionicHistory.viewHistory().backView == null) {
			alert("aaa");
			$state.go("index.map",{city:(localStorage.getItem("w-cityName") ? localStorage.getItem("w-cityName") : "")});
		} else {
			alert("bbb");
			$ionicHistory.goBack();
		};
	}




	//注册
	$scope.dataObject = {
		upfile: "",
		username: "",
		code: "",
		password: "",
		repassword: "",
		// 邀请码 可以不填，但是填了就会判断有没这个用户代理商 邀请码就是用户代理商编号
		number: "",
		// 注册渠道 只有 微信公众号 APP
		source: "微信公众号"
	};
	// 区分注册渠道
	if (/MicroMessenger/i.test(navigator.userAgent)) {
		$scope.dataObject.source = "微信公众号";
	}else {
		if ($rootScope.isWebView) {
			$scope.dataObject.source = "APP";
		}else {
			$scope.dataObject.source = "微信公众号";
		};
	};


	$scope.avt = "img/avt.png";
	// 文件地址
	function getObjectURL(file) {
		var url = null;
		if (window.createObjectURL != undefined) { // basic
			url = window.createObjectURL(file);
		} else if (window.URL != undefined) { // mozilla(firefox)
			url = window.URL.createObjectURL(file);
		} else if (window.webkitURL != undefined) { // webkit or chrome
			url = window.webkitURL.createObjectURL(file);
		}
		return url;
	}

	$("#upfile").change(function() {
		$ionicLoading.show({
			template: "图片正在上传中..."
		});
		var file = $('#upfile')[0].files[0];
		
		var formData = new FormData();
		formData.append('upfile', file);
		$.ajax({
			type: "POST",
			url: API.user_reg_upload,
			data: formData,
			cache: false,
			contentType: false,
			processData: false,
			success: function(result) {
				//console.log(result);
				if (result.RESPONSE_STATUS == 100) {
					// 更新用户信息
					$scope.dataObject.upfile = result.RESPONSE_INFO;
					$scope.avt = getObjectURL(file);
					//console.log($scope.dataObject);
					$scope.showTips("图片上传成功");
				}
			},
			error:function (result) {
				$scope.showTips(result);
			}
		});
	})
	



	$scope.register = function(dataForm) {
		//console.log($scope.dataObject);
		if (dataForm.username.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填手机号码"
			});
		} else if (dataForm.username.$error.pattern) {
			$ionicLoading.show({
				duration: "800",
				template: "请输入正确的手机号码"
			});
		} else if (dataForm.password.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填写密码"
			});
		} else if (dataForm.password.$error.minlength || dataForm.password.$error.maxlength) {
			$ionicLoading.show({
				duration: "800",
				template: "密码位数是6到16之间"
			});
		} else if (dataForm.repassword.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请再次输入密码"
			});
		} else if (dataForm.repassword.$viewValue != dataForm.password.$viewValue) {
			$ionicLoading.show({
				duration: "800",
				template: "密码不一致"
			});
		} else if (dataForm.code.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填写验证码"
			});
		} else {
			//console.log($scope.dataObject);
			$http({
				url: API.user_register,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize($scope.dataObject)
			}).success(function(response) {
				//console.log(response);
				// var userData = response.RESPONSE_INFO.user;
				if (response.RESPONSE_STATUS == 100) {

                    // 把用户信息存到localStorage
                    var userData = response.RESPONSE_INFO.user;  //console.log(userData);
                    localStorage.auth_token = userData.auth_token;
                    localStorage.nickname = userData.nickname;
                    localStorage.telephone = userData.telephone;
                    localStorage.upfile = userData.upfile;
                    localStorage.user_id = userData.user_id;
                    localStorage.username = userData.username;
                    localStorage.sex = userData.sex;
                    localStorage.busines_id = userData.busines_id;
                    localStorage.isLoged = true;

                    // 更新用户信息
                    $rootScope.getUserInfo();

                    //一个提示对话框
                    //var myAlert = $ionicPopup.alert({
                    //    title: "恭喜您！注册成功！",
                    //    template: "马上去登陆账号。",
                    //    okText: "好的",
                    //    okType: "button-assertive"
                    //});

                    $timeout(function() {
                        //注册成功登陆跳转修改用户信息页
                        //$rootScope.isLoginGoUrl('index.mine-info');
                         var link = window.location.hostname;
                         var link_suffix = window.location.href;
                         var suffix = '/www';
                         if (link_suffix.indexOf('www_android_new')!=-1) {
                              suffix = '/www_android_new';
                         }else if(link_suffix.indexOf('www_ios')!=-1) {
                              suffix = '/www_ios';
                         }else {
                              suffix = '/www';
                         }
                         window.location.href = 'http://'+link+suffix+'/#/index/mine/info';
                        //myAlert.close();
                    }, 2000);


                }else {
					$scope.showTips(response.Tips);
				};


			}).error(function() {
				console.log("error");
			})


		};
	}

	// 发验证码
	$scope.sendVerifyCodeDisable = false;
	$scope.sendVerifyCodeText = "获取验证码";
	$scope.sendVerifyCodeNum = 60;
	$scope.sendVerifyCode = function(form){
		if (form.username.$error.required) {
			$ionicLoading.show({
				duration:"800",
				template: "请填手机号码"
			});
		}else if (form.username.$error.pattern) {
			$ionicLoading.show({
				duration:"800",
				template: "请输入正确的手机号码"
			});
		}else {
			$http({
				url: API.user_sendsms,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					type: "register",
					username: $scope.dataObject.username
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips(response.Tips);

					$scope.sendVerifyCodeDisable = true;
					$scope.sendVerifyCodeNum = 60;

					function countdown() {
						if ($scope.sendVerifyCodeNum == -1) {
							clearInterval(bbb);
							$scope.sendVerifyCodeDisable = false;
							$scope.sendVerifyCodeText = "获取验证码";
						}else {
							$scope.sendVerifyCodeText = "重新发送(" + $scope.sendVerifyCodeNum + ")";
							$scope.sendVerifyCodeNum --;
						};
					};
					var bbb = setInterval(function() {
						$scope.$apply(countdown);
					}, 1000);
					//console.log(form.username.$viewValue);


				}else {
					$scope.showTips(response.Tips);
				};

			}).error(function() {
				console.log("error");
			})
		}
	}



})
// 忘记密码页面
.controller("ctrlMineForgetPassword", function($scope, $state, $ionicLoading, $http,$rootScope, $ionicPopup) {
	//console.log("ctrlMineForgetPassword");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});

	//忘记密码
	$scope.dataObject = {
		username: "",
		code: "",
		password: "",
		repassword: ""
	};

	// 发验证码
	$scope.sendVerifyCodeDisable = false;
	$scope.sendVerifyCodeText = "获取验证码";
	$scope.sendVerifyCodeNum = 60;
	$scope.sendVerifyCode = function(form){
		if (form.username.$error.required) {
			$ionicLoading.show({
				duration:"800",
				template: "请填手机号码"
			});
		}else if (form.username.$error.pattern) {
			$ionicLoading.show({
				duration:"800",
				template: "请输入正确的手机号码"
			});
		}else {

			$http({
				url: API.user_sendsms,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize({
					type: "reset_password",
					username: $scope.dataObject.username
				})
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					$scope.showTips(response.Tips);

					$scope.sendVerifyCodeDisable = true;
					$scope.sendVerifyCodeNum = 60;

					function countdown() {
						if ($scope.sendVerifyCodeNum == -1) {
							clearInterval(bbb);
							$scope.sendVerifyCodeDisable = false;
							$scope.sendVerifyCodeText = "获取验证码";
						}else {
							$scope.sendVerifyCodeText = "重新发送(" + $scope.sendVerifyCodeNum + ")";
							$scope.sendVerifyCodeNum --;
						};
					};
					var bbb = setInterval(function() {
						$scope.$apply(countdown);
					}, 1000);
					//console.log(form.username.$viewValue);


				}else {
					$scope.showTips(response.Tips);
				};

			}).error(function() {
				console.log("error");
			})


		}
	}


	$scope.forgetPassword = function(dataForm) {
		//console.log($scope.dataObject);
		if (dataForm.username.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填手机号码"
			});
		} else if (dataForm.username.$error.pattern) {
			$ionicLoading.show({
				duration: "800",
				template: "请输入正确的手机号码"
			});
		} else if (dataForm.password.$error.minlength || dataForm.password.$error.maxlength) {
			$ionicLoading.show({
				duration: "800",
				template: "密码位数是6到16之间"
			});
		} else if (dataForm.repassword.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请再次输入密码"
			});
		} else if (dataForm.repassword.$viewValue != dataForm.password.$viewValue) {
			$ionicLoading.show({
				duration: "800",
				template: "密码不一致"
			});
		} else if (dataForm.code.$error.required) {
			$ionicLoading.show({
				duration: "800",
				template: "请填写验证码"
			});
		} else {
			//console.log($scope.dataObject);

			$http({
				url: API.user_reset_password,
				method: "POST",
				headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
				data: $rootScope.serialize($scope.dataObject)
			}).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					// 一个提示对话框
					$ionicPopup.alert({
						title: "恭喜您！修改密码成功！",
						template: "马上去登陆账号。",
						okText: "好的",
						okType: "button-assertive"
					}).then(function(res) {
						$state.go("index.mine-login");
					});

				}else {
					$scope.showTips(response.Tips);
				};


			}).error(function() {
				console.log("error");
			})

		};
		
	}


})
// 重置密码页面
.controller("ctrlMineResetPassword", function($scope, $ionicLoading, $state) {
	//console.log("ctrlMineResetPassword");
	$scope.$on('$ionicView.beforeEnter', function() {
		$rootScope.hideTabs = true;
	});



}).controller("ctrlMineRegisterClause", function($scope, $rootScope){
        $scope.$on('$ionicView.beforeEnter', function() {
            $rootScope.hideTabs = true;
        });

});
