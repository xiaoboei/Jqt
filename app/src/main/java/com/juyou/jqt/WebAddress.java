package com.juyou.jqt;

import android.text.TextUtils;

/**
 * Created by zhangzkai on 2017/7/24.
 */

public class WebAddress {
    private static final String acceptableSchemes[] = {
            "http:",
            "https:"
    };

    public static boolean urlHasAcceptableScheme(String url) {
        if (TextUtils.isEmpty(url)) {
            return false;
        }

        for (int i = 0; i < acceptableSchemes.length; i++) {
            if (url.startsWith(acceptableSchemes[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * 增加自定的scheme
     * @param url
     * @return
     */
    public static boolean nfAcceptableScheme(String url) {
        if (TextUtils.isEmpty(url)) {
            return false;
        }

        for (int i = 0; i < acceptableSchemes.length; i++) {
            if (url.startsWith(acceptableSchemes[i])) {
                return true;
            }

            if(url.startsWith("nfapp")){
                return true;
            }
        }
        return false;
    }

}
