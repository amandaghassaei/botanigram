import { 
	BufferAttribute,
	Group,
	Mesh,
	MeshBasicMaterial,
	OrthographicCamera,
	PlaneBufferGeometry,
	Scene,
	WebGLRenderer,
	CylinderBufferGeometry,
	Raycaster,
	Vector2,
	Texture,
	Color,
	TextureFilter,
	LinearFilter,
	sRGBEncoding,
	NearestFilter,
} from 'three';
import autoBind from 'auto-bind';
import m from 'mithril';
import * as CanvasCapture from 'canvas-capture';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { state, StateJSON } from './state';
import { ExportSettings, getExportSettings, RAD_CONVERSION, getSignedAngle, ANIMATION_TYPE, GIF, MP4, FRAMES, getCropDimensions, getSquareDimensions, blurActiveElement } from '../utils';

const POSITIONS = new Float32Array([
	-0.5, 0.5, 0,
	0.5, 0.5, 0,
	-0.5, -0.5, 0,
	0.5, -0.5, 0,
]);

export class ThreeView {
	private _isPrimaryView = false;
	private scene: Scene;
	private camera: OrthographicCamera;
	private renderer?: WebGLRenderer;
	private _canvas?: HTMLCanvasElement;
	private controls?: OrbitControls;
	// Geometry.
	private geometry: PlaneBufferGeometry;
	private mesh: Mesh;
	private crosshairs: Group;
	private crosshairsMaterial: MeshBasicMaterial;
	private crosshairsFadeCounter = -1;
	private textureFilter: TextureFilter = LinearFilter;
	// Raycasting.
	private raycaster = new Raycaster();

	constructor() {
		// Bind this.
		autoBind(this);

		// Scene setup.
		this.scene = new Scene();
		this.scene.background = new Color(0x000000);

		// Camera setup.
		this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 100);
		this.camera.position.set(0, 0, 1);

		// Init a mesh to show image.
		this.geometry = new PlaneBufferGeometry(1, 1);
		this.geometry.setAttribute('position', new BufferAttribute(POSITIONS.slice(), 3));
		this.mesh = new Mesh(this.geometry, new MeshBasicMaterial());
		this.scene.add(this.mesh);

