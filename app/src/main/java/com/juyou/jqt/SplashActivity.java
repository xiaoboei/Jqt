package com.juyou.jqt;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.support.annotation.Nullable;

public class SplashActivity extends BaseActivity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Intent intent;
//                SharedPreferences sharedPreferences = getSharedPreferences("jqt", Context.MODE_PRIVATE);
//                String result = sharedPreferences.getString("help","");
//                if("1".equals(result)){
//                    intent = new Intent(SplashActivity.this, MainActivity.class);
//                } else {
//                    intent = new Intent(SplashActivity.this, HelpActivity.class);
//                }
                intent = new Intent(SplashActivity.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
                finish();
            }
        },500);

    }

    @Override
    protected void onResume() {
        super.onResume();


    }
}
