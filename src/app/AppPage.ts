import {
    Page, ProgressPreloader, ScrollBar, ScrollView,
    SmoothScroll, SmoothScrollDragPlugin, SmoothScrollKeyboardPlugin, utils,
} from 'vevet';
import { selectAll, selectOne } from 'vevet-dom';
import app, {
    getScrollSelector, gui, preventInteractivity, useSmoothScroll,
} from 'src/app';
import store from '@/store/store';
import { hideLoaderCurtain, showLoaderCurtain } from '@/components/layout/loader-curtain';
import loadingSlice from '@/store/reducers/loading';
import layoutSlice from '@/store/reducers/layout';
import PCancelable from 'p-cancelable';
import normalizers from '@/utils/normalizers';

export default class AppPage extends Page {
    protected _needsInnerPreloader = store.getState().layout.preloader.hidden;

    // page preloader
    protected _pagePreloader?: ProgressPreloader;

    // smooth scrolling
    protected _smoothScroll?: SmoothScroll;
    get smoothScroll () {
        return this._smoothScroll;
    }
    set smoothScroll (val: SmoothScroll | undefined) {
        this._smoothScroll = val;
    }

    // scroll bar
    protected _scrollBar?: ScrollBar;
    get scrollBar () {
        return this._scrollBar;
    }

    // scroll view
    protected _scrollView?: ScrollView;
    get scrollView () {
        return this._scrollView;
    }



    /**
     * Create the page
     */
    protected _create () {
        return new Promise<void>((
            resolve,
        ) => {
            super._create().then(() => {
                if (preventInteractivity) {
                    app.html.classList.add('prevent-interactivity');
                }

                // create smooth scrolling
                this._createSmoothScroll();
                this._createScrollView();
                this._createScrollBar();

                // show the page on preloader hide
                this._onPreloaderHidden().then(() => {
                    this.onCreate().then(() => {
                        this.show().catch(() => {
                            throw new Error('cant');
                        });
                    }).catch(() => {});
                }).catch(() => {});

                resolve();
            }).catch(() => {});
        });
    }

    /**
     * Create SmoothScroll
     */
    protected _createSmoothScroll () {
        if (!useSmoothScroll) {
            return;
        }
        const container = selectOne('#smooth-scroll') as HTMLElement;
        if (!container) {
            return;
        }
        // create smooth scroll
        this._smoothScroll = new SmoothScroll({
            parent: this,
            enabled: false,
            selectors: {
                outer: container,
            },
            overscroll: false,
            useWillChange: !app.browserName.includes('firefox'),
        });
        // add keyboard controls
        this._smoothScroll.addPlugin(new SmoothScrollKeyboardPlugin());

        // add drag
        if (app.isMobile) {
            this._smoothScroll.addPlugin(new SmoothScrollDragPlugin({
                lerp: 0.35,
            }));
        }

        // add gui
        if (gui) {
            gui.then((data) => {
                if (!data) {
                    return;
                }
                if (this._smoothScroll) {
                    const folder = data.addFolder('smooth scroll');
                    folder.add(this._smoothScroll.prop.render, 'lerp', 0.001, 0.35, 0.001);
                    this._smoothScroll.addCallback('destroy', () => {
                        data.removeFolder(folder);
                    });
                }
            }).catch(() => {});
        }
    }

    /**
     * Create ScrollView
     */
    protected _createScrollView () {
        // create ScrollView
        const container = this.smoothScroll ? this.smoothScroll : window;
        this._scrollView = new ScrollView({
            parent: this,
            enabled: false,
            container,
            classToToggle: '',
            useDelay: {
                max: 1000,
                dir: 'y',
            },
            viewportTarget: app.isMobile ? 'w' : '',
            intersectionRoot: null,
        });
    }

    /**
     * Create page scrollbar
     */
    protected _createScrollBar () {
        if (app.isMobile) {
            return;
        }
        const container = this.smoothScroll || window;
        // add scrollbar
        this._scrollBar = new ScrollBar({
            parent: this,
            container,
            domParent: this.smoothScroll ? document.body : undefined,
            optimizeCalculations: true,
        });
    }



