import { LayoutBreadCrumbsProps } from '@/components/layout/breadcrumbs/types';

export interface MenuLinkProps {
    id: number;
    href: string;
    name: string;
    isActive: boolean;
}

interface LanguagesProps {
    key: string;
    href: string;
    name: string;
    fullName: string;
    isActive: boolean;
}

export interface GlobalProps {
    lang: string;
    dir: 'ltr' | 'rtl';
    meta: {
        description?: string;
        keywords?: string;
        image?: string;
    };
    document: {
        pagetitle: string;
        longtitle: string;
        description: string;
        introtext: string;
        content: string;
    };
    settings: {
        searchable: boolean;
    };
    globalLinks: {
        home: string;
    };
    siteMenu: MenuLinkProps[];
    languages: LanguagesProps[];
    breadcrumbs: LayoutBreadCrumbsProps[];
}

export interface ConfigProps {
    key: number;
    url: {
        base: string;
        url: string;
        canonical: string;
    };
    updatedAt: string;
}

export interface PageApiProps <
    TemplateProps extends Record<string, any> = {}
> {
    global: GlobalProps;
    templateName: string;
    template: TemplateProps;
}
