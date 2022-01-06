import ReassignedFFT from './reassigned_fft.js'

export default class BaseVisualizer {

constructor(elementSelector, numPeaks) {
  this.numPeaks = numPeaks

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

  // Initialize the octave
  this.reassignedFFT = new ReassignedFFT(
    2*this.numPeaks, this.ctx.sampleRate)

  // Animate!
  this.animate();
}

animate() {
  // Fetch the time series
  this.analyser.getFloatTimeDomainData(this.reassignedFFT.audio);

  // Extract the harmonic components
  this.reassignedFFT.processWindow();

  // Send them to the visualizer
  this.draw(
    this.reassignedFFT.freq,
    this.reassignedFFT.value)

  // Step the animation forwards
  requestAnimationFrame(this.animate.bind(this));
}

draw(freq, value) {
  // Override this!
  console.log(freq[10], value[10])
}

}
