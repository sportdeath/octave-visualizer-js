// Constants
const SATURATION = 0.7; // in [0,1]
const TRIANGLE_FATNESS = 0.01; // radians
const CIRCLE_RADIUS = 10; // pixels

function ColorWheel(numSlices) {
  // Initialize SVG
  this.svg = createSVGElement('svg', document.body);
  this.svg.addEventListener("click", this.svg.requestFullscreen);

  // Initialize triangles
  this.triangles = new Array(numSlices);
  for (var i = 0; i < this.triangles.length; i++) {
    this.triangles[i] = createSVGElement('polygon', this.svg);
  }

  // Initialize center circle
  this.circle = createSVGElement('circle', this.svg);
  this.circle.setAttribute("fill", "black");
  this.circle.setAttribute("r", CIRCLE_RADIUS.toString());
}

ColorWheel.prototype.draw = function(values) {
  // If the client has changed, re-size shapes
  if (this.h != this.svg.clientWidth ||
      this.w != this.svg.clientHeight) {
    this.resize();
  }

  // Color the triangles
  for (var i = 0; i < this.triangles.length; i++) {
    var hue = i/this.triangles.length;
    var rgb = hsv2rgb(hue, values[i]);
    this.triangles[i].setAttribute("fill", `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
  }
}

ColorWheel.prototype.resize = function() {
  // Update width and height
  this.w = this.svg.clientWidth;
  this.h = this.svg.clientHeight;

  // Move circles to center
  this.circle.setAttribute("cx", this.w/2);
  this.circle.setAttribute("cy", this.h/2);

  // Move and scale triangles
  var radius = this.w/2 + this.h/2;
  for (var i = 0; i < this.triangles.length; i++) {
    var points = new Array(6);
    points[0] = 0;
    points[1] = 0;
    points[2] = radius * Math.cos(this.indexToAngle(i)-TRIANGLE_FATNESS);
    points[3] = radius * Math.sin(this.indexToAngle(i)-TRIANGLE_FATNESS);
    points[4] = radius * Math.cos(this.indexToAngle(i+1)+TRIANGLE_FATNESS);
    points[5] = radius * Math.sin(this.indexToAngle(i+1)+TRIANGLE_FATNESS);

    // Convert to string for HTML
    var pointsStr = ""
    for (var j = 0; j < points.length; j++) {
      if (j % 2 == 0) {
        pointsStr += (this.w/2 + points[j]).toString() + ",";
      } else {
        pointsStr += (this.h/2 + points[j]).toString() + " ";
      }
    }
    this.triangles[i].setAttribute("points", pointsStr);
  }
}

function createSVGElement(type, par) {
  var element = document.createElementNS("http://www.w3.org/2000/svg", type);
  par.appendChild(element);
  return element;
}

ColorWheel.prototype.indexToAngle = function(index) {
  return (2 * Math.PI * index) / this.triangles.length;
}

function hsv2rgb(hue, value) {
  return [value * hsv_f(5, hue), value * hsv_f(3, hue), value * hsv_f(1, hue)];
}

function hsv_f(n, hue) {
  var a = (n + hue * 6) % 6;
  var b = Math.max(0, Math.min(a, 4 - a, 1));
  return 255 * (1 - SATURATION * b);
}
