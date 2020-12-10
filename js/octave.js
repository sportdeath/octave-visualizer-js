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
  this.windowI.fill(0);
  this.windowDI.fill(0);
  
  // Compute the FFT
  FFT(this.windowR, this.windowI);
  FFT(this.windowDR, this.windowDI);

  // Wrap it to the octave
  for (var i = 1; i < this.windowR.length/2 + 1; i++) {
    // Precompute the norm
    var norm = this.windowR[i] * this.windowR[i] + this.windowI[i] * this.windowI[i]; 

    // Compute the frequency
    var freq = (2 * Math.PI * i * this.sampleRate)/(this.windowR.length);
    var dPhaseDT = (this.windowI[i] * this.windowDR[i] - this.windowR[i] * this.windowDI[i])/norm;
    var freqReassigned = freq + dPhaseDT;
    var wrappedFreq = Math.log2(freqReassigned) % 1;

    // Find the bin
    this.placeSlice(wrappedFreq, Math.sqrt(norm));
  }
}

Octave.prototype.placeSlice = function(position, value) {
  var bin = position * this.slices.length;
  var leftOfBin = Math.floor(bin);
  var rightPercent = bin - leftOfBin;
  this.slices[leftOfBin % this.slices.length] += (1 - rightPercent) * value;
  this.slices[(leftOfBin + 1) % this.slices.length] += rightPercent * value;
}

function FFT(real, imag) {
 // https://www.nayuki.io/res/free-small-fft-in-multiple-languages/fft.js
 // Length variables
 var n = real.length;
 if (n != imag.length)
  throw "Mismatched lengths";
 if (n == 1)  // Trivial transform
  return;
 var levels = -1;
 for (var i = 0; i < 32; i++) {
  if (1 << i == n)
   levels = i;  // Equal to log2(n)
 }
 if (levels == -1)
  throw "Length is not a power of 2";

 // Trigonometric tables
 var cosTable = new Array(n / 2);
 var sinTable = new Array(n / 2);
 for (var i = 0; i < n / 2; i++) {
  cosTable[i] = Math.cos(2 * Math.PI * i / n);
  sinTable[i] = Math.sin(2 * Math.PI * i / n);
 }

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
    var tpre =  real[l] * cosTable[k] + imag[l] * sinTable[k];
    var tpim = -real[l] * sinTable[k] + imag[l] * cosTable[k];
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
