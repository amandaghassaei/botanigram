
const renderFullSize = false;
let img;
const imgDim = renderFullSize ? 2572 : 900;
const cropDim = Math.floor(imgDim / Math.sqrt(2));
const imageOffset = -(imgDim - cropDim) / 2;

let easingNumSteps = 101;
let easingIndex = 0;
let easing;
let angle = 0;

const targetEasingSteps = 5; // 30 / 5 is 6fps.

const recordVideo = false;
const videoLength = 20 * 30; // 20 seconds times 30fps.
let t = 0;

// Init a symmetic easing function that has area under the curve = 1.
function getEasing(length) {
	if (length % 2 !== 1) {
		throw new Error(`Length must be odd, got ${length}.`);
	}
	const easing = new Array(length).fill(0);
	const halfLength = Math.ceil(length / 2);
	let sum = 0;
	for (let i = 0; i < halfLength; i++) {
		const x = i / length;
		const y = x * x * x;
		easing[i] = y;
		sum += y;
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

function setup() {
	pixelDensity(1);
	createCanvas(cropDim, cropDim);
	img = loadImage(renderFullSize ? "Square_Crop.jpg" : "Square_Crop-900.jpg");
	const canvas = document.getElementById('defaultCanvas0');

	CanvasCapture.init(
		canvas,
		{
			showRecDot: true,
			ffmpegCorePath: '../../dependencies/ffmpeg-core.js'
		},
	);
}

function draw() {
	if (t == 0 && recordVideo) {
		CanvasCapture.beginVideoRecord({
			format: 'webm',
			name: 'Animation',
			quality: 1,
			fps: 30,
		});
	}

	const center = cropDim / 2;
	push();
	translate(center, center);
	rotate(angle * 2.4); // golden angle is 2.4 radians.
	image(img, imageOffset - center, imageOffset - center);
	pop();

	if (CanvasCapture.isRecording()) CanvasCapture.recordFrame();

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

	if (easingIndex === 0 && easingNumSteps > targetEasingSteps) {
		easing = getEasing(easingNumSteps);
		easingNumSteps = Math.floor(easingNumSteps * 0.75 / 2) * 2 + 1; // Make number odd.
		if (easingNumSteps < targetEasingSteps) easingNumSteps = targetEasingSteps;
	}

	angle += easing[easingIndex++];
	if (easingIndex >= easingNumSteps) {
		easingIndex = 0;
	}

	t++;
	if (t > videoLength && recordVideo) {
		if (CanvasCapture.isRecording()) CanvasCapture.stopRecord();
	}
}