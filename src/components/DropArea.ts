import m from 'mithril';
import { FileUpload } from './FileUpload';

export function DropArea() {
	return {
		view() {
			return m('div', { class: 'droparea uk-placeholder uk-text-center' },
				m('span', { 'uk-icon': "icon: camera", class: 'uk-margin-small-right' }),
				m('span', { class: 'uk-text-middle' }, ' drag/paste new image or '),
				m('div', { 'uk-form-custom': true },
					m('input', { type: 'file' }),
					m(FileUpload),
				),
			);
		},
	}
}