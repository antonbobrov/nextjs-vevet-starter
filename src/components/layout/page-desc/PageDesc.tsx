import { TemplateBaseData } from '../../../templates/_base/types';
import stringIsEmpty from '../../../utils/types/stringIsEmpty';
import TextContent from '../text-content/TextContent';
import styles from './PageDesc.module.scss';

const PageDesc = ({
    document,
}: TemplateBaseData) => {
    const { introtext, content } = document;
    const headerEmpty = stringIsEmpty(introtext);
    const contentEmpty = stringIsEmpty(content);
    const isEmpty = headerEmpty && contentEmpty;
    return (
        isEmpty ? <></> : (
            <div className={styles.page_desc}>
                {headerEmpty ? '' : <h2 className={`${styles.page_desc__header} v-view_b`}>{introtext}</h2>}
                {contentEmpty ? '' : (
                    <div className={`${styles.page_desc__desc} v-view_b`}>
                        <TextContent html={content} />
                    </div>
                )}
            </div>
        )
    );
};

export default PageDesc;
