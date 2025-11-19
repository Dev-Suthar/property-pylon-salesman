#!/bin/bash
# Create empty codegen directories for packages that don't use codegen
# This prevents CMake errors during build

mkdir -p node_modules/react-native-image-picker/android/build/generated/source/codegen/jni

# Create stub CMakeLists.txt files if they don't exist
if [ ! -f "node_modules/react-native-image-picker/android/build/generated/source/codegen/jni/CMakeLists.txt" ]; then
  cat > node_modules/react-native-image-picker/android/build/generated/source/codegen/jni/CMakeLists.txt << 'EOF'
# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

# Empty stub library - this package doesn't use codegen but CMake expects the target
# We create an empty OBJECT library to satisfy the linking requirements
add_library(
  react_codegen_RNImagePickerSpec
  OBJECT
)

target_include_directories(react_codegen_RNImagePickerSpec PUBLIC .)

target_link_libraries(
  react_codegen_RNImagePickerSpec
  fbjni
  jsi
  reactnative
)

target_compile_reactnative_options(react_codegen_RNImagePickerSpec PRIVATE)
EOF
fi

