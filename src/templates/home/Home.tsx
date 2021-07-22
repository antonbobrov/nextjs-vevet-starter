import Link from 'next/link';
import PageDesc from '../../components/layout/page-desc/PageDesc';
import getH1 from '../../utils/document/getH1';
import styles from './Home.module.scss';
import type { ITemplateHome } from './placeholder';

const HomeTemplate = (
    prop: ITemplateHome,
) => (
    <div className="page-content">
        <div className={styles.home}>

            <div className="wrap">
                <h1>
                    {getH1(prop)}
                </h1>
                <PageDesc {...prop} />
                <br />
                <br />
                <Link href="/test/fgfghh/hh?hi=hello">Test link</Link>
            </div>

        </div>
    </div>
);

export default HomeTemplate;
