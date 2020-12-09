const FFT_SIZE = 2048;
const NUM_SLICES = 48;
const NORMALIZATION_TIME = 2000; // Milliseconds

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
  this.cw = new ColorWheel(NUM_SLICES);

  // Initialize the octave
  this.octave = new Octave(FFT_SIZE, NUM_SLICES, this.ctx.sampleRate);

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
  this.octave.processAudio();

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

  // Color the wheel
  for (var i = 0; i < this.octave.slices.length; i++) {
    this.octave.slices[i] /= this.normalization;
  }
  this.cw.draw(this.octave.slices);
  requestAnimationFrame(this.animate.bind(this));
}
