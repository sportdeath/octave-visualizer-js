import ReassignedFFT from './reassigned_fft.js'

export default class MicVisualizer {

constructor(
  fftWindowSize,
  draw) {
  this.fftWindowSize = fftWindowSize
  this.draw = draw

  // Set up the audio
  this.ctx = new (window.AudioContext || window.webkitAudioContext)();

  // Get the microphone input
  navigator.mediaDevices.getUserMedia({audio: true})
    .then(this.onStream.bind(this));
}

function onStream(stream) {
  // Set up an analyzer to grab fftWindowSize'd windows from the stream
  this.audioIn = this.ctx.createMediaStreamSource(stream);
  this.analyser = this.ctx.createAnalyser();
  this.analyser.fftSize = this.fftWindowSize
  this.audioIn.connect(this.analyser);

  // Initialize the octave
  this.reassignedFFT = new ReassignedFFT(
    this.fftWindowSize, this.ctx.sampleRate)

  // Animate!
  this.animate();
}

function animate() {
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

}
