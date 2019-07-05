

var APIPATH, FILEPATH;
var link = window.top.location.href;

// 威少
if (link.indexOf('localhost') != -1 || link.indexOf('192.168') != -1) {
	APIPATH = 'http://buygifts.3ncto.cn/api/';
    // APIPATH = 'http://m.tuliyou.com/api/';
    // APIPATH = 'http://localhost/BuyGifts-Server/web/api/';
	FILEPATH = '/';
}

// 测试服务器
if (link.indexOf('buygifts.3ncto.com.cn') != -1 || link.indexOf('buygifts.3ncto.cn') != -1) {
	APIPATH = '/api/';
	FILEPATH = '/www/';
	if (link.indexOf('/www/') != -1) {
		FILEPATH = '/www/';
	};
	if (link.indexOf('/www_ios/') != -1) {
		FILEPATH = '/www_ios/';
	};
	if (link.indexOf('/www_android/') != -1) {
		FILEPATH = '/www_android/';
	};
}


// 线上服务器
if (link.indexOf('m.tuliyou.com') != -1) {
    APIPATH = '/api/';
    FILEPATH = '/www/';
    if (link.indexOf('/www/') != -1) {
        FILEPATH = '/www/';
    }
    ;
    if (link.indexOf('/www_ios/') != -1) {
        FILEPATH = '/www_ios/';
    }
    ;
    if (link.indexOf('/www_android_new/') != -1) {
        FILEPATH = '/www_android_new/';
    }
}

//常量配置
var CONST = {
    "appId" : "wx5c12e094b10cc9f8",
    "appSecret" : "f4359a4f5dd2c41637057290d635626f"
}

