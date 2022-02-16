import { state } from './state';
import { ThreeView } from './ThreeView';
import m from 'mithril';

export const primaryThreeView = new ThreeView();
primaryThreeView.setAsPrimaryView();
function resize() {
	primaryThreeView.resize();
	m.redraw();
}
window.addEventListener('resize', resize);
window.addEventListener('load', resize);

export const exportThreeView = new ThreeView();

let timer: NodeJS.Timeout;

// Main animation loop.
function loop() {
	const model = state.toJSON();
	const { framerate } = model;
	timer = setTimeout(loop, 1000 / framerate);
	primaryThreeView.iter(model);
}

export function startApp() {
	loop();
}