function Octave(audioSize, numBins, sampleRate) {
  this.sampleRate = sampleRate;

  // Allocate storage
  this.slices   = new Float32Array(numBins);
  this.windowR  = new Float32Array(audioSize);
  this.windowI  = new Float32Array(audioSize);
  this.windowDR = new Float32Array(audioSize);
  this.windowDI = new Float32Array(audioSize);
  this.audio    = new Float32Array(audioSize);
  this.hann     = new Float32Array(audioSize);
  this.hannD    = new Float32Array(audioSize);
  this.windowI.fill(0);
  this.windowDI.fill(0);

  // Precompute the Hann windows
  for (var i = 0; i < audioSize; i++) { 
    var N = audioSize;
    var n = i - (N - 1)/2;
    var angle = (2 * Math.PI * n)/(N - 1);
    this.hann[i] = 0.5 * (1 + Math.cos(angle));
    this.hannD[i] = -(Math.PI * this.sampleRate)/(N - 1) * Math.sin(angle);
  }
}

Octave.prototype.processAudio = function() {
  // Reset the slices
  this.slices.fill(0);

  // Window the audio
  for (var i = 0; i < this.windowR.length; i++) {
    this.windowR [i] = this.hann [i] * this.audio[i];
    this.windowDR[i] = this.hannD[i] * this.audio[i];
  }
  
  // Compute the FFT
  //FFT(this.windowR, this.windowI, 0, 1);

  // Wrap it to the octave
  for (var i = 1; i < this.windowR.length/2 + 1; i++) {
    // Compute the frequency
    var freq = (2 * Math.PI * i * this.sampleRate)/(this.windowR.length);
    var wrappedFreq = Math.log2(freq) % 1;

    // Find the bin
    var value = abs(this.windowR[i], this.windowI[i]);
    this.placeSlice(wrappedFreq, value);
  }
}

Octave.prototype.placeSlice = function(position, value) {
  var bin = position * this.slices.length;
  var leftOfBin = Math.floor(bin);
  var rightPercent = bin - leftOfBin;
  this.slices[leftOfBin % this.slices.length] += (1 - rightPercent) * value;
  this.slices[(leftOfBin + 1) % this.slices.length] += rightPercent * value;
}

function norm(r, i) {
  return r * r + i * i;
}
function abs(r, i) {
  return Math.sqrt(norm(r, i));
}

//function FFT(R, I, start, skip) {
  // Recurse on odd and even sections
  //FFT(R, I, start, skip*2);
  //FFT(R, I, start+1, skip*2);

  //for (var i = start; i < 
//}
