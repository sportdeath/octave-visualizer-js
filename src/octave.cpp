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
    window[i]   = hann[i]   * audio[i];
    window_d[i] = hann_d[i] * audio[i];
  }

  // Compute the FFT
  fft(window);
  fft(window_d);

  for (size_t i = 0; i < window.size()/2 + 1; i++) {
    // Compute the frequency reassignment
    float freq = (2 * M_PI * i * sample_rate)/float(window.size());
    float dphase_dt = -std::imag(window_d[i] * std::conj(window[i])/std::norm(window[i]));
    float freq_reassigned = freq + dphase_dt;
    //if (freq_reassigned <= 0) continue;

    if (freq_reassigned < 2 * M_PI * 60 or freq_reassigned > 2 * M_PI * 3000) continue;

    // Wrap it in the octave
    float wrapped_freq = std::fmod(std::log2(freq_reassigned), 1);
    while (wrapped_freq < 0) wrapped_freq += 1;

    // Find the nearest bin
    float approx_bin = wrapped_freq * slices.size();
    int left_bin = std::floor(approx_bin);
    float right = approx_bin - left_bin;
    float value = std::abs(window[i]);
    slices[left_bin % slices.size()] += (1 - right) * value;
    slices[(left_bin + 1) % slices.size()] += right * value;
  }

  return slices;
}

void Octave::fft(ComplexArray & x) {
  // Source: https://tfetimes.com/c-fast-fourier-transform/
  const size_t N = x.size();
  if (N <= 1) return;

  // Divide
  ComplexArray even = x[std::slice(0, N/2, 2)];
  ComplexArray  odd = x[std::slice(1, N/2, 2)];

  // conquer
  fft(even);
  fft(odd);

  // combine
  for (size_t k = 0; k < N/2; k++) {
    Complex t = std::polar(1.0, -2 * M_PI * k / N) * odd[k];
    x[k    ] = even[k] + t;
    x[k+N/2] = even[k] - t;
  }
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
