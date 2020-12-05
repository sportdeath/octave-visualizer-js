// Initialize the color wheel
// and a place for it's values
var cw = new ColorWheel();
let cw_values = new Array(NUM_SLICES);

// Run the animation
function animate() {
  for (i = 0; i < NUM_SLICES; i++) {
    cw_values[i] = 0.8 + 0.1 * Math.random();
  }
  cw.draw(cw_values);
  requestAnimationFrame(animate);
}
animate();
