
# For more information about using CMake with Android Studio, read the
# documentation: https://d.android.com/studio/projects/add-native-code.html.
# For more examples on how to use CMake, see https://github.com/android/ndk-samples.

# Sets the minimum CMake version required for this project.
cmake_minimum_required(VERSION 3.22.1)

# Declares the project name. The project name can be accessed via ${ PROJECT_NAME},
# Since this is the top level CMakeLists.txt, the project name is also accessible
# with ${CMAKE_PROJECT_NAME} (both CMake variables are in-sync within the top level
# build script scope).
project("topology-extractor")

# Creates and names a library, sets it as either STATIC
# or SHARED, and provides the relative paths to its source code.
# You can define multiple libraries, and CMake builds them for you.
# Gradle automatically packages shared libraries with your APK.
#
# In this top level CMakeLists.txt, ${CMAKE_PROJECT_NAME} is used to define
# the target library name; in the sub-module's CMakeLists.txt, ${PROJECT_NAME}
# is preferred for the same purpose.
#
# In order to load a library into your app from Java/Kotlin, you must call
# System.loadLibrary() and pass the name of the library defined here;
# for GameActivity/NativeActivity derived applications, the same library name must be
# used in the AndroidManifest.xml file.
add_library(${CMAKE_PROJECT_NAME} SHARED
    image_processor.cpp)

# Add OpenCV
# NOTE: This looks quite brittle.
#       `PROJECT_SOURCE_DIR` is quite nebulous: https://cmake.org/cmake/help/latest/variable/PROJECT_SOURCE_DIR.html
#       Probably, there is an easier way.
# NOTE: When I imported the OpenCV module, I called it `opencv` (reflected in the folder structure)
#       The original name proposed by Android Studio was `sdk`, which seems nonsensical to me.
#       However, all cmake files use hardcoded `.../sdk/...` paths for its libraries. 
#       Therefore, I manually replaced them to point to `.../opencv/...`.
#       This procedure was a bit cursed, but worked.
set(OpenCV_DIR "${PROJECT_SOURCE_DIR}/../../../../opencv/native/jni/")
find_package(OpenCV REQUIRED)

# Specifies libraries CMake should link to your target library. You
# can link libraries from various origins, such as libraries defined in this
# build script, prebuilt third-party libraries, or Android system libraries.
target_link_libraries(${CMAKE_PROJECT_NAME}
    android
    log
    ${OpenCV_LIBS}
)

