package com.juyou.jqt.decode;

import android.os.Handler;
import android.os.Looper;
import android.os.Message;

import com.dtr.zbar.build.ZBarDecoder;
import com.juyou.jqt.CaptureActivity;
import com.juyou.jqt.R;

/**
 * 作者: 陈涛(1076559197@qq.com)
 * 
 * 时间: 2014年5月9日 下午12:24:13
 * 
 * 版本: V_1.0.0
 * 
 * 描述: 接受消息后解码
 */
final class DecodeHandler extends Handler {

	CaptureActivity activity = null;

	DecodeHandler(CaptureActivity activity) {
		this.activity = activity;
	}

	@Override
	public void handleMessage(Message message) {
		switch (message.what) {
		case R.id.decode:
			decode((byte[]) message.obj, message.arg1, message.arg2);
			break;
		case R.id.quit:
			Looper.myLooper().quit();
			break;
		}
	}

	private void decode(byte[] data, int width, int height) {
		byte[] rotatedData = new byte[data.length];
		for (int y = 0; y < height; y++) {
			for (int x = 0; x < width; x++)
				rotatedData[x * height + height - y - 1] = data[x + y * width];
		}
		int tmp = width;// Here we are swapping, that's the difference to #11
		width = height;
		height = tmp;

		ZBarDecoder manager = new ZBarDecoder();
		String result = manager.decodeCrop(rotatedData, width, height, activity.getX(), activity.getY(), activity.getCropWidth(),
				activity.getCropHeight());

		if (result != null) {
			//获取扫描结果图片，暂时不考虑
//			if (activity.isNeedCapture()) {
//				// 生成bitmap
//				PlanarYUVLuminanceSource source = new PlanarYUVLuminanceSource(rotatedData, width, height, activity.getX(), activity.getY(),
//						activity.getCropWidth(), activity.getCropHeight(), false);
//				int[] pixels = source.renderThumbnail();
//				int w = source.getThumbnailWidth();
//				int h = source.getThumbnailHeight();
//				Bitmap bitmap = Bitmap.createBitmap(pixels, 0, w, w, h, Bitmap.Config.ARGB_8888);
//				try {
//					String rootPath = Environment.getExternalStorageDirectory().getAbsolutePath() + "/Qrcode/";
//					File root = new File(rootPath);
//					if (!root.exists()) {
//						root.mkdirs();
//					}
//					File f = new File(rootPath + "Qrcode.jpg");
//					if (f.exists()) {
//						f.delete();
//					}
//					f.createNewFile();
//
//					FileOutputStream out = new FileOutputStream(f);
//					bitmap.compress(Bitmap.CompressFormat.JPEG, 100, out);
//					out.flush();
//					out.close();
//				} catch (Exception e) {
//					e.printStackTrace();
//				}
//			}

			if (null != activity.getHandler()) {
				Message msg = new Message();
				msg.obj = result;
				msg.what = R.id.decode_succeeded;
				activity.getHandler().sendMessage(msg);
			}
		} else {
			if (null != activity.getHandler()) {
				activity.getHandler().sendEmptyMessage(R.id.decode_failed);
			}
		}
	}

}
