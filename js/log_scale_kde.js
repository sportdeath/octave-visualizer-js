export default function logScaleKDE(x, y, min, max, size, stdDev) {

  // Create an empty output
  var kde = new Array(size).fill(0)

  // Add functions to convert from x coordinates
  // to indices in the log-scale KDE array.
  const logMin = Math.log2(min)
  const logMax = Math.log2(max)
  function xToIndex(x) {
    return kde.length * (Math.log2(x) - logMin)/(logMax - logMin)
  }
  function indexToX(index) {
    return Math.pow(2, (index/kde.length) * (logMax - logMin) + logMin)
  }

  // Go to 5 standard deviations to
  // get accuracy to 99.99994%
  // (this is a little silly but doesn't
  //  really effect running time)
  const width = 5 * stdDev

  // Pre-compute the Gaussian scale factor
  const scale = 1/(stdDev * Math.sqrt(2 * Math.PI))

  // For each pair (x[i], y[i]), add a Gaussian
  // centered at x[i] with amplitude y[i] to the
  // log-scale KDE array.
  for (var i = 0; i < x.length; i++) {

    // Find the relevant indices of the KDE array
    const startIndex = Math.floor(xToIndex(x[i] - width))
    const endIndex   = Math.ceil (xToIndex(x[i] + width))

    for (var j = startIndex; j <= endIndex; j++) {
      // Make sure we don't spill out of bounds
      if (j < 0 || j >= kde.length) continue

      // Compute the value of the Gaussian at each point and accumulate
      const normalizedXj = (indexToX(j) - x[i])/stdDev
      const density = Math.exp(-0.5 * normalizedXj * normalizedXj)
      kde[j] += y[i] * scale * density
    }
  }

  return kde
}
