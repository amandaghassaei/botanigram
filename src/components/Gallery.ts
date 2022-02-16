import m, { VnodeDOM } from 'mithril';
// @ts-ignore
import infinite from 'mithril-infinite';
import { state, StateJSON } from '../models/state';
import { blurActiveElement } from '../utils';
// @ts-ignore
import scrollToWithAnimation from 'scrollto-with-animation';
// @ts-ignore
import examples from '../../data/Examples.tsv';

type File = {
	title: string,
	author: string,
	json: StateJSON,
	imageURL: string,
	thumbURL: string,
}

async function openFile(e: Event, json: StateJSON, imageURL: string) {
	e.preventDefault();
	blurActiveElement();
	const success = await state.loadImage(imageURL, true);
	if (success) state.setJSON(json);
}

const loadImage = (el: HTMLElement, url: string, title: string) => {
	let img = new Image();
	const populate = () => {
		el.style.backgroundImage = `url(${url})`;
		el.classList.add('uk-animation-fade'); // Fade in.
	};
	img.crossOrigin = 'anonymous';
	img.onload = populate;
	img.alt = title,
	img.src = url;
};
  
const maybeLoadImage = (vnode: VnodeDOM<{}, {inited: boolean}>, file: File) => {
	if (vnode.state.inited) {
		return;
	}
	const container = vnode.dom.parentElement?.parentElement?.parentElement?.parentElement;
	// console.log(infinite.isElementInViewport({ el: container }));
	if (container === undefined || infinite.isElementInViewport({ el: container })) {
		loadImage(vnode.dom as HTMLElement, file.thumbURL, file.title);
		vnode.state.inited = true;
	}
};

const GalleryItem = (file: File) => {
	return m('li', { class: 'gallery-item-wrapper' },
		m('a', {
			href: '#',
			onclick: (e: Event) => openFile(e, file.json, file.imageURL),
		},
			m('div', { class: 'gallery-item-image-wrapper' },
				m('div', { class: 'spinner uk-preserve', 'uk-spinner': true }),
				m('.image-container', {
						oncreate: (vnode) => maybeLoadImage(vnode as any, file),
					}),
				m('div', { class: 'uk-overlay uk-position-cover' },
					m('span', file.title),
				),
			),
		),
	);
};

function getImageURL(uuid: string, name: string, local?: boolean) {
	const base = local ? '' : process.env.REMOTE_URL; 
	return `${base}data/${uuid}-${name}.jpg`;
}

const NUM_FILES_TO_FETCH = 27;

export function Gallery() {
	let noMoreFiles = false;

	function handleFiles(values?: string[][], local?: boolean) {
		if (!values || values.length < NUM_FILES_TO_FETCH) noMoreFiles = true;
		const files: File[] = [];
		if (!values) return files;
		for (let i = 0; i < values.length; i++) {
			const data = values[i];
			const title = data[0];
			const json = JSON.parse(data[5]);
			json.title = title;
			const file = {
				title,
				author: data[1],
				json,
				imageURL: getImageURL(json.uuid, '900', local),
				thumbURL: getImageURL(json.uuid, '300', local),
			};
			files.push(file);
		}
		return files;
	}

	async function getValues(pageNum: number) {
		if (pageNum === 1) {
			// Load local examples.
			return handleFiles(examples, true);
		}
		return [];
		// return new Promise<File[]>((resolve, reject) => {
		// 	const start = (pageNum - 2) * NUM_FILES_TO_FETCH;
		// 	const id = process.env.SHEET_ID;
		// 	const key = process.env.GOOGLE_API_KEY;
		// 	const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/Sheet1!A${start + 2}:H${start + 1 + NUM_FILES_TO_FETCH}?key=${key}`;
		// 	const xhr = new XMLHttpRequest();
		// 	xhr.onreadystatechange = () => {
		// 		if (xhr.readyState == 4 && xhr.status == 200) {
		// 			try {
		// 				resolve(handleFiles(JSON.parse(xhr.responseText).values || []));
		// 			} catch (error) {
		// 				console.log(error);
		// 				console.warn('Unable to talk to server.');
		// 				// TODO: handle this.
		// 				reject(error);
		// 			}
		// 		}
		// 	};
		// 	xhr.open("GET", url, true);
		// 	xhr.send();
		// });
	}

	function getItemSize() {
		return 150 + 10;// values from CSS including margins
	}

	function getPageSize(content: any) {
		return (content.length !== undefined ? content.length : NUM_FILES_TO_FETCH) * getItemSize();
	}

	function previous(e: Event) {
		e.preventDefault();
		page(-1);
	}
	function next(e: Event) {
		e.preventDefault();
		page(1);
	}
	function page(offset: number) {
		// Calculate page amount.
		const container = (document.getElementsByClassName('mithril-infinite__scroll-view')[0] as HTMLDivElement);
		let scrollOffset = Math.floor((container.scrollLeft + offset * container.clientWidth) / getItemSize()) * getItemSize();
		if (scrollOffset < 0) scrollOffset = 0;
		scrollToWithAnimation(
			container,
			'scrollLeft',
			scrollOffset,
			500,
			'easeInOutCirc',
		);
	}

	return {
		view() {
			return m('div', { id: 'gallery-wrapper' },
				m(infinite, {
					maxPages: 16,
					item: GalleryItem,
					pageData: getValues,
					class: "horizontal",
					id: 'scroll-container',
					axis: "x",
					pageSize: getPageSize,
				}),
				m('a', {
					href: "#",
					'uk-slidenav-previous': true,
					onclick: previous,
				}),
				m('a', {
					href: "#",
					'uk-slidenav-next': true,
					onclick: next,
				}),
			);
		},
	};
};
