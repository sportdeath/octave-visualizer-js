function Octave(audioSize, numBins, sampleRate) {
  // Allocate storage
  this.slices  = new Float32Array(numBins);
  //this.window  = new Float32Array(audioSize);
  //this.windowD = new Array(audioSize);
  this.audio   = new Float32Array(audioSize);
  this.hann    = new Float32Array(audioSize);
  this.hannD   = new Float32Array(audioSize);

  // Precompute the Hann windows
  for (var i = 0; i < audioSize; i++) { 
    var N = audioSize;
    var n = i - (N - 1)/2;
    var angle = (2 * Math.PI * n)/(N - 1);
    this.hann[i] = 0.5 * (1 + Math.cos(angle));
    this.hannD[i] = -(Math.PI * sampleRate)/(N - 1) * Math.sin(angle);
  }
}

Octave.prototype.processAudio = function() {
  // Reset the slices
  for (var i = 0; i < this.slices.length; i++) {
    //this.slices[i] = 0;
    this.slices[i] = Math.random();
  }

  // Window the audio
  
  // Compute the FFT

  // Compute frequency reassignment

  // Wrap it to the octave
}
