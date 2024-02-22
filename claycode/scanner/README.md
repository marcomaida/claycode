# Claycode scanner

Android studio is needed to run this project.

## Run the app on your phone over wifi

First follow the [official instructions](https://developer.android.com/studio/run/device) for the initial setup.

If the user interface in android studio doesn't work, do it from the terminal (tested only on Linux). This process is too janky to be scripted, so just repeat the following commands until it works.

First go to Developer Options -> Debugging -> Wireless debugging -> Pair device with pairing code

```
adb pair 172.16.14.214:39781 [6_digit_device_code]
adb connect 172.16.14.214:39781
adb devices
adb kill-server
adb start-server
```

The device should pop up in andoid studio. You can then run the app from android studio while selecting the correct device. If you're facing issues, make the MAC address of your phone static (can be done in the settings of the hotspot you're connected to).
