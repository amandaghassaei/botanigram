import m from 'mithril';
import { primaryThreeView } from '../models/globals';
import { state } from '../models/state';
import { AnimationViewer } from './AnimationViewer';
import { Controls } from './Controls';
import { DropArea } from './DropArea';
import { Gallery } from './Gallery';
import { Navbar } from './Navbar';
import { WelcomeModal } from './WelcomeModal';

const root = document.getElementById('root')!;

const primaryViewer = AnimationViewer(primaryThreeView);

const App = {
	view() {
		return m('div', { id: 'app-wrapper' }, [
			m(Navbar),
			m(Gallery),
			m('div', { id: 'interface-wrapper', class: 'noselect uk-flex uk-flex-middle uk-flex-center' }, [
				m('div', { id: 'primary-animation' },
					m(primaryViewer, {
						id: 'primary-animation-viewer',
						model: state,
					}),
				),
				m('div', { id: 'left-wrapper' },
					m(Controls),
					m(DropArea),
				),
			]),
			m(WelcomeModal),
		]);
	}
}

m.mount(root, App);