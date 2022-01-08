import ReassignedFFT from './reassigned_fft.js'
import logScaleKDE from './log_scale_kde.js'
import aWeighting from './a_weighting.js'

export default class BaseVisualizer {

  constructor(elementSelector, numPeaks, normalizationTC) {
    this.numPeaks = numPeaks
    this.normalizationTC = normalizationTC

    this.kdeSize = 2000
    this.kdeStdDev = 10

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

    // Apply the A-weighting curve
    for (var i = 0; i < this.reassignedFFT.freq.length; i++) {
      this.reassignedFFT.value[i] *= aWeighting(this.reassignedFFT.freq[i])
    }

    // Calculate the log-scale KDE
    const spectrumLogKDE = logScaleKDE(
      this.reassignedFFT.freq,
      this.reassignedFFT.value,
      20, 20000, // These bounds are the limits of human hearing
      this.kdeSize,
      this.kdeStdDev)

    // Normalize the peak values
    var maxValue = Math.max(...spectrumLogKDE)
    var now = Date.now();
    if (maxValue > this.normalizationValue) {
      this.normalizationValue = maxValue
    } else {
      var decay = Math.exp(-(now - this.then)/this.normalizationTC)
      this.normalizationValue -= (1 - decay) * (this.normalizationValue - maxValue)
    }
    this.then = now
    if (this.normalizationValue > 0) {
      for (var i = 0; i < spectrumLogKDE.length; i++) {
        spectrumLogKDE[i] /= this.normalizationValue
      }
    }

    // Send them to the visualizer
    this.draw(spectrumLogKDE)

    // Step the animation forwards
    requestAnimationFrame(this.animate.bind(this));
  }

  draw(logSpectrum) {
    // Override this!
  }

}
