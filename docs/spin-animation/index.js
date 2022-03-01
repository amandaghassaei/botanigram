// Live demo at: https://apps.amandaghassaei.com/botanigram/docs/spin-animation/

const filename = "Square_Crop.jpg";

const reverseSpin = true; // False is CCW, true is CW.
const recordVideo = false;
const rotationAngle = 2.4; // In radians (golden angle is 2.4 rad).

let img, imageOffset, cropDim;

let easingNumSteps = 101;// Should be odd number.
let easingIndex = 0;
let easing;
let angle = 0;

const targetEasingSteps = 5; // 30fps / 5 is 6fps.

const videoLength = 30 * 30; // 30 seconds times 30fps.
let t = 0;

const CanvasCapture = window.CanvasCapture;

// Init a symmetric easing function that has area under the curve = 1.
function getEasing(length) {
	if (length % 2 !== 1) {
		throw new Error(`Length must be odd, got ${length}.`);
	}
	const easing = new Array(length).fill(0);
	const halfLength = Math.ceil(length / 2);
	let sum = 0;
	for (let i = 0; i < halfLength; i++) {
		const x = i / length;
		// Use function y = x^3.
		const y = x * x * x;
		easing[i] = y;
		sum += y;
		// Mirror function for second half of easing function.
		if (i < halfLength - 1) {
			easing[length - i - 1] = y;
			sum += y;
		}
	}
	// Normalize easing.
	for (let i = 0; i < length; i++) {
		easing[i] /= sum;
	}
	return easing;
}

function preload() {
	img = loadImage(filename);
	
}

function setup() {
	const imgDim = Math.min(img.width, img.height);
	cropDim = Math.floor(imgDim / Math.sqrt(2));
	imageOffset = -(imgDim - cropDim) / 2;

	frameRate(30);// 30 fps.

	pixelDensity(1);
	createCanvas(cropDim, cropDim);

	const canvas = document.getElementById('defaultCanvas0');

	// Init capturer.
	if (CanvasCapture) {
		CanvasCapture.init(
			canvas,
			{
				showRecDot: true,
				showDialogs: true,
				ffmpegCorePath: 'https://raw.githubusercontent.com/amandaghassaei/botanigram/main/dependencies/ffmpeg-core.js',
			},
		);
	}
}

function draw() {
	// Begin recording.
	if (t == 0 && recordVideo && CanvasCapture) {
		CanvasCapture.beginVideoRecord({
			format: CanvasCapture.MP4, // If you are having trouble exporting MP4 try CanvasCapture.WEBM
			name: 'Animation',
			quality: 1,
			fps: 30,
			onExportProgress: (progress) => console.log(`Processing MP4: ${(progress * 100).toFixed(1)}% complete`),
		});
	}

	// Draw rotated image.
	const center = cropDim / 2;
	push();
	translate(center, center);
	rotate((reverseSpin ? 1 : -1) * angle * rotationAngle);
	image(img, imageOffset - center, imageOffset - center);
	pop();

	// Record frame.
	if (CanvasCapture && CanvasCapture.isRecording()) CanvasCapture.recordFrame();

	if (easingIndex === 0 && easingNumSteps === targetEasingSteps) {
		// Pinch easing until we get step function (e.g. array of all 0's and one 1).
		let sum = 0;
		for (let i = 0; i < easingNumSteps; i++) {
			easing[i] = easing[i]**1.1;
			sum += easing[i];
		}
		// Normalize easing.
		for (let i = 0; i < easingNumSteps; i++) {
			easing[i] /= sum;
		}
	}

	// Reset easing.
	if (easingIndex === 0 && easingNumSteps > targetEasingSteps) {
		easing = getEasing(easingNumSteps);
		easingNumSteps = Math.floor(easingNumSteps * 0.75 / 2) * 2 + 1; // Make number odd.
		if (easingNumSteps < targetEasingSteps) easingNumSteps = targetEasingSteps;
	}

	// Increment angle and easing.
	angle += easing[easingIndex++];
	if (easingIndex >= easingNumSteps) {
		easingIndex = 0;
	}

	// End record if needed.
	t++;
	if (t > videoLength && recordVideo) {
		if (CanvasCapture && CanvasCapture.isRecording()) CanvasCapture.stopRecord();
	}
}