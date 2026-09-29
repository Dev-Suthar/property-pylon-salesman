package com.pylonsalesman

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.common.assets.ReactFontManager
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    // Manrope / Fraunces families (res/font) so fontFamily + fontWeight resolve like iOS
    ReactFontManager.getInstance().addCustomFont(this, "Manrope", R.font.manrope)
    ReactFontManager.getInstance().addCustomFont(this, "Fraunces", R.font.fraunces)
    loadReactNative(this)
  }
}
