import m from 'mithril';
// @ts-ignore
import _welcomeHTML from '../markdown/welcome.md';
const welcomeHTML = m.trust(_welcomeHTML);

export const WelcomeModal = {
	view() {
		return m('div', { id: 'modal-welcome', class: 'uk-modal-full uk-open', 'uk-modal': true, },
			m('div', { class: 'uk-modal-dialog' }, [
				m('button', { class: 'uk-modal-close-full uk-close-large', type: 'button', 'uk-close': true, }),
				m('div', { class: 'welcome-wrapper'}, [
					m('div', { id: 'welcome-video'},
						m('div', { class: 'welcome-iframe-wrapper' },
							m('div', { style: 'padding:100% 0 0 0;position:relative;'},
								m('iframe', { src: 'https://player.vimeo.com/video/677916478?h=0574e5cbd6&loop=1&title=0&byline=0&portrait=0', style: 'position:absolute;top:0;left:0;width:100%;height:100%;', frameborder: '0', allow: 'autoplay; fullscreen; picture-in-picture', allowfullscreen: true }),
							),
						),
					),
					m('div', { id: 'welcome-text'},
						m('h1', { class: 'uk-modal-title', }, 'BOTANIGRAM'),
						welcomeHTML,
						m('button', { class: 'uk-button uk-button-primary uk-modal-close' }, 'START THE APP',
							m('span', { class: 'uk-margin-small-left', 'uk-icon': 'chevron-double-right' }),
						),
					),
				]),
			]),
		);
	},
}