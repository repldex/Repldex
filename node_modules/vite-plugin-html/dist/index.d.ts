import { HtmlTagDescriptor, Plugin } from 'vite';
import { Options as Options$1 } from 'ejs';
import { Options as Options$2, minify } from 'html-minifier-terser';
export { Options as MinifyOptions } from 'html-minifier-terser';

interface InjectOptions {
    /**
     * @description Data injected into the html template
     * @deprecated Has been replaced by `data`
     */
    injectData?: Record<string, any>;
    /**
     *  @description Data injected into the html template
     */
    data?: Record<string, any>;
    /**
     * @description esj options configuration
     * @deprecated Has been replaced by `options`
     */
    injectOptions?: Options$1;
    /**
     * @description esj options configuration
     */
    ejsOptions?: Options$1;
    /**
     * @description vite transform tags
     */
    tags?: HtmlTagDescriptor[];
}
interface Options {
    /**
     * @description Injection options
     */
    inject?: InjectOptions;
    /**
     * @description Minimize options
     */
    minify?: Options$2 | boolean;
}

declare function injectHtml(options?: InjectOptions): Plugin;

declare function minifyHtml(minifyOptions?: Options$2 | boolean): Plugin;

declare const minifyFn: typeof minify;

declare const _default: (options?: Options) => Plugin[];

export { _default as default, injectHtml, minifyFn, minifyHtml };
