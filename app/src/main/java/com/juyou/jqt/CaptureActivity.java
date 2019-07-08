package com.juyou.jqt;

import android.Manifest;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Point;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnCompletionListener;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.os.Vibrator;
import android.provider.MediaStore;
import android.support.v4.content.LocalBroadcastManager;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceHolder.Callback;
import android.view.SurfaceView;
import android.view.View;
import android.view.Window;
import android.view.animation.Animation;
import android.view.animation.LinearInterpolator;
import android.view.animation.TranslateAnimation;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.BinaryBitmap;
import com.google.zxing.DecodeHintType;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.RGBLuminanceSource;
import com.google.zxing.Result;
import com.google.zxing.common.GlobalHistogramBinarizer;
import com.google.zxing.common.HybridBinarizer;
import com.juyou.jqt.bitmap.Utils;
import com.juyou.jqt.camera.CameraManager;
import com.juyou.jqt.decode.CaptureActivityHandler;
import com.juyou.jqt.decode.InactivityTimer;
import com.juyou.jqt.util.UtilRequestPermissions;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.charset.Charset;
import java.util.EnumMap;
import java.util.Map;

/**
 *
 *
 * 描述: 扫描界面
 */
public class CaptureActivity extends BaseActivity implements Callback {

    private static final int REQUEST_CODE = 1;
    private CaptureActivityHandler handler;
    private boolean hasSurface;
    private InactivityTimer inactivityTimer;
    private MediaPlayer mediaPlayer;
    private boolean playBeep;
    private static final float BEEP_VOLUME = 0.50f;
    private boolean vibrate;
    private int x = 0;
    private int y = 0;
    private int cropWidth = 0;
    private int cropHeight = 0;
    private RelativeLayout mContainer = null;
    private RelativeLayout mCropLayout = null;
    private ImageButton back;
    private Button btnPhoto;
    private String photo_path;
    private Bitmap scanBitmap;
    private TextView mScanFail;
    private String scanResult;

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public int getCropWidth() {
        return cropWidth;
    }

    public void setCropWidth(int cropWidth) {
        this.cropWidth = cropWidth;
    }

    public int getCropHeight() {
        return cropHeight;
    }

    public void setCropHeight(int cropHeight) {
        this.cropHeight = cropHeight;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.activity_qr_scan);
        if(getIntent() != null){
            Bundle bundle = getIntent().getExtras();
            if(bundle != null){
                scanResult = bundle.getString(JqtJSinterface.TAG_SCANRESULT);
            }
        }

        // 初始化 CameraManager
        CameraManager.init(getApplication());
        hasSurface = false;
        // 摄像头的活动监控器
        inactivityTimer = new InactivityTimer(this);

        mContainer = (RelativeLayout) findViewById(R.id.capture_containter);
        mCropLayout = (RelativeLayout) findViewById(R.id.capture_crop_layout);

        final ImageView mQrLineView = (ImageView) findViewById(R.id.capture_scan_line);
        // 扫描动画
        final TranslateAnimation mAnimation = new TranslateAnimation(TranslateAnimation.ABSOLUTE, 0f, TranslateAnimation.ABSOLUTE, 0f,
                TranslateAnimation.RELATIVE_TO_PARENT, 0f, TranslateAnimation.RELATIVE_TO_PARENT, 0.9f);
        mAnimation.setDuration(1500);
        mAnimation.setRepeatCount(-1);
        mAnimation.setRepeatMode(Animation.REVERSE);
        mAnimation.setInterpolator(new LinearInterpolator());
        mQrLineView.setAnimation(mAnimation);

