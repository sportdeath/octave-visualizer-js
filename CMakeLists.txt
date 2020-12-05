cmake_minimum_required (VERSION 3.4)

project(octave)

set(CMAKE_CXX_STANDARD 11)

if(NOT CMAKE_BUILD_TYPE)
  set (CMAKE_BUILD_TYPE Release)
endif()

set(CMAKE_CXX_FLAGS "-Wall -Wextra")
set(CMAKE_CXX_FLAGS_DEBUG "-g")
set(CMAKE_CXX_FLAGS_RELEASE "-O3")

#Adding cmake modules
set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} ${CMAKE_SOURCE_DIR}/modules/)

#######################
## Internal Libraries
#######################

include_directories(include)
#file(GLOB PROJECT_SOURCES src/*.cpp)

#######################
## External Libraries
#######################

# FFTW3
#find_package(FFTW REQUIRED)
#include_directories(${FFTW_INCLUDES})
#set(LIBS ${LIBS} ${FFTW_LIBRARIES})

####################
## Library Creation
####################

#add_library(${PROJECT_NAME} SHARED ${PROJECT_SOURCES})
#target_link_libraries(${PROJECT_NAME} ${LIBS})
#set(LIBS ${LIBS} ${PROJECT_NAME})

#######################
## Compile to js
#######################

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/js")
add_executable(${PROJECT_NAME} src/octave.cpp)
#target_link_libraries(${_example_name} ${LIBS})
set(CMAKE_EXECUTABLE_SUFFIX ".wasm.js")
set_target_properties(${PROJECT_NAME} PROPERTIES LINK_FLAGS "-s WASM=1 --bind")
