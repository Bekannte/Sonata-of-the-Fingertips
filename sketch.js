// Reference
// https://handsfree.js.org/#quickstart-workflow, https://handsfree.js.org/ref/model/hands.html#with-config
// https://handsfree.js.org/ref/util/classes.html#started-loading-and-stopped-states
// https://handsfree.js.org/ref/plugin/pinchers.html


// The camera needs to be turned on with the press of a button
// Try to keep the background neat and tidy

// Create a collection of keystrokes
kick = [];

// Create a particle collection
const particles = [];
let scale, theme, graphics, themeWidth;

let songs = [];
let song, ra, pa;
let i = 0;
let s;

// Position coordinates for one frame on each fingertip
let prevPointer = [
  // Left hand
  [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ],
  // Right hand
  [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ],
];

// The markings correspond to the four fingertips
let fingertips = [8, 12, 16, 20];

function setup() {
  sketch = createCanvas(displayWidth, displayHeight);

  // Custom particle functions
  createParticles();

  // Introducing the handsfree plugin
  handsfree = new Handsfree({
    showDebug: true,
    hands: true,
    hands: {
      enabled: true,
      // Set number of hands
      maxNumHands: 2,
      // Set identification parameters
      minDetectionConfidence: 0.4,
      minTrackingConfidence: 0.5,
    },
  });
  handsfree.enablePlugins("browser");
  handsfree.plugin.pinchScroll.disable();

  // Add button
  buttonStart = createButton("Start Webcam");
  buttonStart.class("handsfree-show-when-stopped");
  buttonStart.class("handsfree-hide-when-loading");
  buttonStart.mousePressed(() => handsfree.start());

  // "loading..."
  buttonLoading = createButton("...loading...");
  buttonLoading.class("handsfree-show-when-loading");

  // "stop"
  buttonStop = createButton("Stop Webcam");
  buttonStop.class("handsfree-show-when-started");
  buttonStop.mousePressed(() => handsfree.stop());
}

function preload() {
  songs[0] = loadSound("1.mp3");
}

function draw() {
  background(0);

  // Variability in the initial size of the keys
  i++;
  i = i % 50;

  // Particle motion
  for (const p of particles) p.update();
  for (const p of particles) p.draw();
  image(graphics, 0, 0);

  // Key press generation
  kickPaint();
}


function kickPaint() {

  // Check the condition of your fingertips
  const hands = handsfree.data?.hands;

  if (hands?.pinchState) {
    // Each hand
    hands.pinchState.forEach((hand, handIndex) => {
      // Each finger
      hand.forEach((state, finger) => {
        if (hands.landmarks?.[handIndex]?.[fingertips[finger]]) {
          // Coordinates
          let x =
            sketch.width -
            hands.landmarks[handIndex][fingertips[finger]].x * sketch.width;
          let y =
            hands.landmarks[handIndex][fingertips[finger]].y * sketch.height;

          // Add the coordinate data to the top of the kick array via push
          if (state === "start") {
            prevPointer[handIndex][finger] = { x, y };
            kick.push([
              prevPointer[handIndex][finger].x,
              prevPointer[handIndex][finger].y,
              i,
            ]);
            // Produces sound, rate and horizontal coordinate inverse matching
            ra = map(prevPointer[handIndex][finger].x, 0.1, height, 0.5,1.3);
            pa = map(prevPointer[handIndex][finger].x, 0.1, width, -1, 1);
            song = songs[0];
            song.rate(ra);
            song.pan(pa);
            song.amp(1);
            song.play();
          }

          prevPointer[handIndex][finger] = { x, y };
        }
      });
    });
  }

  // Drawing gesture capture graphics
  kick.forEach((p) => {
    noStroke();
    rectMode(CENTER);
    fill(0, 255 - p[2] * 1.87);
    rect(p[0], p[1], p[2] * 1.25, p[2] * 1.25);
  
    fill(255, 255 - p[2] * 1.65);
    rect(p[0], p[1], p[2] * 0.8, p[2] * 0.8);
  
    fill(255, 255 - p[2] * 1.34);
    rect(p[0], p[1], p[2] * 0.6, p[2] * 0.6);
  
    p[2]++;
  });
}

// Particle effects
class Particle {
  constructor(x, y, xSpeed, ySpeed) {
    this.pos = new p5.Vector(
      x || random(-50, width + 50),
      y || random(-50, height + 50)
    );
    this.color = random(theme.colors);
    this.xSpeed = xSpeed || random(-0.5, 0.5);
    this.ySpeed = ySpeed || random(-0.5, 0.5);
  }

  update() {
    this.pos.x += this.xSpeed;
    this.pos.y += this.ySpeed;

    if (
      this.pos.x < -50 ||
      this.pos.x > width + 50 ||
      this.pos.y < -50 ||
      this.pos.y > height + 50
    )
      this.pos.set(random(-50, width + 50), random(-50, height + 50));
  }

  draw() {
    graphics.fill(this.color);
    let w = 30; // Width of piano keys
    let h = 30; // Height of piano keys
    let gap = 4; // Spacing between piano keys
    let numKeys = 7; // There are 7 piano keys in a set
    let numGroups = 4; // With 4 sets of piano keys
    for (let i = 0; i < numGroups; i++) {
      let x = this.pos.x - ((numGroups - 1) * numKeys * (w + gap)) / 2 + i * numKeys * (w + gap);
      for (let j = 0; j < numKeys; j++) {
        let y = this.pos.y - h / 2;
        let isBlack = [1, 3, 6].includes(j);
        let kw = isBlack ? w * 0.6 : w;
        let kh = isBlack ? h * 0.6 : h;
        graphics.rect(x + j * (w + gap), y, kw, kh);
      }
    }
  }
}

function createParticles() {
  // Generating particles and giving them random colours
  theme = random([
    {
      colors: ["#c7e9b4", "#f7bbbb", "#89ccd4", "#65a2cc", "#927dc9", "#fed976"],
      background: "#FFFFFF",
    },
  ]);
  for (let i = 0; i < 200; i++) particles.push(new Particle());

  // Exporting drawing results
  graphics = createGraphics(width, height);
  graphics.background(theme.background);
  graphics.noStroke();
}




