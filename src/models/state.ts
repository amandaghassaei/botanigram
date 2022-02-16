import { NearestFilter, Texture, TextureLoader } from 'three';
import m from 'mithril';
import { primaryThreeView } from './globals';
import { blurActiveElement, showErrorModal } from '../utils';

export const ANGLE_NUM_DECIMAL_PLACES = 1;

export const GOLDEN_ANGLE = 137.5;

export type StateJSON = {
	centerX: number,
	centerY: number,
	angle: number,
	reverse: boolean,
	framerate: number,
	imageWidth: number,
	imageHeight: number,
	paused: boolean,
	title?: string,
};

export class State {
	private _centerX = 0;
	private _centerY = 0;
	private _centerXFullSize = 0;
	private _centerYFullSize = 0;
	private _angle = GOLDEN_ANGLE; // In degrees.
	private _reverse = false;
	private _framerate = 5;
	private _paused = true;
	private _imageWidth = 0;
	private _imageHeight = 0;
	private _additionalZoom = 1; // This adds an extra crop to the animation.
	private _texture?: Texture;
	private _isDemoFile = true;
	private _url: string | undefined;
	private _title: string | undefined;

	toJSON() {
		const {
			centerX,
			centerY,
			angle,
			reverse,
			framerate,
			imageWidth,
			imageHeight,
			paused,
			title,
		} = this;
		return {
			centerX,
			centerY,
			angle,
			reverse,
			framerate,
			imageWidth,
			imageHeight,
			paused,
			title,
		} as StateJSON;
	}

	async loadFullResImage() {
		if (!this._isDemoFile) return;
		if (!this._url) return;
		if (this._url.indexOf('-900') < 0) return; // Large image already loaded.
		const url = this._url.replace('-900', '-orig');
		const texture = await new TextureLoader().loadAsync(url);
		const { width, height } = texture.image;
		// Handle bad url.
		if (!texture || !texture.image || !width || !height) {
			// Unable to load, just use reg scale instead.
			return;
		}
		this._texture = texture;
		this._imageHeight = height;
		this._imageWidth = width;
		// Set default center.
		this.centerX = this._centerXFullSize;
		this.centerY = this._centerYFullSize;
		this._url = url;
		m.redraw();
	}

	async loadImage(url: string, isDemoFile: boolean) {
		const texture = await new TextureLoader().loadAsync(url);
		const { width, height } = texture.image;
		if (!texture || !texture.image || !width || !height) {
			// Unable to load.
			showErrorModal('Unable to load image.');
			return false;
		}
		this._texture = texture;
		this._imageHeight = height;
		this._imageWidth = width;
		// Reset angle.
		this.angle = GOLDEN_ANGLE;
		// Set default center.
		this.centerX = Math.round(width / 2);
		this.centerY = Math.round(height / 2);
		this._isDemoFile = isDemoFile;
		this._url = url;
		this.title = undefined;
		m.redraw();
		return true;
	}

	setJSON(json: StateJSON) {
		blurActiveElement();
		this._centerXFullSize = json.centerX;
		this._centerYFullSize = json.centerY;
		this.angle = json.angle;
		this.reverse = json.reverse;
		this._title = json.title;
	}

	set centerX(centerX: number) {
		if (Number.isNaN(centerX)) return;
		if (centerX < 0) centerX = 0;
		if (centerX > this.imageWidth) centerX = this.imageWidth;
		this._centerX = Math.round(centerX);
	}

	get centerX() {
		return this._centerX;
	}

	set centerY(centerY: number) {
		if (Number.isNaN(centerY)) return;
		if (centerY < 0) centerY = 0;
		if (centerY > this.imageHeight) centerY = this.imageHeight;
		this._centerY = Math.round(centerY);
	}

	get centerY() {
		return this._centerY;
	}

	set center(center: [number, number]) {
		this.centerX = center[0];
		this.centerY = center[1];
	}

	get center() {
		return [this._centerX, this._centerY];
	}

	setGoldenAngle() {
		this.angle = GOLDEN_ANGLE;
	}

	set angle(angle: number) {
		if (Number.isNaN(angle)) return;
		const decimalFactor = 10**ANGLE_NUM_DECIMAL_PLACES;
		this._angle = Math.round(angle * decimalFactor) / decimalFactor;
	}

	get angle() {
		return this._angle;
	}

	set reverse(reverse: boolean) {
		this._reverse = reverse;
	}

	get reverse() {
		return this._reverse;
	}

	set framerate(framerate: number) {
		if (Number.isNaN(framerate)) return;
		if (framerate < 1) return;
		if (framerate > 30) return;
		this._framerate = Math.round(framerate);
	}

	get framerate() {
		return this._framerate;
	}

	get imageWidth() {
		return this._imageWidth;
	}

	get imageHeight() {
		return this._imageHeight;
	}

	get texture() {
		return this._texture;
	}

	get paused() {
		return this._paused;
	}

	play() {
		this._paused = false;
	}

	pause() {
		this._paused = true;
	}

	set additionalZoom(zoom: number) {
		if (zoom < 1) return;
		if (zoom > 10) return;
		this._additionalZoom = zoom;
	}

	get additionalZoom() {
		return this._additionalZoom;
	}

	get isDemoFile() {
		return this._isDemoFile;
	}

	set title(title: string | undefined) {
		this._title = title;
	}

	get title() {
		return this._title;
	}
}

export const state = new State();
