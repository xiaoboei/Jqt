package com.juyou.jqt;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.view.View;
import android.view.ViewParent;
import android.widget.ImageView;

import java.util.ArrayList;

public class HelpActivity extends BaseActivity {
    //滑动的
    private ViewPager pager;

    // 引导图片资源
    private ArrayList<View> pageview;
    //点击进入应用的
    private View click;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_help);

        click = findViewById(R.id.click);
        pager = findViewById(R.id.pager);
        pageview = new ArrayList<>();
        ImageView imageView1  = new ImageView(this);
        imageView1.setImageResource(R.mipmap.help1);
        imageView1.setScaleType(ImageView.ScaleType.CENTER_CROP);
        pageview.add(imageView1);

        ImageView imageView2  = new ImageView(this);
        imageView2.setImageResource(R.mipmap.help2);
        imageView2.setScaleType(ImageView.ScaleType.CENTER_CROP);
        pageview.add(imageView2);

        ImageView imageView3  = new ImageView(this);
        imageView3.setImageResource(R.mipmap.help3);
        imageView3.setScaleType(ImageView.ScaleType.CENTER_CROP);
        pageview.add(imageView3);

        pager.setAdapter(new SlideImageAdapter());
        click.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                Intent intent = new Intent(HelpActivity.this, MainActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
                finish();
            }
        });
        SharedPreferences sharedPreferences = getSharedPreferences("jqt", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putString("help","1");
        editor.commit();
    }

    @Override
    protected void onResume() {
        super.onResume();


    }


    private class SlideImageAdapter extends PagerAdapter {
        @Override
        //获取当前窗体界面数
        public int getCount() {
            // TODO Auto-generated method stub
            return pageview.size();
        }

        @Override
        //断是否由对象生成界面
        public boolean isViewFromObject(View arg0, Object arg1) {
            // TODO Auto-generated method stub
            return arg0 == arg1;
        }

        //是从ViewGroup中移出当前View
        public void destroyItem(View arg0, int arg1, Object arg2) {
            ((ViewPager) arg0).removeView(pageview.get(arg1));
        }

        //返回一个对象，这个对象表明了PagerAdapter适配器选择哪个对象放在当前的ViewPager中
        public Object instantiateItem(View arg0, int arg1) {
            ((ViewPager) arg0).addView(pageview.get(arg1));
            return pageview.get(arg1);
        }
    }

}
