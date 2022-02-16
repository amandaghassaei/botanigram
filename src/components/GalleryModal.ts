import classNames from 'classnames';
import JSZip from 'jszip';
import m from 'mithril';
import { allCountries, CountrySlug, RegionSlug } from 'country-region-data';
import { v4 as uuidv4 } from 'uuid';
import { saveAs } from 'file-saver';
import { exportThreeView } from '../models/globals';
import { state } from '../models/state';
import { canvastoFile, compress, compressAccurately, EImageType, imagetoCanvas } from 'image-conversion';
import { Event } from 'three';
import { getSquareDimensions } from '../utils';

const MAIN_IMAGE_SIZE = 900;
const THUMB_SIZE = 300;

export function GalleryModal() {
	let title = '';
	let name = '';
	let ig = '';
	let twitter = '';
	let ownsImage = false;
	let givesPermission = false;
	let latinName = '';
	let commonName = '';
	let tags = '';
	let givingEmailInstructions = false;
	let zippingProgress = 0;
	let isZipping = false;
	let imageTooSmall = false;
	let city = '';
	let countryIndex = allCountries.length;
	let regionIndex: number | undefined = undefined;

	function resetModalState() {
		givingEmailInstructions = false
		isZipping = false;
		zippingProgress = 0;
		ownsImage = false;
		givesPermission = false;
	}

	function onBeforeShow() {
		resetModalState();
		const dimensions = getSquareDimensions(state);
		if (dimensions < MAIN_IMAGE_SIZE) {
			imageTooSmall = true;
		}
	}

	function changeTitle(e: InputEvent) {
		title = (e.target as HTMLInputElement).value;
	}

	function changeName(e: InputEvent) {
		name = (e.target as HTMLInputElement).value;
	}

	function changeIG(e: InputEvent) {
		ig = (e.target as HTMLInputElement).value;
	}

	function changeTwitter(e: InputEvent) {
		twitter = (e.target as HTMLInputElement).value;
	}

	function changeOwnership(e: InputEvent) {
		ownsImage = (e.target as HTMLInputElement).checked;
	}

	function changePermission(e: InputEvent) {
		givesPermission = (e.target as HTMLInputElement).checked;
	}

	function changeLatinName(e: InputEvent) {
		latinName = (e.target as HTMLInputElement).value;
	}

	function changeCommonName(e: InputEvent) {
		commonName = (e.target as HTMLInputElement).value;
	}

	function changeTags(e: InputEvent) {
		tags = (e.target as HTMLInputElement).value;
	}

	function changeCity(e: InputEvent) {
		city = (e.target as HTMLInputElement).value;
	}

	function changeRegionIndex(e: InputEvent) {
		regionIndex = (e.target as HTMLSelectElement).selectedIndex;
	}

	function changeCountryIndex(e: InputEvent) {
		const newIndex = (e.target as HTMLSelectElement).selectedIndex;
		if (newIndex !== countryIndex) {
			regionIndex = undefined;
			countryIndex = newIndex;
		}
	}

	function canSubmit() {
		return imageIsValid() && ownsImage && givesPermission && title !== '';
	}

	function imageIsValid() {
		return !imageTooSmall && !state.isDemoFile;
	}

	function removeAt(handle: string) {
		return handle.replace('@', '').replace(/\s+/g, '');
	}

	async function submit(e: Event) {
		e.preventDefault();
		if (!canSubmit()) return;
		// Show user info about emailing zip.
		givingEmailInstructions = true;
		isZipping = true;
		zippingProgress = 0;
		const NUM_ZIP_STEPS = 5;

		const json = state.toJSON();
		const uuid = uuidv4();
		// @ts-ignore
		json.uuid = uuid;
		// @ts-ignore
		delete json.paused;
		// @ts-ignore
		delete json.framerate;

		const countrySlug = allCountries[countryIndex] ? allCountries[countryIndex][1] : undefined;
		const regionSlug = (regionIndex && countrySlug) ? allCountries[countryIndex][2][regionIndex][1] : undefined;

		const items = [
			title,
			name,
			latinName,
			commonName,
			tags,
			JSON.stringify(json),
			countrySlug,
			regionSlug,
			city,
			removeAt(ig),
			removeAt(twitter),
			`${ownsImage}`,
			`${givesPermission}`,
		];

		const tsv = items.join('\t');
		zippingProgress = 1 / NUM_ZIP_STEPS;
		m.redraw();

		// Prep images.
		// Convert image at full res to jpeg, removing all metadata.
		const { image } = state.texture!;
		const canvas = await imagetoCanvas(image, {
			width: json.imageWidth,
			height: json.imageHeight,
		});
		// @ts-ignore
		const file = await canvastoFile(canvas, 1, 'image/jpeg');
		const orig = await compressAccurately(file, 1000)
		zippingProgress = 2 / NUM_ZIP_STEPS;
		m.redraw();
		const cropFullRes = await exportThreeView.getSquareJPEG(state.toJSON());
		const squareCrop = await compress(cropFullRes, {
			quality: 0.7,
			type: EImageType.JPEG,
			width: MAIN_IMAGE_SIZE,
			height: MAIN_IMAGE_SIZE,
		});
		zippingProgress = 3 / NUM_ZIP_STEPS;
		m.redraw();
		const thumb = await compress(cropFullRes, {
			quality: 0.7,
			type: EImageType.JPEG,
			width: THUMB_SIZE,
			height: THUMB_SIZE,
		});
		zippingProgress = 4 / NUM_ZIP_STEPS;
		m.redraw();

		// Zip it all together.
		const zip = new JSZip();
		zip.file(`${title}.tsv`, tsv);
		zip.file(`${uuid}-orig.jpg`, orig);
		zip.file(`${uuid}-${MAIN_IMAGE_SIZE}.jpg`, squareCrop);
		zip.file(`${uuid}-${THUMB_SIZE}.jpg`, thumb);
		zip.generateAsync({ type: 'blob' }).then((content) => {
			saveAs(content, `${title}.zip`);
			zippingProgress = 1;
			isZipping = false;
			m.redraw();
		});
	}

	function getCountryOptions() {
		const options = allCountries.map(country => {
			let [ countryName, CountrySlug ] = country;
			return m('option', { value: CountrySlug, key: CountrySlug }, countryName);
		});
		options.push(m('option', { value: `country-NA`, key: `country-NA` }, 'Select Country'));
		return options;
	}

	function getRegionOptions(index: number) {
		if (index >= allCountries.length) {
			return [
				m('option', { value: `region-NA`, key: `region-NA` }, 'Select Region')
			];
		}
		const regions = allCountries[index][2];
		const options = regions.map(region => {
			let [ regionName, regionSlug ] = region;
			return m('option', { value: regionSlug, key: `region-${regionSlug}` }, regionName);
		});
		options.push(m('option', { value: `region-NA`, key: `region-NA` }, 'Select Region'));
		return options;
	}

	return {
		view() {
			return m('div', {
					id: 'modal-gallery',
					'uk-modal': true,
					 onbeforeshow: onBeforeShow,
				},
				m('div', { class: 'uk-modal-dialog uk-modal-body' }, [
					m('button', { class: 'uk-modal-close-default', type: 'button', 'uk-close': true, }),
					m('h2', { class: 'uk-modal-title', }, 'Submit Image'),
					m('form', { class: classNames('uk-form-horizontal uk-margin', { 'uk-hidden': givingEmailInstructions }) },
						m('p', 'Feature your image in the app for others to enjoy.  Your current animation settings will also be saved.'),
						m('p',
							{ class: classNames('form-warning uk-display-block', { 'uk-hidden': !state.isDemoFile }) },
							m('span', { 'uk-icon': 'warning' }),
							' Please submit original images.'),
						m('p',
							{ class: classNames('form-warning uk-display-block', { 'uk-hidden': !imageTooSmall }) },
							m('span', { 'uk-icon': 'warning' }),
							' Your image is too small, please use a higher resolution image.'),
						m('div', { class: 'uk-margin' },
							m('label', { class: 'uk-form-label', for: 'gallery-title' }, 'Title', m('sup', '*')),
							m('div', { class: 'uk-form-controls' },
								m('input', {
									class: 'uk-input',
									id: 'gallery-title',
									type: 'text',
									disabled: !imageIsValid(),
									value: title,
									oninput: changeTitle,
								}),
							),
						),
						m('div', { class: 'uk-margin' },
							m('label', { class: 'uk-form-label', for: 'gallery-ownership' }, 'Permissions', m('sup', '*')),
							m('div', { class: 'uk-form-controls' },
								m('input', {
									id: 'gallery-ownership',
									class: 'uk-checkbox',
									type: 'checkbox',
									disabled: !imageIsValid(),
									checked: ownsImage,
									oninput: changeOwnership,
								}),
								m('p', { class: 'uk-form-label checkbox-label' }, 'I own this image.'),
							),
						),
						m('div', { class: 'uk-small-margin' },
							m('div', { class: 'uk-form-controls' },
								m('input', {
									id: 'gallery-permission',
									class: 'uk-checkbox',
									type: 'checkbox',
									disabled: !imageIsValid(),
									checked: givesPermission,
									oninput: changePermission,
								}),
								m('p', { class: 'uk-form-label checkbox-label' }, 'I understand that by submitting my image, it will become publicly available for anyone to download at full resolution.'),
							),
						),
						m('p', `Image credits (optional) – we'll display your name if provided:`),
						m('div', { class: 'uk-margin' },
							m('label', { class: 'uk-form-label', for: 'gallery-name' }, 'Author'),
							m('div', { class: 'uk-form-controls' },
								m('input', {
									class: 'uk-input',
									id: 'gallery-name',
									type: 'text',
									disabled: !imageIsValid(),
									value: name,
									oninput: changeName,
								}),
							),
						),
						m('p', `Include your social media handles if you want a shoutout (optional):`),
						m('div', { class: 'uk-margin' },
							m('label', { class: 'uk-form-label', for: 'gallery-ig' }, 'Instagram Handle'),
							m('div', { class: 'uk-form-controls' },
								m('input', {
									class: 'uk-input',
									id: 'gallery-ig',
									type: 'text',
									disabled: !imageIsValid(),
									placeholder: 'e.g. @amandaghassaei',
									value: ig,
									oninput: changeIG,
								}),
							),
						),
						m('div', { class: 'uk-margin' },
							m('label', { class: 'uk-form-label', for: 'gallery-twitter' }, 'Twitter Handle'),
							m('div', { class: 'uk-form-controls' },
								m('input', {
									class: 'uk-input',
									id: 'gallery-twitter',
									type: 'text',
									disabled: !imageIsValid(),
									placeholder: 'e.g. @amandaghassaei',
									value: twitter,
									oninput: changeTwitter,
								}),
							),
						),
						m('p', 'Please provide additional information about the image (optional):'),
						m('div', { class: 'uk-margin' },
							m('label', { class: 'uk-form-label', for: 'gallery-common' }, 'Common Name'),
							m('div', { class: 'uk-form-controls' },
								m('input', {
									class: 'uk-input',
									id: 'gallery-common',
									type: 'text',
									disabled: !imageIsValid(),
									placeholder: 'e.g. Red Cabbage',
									value: commonName,
									oninput: changeCommonName,
								}),
							),
						),
						m('div', { class: 'uk-margin' },
							m('label', { class: 'uk-form-label', for: 'gallery-latin' }, 'Latin Name'),
							m('div', { class: 'uk-form-controls' },
								m('input', {
									class: 'uk-input',
									id: 'gallery-latin',
									type: 'text',
									disabled: !imageIsValid(),
									placeholder: 'e.g. Brassica oleracea',
									value: latinName,
									oninput: changeLatinName,
								}),
							),
						),
						m('div', { class: 'uk-margin' },
							m('label', { class: 'uk-form-label', for: 'gallery-tags' }, 'Additional Tags'),
							m('div', { class: 'uk-form-controls' },
								m('input', {
									class: 'uk-input',
									id: 'gallery-tags',
									type: 'text',
									disabled: !imageIsValid(),
									value: tags,
									placeholder: 'comma separated e.g. vegetable, edible',
									oninput: changeTags,
								}),
							),
						),
					),
					m('form', { class: classNames('uk-form-horizontal uk-margin', { 'uk-hidden': givingEmailInstructions }) },
						m('p', 'Where was this image taken? (optional):'),
						m('div', { class: 'uk-margin' },
							m('label', { class: 'uk-form-label', for: 'gallery-common' }, 'Country'),
							m('div', { class: 'uk-form-controls' },
								m('select', {
									class: 'uk-select',
									id: 'export-type',
									selectedIndex: countryIndex,
									disabled: !imageIsValid(),
									onchange: changeCountryIndex,
								}, getCountryOptions()),
							),
						),
						m('div', { class: 'uk-margin' },
							m('label', { class: 'uk-form-label', for: 'gallery-latin' }, 'Region / State / Province'),
							m('div', { class: 'uk-form-controls' },
								m('select', {
									class: 'uk-select',
									id: 'export-type',
									selectedIndex: regionIndex === undefined ? getRegionOptions(countryIndex).length - 1 : regionIndex,
									disabled: !imageIsValid(),
									onchange: changeRegionIndex,
								}, getRegionOptions(countryIndex)),
							),
						),
						m('div', { class: 'uk-margin' },
							m('label', { class: 'uk-form-label', for: 'gallery-tags' }, 'City'),
							m('div', { class: 'uk-form-controls' },
								m('input', {
									class: 'uk-input',
									id: 'gallery-tags',
									type: 'text',
									disabled: !imageIsValid(),
									value: city,
									oninput: changeCity,
								}),
							),
						),
					),
					m('div', { class: classNames({ 'uk-hidden': !givingEmailInstructions }) },
						m('p', `Almost done!  Preparing a ZIP file containing your image and animation data.  `),
						m('p', m('b', 'To finish the submission process, email the ZIP file to ',
								m('a', { href: 'mailto:botanigram@gmail.com?subject=Image Submission', target: '_blank' }, 'botanigram@gmail.com'))),
						m('p', `${title}.zip should download automatically.  If not, please click `,
							m('a', { href: '#', onclick: submit }, 'this link'), '.'),
						m('label', { class: classNames('uk-form-label', { 'uk-hidden': !isZipping }) }, `Zipping Files...`),
						m('progress', { class: classNames('uk-progress', { 'uk-hidden': !isZipping }), value: zippingProgress, max: '1' }),
					),
					m('div', { class: 'modal-footer' },
						m('button', {
							class: classNames('uk-button uk-button-default uk-align-left',
								{ 'uk-hidden': !givingEmailInstructions }),
							type: 'button',
							onclick: resetModalState,
						}, 'Back'),
						m('button', {
							class: classNames('uk-button uk-button-primary uk-align-right',
								{ 'uk-hidden': givingEmailInstructions }),
							type: 'button',
							disabled: !canSubmit(),
							onclick: submit,
						}, 'Next'),
						m('button', {
							class: classNames('uk-button uk-button-primary uk-align-right uk-modal-close',
								{ 'uk-hidden': !givingEmailInstructions }),
							type: 'button',
						}, 'Done'),
						m('p',
							{ class: classNames('form-warning uk-form-label uk-align-right uk-display-inline-block',
								{ 'uk-hidden': !imageIsValid() || canSubmit() }) },
							m('span', { 'uk-icon': 'warning' }),
							' Please fill out required',
							m('sup', '*'),
							' fields!'),
					),
				]),
			)
		},
	};
}