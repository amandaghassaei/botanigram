import classNames from 'classnames';
import m, { Vnode, VnodeDOM } from 'mithril';

type ButtonWithLongPressAttributes = { [key: string]: any } & {
	onhold: () => void,
	onpointerup?: (e: Event) => void,
	onpointerdown?: (e: Event) => void,
	onpointerout?: (e: Event) => void,
};

export function ButtonWithLongPress() {
	let timer: ReturnType<typeof setTimeout> | undefined = undefined;
	let callback: (() => void) | undefined = undefined;

	function onpointerdown() {
		timer = setTimeout(hold, 500);
	}

	function hold() {
		if (callback) callback();
		timer = setTimeout(hold, 100);
	}

	function release () {
		if (timer) clearTimeout(timer);
		timer = undefined
	}

	function stopPropagation(e: Event) {
		// Disable context menu on long presses.
		e.preventDefault();
		e.stopPropagation();
		e.cancelBubble = true;
		// e.returnValue = false;
	}

	return {
		oncreate(vnode: VnodeDOM<ButtonWithLongPressAttributes>) {
			callback = vnode.attrs.onhold;
		},
		onbeforeremove() {
			release();
			callback = undefined;
		},
		view(vnode: Vnode<ButtonWithLongPressAttributes>) {
			return m('button', {
				...vnode.attrs,
				class: classNames('noselect nodoubletap', vnode.attrs.class),
				oncontextmenu: (e: Event) => {
					// Disable context menu on long presses.
					e.preventDefault();
					return false;
				},
				onpointerup: (e: Event) => {
					if (vnode.attrs.onpointerup) vnode.attrs.onpointerup(e);
					release();
					stopPropagation(e);
				},
				onpointerdown: (e: Event) => {
					if (vnode.attrs.onpointerdown) vnode.attrs.onpointerdown(e);
					onpointerdown();
					stopPropagation(e);
				},
				onpointerout: (e: Event) => {
					if (vnode.attrs.onpointerout) vnode.attrs.onpointerout(e);
					release();
					stopPropagation(e);
				},
			}, vnode.children);
		},
	};
}