#!/usr/bin/env node

// 添加平台相应远程URL链接
// 默认URL，可通过环境变量设定
var iosUrl = 'http://buygifts.3ncto.cn/www_ios/index.html';
var androidUrl = 'http://buygifts.3ncto.cn/www_android/index.html';
var browserUrl = 'http://buygifts.3ncto.cn/www/index.html';
var projectName = 'tuliyou';

var fs = require('fs');
var path = require('path');

var rootdir = process.argv[2];

// 注入url到config.xml
function injectUrl(path, url) {
  process.stdout.write('Will inject url : ' + url + '\n');
  process.stdout.write('Process with file : ' + path + '\n');

  var content = fs.readFileSync(path, 'utf8');
  content = content.replace(/<content src=\".*\" \/>/, '<content src="' + url + '" />');
  fs.writeFileSync(path, content, 'utf8');
}

if (rootdir) {
  // go through each of the platform directories that have been prepared
  var platforms = (process.env.CORDOVA_PLATFORMS ? process.env.CORDOVA_PLATFORMS.split(',') : []);

  for(var x=0; x<platforms.length; x++) {
    try {
      var platform = platforms[x].trim().toLowerCase();

      if (platform == 'ios') {
        var url = (process.env.IOS_URL ? process.env.IOS_URL : iosUrl);
        var filePath = path.join('platforms', 'ios', projectName, 'config.xml');
        injectUrl(filePath, url);
      } else if (platform = 'android') {
        var url = (process.env.ANDROID_URL ? process.env.ANDROID_URL : androidUrl);
        var filePath = path.join('platforms', 'android', 'res', 'xml', 'config.xml');
        injectUrl(filePath, url);
      }

    } catch(e) {
      process.stdout.write(e);
    }
  }
}
