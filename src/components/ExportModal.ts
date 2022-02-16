import classNames from 'classnames';
import * as CanvasCapture from 'canvas-capture';
import m from 'mithril';
import { state } from '../models/state';
import { ANIMATION_TYPE, FRAMES, GIF, MP4 } from '../utils';
import { AnimationViewer } from './AnimationViewer';
import { exportThreeView } from '../models/globals';
import { NumberInput } from './NumberInput';

const ANIMATION_DROPDOWN = [
	{ value: GIF, title: 'Animated GIF', warning: 'Chrome/Firefox on Desktop' },
	{ value: MP4, title: 'MP4 Video', hint: 'works best in Chrome', warning: 'Chrome on Desktop' },
	{ value: FRAMES, title: 'PNG Frames' },
];

const DEFAULT_TITLE = 'My-Animation';

export function ExportModal() {
	let typeIndex = 0;
	let exportAtFullRes = false;
	let isExporting = false;
	let isGeneratingFrames = false;
	let isWritingFile = false;
	let exportProgress = 0;
	let exportError: string | undefined;
	let minMP4Length = 10;

	const mp4Supported = CanvasCapture.browserSupportsMP4();
	const gifSupported = CanvasCapture.browserSupportsGIF();

	function resetExportProgressIndicators() {
		isExporting = false;
		exportProgress = 0;
		isGeneratingFrames = false;
		isWritingFile = false;
	}

	function beforeShow() {
		// resetExportProgressIndicators();
		exportError = undefined;
	}

	const animationViewer = AnimationViewer(exportThreeView);
	
	function changeType(e: InputEvent) {
		typeIndex = (e.target as HTMLSelectElement).selectedIndex;
	}

	function changeTitle(e: InputEvent) {
		state.title = (e.target as HTMLInputElement).value;
	}

	function changeExportFullRes(e: InputEvent) {
		exportAtFullRes = (e.target as HTMLInputElement).checked;
	}

	function changeMinMP4Length(length: number) {
		minMP4Length = length;
	}

	function exportAnimation(e: Event) {
		e.preventDefault();
		resetExportProgressIndicators();
		exportError = undefined;
		isExporting = true;
		isGeneratingFrames = true;
		const type = ANIMATION_DROPDOWN[typeIndex].value as ANIMATION_TYPE;
		exportThreeView.exportAnimation(
			type,
			(!state.title || state.title === '') ? DEFAULT_TITLE : state.title,
			exportAtFullRes,
			onFramesProgress,
			onExportProgress,
			onExportFinish,
			onError,
			type === MP4 ? minMP4Length : undefined,
		);
	}

	function onFramesProgress(progress: number) {
		exportProgress = progress / 2; // First half of progress bar.
		if (progress === 1) {
			isGeneratingFrames = false;
			isWritingFile = true;
		}
		m.redraw();
	}

	function onExportProgress(progress: number) {
		exportProgress = 0.5 + progress / 2; // Second half of progress bar.
		if (progress === 1) {
			isWritingFile = false;
		}
		m.redraw();
	}
	
	function onExportFinish() {
		resetExportProgressIndicators();
		m.redraw();
	}

	function onError(error: any) {
		resetExportProgressIndicators();
		exportError = error.message || 'Export error, please try again in Chrome on desktop.';
		m.redraw();
	}

	function exportButtonText() {
		return isExporting ? 'Exporting...' : 'Export ' + ANIMATION_DROPDOWN[typeIndex].title;
	}

	return {
		oncreate() {
			CanvasCapture.init(
				document.getElementById('export-animation-viewer-canvas') as HTMLCanvasElement,
				{
					ffmpegCorePath: './dependencies/ffmpeg-core.js',
				});
		},
		view() {
			return [
				m('div', {
						id: 'modal-export',
						'uk-modal': true,
						onbeforeshow: beforeShow,
					},
					m('div', { class: 'uk-modal-dialog uk-modal-body' }, [
						m('button', { class: 'uk-modal-close-default', type: 'button', 'uk-close': true, }),
						m('h2', { class: 'uk-modal-title', }, 'Export'),
						m('form', { class: 'uk-form-horizontal uk-margin' },
							m('p', 'Export a perfectly looped animation as GIF, MP4 video, or PNG frames.'),
							m('div', { class: 'uk-margin' },
								m('label', { class: 'uk-form-label', for: 'export-title' }, 'Title'),
								m('div', { class: 'uk-form-controls' },
									m('input', {
										class: 'uk-input',
										id: 'export-title',
										type: 'text',
										placeholder: DEFAULT_TITLE,
										disabled: isExporting,
										value: state.title,
										oninput: changeTitle,
									}),
								),
							),
							m('div', { class: 'uk-margin' },
								m('label', { class: 'uk-form-label', for: 'export-type' }, 'Export As'),
								m('div', { class: 'uk-form-controls' },
									m('select', {
											class: 'uk-select',
											id: 'export-type',
											selectedIndex: typeIndex,
											disabled: isExporting,
											onchange: changeType,
										}, ANIMATION_DROPDOWN.map(type => {
											let { value, title, warning, hint } = type;
											let disabled = false;
											if ((value === GIF && !gifSupported) || (value === MP4 && !mp4Supported)) {
												title += ` (${warning})`;
												disabled = true;
											} else if (hint) {
												title += ` (${hint})`;
											}
											return m('option', { value, key: value, disabled }, title);
										})),
								),
							),
							m('div', { class: 'uk-margin' },
								m('label', { class: 'uk-form-label', for: 'export-full-res' }, 'Full Resolution (slower)'),
								m('div', { class: 'uk-form-controls' },
									m('input', {
										id: 'export-full-res',
										class: 'uk-checkbox',
										type: 'checkbox',
										disabled: isExporting,
										checked: exportAtFullRes,
										oninput: changeExportFullRes,
									}),
								),
							),
							m('div', { class: classNames('uk-margin', { 'uk-hidden': ANIMATION_DROPDOWN[typeIndex].value !== MP4 }) },
								m('label', { class: 'uk-form-label', for: 'export-minMP4Length' }, 'Minimum Length (seconds)'),
								m('div', { class: 'uk-form-controls' },
									m(NumberInput, {
										class: 'uk-input',
										id: 'export-minMP4Length',
										min: 0,
										max: 30,
										step: 1,
										disabled: isExporting,
										value: minMP4Length,
										oninput: changeMinMP4Length,
										'uk-tooltip': 'title: Looped videos are typically only 3 seconds long, use this number to increase the duration of the video.  Use 0 to export shortest possible video.;delay: 100',
									}),
								),
							),
						),
						m('div', { class: classNames('progress-indicators', { 'uk-hidden': !isExporting })}, [
							m('label', { class: classNames('uk-form-label', { 'uk-hidden': !isGeneratingFrames }) }, 'Generating Frames...'),
							m('label', { class: classNames('uk-form-label', { 'uk-hidden': !isWritingFile }) }, `Exporting ${ANIMATION_DROPDOWN[typeIndex].title}...`, m('br'), `May take a minute, OK to close this dialog in the meantime.`),
							m('progress', { class: classNames('uk-progress', { 'uk-hidden': !isExporting }), value: exportProgress, max: '1' }),
						]),
						m('p', { class: classNames('export-error', { 'uk-hidden': !exportError }) }, exportError),
						m('div', { class: 'modal-footer' },
							m('button', { class: classNames('uk-button uk-align-left uk-modal-close', { 'uk-hidden': isExporting }), type: 'button' }, 'Cancel'),
							m('button', {
									class: 'uk-button uk-button-primary uk-align-right',
									type: 'button',
									onclick: exportAnimation,
									disabled: isExporting,
								}, exportButtonText()),
						),
					]),
				),
				m(animationViewer, {
					id: 'export-animation-viewer',
					model: state.toJSON(),
				}),
			];
		},
	};
}