// Constants
var num_slices = 22;
var saturation = 0.7;
var triangle_fatness = 0.05; // percent

let canvas = document.getElementById("harmonic_visualizer");
let ctx = canvas.getContext("2d");

function draw_radial(index, start) {
  // Upper bound on the radius from triangle inequality
  var radius = canvas.height/2 +  canvas.width/2;
  
  // Make the triangles a little fat for aliasing
  if (start) {
    index -= triangle_fatness;
  } else {
    index += triangle_fatness;
  }
  var angle = (2 * Math.PI * index) / num_slices;

  // Draw a line out
  var x = canvas.width/2 + radius * Math.cos(angle);
  var y = canvas.height/2 + radius * Math.sin(angle);
  ctx.lineTo(x, y);
}

function hsv_f(n, hue) {
  var a = (n + hue * 6) % 6;
  var b = Math.max(0, Math.min(a, 4 - a, 1));
  return 255 * (1 - saturation * b);
}

function hsv2rgb(hue, value) {
  return [value * hsv_f(5, hue), value * hsv_f(3, hue), value * hsv_f(1, hue)];
}

function draw_triangle(index, brightness) {
  // Draw the triangle
  ctx.beginPath();
  ctx.moveTo(canvas.width/2, canvas.height/2);
  draw_radial(index, true);
  draw_radial(index+1, false);
  ctx.closePath();

  // Color it
  var hue = index/num_slices;
  var rgb = hsv2rgb(hue, brightness);
  ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  ctx.fill();
}

function draw_circle() {
  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, 10, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fillStyle = "black";
  ctx.fill();
}

function draw_screen() {
  // Clear existing content
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Scale the page appropriately
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // Draw the triangles
  for (i = 0; i < num_slices; i++) {
    draw_triangle(i, 1 - 0.1 * Math.random());
  }

  // Add a center circle
  draw_circle();
}

function fullscreen(){
  if (canvas.requestFullScreen) {
    canvas.requestFullScreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  } else if (canvas.mozRequestFullScreen) {
    canvas.mozRequestFullScreen();
  }
}
canvas.addEventListener("click", fullscreen);

// Run it!
function animate() {
  requestAnimationFrame(animate);
  draw_screen();
}
animate();
