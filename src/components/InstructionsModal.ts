import m from 'mithril';
// @ts-ignore
import md from '../markdown/instructions.md';

// Enable modal links.
let md_edited = md.replace(/<a href="#modal-gallery"/g, '<a href="#modal-gallery" uk-toggle');
// Edit image paths.
md_edited = md_edited.replace(/https:\/\/raw.githubusercontent.com\/amandaghassaei\/botanigram\/main\//g, '');

const videoHTML = `
<div class="intro-video-wrapper">
	<video
		id="intro-video-2"
		class="video-js"
		controls
		aspectRatio="1:1"
		fluid
		preload="auto"
		width="600"
		height="600"
		poster="docs/intro_video_cover.jpg"
		data-setup="{}"
	>
		<source src="docs/intro-small.mp4" type="video/mp4" />
		<p class="vjs-no-js">
		To view this video please enable JavaScript, and consider upgrading to a
		web browser that
		<a href="https://videojs.com/html5-video-support/" target="_blank"
			>supports HTML5 video</a
		>
		</p>
	</video>
</div>`;

md_edited = videoHTML + md_edited;

const instructionsHTML = m.trust(md_edited);

export const InstructionsModal = {
	view() {
		return m('div', { id: 'modal-instructions', 'uk-modal': true },
			m('div', { class: 'uk-modal-dialog uk-modal-dialog-large uk-modal-body' }, [
				m('button', { class: 'uk-modal-close-default', type: 'button', 'uk-close': true, }),
				m('h2', { class: 'uk-modal-title', }, 'Instructions'),
				instructionsHTML,
				m('br'),
			]),
		);
	},
}