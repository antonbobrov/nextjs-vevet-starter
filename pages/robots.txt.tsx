import serverEnv from '@/server/env';
import { GetServerSideProps } from 'next';

const Robots = () => {};
export default Robots;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { res, req } = context;

    const content: string[] = [];
    content.push('User-agent: *');
    if (typeof process.env.NOINDEX === 'undefined' || process.env.NOINDEX === 'true') {
        content.push('Disallow: /');
    } else {
        content.push('Disallow: *?*');
        content.push(`Sitemap: ${serverEnv.getReqUrlBase(req, '/sitemap.xml')}`);
    }

    res.setHeader('Content-Type', 'text/plain');
    res.write(content.join('\n'));
    res.end();

    return {
        props: {},
    };
};
