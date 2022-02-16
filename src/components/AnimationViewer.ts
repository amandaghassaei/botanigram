import classNames from 'classnames';
import m, { Vnode, VnodeDOM } from 'mithril';
import { state, State, StateJSON } from '../models/state';
import { ThreeView } from '../models/ThreeView';
import { blurActiveElement } from '../utils';
import { AnimationControls } from './AnimationControls';

type AnimationViewerAttributes = {
	id: string,
	classes?: string,
	model: StateJSON,
}

export function AnimationViewer(_threeView: ThreeView,) {
	let threeView: ThreeView | undefined = _threeView;
	let lastState: StateJSON | undefined;

	function zoomIn(e: Event) {
		e.preventDefault();
		blurActiveElement();
		threeView?.zoomIn();
	}

	function zoomOut(e: Event) {
		e.preventDefault();
		blurActiveElement();
		threeView?.zoomOut();
	}

	return {
		oncreate(vnode: VnodeDOM<AnimationViewerAttributes>) {
			const canvas = vnode.dom.querySelector('canvas') as HTMLCanvasElement;
			threeView!.canvas = canvas;
			threeView!.setTexture(state.texture);
		},
		onremove() {
			if (!_threeView) {
				threeView?.dispose();
			}
			if (threeView) {
				threeView.canvas = undefined;
				threeView = undefined;
			}
		},
		onupdate(vnode: Vnode<AnimationViewerAttributes>) {
			const { model } = vnode.attrs;
			threeView?.setTexture(state.texture);
			// Update threeview.
			threeView?.update(model, lastState);
			if ((model as State).toJSON) lastState = (model as State).toJSON();
			else lastState = model;
		},
		view(vnode: Vnode<AnimationViewerAttributes>) {
			const { id, classes } = vnode.attrs;
			return m('div', {
					class: classNames('animation-viewer-wrapper', classes),
					id,
				},
				m('canvas', { id: id + '-canvas'}),
				m(AnimationControls, { zoomIn, zoomOut}),
			);
		},
	};
}