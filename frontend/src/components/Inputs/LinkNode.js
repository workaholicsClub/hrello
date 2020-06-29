import {Link} from 'tiptap-extensions';

export default class LinkNode extends Link {
    get schema() {
        return {
            attrs: {
                href: {
                    default: null
                }
            },
            inclusive: false,
            parseDOM: [{
                tag: 'a[href]:not([data-file])',
                getAttrs: function getAttrs(dom) {
                    return {
                        href: dom.getAttribute('href')
                    };
                }
            }],
            toDOM: function toDOM(node) {
                return ['a', Object.assign(node.attrs, {
                    rel: 'noopener noreferrer nofollow'
                }), 0];
            }
        }
    }
}