import {
    forwardRef, ImgHTMLAttributes, useEffect, useState,
} from 'react';
import { ImageAdaptivePaths, ImagePaths } from '@/types/image';
import { utils } from 'vevet';
import imagePlaceholder from './placeholder.svg';

type BaseImageAttributes = ImgHTMLAttributes<HTMLImageElement>;
type ImageAttributes = BaseImageAttributes & {
    src?: string;
    imagePaths?: ImagePaths | ImageAdaptivePaths;
    alt: string;
}

type Props = ImageAttributes;

const Image = forwardRef<HTMLImageElement, Props>((
    {
        imagePaths,
        ...tagProps
    },
    ref,
) => {
    const src = (imagePaths ? (imagePaths.thumb || imagePaths.original) : undefined)
        || tagProps.src;
    const [srcSet, setSrcSet] = useState(imagePlaceholder.src);

    useEffect(() => {
        const imageProps = imagePaths ? utils.image.pathsToProps(imagePaths) : undefined;
        setSrcSet(
            (imageProps ? (imageProps.srcSet || imageProps.src) : undefined) || tagProps.srcSet,
        );
    }, [imagePaths, tagProps.srcSet]);

    return (
        <img
            {...tagProps}
            ref={ref}
            src={src}
            srcSet={srcSet}
            alt={tagProps.alt}
        />
    );
});
Image.displayName = 'Image';

export default Image;
