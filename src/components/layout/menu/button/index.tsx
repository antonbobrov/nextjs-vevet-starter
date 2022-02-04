import { forwardRef } from 'react';
import store from '@/store/store';
import { useSelector } from 'react-redux';
import { selectPagePropsLexicon } from '@/store/reducers/pageProps';
import styles from './styles.module.scss';

interface Props {
    isActive: boolean;
}

const LayoutMenuButton = forwardRef<
    HTMLButtonElement,
    Props
>((
    {
        isActive,
    },
    ref,
) => {
    const lexicon = useSelector(selectPagePropsLexicon);

    return (
        <button
            ref={ref}
            type="button"
            className={styles.layout_menu_button}
            onClick={() => {
                store.dispatch({
                    type: isActive ? 'HIDE_POPUP_MENU' : 'SHOW_POPUP_MENU',
                });
            }}
        >
            <span>{isActive ? lexicon.hideMenu : lexicon.showMenu}</span>
        </button>
    );
});
LayoutMenuButton.displayName = 'LayoutMenuButton';
export default LayoutMenuButton;