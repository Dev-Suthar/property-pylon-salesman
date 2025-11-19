const path = require('path');

module.exports = {
  assets: ['./node_modules/react-native-vector-icons/Fonts/'],
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

