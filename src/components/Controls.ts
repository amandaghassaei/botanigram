import m from 'mithril';
const classNames = require('classnames');
import { GOLDEN_ANGLE, state } from '../models/state';
import { blurActiveElement } from '../utils';
import { NumberInput } from './NumberInput';

const pauseIcon = m('svg', { width: '20', height:'20', viewBox:'0 0 20 20', xmlns:'http://www.w3.org/2000/svg' },
	m('rect', { height: '10', width: '1', y: '5', x: '7' }),
	m('rect', { height: '10', width: '1', y: '5', x: '12' }),
);

export function Controls() {

    function setAngle(angle: number) {
	    state.angle = angle;
    }

    function setGoldenAngle(e: Event) {
        e.preventDefault();
        state.setGoldenAngle();
    }

    function setReverse(e: InputEvent) {
        const reverse = (e.target as HTMLInputElement).checked;
        blurActiveElement();
        state.reverse = reverse;
    }

    function setCenterX(centerX: number) {
	    state.centerX = centerX;
    }

    function setCenterY(centerY: number) {
	    state.centerY = centerY;
    }

    function setFramerate(framerate: number) {
	    state.framerate = framerate;
    }

    function togglePlayPause() {
        if (state.paused) state.play();
        else state.pause();
        blurActiveElement();
    }

	return {
        view() {
            return m('div', { id: 'controls-wrapper', class: 'uk-box-shadow-large' },
                m('button', {
                        class: 'uk-button uk-button-primary uk-margin-small full-width',
                        onclick: togglePlayPause,
                    },
                    m('icon', { 'uk-icon': true, class: classNames('uk-margin-small-right', { 'uk-hidden': state.paused }) }, pauseIcon),
                    m('icon', { 'uk-icon': 'icon: play', class: classNames('uk-margin-small-right', { 'uk-hidden': !state.paused }) }),
                    state.paused ? 'Play Animation' : 'Pause Animation',
                ),
                m('form', { class: 'uk-width-large uk-form-horizontal uk-margin-small'}, [
                    m('div', { class: 'uk-grid-small', 'uk-grid': true, }, [
                        m('div', { class: 'uk-width-1-3', },
                            m('label', { class: 'uk-form-label'}, 'Rotation Angle'),
                        ),
                        m('div', { class: 'uk-width-1-3', },
                            m(NumberInput, {
                                min: -Infinity, max: Infinity, step: 0.1,
                                placeholder: 'Angle (deg)',
                                oninput: setAngle,
                                value: Number.parseFloat(state.angle.toFixed(1)),
                                'uk-tooltip': 'title: How far to rotate the image between each animation frame;delay: 1000',
                            }),
                        ),
                        m('div', { class: 'uk-width-1-3', },
                            m('button', { class: classNames('uk-button', { 'uk-hidden': state.angle === GOLDEN_ANGLE }), onclick: setGoldenAngle }, 'Reset'),
                        ),
                    ]),
                    m('div', { class: 'uk-grid-small', 'uk-grid': true, }, [
                        m('div', { class: 'uk-width-1-3', },
                            m('label', { class: 'uk-form-label'}, 'Reverse Spin'),
                        ),
                        m('div', { class: 'uk-width-auto', },
                            m('input', {
                                class: 'uk-checkbox',
                                type: 'checkbox',
                                oninput: setReverse,
                                checked: state.reverse,
                            }),
                        ),
                    ]),
                    m('div', { class: 'uk-grid-small', 'uk-grid': true, }, [
                        m('div', { class: 'uk-width-1-3', },
                            m('label', { class: 'uk-form-label'}, 'Center of Rotation'),
                        ),
                        m('div', { class: 'uk-width-1-3', },
                            m(NumberInput, {
                                min: 0,
                                max: state.imageWidth,
                                placeholder: 'X (px)',
                                oninput: setCenterX,
                                value: state.centerX,
                                'uk-tooltip': 'title: X coordinate of center of rotation;delay: 1000',
                            }),
                        ),
                        m('div', { class: 'uk-width-1-3', },
                            m(NumberInput, {
                                min: 0,
                                max: state.imageHeight,
                                placeholder: 'Y (px)',
                                oninput: setCenterY,
                                value: state.centerY,
                                'uk-tooltip': 'title: Y coordinate of center of rotation;delay: 1000',
                            }),
                        ),
                    ]),
                    m('div', { class: 'uk-grid-small', 'uk-grid': true, }, [
                        m('div', { class: 'uk-width-1-3', },
                            m('label', { class: 'uk-form-label'}, 'Framerate'),
                        ),
                        m('div', { class: 'uk-width-1-3', },
                            m(NumberInput, {
                                min: 0,
                                max: 60,
                                placeholder: 'FPS',
                                oninput: setFramerate,
                                value: state.framerate,
                                'uk-tooltip': 'title: How fast to run the animation in frames per second;delay: 1000',
                            }),
                        ),
                    ]),
                ]),
            );
        },
    };
};