		// Init a cross in the center of screen.
		const scale = 0.075;
		const thickness = 0.006;
		const crosshairsGeometry = new CylinderBufferGeometry(thickness, thickness, scale, 4);
		this.crosshairsMaterial = new MeshBasicMaterial({ transparent: true, opacity: 1 });
		// https://www.donmccurdy.com/2020/06/17/color-management-in-threejs/
		this.crosshairsMaterial.color.setHex(0x034AFF).convertSRGBToLinear()
		const mesh1 = new Mesh(crosshairsGeometry, this.crosshairsMaterial);
		const mesh2 = new Mesh(crosshairsGeometry, this.crosshairsMaterial);
		mesh2.rotateZ(Math.PI / 2);
		this.crosshairs = new Group();
		this.crosshairs.add(mesh1, mesh2);
	}

	set canvas(canvas: HTMLCanvasElement | undefined) {
		if (this._canvas === canvas) return;
		this._canvas = canvas;
		if (!canvas) return;
		// Renderer setup.
		this.renderer = new WebGLRenderer({canvas, antialias: true});
		this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
		// https://www.donmccurdy.com/2020/06/17/color-management-in-threejs/
		this.renderer.outputEncoding = sRGBEncoding;
		this.resize();
		// Force layout reflow.
		getComputedStyle(canvas);
		// Add a few extra resize calls just in case things load up slowly.
		setTimeout(this.resize, 1);
		if (this._isPrimaryView) {
			this.setAsPrimaryView();
		}
	}

	resize() {
		const container = this._canvas?.parentElement;
		const containerParent = container?.parentElement;
		if (container && containerParent) {
			const dim = Math.max(300, Math.min(containerParent.clientWidth, containerParent.clientHeight, 500));
			const dimString = `${dim}px`;
			if (container.style.height === dimString && container.style.width === dimString) {
				return;
			}
			container.style.height = dimString;
			container.style.width = dimString;
			this.renderer?.setSize(dim, dim);
		}
	}

	get canvas() {
		return this._canvas;
	}

	private initControls() {
		if (!this.renderer) return;
		// Controls setup.
		this.controls = new OrbitControls(this.camera, this.renderer?.domElement);
		this.controls.enableKeys = false;
		this.controls.enablePan = false;
		this.controls.enableRotate = false;
		this.controls.zoomSpeed = 0.5;
		this.controls.addEventListener('change', this.onControlsChange);
	}

	private onControlsChange() {
		if (!this.controls) return;
		this.controls.target.x = this.camera.position.x;
		this.controls.target.y = this.camera.position.y;
		this.updateCenterMarkerScale();
		this.render();
	}

	zoomIn() {
		if (this.controls && this.camera.zoom > this.controls?.maxZoom) return;
		this.setZoom(this.camera.zoom * 1.2);
	}

	zoomOut() {
		if (this.controls && this.camera.zoom < this.controls?.minZoom) return;
		this.setZoom(this.camera.zoom * 0.8);
	}

	private updateCenterMarkerScale() {
		const inverseZoom = 1 / this.camera.zoom;
		this.crosshairs.scale.set(inverseZoom, inverseZoom, inverseZoom);
	}

	private setImageDimensions(model: StateJSON) {
		const { imageHeight, imageWidth } = model;
		// Adjust aspect ratio of mesh.
		this.mesh.scale.x = Math.max(1, imageWidth / imageHeight);
		this.mesh.scale.y = Math.max(1, imageHeight / imageWidth);
		// Set max zoom based on mesh size.
		if (this.controls) {
			this.controls.minZoom = 0.75 / Math.max(this.mesh.scale.x, this.mesh.scale.y);
		}
	}
	
	private render() {
		this.renderer?.render(this.scene, this.camera);
	}

	iter(model: StateJSON) {
		const { angle, reverse, paused } = model;
		if (!paused) {
			// Apply rotation.
			this.mesh.rotation.z += RAD_CONVERSION * getSignedAngle(angle, reverse);
			// Animation.
			this.iterFadeAnimation(model);
		}
		this.render();
	}

	private showCrosshairs() {
		this.crosshairsMaterial.opacity = 1;
		this.updateCenterMarkerScale();
	}

	private iterFadeAnimation(model: StateJSON) {
		const { framerate } = model;
		this.crosshairsFadeCounter -= 1;
		if (this.crosshairsFadeCounter < 0) {
			this.crosshairsMaterial.opacity = 0;
			return;
		}
		this.crosshairsMaterial.opacity = Math.min(1, this.crosshairsFadeCounter / framerate);
	}

	private fadeOutCrosshairs(model: StateJSON) {
		const { framerate } = model;
		this.crosshairsMaterial.opacity = 1;
		this.crosshairsFadeCounter = framerate * 1.5;
	}

	setTexture(texture?: Texture) {
		if (!texture) return;
		// Check if texture has actually changed.
		if (texture.image === (this.mesh.material as MeshBasicMaterial).map?.image) return;
		(this.mesh.material as MeshBasicMaterial).map?.dispose();
		(this.mesh.material as MeshBasicMaterial).map = texture.clone();
		// https://www.donmccurdy.com/2020/06/17/color-management-in-threejs/
		(this.mesh.material as MeshBasicMaterial).map!.encoding = sRGBEncoding;
		(this.mesh.material as MeshBasicMaterial).needsUpdate = true;
		this.setTextureFilter(this.textureFilter);
		if (state.paused) this.setCropZoom(state.toJSON());
	}

	private setTextureFilter(textureFilter: TextureFilter) {
		this.textureFilter = textureFilter;
		const texture = (this.mesh.material as MeshBasicMaterial).map;
		if (!texture) return;
		texture.magFilter = textureFilter;
		texture.minFilter = textureFilter;
		texture.needsUpdate = true;
	}

	update(model: StateJSON, prev?: StateJSON) {
		if (model.imageWidth === 0 || model.imageHeight === 0) return;
		if (!prev || (model.imageWidth !== prev.imageWidth) || (model.imageHeight !== prev.imageHeight)) {
			this.setImageDimensions(model);
		}

		// Update center.
		if (!prev || (model.centerX !== prev.centerX) || (model.centerY !== prev.centerY) ||
			(model.imageWidth !== prev.imageWidth) || (model.imageHeight !== prev.imageHeight)) {
			// Reset geometry.
			this.geometry.setAttribute('position', new BufferAttribute(POSITIONS.slice(), 3));
			// Modify geometry center.
			const offsetX = model.centerX / model.imageWidth - 0.5;
			const offsetY = model.centerY / model.imageHeight - 0.5;
			this.geometry.translate(-offsetX, -offsetY, 0);

			if (!model.paused) {
				this.setCropZoom(model); // Fit so no black is showing.
				this.fadeOutCrosshairs(model);
			}
		}

		// Play/pause triggered.
		if (!prev || model.paused !== prev.paused) {
			if (!model.paused) {
				// Hide center marker (with fade).
				this.fadeOutCrosshairs(model);
				if (this.controls) {
					// Disable the controls.
					this.controls.enabled = false;
					// Change filter (use linear filtering for animation rendering).
					this.setTextureFilter(LinearFilter);
				}
			} else {
				// Show center marker.
				this.showCrosshairs();
				if (this.controls) {
					// Enable the controls.
					this.controls.enabled = true;
					// Change filter (show pixelization on zoom in).
					this.setTextureFilter(NearestFilter);
				}
				// Reset the rotation;
				this.mesh.rotation.z = 0;
				
			}
			// Fit so no black is showing.
			this.setCropZoom(model);
		}

		this.render();
	}

	private setCropZoom(model: StateJSON) {
		const { imageWidth, imageHeight } = model;
		const dim = getCropDimensions(model);
		const zoom = Math.min(imageWidth, imageHeight) / dim;
		this.setZoom(zoom);
	}

	private setZoom(zoom: number) {
		if (this.camera.zoom === zoom) return;
		this.camera.zoom = zoom;
		this.camera.updateProjectionMatrix();
		this.updateCenterMarkerScale();
	}

	// Raycasting helper function.
	private getMousePositionInThreeSpace(e: PointerEvent) {
		if (!this.renderer) return;
		const box = this.renderer.domElement.getBoundingClientRect();
		// Calculate mouse position in normalized device coordinates [-1, 1].
		const mouse = new Vector2(
			((e.x - box.left) / box.width) * 2 - 1,
			- ((e.y - box.top) / box.height) * 2 + 1,
		);
		this.raycaster.setFromCamera(mouse, this.camera);
		const intersects = this.raycaster.intersectObject(this.mesh);
		if (intersects.length === 0) return null;
		const { x, y } = intersects[0].point;
		const { scale } = this.mesh;
		return new Vector2(x / scale.x, y / scale.y);
	}

	private enableRaycasting() {
		if (!this.renderer) return;
		const self = this;

		const TAP_DURATION = 150;

		let touches: {[key: string]: {
			startTime: number,
			startX: number,
			startY: number,
			lastX: number,
			lastY: number,
			centerX: number,
			centerY: number,
			isMultitouch: boolean,
			cancelDrag: boolean,
		}} = {};
		this.renderer.domElement.addEventListener('pointerdown', (e: PointerEvent) => {
			if (!state.paused) return; // Only enable when paused.
			touches[e.pointerId] = {
				startTime: performance.now(),
				startX: e.x,
				startY: e.y,
				lastX: e.x,
				lastY: e.y,
				centerX: state.centerX,
				centerY: state.centerY,
				isMultitouch: false,
				cancelDrag: false,
			};
			// Mark as multitouch.
			if (Object.keys(touches).length > 1) {
				Object.keys(touches).forEach(key => {
					touches[key].isMultitouch = true;
				});
			}
		});
		this.renderer.domElement.addEventListener('pointermove', (e: PointerEvent) => {
			if (!state.paused) return; // Only enable when paused.
			const touch = touches[e.pointerId];
			if (!touch) return;
			const { lastX, lastY } = touch;
			touch.lastX = e.x;
			touch.lastY = e.y;
			
			// Check that this is not multitouch.
			if (touch.isMultitouch) {
				return;
			}
			// Check that we haven't already cancelled this drag.
			if (touch.cancelDrag) {
				return;
			}
			// Check that this is a long press.
			if (performance.now() - touch.startTime <= TAP_DURATION) {
				return;
			}
			// Check that this is not a swipe.
			const velX = e.x - lastX;
			const velY = e.y - lastY;
			const velocity = Math.sqrt(velX * velX + velY * velY);
			if (velocity > 25) {
				// Cancel drag.
				touch.cancelDrag = true;
				state.center = [touch.centerX, touch.centerY];
				m.redraw();
				return;
			}

			// On long drags, apply an offset to the center position.
			const diffX = e.x - touch.startX;
			const diffY = e.y - touch.startY;
			const size = new Vector2();
			this.renderer!.getSize(size);
			const viewerDim = size.x;
			const imageDim = Math.max(state.imageHeight, state.imageWidth);
			const zoom = this.camera.zoom;
			const factor = 1 / viewerDim * imageDim / zoom;
			// Convert to change in centerX, centerY.
			const xPixel = Math.round(-diffX * factor + touch.centerX);
			const yPixel = Math.round(diffY * factor + touch.centerY);
			state.center = [xPixel, yPixel];
			m.redraw();
		});
		this.renderer.domElement.addEventListener('pointercancel', (e: PointerEvent) => {
			delete touches[e.pointerId];
		});
		this.renderer.domElement.addEventListener('pointerout', (e: PointerEvent) => {
			delete touches[e.pointerId];
		});
		this.renderer.domElement.addEventListener('pointerup', (e: PointerEvent) => {
			if (!state.paused) return; // Only enable when paused.
			if (e.button !== 0) return; // Only handle left clicks.

			const touch = touches[e.pointerId];
			delete touches[e.pointerId];

			// Don't use multitouch events.
			if (touch.isMultitouch) {
				return;
			}

			// Don't use long presses.
			const duration = performance.now() - touch.startTime;
			if (duration > TAP_DURATION) {
				return;
			}

			// Don't use large deltas.
			const diffX = e.x - touch.startX;
			const diffY = e.y - touch.startY;
			const difference = Math.sqrt(diffX * diffX + diffY * diffY);
			if (difference > 20) {
				return;
			}

			e.preventDefault();
			blurActiveElement();
			const point = self.getMousePositionInThreeSpace(e);
			if (!point) return;
			const { x, y } = point;
			// Convert x/y to px coordinates.
			const xPixel = Math.round(x * state.imageWidth) + state.centerX;
			const yPixel = Math.round(y * state.imageHeight) + state.centerY;
			state.center = [xPixel, yPixel];
			m.redraw();
		});
	}

	setAsPrimaryView() {
		this._isPrimaryView = true;
		if (!this.renderer) return;
		this.initControls();
		this.enableRaycasting();
		this.scene.add(this.crosshairs);
		// Change filter (show pixelization on zoom in).
		if (state.paused) {
			this.setTextureFilter(NearestFilter);
		}
	}

	private exportPrep(model: StateJSON, dimensions: number) {
		if (!this.renderer) throw new Error('ThreeView renderer not inited yet.');
		this.mesh.rotation.z = 0;
		this.update(model);
		this.setCropZoom(model);
		this.renderer.setSize(dimensions, dimensions);
		this.setTextureFilter(LinearFilter);
	}

	async exportAnimation(
		type: ANIMATION_TYPE,
		name: string,
		fullRes: boolean,
		onFramesProgress: (progress: number) => void,
		onExportProgress: (progress: number) => void,
		onExportFinish: () => void,
		onError: (error: any) => void,
		minMP4Length?: number,
	) {
		// Download the full res if needed.
		if (fullRes && state.isDemoFile) {
			await state.loadFullResImage();
			// Force texture reload.
			this.setTexture(state.texture);
		}
		const model = state.toJSON();
		const exportSettings = getExportSettings(model, fullRes);
		this.exportPrep(model, exportSettings.dimensions);
		switch (type) {
			case GIF:
				CanvasCapture.beginGIFRecord({
					name,
					fps: state.framerate,
					quality: 1,
					onExportProgress,
					onExportFinish,
					onError,
				});
				break;
			case MP4:
				// Add more frames if needed.
				if (minMP4Length) {
					const minMP4Frames = minMP4Length * state.framerate;
					const numCopies = Math.ceil(minMP4Frames / exportSettings.totalFrames);
					exportSettings.totalFrames *= numCopies;
				}
				CanvasCapture.beginVideoRecord({
					format: CanvasCapture.MP4,
					fps: state.framerate,
					name,
					quality: 1,
					ffmpegOptions: {
						// Options to help prevent color desaturation.
						// https://medium.com/invideo-io/talking-about-colorspaces-and-ffmpeg-f6d0b037cc2f
						// BT.709 Colour Space
						// TODO: this isn't totally fixing the problem.
						'-vf': 'colorspace=all=bt709',
						// '-pix_fmt': 'yuvj420p',
						'-colorspace': 'bt709',
						'-color_primaries': 'bt709',
						'-color_trc': 'bt709',
						'-color_range': 'pc',
					},
					onExportProgress,
					onExportFinish,
					onError,
				});
				break;
			case FRAMES:
				CanvasCapture.beginPNGFramesRecord({
					name,
					dpi: 72,
					onExportProgress,
					onExportFinish,
					onError,
				});
				break;
			default:
				throw new Error(`Unknown animation type ${type}.`);
		}
		this.iterExport(0, exportSettings, onFramesProgress);
	}

	async getSquareJPEG(model: StateJSON) {
		const dimensions = getSquareDimensions(model);
		this.exportPrep(model, dimensions);
		this.setZoom(Math.min(model.imageWidth, model.imageHeight) / dimensions);
		this.render();
		return new Promise<Blob>((resolve) => {
			CanvasCapture.takeJPEGSnapshot({
				quality: 1,
				onExport: resolve,
			});
		});
	}

	iterExport(
		numFrames: number,
		settings: ExportSettings,
		onProgress?: (progress: number) => void,
	) {
		const { totalFrames, signedAngle } = settings;
		// Apply rotation.
		this.mesh.rotation.z = numFrames * RAD_CONVERSION * signedAngle;
		this.render();
		// Record.
		CanvasCapture.recordFrame();
		numFrames += 1;
		// Update progress.
		if (onProgress) onProgress(numFrames / totalFrames);
		// Either continue stepping through or stop when totalFrames reached.
		if (numFrames < totalFrames) window.requestAnimationFrame(() => {
			this.iterExport(numFrames, settings, onProgress);
		});
		else {
			CanvasCapture.stopRecord();
		}
	}

	dispose() {
		this.controls?.removeEventListener('change', this.onControlsChange);
		this.geometry.dispose();
		(this.mesh.material as MeshBasicMaterial).map?.dispose();
		this.renderer?.dispose();
		this.controls?.dispose();
		this._canvas = undefined;
	}
}