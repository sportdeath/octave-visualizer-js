const FFT_SIZE = 2048;
const NUM_SLICES = 1000;
const SLICES_PER_OCTAVE = 24;
const FREQ_CENTER = 2500; // HZ
const NORMALIZATION_TIME = 200; // Milliseconds

function HarmonicVisualizer() {
  // Set up the audio
  this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  this.getMicrophoneInput();
}

HarmonicVisualizer.prototype.getMicrophoneInput = function() {
  navigator.mediaDevices.getUserMedia({audio: true})
  .then(this.onStream.bind(this));
}

HarmonicVisualizer.prototype.onStream = function(stream) {
  // Fetch the input and connect it to the fft
  this.audio_in = this.ctx.createMediaStreamSource(stream);
  this.analyser = this.ctx.createAnalyser();
  this.analyser.fftSize = FFT_SIZE;
  this.audio_in.connect(this.analyser);

  // Initialize the color wheel
  this.cw = new ColorWheel(NUM_SLICES, SLICES_PER_OCTAVE);

  // Initialize the octave
  this.octave = new Octave(FFT_SIZE, this.ctx.sampleRate, NUM_SLICES, SLICES_PER_OCTAVE, FREQ_CENTER);

  // Initialize normalization
  this.normalization = 0;
  this.then = Date.now();

  // Animate!
  this.animate();
}

HarmonicVisualizer.prototype.animate = function() {
  // Fetch the time series
  this.analyser.getFloatTimeDomainData(this.octave.audio);

  // Extract the harmonic components
  this.octave.audioToSlices();

  // Compute normalization
  var slicesMax = Math.max(...this.octave.slices);
  var now = Date.now();
  if (slicesMax > this.normalization) {
    this.normalization = slicesMax;
  } else {
    var decay = Math.exp(-(now - this.then)/NORMALIZATION_TIME);
    this.normalization -= (1 - decay) * (this.normalization - slicesMax);
  }
  this.then = now;
  for (var i = 0; i < this.octave.slices.length; i++) {
    this.octave.slices[i] /= this.normalization;
  }

  // Color the wheel
  this.cw.draw(this.octave.slices);
  requestAnimationFrame(this.animate.bind(this));
}
