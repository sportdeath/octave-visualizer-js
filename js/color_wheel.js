// Constants
const NUM_SLICES =  22;
const SATURATION = 0.7; // in [0,1]
const TRIANGLE_FATNESS = 0.05; // percent
const CIRCLE_RADIUS = 10; // pixels

function ColorWheel() {
  this.canvas = document.getElementById("color_wheel");
  this.canvas.addEventListener("click", this.canvas.requestFullscreen);
}

ColorWheel.prototype.draw = function(values) {
  // Clear existing content
  this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);

  // Scale the page appropriately
  this.canvas.width = this.canvas.clientWidth;
  this.canvas.height = this.canvas.clientHeight;

  // Draw the triangles
  for (i = 0; i < NUM_SLICES; i++) {
    this.drawTriangle(i, values[i]);
  }

  // Add a center circle
  this.drawCenterCircle();
}

ColorWheel.prototype.drawTriangle = function(index, value) {
  let ctx = this.canvas.getContext("2d");

  // Draw the triangle
  ctx.beginPath();
  ctx.moveTo(this.canvas.width/2, this.canvas.height/2);
  this.drawRadial(index, true);
  this.drawRadial(index+1, false);
  ctx.closePath();

  // Color it
  var hue = index/NUM_SLICES;
  var rgb = hsv2rgb(hue, value);
  ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  ctx.fill();
}

ColorWheel.prototype.drawRadial = function(index, start) {
  // Upper bound on the radius from triangle inequality
  var radius = this.canvas.height/2 +  this.canvas.width/2;
  
  // Make the triangles a little fat for aliasing
  if (start) {
    index -= TRIANGLE_FATNESS;
  } else {
    index += TRIANGLE_FATNESS;
  }
  var angle = (2 * Math.PI * index) / NUM_SLICES;

  // Draw a line out
  var x = this.canvas.width/2 + radius * Math.cos(angle);
  var y = this.canvas.height/2 + radius * Math.sin(angle);
  this.canvas.getContext('2d').lineTo(x, y);
}

ColorWheel.prototype.drawCenterCircle = function() {
  // Make a little black circle in the center of the page
  let ctx = this.canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(this.canvas.width/2,
          this.canvas.height/2,
          CIRCLE_RADIUS,
          0, 2*Math.PI);
  ctx.closePath();
  ctx.fillStyle = "black";
  ctx.fill();
}

function hsv2rgb(hue, value) {
  return [value * hsv_f(5, hue), value * hsv_f(3, hue), value * hsv_f(1, hue)];
}

function hsv_f(n, hue) {
  var a = (n + hue * 6) % 6;
  var b = Math.max(0, Math.min(a, 4 - a, 1));
  return 255 * (1 - SATURATION * b);
}
