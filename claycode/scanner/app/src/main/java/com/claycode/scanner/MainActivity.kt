package com.claycode.scanner

import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Matrix
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.camera.core.ImageCapture.OnImageCapturedCallback
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.ImageProxy
import androidx.camera.view.CameraController
import androidx.camera.view.LifecycleCameraController
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.claycode.scanner.ui.theme.ClaycodeScannerTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (!hasCameraPermission()) {
            ActivityCompat.requestPermissions(
                this, arrayOf(android.Manifest.permission.CAMERA), 0
            )
        }

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
                val (currentPhoto, updatePhoto) = remember {
                    mutableStateOf(Bitmap.createBitmap(100, 200, Bitmap.Config.ARGB_8888))
                }

                /* Compose UI */
                Box(
                    modifier = Modifier.fillMaxSize()
                ) {
                    CameraPreview(
                        controller = controller,
                        modifier = Modifier.fillMaxSize()
                    )

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .align(Alignment.BottomCenter)
                            .padding(10.dp)
                    ) {
                        IconButton(
                            onClick = {
                                controller.takePicture(
                                    ContextCompat.getMainExecutor(applicationContext),
                                    object : OnImageCapturedCallback() {
                                        override fun onCaptureSuccess(image: ImageProxy) {
                                            super.onCaptureSuccess(image)

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
                                        }

                                        override fun onError(exception: ImageCaptureException) {
                                            super.onError(exception)
                                            Log.println(Log.ERROR, "Camera", "Cannot take picture")
                                        }
                                    }
                                )
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.CameraAlt,
                                contentDescription = "Take picture"
                            )
                        }

                        Column (
                            modifier = Modifier
                                .padding(50.dp)
                        ) {
                            Image(
                                bitmap = currentPhoto.asImageBitmap(),
                                contentDescription = "Current photo"
                            )
                            Text(
                                text = "Decoded: ${ClaycodeDecoder.decode(currentPhoto)}"
                            )
                        }
                    }
                }
            }
        }
    }

    private fun hasCameraPermission() : Boolean {
        return ContextCompat.checkSelfPermission(
            applicationContext,
            android.Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }
}

@Composable
fun CameraPreview(
    controller: LifecycleCameraController,
    modifier: Modifier = Modifier
) {
    val lifecycleOwner = LocalLifecycleOwner.current
    AndroidView(
        factory = {
            PreviewView(it).apply {
                this.controller = controller
                controller.bindToLifecycle(lifecycleOwner)
            }
        },
        modifier = modifier
    )
}
