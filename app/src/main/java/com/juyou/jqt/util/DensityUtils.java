package com.juyou.jqt.util;

import android.content.Context;
import android.graphics.Paint;
import android.graphics.Rect;


/**
 * @author
 * @Title DensityUtils
 * @Package
 * @Description DensityUtils是一个像素与dp转换的工具
 * @date
 */
public class DensityUtils {
    /**
     * 根据手机的分辨率dp 的单位转成px(像素)
     *
     * @param context
     * @param dpValue dp
     * @return 返回像素
     */
    public static int dipTopx(Context context, float dpValue) {
        final float scale = context.getResources().getDisplayMetrics().density;
        return (int) (dpValue * scale + 0.5f * (dpValue >= 0 ? 1 : -1));
    }



    /**
     * 根据手机的分辨率px(像素) 的单位 转成dp
     *
     * @param context
     * @param pxValue 像素
     * @return 返回dp
     */
    public static int pxTodip(Context context, float pxValue) {
        final float scale = context.getResources().getDisplayMetrics().density;
        return (int) (pxValue / scale + 0.5f);
    }

    public static int spTopx(Context context, float spValue) {
        float fontScale = context.getResources().getDisplayMetrics().scaledDensity;
        return (int) (spValue * fontScale + 0.5f);
    }

    /**
     * 获取屏幕宽度
     *
     * @param context
     * @return
     */
    public static int getScreenWidth(Context context) {
        return context.getResources().getDisplayMetrics().widthPixels;
    }

    /**
     * 获取屏幕高度
     *
     * @param context
     * @return
     */
    public static int getScreenHeight(Context context) {
        return context.getResources().getDisplayMetrics().heightPixels;
    }

    /**
     * convert sp to its equivalent px
     * <p>
     * 将sp转换为px
     */
    public static int sp2px(Context context, float spValue) {
        final float fontScale = context.getResources().getDisplayMetrics().scaledDensity;
        return (int) (spValue * fontScale + 0.5f);
    }

    /**
     * 文字宽度
     *
     * @param text
     * @param textSize px
     * @return
     */
    public static float getStringWidth(String text, float textSize) {
        if (null == text || "".equals(text)) {
            return 0;
        }
        Paint paint = new Paint();
        paint.setTextSize(textSize);
        return paint.measureText(text); // 得到总体长度
    }

    /**
     * 文字高度
     *
     * @param text
     * @param textSize px
     * @return
     */
    public static float getStringHeight(String text, float textSize) {
        if (null == text || "".equals(text)) {
            return 0;
        }
        Rect rect = new Rect();
        Paint paint = new Paint();
        paint.setTextSize(textSize);
        paint.getTextBounds(text, 0, text.length(), rect);
        return rect.height();//文字高
    }

}
