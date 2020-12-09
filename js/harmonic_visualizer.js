const FFT_SIZE = 2048;
const NORMALIZATION_TIME = 2000; // Milliseconds

function HarmonicVisualizer() {
  // Initialize the color wheel
  this.cw = new ColorWheel();
  this.cw_values = new Array(NUM_SLICES);

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

  // Create storage for data
  this.audio_data = new Float32Array(FFT_SIZE);
  this.audio_data_vec = new Module.VectorFloat();
  this.audio_data_vec.resize(FFT_SIZE, 0);

  // Initialize the object!
  this.octave = new Module.Octave(FFT_SIZE, NUM_SLICES, this.ctx.sampleRate);
  this.normalization = 0;
  this.then = Date.now();

  // Animate!
  this.animate();
}

HarmonicVisualizer.prototype.animate = function() {
  // Fetch the time series
  this.analyser.getFloatTimeDomainData(this.audio_data);

  // Copy it into a vector
  for (var i = 0; i < this.audio_data.length; i++) {
    this.audio_data_vec.set(i, this.audio_data[i]);
  }

  // Extract the harmonic components with C++
  var slices = this.octave.audioToSlices(this.audio_data_vec);

  // Normalize it 
  var slices_max = slices.get(0);
  for (var i = 0; i < NUM_SLICES; i++) {
    slices_max = Math.max(slices_max, slices.get(i));
  }
  if (slices_max < 0 || isNaN(slices_max)) {
    slices_max = 0;
  }
  
  // Slur the normalization
  var now = Date.now();
  if (slices_max > this.normalization) {
    this.normalization = slices_max;
  } else {
    var decay = Math.exp(-(now - this.then)/NORMALIZATION_TIME);
    this.normalization -= (1 - decay) * (this.normalization - slices_max);
  }
  this.then = now;

  // Color the wheel
  for (var i = 0; i < NUM_SLICES; i++) {
    this.cw_values[i] = slices.get(i)/this.normalization;
  }
  this.cw.draw(this.cw_values);
  requestAnimationFrame(this.animate.bind(this));
}
