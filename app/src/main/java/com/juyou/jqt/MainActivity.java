package com.juyou.jqt;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.SslErrorHandler;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.juyou.jqt.dialog.CheckPermissionDiaologV2;
import com.juyou.jqt.util.UtilRequestPermissions;

public class MainActivity extends BaseActivity {


    //1 存储、 2相机 0 默认
    private int requestPermissionType = 0;
    /**
     * 要求权限
     */
    private CheckPermissionDiaologV2 checkPermissionDiaolog;


    private WebView webView;
    String url = "http://scenic.test.tuliyou.com/webadmin/";
//    String url = "http://m.tuliyou.com/h5/app";

    private JqtJSinterface jqtJSinterface;


    /**
     * 登录成功广播
     */
    private BroadcastReceiver scanOrcodeResultReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent != null && JqtJSinterface.SCAN_ORCODE_BROADCAST.equals(intent.getAction())) {
                Bundle bundle = intent.getExtras();
                Log.e("my", "scanOrcodeResultReceiver:" + bundle);
                if (bundle != null) {
                    String orcodeResult = bundle.getString(JqtJSinterface.TAG_SCANRESULT);
                    if (webView != null) {
                        String fun = "javascript:get_extract_code('" + orcodeResult + "')";
                        Log.e("my","fun:" + fun);
                        webView.loadUrl(fun);
                    }
                }
            }
        }
    };


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        webView = findViewById(R.id.webView);

        IntentFilter filter = new IntentFilter(JqtJSinterface.SCAN_ORCODE_BROADCAST);
        LocalBroadcastManager.getInstance(this).registerReceiver(scanOrcodeResultReceiver, filter);

        jqtJSinterface = new JqtJSinterface(this);
        webView.addJavascriptInterface(jqtJSinterface, "activity");


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
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                super.onReceivedSslError(view, handler, error);
                handler.proceed();
            }

            @Override
            public void onLoadResource(WebView view, String url) {
                super.onLoadResource(view, url);
//                Log.e("my", "onLoadResource: " + url);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                Log.e("my", "shouldOverrideUrlLoading: " + url);
                if (url != null && url.startsWith("tel:")) {
                    Intent phoneIntent = new Intent(Intent.ACTION_DIAL, Uri.parse(url));
                    phoneIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    // 启动
                    startActivity(phoneIntent);
                    return true;
                }
                return super.shouldOverrideUrlLoading(view, url);
            }
        });

        webView.loadUrl(url);
    }

    @Override
    public boolean onKeyUp(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            //返回
            if (webView != null && webView.canGoBack()) {
                webView.goBack();
                return true;
            } else if (webView != null && !webView.canGoBack()) {
                //系统处理
            }
        }
        return super.onKeyUp(keyCode, event);
    }

    /**
     * 显示对话框
     */
    public void showPermissionDialog() {
        if (checkPermissionDiaolog == null) {
            checkPermissionDiaolog = new CheckPermissionDiaologV2(this);
            checkPermissionDiaolog.setTitleText(getString(R.string.permission_tips));
        }
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (isActivityAlive()) {
                    checkPermissionDiaolog.show();
                }
            }
        });
    }

    public void dismissPermissionDialog() {
        if (checkPermissionDiaolog != null && checkPermissionDiaolog.isShowing() && isActivityAlive()) {
            checkPermissionDiaolog.dismiss();
        }
    }


    public void setRequestPermissionType(int requestPermissionType) {
        this.requestPermissionType = requestPermissionType;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        switch (requestCode) {
            case UtilRequestPermissions.REQUEST_CODE_ACTIVITY_CAMERA:
                boolean camer_permission = UtilRequestPermissions.checkSelfPermission(this, Manifest.permission.CAMERA);
                if (camer_permission) {
                    Intent help = new Intent();
                    help.setClass(this, CaptureActivity.class);
                    this.startActivity(help);
                } else {
                    //如果应用之前请求过此权限但用户拒绝了请求，此方法将返回 true。
                    Log.e("my", "onRequestPermissionsResult shouldShowRequestPermissionRationale camer_permission :" + ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.CAMERA));
                    if (ActivityCompat.shouldShowRequestPermissionRationale(this, Manifest.permission.CAMERA)) {
                        break;
                    } else {
                        // 如果用户在过去拒绝了权限请求，并在权限请求系统对话框中选择了 Don’t ask again 选项，此方法将返回 false。如果设备规范禁止应用具有该权限，此方法也会返回 false。
                        showPermissionDialog();
                    }
                }
                break;

        }

    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(scanOrcodeResultReceiver);
        dismissPermissionDialog();
    }
}
