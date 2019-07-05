ctrlApp.controller('ctrlScene', function ($scope, $rootScope) {

  // 作者：林佳俊
  // 由于场景图原定是独立于其他部分的，故未使用 Angular
  // 改方案后直接植入控制器
  // 少数代码不是我所写，遇到会注释澄清

  var v;
  var transform = {     // 位移偏移值
    x: 0,
    y: 0
  };
  var startX,           // 触碰起始横座标
      startY;           // 触碰起始纵座标
  var touching = false; // 是否正在触碰
  var isDraggingDown;   // 是否滑动至底部
  var toggled = false;  

  var translateY = 0;   // 位移纵向偏移值的缓存

  var storeCoords = [],   // 商店座标
      scenicCoords = [],  // 景点座标
      talentCoords = [];  // 达人座标

  var filepath = FILEPATH;  // 文档目录常量
  var _this;

  var sceneId, classId;  

  var isIos = /iPad|iPhone|iPod/.test(navigator.userAgent); // 是否 iOS 终端

  var jLam = {
    utils: {
      body       : document.body,
      box        : document.getElementById('that-div'),
      marks      : document.getElementsByClassName('js-mark'),
      imgs       : document.getElementsByClassName('js-img'),
      badges     : document.getElementsByClassName('js-store'),
      pins       : document.getElementsByClassName('js-pin'),
      thumbs     : document.getElementsByClassName('js-thumb'),
      toggle     : document.getElementsByClassName('js-toggle')[0],
      buttonUp   : document.getElementsByClassName('js-up')[0],
      buttonDown : document.getElementsByClassName('js-down')[0],
      ionContent : document.getElementsByTagName('ion-content')[0],
      ionNav     : document.getElementsByClassName('w-map-nav')[0],
      mapLink    : document.getElementsByClassName('js-map')[0],
      links      : document.getElementsByClassName('link'),
      talentCount: document.getElementsByClassName('icon-talent-count')[0],

      sceneUrl   : location.href,

      // 判断是否拖至顶部的方法
      arrivingTop: function (el) {
        var offsetY = el.style.webkitTransform.substring(11).slice(0, -3);  // 暴力拆解元素 Y 轴位移值
        if (offsetY > 0) return true;
        return false;
      },

      // 判断是否拖至底部的方法
      arrivingBottom: function (el) {
        if (window.innerHeight - el.getBoundingClientRect().bottom > 67) return true;
        return false;
      },

      // toggle display 值的方法
      toggleVisibility: function (nodeList, visible) {
        [].slice.call(nodeList).forEach(function (node) {
          visible ? node.style.display = 'block' : node.style.display = 'none';
        });
      },

      // 懒加载图片的方法
      loadImage: function (img) {
        img.src = img.getAttribute('data-src');
      },

      // 判断元素是否进入视口的方法
      elementInViewport: function (el, bottom) {
        var rect = el.getBoundingClientRect();
        if (bottom) { // 是否需要判断到达底部
          return (
            rect.top    >= 0 &&
            rect.left   >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)  &&
            rect.right  <= (window.innerWidth  || document.documentElement.clientWidth)
          );
        } else {
          return (
            rect.top  >= 0 &&
            rect.left >= 0 &&
            rect.top  <= (window.innerHeight || document.documentElement.clientHeight)
          )
        }
      }
    },
    //初始化
    init: function (id) {
      $rootScope.shouldReturnPos = true;  // 不是我写

      v = this.utils;
      _this = this;
      transform.y = 0;

      // 绑定路由变动事件
      window.addEventListener('popstate', this.onLocationChange.bind(this));
      window.addEventListener('beforeunload', this.onLocationChange.bind(this));

      // 使用 setInterval 是为兼顾
      // 某些低级安卓浏览器的线程无法适时懒加载
      setInterval(function () {
        _this.lazyloadComponents(); // 懒加载组件
        $('.parent__wrapper').scrollLeft(0);  // 某些安卓浏览器 overflow-x: hidden 无效，强制禁用横向滚动
         _this.lazyloadImages();  // 懒加载图片
      }, 500);

      setTimeout(function () {
        // 对游离出屏幕的组件进行复位
          _this.restrictStore();
          _this.restrictTalent();
      }, 3000);

      sessionStorage.setItem('scene-id', sceneId);

      this.startAjax(id); // Ajax 获取景点和商店等信息
      v.toggle.addEventListener('click', this.onToggleClick.bind(this));  // 景点点击事件
      var userAgent = navigator.userAgent.toLowerCase();

      /**
       * 检测平台和机型，一些采取触碰滑动，一些采取 scroll 滚动
       */
      if (isIos ||
        userAgent.indexOf('meizu') !== -1 ||
        userAgent.indexOf('mx') !== -1 ||
        userAgent.indexOf('m1 note') !== -1 ||
        userAgent.indexOf('oppo') !== -1 ||
        userAgent.indexOf('n1t') !== -1 ||
        userAgent.indexOf('f1fw') !== -1) {
        v.box.parentElement.style.height = 'auto';
        v.box.parentElement.style.overflow = 'hidden';
        var transformY = localStorage.getItem('transformY');

        // 是否回到上次滑动位置的逻辑
        if ($rootScope.shouldReturnPos) {
          // $rootScope.shouldReturnPos = false;
          v.box.style.webkitTransform = 'translateY(' + transformY + 'px)';  
          // transformY = 0;              
        }
        v.box.addEventListener('touchstart', this.onBoxTouchStart.bind(this));
        v.box.addEventListener('touchmove',  this.onBoxTouchMove.bind(this));
        v.box.addEventListener('touchend',   this.onBoxTouchEnd.bind(this));
      } else {
        v.box.style.paddingBottom = '36px';
        v.box.addEventListener('scroll', this.onBoxScroll.bind(this));
        v.box.addEventListener('touchend',  this.onBoxTouchEnd2.bind(this));  // scroll 事件完毕后的事件
        console.log(localStorage.getItem('scrollTop'));
        // 是否回到上次滚动位置的逻辑
        if ($rootScope.shouldReturnPos) {
          setTimeout(function () {
            v.box.parentElement.scrollTop = Number(localStorage.getItem('scrollTop'));
          }, 100);        
        }
      }

      this.setMapLink();  // 设定百度地图链接

      this.setTalentLink(id); // 设定达人按钮链接
    },

    onBoxTouchEnd2: function (e) {
      this.getNearestComponent(); // 得到视口中离中央最近的组件
      localStorage.setItem('scrollTop', v.box.parentElement.scrollTop); // 缓存每次滚动完毕的座标待用
    },

    onLocationChange: function (e) {  // 废止
      var link = location.href;    
      // if (link.indexOf('find/shop/') !== -1 ||
      //     link.indexOf('map/scenic/') !== -1 ||
      //     link.indexOf('find/talent/') !== -1) {
      //       sessionStorage.setItem('scene-id', sceneId);
      //     }
    },

    setTalentLink: function (id) {
      var talentLink = document.getElementsByClassName('js-list')[0];
      // www_android/#/index/find/talent-list/87
      talentLink.href = filepath + '#/index/find/talent-list/' + id;
    },

    setMapLink: function () {
      // 根据中心点决定百度地图链接
      var viewableHeight = v.ionContent.clientHeight - v.ionNav.clientHeight;
      var centerY = viewableHeight / 2,
          centerX = window.innerWidth / 2;
      centerY += $('.parent__wrapper').scrollTop();
      v.mapLink.setAttribute('data-coord', centerX + ', ' + centerY);
    },



    startAjax: function (id) {
      // v.loading.classList.add('shown');

      // var id = window.location.hash.split('?')[1]; // 从当前 url 获取城市 id

      var imgUrl = API.scene_view + '?id=' + id;
      var imgs = [];
      var imgPath = '';
      var imgCount;
      var inner = '',   // 商店标签
          innerS = '',  // 景点标签
          innerT = '';  // 达人标签
      var imgWidth,     // 场景图全图宽度
          imgHeight;    // 场景图全图高度
      // 获取场景图数据的 Ajax
      $.getJSON(imgUrl, function (data) {

           //微信分享
           $rootScope.wxShare(data.RESPONSE_INFO.scene.name, '在线手绘地图', '');

           // 获取原图信息
            var imgDir = data.RESPONSE_INFO.scene.img_dir;
            imgWidth = data.RESPONSE_INFO.scene.width,
            imgHeight = data.RESPONSE_INFO.scene.height;

            imgCount = Math.ceil(imgHeight / (178 * 2));  // 计算图片张数

            // 依序插入切图
            for (var i = 0; i < imgCount; i++) {
              imgPath = imgDir + '2/map_' + i + '.png';
              v.box.insertAdjacentHTML('beforeend', '<img src="" data-src="' + imgPath + '" class="parent__img js-img">');
            }

            // 优先加载前 4 张切图（初始懒加载对于某些机型无效，唯能如此）
            for (var i = 0; i < 4; i++) {
              v.loadImage(document.getElementsByClassName('js-img')[i]);
            }
            // _this.lazyloadImages(); // 懒加载场景切图（以显示首屏的那几张）


            var imgLength = document.getElementsByClassName('js-img').length;
            var picOne = document.getElementsByClassName('js-img')[0],
                picLast = document.getElementsByClassName('js-img')[imgLength - 1],
                screenWidth = picOne.offsetWidth;

            var canvasHeight = screenWidth * imgHeight / imgWidth;
            var currTab = document.querySelector('.ng-binding.active'); // 当前场景对应的 tab

            // 上传图片尺寸比例参差，计算画布高度有误差，暴力调整
            if (currTab.textContent === '凤凰古城') {
              v.box.style.height = canvasHeight - 10 + 'px';
            } else if (currTab.textContent === '太古仓') {
              v.box.style.height = canvasHeight + 64 + 'px';
            } else if (currTab.textContent === '广州花市') {
              v.box.style.height = canvasHeight + 32 + 'px';
            } else {
              v.box.style.height = canvasHeight + 40 + 'px';
            }

            // 切图开始加载后，计算并设置图片高度
            picOne.onload = function () {
              var picNaturalHeight = picOne.naturalHeight;
              var picActualHeight = picOne.offsetHeight;
              [].slice.call(document.getElementsByClassName('js-img')).forEach(function (img, index) {
                if (index !== imgLength - 1) {
                  picNaturalHeight = img.naturalHeight;
                  img.style.height = picActualHeight + 'px';
                }
              });
            };

        // picLast.onload = function () {
          // 有些场景的最后一幅图高度不统一，稍高，需要单独计算
          picLast.style.height = screenWidth / picLast.naturalWidth * picLast.naturalHeight + 'px';
        // };

      }).done(function () {
        
        var storeUrl = API.scene_store + '?id=' + id;
        var leftRatio = '',   // 商店的百分比左座标
            topRatio  = '';   // 商店的百分比上座标
        // 获取商店数据的 Ajax
        $.getJSON(storeUrl, function (data) {
          var storeArray = data.RESPONSE_INFO.store;
          storeArray.forEach(function (store) {
            var leftPx = store.scene_x,
                topPx  = store.scene_y;
            var lng = store.lng,
                lat = store.lat;
            // 像素座标除以场景图宽高，得到百分比座标
            leftRatio = parseFloat(leftPx / imgWidth * 100).toFixed(2);
            topRatio  = parseFloat(topPx / imgHeight * 100).toFixed(2);
            // 填充商店标签并插入
            // http://buygifts.3ncto.cn/www/#/index/map/scene?85
            inner = '<div class="parent__badge js-store items block" data-lng="' + lng +'" data-lat="' + lat + '"  style="position: absolute; left: ' + leftRatio + '%; top: ' + topRatio + '%;"><div class="items-avatar animated"><a href="../..' + filepath + '#/index/find/shop/' + store.busines_id + '" target="_top" class="toggleContent"><span></span></a></div><div class="items-content items-content-scenic block items-store" style="margin:0; transform:scale(1) translate3d(-50%,0,0);-webkit-transform:scale(1) translate3d(-50%,0,0)"><a href="../..' + filepath + '#/index/find/shop/' + store.busines_id + '" target="_top" class="link"><div class="bd"><img src="' + store.upfile + '" alt="" class="img"><p class="name">' + store.name + '&nbsp;&nbsp;&nbsp;<i class="icon ion-heart"></i>&nbsp;' + store.count + '</p></div></a></div><div class="items-arr-scenic block" style="top:-36px"></div></div>';
            v.box.insertAdjacentHTML('beforeend', inner);
          });
        });
        
        localStorage.setItem('store-coords', JSON.stringify(storeCoords));
        var scenicUrl = API.scene_scenic + '?id=' + id;
        var leftRatioS = '',
            topRatioS  = '';
        // 获取景点数据的 Ajax
        $.getJSON(scenicUrl, function (data) {
          var scenicArray = data.RESPONSE_INFO.scenic;        
          scenicArray.forEach(function (scenic) {
            var leftPxS = scenic.scene_x,
                topPxS  = scenic.scene_y;
            var lngS = scenic.lng,
                latS = scenic.lat;
            class_upfile = scenic.class_upfile?scenic.class_upfile:'img/mark.png';
            leftRatioS = parseFloat(leftPxS / imgWidth * 100).toFixed(2);
            topRatioS  = parseFloat(topPxS / imgHeight * 100).toFixed(2);
            innerS = '<div class="parent__mark js-mark items block" data-lng="' + lngS +'" data-lat="' + latS + '"  style="position: absolute; left: ' + leftRatioS + '%; top: ' + topRatioS + '%;"><div class="items-doc"><a href="javascript:;" style="background:url('+ class_upfile +') no-repeat center 0;background-size:48px 48px;" class="toggleContent js-pin"></a></div><div class="act"><div class="items-content items-content-scenic"><a href="../..' + filepath + '#/index/map/scenic/' + scenic.busines_id + '" target="_top" class="link"><div class="bd"><img src="' + scenic.upfile + '" alt="" class="img">' + '<p class="name">' + scenic.name + '</p>' + '<p><i class="icon ion-heart"></i>' + scenic.count + '</p></div></a></div><div class="items-arr-scenic"></div></div></div>';
            v.box.insertAdjacentHTML('beforeend', innerS);
          });
          _this.lazyloadComponents(); // 初始懒加载首屏内的景点针
          // 绑定景点红针的点击事件
          [].slice.call(v.pins).forEach(function (pin) {
            pin.addEventListener('click', _this.onPinClick.bind(_this));
          });

          localStorage.setItem('scenic-coords', JSON.stringify(scenicCoords));
        });
        var talentUrl = API.scene_talent + '?id=' + id;
        var leftRatioT = '',
            topRatioT  = '';
        // 获取达人数据的 Ajax
        $.getJSON(talentUrl, function (data) {
          var talentArray = data.RESPONSE_INFO.talent;
          talentArray.forEach(function (talent) {
            var leftPxT = talent.scene_x,
                topPxT  = talent.scene_y;
            leftRatioT = parseFloat(leftPxT / imgWidth * 100).toFixed(2);
            topRatioT  = parseFloat(topPxT / imgHeight * 100).toFixed(2);
            innerT = '<div class="parent-thumb js-thumb items block" style="position: absolute; left: ' + leftRatioT + '%; top: ' + topRatioT + '%;"><div class="items-avatar animated talents"><a href="../..' + filepath + '#/index/find/talent/' + talent.busines_id + '"  target="_top"  class="toggleContent link"><img src="' + talent.upfile + '" alt=""></a></div><div class="items-content items-sm items-content-talent block"><a href="../..' + filepath + '#/index/find/talent/' + talent.busines_id + '" target="_top" class="link"><div class="bd"><p class="name"><span class="sub">' + talent.count + '</span><span class="sub"><i class="icon ion-heart">&nbsp;</i></span><span class="mark">' + talent.name + '</span></p></div></a></div><div class="items-arr-talent block"></div></div>';
            v.box.insertAdjacentHTML('beforeend', innerT);
          });
          v.talentCount.textContent = talentArray.length;

          localStorage.setItem('talent-coords', JSON.stringify(talentCoords));
        });
      }).fail(function (jqxhr, textStatus, error) { alert(error) })
        .always(function () { console.log('complete'); });

      
    },

    getNearestComponent: function () {
      var viewableHeight = v.ionContent.clientHeight - v.ionNav.clientHeight;
      var centerY = viewableHeight / 2,
          centerX = window.innerWidth / 2;

      var components = [];
      [].slice.call(v.marks).forEach(function (mark) {
        if (v.elementInViewport(mark, true)) {
          components.push(mark)
        }
      });
      [].slice.call(v.badges).forEach(function (badge) {
        if (v.elementInViewport(badge, true)) {
          components.push(badge)
        }
      });

      var offsets = [];

      components.forEach(function (component) {
        var bottom = component.getBoundingClientRect().bottom - 49; // 49 是底部 tab 的高度
        var offset = Math.abs(bottom - centerY);
        var offsetObj = { component: component, offset: offset };
        offsets.push(offsetObj);
      });

      var offsetArr = [];
      offsets.forEach(function (of) {
        offsetArr.push(of.offset);
      });
      Array.prototype.min = function() {
        return Math.min.apply(null, this);
      };
      var minOffset = offsetArr.min();
      var nearestComponent;

      offsets.forEach(function (of) {
        if (of.offset === minOffset) {
          nearestComponent = of.component;
        }
      });

      var nearestLng = nearestComponent && nearestComponent.getAttribute('data-lng') || undefined;
      var nearestLat = nearestComponent && nearestComponent.getAttribute('data-lat');

      sessionStorage.setItem('lng', nearestLng);
      sessionStorage.setItem('lat', nearestLat);
    },

    // 禁锢达人位置
    restrictTalent: function () {
      var talentContents = document.querySelectorAll('.parent-thumb.js-thumb.items.block');
      this.restrictPinPosition(talentContents);
    },

    // 禁锢商店位置
    restrictStore: function () {
      var storeContents = document.querySelectorAll('.items-content.items-content-scenic.block.items-store');
        // setInterval(function () {
          // console.log(_this.restrictPinPosition);
          this.restrictPinPosition(storeContents);
        // }, 1000);
    },

    // 禁锢位置的主方法
    restrictPinPosition: function (list) {
      // var pinContents = document.querySelectorAll('.act.active .items-content.items-content-scenic');
      [].slice.call(list).forEach(function (item) {
        // 以下计算方法比较神奇，勿纠结

        var rect = item.getBoundingClientRect();

        // 判断是否超出左边界
        if (rect.left < 0) {
          item.style.left = -rect.left + 'px';
        }
        // 判断是否超出右边界
        if (document.body.offsetWidth - rect.left < item.offsetWidth) {
          // console.log(item);
          if (item.classList.contains('js-thumb')) {
            var left = item.style.left;
            item.style.left = 'calc(' + left + ' + ' + -(rect.right - document.body.offsetWidth) + 'px)';
          } else {
            item.style.left = -(rect.right - document.body.offsetWidth) + 'px';
          }
          
        }
        // 判断是否超出上边界
        // var topBound;
        // if (location.href.indexOf('_ios') !== -1) {
        //   topBound = 99;
        // } else {
        //   topBound = 79;
        // }
        // if (rect.top < topBound) {
        //   var parent;
        //   if (item.parentElement.classList.contains('act')) {
        //     parent = item.parentElement.parentElement;
        //   } else {
        //     parent = item.parentElement;
        //   }
        //   var parentTop = parent.style.top;
        //   parent.style.top = 'calc(' + parentTop + ' + ' + (topBound - rect.top) + 'px)';
        // }
      });
    },

    // toggle 组件的显示或隐藏
    onToggleClick: function (e) {
      if (!toggled) {
        v.toggleVisibility(v.marks, false);
        v.toggleVisibility(v.badges, false);
        v.toggleVisibility(v.thumbs, false);
        v.toggle.classList.add('active');      
      } else {
        v.toggleVisibility(v.marks, true);
        v.toggleVisibility(v.badges, true);
        v.toggleVisibility(v.thumbs, true);
        v.toggle.classList.remove('active');
      }
      toggled = !toggled;
    },

    // 点击红针的方法
    onPinClick: function (e) {
      var target = e.target;
      // 显示对应的景点信息    
      var currentPin = target.parentElement.parentElement.querySelector('.act');
      if (currentPin.classList.contains('active')) {
        currentPin.classList.remove('active');
      } else {
        currentPin.classList.add('active');
        currentPin.parentElement.style.zIndex = '999';
      }
      // 隐藏其他已显示的景点信息
      var pinboard = document.querySelectorAll('.act.active');
      [].slice.call(pinboard).forEach(function (p) {
        if (p === currentPin) return;
        p.classList.remove('active');
        p.parentElement.style.zIndex = '10';
      });
      var pinContents = document.querySelectorAll('.act.active .items-content.items-content-scenic');
      setTimeout(function () {
        _this.restrictPinPosition(pinContents);
      }, 100);
    },

    // 画布开始滑动事件函数
    onBoxTouchStart: function (e) {
      e.preventDefault();
      // alert('start');
      var target = e.targetTouches[0];
      // 触摸点起始座标
      startX = target.clientX;
      startY = target.clientY;
      touching = true;    
      if ($rootScope.shouldReturnPos) {
        transform.y = Number(localStorage.getItem('transformY'));      
      }
      
    },

    // 画布滑动事件函数
    onBoxTouchMove: function (e) {
      e.preventDefault();
      var target = e.targetTouches[0];
      if (!touching) return;

      (target.clientY - startY < 0) ? isDraggingDown = true : isDraggingDown = false; // 判断竖直拖动方向

      // 到达顶部并向下滑时、到达底部并向上滑时、在中间时
      if (v.arrivingTop(v.box) && isDraggingDown
          || v.arrivingBottom(v.box) && !isDraggingDown
          || (!v.arrivingTop(v.box) && !v.arrivingBottom(v.box))) {
        // 位移量设为触摸偏移量
        transform.x += target.clientX - startX;
        transform.y += (target.clientY - startY) * 2;
        // console.log(target.clientX, transform.y);

        this.updateTransform(v.box);
      }

      this.lazyloadComponents();

      this.lazyloadImages();

      // 更新触摸初始座标
      startX = target.clientX;
      startY = target.clientY;

    },

    // 画布滚动事件函数
    onBoxScroll: function () {
      console.log('scrolling...');

      this.lazyloadComponents();
      this.lazyloadImages();

    },

    // 懒加载组件
    lazyloadComponents: function () {
      // 逐个判断 mark 是否进入视口并添加 class
      [].slice.call(v.marks).forEach(function (mark) {
        var needle = mark.getElementsByClassName('items-doc')[0];
        if (v.elementInViewport(mark, true) && !needle.classList.contains('js-show')) {
          needle.classList.add('js-show');
        }
      });

      // 逐个判断 badge 是否进入视口并添加 class
      [].slice.call(v.badges).forEach(function (badge) {
        if (v.elementInViewport(badge, true) && !badge.classList.contains('js-show')) {
          badge.classList.add('js-show');
          badge.querySelector('.items-avatar.animated').classList.add('flash');
        }
      });

      // 逐个判断 thumb 是否进入视口并添加 class
      [].slice.call(v.thumbs).forEach(function (thumb) {
        var avatar = thumb.getElementsByClassName('items-avatar')[0];
        if (v.elementInViewport(thumb, true) && !avatar.classList.contains('flash')) {
          avatar.classList.add('flash');
        }
      });
    },
    
    // 懒加载图片
    lazyloadImages: function () {
      // 逐个判断图片是否进入视口并懒加载
      [].slice.call(v.imgs).forEach(function (img) {
        if (v.elementInViewport(img, false)) {
          v.loadImage(img);
        }
      });
    },
    
    // 画布滚动毕事件函数
    onBoxTouchEnd: function (e) {
      e.preventDefault();
      touching = false;
      localStorage.setItem('transformY', v.box.style.webkitTransform.substring(11).slice(0, -3)); // 暂存滑动终点位置

      // 若超出顶部则回弹
      if (v.arrivingTop(v.box)) {
        v.box.style.webkitTransform = 'translateY(0)';
      }

      // 若超出顶部则回弹
      if (v.arrivingBottom(v.box)) {
        console.log('arrivingBottom');
        var height = v.box.style.height.replace('px', '');
        var boxViewHeight = window.innerHeight - 44 - 35 - 47;
        var transformY = -(height - boxViewHeight);
        v.box.style.webkitTransform = 'translateY(' + transformY + 'px)';
        // 重新设定终点位置，避免超过画布高度
        localStorage.setItem('transformY', transformY);
      }
      
      this.setMapLink();
      this.getNearestComponent();
    },

    // 更新画布位移
    updateTransform: function (el) {
      // 这里暂时只用到 transform.y 值，因为只要垂直拖动    
      el.style.webkitTransform = 'translateY(' + transform.y + 'px)';
    }

  };

  
  $scope.$on('view-scene', function (evt, id) {
    jLam.utils.box.innerHTML = '';
    jLam.utils.box.style.webkitTransform = 'translateY(0)';
    sceneId = id;
    jLam.init(id);
  });              
});

