import BaseVisualizer from './base_visualizer.js'

export default class SpectrumVisualizer extends BaseVisualizer {

  // TODO:
  // make # of rectangles scale with dimension of screen to prevent aliasing

  constructor(elementSelector, numPeaks, normalizationTC) {
    super(elementSelector, numPeaks, normalizationTC)

    this.rects = new Array(this.kdeSize)

    for (var i = 0; i < this.rects.length; i++) {
      this.rects[i] = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
      this.rects[i].setAttribute('fill', 'red')
      this.rects[i].setAttribute('y', `${100*(1-i/this.rects.length)}%`)
      this.rects[i].setAttribute('height', `${100*1/this.rects.length}%`)
      this.svg.appendChild(this.rects[i])
    }
  }

  draw(logSpectrum) {
    for (var i = 0; i < logSpectrum.length; i++) {
      this.rects[i].setAttribute('width', `${100*logSpectrum[i]}%`)
      this.rects[i].setAttribute('x', `${50*(1-logSpectrum[i])}%`)
    }
  }
}
