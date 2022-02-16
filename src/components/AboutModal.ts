import m from 'mithril';
// @ts-ignore
import md from '../markdown/about.md';

const aboutHTML = m.trust(md);

export const AboutModal = {
	view() {
		return m('div', { id: 'modal-about', 'uk-modal': true },
			m('div', { class: 'uk-modal-dialog uk-modal-dialog-large uk-modal-body' }, [
				m('button', { class: 'uk-modal-close-default', type: 'button', 'uk-close': true, }),
				m('h2', { class: 'uk-modal-title', }, 'About'),
				aboutHTML,
				m('br'),
			]),
		);
	},
}