ctrlApp.controller("ctrlMap", function($scope, $ionicLoading,$ionicHistory, $state, $rootScope, $ionicGesture, $http,$ionicPopup,$location,$stateParams) {
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = false;
    });
    // 当前城市id
    var cityId = '';
    // 当前分类id
    $scope.classifyId = '';
    // 分类列表
    $scope.classify = [];
    // 当前城市名
    $scope.cityName = $state.params.city || '';
    // 全景列表
    $scope.list = '';
    // 当前全景id
    $scope.viewId = '';
    // 当前地图链接
    $scope.link = '';

    // 内部函数
    var Utils = {}

    // 初始化
    Utils.init = function () {        
        if ($scope.cityName == '') {
            // this.getCityName();            
            this.getCurrentPosition();                        
        }else {            
            this.getCityIdByName();            
        }                
    }
    // 获取场景图分类
    Utils.getClassify = function () {
        var url = API.scene_classify;
        $http.get(url).success(function (response) {
            $scope.classify = response.RESPONSE_INFO.list;
            $scope.classifyId = $scope.classify[0].id;
            Utils.getSceneByCityId();
        })
    }
    // 获取经纬度和城市名
    Utils.getCurrentPosition = function () {
        // 初始化获取用户当前经纬度
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function(r) {
            if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                var city = r.address.city;
                $scope.cityName = city;                
                localStorage['w-cityName'] = city;
                localStorage['w-localCity'] = city;
                localStorage['w-point'] = JSON.stringify(r.point);
                Utils.getCityIdByName();
            } else {
                // alert('failed' + this.getStatus());
                //默认广州
                var city = '广州市';
                $scope.cityName = city;                
                localStorage['w-cityName'] = city;
                localStorage['w-localCity'] = city;
                // localStorage['w-point'] = JSON.stringify(r.point);
                Utils.getCityIdByName();
            }
        }, {
            enableHighAccuracy: true
        })
    }
    // 获取当前城市名  定位不准 ,弃用
    Utils.getCityName = function () {
        var myCity = new BMap.LocalCity();
        myCity.get(function (data) {
            $scope.cityName = data.name;
            localStorage['w-cityName'] = data.name;
            localStorage['w-localCity'] = data.name;
            Utils.getCityIdByName();
        })
    }
    // 获取当前城市ID
    Utils.getCityIdByName = function () {
        var url = API.get_city_id + '?name=' + $scope.cityName;
        $http.get(url).success(function (response) {
            if(response.RESPONSE_INFO.region){
                console.log(response.RESPONSE_INFO.region);
                cityId = response.RESPONSE_INFO.region.id;
                localStorage['w-cityId'] = cityId;
                Utils.getClassify();
            }else{
                $scope.cityName = "广州市"
                Utils.getCityIdByName();
            }
        })
    }
    // 根据城市id获取全景图
    Utils.getSceneByCityId = function () {              
        // if(localStorage.getItem("scene-url")){                      
        //   var sceId = localStorage.getItem("scene-url");                              
        //   console.log(sceId);
        //   //localStorage.removeItem('scene-url');
        //   Utils.changeScene(sceId,1);          
        // }
        $scope.link="";                
        if(sessionStorage.getItem("class-id")){
          $scope.classifyId = sessionStorage.getItem("class-id");
        }        
        var url = API.scenic_all + '?region_id=' + cityId + '&scene_classify_id=' + $scope.classifyId;
        $http.get(url).success(function(response) {                                  
            if(response.RESPONSE_INFO){                                                
                $scope.list = response.RESPONSE_INFO.list;
                // console.log(localStorage.getItem("class-id"));
                // console.log(localStorage.getItem("scene-id"));
                if($rootScope.initial){                  
                  viewId_url = $location.search()['viewId'];
                  Utils.changeScene(viewId_url,1)          
                  $rootScope.initial = false;
                }                
                else if(sessionStorage.getItem("scene-id")){                  
                  // console.log(sessionStorage.getItem("scene-id"));                                    
                  // console.log(sessionStorage.getItem("scene-id"));                  
                  Utils.changeScene(sessionStorage.getItem("scene-id"),1)        
                  console.log("sdajio");          
                }                                
                else if ($scope.list.length) {                
                    $rootScope.shouldReturnPos = false;  
                    $scope.viewId = $scope.list[0].id;                    
                    // console.log($scope.viewId);
                    // console.log(sessionStorage.getItem("scene-id"));
                    Utils.changeScene($scope.viewId,$scope.list[0].type);
                    // $scope.link = 'templates/map/maps.html?id=' + $scope.viewId;
                    // console.log();
                }else {                  
                    $ionicPopup.alert({
                        title : '提示',
                        template : '暂无内容',
                        okType : 'button-assertive'
                    })
                }
            }else{
                $rootScope.shouldReturnPos = false;
                $scope.cityName = "广州市"
                Utils.getCityIdByName();
                $scope.viewId = cityId;
                $scope.link = 'templates/map/maps.html?id=' + $scope.viewId;
            }
        })
    }
    // 切换全景
    Utils.changeScene = function (id, type) {        
        $scope.viewId = id;
        $scope.viewType = type;            
        if(sessionStorage.getItem("postTrue")){
          $rootScope.shouldReturnPos = true;
          sessionStorage.removeItem("postTrue");
        }
        if(!sessionStorage.getItem("scene-id")){
              $rootScope.shouldReturnPos = false;              
            }                
        if(id!=sessionStorage.getItem("scene-id")){          
          localStorage.removeItem('transformY');
          localStorage.setItem('scrollTop',0);
        }        
        // console.log($scope.viewType);
        // localStorage.setItem("mapNum", id+","+type);
        // console.log(localStorage.getItem("mapNum"));        
        if (type == 0) {
            sessionStorage.removeItem("scene-id");
            // console.log('全景');
            $state.go('index.map');
            $scope.mapshow = true;
            $scope.wmaps = false;            
            $scope.link = 'templates/map/maps.html?id=' + id;
        } else {
            // console.log('场景');            
            sessionStorage.removeItem("scene-id");                    
            $state.go('index.map.scene',{viewId:id,classId:$scope.classifyId});
            /*$location.url('/index/map/scene?' + id);*/
            setTimeout(function () {$scope.$broadcast('view-scene', id);}, 450);
            $scope.mapshow = false;
            $scope.wmaps = true;            
            //$scope.link = 'templates/map/scene.html?id=' + $scope.viewId;
        }
    }
    // 切换分类
    Utils.changeClassify = function (id) {
        sessionStorage.removeItem("scene-id");
        if(id){                    
          sessionStorage.setItem('class-id', id);          
        }
        $scope.classifyId = id;        
        $scope.mapshow = true;
        $scope.wmaps = false;
        Utils.getSceneByCityId();        
    }

    $scope.changeScene = Utils.changeScene;
    $scope.changeClassify = Utils.changeClassify;

    function onDeviceReady() {
        // 初始化
        
          //Utils.changeScene(localStorage.getItem("mapNum").split(",")[0],localStorage.getItem("mapNum").split(",")[1]);
        
          Utils.init();        
        
        // console.log(localStorage.getItem("mapNum").split(","));

    }

    // 客户端ready后执行
    if ($rootScope.isWebView) {
        //document.addEventListener('deviceready',onDeviceReady,false);
        onDeviceReady();
    // 非客户端
    }else {
        onDeviceReady();
    }
    //onDeviceReady();
    $scope.mapshow = true;
    $scope.wmaps = false;
    /*if($scope.viewType==1){
      $scope.mapshow = false;
      $scope.wmaps = true;
    }*/
    $scope.changeMap = function(){
        $scope.id = $location.search().viewId;        
        $scope.mapshow = true;
        $scope.link = 'templates/map/scene-maps.html?id=' + $scope.id;
    }

    $scope.changeSceneG = function(){
        console.log("aa");
        $scope.mapshow = false;
    }


})

