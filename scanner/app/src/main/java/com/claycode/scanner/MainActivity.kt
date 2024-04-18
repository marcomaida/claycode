package com.claycode.scanner

import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Matrix
import android.os.Bundle
import android.util.Log
import android.util.Size
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.ImageProxy
import androidx.camera.view.CameraController
import androidx.camera.view.LifecycleCameraController
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.claycode.scanner.ui.theme.ClaycodeScannerTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ensureHasCameraPermissions();

        setContent {
            ClaycodeScannerTheme {
                /* State variables */
                val controller = remember {
                    LifecycleCameraController(applicationContext).apply {
                        setEnabledUseCases(
                            CameraController.IMAGE_CAPTURE or CameraController.IMAGE_ANALYSIS
                        )
                    }
                }
                // Set target resolution
                controller.imageCaptureTargetSize = CameraController.OutputSize(Size(1400, 1920))

                val (currentPhoto, updatePhoto) = remember {
                    mutableStateOf(Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888))
                }

                val (showResult, updateShowResult) = remember { mutableStateOf(false) }
                val (latestDecodedText, updateLatestDecodedText) = remember { mutableStateOf("") }

                /* Compose UI */
                Box(modifier = Modifier.fillMaxSize()) {
                    CameraPreview(controller = controller, modifier = Modifier.fillMaxSize())
                    if(showResult) {
                        Box(
                            modifier = Modifier
                                .padding(30.dp)
                                .align(Alignment.Center)
                        ) {
                            Column {
                                Image(
                                    bitmap = currentPhoto.asImageBitmap(),
                                    contentDescription = "Current photo"
                                )
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(
                                            color = Color.White,
                                            shape = RoundedCornerShape(
                                                topStart = 0.dp,
                                                topEnd = 0.dp,
                                                bottomEnd = 10.dp,
                                                bottomStart = 10.dp
                                            )
                                        )
                                        .padding(16.dp)
                                ) {
                                    Text(
                                        text = latestDecodedText,
                                        style = TextStyle(fontSize = 20.sp),
                                        color = Color.Black,
                                        modifier = Modifier.padding(8.dp)
                                    )
                                }
                            }
                        }
                    }

                    Box(modifier = Modifier
                        .fillMaxSize()
                        .clickable {
                            if (showResult)
                                updateShowResult(false)
                            else {
                                controller.takePicture(ContextCompat.getMainExecutor(
                                    applicationContext
                                ),
                                    object : ImageCapture.OnImageCapturedCallback() {
                                        override fun onCaptureSuccess(image: ImageProxy) {
                                            super.onCaptureSuccess(image)
                                            toast("Scanning... ${image.width}x${image.height}")

                                            // Fix landscape rotation
                                            val matrix = Matrix().apply {
                                                postRotate(image.imageInfo.rotationDegrees.toFloat())
                                            }
                                            val rotatedBitmap = Bitmap.createBitmap(
                                                image.toBitmap(),
                                                0,
                                                0,
                                                image.width,
                                                image.height,
                                                matrix,
                                                true
                                            )

                                            updatePhoto(rotatedBitmap)
                                            val (potentialCount,foundCount,outText) = ClaycodeDecoder.decode(currentPhoto)
                                            if (foundCount > 0) {
                                                updateLatestDecodedText(outText)
                                                updateShowResult(true)
                                            }
                                            else {
                                                toast("\uD83D\uDE14 [${potentialCount},${foundCount}] ")
                                            }

                                            image.close()
                                        }

                                        override fun onError(exception: ImageCaptureException) {
                                            super.onError(exception)
                                            Log.println(Log.ERROR, "Camera", "Cannot take picture")
                                        }
                                    })
                            }
                        })
                }
            }
        }
    }

    private fun toast(text: String) {
        val toast = Toast.makeText(baseContext, text, Toast.LENGTH_SHORT)
        toast.show()
    }

    private fun ensureHasCameraPermissions() {
        val hasCameraPermission = ContextCompat.checkSelfPermission(
            applicationContext, android.Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED;

        if (!hasCameraPermission) {
            ActivityCompat.requestPermissions(
                this, arrayOf(android.Manifest.permission.CAMERA), 0
            )
        }
    }
}

@Composable
fun CameraPreview(
    controller: LifecycleCameraController, modifier: Modifier = Modifier
) {
    val lifecycleOwner = LocalLifecycleOwner.current
    AndroidView(
        factory = {
            PreviewView(it).apply {
                this.controller = controller
                controller.bindToLifecycle(lifecycleOwner)
            }
        }, modifier = modifier
    )
}
