#include <vector>
#include <cmath>
#include <iostream>
#include <emscripten/bind.h>

#include "octave.hpp"

Octave::Octave(size_t audio_size, size_t num_bins, unsigned int sample_rate_)
  : sample_rate(sample_rate_) {

  // Allocate storage devices
  slices   = std::vector<float>(num_bins);
  window   = ComplexArray(audio_size);
  window_d = ComplexArray(audio_size);
  hann     = std::vector<float>(audio_size);
  hann_d   = std::vector<float>(audio_size);

  // Compute the Hann window
  for (size_t i = 0; i < audio_size; i++) {
    // center of the window is n = 0
    float N = audio_size;
    float n = i - (N - 1)/2.;
    hann[i] = 0.5 * (1 + std::cos(2 * M_PI * n/(N - 1)));
    hann_d[i] =  -(M_PI * sample_rate)/(N - 1) * std::sin(2 * M_PI * n/(N - 1));
  }
}

std::vector<float> & Octave::audio_to_slices(const std::vector<float> & audio) {
  // Reset the slices
  for (size_t i = 0; i < slices.size(); i++) {
    slices[i] = 0;
  }

  // Window the audio
  for (size_t i = 0; i < window.size(); i++) {
    window[i] = hann[i] * audio[i];
    window_d[i] = hann_d[i] * audio[i];
  }

  // Compute the FFT
  //fft(window);
  //fft(window_d);

  for (size_t i = 0; i < window.size(); i++) {
    // Compute the frequency reassignment
    float freq = (2 * M_PI * i * sample_rate)/float(window.size());
    float dphase_dt = -std::imag(window_d[i] * std::conj(window[i])/std::norm(window[i]));
    float freq_reassigned = freq + dphase_dt;

    // Wrap it in the octave
    float wrapped_freq = std::fmod(std::log2(freq_reassigned), 1);
    while (wrapped_freq < 0) wrapped_freq += 1;

    // Find the nearest bin
    // TODO make a linear interpolation
    int nearest_bin = std::round(wrapped_freq * slices.size());
    nearest_bin = nearest_bin % slices.size();

    // Place the value
    slices[nearest_bin] += std::abs(window[i]);
  }

  return slices;
}

// Binding code
using namespace emscripten;
EMSCRIPTEN_BINDINGS(octave) {
  class_<Octave>("Octave")
  .constructor<size_t, size_t, unsigned int>()
  .function("audioToSlices", &Octave::audio_to_slices)
  ;
  register_vector<float>("VectorFloat");
}