// 城市定位
ctrlApp.controller("ctrlMapLocation", function($scope, $ionicLoading, $state, $rootScope, $ionicGesture, $http, $location,$ionicHistory) {
    //console.log("ctrlMapLocation");
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = true;
    });

    $scope.query = '';

    $scope.cityName = localStorage['w-localCity'] || '';    

    var DATA = {};
    var CITIES = {};
    var Jname = document.getElementById('Jname');
    var cityId = '';
    var Utils = {}    

    Utils.init = function () {
        Utils.getAllCity();                        
    }    
    
    //返回
    $scope.back = function(){
      history.go(-1);
    }

    //选择城市
    Utils.changeCity = function (name) {        
        localStorage['w-cityName'] = name;
        sessionStorage.removeItem('class-id');
        sessionStorage.removeItem('scene-id');
        Jname.value = '';
        $scope.cities = CITIES;
        console.log(name);
        $rootScope.$emit('cityName',name);
        if($location.search().url == '/index/find'){          
          $state.go('index.find');
        }else if($location.search().url == '/index/find/talent'){          
          $state.go('index.find-talent');
        }else{
          $state.go('index.map',{city:name});
        }
    }

    Utils.getAllCity = function() {
        $http.get(API.index_map_city).success(function(response) {
            var list = response.RESPONSE_INFO.region;
            DATA = list;
            for (var i = 0, len = list.length; i < len; i++) {
                var item = list[i];
                var pinyin = item.pinyin;
                if (typeof CITIES[pinyin] == 'undefined') {
                    CITIES[pinyin] = [];
                }
                CITIES[pinyin].push(list[i]);
            }
            $scope.cities = CITIES;
        });
    }

    Utils.view = function (id) {
        document.getElementById(id).scrollIntoView(true);
    }

    Utils.search = function () {
        var name = Jname.value;
        if (name != '') {
            var temp = [];
            var pinyin = '';
            var ret = {};
            for (var i = 0 , len=DATA.length; i < len ; i++) {
                if (DATA[i].name.indexOf(name) != -1) {
                    if (pinyin =='') {
                        pinyin = DATA[i].pinyin;
                    }
                    temp.push(DATA[i]);
                }
            }
            ret[pinyin] = temp;
            $scope.cities = ret;
        }else {
            $scope.cities = CITIES;
        }
    }

    $scope.changeCity = Utils.changeCity;
    $scope.view = Utils.view;
    // $scope.search = Utils.search;

    Jname.addEventListener('input',Utils.search,false);

    Utils.init();

})

