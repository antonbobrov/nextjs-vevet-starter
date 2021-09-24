import { Application } from 'vevet';
import AppPage from './app/AppPage';
import { isBrowser } from './utils/browser/isBrowser';

const app = (isBrowser ? new Application<AppPage>() : undefined) as Application<AppPage>;
export default app;

// get current Vevet page
export function getAppPage () {
    return app ? app.page : false;
}

// Scroll Settings
const useSmoothScroll = !(!!app && app.isMobile);
const useWindowScroll = !useSmoothScroll;
export const appSettings = {
    useSmoothScroll,
    useWindowScroll,
    useAdaptiveFontSize: true,
};
// set scroll classes
if (app) {
    app.html.classList.toggle('use-native-scroll', useWindowScroll);
    app.html.classList.toggle('use-smooth-scroll', useSmoothScroll);
}
// disable scroll restoration
if (isBrowser) {
    window.history.scrollRestoration = 'manual';
}
// scroll to top on resize (mobile bug)
// when using custom scroll
if (!!app && !useWindowScroll) {
    app.viewport.add('', () => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, {
        timeout: 650,
        name: 'iOS scroll resize bug',
    });
}

// custom cursor
export const useCustomCursor = !!app && !app.isMobile;
