import m from 'mithril';
// @ts-ignore
import md from '../markdown/instructions.md';

// Enable modal links.
const md_edited = md.replace(/<a href="#modal-gallery"/g, '<a href="#modal-gallery" uk-toggle');

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