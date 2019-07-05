// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module("starter", ["ionic","ui.router", "ngCordova", "starter.controllers", "starter.services", "starter.directive"])
.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {


  // ++++++++++++++++++++++全局设置++++++++++++++++++++++
  // 设置根据在$stateProvider.state中定义的模板url预取的模板数量。 如果设置为 0,当导航到新的页面时候用户必须等待加载到该页面. 默认是 30.
  $ionicConfigProvider.templates.maxPrefetch(15);

  //禁止侧滑后退事件
  $ionicConfigProvider.views.swipeBackEnabled(false);


  // 缓存前进的视图
  $ionicConfigProvider.views.forwardCache(true);

  // 最大缓存视图数量
  // $ionicConfigProvider.views.maxCache(0);
  $ionicConfigProvider.views.maxCache(10);

  // tab的样式和位置
  $ionicConfigProvider.platform.ios.tabs.style("standard");
  $ionicConfigProvider.platform.android.tabs.style("standard");
  $ionicConfigProvider.platform.ios.tabs.position("bottom");
  $ionicConfigProvider.platform.android.tabs.position("bottom");

  // 导航文字居中
  $ionicConfigProvider.platform.ios.navBar.alignTitle("center");
  $ionicConfigProvider.platform.android.navBar.alignTitle("center");

  // 设置是否将上一个view视图的title设置成返回按钮的文字 iOS是默认的true
  $ionicConfigProvider.platform.ios.backButton.previousTitleText(false);
  $ionicConfigProvider.platform.android.backButton.previousTitleText(false);

  // 定义返回按钮
  $ionicConfigProvider.platform.ios.backButton.icon("ion-ios-arrow-back");
  $ionicConfigProvider.platform.android.backButton.icon("ion-ios-arrow-back");

  // 过渡效果
  $ionicConfigProvider.platform.ios.views.transition("ios");
  $ionicConfigProvider.platform.android.views.transition("android");

  // 设置返回按钮的文字
  $ionicConfigProvider.platform.ios.backButton.text(false);
  $ionicConfigProvider.platform.android.backButton.text(false);



  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // 欢迎
  .state("welcome", {
    url: "/welcome",
    templateUrl: FILEPATH + "templates/welcome.html",
    controller: "ctrlWelcome"
  })


  // 导航
  .state("nav", {
    url: "/nav",
    templateUrl: FILEPATH + "templates/nav.html",
    controller: "ctrlNav"
  })

  // 首页主路由
  .state("index", {
    url: "/index",
    abstract: true,
    templateUrl: FILEPATH + "templates/index.html",
    controller: "ctrlIndex"
  })
  // 404
  .state("404", {
    url: "/404",
    templateUrl: FILEPATH + "templates/404.html"
  })



  // +++++++++++++++++++++++地图+++++++++++++++++++++++
  // 地图主页
  .state("index.map", {
    url: "/map?{city}",
    cache:'false',
    views: {
      "map-tab": {
        templateUrl: FILEPATH + "templates/map/index.html",
        controller: "ctrlMap"
      }
    }
  })

  .state("index.map.scene",{
    url:"/scene?{viewId}&{classId}",            
    templateUrl: FILEPATH + "templates/map/scene.html",
    controller: "ctrlScene"
    /*views: {
      "tabs@": {
        templateUrl: FILEPATH + "templates/map/scene.html",
        controller: "ctrlMap"
      }
    }*/
  })

  // 定位
  .state("index.map-location", {    
    url: "/map/location",
    views: {
      "map-tab": {
        templateUrl: FILEPATH + "templates/map/location.html?{url}",
        controller: "ctrlMapLocation"
      }
    }
  })

  // 景点
  .state("index.map-scenic", {
    cache : false,
    url: "/map/scenic/{id}",
    views: {
      "map-tab": {
        templateUrl: FILEPATH + "templates/map/scenic.html",
        controller: "ctrlMapScenic"
      }
    }
  })

  // 景点评论
  .state('index.map-scenic-comment',{
    cache : false,
    url : '/map/scenic/comment/{id}',
    views : {
      'map-tab' : {
        templateUrl : FILEPATH + 'templates/map/scenic-comment.html',
        controller : 'ctrlMapScenicComment'
      }
    }
  })
  // 景点评论
  .state('index.map-scenic-comment-name',{
    cache : false,
    url : '/map/scenic/comment/{id}/name/{name}',
    views : {
      'map-tab' : {
        templateUrl : FILEPATH + 'templates/map/scenic-comment.html',
        controller : 'ctrlMapScenicComment'
      }
    }
  })



  // +++++++++++++++++++++++发现+++++++++++++++++++++++
  // 发现主页-购物
  .state("index.find", {    
    url: "/find",
    // cache : true,
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/index.html",
        controller: "ctrlFind"
      }
    }
  })
  // 扫描内容
  .state("index.find-scan", {
    url: "/find/scan",
    cache : false,
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/scan.html",
        controller: "ctrlFindScan"
      }
    }
  })
  // 发现-类型
  .state("index.find-classify", {
    url: "/find/classify/{id}",
    cache : false,
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/classify.html",
        controller: "ctrlFindClassify"
      }
    }
  })
  // 店铺-类型
  .state("index.find-shop-classify", {
    url: "/find/shop/classify/{id}",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/shop-classify.html",
        controller: "ctrlFindShopClassify"
      }
    }
  })
  // 发现-标签
  .state("index.find-tag", {
    cache : false,
    url: "/find/tag/{id}",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/tag.html",
        controller: "ctrlFindTag"
      }
    }
  })
  // 发现-达人首页
  .state("index.find-talent", {
    // cache : false,
    url: "/find/talent",
    views: {
      "tarento-tab": {
        templateUrl: FILEPATH + "templates/find/talent.html",
        controller: "ctrlFindTalent"
      }
    }
  })

  // 发现-达人首页
  .state("index.find-talent-article", {
      cache : false,
      url: "/find/talent-article/:class_id",
      views: {
          "tarento-tab": {
              templateUrl: FILEPATH + "templates/find/talent.html",
              controller: "ctrlFindTalent"
          }
      }
  })

  // 发现-菜单
  .state("index.find-menu", {
    url: "/find/menu",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/menu.html",
        controller: "ctrlFindMenu"
      }
    }
  })
  // 发现-达人-具体达人
  .state("index.find-talent-main", {
    cache : false,
    url: "/find/talent/{id}",
    views: {
      "tarento-tab": {
        templateUrl: FILEPATH + "templates/find/talent-main.html",
        controller: "ctrlFindTalentMain"
      }
    }
  })
  // 发现-达人-文章
  .state("index.find-talent-art", {
    cache: false,
    url: "/find/talent/art/{id}",
    views: {
      "tarento-tab": {
        templateUrl: FILEPATH + "templates/find/talent-art.html",
        controller: "ctrlFindTalentArt"
      }
    }
  })
  // 发现-达人-文章-评论
  .state("index.find-talent-art-comment", {
    cache: false,
    url: "/find/talent/art/comment/{id}",
    views: {
      "tarento-tab": {
        templateUrl: FILEPATH + "templates/find/talent-art-comment.html",
        controller: "ctrlFindTalentArtComment"
      }
    }
  })

  // 搜索
  .state("index.search", {    
    url: "/search/{text}",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/search.html",
        controller: "ctrlFindSearch"
      }
    }
  })
  // 商家主页
  .state("index.find-shop", {
    url: "/find/shop/{id}",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/shop.html",
        controller: "ctrlFindShop"
      }
    }
  })
  // 商品详情
  .state("index.find-art", {
    // 关于在APP评论，商城后台审核通过和商家回复后，要能在APP看到自己的评论 因此禁缓存
    cache: false,
    url: "/find/art/{id}",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/art.html",
        controller: "ctrlFindArt"
      }
    }
  })
  // 购物车
  .state("index.find-cart", {
    cache: false,
    url: "/find/cart",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/cart.html",
        controller: "ctrlFindCart"
      }
    }
  })
  // 订单
  .state("index.find-order", {
    cache: false,
    url: "/find/order",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/order.html",
        controller: "ctrlFindOrder"
      }
    }
  })
  // 订单-商品详情
  .state("index.find-order-product", {
    cache: false,
    url: "/find/order/product",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/order-product.html",
        controller: "ctrlFindOrderProduct"
      }
    }
  })
  // 订单-优惠券
  .state("index.find-order-coupon", {
    cache: false,
    url: "/find/order/coupon",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/order-coupon.html",
        controller: "ctrlFindOrderCoupon"
      }
    }
  })
  // 订单-发票
  .state("index.find-order-bill", {
    url: "/find/order/bill",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/order-bill.html",
        controller: "ctrlFindOrderBill"
      }
    }
  })
  // 订单-地址
  .state("index.find-address", {
    cache: false,
    url: "/find/address",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/address.html",
        controller: "ctrlFindAddress"
      }
    }
  })
  // 支付-收银台
  .state("index.find-pay", {
    cache:false,
    url: "/find/pay/{id}",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/pay.html",
        controller: "ctrlFindPay"
      }
    }
  })

  .state("index.sum-find-pay", {
      cache:false,
      url: "/find/sum-pay/{id}",
      views: {
          "find-tab": {
              templateUrl: FILEPATH + "templates/find/sum-pay.html",
              controller: "ctrlSumFindPay"
          }
      }
  })

  // 支付成功
  .state("index.find-payok", {
    url: "/find/payok/{id}",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/payok.html",
        controller: "ctrlFindPayok"
      }
    }
  })
  // 支付成功
  .state("index.sum-find-payok", {
      url: "/find/sum-payok/{id}",
      views: {
          "find-tab": {
              templateUrl: FILEPATH + "templates/find/sum-payok.html",
              controller: "ctrlSumFindPayok"
          }
      }
  })
  // 支付不成功
  .state("index.find-payfail", {
    url: "/find/payfail/{id}",
    views: {
      "find-tab": {
        templateUrl: FILEPATH + "templates/find/payfail.html",
        controller: "ctrlFindPayfail"
      }
    }
  })

  // 支付不成功
  .state("index.sum-find-payfail", {
      url: "/find/payfail/{id}/{type}",
      views: {
          "find-tab": {
              templateUrl: FILEPATH + "templates/find/payfail.html",
              controller: "ctrlFindPayfail"
          }
      }
  })











  // +++++++++++++++++++++++我的+++++++++++++++++++++++
  // 我的主页
  .state("index.mine", {
    cache: false,
    url: "/mine/random/{random}",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/index.html",
        controller: "ctrlMine"
      }
    }
  })
  // 我的账户
  .state("index.mine-info", {
    url: "/mine/info",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/info/info.html",
        controller: "ctrlMineInfo"
      }
    }
  })
  // 我的账户-用户名
  .state("index.mine-info-username", {
    url: "/mine/info/username",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/info/info-username.html",
        controller: "ctrlMineInfoUsername"
      }
    }
  })
  // 我的账户-手机号码
  .state("index.mine-info-telephone", {
      url: "/mine/info/telephone",
      views: {
          "mine-tab": {
              templateUrl: FILEPATH + "templates/mine/info/info-telephone.html",
              controller: "ctrlMineInfoTelephone"
          }
      }
  })

  // 消息
  .state("index.mine-message", {
    cache: false,
    url: "/mine/message",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/message/message.html",
        controller: "ctrlMineMessage"
      }
    }
  })
  // 消息详情
  .state("index.mine-message-detail", {
    url: "/mine/message/{id}",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/message/message-detail.html",
        controller: "ctrlMineMessageDetail"
      }
    }
  })
  // 全部订单
  .state("index.mine-order", {
    cache: false,
    url: "/mine/order/{id}",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/order/order.html",
        controller: "ctrlMineOrder"
      }
    }
  })
  // 订单详情
  .state("index.mine-order-detail", {
    cache: false,
    url: "/mine/order/detail/{id}",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/order/order-detail.html",
        controller: "ctrlMineOrderDetail"
      }
    }
  })

  // 物流信息
  .state("index.mine-express", {
      cache: false,
      url: "/mine/order/express/{com}/{nu}",
      views: {
          "mine-tab": {
              templateUrl: FILEPATH + "templates/mine/order/express.html",
              controller: "ctrlFindExpress"
          }
      }
  })

  // 订单评价
  .state("index.mine-order-comment", {
    url: "/mine/order/comment/{id}",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/order/order-comment.html",
        controller: "ctrlMineOrderComment"
      }
    }
  })

  // 退换货
  .state("index.mine-return", {
    cache: false,
    url: "/mine/return",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/return/return.html",
        controller: "ctrlMineReturn"
      }
    }
  })
  // 退换货-1
  .state("index.mine-return-1", {
    cache: false,
    url: "/mine/return/1",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/return/return-1.html",
        controller: "ctrlMineReturn1"
      }
    }
  })
  // 退换货-2
  .state("index.mine-return-2", {
    cache: false,
    url: "/mine/return/2",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/return/return-2.html",
        controller: "ctrlMineReturn2"
      }
    }
  })
  // 退换货-3
  .state("index.mine-return-3", {
    cache: false,
    url: "/mine/return/3",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/return/return-3.html",
        controller: "ctrlMineReturn3"
      }
    }
  })
  // 退换货进度
  .state("index.mine-return-rate", {
    cache: false,
    url: "/mine/return/rate",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/return/return-rate.html",
        controller: "ctrlMineReturnRate"
      }
    }
  })
  // 退换货详情
  .state("index.mine-return-detail", {
    cache: false,
    url: "/mine/return/detail/{id}",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/return/return-detail.html",
        controller: "ctrlMineReturnDetail"
      }
    }
  })
  // 收藏-达人
  .state("index.mine-collect-talent", {
    cache: false,
    url: "/mine/collect/talent",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/collect/collect-talent.html",
        controller: "ctrlMineCollectTalent"
      }
    }
  })
  // 收藏-商店
  .state("index.mine-collect-shop", {
    cache: false,
    url: "/mine/collect/shop",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/collect/collect-shop.html",
        controller: "ctrlMineCollectShop"
      }
    }
  })
  // 收藏-商品
  .state("index.mine-collect-product", {
    cache: false,
    url: "/mine/collect/product",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/collect/collect-product.html",
        controller: "ctrlMineCollectProduct"
      }
    }
  })

  // 关于
  .state("index.mine-about", {
    url: "/mine/about",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/about/about.html",
        controller: "ctrlMineAbout"
      }
    }
  })
  // 用户反馈
  .state("index.mine-feedback", {
    url: "/mine/feedback",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/feedback/feedback.html",
        controller: "ctrlMineFeedback"
      }
    }
  })
  // 我的邀请码
  .state("index.mine-invite", {
    cache: false,
    url: "/mine/invite",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/invite/invite.html",
        controller: "ctrlMineInvite"
      }
    }
  })
  // 申请成为达人
  .state("index.mine-apply", {
    cache: false,
    url: "/mine/apply",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/apply/apply.html",
        controller: "ctrlMineApply"
      }
    }
  })
  // 达人规则
  .state("index.mine-apply-rule", {
    url: "/mine/apply/rule",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/apply/apply-rule.html",
        controller: "ctrlMineApplyRule"
      }
    }
  })


  // 地址管理
  .state("index.mine-address", {
    cache: false,
    url: "/mine/address",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/address/address.html",
        controller: "ctrlMineAddress"
      }
    }
  })

  .state("index.mine-address-edit", {
    cache: false,
    url: "/mine/address/edit/{id}",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/address/address-edit.html",
        controller: "ctrlMineAddressEdit"
      }
    }
  })
  .state("index.mine-address-add", {
    cache: false,
    url: "/mine/address/add",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/address/address-add.html",
        controller: "ctrlMineAddressAdd"
      }
    }
  })
  .state("index.mine-address-add-region", {
    cache: false,
    url: "/mine/address/add/region",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/address/address-region.html",
        controller: "ctrlMineAddressAddRegion"
      }
    }
  })

  // 登录
  .state("index.mine-login", {
    cache: false,
    url: "/mine/login",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/login/login.html",
        controller: "ctrlMineLogin"
      }
    }
  })
  // 注册
  .state("index.mine-register", {
    cache: false,
    url: "/mine/register",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/login/register.html",
        controller: "ctrlMineRegister"
      }
    }
  })
  // 忘记密码页面
  .state("index.mine-forgetPassword", {
    cache: false,
    url: "/mine/forgetPassword",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/login/forgetPassword.html",
        controller: "ctrlMineForgetPassword"
      }
    }
  })
  // 重置密码页面
  .state("index.mine-resetPassword", {
    cache: false,
    url: "/mine/resetPassword?userId",
    views: {
      "mine-tab": {
        templateUrl: FILEPATH + "templates/mine/login/resetPassword.html",
        controller: "ctrlMineResetPassword"
      }
    }
  })

  //达人列表
  .state("index.talent-list", {
      cache : false,
      url: "/find/talent-list/{id}",
      views: {
          "find-tab": {
              templateUrl: FILEPATH + "templates/find/talent-list.html",
              controller: "ctrlTalentList"
          }
      }
  })

  // 注册条款
  .state("index.mine-registerClause", {
      url: "/mine/clause",
      views: {
          "mine-tab": {
              templateUrl: FILEPATH + "templates/mine/login/registerClause.html",
              controller: "ctrlMineRegisterClause"
          }
      }
  })









        // 路由重定向
  $urlRouterProvider
  // .when('', '/welcome')//APP初始化时进入欢迎页
  // .when('', '/index/map/'+(localStorage.getItem("w-cityName") ? localStorage.getItem("w-cityName") : ""))//初始化时进入地图首页
  .when('', '/index/map')//初始化时进入地图首页
  // .otherwise('/404');//404页面

});
