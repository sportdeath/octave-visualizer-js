import ReassignedFFT from './reassigned_fft.js'

export default class BaseVisualizer {

  constructor(elementSelector, numPeaks, normalizationTC) {
    this.numPeaks = numPeaks
    this.normalizationTC = normalizationTC

    // Set up the audio
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Get the microphone input
    navigator.mediaDevices.getUserMedia({audio: true})
      .then(this.onStream.bind(this));

    // Inject an SVG element
    const el = document.querySelector(elementSelector)
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    el.appendChild(this.svg)
    this.svg.addEventListener("click", this.svg.requestFullscreen);
  }

  onStream(stream) {
    // Set up an analyzer to grab fftWindowSize'd windows from the stream
    this.audioIn = this.ctx.createMediaStreamSource(stream);
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2*this.numPeaks
    this.audioIn.connect(this.analyser);

    // Initialize the FFT
    this.reassignedFFT = new ReassignedFFT(
      2*this.numPeaks, this.ctx.sampleRate)

    // Initialize normalization
    this.then = Date.now()
    this.normalizationValue = 0

    // Animate!
    this.animate();
  }

  animate() {
    // Fetch the time series
    this.analyser.getFloatTimeDomainData(this.reassignedFFT.audio);

    // Extract the peaks
    this.reassignedFFT.processWindow();

    // Normalize the peak values
    var maxValue = Math.max(...this.reassignedFFT.value)
    var now = Date.now();
    if (maxValue > this.normalizationValue) {
      this.normalizationValue = maxValue
    } else {
      var decay = Math.exp(-(now - this.then)/this.normalizationTC)
      this.normalizationValue -= (1 - decay) * (this.normalizationValue - maxValue)
    }
    this.then = now
    if (this.normalizationValue > 0) {
      for (var i = 0; i < this.numPeaks; i++) {
        this.reassignedFFT.value[i] /= this.normalizationValue
      }
    }

    // Send them to the visualizer
    this.draw(
      this.reassignedFFT.freq,
      this.reassignedFFT.value)

    // Step the animation forwards
    requestAnimationFrame(this.animate.bind(this));
  }

  draw(freq, value) {
    // Override this!
  }

}