    /**
     * Catch the moment when the preloader is hidden
     */
    protected _onPreloaderHidden () {
        return new Promise<void>((
            resolve,
        ) => {
            if (store.getState().layout.preloader.hidden) {
                resolve();
            } else {
                const event = store.subscribe(() => {
                    if (store.getState().layout.preloader.hide) {
                        resolve();
                        event();
                    }
                });
            }
        });
    }

    /**
     * Create a page preloader
     * and resolve when all resources are loaded
     */
    protected _onInnerPreloaderDone () {
        return new Promise<void>((
            resolve,
        ) => {
            if (this._needsInnerPreloader) {
                this._pagePreloader = new ProgressPreloader({
                    parent: this,
                    container: false,
                    hide: false,
                    loaders: {
                        img: false,
                        video: false,
                        custom: '.js-preload-inner',
                    },
                    calc: {
                        lerp: false,
                    },
                });
                this._pagePreloader.addCallback('loaded', () => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }



    /**
     * Check if the page can be shown.
     */
    public canShow () {
        return new Promise<void>((
            resolve, reject,
        ) => {
            super.canShow().then(() => {
                this._onInnerPreloaderDone().then(() => {
                    resolve();
                }).catch(() => {
                    reject();
                });
            }).catch(() => {
                reject();
            });
        });
    }

    /**
     * Show the page
     */
    protected _show () {
        return super._show().then(() => {
            // remove loading indicator
            store.dispatch(loadingSlice.actions.end());

            // hide loader curtain
            if (!store.getState().loading.firstLoad) {
                hideLoaderCurtain();
            }

            // catch the moment when the page would be fully interactive
            const interactivePromise = this._pageIsInteractive();
            this.addCallback('destroy', () => {
                interactivePromise.cancel();
            });
            return interactivePromise.then(() => {
                // allow page interactivity
                app.html.classList.remove('prevent-interactivity');

                // enable scrolling
                if (this._smoothScroll) {
                    this._smoothScroll.changeProp({
                        enabled: true,
                    });
                }
                if (this._scrollView) {
                    this._scrollView.changeProp({
                        enabled: true,
                    });
                }

                // hash anchor
                if (window.location.hash) {
                    try {
                        const section = selectOne(window.location.hash);
                        if (section) {
                            utils.scroll.toElement({
                                container: getScrollSelector(),
                                el: section,
                                top: normalizers.strToNum(
                                    getComputedStyle(section).marginTop,
                                ),
                                duration: (
                                    section.getBoundingClientRect().top / app.viewport.height
                                ) * 125,
                            });
                        }
                    } catch (e) {
                        //
                    }
                }
            }).catch(() => {});
        }).catch(() => {});
    }

    /**
     * Some elements may have the attribute `data-block-page-interactivity="true"`
     * This means that the page should not be interactive (and scrollable).
     * Here we search for such elements.
     * When there's no elements with this attribute, the page is interactive.
     */
    protected _pageIsInteractive () {
        return new PCancelable<void>((resolve, reject) => {
            if (this._destroyed) {
                reject();
            }
            const elements = selectAll('[data-block-page-interactivity="true"]');
            if (elements.length === 0 || !preventInteractivity) {
                resolve();
            } else {
                setTimeout(() => {
                    this._pageIsInteractive().then(() => {
                        resolve();
                    }).catch(() => {
                        reject();
                    });
                }, 30);
            }
        });
    }



    /**
     * Hide the page
     */
    protected _hide () {
        return new Promise<void>((
            resolve,
        ) => {
            if (this.smoothScroll) {
                this.smoothScroll.changeProp({
                    enabled: false,
                });
            }
            showLoaderCurtain().then(() => {
                super._hide().then(() => {
                    resolve();
                }).catch(() => {});
            }).catch(() => {});
            store.dispatch(layoutSlice.actions.hidePopupMenu());
        });
    }
}
