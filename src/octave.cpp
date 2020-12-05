#include <emscripten/bind.h>
using namespace emscripten;

class Octave {
  public:
    Octave(int audio_size_, int num_bins_) {
      audio_size = audio_size_;
    }

    int get_audio_size() {
      return audio_size;
    }

  private:
    int audio_size;
};

// Binding code
EMSCRIPTEN_BINDINGS(octave) {
  class_<Octave>("Octave")
  .constructor<int, int>()
  .function("get_audio_size", &Octave::get_audio_size)
  ;
}
