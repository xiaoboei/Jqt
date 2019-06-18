         package com.juyou.jqt;

import android.net.http.SslError;
import android.os.Build;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.CookieSyncManager;
import android.webkit.SslErrorHandler;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

         public class MainActivity extends BaseActivity {

    private WebView webView;
    String url = "https://m.tuliyou.com/h5/app";
//    String url = "http://m.tuliyou.com/h5/app";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        webView = findViewById(R.id.webView);

        WebSettings webSetting = webView.getSettings();
        webSetting.setJavaScriptEnabled(true);
        webSetting.setBlockNetworkImage(false);//解决图片不显示
		webSetting.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NARROW_COLUMNS);
		webSetting.setSupportZoom(true);
        webSetting.setBuiltInZoomControls(true);
        if (Build.VERSION.SDK_INT >= 19) {
            webSetting.setLoadsImagesAutomatically(true);
        } else {
            webSetting.setLoadsImagesAutomatically(false);
        }
        webSetting.setUseWideViewPort(true);
        webSetting.setLoadWithOverviewMode(true);
		webSetting.setAppCacheEnabled(true);
		webSetting.setDatabaseEnabled(true);
        webSetting.setDomStorageEnabled(true);
        webSetting.setGeolocationEnabled(true);
        webSetting.setPluginState(WebSettings.PluginState.ON);
        webSetting.setRenderPriority(WebSettings.RenderPriority.HIGH);
//        webSetting.setCacheMode(WebSettings.LOAD_NO_CACHE);

        webSetting.setSupportMultipleWindows(false);
        webSetting.setAppCacheMaxSize(Long.MAX_VALUE);
        webSetting.setJavaScriptCanOpenWindowsAutomatically(true);
        webSetting.setAllowFileAccess(true);
        //自动播放
        webSetting.setMediaPlaybackRequiresUserGesture(false);
        webSetting.setGeolocationDatabasePath(getFilesDir().getPath());
        // 设置可以支持缩放
        webSetting.setSupportZoom(true);
        //支持混合模式
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSetting.setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
        //接口禁止(直接或反射)调用，避免视频画面无法显示：
//		setLayerType(View.LAYER_TYPE_SOFTWARE,null);
        webView.setDrawingCacheEnabled(true);
        // this.getSettingsExtension().setPageCacheCapacity(IX5WebSettings.DEFAULT_CACHE_CAPACITY);//extension
        // settings 的设计
//        CookieSyncManager.createInstance(this);
//        CookieSyncManager.getInstance().sync();
        webView.setWebViewClient(new WebViewClient(){
            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                super.onReceivedSslError(view, handler, error);
                handler.proceed();
            }

            @Override
            public void onLoadResource(WebView view, String url) {
                super.onLoadResource(view, url);
                Log.e("my","onLoadResource: " + url);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Log.e("my","shouldOverrideUrlLoading: " + url);
                return super.shouldOverrideUrlLoading(view, url);
            }
        });
        webView.loadUrl(url);
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        if(keyCode == KeyEvent.KEYCODE_BACK){
            //返回
            if(webView != null && webView.canGoBack()){
                webView.goBack();
                return true;
            } else if(webView != null && !webView.canGoBack()){
                //系统处理
            }
        }
        return super.onKeyUp(keyCode, event);
    }
}