// 所有接口的url
var API = {
	// 全国城市
	"index_all_city": APIPATH + "index/all_city",
    "index_map_city": APIPATH + "index/map_city",
	// 地图
	"index_index": APIPATH + "index/index",
    //查找物流
    "search_express": APIPATH + "index/search_express",

	// 微信支付
	"pay_weixin": APIPATH + "pay/weixin",
	// 微信open支付
	"pay_weixin_open": APIPATH + "pay/weixin_open",
	// 支付宝支付
	"pay_alipay_open": APIPATH + "pay/alipay_open",



	// 订单商品评论列表
	"order_comment_list": APIPATH + "order/comment_list",
	// 商品评价
	"order_evaluate": APIPATH + "order/evaluate",
	// 得到省市区数据
	"order_get_area": APIPATH + "order/get_area",
	// 我的订单列表
	"order_myorder": APIPATH + "order/myorder",
	// 订单详情
	"order_orderdetail": APIPATH + "order/orderdetail",
    //合并订单详细
    "sum_order_orderdetail": APIPATH + "order/sum_orderdetail",
	// 收货地址更改
	"order_edit_address": APIPATH + "order/edit_address",
	// 确认收货
	"order_receipt": APIPATH + "order/receipt",
	// 取消订单
	"order_order_cancel": APIPATH + "order/order_cancel",
	// 订单确认页
	"order_comfirm": APIPATH + "order/comfirm",

	// 使用优惠券 废弃
	"coupon_add_code": APIPATH + "coupon/add_code",

	// 使用优惠券
	"coupon_check_code": APIPATH + "coupon/check_code",

	// 发现-购物-商品列表
	"product_index": APIPATH + "product/index",
	// 商品平台分类列表
	"product_classify": APIPATH + "product/classify",
	// 商品评论列表
	"product_comment_list": APIPATH + "product/comment_list",
	// 商品广告图和标签
	"product_getbanner": APIPATH + "product/getbanner",

	// 商品详情
	"product_view": APIPATH + "product/view",
	// 商家首页
	"store_view": APIPATH + "store/view",
	/*景点首页*/
	"scenic_view": APIPATH + "scenic/view",
	/*浏览该景点的用户最喜欢的景点列表*/
	"scenic_like": APIPATH + "scenic/user_like",
	/*景点评论列表*/
	"scenic_comment": APIPATH + "scenic/comment_list",
	// 景点发表评论
	"scenic_comment_create": APIPATH + "scenic/comment_create",
	// 取出某个城市下访问最多的景点
	'scenic_max_view_scenic' : APIPATH + 'scenic/max_view_scenic',


	/*达人首页*/
	"talent_index": APIPATH + 'talent/index',
	/*达人介绍*/
	"talent_introduce": APIPATH + 'talent/introduce',
	// 发现达人 排序1热门，2最新
	"talent_find": APIPATH + "talent/find",
	// 推荐的达人信息
	"talent_recommend": APIPATH + "talent/recommend",
	// 达人文章-详情
	"talent_article": APIPATH + "talent/article",
	// 浏览过该文章的其他用户
	"talent_article_view_user": APIPATH + "talent/article_view_user",
	// 达人文章-评论
	"talent_article_comment_list": APIPATH + "talent/article_comment_list",
	// 评论文章
	"talent_article_comment_create": APIPATH + "talent/article_comment_create",
    // 达人列表 按 场景搜索
    "talent_region": APIPATH + "talent/talent_by_region",
    //达人分类
    // "talent_class": APIPATH +"talent/talent_class",
    //new达人分类
    "talent_class": APIPATH +"talent/talent_article_class",
    //获取指定达人分类的最新文章
    "find_article": APIPATH + "talent/find_article",

	// 获取达人信息
	"talentApply_gettalent": APIPATH + "talentApply/gettalent",
	// 申请成为达人
	"talentApply_applytalent": APIPATH + "talentApply/applytalent",
	// 验证是否可以发起申请
	"talentApply_isapply": APIPATH + "talentApply/isapply",



	// 商家首页商品
	"store_product": APIPATH + "store/product",
	// 购物车
	"cart_update": APIPATH + "cart/update",
	"cart_delete": APIPATH + "cart/delete",
	"cart_delete_batch": APIPATH + "cart/delete_batch",
	"cart_index": APIPATH + "cart/index",
	"cart_addcart": APIPATH + "cart/addcart",

	// 废弃
	"cart_create": APIPATH + "cart/create",

	// 购物车创建订单(新)
	"cart_create_product": APIPATH + "cart/create_product",
	// 购物车订单确认页
	"cart_comfirm": APIPATH + "cart/comfirm",
    //购物车结算判断
    "judge_purchase": APIPATH + "cart/judge_purchase",



	// 注册
	"user_register": APIPATH + "user/register",
	// 注册上传图片
	"user_reg_upload": APIPATH + "user/reg_upload",
	// 登录
	"user_login": APIPATH + "user/login",
	// 登出
	"user_logout": APIPATH + "user/logout",
	// 获取验证码
	"user_sendsms": APIPATH + "user/sendsms",
	// 重置密码
	"user_reset_password": APIPATH + "user/reset_password",
	// 修改用户头像和昵称
	"user_edituser": APIPATH + "user/edituser",
	// 用户反馈
	"user_feedback": APIPATH + "user/feedback",
	// 我的邀请码
	"user_invite": APIPATH + "user/invite",
	// 我的信息
	"user_my": APIPATH + "user/my",
    //绑定商户和用户
    "bind_user_store": APIPATH + "user/bind_user_store",

	// 收藏 1达人3商家4商品5文章
	"fans_getfans": APIPATH + "fans/getfans",
	// 用户收藏 1达人2景点3商家4商品5文章
	"fans_focus": APIPATH + "fans/focus",
	// 用户取消商家\商品\达人\景点
	"fans_cancel": APIPATH + "fans/cancel",
	// 用户检测收藏1达人2景点3商家4商品。
	"fans_check": APIPATH + "fans/check",
	// 收藏过的用户
	"fans_list_fans": APIPATH + "fans/list_fans",

	// 我的通知列表
	"notice_noticelist": APIPATH + "notice/noticelist",
	// 通知详情
	"notice_view": APIPATH + "notice/view",
	// 判断是否有未读消息
	"notice_is_read": APIPATH + "notice/is_read",


	// 得到区域信息
	"address_getregion": APIPATH + "address/getregion",
	// 创建我的地址
	"address_create": APIPATH + "address/create",
	// 删除我的地址
	"address_delete": APIPATH + "address/delete",
	// 地址详细
	"address_detail": APIPATH + "address/detail",
	// 地址列表
	"address_addresslist": APIPATH + "address/addresslist",
	// 编辑地址
	"address_update": APIPATH + "address/update",
	// 设置默认地址
	"address_set_default": APIPATH + "address/set_default",

	// 微信js sdk参数
	"weixin_get_parameters": APIPATH + "weixin/get_parameters",
	// 微信用户信息
	"weixin_get_weixin_user": APIPATH + "weixin/get_weixin_user",

	// 检查第三方绑定情况
	"connect_check": APIPATH + "connect/check",
	// 登录后第三方帐号绑定
	"connect_bind": APIPATH + "connect/bind",
	// 登录后第三方帐号解除绑定
	"connect_delete": APIPATH + "connect/delete",
	// Connect - 第三方登录,type：0微信 1qq 2微博,如果成功直接登录，不成功带上type,openid跳到注册。
	"connect_login": APIPATH + "connect/login",


	// 售后提交申请
	"orderReturn_applyservice": APIPATH + "orderReturn/applyservice",
	// 售后服务订单列表
	"orderReturn_myorder": APIPATH + "orderReturn/myorder",
	// 售后进度查询
	"orderReturn_retunlist": APIPATH + "orderReturn/retunlist",
	// 售后进度查询详细
	"orderReturn_retundetail": APIPATH + "orderReturn/retundetail",
	// 商品售后页
	"orderReturn_getservice": APIPATH + "orderReturn/getservice",
	// 上传图片
	"orderReturn_upload": APIPATH + "orderReturn/upload",


	// 景点搜索
	'search_scenic': APIPATH + 'index/search_scenic',
	// 文章搜索
	'search_article': APIPATH + 'index/search_article',
	// 达人搜索
	'search_talent': APIPATH + 'index/search_talent',
	// 商家搜索
	'search_store': APIPATH + 'index/search_store',
	// 产品搜索
	'search_product': APIPATH + 'index/search_product',

	// 城市所有全景场景图
	'scenic_all': APIPATH + 'scene/all_list',
	// 取出全景场景图信息
	'scene_view': APIPATH + 'scene/view',
	// 取出全景场景图商家信息
	'scene_store': APIPATH + 'scene/store',
	// 取出全景场景图景点信息
	'scene_scenic': APIPATH + 'scene/scenic',
	// 取出全景场景图达人信息
	'scene_talent': APIPATH + 'scene/talent',
	//获取标注信息
	'store_region': APIPATH + 'store/store_region',

	// 根据城市名称获取id
	'get_city_id': APIPATH + 'index/get_city_id',
	// 场景图的分类
	'scene_classify': APIPATH + 'scene/classify',

    //获取服务端版本号
    'getVersion': APIPATH + 'index/getVersion'
};




