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
  this.cosTable = new Float32Array(audioSize/2);
  this.sinTable = new Float32Array(audioSize/2);

  // Precompute the Hann windows
  for (var i = 0; i < audioSize; i++) { 
    var N = audioSize;
    var n = i - (N - 1)/2;
    var angle = (2 * Math.PI * n)/(N - 1);
    this.hann[i] = 0.5 * (1 + Math.cos(angle));
    this.hannD[i] = -(Math.PI * this.sampleRate)/(N - 1) * Math.sin(angle);
  }

  // Precompute trig table
  for (var i = 0; i < audioSize/2; i++) {
    this.cosTable[i] = Math.cos(2 * Math.PI * i / audioSize);
    this.sinTable[i] = Math.sin(2 * Math.PI * i / audioSize);
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
  this.windowI.fill(0);
  this.windowDI.fill(0);
  
  // Compute the FFT
  this.fft(this.windowR, this.windowI);
  this.fft(this.windowDR, this.windowDI);

  // Wrap it to the octave
  for (var i = 1; i < this.windowR.length/2 + 1; i++) {
    // Compute the norm
    var norm = this.windowR[i] * this.windowR[i] + this.windowI[i] * this.windowI[i]; 

    // Compute the reassigned frequency
    var freq = (2 * Math.PI * i * this.sampleRate)/(this.windowR.length);
    var dPhaseDT = (this.windowI[i] * this.windowDR[i] - this.windowR[i] * this.windowDI[i])/norm;
    var freqReassigned = freq + dPhaseDT;
    var wrappedFreq = Math.log2(freqReassigned) % 1;

    // Place it in a bin
    var value = Math.sqrt(norm);
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

Octave.prototype.fft = function(real, imag) {
 // https://www.nayuki.io/res/free-small-fft-in-multiple-languages/fft.js
 // Length variables
 var n = real.length;
 var levels = Math.log2(n);

 // Bit-reversed addressing permutation
 for (var i = 0; i < n; i++) {
  var j = reverseBits(i, levels);
  if (j > i) {
   var temp = real[i];
   real[i] = real[j];
   real[j] = temp;
   temp = imag[i];
   imag[i] = imag[j];
   imag[j] = temp;
  }
 }

 // Cooley-Tukey decimation-in-time radix-2 FFT
 for (var size = 2; size <= n; size *= 2) {
  var halfsize = size / 2;
  var tablestep = n / size;
  for (var i = 0; i < n; i += size) {
   for (var j = i, k = 0; j < i + halfsize; j++, k += tablestep) {
    var l = j + halfsize;
    var tpre =  real[l] * this.cosTable[k] + imag[l] * this.sinTable[k];
    var tpim = -real[l] * this.sinTable[k] + imag[l] * this.cosTable[k];
    real[l] = real[j] - tpre;
    imag[l] = imag[j] - tpim;
    real[j] += tpre;
    imag[j] += tpim;
   }
  }
 }

 // Returns the integer whose value is the reverse of the lowest 'width' bits of the integer 'val'.
 function reverseBits(val, width) {
  var result = 0;
  for (var i = 0; i < width; i++) {
   result = (result << 1) | (val & 1);
   val >>>= 1;
  }
  return result;
 }
}
