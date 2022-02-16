import { saveAs } from 'file-saver';
import { compress, EImageType } from 'image-conversion';
import m from 'mithril';
import { exportThreeView } from './models/globals';
import { state } from './models/state';
import { blurActiveElement, inputIsFocused } from './utils';

window.addEventListener('keydown', async (e) => {
	let handled = false;
	switch (e.key) {
		case 'Escape':
			blurActiveElement();
			handled = true;
			break;
	}

	// Below hotkeys only work when input is not in focus.
	if (inputIsFocused()) return;

	switch (e.key) {
		case ' ':
			state.paused ? state.play() : state.pause();
			handled = true;
			break;
		case 'ArrowRight':
			state.centerX = state.centerX + 1;
			handled = true;
			break;
		case 'ArrowLeft':
			state.centerX = state.centerX - 1;
			handled = true;
			break;
		case 'ArrowUp':
			state.centerY = state.centerY + 1;
			handled = true;
			break;
		case 'ArrowDown':
			state.centerY = state.centerY - 1;
			handled = true;
			break;
		case 'p':
			// Secret hotkey to save full res image.
			await state.loadFullResImage();
			// Force texture reload.
			exportThreeView.setTexture(state.texture);
			const cropFullRes = await exportThreeView.getSquareJPEG(state.toJSON());
			const squareCrop = await compress(cropFullRes, {
				quality: 1,
				type: EImageType.JPEG,
			});
			saveAs(squareCrop, `${state.title || 'Square_Crop'}.jpg`);
	}

	if (handled) {
		m.redraw();
		e.preventDefault();
	}
});