        back = (ImageButton) findViewById(R.id.view_btn_left);
        btnPhoto = (Button) findViewById(R.id.qr_photo);
        mScanFail = (TextView) findViewById(R.id.scan_fail);
        back.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //返回键
                String orCodeResult = "";
                Intent scanIntent = new Intent();
                scanIntent.setAction(JqtJSinterface.SCAN_ORCODE_BROADCAST);
                scanIntent.putExtra(JqtJSinterface.TAG_SCANRESULT,orCodeResult);
                LocalBroadcastManager.getInstance(CaptureActivity.this).sendBroadcast(scanIntent);
                finish();

            }
        });

        btnPhoto.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                boolean storage_isGranted = true;
                if (Build.VERSION.SDK_INT >= 23) {
                    storage_isGranted = UtilRequestPermissions.checkSelfPermission(CaptureActivity.this, Manifest.permission.READ_EXTERNAL_STORAGE);
                }
                if (storage_isGranted){
                    photo();
                } else {
                    UtilRequestPermissions.requestPermission(CaptureActivity.this, new String[]{ Manifest.permission.READ_EXTERNAL_STORAGE}, UtilRequestPermissions.REQUEST_CODE_ACTIVITY_READ_EXTERNAL_STORAGE);
                }

            }
        });
        mScanFail.setVisibility(View.GONE);


    }


    /**
     * 扫描失败提示的显示与隐藏
     * @param visibility
     */
    public void setScanState(int visibility){
        mScanFail.setVisibility(visibility);
    }

    public void photo() {
        Intent innerIntent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
        Intent wrapperIntent = Intent.createChooser(innerIntent, "选择二维码图片");
        CaptureActivity.this.startActivityForResult(wrapperIntent, REQUEST_CODE);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK) {
            switch (requestCode) {
                case REQUEST_CODE:
                    String[] proj = { MediaStore.Images.Media.DATA };
                    // 获取选中图片的路径
                    Cursor cursor = getContentResolver().query(data.getData(),
                            proj, null, null, null);
                    if(cursor==null){
                        handlerDelay();
                        break;
                    }
                    if (cursor.moveToFirst()) {

                        int column_index = cursor
                                .getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
                        photo_path = cursor.getString(column_index);
                        if (photo_path == null) {
                            photo_path = Utils.getPath(getApplicationContext(),
                                    data.getData());
                        }
                    }
                    cursor.close();
                    Result result = scanningImage(photo_path);
                    if (result != null) {
                        String orcodeResult = recode(result.toString());
                        if(!TextUtils.isEmpty(scanResult) && "1".equals(scanResult)){
                            // 数据返回
                            Intent scanIntent = new Intent();
                            scanIntent.setAction(JqtJSinterface.SCAN_ORCODE_BROADCAST);
                            scanIntent.putExtra(JqtJSinterface.TAG_SCANRESULT,orcodeResult);
                            LocalBroadcastManager.getInstance(this).sendBroadcast(scanIntent);
                        } else {
                            //todo 跳转打开
//                            Intent help = new Intent();
//                            help.setClass(CaptureActivity.this, DisplayActivity.class);
//                            Bundle bundle = new Bundle();
//                            bundle.putString("result", orcodeResult);
//                            help.putExtras(bundle);
//                            CaptureActivity.this.startActivity(help);
                        }

                        finish();
                    }else {
                        handlerDelay();
                    }
                    break;

            }

        }

    }

    public String getScanResult() {
        return scanResult;
    }

    public void setScanResult(String scanResult) {
        this.scanResult = scanResult;
    }


    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if(keyCode == KeyEvent.KEYCODE_BACK){
            //返回键
            String orCodeResult = "";
            Intent scanIntent = new Intent();
            scanIntent.setAction(JqtJSinterface.SCAN_ORCODE_BROADCAST);
            scanIntent.putExtra(JqtJSinterface.TAG_SCANRESULT,orCodeResult);
            LocalBroadcastManager.getInstance(CaptureActivity.this).sendBroadcast(scanIntent);
        }
        return super.onKeyDown(keyCode, event);
    }

    /**
     * 获取二维码图片失败或解析失败的处理
     */
    protected void handlerDelay(){
        mScanFail.setVisibility(View.VISIBLE);
        new Thread(new Runnable() {
            @Override
            public void run() {
//								Looper.prepare();
                try {
                    Thread.sleep(2000);
                    Message message=new Message();
                    message.what= R.id.scan_failed;
                    if(handler!=null){
                        handler.sendMessage(message);
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
//								Looper.loop();
            }
        }).start();
    }

    /**
     * 获取本地图片的bitmap，解析获取相关信息
     * @param path 本地图片路径
     * @return
     */
    protected Result scanningImage(String path) {
        Result result = null;
        try {
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            BitmapFactory.decodeFile(path, options);
            int sampleSize = options.outHeight / 400;
            if (sampleSize <= 0) {
                sampleSize = 1;
            }
            options.inSampleSize = sampleSize;
            options.inJustDecodeBounds = false;

            scanBitmap =  BitmapFactory.decodeFile(path, options);
            if (scanBitmap != null) {
                result = decodeQRCode(scanBitmap);
            }
        } catch (Exception e) {
            return null;
        }
        return result;
    }

    /**
     * 同步解析bitmap二维码
     *
     * @param bitmap 要解析的二维码图片
     * @return 返回二维码图片里的内容 或 null
     */
    public static Result decodeQRCode(Bitmap bitmap) {
        Result result = null;
        RGBLuminanceSource source = null;
        Map<DecodeHintType, Object> hints = new EnumMap<>(DecodeHintType.class);
        hints.put(DecodeHintType.TRY_HARDER, BarcodeFormat.QR_CODE); // 配置解析格式
        hints.put(DecodeHintType.CHARACTER_SET, "utf-8"); // 设置二维码内容的编码
        try {
            int width = bitmap.getWidth();
            int height = bitmap.getHeight();
            int[] pixels = new int[width * height];
            bitmap.getPixels(pixels, 0, width, 0, 0, width, height);
            // bitmap对象转换成二进制图片
            source = new RGBLuminanceSource(width, height, pixels);
            // HybridBinarizer二值化算法将二进制图片转化成bitmap
            result = new MultiFormatReader().decode(new BinaryBitmap(new HybridBinarizer(source)), hints);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            if (source != null) {
                try {
                    result = new MultiFormatReader().decode(new BinaryBitmap(new GlobalHistogramBinarizer(source)), hints);
                    return result;
                } catch (Throwable e2) {
                    e2.printStackTrace();
                }
            }
            return null;
        }
    }

    private String recode(String str) {
        String formart = "";

        try {
            boolean ISO = Charset.forName("ISO-8859-1").newEncoder()
                    .canEncode(str);
            if (ISO) {
                formart = new String(str.getBytes("ISO-8859-1"), "GB2312");
            } else {
                formart = str;
            }
        } catch (UnsupportedEncodingException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return formart;
    }

    boolean flag = true;

    protected void light() {
        if (flag == true) {
            flag = false;
            // 开闪光灯
            CameraManager.get().openLight();
        } else {
            flag = true;
            // 关闪光灯
            CameraManager.get().offLight();
        }

    }

    @SuppressWarnings("deprecation")
    @Override
    protected void onResume() {
        super.onResume();
        SurfaceView surfaceView = (SurfaceView) findViewById(R.id.capture_preview);
        SurfaceHolder surfaceHolder = surfaceView.getHolder();
        if (hasSurface) {
            initCamera(surfaceHolder);
        } else {
            surfaceHolder.addCallback(this);
            surfaceHolder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
        }
        // 声音相关
        playBeep = true;
        AudioManager audioService = (AudioManager) getSystemService(AUDIO_SERVICE);
        if (audioService.getRingerMode() != AudioManager.RINGER_MODE_NORMAL) {
            playBeep = false;
        }
        initBeepSound();
        vibrate = true;
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (handler != null) {
            handler.quitSynchronously();
            handler = null;
        }
        CameraManager.get().closeDriver();
    }

    @Override
    protected void onDestroy() {
        inactivityTimer.shutdown();
        super.onDestroy();
    }

    public void handleDecode(String result) {
        inactivityTimer.onActivity();
        playBeepSoundAndVibrate();

        // 连续扫描，不发送此消息扫描一次结束后就不能再次扫描
        // handler.sendEmptyMessage(R.id.restart_preview);
    }

    /**
     * 初始化摄像头
     * @param surfaceHolder
     */
    private void initCamera(SurfaceHolder surfaceHolder) {
        try {
            CameraManager.get().openDriver(surfaceHolder);

            Point point = CameraManager.get().getCameraResolution();
            int width = point.y;
            int height = point.x;

            int x = mCropLayout.getLeft() * width / mContainer.getWidth();
            int y = mCropLayout.getTop() * height / mContainer.getHeight();

            int cropWidth = mCropLayout.getWidth() * width / mContainer.getWidth();
            int cropHeight = mCropLayout.getHeight() * height / mContainer.getHeight();

            setX(x);
            setY(y);
            setCropWidth(cropWidth);
            setCropHeight(cropHeight);


        } catch (IOException ioe) {
            return;
        } catch (RuntimeException e) {
            return;
        }
        if (handler == null) {
            // 扫描结果处理
            handler = new CaptureActivityHandler(CaptureActivity.this);
        }
    }

    @Override
    public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {

    }

    @Override
    public void surfaceCreated(SurfaceHolder holder) {
        if (!hasSurface) {
            hasSurface = true;
            initCamera(holder);
        }
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {
        hasSurface = false;

    }

    public Handler getHandler() {
        return handler;
    }

    private void initBeepSound() {
        if (playBeep && mediaPlayer == null) {
            setVolumeControlStream(AudioManager.STREAM_MUSIC);
            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
            mediaPlayer.setOnCompletionListener(beepListener);

            AssetFileDescriptor file = getResources().openRawResourceFd(R.raw.beep);
            try {
                mediaPlayer.setDataSource(file.getFileDescriptor(), file.getStartOffset(), file.getLength());
                file.close();
                mediaPlayer.setVolume(BEEP_VOLUME, BEEP_VOLUME);
                mediaPlayer.prepare();
            } catch (IOException e) {
                mediaPlayer = null;
            }
        }
    }

    private static final long VIBRATE_DURATION = 200L;

    private void playBeepSoundAndVibrate() {
        if (playBeep && mediaPlayer != null) {
            mediaPlayer.start();
        }
        if (vibrate) {
            Vibrator vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
            vibrator.vibrate(VIBRATE_DURATION);
        }
    }

    private final OnCompletionListener beepListener = new OnCompletionListener() {
        public void onCompletion(MediaPlayer mediaPlayer) {
            mediaPlayer.seekTo(0);
        }
    };
}