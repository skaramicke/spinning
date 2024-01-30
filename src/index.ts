import "./style.scss";

// Create a canvas element
const canvas: HTMLCanvasElement = document.createElement("canvas");
document.body.appendChild(canvas);

// Set the canvas size to cover the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get the 2D rendering context
const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (!ctx) throw new Error("Failed to get canvas context");

// Load the images
const image1: HTMLImageElement = new Image();
image1.src = "/images/1.png";

const image2: HTMLImageElement = new Image();
image2.src = "/images/2.png";

const image3: HTMLImageElement = new Image();
image3.src = "/images/3.png";

// Animation parameters
const animationDuration: number = 6000; // 3 seconds for each half of the animation
const totalDuration: number = animationDuration * 2; // Total duration for the full A-B-A cycle
let startTime: number | null = null;

// Easing function for smooth start and end
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Wait for the images to load
Promise.all([
  new Promise<void>((resolve) => {
    image1.onload = () => resolve();
  }),
  new Promise<void>((resolve) => {
    image2.onload = () => resolve();
  }),
  new Promise<void>((resolve) => {
    image3.onload = () => resolve();
  }),
]).then(() => {
  // Start the animation
  startTime = performance.now();
  requestAnimationFrame(animate);
});

function animate(time: number): void {
  if (!ctx || !startTime) return;

  // Clear the canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the white circle
  const centerX: number = canvas.width / 2;
  const centerY: number = canvas.height / 2;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY,
    Math.min(image1.width, image1.height) / 2,
    0,
    2 * Math.PI
  );
  ctx.closePath();
  ctx.fill();

  // Calculate elapsed time
  const elapsed: number = (time - startTime) % totalDuration;
  let progress: number = elapsed / animationDuration;
  if (progress > 1) progress = 2 - progress; // Reverse direction after reaching halfway

  progress = easeInOutCubic(progress); // Apply easing

  // Calculate rotation for each image
  const angle1: number = progress * Math.PI; // 180 degrees
  const angle2: number = (progress * Math.PI) / 2; // 90 degrees CW
  const angle3: number = (-progress * Math.PI) / 2; // 90 degrees CCW

  // Render the images with multiply blend mode
  ctx.globalCompositeOperation = "multiply";
  drawRotatedImage(image1, centerX, centerY, angle1);
  drawRotatedImage(image2, centerX, centerY, angle2);
  drawRotatedImage(image3, centerX, centerY, angle3);

  ctx.globalCompositeOperation = "source-over"; // Reset blend mode

  requestAnimationFrame(animate);
}

function drawRotatedImage(
  image: HTMLImageElement,
  x: number,
  y: number,
  angle: number
): void {
  ctx?.save();
  ctx?.translate(x, y);
  ctx?.rotate(angle);
  ctx?.drawImage(image, -image.width / 2, -image.height / 2);
  ctx?.restore();
}
