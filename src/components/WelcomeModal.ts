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
						m('div', { class: 'welcome-video-wrapper intro-video-wrapper' },
							m('video', { id: 'intro-video-1', class: 'video-js', aspectRatio: '1:1', fluid: true, autoplay: true, controls: true, preload: 'auto', width: '600', height: '600', loop: true, poster: 'docs/intro_video_cover.jpg', 'data-setup': '{}' },
								m('source', { src: 'docs/intro-small.mp4', type: 'video/mp4' }),
								m('p', { class: 'vjs-no-js' }, 'To view this video please enable JavaScript, and consider upgrading to a web browser that ',
									m('a', { href: 'https://videojs.com/html5-video-support/', target: '_blank' }, 'supports HTML5 video'),
								),
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