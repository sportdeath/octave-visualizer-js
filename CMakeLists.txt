cmake_minimum_required (VERSION 3.4)

project(octave)

set(CMAKE_CXX_STANDARD 11)

if(NOT CMAKE_BUILD_TYPE)
  set (CMAKE_BUILD_TYPE Release)
endif()

set(CMAKE_CXX_FLAGS "-Wall -Wextra")
set(CMAKE_CXX_FLAGS_DEBUG "-g")
set(CMAKE_CXX_FLAGS_RELEASE "-O3")

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/js")

add_executable(${PROJECT_NAME} src/octave.cpp)

set(CMAKE_EXECUTABLE_SUFFIX ".wasm.js")
set_target_properties(${PROJECT_NAME} PROPERTIES LINK_FLAGS "-s WASM=1 --bind")
