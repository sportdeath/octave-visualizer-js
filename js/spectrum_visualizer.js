import BaseVisualizer from './base_visualizer.js'

export default class SpectrumVisualizer extends BaseVisualizer {

  constructor(elementSelector, numPeaks, normalizationTC) {
    super(elementSelector, numPeaks, normalizationTC)
    this.rects = new Array(numPeaks)
    for (var i = 0; i < this.numPeaks; i++) {
      this.rects[i] = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
      this.rects[i].setAttribute('fill', 'red')
      this.rects[i].setAttribute('fill-opacity', '0.4')
      this.rects[i].setAttribute('height', '0.5%')
      this.svg.appendChild(this.rects[i])
    }
  }

  draw(freq, value) {
    // Human hearing range, roughly
    var freqMinLog = Math.log2(20)
    var freqMaxLog = Math.log2(20000)

    for (var i = 0; i < this.numPeaks; i++) {

      var x = (Math.log2(freq[i]) - freqMinLog)/(freqMaxLog - freqMinLog)
      if (x < 0 || x > 1) continue

      var y = value[i]

      // TODO: why are there NaNs in the first place...
      if (!isNaN(x) && !isNaN(y)) {
        this.rects[i].setAttribute('y', `${100*(1 - x)}%`)
        this.rects[i].setAttribute('width', `${100*y}%`)
        this.rects[i].setAttribute('x', `${50*(1-y)}%`)
      }

    }
  }
}
