import BaseVisualizer from './base_visualizer.js'

export default class SpectrumVisualizer extends BaseVisualizer {

  // This produces the correct results for different noise color inputs
  // TODO:
  // move KDE to the base so it can be reused
  // clean up kernel density estimation so the scaling makes more sense
  // add a-weighting to the base so it's perceptually accurate (bass is too high rn)
  // make # of rectangles scale with dimension of screen to prevent aliasing

  constructor(elementSelector, numPeaks, normalizationTC) {
    super(elementSelector, numPeaks, normalizationTC)

    this.KDE = new Array(2000)
    this.rects = new Array(this.KDE.length)

    // Human hearing range, roughly
    this.freqLogMin = Math.log2(20)
    this.freqLogMax = Math.log2(20000)
    this.STD_DEV_SCALE = 30
    this.NUM_STD_DEVS  = 6

    for (var i = 0; i < this.rects.length; i++) {
      this.rects[i] = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
      const freqLog = this.indexToFreqLog(i)
      this.rects[i].setAttribute('fill', 'red')
      // TODO: the yellow and green regions should be much quieter
      //if (freqLog < Math.log2(1000)) {
        //this.rects[i].setAttribute('fill', 'green')
      //} else if (freqLog > Math.log2(10000)) {
        //this.rects[i].setAttribute('fill', 'yellow')
      //} else {
        //this.rects[i].setAttribute('fill', 'red')
      //}
      this.rects[i].setAttribute('y', `${100*(1-i/this.rects.length)}%`)
      this.rects[i].setAttribute('height', `${100*1/this.rects.length}%`)
      this.svg.appendChild(this.rects[i])
    }
  }

  draw(freq, value) {
    // Reset the kernel density estimation
    this.KDE.fill(0)

    // For each spectral peak, add a Gaussian with width
    // proportional to 1/freq and mass proportional to
    // value/freq to the KDE.
    for (var i = 0; i < this.numPeaks; i++) {
      // Compute the distribution characteristics
      const freqLogCenter = Math.log2(freq[i])
      const stdDev = this.STD_DEV_SCALE/freq[i]
      const width = this.NUM_STD_DEVS * stdDev

      // Find the relevant indices of the KDE array
      const startIndex = Math.floor(this.freqLogToIndex(freqLogCenter - width))
      const endIndex   = Math.ceil (this.freqLogToIndex(freqLogCenter + width))

      for (var j = startIndex; j <= endIndex; j++) {
        if (j < 0 || j >= this.KDE.length) continue

        // Compute the value of the Gaussian at each point and accumulate
        const freqLog = this.indexToFreqLog(j)
        const normalizedX = (freqLog - freqLogCenter)/stdDev
        const density = Math.exp(-0.5*normalizedX*normalizedX)
        const scale = value[i]/(freq[i] * stdDev)
        this.KDE[j] += 10 * scale * density
      }
    }

    // Output the KDE
    for (var i = 0; i < this.rects.length; i++) {
      this.rects[i].setAttribute('width', `${100*this.KDE[i]}%`)
      this.rects[i].setAttribute('x', `${50*(1-this.KDE[i])}%`)
    }
  }

  freqLogToIndex(freqLog) {
    return this.KDE.length * (freqLog - this.freqLogMin)/(this.freqLogMax - this.freqLogMin)
  }

  indexToFreqLog(index) {
    return (index/this.KDE.length) * (this.freqLogMax - this.freqLogMin) + this.freqLogMin
  }
}
