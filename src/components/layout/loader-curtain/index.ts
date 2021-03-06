import LayoutLoaderCurtainHandler from './Handler';
import styles from './styles.module.scss';

let handler: LayoutLoaderCurtainHandler | undefined;
function create () {
    if (!handler) {
        const wrapper = document.createElement('div');
        wrapper.classList.add(styles.layout_loader_curtain);
        document.body.appendChild(wrapper);
        handler = new LayoutLoaderCurtainHandler(wrapper);
    }
    return handler;
}

/**
 * Show the loader curtain
 */
export function showLoaderCurtain () {
    return new Promise<void>((
        resolve,
    ) => {
        create().show().then(() => {
            resolve();
        }).catch(() => {});
    });
}

/**
 * Hide the loader curtain
 */
export function hideLoaderCurtain () {
    return new Promise<void>((
        resolve,
    ) => {
        if (handler) {
            handler.hide().then(() => {
                resolve();
            }).catch(() => {});
        } else {
            resolve();
        }
    });
}


/**
 * Get the loader curtain
 */
export function getLoaderCurtain () {
    return handler;
}
