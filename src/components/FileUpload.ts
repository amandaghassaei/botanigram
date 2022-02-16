import { file } from 'jszip';
import m, { VnodeDOM } from 'mithril';
import { state } from '../models/state';
import { showErrorModal } from '../utils';
const UIkit = require('uikit');

const ERROR_MESSAGE = 'Unable to load file, please try again.';

const reader = new FileReader();
reader.onload = onFileLoad;

function initUpload() {
	UIkit.upload('.js-upload', {
		method: () => false,
		multiple: false,
		beforeAll: (el: HTMLElement, files: File[]) => {
			if (files.length === 0) {
				showErrorModal(ERROR_MESSAGE);
				return;
			}
			const file = files[0];
			// Check type.
			if (file.type.indexOf('image') !== 0) {
				showErrorModal(ERROR_MESSAGE);
				return;
			}
			reader.readAsDataURL(files[0]);
		},
	});
}

async function onFileLoad(e: ProgressEvent<FileReader>) {
	const { target } = e;
	if (!target) {
		showErrorModal(ERROR_MESSAGE);
		return;
	}
	const { result } = target; // DataURL.
	if (!result) {
		showErrorModal(ERROR_MESSAGE);
		return;
	}
	if (typeof result === 'string' || result instanceof String) {
		const success = await state.loadImage(result as string, false);
		if (success) state.pause();
	} else {
		showErrorModal(ERROR_MESSAGE);
		return;
	}
}

// Paste image into browser.
document.onpaste = (pasteEvent: ClipboardEvent) => {
	// @ts-ignore
	const { items } = pasteEvent.clipboardData || pasteEvent.originalEvent.clipboardData;
	let blob = null;
	// Find image in paste.
	for (let i = 0; i < items.length; i++) {
		if (items[i].type.indexOf('image') === 0) {
			blob = items[i].getAsFile();
			if (blob) break;
		}
	}
	if (blob === null) {
		return;
	}
	reader.readAsDataURL(blob);
	pasteEvent.preventDefault();
}

export const FileUpload = {
	oncreate() {
		initUpload();
	},
	view() {
		return m('span', { class: 'uk-form-custom' },
			m('input', { class: 'js-upload', type: 'file', multiple: false }),
			m('a', 'select file'),
		);
	},
};



