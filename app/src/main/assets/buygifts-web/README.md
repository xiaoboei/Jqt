# tuliyou
途礼游






## 前端架构

#### 源代码存放在【www】文件夹，包括
- 【index.html】是项目总入口文件。
- 【img】存放整个项目所需要的切图，里面按模块细分
- 【css】存放整个项目的样式文件，map.less和map.css是地图模块，style.css是其他所有模块的样式。
- 【templates】存放整个项目的模板文件，按功能模块划分
- 【lib】文件夹
- 【js】文件夹

#### 【lib】存放整个项目所需要的库类插件，包括
- 【ionic】http://www.ionicframework.com/ 不用介绍了，整个项目都是基于ionic做的，ionic则是基于angularjs
- 【vue】http://cn.vuejs.org/ 主要用于地图页面，百度地图的展示是由地图页面的iframe嵌套在ionic的页面上的。
- 【jquery】人手一个，你值得拥有
- 【zepto】移动端jq
- 【hammer】移动端手势插件
- 【AreaRestriction】百度地图插件

#### 【js】存放整个项目的js文件，其中包括
- 【common.js】最基本的项目配置文件，其中包括服务器路径，api接口路径，百度统计代码，以及一些按需的小功能。
- 【app.js】初始化ionic项目的配置文件，包括定义一些全局设置，还有整个项目的路由功能模块。
- 【controllers.js】初始化ionic项目后，需要运行一些初始化函数，和定义一些公共全局函数，以及一些不能按模块划分的页面代码
- 【controllers-map.js】按模块划分，存放地图模块的js代码
- 【controllers-find.js】按模块划分，存放发现模块的js代码
- 【controllers-mine.js】按模块划分，存放个人中心模块的js代码
- 【directive.js】存放整个项目的指令代码
- 【services.js】存放整个项目的service，主要是用于各个控制器之间共享数据

#### 有哪些业务流程实现的代码需要注意（包括需要优化的部分）
- 【common.js】
	- 里面有个小功能，是处理微信分享出去的页面不能支付的bug，内附有详细说明
	- 因为ionic是属于单页应用，百度统计时加上了针对单页面的统计代码
	- 判断是否登录【为了更快的判断所以放这里common.js里面，因为common.js是第一个加载的js文件】
- 【controllers.js】
	- 主要是定义了各种各样的公共函数，里面都附有详细说明
	- 需要注意一些功能需要区分不同的客户端【微信端，安卓app端，iosapp端，普通网页端】，比如扫描函数【$rootScope.scanQRCode】，分享函数【$scope.share】等等















[【设计稿】](http://p.ruis.cc:1709/redmine/documents/118)
账号密码tary/ruisSD.0817

接口API文档 http://buygifts.3ncto.com.cn/doc/


SFTP
地址49.213.15.168
端口15922
帐号密码tary/tary123


禅道
http://d.ruis.cc:888
zhuanghuanbin/Rusi8888

后台录数据
http://buygifts.3ncto.com.cn/Manager/Public/login
admin/111111

商城后台
http://buygifts.3ncto.com.cn/Manager
admin/111111

商家后台
http://buygifts.3ncto.com.cn/StoreManager
store/111111

达人后台
http://buygifts.3ncto.com.cn/TalentManager
talent/111111


商家代理商后台
http://buygifts.3ncto.com.cn/AgentStoreManager/Public/login
agentstore/111111


商家代理商后台
http://buygifts.3ncto.com.cn/AgentUserManager/Public/login
agentuser/111111


测试帐号
13535518370/111111

http://fir.im/tuliyouBetaA
http://fir.im/tuliyouBetaI
这是封装了app功能的包




百度统计：

http://mtj.baidu.com/web/welcome/login

账号：18928875930

密码：tuliyou6688





代码生成后需要手工操作步骤：

安卓：
修改res/values/strings.xml的“app_name”为期望的应用名字，例如“途礼游”
在“MainActivity”里面添加友盟的统计代码
	@Override
	public void onResume() {
		super.onResume();
		MobclickAgent.onResume(this);
	}

	@Override
	public void onPause() {
		super.onPause();
		MobclickAgent.onPause(this);
	}
在“MainActivity”里面添加错误消息处理代码，屏蔽不能打开网址时弹出的对话框
    @Override
    public void onReceivedError(final int errorCode, final String description, final String failingUrl) {
        if (errorCode != -6) {
            super.onReceivedError(errorCode, description, failingUrl);
        }
    }

iOS：
修改项目配置信息“product name”为期望的应用名字，例如“途礼游”
个性项目配置信息“enable bitcode”为NO
如需要瘦身ipa大小，可以删除Staging/www目录下所有文件，但不能删除www目录

