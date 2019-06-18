package com.juyou.jqt;

import android.app.Application;

import com.umeng.commonsdk.UMConfigure;

public class JQTApplication extends Application {

    private String um_key = "5d083dd1570df389400008ce";

    @Override
    public void onCreate() {
        super.onCreate();
        UMConfigure.init(this, um_key, "um", UMConfigure.DEVICE_TYPE_PHONE,null);
    }


}
