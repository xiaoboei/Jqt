package com.juyou.jqt;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;
import android.webkit.JavascriptInterface;

import com.juyou.jqt.util.UtilRequestPermissions;

public class JqtJSinterface {

    /**
     * 字符串
     */
    public static final String TAG_SCANRESULT = "scanResult";

    public static final String SCAN_ORCODE_BROADCAST = "SCAN_ORCODE_BROADCAST";

    public Activity context;

    public JqtJSinterface(Activity context){
        this.context = context;
    }

    @JavascriptInterface
    public void scanQRCodeForResult(){
        //扫描二维码
        if (context != null && !context.isFinishing() && !context.isDestroyed()) {
            Log.e("my", "scanQRCodeForResult");
            //判断是否具备了相机权限，只支持在外链使用，在新闻详情页不支持回调
            boolean isPermissed = UtilRequestPermissions.checkSelfPermission(context, android.Manifest.permission.CAMERA);
            if (isPermissed) {
                Intent captureIntent = new Intent();
                captureIntent.setClass(context, CaptureActivity.class);
                captureIntent.putExtra(TAG_SCANRESULT, "1");
                captureIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(captureIntent);
            } else {
                //未授权的扫描二维码
                context.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        UtilRequestPermissions.requestPermission(context, new String[]{android.Manifest.permission.CAMERA}, UtilRequestPermissions.REQUEST_CODE_ACTIVITY_CAMERA);
                    }
                });
            }

        }

    }
}
