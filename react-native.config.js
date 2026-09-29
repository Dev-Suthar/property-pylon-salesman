const path = require('path');

module.exports = {
  // Vector-icon fonts are bundled by the RNVectorIcons pod; linking them here too
  // makes Xcode fail with "Multiple commands produce ...ttf".
  assets: ['./assets/fonts/'],
  dependencies: {
    'react-native-image-picker': {
      platforms: {
        android: {
          sourceDir: path.resolve(__dirname, 'node_modules/react-native-image-picker/android'),
          packageImportPath: 'import com.imagepicker.ImagePickerPackage;',
          cmakeListsPath: path.resolve(__dirname, 'node_modules/react-native-image-picker/android/build/generated/source/codegen/jni/CMakeLists.txt'),
        },
      },
    },
  },
};

