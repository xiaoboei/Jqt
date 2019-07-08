package com.juyou.jqt.decode;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.v4.content.LocalBroadcastManager;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;

import com.juyou.jqt.CaptureActivity;
import com.juyou.jqt.JqtJSinterface;
import com.juyou.jqt.MainActivity;
import com.juyou.jqt.R;
import com.juyou.jqt.camera.CameraManager;


/**
 * 作者: 陈涛(1076559197@qq.com)
 * 
 * 时间: 2014年5月9日 下午12:23:32
 *
 * 版本: V_1.0.0
 *
 * 描述: 扫描消息转发
 */
public final class CaptureActivityHandler extends Handler {

	DecodeThread decodeThread = null;
	CaptureActivity activity = null;
	private State state;

	private enum State {
		PREVIEW, SUCCESS, DONE
	}

	public CaptureActivityHandler(CaptureActivity activity) {
		this.activity = activity;
		decodeThread = new DecodeThread(activity);
		decodeThread.start();
		state = State.SUCCESS;
		CameraManager.get().startPreview();
		restartPreviewAndDecode();
	}

	@Override
	public void handleMessage(Message message) {

		switch (message.what) {
		case R.id.auto_focus:
			if (state == State.PREVIEW) {
				CameraManager.get().requestAutoFocus(this, R.id.auto_focus);
			}
			break;
		case R.id.restart_preview: // 连续扫描处理
			restartPreviewAndDecode();
			break;
		case R.id.decode_succeeded: // 解析成功
			state = State.SUCCESS;
			String result=(String) message.obj;
			activity.handleDecode(result);// 解析成功，回调
			if(TextUtils.isEmpty(result)){
				activity.setScanState(View.VISIBLE);
				this.sendEmptyMessageDelayed(R.id.scan_failed, 2000);
				return;
			}
			if(activity != null && message != null){
				String orCodeResult = (String)message.obj;
				String scanResult = activity.getScanResult();
				Log.e("my","解析成功  scanResult:" + scanResult + "  orCodeResult:" + orCodeResult);
				Intent scanIntent = new Intent();
				scanIntent.setAction(JqtJSinterface.SCAN_ORCODE_BROADCAST);
				scanIntent.putExtra(JqtJSinterface.TAG_SCANRESULT,orCodeResult);
				LocalBroadcastManager.getInstance(activity).sendBroadcast(scanIntent);
			}
			activity.finish();
			break;
		case R.id.decode_failed:
			state = State.PREVIEW;
			CameraManager.get().requestPreviewFrame(decodeThread.getHandler(),
					R.id.decode);
			break;
		case R.id.scan_failed:
			activity.setScanState(View.INVISIBLE);
			this.sendEmptyMessage(R.id.restart_preview); // 连续扫描，不发送此消息扫描一次结束后就不能再次扫描
		}

	}

	public void quitSynchronously() {
		state = State.DONE;
		CameraManager.get().stopPreview();
		removeMessages(R.id.decode_succeeded);
		removeMessages(R.id.decode_failed);
		removeMessages(R.id.decode);
		removeMessages(R.id.auto_focus);
	}

	private void restartPreviewAndDecode() {
		if (state == State.SUCCESS) {
			state = State.PREVIEW;
			CameraManager.get().requestPreviewFrame(decodeThread.getHandler(),
					R.id.decode);
			CameraManager.get().requestAutoFocus(this, R.id.auto_focus);
		}
	}

}
