// Constants
const SATURATION = 0.7; // in [0,1]
const MIN_RADIUS = 0.05; // percent
const DEVIATION = 2; // octaves

function ColorWheel(numSlices, slicesPerOctave) {
  // Initialize SVG
  this.svg = createSVGElement('svg', document.body);
  this.svg.addEventListener("click", this.svg.requestFullscreen);

  // Initialize radial spectrogram
  this.slices = new Array(numSlices);
  for (var i = 0; i < this.slices.length; i++) {
    this.slices[i] = createSVGElement('polygon', this.svg);
  }
  this.slicesPerOctave = slicesPerOctave;
  this.angleIncrement = (2 * Math.PI)/slicesPerOctave;
}

ColorWheel.prototype.resize = function() {
  // Update width and height
  this.w = this.svg.clientWidth;
  this.h = this.svg.clientHeight;

  // Compute the total area available
  var totalArea = (Math.PI * (1 - MIN_RADIUS));

  // Initialize the starting circle
  var previousRadii = new Array(this.slicesPerOctave+1);
  previousRadii.fill(MIN_RADIUS);
  var angle = 0;

  for (var i = 0; i < this.slices.length; i++) {
    // Compute the area of the slice which is Gaussian
    var mean = this.slices.length/2;
    var dev = DEVIATION * this.slicesPerOctave;
    var rel = (i - mean)/dev;
    var normal = Math.exp(-0.5 * rel * rel);
    normal /= dev * Math.sqrt(2 * Math.PI);
    var area = totalArea * normal;

    // Compute the point that will give the desired radius
    var bottom0 = previousRadii.shift();
    var bottom1 = previousRadii[0];
    var top0    = previousRadii[this.slicesPerOctave-1];
    var top1    = this.t1(area, bottom0, bottom1, top0);
    previousRadii.push(top1);

    // Convert to coordinates
    var pointsStr = "";
    pointsStr += this.pointStr(bottom0, angle);
    pointsStr += this.pointStr(   top0, angle);
    angle += this.angleIncrement;
    pointsStr += this.pointStr(   top1, angle);
    pointsStr += this.pointStr(bottom1, angle);
    this.slices[i].setAttribute("points", pointsStr);
  }
}

ColorWheel.prototype.draw = function(values) {
  // If the client has changed, re-size shapes
  if (this.h != this.svg.clientWidth ||
      this.w != this.svg.clientHeight) {
    this.resize();
  }

  // Color the slices
  for (var i = 0; i < this.slices.length; i++) {
    var hue = i/this.slicesPerOctave % 1;
    var rgb = hsv2rgb(hue, values[i]);
    this.slices[i].setAttribute("fill", `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
  }
}

ColorWheel.prototype.t1 = function(area, b0, b1, t0) {
  return ((2 * area)/Math.sin(this.angleIncrement) + b0 * b1)/t0;
}

ColorWheel.prototype.pointStr = function(radius, angle) {
  var outerRadius = Math.min(this.w, this.h)/2;
  var x = this.w/2 + outerRadius * radius * Math.cos(angle);
  var y = this.h/2 + outerRadius * radius * Math.sin(angle);
  return x.toString() + ", " + y.toString() + " ";
}

function createSVGElement(type, par) {
  var element = document.createElementNS("http://www.w3.org/2000/svg", type);
  par.appendChild(element);
  return element;
}

function hsv2rgb(hue, value) {
  return [value * hsv_f(5, hue), value * hsv_f(3, hue), value * hsv_f(1, hue)];
}
function hsv_f(n, hue) {
  var a = (n + hue * 6) % 6;
  var b = Math.max(0, Math.min(a, 4 - a, 1));
  return 255 * (1 - SATURATION * b);
}
