#include <vector>
#include <valarray>
#include <complex>

typedef std::complex<float> Complex;
typedef std::valarray<Complex> ComplexArray;

class Octave {
  public:
    Octave(size_t audio_size, size_t num_bins, unsigned int sample_rate);

    std::vector<float> & audio_to_slices(const std::vector<float> & audio);

    void fft(ComplexArray & input);

  private:
    unsigned int sample_rate;
    std::vector<float> slices;
    std::vector<float> hann;
    std::vector<float> hann_d;
    ComplexArray window;
    ComplexArray window_d;
};
