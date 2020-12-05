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
  this.analyser.fftSize = 256;
  this.audio_in.connect(this.analyser);

  // Create storage for data
  this.audio_data = new Float32Array(this.analyser.frequencyBinCount);

  // Animate!
  this.animate();
}

HarmonicVisualizer.prototype.animate = function() {
  // Fetch the fft data!
  this.analyser.getFloatFrequencyData(this.audio_data);

  var total_volume = 0;
  for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
    this.audio_data[i] -= this.analyser.minDecibels;
    this.audio_data[i] /= this.analyser.maxDecibels - this.analyser.minDecibels;
    total_volume += this.audio_data[i];
  }
  var avg_volume = total_volume/(this.analyser.frequencyBinCount);

  for (var i = 0; i < NUM_SLICES; i++) {
    this.cw_values[i] = avg_volume;
  }

  this.cw.draw(this.cw_values);
  requestAnimationFrame(this.animate.bind(this));
}
