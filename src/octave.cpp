#include <iostream>
#include <vector>

#include <emscripten/bind.h>
using namespace emscripten;

class Octave {
  public:
    Octave(int audio_size, int num_bins) {
      slices = std::vector<float>(num_bins);
      window = std::vector<float>(audio_size);
      window_d = std::vector<float>(audio_size);
    }

    std::vector<float> & audio_to_slices(std::vector<float> & audio) {
      for (size_t i = 0; i < slices.size(); i++) {
        slices[i] = audio[i] * 2;
      }

      return slices;
    }

  private:
    std::vector<float> slices;
    std::vector<float> window;
    std::vector<float> window_d;
};

// Binding code
EMSCRIPTEN_BINDINGS(octave) {
  class_<Octave>("Octave")
  .constructor<int, int>()
  .function("audioToSlices", &Octave::audio_to_slices)
  ;
  register_vector<float>("VectorFloat");
}
