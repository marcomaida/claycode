#include <jni.h>
#include <string>

extern "C" JNIEXPORT jstring JNICALL
Java_com_claycode_scanner_ClaycodeDecoder_00024Companion_stringFromJNI(
        JNIEnv* env,
        jobject /* this */) {
    std::string hello = "Hello from C++";
    return env->NewStringUTF(hello.c_str());
}
