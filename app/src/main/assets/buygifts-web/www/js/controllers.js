var ctrlApp = angular.module("starter.controllers", []);
ctrlApp.run(function($ionicPlatform, $rootScope, $state, $stateParams, $http, $ionicLoading, $ionicPopup, $location, $cordovaAppVersion, $cordovaFileTransfer, $cordovaFile, $cordovaFileOpener2, $ionicHistory) {
    $rootScope.isShowAlipay = false;
    $ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}

        //检查更新
        //if (ionic.Platform.isAndroid()) {
        //    checkUpdate();
        //}

        if ($rootScope.isWebView) {
            getVersion();
            //启动极光推送服务
            window.plugins.jPushPlugin.init();
            //调试模式，这样报错会在应用中弹出一个遮罩层显示错误信息
            window.plugins.jPushPlugin.setDebugMode(true);
        }

	});

    // 初始化获取用户当前经纬度
    var geolocation = new BMap.Geolocation();
    geolocation.getCurrentPosition(function(r) {
        if (this.getStatus() == BMAP_STATUS_SUCCESS) {
            var city = r.address.city;            
            localStorage['w-cityName'] = city;            
        } else {
            // alert('failed' + this.getStatus());
            //默认广州
            var city = '广州市';            
            localStorage['w-cityName'] = city;
        }
    }, {
        enableHighAccuracy: true
    })

    //获取版本号
    function getVersion() {
        $cordovaAppVersion.getVersionNumber().then(function (version) {
            var version_arr = version.split('.');
            //alert(version_arr[1]);
            //alert("目前版本："+version);
            //如果本地与服务端的APP版本不符合
            if (parseInt(version_arr[0])>2 || parseInt(version_arr[1])>=1) {
                $rootScope.isShowAlipay = true;
            }
            //alert($rootScope.isShowAlipay);
        });
    }

    //var onReceiveNotification = function (event) {
    //    try {
    //        window.alert('接收新的推送通知');
    //        var alert = event.aps.alert;//通知内容
    //        window.plugins.jPushPlugin.setBadge(event.aps.badge);
    //        console.log("JPushPlugin:onReceiveNotification key aps.alert:" + alert);
    //    }
    //    catch (exception) {
    //        window.alert(exception)
    //    }
    //};

    //打开通知
    var onOpenNotification = function (event) {
        try {
            //window.alert('打开通知消息');
            $state.go('index.mine-message');
            //alert(event);
            //window.plugins.jPushPlugin.setBadge(0);
            //window.plugins.jPushPlugin.resetBadge();
            //window.plugins.jPushPlugin.setApplicationIconBadgeNumber(0);
        }
        catch (exception) {
            //window.alert(exception)
        }
    };
    //document.addEventListener("jpush.receiveNotification", onReceiveNotification, false);
    document.addEventListener("jpush.openNotification", onOpenNotification, false);

    //安卓返回键
	$ionicPlatform.registerBackButtonAction(function (e) {
      sessionStorage.setItem("postTrue","true");
      e.preventDefault();
      if ($ionicHistory.viewHistory().backView == null) {
			$state.go("index.map",{city:(localStorage.getItem("w-cityName") ? localStorage.getItem("w-cityName") : "")});
		} else {
			$ionicHistory.goBack();
		};      
		// alert("aaa");
      // $ionicHistory.goBack();
      return false;
    }, 101);

    //showUpdateConfirmForce("2.0.2");

    //强制更新
    function showUpdateConfirmForce(version) {

        var confirmPopup = $ionicPopup.alert({
            title: '版本升级-' + version,
            template: '1.文件大小23.5M;</br>2.优化了少量BUG;</br>3.优化了运行速度;</br>4.请在WiFi环境下更新', //从服务端获取更新的内容
            okText: '升级'
        });
        confirmPopup.then(function (res) {
            if (res) {
                var url = "http://buygifts.3ncto.cn/tuliyou.apk"; //可以从服务端获取更新APP的路径
                cordova.InAppBrowser.open(url, '_system', 'location=yes,toolbarposition=top,closebuttoncaption=返回,enableViewportScale=yes');
            }
        });
    }

    // 自动检查更新
    function checkUpdate() {
        var serverAppVersion = "2.0.2"; //从服务端获取最新版本
        //showUpdateConfirm(serverAppVersion);
        //$http.get(API.getVersion)
        //    .success(function (largeLoad) {
        //        console.log(largeLoad);
        //        //获取版本
        //        serverAppVersion = largeLoad[0].name;
                $cordovaAppVersion.getVersionNumber().then(function (version) {
                    //alert("目前版本："+version);
                    //如果本地与服务端的APP版本不符合
                    if (version != serverAppVersion) {
                        showUpdateConfirm(serverAppVersion);
                    }
                });
            //})
            //.error(function (data, status, headers, config) {
            //    $ionicLoading.show({template: '读取版本信息失败！', noBackdrop: true, duration: 2000});
            //});
    }

    // 显示是否更新对话框
    function showUpdateConfirm(version) {
        var confirmPopup = $ionicPopup.confirm({
            title: '版本升级-' + version,
            template: '1.文件大小23.5M;</br>2.优化了少量BUG;</br>3.优化了运行速度;</br>4.请在WiFi环境下更新', //从服务端获取更新的内容
            cancelText: '取消',
            okText: '升级'
        });
        confirmPopup.then(function (res) {
            if (res) {
                $ionicLoading.show({
                    template: "已经下载：0%"
                });
                var url = "http://122.11.38.214/dl/appdl/application/apk/9c/9c83ae56661c4d46bce32c2e5665a902/com.tuliyou.buygifts.1605191942.apk?sign=portal@portal1465281610715&source=portalsite"; //可以从服务端获取更新APP的路径
                var targetPath = "file:///storage/sdcard0/Download/com.tuliyou.buygifts.1605191942.apk"; //APP下载存放的路径，可以使用cordova file插件进行相关配
                var trustHosts = true
                var options = {};
                $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
                    // 打开下载下来的APP
                    $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive').then(function () {
                            // 成功
                            $ionicLoading.show({
                                template: "下载完成"
                            });
                            //alert("下载完成");
                        }, function (err) {
                            // 错误
                        });
                    $ionicLoading.hide();

                }, function (err) {
                    $ionicLoading.show({template: '下载失败！', noBackdrop: true, duration: 2000});
                }, function (progress) {
                    //进度，这里使用文字显示下载百分比
                    //$timeout(function () {
                        var downloadProgress = (progress.loaded / progress.total) * 100;
                        $ionicLoading.show({
                            template: "已经下载：" + Math.floor(downloadProgress) + "%"
                        });
                        if (downloadProgress > 99) {
                            $ionicLoading.hide();
                        }
                   // });
                },false);
            } else {
                // 取消更新
            }
        });
    }


	$rootScope.deviceInformation = ionic.Platform.device();

	$rootScope.isWebView = ionic.Platform.isWebView();
	$rootScope.isIPad = ionic.Platform.isIPad();
	$rootScope.isIOS = ionic.Platform.isIOS();
	$rootScope.isAndroid = ionic.Platform.isAndroid();
	$rootScope.isWindowsPhone = ionic.Platform.isWindowsPhone();

	$rootScope.currentPlatform = ionic.Platform.platform();
	$rootScope.currentPlatformVersion = ionic.Platform.version();

	// 定义全局变量
	$rootScope.serialize = function(obj) {
		var ret = [],
			i;
		for (i in obj) {
			if (obj.hasOwnProperty(i)) {
				ret.push("" + i + "=" + obj[i]);
			}
		}
		return ret.join("&");
	}

	// 处理ajax post http://stackoverflow.com/questions/12190166/angularjs-any-way-for-http-post-to-send-request-parameters-instead-of-json
	// $http.defaults.transformRequest.unshift($httpParamSerializerJQLike);

	// 删除用户信息
	$rootScope.delUserInfo = function () {
        //console.log("删除用户信息了");
		localStorage.removeItem("auth_token");
		localStorage.removeItem("nickname");
        localStorage.removeItem("telephone");
        localStorage.removeItem("sex");
		localStorage.removeItem("upfile");
		localStorage.removeItem("user_id");
		localStorage.removeItem("username");
		localStorage.removeItem("busines_id");

		if (/MicroMessenger/i.test(navigator.userAgent)) {
			localStorage.removeItem("wechat_code");
			//localStorage.removeItem("wechat_openid");
			localStorage.removeItem("wechat_unionid");
			localStorage.removeItem("wechat_nickname");
			localStorage.removeItem("wechat_sex");
			localStorage.removeItem("wechat_language");
			localStorage.removeItem("wechat_city");
			localStorage.removeItem("wechat_province");
			localStorage.removeItem("wechat_country");
			localStorage.removeItem("wechat_headimgurl");
		};

		localStorage.isLoged = false;
		$rootScope.isLoged = localStorage.isLoged == "true" ? true : false;
        sessionStorage.removeItem("t_loginWechat");
	}
	// 全局变量，是否登录
	$rootScope.isLoged = localStorage.isLoged == "true" ? true : false;

	// 更新用户信息
	$rootScope.getUserInfo = function () {
		$rootScope.auth_token = localStorage.getItem("auth_token") ? localStorage.getItem("auth_token") : "";
		$rootScope.nickname = localStorage.getItem("nickname") ? localStorage.getItem("nickname") : "";
        $rootScope.telephone = localStorage.getItem("telephone") ? localStorage.getItem("telephone") : "";
        $rootScope.sex = localStorage.getItem("sex") ? localStorage.getItem("sex") : "";
		$rootScope.upfile = localStorage.getItem("upfile") ? localStorage.getItem("upfile") : "";
		$rootScope.user_id = localStorage.getItem("user_id") ? localStorage.getItem("user_id") : "";
		$rootScope.username = localStorage.getItem("username") ? localStorage.getItem("username") : "";
		$rootScope.busines_id = localStorage.getItem("busines_id") ? localStorage.getItem("busines_id") : "";


		if (/MicroMessenger/i.test(navigator.userAgent)) {
			//$rootScope.wechat_code = localStorage.getItem("wechat_code") ? localStorage.getItem("wechat_code") : "";
			$rootScope.wechat_openid = localStorage.getItem("wechat_openid") ? localStorage.getItem("wechat_openid") : "";
			$rootScope.wechat_unionid = localStorage.getItem("wechat_unionid") ? localStorage.getItem("wechat_unionid") : "";
			$rootScope.wechat_nickname = localStorage.getItem("wechat_nickname") ? localStorage.getItem("wechat_nickname") : "";
			$rootScope.wechat_sex = localStorage.getItem("wechat_sex") ? localStorage.getItem("wechat_sex") : "";
			$rootScope.wechat_language = localStorage.getItem("wechat_language") ? localStorage.getItem("wechat_language") : "";
			$rootScope.wechat_city = localStorage.getItem("wechat_city") ? localStorage.getItem("wechat_city") : "";
			$rootScope.wechat_province = localStorage.getItem("wechat_province") ? localStorage.getItem("wechat_province") : "";
			$rootScope.wechat_country = localStorage.getItem("wechat_country") ? localStorage.getItem("wechat_country") : "";
			$rootScope.wechat_headimgurl = localStorage.getItem("wechat_headimgurl") ? localStorage.getItem("wechat_headimgurl") : "";
		};

		// 如果common.js的判断还没完成就进入这里了,那么再判断一次
		if (localStorage.isLoged || localStorage.isLoged=="true") {
			$rootScope.isLoged = localStorage.isLoged == "true" ? true : false;
            sessionStorage.removeItem("t_loginWechat");
		}else {
			// 再次判断是否登录
			if ($rootScope.auth_token) {
				$http({
					url: API.user_my,
					method: "POST",
					headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
					data: $rootScope.serialize({
						user_id : $rootScope.user_id,
						auth_token : $rootScope.auth_token
					})
				}).success(function(response) {
					if (response.RESPONSE_STATUS == 100) {
						localStorage.isLoged = true;
						$rootScope.isLoged = true;
					}else {
						$rootScope.delUserInfo();
					}
				}).error(function() {
					$rootScope.delUserInfo();
				})
			};
		};
	}
	$rootScope.getUserInfo();


	// 判断是否登录 如果已经登陆则跳页面
	$rootScope.isLoginGoUrl = function (url,params) {
		//console.log($rootScope.isLoged);
		if (!$rootScope.isLoged) {
			$ionicPopup.alert({
				title: "提示：",
				template: "您还未登录，请先登录",
				okText: "好的",
				okType: "button-assertive"
			}).then(function(res) {
                $rootScope.delUserInfo();
				$state.go("index.mine-login");
			});
		}else {
			if (params) {
				$state.go(url,params,{reload:true});
			}else {
				$state.go(url);
			};
		}
	}

    //判断是否通过短链接进来 存在参数key并且key有效
    var store_key = $location.search();
    //console.log(sessionStorage.store_key);
    //console.log(store_key.key);
    if (store_key.key || sessionStorage.store_key) {
        var key = '';
        if (store_key.key) {
            key = store_key.key;
        } else {
            key = sessionStorage.store_key;
        }
        //console.log('store_key:'+ key);
        if ($rootScope.isLoged) {
            $http({
                url: API.bind_user_store,
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
                data: $rootScope.serialize({
                    key : key,
                    user_id : $rootScope.user_id,
                    auth_token : $rootScope.auth_token
                })
            }).success(function(response) {
                //console.log(response);
                if (response.RESPONSE_STATUS == 200) {
                    //清空商户编码
                   sessionStorage.removeItem("store_key");
                }else if(response.RESPONSE_STATUS == 400) {
                    sessionStorage.removeItem("store_key");
                    $rootScope.showTips(response.Tips);
                }
            }).error(function() {
                console.log("error");
            })
        } else {
            sessionStorage.store_key = store_key.key ? store_key.key : sessionStorage.store_key;
            //console.log(sessionStorage);
        }
    }

	// 直接跳页面
	$rootScope.goUrl = function (url) {
        if(url === 'index.find' || url === 'index.find-talent'){
            $rootScope.$emit('initBanner');
        }        
		$state.go(url);
	}

	// 微信中初始化的时候自动登录
	$rootScope.wechatAutoLogin = function () {
		if (/MicroMessenger/i.test(navigator.userAgent)) { console.log("xx:"+$rootScope.isLoged);
			if (!$rootScope.isLoged) {
                $rootScope.wechat_unionid = $rootScope.wechat_unionid=="undefined" ? "" : $rootScope.wechat_unionid;
                $rootScope.wechat_nickname = $rootScope.wechat_nickname=="undefined" ? "" : $rootScope.wechat_nickname;
                $rootScope.wechat_nickname = $rootScope.wechat_nickname=="undefined" ? "" : $rootScope.wechat_nickname;
                console.log( $rootScope.wechat_unionid);
				if ($rootScope.wechat_unionid && $rootScope.wechat_nickname && $rootScope.wechat_nickname!="undefined") {
					//if ((location.href.indexOf("login") == -1 && location.href.indexOf("register") == -1 && location.href.indexOf("forgetPassword") == -1)) {

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
                                    source: "微信公众号",
                                    type: 0
                                })
                            }).success(function(response) {
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
                                    //sessionStorage.removeItem('store_key'); //删除商户编码
                                    //点击微信登录
                                    if (sessionStorage.t_loginWechat=="account") { //点击微信登录
                                        sessionStorage.removeItem("t_loginWechat");
                                        if (location.search) {
                                            location.href = location.origin + location.pathname + "#/index/mine/random/";
                                        }
                                    }
                                    else {
                                        //if (location.search) {
                                            console.log("history："+sessionStorage.wechatLogin_History);
                                            //return false;
                                        var history_url = sessionStorage.wechatLogin_History;
                                        if ((history_url.indexOf("login") == -1 && history_url.indexOf("register") == -1 && history_url.indexOf("forgetPassword") == -1)) {
                                            if (sessionStorage.wechatLogin_History) {
                                                location.href = sessionStorage.wechatLogin_History;
                                            } else {
                                                location.href = location.origin + location.pathname + location.hash;
                                            }
                                        } else {
                                            location.href = location.origin + location.pathname + "#/index/mine/random/";
                                            //$state.go("index.mine", {
                                            //    random: CF.randomString(16)
                                            //});
                                        }
                                        //}
                                    }

                                } else {
                                    $rootScope.showTips(response.Tips);
                                }
                            }).error(function() {
                                console.log("error");
                            })
                    //}
				}
			}
		}
	}

	// 获取微信数据
	$rootScope.getWechatInfo = function(refunc) {
		if (/MicroMessenger/i.test(navigator.userAgent)) {
			// 写入微信数据
			$rootScope.wechat_appid = localStorage.wechat_appid = CONST.appId;
			$rootScope.wechat_appsecret = localStorage.wechat_appsecret = CONST.appSecret;
			//$rootScope.wechat_code = localStorage.getItem("wechat_code") ? localStorage.getItem("wechat_code") : "";
			$rootScope.wechat_openid = localStorage.getItem("wechat_openid") ? localStorage.getItem("wechat_openid") : "";
			$rootScope.wechat_unionid = localStorage.getItem("wechat_unionid") ? localStorage.getItem("wechat_unionid") : "";
			$rootScope.wechat_nickname = localStorage.getItem("wechat_nickname") ? localStorage.getItem("wechat_nickname") : "";
			$rootScope.wechat_sex = localStorage.getItem("wechat_sex") ? localStorage.getItem("wechat_sex") : "";
			$rootScope.wechat_language = localStorage.getItem("wechat_language") ? localStorage.getItem("wechat_language") : "";
			$rootScope.wechat_city = localStorage.getItem("wechat_city") ? localStorage.getItem("wechat_city") : "";
			$rootScope.wechat_province = localStorage.getItem("wechat_province") ? localStorage.getItem("wechat_province") : "";
			$rootScope.wechat_country = localStorage.getItem("wechat_country") ? localStorage.getItem("wechat_country") : "";
			$rootScope.wechat_headimgurl = localStorage.getItem("wechat_headimgurl") ? localStorage.getItem("wechat_headimgurl") : "";

			if (CF.queryString("code")) {
				$rootScope.wechat_code = CF.queryString("code");
			}
            //alert('localStorage code:'+localStorage.wechat_code);
            //alert('CF:'+ CF.queryString("code"));

            //通过CODE和Token请求Unionid 和 Openid
			if ($rootScope.wechat_code && !$rootScope.isLoged) {  //存在CODE并且未登录才从新授权获取OPENID
                //if (!$rootScope.wechat_unionid || !$rootScope.wechat_openid) {
                    $http.get(API.weixin_get_weixin_user + "?" + $rootScope.serialize({
                        code: $rootScope.wechat_code
                    })).success(function(response) {
                        if (response.RESPONSE_STATUS == 100) {
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

                            console.log("t_loginWechat：" + sessionStorage.t_loginWechat);
                            if (sessionStorage.t_loginWechat=="weacht" || (sessionStorage.t_loginWechat==undefined || sessionStorage.t_loginWechat=="undefined")) { //微信登录
                                //登录方法
                                if (refunc && typeof(refunc) == "function")
                                    refunc();

                            } else if(sessionStorage.t_loginWechat=="account") { //账号登录
                                window.location.href = sessionStorage.wechatLogin_History;
                            }

                        } else {
                            //console.log("获取数据失败");
                            $scope.showTips(response.Tips);
                        }
                    });
			}else {
                //为登录才授权
                console.log("isLogin: "+$rootScope.isLoged);
                //return false;
                if (!$rootScope.isLoged) {
                    var returnUri = $location.absUrl();
                    sessionStorage["wechatLogin_History"] = returnUri;
                    //if ((returnUri.indexOf("login") == -1 && returnUri.indexOf("register") == -1 && returnUri.indexOf("forgetPassword") == -1)) {
                    //    sessionStorage["is_WechatLogin"] = 1;
                    //}else {
                    //    sessionStorage["is_WechatLogin"] = 0; //账户登录
                    //}
                    console.log("auth："+ sessionStorage.t_loginWechat);
                    var redirectUri = encodeURIComponent(returnUri);
                    //location.origin + location.pathname;
                    //return false;
                    location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+$rootScope.wechat_appid+"&redirect_uri="+(redirectUri)+"&response_type=code&scope=snsapi_userinfo&state=wechat#wechat_redirect";
                }

			}
		}
	}

    //如果未登录
    if (!$rootScope.isLoged) {
        $rootScope.getWechatInfo(function () {
            if (sessionStorage.t_loginWechat=="wechat" || (sessionStorage.t_loginWechat==undefined || sessionStorage.t_loginWechat=="undefined")) { //微信登录才需要登录，账号登录只授权获取Openid(用于支付等)
                $rootScope.wechatAutoLogin();
            }
        });
    }
	//$rootScope.wechatAutoLogin();

    // 获取微信数据 账号登录
    $rootScope.getWechatAccount = function() {
        if (/MicroMessenger/i.test(navigator.userAgent)) {
            // 写入微信数据
            $rootScope.wechat_appid = localStorage.wechat_appid = CONST.appId;
            $rootScope.wechat_appsecret = localStorage.wechat_appsecret = CONST.appSecret;
            $rootScope.wechat_openid = localStorage.getItem("wechat_openid") ? localStorage.getItem("wechat_openid") : "";
            $rootScope.wechat_unionid = localStorage.getItem("wechat_unionid") ? localStorage.getItem("wechat_unionid") : "";
            $rootScope.wechat_nickname = localStorage.getItem("wechat_nickname") ? localStorage.getItem("wechat_nickname") : "";
            $rootScope.wechat_sex = localStorage.getItem("wechat_sex") ? localStorage.getItem("wechat_sex") : "";
            $rootScope.wechat_language = localStorage.getItem("wechat_language") ? localStorage.getItem("wechat_language") : "";
            $rootScope.wechat_city = localStorage.getItem("wechat_city") ? localStorage.getItem("wechat_city") : "";
            $rootScope.wechat_province = localStorage.getItem("wechat_province") ? localStorage.getItem("wechat_province") : "";
            $rootScope.wechat_country = localStorage.getItem("wechat_country") ? localStorage.getItem("wechat_country") : "";
            $rootScope.wechat_headimgurl = localStorage.getItem("wechat_headimgurl") ? localStorage.getItem("wechat_headimgurl") : "";

            if (CF.queryString("code")) {
                $rootScope.wechat_code = CF.queryString("code");
            }

            //通过CODE和Token请求Unionid 和 Openid
            if ($rootScope.wechat_code) {  //存在CODE并且未登录才从新授权获取OPENID
                $http.get(API.weixin_get_weixin_user + "?" + $rootScope.serialize({
                    code: $rootScope.wechat_code
                })).success(function(response) {
                    if (response.RESPONSE_STATUS == 100) {
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

                        window.location.href = sessionStorage.wechatLogin_History;


                    } else {
                        //console.log("获取数据失败");
                        $scope.showTips(response.Tips);
                    }
                });
            }else {
                //为登录才授权
                var returnUri = $location.absUrl();
                console.log(returnUri);
                sessionStorage["wechatLogin_History"] = returnUri;
                var redirectUri = encodeURIComponent(returnUri);
                location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+$rootScope.wechat_appid+"&redirect_uri="+(redirectUri)+"&response_type=code&scope=snsapi_userinfo&state=wechat#wechat_redirect";

            }
        }
    }



	// 注册微信js-sdk
	if (/MicroMessenger/i.test(navigator.userAgent) && $rootScope.wechat_unionid) {

		CF.needJS("", "http://res.wx.qq.com/open/js/jweixin-1.0.0.js", function() {
			$http.get(API.weixin_get_parameters + "?" + $rootScope.serialize({
				url : encodeURIComponent(location.href.split("#")[0])
			})).success(function(response) {
				//console.log(response);
				if (response.RESPONSE_STATUS == 100) {
					var parameters = response.RESPONSE_INFO.parameters;
					//console.log("获取微信jd-sdk参数成功");
					wx.config({
						debug: false,
						appId: parameters.appId,
						timestamp: parameters.timestamp,
						nonceStr: parameters.nonceStr,
						signature: parameters.signature,
						jsApiList: [
							'checkJsApi',
							'onMenuShareTimeline',
							'onMenuShareAppMessage',
							'onMenuShareQQ',
							'onMenuShareWeibo',
							'onMenuShareQZone',
							'scanQRCode',
							'chooseWXPay'
						]
					});
					wx.error(function(res) {
						console.log("初始化失败：" + res.errMsg);
						// alert("初始化失败：" + res.errMsg);
					});

                    //$rootScope.wxShare();
				}else {
					// $scope.showTips(response.Tips);
				};
			});
		});
	};

	// 扫描
	$rootScope.scanQRCode = function () {
		// alert("11111");
		if (/MicroMessenger/i.test(navigator.userAgent)) {
			wx.ready(function() {
				//微信直接扫描处理
				// wx.scanQRCode();
				// 返回结果自己处理
				wx.scanQRCode({
					needResult: 1,
					desc: 'scanQRCode desc',
					success: function(res) {

						// alert(res);
						// alert(JSON.stringify(res));
						if (res.errMsg == "scanQRCode:ok") {
							if (res.resultStr.indexOf("#/index/find/art/")!=-1) {
								$state.go("index.find-art",{id:res.resultStr.split("#/index/find/art/")[1]});
							}else {
								localStorage.t_scan = res.resultStr;
								$state.go("index.find-scan");
							};
						};
					}
				});
			});
		}else{
			// 在app里面
			if ($rootScope.isWebView) {

				if (!$rootScope.scanning) {
					//console.log("begin scan");
					$rootScope.scanning = true;
					var scanner = cordova.require("cordova/plugin/BarcodeScanner");
					scanner.scan(
						function(result) {
							// alert(result);
							$rootScope.scanning = false;
							// alert("We got a barcode\n" +
							// 	"Result: " + result.text + "\n" +
							// 	"Format: " + result.format + "\n" +
							// 	"Cancelled: " + result.cancelled);

							if (!result.cancelled) {
								if (result.text.indexOf("#/index/find/art/")!=-1) {
									// alert(result.text.split("#/index/find/art/")[1]);
									// $state.go("index.find-art",{id:result.text.split("#/index/find/art/")[1]});
									$state.go("index.find-art",{id:result.text.split("#/index/find/art/")[1]});
								}else {
									localStorage.t_scan = result.text;
									$state.go("index.find-scan");
								};
							};
						},
						function(error) {
							// alert(result);
							$rootScope.scanning = false;
							$rootScope.showTips("扫描失败:" + error);
						}
					);
					//console.log("end scan");
				}
			}else {
				$rootScope.showTips("网页端暂不支持扫描功能");
			};
		};
	}

    //接管微信分享
    $rootScope.wxShare = function(title, desc, imgUrl) {
        if (/MicroMessenger/i.test(navigator.userAgent)) {
            var link = $location.absUrl();
            title = title ? title : '途礼游';
            imgUrl = imgUrl ? imgUrl : location.origin + "/www/img/logo.png";
            wx.ready(function() {
                wx.onMenuShareAppMessage({
                    title: title,
                    desc: desc ? desc : title,
                    link: link,
                    imgUrl: imgUrl,
                    success: function (res) {
                        //layer.msg('已分享');
                    },
                    cancel: function (res) {
                        $rootScope.showTips('已取消');
                    },
                    fail: function (res) {
                        //$rootScope.showTips(JSON.stringify(res));
                    }
                });

                //分享朋友圈
                wx.onMenuShareTimeline({
                    title: title,
                    desc: desc ? desc : title,
                    link: link,
                    imgUrl: imgUrl,
                    success: function (res) {
                        //layer.msg('已分享');
                    },
                    cancel: function (res) {
                        $rootScope.showTips('已取消');
                    },
                    fail: function (res) {
                        //$rootScope.showTips(JSON.stringify(res));
                    }
                });
            });
        }
    }

	// 提示
	$rootScope.showTips = function (tipData,noGoToLogin) {
		// console.log(tipData);
		var responseTips = "";
		if (typeof(tipData) == "object") {
			for (var x in tipData) {
				responseTips += tipData[x];
			}
		}else {
			responseTips = tipData;
		};
		$ionicLoading.show({
			duration: "1500",
			template: responseTips
		});
		if (typeof(noGoToLogin) == "undefined") {
			setTimeout(function () {
                // 删除用户信息
                //$rootScope.delUserInfo();
                // 更新用户信息
                $rootScope.getUserInfo();
				if (responseTips == "您可能在其他设备已登录,请重新登录" || responseTips == "您还未登录，请先登录") {
					$state.go("index.mine-login");
				};
			},1500);
		};
	}    
})