// 定义一些常用函数
var CF = {
	queryString: function(val) {
		var uri = window.location.search;
		uri = uri.substr(1);
		var re = new RegExp("" + val + "=([^&?]*)", "ig");
		return ((uri.match(re)) ? (uri.match(re)[0].substr(val.length + 1)) : null);
	},
	randomString: function(len) {
		var len = len || 32;
		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
		var maxPos = chars.length;
		var pwd = "";
		for (i = 0; i < len; i++) {
			pwd += chars.charAt(Math.floor(Math.random() * maxPos));
		}
		return pwd;
	},
	/*
	 * 用于加载js
	 * fn {Function || variable} : 如果该函数或者变量已经定义，则直接调用回调函数；否则加载指定js
	 * src {String}: 要加载的js地址
	 * callback {Function} : js加载完毕后的回调函数
	 */
	needJS : function (fn, src, callback) {
		callback = callback || function() {};
		if (fn) return callback(false);
		var scripts = document.___needJS__ || (document.___needJS__ = []);
		var script = scripts[src] || (scripts[src] = {
			loaded: false,
			callbacks: []
		});
		if (script.loaded) return callback(false);
		var cbs = script.callbacks;
		if (cbs.push(callback) == 1) {
			var js = document.createElement("script");
			js.onload = js.onreadystatechange = function() {
				var st = js.readyState;
				if (st && st != "loaded" && st != "complete") return;
				js.onload = js.onreadystatechange = null;
				script.loaded = true;
				for (var i = 0; i < cbs.length; i++) cbs[i](true);
			};
			js.src = src;
			document.getElementsByTagName("head")[0].appendChild(js);
		}
	},
	ajax : {
		post: function(url, data, fn) {
			var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
			xhr.open("post", url, true);
			if ("withCredentials" in xhr) {
				xhr.withCredentials = true;
			}
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
					fn.call(this, xhr.responseText);
				}
			};
			xhr.send(data);
		}
	}
}







