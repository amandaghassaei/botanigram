const UIkit = require('uikit');
import { StateJSON } from './models/state';

const inputTypes = ['input', 'select', 'button', 'textarea'];
export function inputIsFocused() {
	const { activeElement } = document;
	if (activeElement && inputTypes.indexOf(activeElement.tagName.toLowerCase()) !== -1) {
		return true;
	}
	return false;
}

export function blurActiveElement() {
	if (document.activeElement && (document.activeElement as HTMLElement).blur) {
		(document.activeElement as HTMLElement).blur();
	}
}

export function getSignedAngle(angle: number, reverse: boolean) {
	return angle * (reverse ? -1 : 1);
}

export const RAD_CONVERSION = Math.PI / 180;

export type ExportSettings = {
	totalFrames: number,
	signedAngle: number,
	dimensions: number,
}

export function getSquareDimensions(model: StateJSON) {
	// Get available dimensions based on center of rotation.
	const { centerX, centerY, imageWidth, imageHeight } = model;
	const dimX = imageWidth - 2 * Math.abs(imageWidth / 2 - centerX);
	const dimY = imageHeight - 2 * Math.abs(imageHeight / 2 - centerY);
	return Math.floor(Math.min(dimX, dimY));
}

export function getCropDimensions(model: StateJSON) {
	// Get dimensions of crop.
	// When we rotate the crop we need to reduce by a factor of 1/sqrt(2).
	return Math.floor(getSquareDimensions(model) / Math.sqrt(2));
}

export function getExportSettings(model: StateJSON, fullRes: boolean) {
	const { angle, reverse } = model;
	// Calc px dimensions for full sized export.
	let dimensions = getCropDimensions(model);
	if (!fullRes && dimensions > 600) dimensions = 600;
	// Calculate num frames for (nearly) perfect loop.
	let bestLoop = -1;
	let bestLoopTol = Infinity;
	// Exhaustive search to find best loop – I'm sure there's a smarter way to calculate this.
	// For 137.5 we get a perfect loop at 144 frames.
	// if (angle === GOLDEN_ANGLE) return 144;
	for (let i = 1; i < 30; i++) {
		const totalRotation = angle * i;
		let tol = (totalRotation % 360);
		if (360 - tol < tol) {
			tol = tol - 360;
		}
		if (tol === 0) return {
			totalFrames: i,
			signedAngle: getSignedAngle(angle, reverse),
			dimensions,
		};
		if (Math.abs(tol) < Math.abs(bestLoopTol)) {
			bestLoopTol = tol;
			bestLoop = i;
		}
		// If we're within some tolerance, call it good.
		// These settings limit angle adjustment to 1 degree.
		if (Math.abs(bestLoopTol / bestLoop) <= 1) {
			break;
		}
	}
	// Adjust angle slightly so that we get a perfect loop.
	// We don't currently tell the user about this.
	const newAngle = angle - bestLoopTol / bestLoop;

	return {
		totalFrames: bestLoop,
		signedAngle: getSignedAngle(newAngle, reverse),
		dimensions,
	};
}

export const GIF = 'GIF';
export const MP4 = 'MP4';
export const FRAMES = 'FRAMES';
export type ANIMATION_TYPE = typeof GIF | typeof MP4 | typeof FRAMES;

export function showErrorModal(html: string) {
	const modal = document.getElementById('modal-error')!;
	modal.getElementsByClassName('body')![0].innerHTML = html;
	UIkit.modal(modal).show();
}