import {
    forwardRef, ReactNode, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import { addEventListener, childOf } from 'vevet-dom';
import routerCallbacks from 'src/router';
import { Portal } from 'react-portal';
import app from 'src/app';
import { Timeline } from 'vevet';
import { useSelector } from 'react-redux';
import { selectLexicon } from '@/store/reducers/lexicon';
import styles from './styles.module.scss';

export interface PopupSimpleRef {
    show: () => void;
    hide: () => void;
}

interface Props {
    onShow?: () => void;
    onHide?: () => void;
    usePadding?: boolean;
    children: ReactNode;
}

const PopupSimple = forwardRef<
    PopupSimpleRef,
    Props
>(({
    onShow,
    onHide,
    usePadding = true,
    children,
}, ref) => {
    const lexicon = useSelector(selectLexicon);

    const parentRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [isActive, setIsActive] = useState<undefined | boolean>(undefined);
    const [allowRender, setAllowRender] = useState(false);

    useImperativeHandle(ref, () => ({
        show: () => {
            setAllowRender(true);
            setIsActive(true);
        },
        hide: () => {
            setIsActive(false);
        },
    }));

    // launch callbacks
    useEffect(() => {
        if (typeof isActive === 'undefined') {
            return;
        }
        if (isActive) {
            if (onShow) {
                onShow();
            }
        } else if (onHide) {
            onHide();
        }
        // set scroll classes
        app.html.classList.toggle(styles.prevent_scroll, isActive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive]);

    // hide events
    useEffect(() => {
        const escapeListener = addEventListener(window, 'keydown', (evt) => {
            let bool: boolean | undefined = false;
            setIsActive((val) => {
                bool = val;
                return val;
            });
            if (evt.keyCode === 27 && bool) {
                setIsActive(false);
            }
        });
        const routerEvent = routerCallbacks.add('before', () => {
            setIsActive(false);
        });
        return () => {
            escapeListener.remove();
            routerEvent.remove();
        };
    }, []);

    // animate the popup
    const timelineRef = useRef<Timeline | null>(null);
    useEffect(() => () => {
        timelineRef.current?.destroy();
    }, []);
    useEffect(() => {
        if (!allowRender || typeof isActive === 'undefined') {
            return;
        }
        // create timeline if it doesn't exist yet
        if (!timelineRef.current) {
            timelineRef.current = new Timeline({
                duration: 500,
            });
            timelineRef.current.addCallback('progress', (progressData) => {
                const parent = parentRef.current;
                if (parent) {
                    parent.style.visibility = progressData.progress > 0 ? 'visible' : 'hidden';
                    parent.style.opacity = `${progressData.easing}`;
                }
                if (progressData.progress === 0 && timelineRef.current?.isReversed) {
                    setAllowRender(false);
                    setIsActive(undefined);
                }
            });
        }
        if (isActive) {
            timelineRef.current.play();
        } else {
            timelineRef.current.reverse();
        }
    }, [allowRender, isActive, parentRef]);

    return (
        allowRender ? (
            <Portal>
                <div
                    ref={parentRef}
                    className={styles.popup_simple}
                    role="dialog"
                    aria-modal
                >
                    <div
                        className={styles.container}
                    >
                        <div
                            aria-hidden
                            className={styles.overlay}
                            onClick={() => {
                                setIsActive(false);
                            }}
                        />
                        {/* eslint-disable-next-line max-len */}
                        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                        <div
                            className={styles.scroll}
                            onClick={(evt) => {
                                if (wrapperRef.current) {
                                    if (!childOf(evt.target as Element, wrapperRef.current)) {
                                        setIsActive(false);
                                    }
                                }
                            }}
                        >
                            <div
                                ref={wrapperRef}
                                className={[
                                    styles.wrapper,
                                    usePadding ? styles.use_padding : '',
                                ].join(' ')}
                            >
                                <button
                                    type="button"
                                    className={styles.close}
                                    onClick={() => {
                                        setIsActive(false);
                                    }}
                                >
                                    {lexicon.navClose}
                                </button>
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </Portal>
        ) : <></>
    );
});
PopupSimple.displayName = 'PopupSimple';
export default PopupSimple;
