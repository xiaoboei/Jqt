package com.juyou.jqt;

import android.app.Application;

import com.umeng.commonsdk.UMConfigure;

public class JQTApplication extends Application {

    private String um_key = "5d231efe4ca3570639001002";

    @Override
    public void onCreate() {
        super.onCreate();
        UMConfigure.init(this, um_key, "um", UMConfigure.DEVICE_TYPE_PHONE,null);
    }


}
