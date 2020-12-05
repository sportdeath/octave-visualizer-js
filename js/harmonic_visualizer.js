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

  // Initialize the object!
  this.octave = new Module.Octave(this.analyser.fftSize, NUM_SLICES);
  alert(this.octave.get_audio_size());

  // Animate!
  this.animate();
}

HarmonicVisualizer.prototype.animate = function() {
  // Fetch the time series
  this.analyser.getFloatTimeDomainData(this.audio_data);

  // TODO: do some computation with C++/Emscripten
  var total_volume = 0;
  for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
    total_volume += Math.abs(this.audio_data[i]);
  }
  var avg_volume = total_volume/(this.analyser.frequencyBinCount);
  avg_volume = Math.sqrt(avg_volume);

  // Color the wheel
  for (var i = 0; i < NUM_SLICES; i++) {
    this.cw_values[i] = avg_volume;
  }
  this.cw.draw(this.cw_values);
  requestAnimationFrame(this.animate.bind(this));
}
