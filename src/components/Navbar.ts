import m from 'mithril';
import { ExportModal } from './ExportModal';
import { GalleryModal } from './GalleryModal';
import { InstructionsModal } from './InstructionsModal';
import { AboutModal } from './AboutModal';

export const Navbar = {
	view() {
		return [
			m('nav', {
					class: 'uk-navbar-container uk-navbar-transparent',
					'uk-navbar': true,
				},
				m('div', {class: 'uk-navbar-left'}, [
					m('ul', { class: 'uk-navbar-nav' }, 
						m('li', { class: 'uk-active'}, 
							m('a', { href: '#modal-instructions', 'uk-toggle': true}, 'Instructions'),
						),
					),
					m('ul', { class: 'uk-navbar-nav' }, 
						m('li', { class: 'uk-active'}, 
							m('a', { href: '#modal-export', 'uk-toggle': true}, 'Export'),
						),
					),
					m('ul', { class: 'uk-navbar-nav' }, 
						m('li', { class: 'uk-active'}, 
							m('a', { href: '#modal-gallery', 'uk-toggle': true}, 'Submit Image'),
						),
					),
				]),
				m('div', {class: 'uk-navbar-right'}, [
					m('ul', { class: 'uk-navbar-nav' }, 
						m('li', { class: 'uk-active'}, 
							m('a', { href: '#modal-about', 'uk-toggle': true}, 'About'),
						),
					),
				]),
			),
			m(InstructionsModal),
			m(AboutModal),
			m('div', { id: 'modal-error', 'uk-modal': true },
				m('div', { class: 'uk-modal-dialog uk-modal-body' }, [
					m('button', { class: 'uk-modal-close-default', type: 'button', 'uk-close': true, }),
					m('p', { class: 'body uk-text-center' }),
				]),
			),
			m(GalleryModal),
			m(ExportModal),
		];
	}
}