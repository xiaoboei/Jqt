package com.juyou.jqt.util;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

/**
 * Created by xilinch on 2017/5/4.
 */

public class UtilIntent {

    /**
     *
     * @param context
     * @param tel
     */
    public static void startIntentDial(Context context, String tel){
        if(context == null){
            return;
        }
        Intent phoneIntent = new Intent( Intent.ACTION_DIAL,Uri.parse("tel:" + tel));
        phoneIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        // 启动
        context.startActivity(phoneIntent);
    }

    /**
     * 直接拨出电话   需要申请权限
     * @param context
     * @param tel
     */
    public static void startIntentCall(Activity context, String tel){
        if(context == null){
            return;
        }
        Intent phoneIntent = new Intent(Intent.ACTION_CALL, Uri.parse("tel:" + tel));
        // 启动

        boolean callPhone = true;
        if(Build.VERSION.SDK_INT >= 23){
            callPhone = UtilRequestPermissions.checkSelfPermission(context,Manifest.permission.CALL_PHONE);
        }
        if(callPhone ){
            context.startActivity(phoneIntent);
        } else {
            UtilRequestPermissions.requestPermissionPhone(context, 0);
        }
    }

    /**
     * 启动设置页面
     * @param context
     */
    public static void startSettings(Context context){
        if(context == null){
            return;
        }
        Intent intent = new Intent();
        intent.setAction(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        Uri uri = Uri.fromParts("package", context.getPackageName(), null);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.setData(uri);
        context.startActivity(intent);
    }
}
