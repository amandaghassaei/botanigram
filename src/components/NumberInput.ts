import classNames from 'classnames';
import m, { Vnode, VnodeDOM } from 'mithril';
import { Event } from 'three';
import { blurActiveElement } from '../utils';
import { ButtonWithLongPress } from './ButtonWithLongPress';

type NumberInputAttributes = {
	class?: string,
	id?: string,
	min?: number,
	max?: number,
	step?: number,
	placeholder?: string,
	oninput?: (value: number) => void,
	onchange?: (value: number) => void,
	value?: number,
	disabled?: boolean,
	'uk-tooltip'?: string,
}

export function NumberInput() {
	let value: number | undefined = 0;
	let dom: HTMLDivElement | undefined = undefined;
	// TODO: make a click and hold button count as many presses.

	function getValue(e: InputEvent) {
		// Check if eval works.
		const val = (e.target as HTMLInputElement).value;
		// const evaled = eval(val);
		if (val === '') value = undefined; // Handle empty string case.
		const newVal = parseFloat(val);
		if (Number.isNaN(newVal)) return;
		value = newVal;
		return value;
	}

	function increment(e?: Event, oninput?: (value: number) => void, onchange?: (value: number) => void, max?: number, step?: number) {
		e?.preventDefault();
		if (max !== undefined && value === max) return;
		if (value === undefined) {
			value = 0;
		}
		value += (step || 1);
		m.redraw();
		if (oninput) oninput(value);
		if (onchange) onchange(value);
	}

	function decrement(e?: Event, oninput?: (value: number) => void, onchange?: (value: number) => void, min?: number, step?: number) {
		e?.preventDefault();
		if (min !== undefined && value === min) return;
		if (value === undefined) {
			value = 0;
		}
		value -= (step || 1);
		m.redraw();
		if (oninput) oninput(value);
		if (onchange) onchange(value);
	}

	return {
		oncreate(vnode: VnodeDOM<NumberInputAttributes>) {
			value = vnode.attrs.value || value;
			dom = vnode.dom as HTMLDivElement;
		},
		onbeforeupdate(vnode: Vnode<NumberInputAttributes>) {
			if (document.activeElement && document.activeElement.parentElement === dom) return;
			value = vnode.attrs.value || value;
		},
		onbeforeremove() {
			dom = undefined;
		},
		view(vnode: Vnode<NumberInputAttributes>) {
			return m('div', { class: 'number-input uk-button-group', id: vnode.attrs.id, 'uk-tooltip': vnode.attrs['uk-tooltip'] }, [
				m(ButtonWithLongPress, {
						class: 'uk-button uk-button-default',
						onhold: () => decrement(undefined, vnode.attrs.oninput, vnode.attrs.onchange, vnode.attrs.min, vnode.attrs.step),
						onpointerdown: (e: Event) => decrement(e, vnode.attrs.oninput, vnode.attrs.onchange, vnode.attrs.min, vnode.attrs.step),
						onclick: (e: Event) => {
							e.preventDefault();
							blurActiveElement();
						},
						disabled: vnode.attrs.disabled,
					},
					m('span', { 'uk-icon': 'chevron-left' }),
				),
				m('input', {
					class: classNames('uk-input', vnode.attrs.class),
					type: 'number',
					min: vnode.attrs.min,
					max: vnode.attrs.max,
					step: vnode.attrs.step,
					value: value === undefined ? '' : value,
					placeholder: vnode.attrs.placeholder,
					disabled: vnode.attrs.disabled,
					oninput: (e: InputEvent) => { if (vnode.attrs.oninput && getValue(e) !== undefined) vnode.attrs.oninput(getValue(e)!); },
					onchange: (e: InputEvent) => { if (vnode.attrs.onchange && getValue(e) !== undefined) vnode.attrs.onchange(getValue(e)!); },
				}),
				m(ButtonWithLongPress, {
						class: 'uk-button uk-button-default',
						onhold: () => increment(undefined, vnode.attrs.oninput, vnode.attrs.onchange, vnode.attrs.max, vnode.attrs.step),
						onpointerdown: (e: Event) => increment(e, vnode.attrs.oninput, vnode.attrs.onchange, vnode.attrs.max, vnode.attrs.step),
						onclick: (e: Event) => {
							e.preventDefault();
							blurActiveElement();
						},
						disabled: vnode.attrs.disabled,
					},
					m('span', { 'uk-icon': 'chevron-right' }),
				),
			]);
		},
	};
}