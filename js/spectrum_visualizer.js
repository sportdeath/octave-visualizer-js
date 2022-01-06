import BaseVisualizer from './base_visualizer.js'

export default class SpectrumVisualizer extends BaseVisualizer {

  constructor(elementSelector, numPeaks, normalizationTC) {
    super(elementSelector, numPeaks, normalizationTC)
    this.circles = new Array(numPeaks)
    for (var i = 0; i < this.numPeaks; i++) {
      this.circles[i] = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
      this.circles[i].setAttribute('fill', 'red')
      this.circles[i].setAttribute('width', '0.2%')
      this.circles[i].setAttribute('y', '0%')
      this.svg.appendChild(this.circles[i])
    }
  }

  draw(freq, value) {
    var maxFreq = Math.log2(freq[this.numPeaks-1])
    for (var i = 0; i < this.numPeaks; i++) {
      var x = Math.log2(freq[i])/maxFreq
      var y = value[i]
      if (!isNaN(x) && !isNaN(y)) {
        this.circles[i].setAttribute('x', `${100*x}%`)
        this.circles[i].setAttribute('height', `${100*y}%`)
      }
    }
  }

}