if (self===top) {
	// 通过app分享出去的连接,微信会自动带上参数
	// 比如商品页分享出去的连接是
	// http://buygifts.3ncto.com.cn/www/index.html?from=timeline&isappinstalled=1#/index/find/art/43
	// 这样的域名因为加了微信带的参数,跟支付域名不一致,所以导致支付不成功....
	// 解决方案是检测到有location.search则自动去掉location.search重新跳转
	// 检测到如果连接中没有index.html ， 则强制加入
	if (/MicroMessenger/i.test(navigator.userAgent)) {
		if (self===top) {
			if (location.pathname.indexOf('index.html') == -1) {
				location.href = location.origin + location.pathname + "index.html" + location.hash;
			}else {
				if (CF.queryString("from") && CF.queryString("isappinstalled")) {
					location.href = location.origin + location.pathname + location.hash;
				}
			};
		};
	};


	// 百度统计
	if (link.indexOf('m.tuliyou.com') != -1) {
		if (link.indexOf('/www/') != -1) {
			var _hmt = _hmt || [];
			(function() {
				var hm = document.createElement("script");
				hm.src = "//hm.baidu.com/hm.js?e02003e4bfd6b3ea31698a8d4d249a03";
				var s = document.getElementsByTagName("script")[0];
				s.parentNode.insertBefore(hm, s);
			})();
			// 针对单页面的百度统计
			// http://tongji.baidu.com/open/api/more
			window.addEventListener("hashchange",function(){
				console.log(location.pathname + location.hash);
				_hmt.push(['_trackPageview', location.pathname + location.hash]);
			},false);
		};
	}




	// 判断是否登录【为了更快的判断所以放这里】
	console.log("初始化判断用户是否登录...");
	if (localStorage.auth_token) {
		// localStorage.isLoged = false;
		CF.ajax.post(API.user_my, "user_id=" + localStorage.user_id + "&auth_token=" + localStorage.auth_token, function(response) {
			var response = JSON.parse(response);
			if (response.RESPONSE_STATUS == 100) {
				localStorage.isLoged = true;
				console.log("用户已经登录...");
			} else {
				console.log("用户未登录...");
				localStorage.isLoged = false;
				localStorage.removeItem("auth_token");
				localStorage.removeItem("nickname");
				localStorage.removeItem("upfile");
				localStorage.removeItem("user_id");
				localStorage.removeItem("username");
				localStorage.removeItem("busines_id");
			}
		});
	} else {
		console.log("用户未登录...");
		localStorage.isLoged = false;
		localStorage.removeItem("auth_token");
		localStorage.removeItem("nickname");
		localStorage.removeItem("upfile");
		localStorage.removeItem("user_id");
		localStorage.removeItem("username");
		localStorage.removeItem("busines_id");
	};

};