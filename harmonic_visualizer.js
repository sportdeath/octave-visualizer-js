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
  var input = this.ctx.createMediaStreamSource(stream);
  var analyser = this.ctx.createAnalyser();

  // Animate!
  this.animate();
}

HarmonicVisualizer.prototype.animate = function() {
  for (i = 0; i < NUM_SLICES; i++) {
    this.cw_values[i] = 0.8 + 0.1 * Math.random();
  }
  this.cw.draw(this.cw_values);
  requestAnimationFrame(this.animate.bind(this));
}
