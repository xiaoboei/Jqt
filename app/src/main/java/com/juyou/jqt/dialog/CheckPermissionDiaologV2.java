package com.juyou.jqt.dialog;

import android.app.Dialog;
import android.content.Context;
import android.support.annotation.NonNull;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.juyou.jqt.R;
import com.juyou.jqt.util.DensityUtils;
import com.juyou.jqt.util.UtilIntent;


/**
 * Created by xilinch on 2017/8/7.
 * 检测权限V2
 */

public class CheckPermissionDiaologV2 extends Dialog implements View.OnClickListener{

    /**
     * 视图
     */
    private View view;

    /**
     * 标题
     */
    private TextView tv_title;
    /**
     * 取消
     */
    private TextView tv_cancel;

    /**
     * 确定
     */
    private TextView tv_confirm;

    /**
     * 确认点击
     */
    private View.OnClickListener confirmClickListener;

    /**
     * 取消按钮
     */
    private View.OnClickListener cancelClickListener;

    public CheckPermissionDiaologV2(@NonNull Context context) {
        super(context, R.style.dialog_backgroundDimAmout_5);
        init();
    }

    private void init(){
        this.view = LayoutInflater.from(getContext()).inflate(R.layout.view_dialog_check_permission_v2,null);
        tv_title = (TextView) view.findViewById(R.id.tv_title);
        tv_cancel = (TextView) view.findViewById(R.id.tv_cancel);
        tv_confirm = (TextView) view.findViewById(R.id.tv_confirm);
        int widthPx = DensityUtils.dipTopx(getContext(), 270);
        ViewGroup.LayoutParams layoutParams = new ViewGroup.LayoutParams(widthPx, ViewGroup.LayoutParams.WRAP_CONTENT);
        setContentView(view,layoutParams);
        setListener();
    }

    public void setTitleText(String title){
        if(tv_title != null){
            tv_title.setText(title);
        }
    }

    /**
     * 设置确认按钮文字
     * @param title
     */
    public void setConfirmText(String title){
        if(tv_confirm != null){
            tv_confirm.setText(title);
        }
    }

    /**
     * 设置取消按钮文字
     * @param title
     */
    public void setCancelText(String title){
        if(tv_cancel != null){
            tv_cancel.setText(title);
        }
    }


    /**
     * 监听器
     */
    private void setListener(){
        tv_cancel.setOnClickListener(this);
        tv_confirm.setOnClickListener(this);
    }

    public View.OnClickListener getConfirmClickListener() {
        return confirmClickListener;
    }

    public void setConfirmClickListener(View.OnClickListener confirmClickListener) {
        this.confirmClickListener = confirmClickListener;
    }

    public View.OnClickListener getCancelClickListener() {
        return cancelClickListener;
    }

    public void setCancelClickListener(View.OnClickListener cancelClickListener) {
        this.cancelClickListener = cancelClickListener;
    }

    @Override
    public void onClick(View v) {

        switch (v.getId()){
//            case R.id.iv_close:
//                break;
            case R.id.tv_cancel:
                dismiss();
                if(cancelClickListener != null){
                    cancelClickListener.onClick(tv_cancel);
                }
                break;
            case R.id.tv_confirm:
                if(confirmClickListener != null){
                    confirmClickListener.onClick(tv_confirm);
                    break;
                }
                UtilIntent.startSettings(getContext());
                break;
        }
    }
}