/*景点*/
ctrlApp.controller("ctrlMapScenic", function($scope,$state,$http,$ionicLoading,$rootScope,$ionicPopup,$ionicSlideBoxDelegate) {
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = true;        
    });

    $ionicLoading.show({
        template: "数据正在加载中..."
    });

    $scope.id = $state.params.id;
    $scope.title = '景点';
    $scope.showDesc = false;
    $scope.is_fans = '0';
    $scope.comments = [];

    var Utils = {}

    Utils.init = function () {
        Utils.getScenic();
        Utils.getScenicLike();
        Utils.checkIsFans();
        Utils.getScenicComment();
    }

    Utils.post = function (url,params,callback,err) {
        params.user_id = $rootScope.user_id;
        params.auth_token = $rootScope.auth_token;
        $http({
            method : 'POST',
            headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"},
            url : url,
            data : $rootScope.serialize(params)
        }).success(function (response) {
            if (response.RESPONSE_STATUS == 100) {
                callback && callback(response.RESPONSE_INFO);
            }else {
                err && err(response);
            }
        })
    }

    // 判断是否收藏
    Utils.check = function (params,callback) {
        Utils.post(API.fans_check,params,callback);
    }

    // 获取景点详情
    Utils.getScenic = function() {
        $http
            .get(API.scenic_view + "?" + $rootScope.serialize({
                id: $state.params.id,
                user_id: $rootScope.user_id,
                auth_token: $rootScope.auth_token
            }))
            .success(function(response) {
                $scope.storeData = response.RESPONSE_INFO;
                $ionicSlideBoxDelegate.update();


                setTimeout(function() {
                    // 检测所有a链接
                    $(".w-scenic .w-scenic-desc .inner a").click(function(e) {
                        e.preventDefault();
                        var url = $(this).attr("href");
                        if (url.indexOf(location.origin) != -1 || url.indexOf("#/index/") != -1) {
                            $scope.jumpUrl(url);
                        } else {
                            if ($rootScope.isWebView) {
                                cordova.InAppBrowser.open(url, '_blank', 'location=yes,toolbarposition=top,closebuttoncaption=返回');
                            } else {
                                $scope.jumpUrl(url);
                            };
                        };
                    })
                }, 200);



                $scope.title = response.RESPONSE_INFO.scenic.name;
                sessionStorage["t-scenic-share"] = response.RESPONSE_INFO.scenic.name;
                var imgUrl = $scope.storeData.scenic.upfile[0]?$scope.storeData.scenic.upfile[0]:'';
                $rootScope.wxShare($scope.title, $scope.title, imgUrl);
                //if (/MicroMessenger/i.test(navigator.userAgent)) {
                //    var data = {
                //        title: $scope.title,
                //        link: location.origin + "/www/index.html" + location.hash,
                //        desc: $scope.title,
                //        imgUrl: location.origin + "/www/img/logo.png"
                //    }
                //    wx.ready(function() {
                //        wx.onMenuShareTimeline(data);
                //        wx.onMenuShareAppMessage(data);
                //        wx.onMenuShareQQ(data);
                //        wx.onMenuShareWeibo(data);
                //        wx.onMenuShareQZone(data);
                //    });
                //}


                var product = response.RESPONSE_INFO.product;
                for (var i = 0 , len=product.length; i < len ; i++) {
                    (function (m) {
                        var p = product[m];
                        Utils.check({
                            type : 4,
                            id : p.id
                        },function (ret) {
                            $scope.storeData.product[m].is_fans = ret.fans.is_fans;
                        })
                    })(i);
                }

                if (!$scope.storeData) {
                    $ionicLoading.show({
                        template: "景点不存在。"
                    });
                    setTimeout(function() {
                        $ionicLoading.hide();
                        // $state.go("404");
                    }, 1500);
                } else {
                    $ionicLoading.hide();
                }
            });
    }

    // 获取景点评论
    Utils.getScenicComment = function () {
        $http
            .get(API.scenic_comment + '?id=' + $scope.id)
            .success(function (response) {
                $scope.comments = response.RESPONSE_INFO.comment;
            })
    }

    // 用户收藏
    Utils.focus = function (type,id,callback) {
        // 1达人2景点3商家4商品5文章
        $ionicLoading.show({
            template: "正在处理..."
        });
        Utils.post(API.fans_focus,{
            type : type,
            busines_id : id
        },function (response) {
            $scope.showTips("收藏成功");
            callback && callback(response);
        },function (response) {
            $scope.showTips(response.Tips);
        });
    }

    // 取消收藏
    Utils.cancel = function (type,id,callback) {
        $ionicLoading.show({
            template: "正在处理..."
        });
        Utils.post(API.fans_cancel,{
            type : type,
            id : id
        },function (response) {
            $scope.showTips("您已取消收藏");
            callback && callback(response);
        });
    }

    // 查询当前景点是否已收藏
    Utils.checkIsFans = function () {
        Utils.check({type:2,id:$scope.id},function (ret) {
            $scope.is_fans = ret.fans.is_fans;
        })
    }

    // 获取其他景点
    Utils.getScenicLike = function () {
        $http
            .get(API.scenic_like + "?" + $rootScope.serialize({
                id: $state.params.id
            }))
            .success(function(response) {
                $scope.likeData = response.RESPONSE_INFO;
            });
    }

    // 收藏商品
    $scope.focus = function (item) {
        // 已收藏
        if (item.is_fans == '1') {
            Utils.cancel(4,item.id,function (ret) {
                item.collection --;
                item.is_fans = '0';
            })
        }else {
            Utils.focus(4,item.id,function (ret) {
                item.collection ++;
                item.is_fans = '1';
            })
        }
    }

    // 景点收藏
    $scope.focusScenic = function () {
        // 已收藏
        if ($scope.is_fans == '1') {
            Utils.cancel(2,$scope.id,function (ret) {
                $scope.is_fans = '0';
            })
        }else {
            Utils.focus(2,$scope.id,function (ret) {
                $scope.is_fans = '1';
            })
        }
    }

    // 跳评论
    $scope.gotocmt = function() {
        if (!$rootScope.isLoged) {
            $scope.showTips("您还未登录，请先登录");
        }else {
            $state.go("index.map-scenic-comment", {
                id: $scope.id
            });
        };
    }


   Utils.init();

})


// 景点评论
ctrlApp.controller("ctrlMapScenicComment", function($scope, $ionicLoading, $state, $rootScope, $ionicGesture, $http, $ionicPopup) {
    $scope.$on('$ionicView.beforeEnter', function() {
        $rootScope.hideTabs = true;
    });

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.disableScroll(true);
    }

    $scope.id = $state.params.id;
    $scope.name = $state.params.name;
    $scope.content = '';
    var Jcontent =  document.getElementById('Jcontent');
    Jcontent.value = $scope.name ? ('回复 ' + $scope.name + ': ') : '';

    var Utils = {}

    Utils.post = function(url, params, callback) {
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
            } else {
                $scope.showTips(response.Tips);
            }
        })
    }

    $scope.send = function () {
        $ionicLoading.show({
            template: "发送中..."
        });
        var content = Jcontent.value;
        Utils.post(API.scenic_comment_create,{scenic_id:$scope.id,content:content},function (ret) {
            $ionicLoading.show({
                template: "发表评论成功提交。"
            });
            setTimeout(function () {
                $ionicLoading.hide();
                history.back();
            },2000);
        })
    }
})