// 欢迎页
.controller("ctrlWelcome", function($scope,$state,$rootScope) {
	$rootScope.hideTabs = true;

	// 欢迎页
	setTimeout(function () {
		$state.go("index.map",{city:(localStorage.getItem("w-cityName") ? localStorage.getItem("w-cityName") : "")});
		$rootScope.hideTabs = false;
	}, 3000);
})

// 导航
.controller("ctrlNav", function($scope,$state,$rootScope) {
	console.log("ctrlNav");
	$rootScope.hideTabs = true;

})

// 管理3个tab
.controller("ctrlIndex", function($scope,$ionicLoading,$state,$rootScope,$ionicPopup,$location,$stateParams) {	
	if(typeof($location.search()['classId']) != "undefined"){
		$rootScope.initial = true;		
		sessionStorage.setItem("class-id",$location.search()['classId']);
	}
	// 提示
	$scope.showTips = function (tipData,noGoToLogin) {
		var responseTips = "";
		if (typeof(tipData) == "object") {
			for (var x in tipData) {
				responseTips += tipData[x];
			}
		}else {
			responseTips = tipData;
		};
		$ionicLoading.show({
			duration: "1500",
			template: responseTips
		});
		if (typeof(noGoToLogin) == "undefined") {
            // 删除用户信息
            //$rootScope.delUserInfo();
            // 更新用户信息
            $rootScope.getUserInfo();
			setTimeout(function () {
				if (responseTips == "您可能在其他设备已登录,请重新登录" || responseTips == "您还未登录，请先登录") {
					$state.go("index.mine-login");
				};
			},1500);
		};
	}

	$scope.jumpUrl = function (url) {
		if (url.indexOf("#") == 0) {
			location.href = location.origin + location.pathname + url;
		}else {
			location.href = url;
		};
	}

	function checkConnection() {
		var networkState = navigator.connection.type;
		var states = {};
		states[Connection.UNKNOWN] = 'Unknown connection';
		states[Connection.ETHERNET] = 'Ethernet connection';
		states[Connection.WIFI] = 'WiFi connection';
		states[Connection.CELL_2G] = 'Cell 2G connection';
		states[Connection.CELL_3G] = 'Cell 3G connection';
		states[Connection.CELL_4G] = 'Cell 4G connection';
		states[Connection.CELL] = 'Cell generic connection';
		states[Connection.NONE] = 'No network connection';
		return states[networkState];
		// alert('Connection type: ' + states[networkState]);
	}

	if ($rootScope.isWebView) {
		var isOnOfflineRun = false;
		document.addEventListener("offline", onOffline, false);
		function onOffline() {
			if (!isOnOfflineRun) {
				isOnOfflineRun = true;
				// alert("9");
				// 一个提示对话框
				$ionicPopup.alert({
					title: "网络连接好像有问题哦",
					template: "请检查网络设置",
					okText: "重试",
					okType: "button-assertive"
				}).then(function(res) {
					if (checkConnection() != "No network connection") {
						$state.reload();
						isOnOfflineRun = false;
					}else {
						isOnOfflineRun = false;
						onOffline();
					};
				});
			};
		}
	}

	// 跳链接的方式
	$scope.locationHref = function (url,isOpenWebview) {
		if ($rootScope.isWebView) {
			if (isOpenWebview) {
				cordova.InAppBrowser.open(url, '_blank', 'location=yes,toolbarposition=top,closebuttoncaption=返回');
			}else {
				if (url.indexOf("#/index/") != -1) {
					$scope.jumpUrl(url);
				}else {
					cordova.InAppBrowser.open(url, '_blank', 'location=yes,toolbarposition=top,closebuttoncaption=返回');
				};
			};
		}else {
			$scope.jumpUrl(url);
		};
	}


	// 分享模块
	$scope.isshowShare = false;
	$scope.showShare = function (flag) {
		if (flag) {
			$scope.isshowShare = true;
		}else {
			$scope.isshowShare = false;
		};
	}
	$scope.share = function (type,sessionName) {
		if (/MicroMessenger/i.test(navigator.userAgent)) {
			if (type == "WXzone") {
				$ionicLoading.show({
					duration: "2000",
					template: "请点击右上角-分享到朋友圈"
				});
			} else if (type == "WXfriend") {
				$ionicLoading.show({
					duration: "2000",
					template: "请点击右上角-发送给朋友"
				});
			};
			var data = {
				title: sessionStorage.getItem(sessionName),
				link: location.origin + "/www/index.html" + location.hash,
				desc: sessionStorage.getItem(sessionName),
				imgUrl: location.origin + "/www/img/logo.png"
			}
			wx.ready(function() {
				wx.onMenuShareTimeline(data);
				wx.onMenuShareAppMessage(data);
				wx.onMenuShareQQ(data);
				wx.onMenuShareWeibo(data);
				wx.onMenuShareQZone(data);
			});
		}else {
			if ($rootScope.isWebView) {
				if (type == "WXzone") {
					Wechat.share({
						message: {
							title: sessionStorage.getItem(sessionName),
							description: sessionStorage.getItem(sessionName),
							mediaTagName: "途礼游",
							thumb: location.origin + "/www/img/logo.png",
							media: {
								type: Wechat.Type.WEBPAGE,
								webpageUrl: location.origin + "/www/index.html" + location.hash
							}
						},
						scene: Wechat.Scene.TIMELINE
					}, function() {
						$scope.showTips("分享成功");
						// 分享完之后隐藏
						$scope.showShare(0);
					}, function(reason) {
						$scope.showTips("分享失败:" + reason);
						// 分享完之后隐藏
						$scope.showShare(0);
					});
				}else if (type == "WXfriend") {
					// alert("8");
					Wechat.share({
						message: {
							title: sessionStorage.getItem(sessionName),
							description: sessionStorage.getItem(sessionName),
							mediaTagName: "途礼游",
							thumb: location.origin + "/www/img/logo.png",
							media: {
								type: Wechat.Type.WEBPAGE,
								webpageUrl: location.origin + "/www/index.html" + location.hash
							}
						},
						scene: Wechat.Scene.SESSION
					}, function() {
						$scope.showTips("分享成功");
						// 分享完之后隐藏
						$scope.showShare(0);
					}, function(reason) {
						$scope.showTips("分享失败:" + reason);
						// 分享完之后隐藏
						$scope.showShare(0);
					});
				};

			}else {
				$scope.showTips("网页端暂不支持分享功能");
			};
		};
	}



        //add Allen
        $scope.wx_share = function (type, title_name, logo) {
            title_name = title_name ? title_name : '途礼游';
            logo = logo ? logo : location.origin + "/www/img/logo.png";
            //console.log(title_name); console.log(logo);
            console.log(type);
            console.log(title_name);
            console.log(logo);
            if (/MicroMessenger/i.test(navigator.userAgent)) {
                if (type == "WXzone") {
                    $ionicLoading.show({
                        duration: "2000",
                        template: "请点击右上角-分享到朋友圈"
                    });
                } else if (type == "WXfriend") {
                    $ionicLoading.show({
                        duration: "2000",
                        template: "请点击右上角-发送给朋友"
                    });
                };
                var data = {
                    title: title_name, //sessionStorage.getItem(sessionName),
                    link: location.origin + "/www/index.html" + location.hash,
                    desc: title_name, //sessionStorage.getItem(sessionName),
                    imgUrl: logo //location.origin + "/www/img/logo.png"
                }
                wx.ready(function() {
                    wx.onMenuShareTimeline(data);
                    wx.onMenuShareAppMessage(data);
                    wx.onMenuShareQQ(data);
                    wx.onMenuShareWeibo(data);
                    wx.onMenuShareQZone(data);
                });
            }else {
                if ($rootScope.isWebView) {
                    if (type == "WXzone") {
                        Wechat.share({
                            message: {
                                title: title_name, //sessionStorage.getItem(sessionName),
                                description: title_name, //sessionStorage.getItem(sessionName),
                                mediaTagName: "途礼游",
                                thumb: logo, //location.origin + "/www/img/logo.png",
                                media: {
                                    type: Wechat.Type.WEBPAGE,
                                    webpageUrl: location.origin + "/www/index.html" + location.hash
                                }
                            },
                            scene: Wechat.Scene.TIMELINE
                        }, function() {
                            $scope.showTips("分享成功");
                            // 分享完之后隐藏
                            $scope.showShare(0);
                        }, function(reason) {
                            $scope.showTips("分享失败:" + reason);
                            // 分享完之后隐藏
                            $scope.showShare(0);
                        });
                    }else if (type == "WXfriend") {
                        // alert("8");
                        Wechat.share({
                            message: {
                                title: title_name,  //sessionStorage.getItem(sessionName),
                                description: title_name, //sessionStorage.getItem(sessionName),
                                mediaTagName: "途礼游",
                                thumb: logo, //location.origin + "/www/img/logo.png",
                                media: {
                                    type: Wechat.Type.WEBPAGE,
                                    webpageUrl: location.origin + "/www/index.html" + location.hash
                                }
                            },
                            scene: Wechat.Scene.SESSION
                        }, function() {
                            $scope.showTips("分享成功");
                            // 分享完之后隐藏
                            $scope.showShare(0);
                        }, function(reason) {
                            $scope.showTips("分享失败:" + reason);
                            // 分享完之后隐藏
                            $scope.showShare(0);
                        });
                    };

                }else {
                    $scope.showTips("网页端暂不支持分享功能");
                };
            };
        }


	$scope.goToMap = function () {		
		if($location.absUrl().indexOf("map") == -1){
			$state.go("index.map",{city:(localStorage.getItem("w-cityName") ? localStorage.getItem("w-cityName") : "")});
		}		
	}
	$scope.goToMine = function () {
		$state.go("index.mine",{random:CF.randomString(16)});
	}

	// 时间转换 "1459009038"1458884982 "1459009038" 
	$scope.unixToTime = function (timestamp) {
		// return new Date(parseInt(timestamp) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');
		var now = new Date(parseInt(timestamp) * 1000);
		return now.getFullYear() + "-" + (now.getMonth()+1) + "-" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
	};

	// console.log($scope.unixToTime("1459009038"));
	// 电话号码隐藏中间四位
	$scope.telHide = function (tel) {
		var newTel = "";
		if (tel.length == 11) {
			for (var i = 0; i < tel.length; i++) {
				if (i>=3 && i<=6) {
					newTel += "*";
				}else {
					newTel += tel[i];
				};
			};
		};
		return (newTel ? newTel : tel);
	};

})

