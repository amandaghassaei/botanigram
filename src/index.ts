const UIkit = require('uikit');
const Icons = require('uikit/dist/js/uikit-icons');
import './components/App';
import './hotkeys';
import { state } from './models/state';
import { startApp } from './models/globals';
import LazyLoad from 'vanilla-lazyload';
// @ts-ignore
import examples from '../data/Examples.tsv';

// Loads the Icon plugin
UIkit.use(Icons);

// Show welcome modal.
UIkit.modal(document.getElementById('modal-welcome')!).show();

// // Load starting image.
const json = JSON.parse(examples[12][5]);
const imageURL = `data/${json.uuid}-${900}.jpg`;
state.loadImage(imageURL, true).then(() => state.setJSON(json));

startApp();

// Lazy load images.
new LazyLoad();

function setViewport() {
	const mvp = document.getElementById('viewport');
	if (screen.width < 500) {
		mvp!.setAttribute('content','width=500');
	} else {
		mvp!.setAttribute('content','width=device-width, initial-scale=1');
	}
}

window.addEventListener('load', setViewport);
window.addEventListener('resize', setViewport);