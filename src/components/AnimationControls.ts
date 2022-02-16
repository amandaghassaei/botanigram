import classNames from 'classnames';
import m, { Vnode } from 'mithril';
import { state } from '../models/state';

type AnimationControlsAttributes = {
	zoomIn: (e: Event) => void,
	zoomOut: (e: Event) => void,
}

export function AnimationControls() {
	return {
		view(vnode: Vnode<AnimationControlsAttributes>) {
			return m('div', { class: classNames('animation-controls-wrapper', { 'uk-hidden': !state.paused }) },
				m('ul', { class: 'uk-iconnav' },
					m('li',
						m('a', {
							href: '#',
							'uk-icon': 'icon: plus',
							onclick: vnode.attrs.zoomIn,
							'uk-tooltip': 'title: Zoom In;delay: 1000',
						}),
					),
					m('li',
						m('a', {
							href: '#',
							'uk-icon': 'icon: minus',
							onclick: vnode.attrs.zoomOut,
							'uk-tooltip': 'title: Zoom Out;delay: 1000',
						}),
					),
				),
			);
		},
	};
};