# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Задача №216 — real crash, confirmed via adb logcat on a physical device
# (TECNO CL6, Android 15): tapping "Включить уведомления" reliably crashed
# the whole app with FATAL EXCEPTION: CapacitorPlugins,
# NullPointerException at com.getcapacitor.Plugin.getPermissionStates()
# (-> Bridge.getPermissionStates(Plugin)), reached from
# PushNotificationsPlugin.requestPermissions(). Confirmed by A/B test on
# the same device: an unminified debug build resolves this exact call
# cleanly (no crash); the release (minifyEnabled true) build crashes every
# time. @capacitor/android's own bundled consumer proguard rules
# (node_modules/@capacitor/android/capacitor/proguard-rules.pro) only
# `-keep` plugin SUBCLASSES (`extends com.getcapacitor.Plugin`) and
# @CapacitorPlugin/@PluginMethod-annotated members — they never protect
# Capacitor's own core framework classes (Plugin/Bridge/PluginHandle
# themselves), which this app's proguard-rules.pro (this file) was, until
# now, entirely empty/commented-out, relying solely on those bundled
# rules. R8's default full-mode optimizer is then free to aggressively
# inline/transform the unprotected core framework classes, which is what
# breaks Bridge.getPermissionStates()'s reflection-based permission-state
# lookup at runtime. Standard, documented fix for this category of
# Capacitor+R8 issue: keep the whole core package unconditionally.
-keep class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**
