function HarmonicVisualizer() {
  this.cw = new ColorWheel();
  this.cw_values = new Array(NUM_SLICES);
  this.getMicrophoneInput();
  this.animate();
}

HarmonicVisualizer.prototype.getMicrophoneInput = function() {
}

HarmonicVisualizer.prototype.animate = function() {
  for (i = 0; i < NUM_SLICES; i++) {
    this.cw_values[i] = 0.8 + 0.1 * Math.random();
  }
  this.cw.draw(this.cw_values);
  requestAnimationFrame(this.animate.bind(this));
}
