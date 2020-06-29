import { Node } from 'tiptap';
import { replaceText } from 'tiptap-commands';

export default class FileNode extends Node {
    get name() {
        return 'file';
    }

    get schema() {
        return {
            attrs: {
                id: {},
                fileName: {},
                url: {}
            },
            group: 'inline',
            inline: true,
            selectable: true,
            showGapCursor: true,
            atom: true,
            toDOM(node) {
                return ['a', {
                    'data-file': node.attrs.fileName,
                    'data-id': node.attrs.id,
                    'data-index': node.attrs.index,
                    href: node.attrs.url || '#',
                    target: '_blank'
                }, node.attrs.fileName];
            },
            parseDOM: [{
                tag: 'a[data-file]',
                getAttrs(dom) {
                    return {
                        id: dom.getAttribute('data-id'),
                        index: dom.getAttribute('data-index'),
                        fileName: dom.getAttribute('data-file'),
                        url: dom.getAttribute('href')
                    };
                }
            }],

        }
    }

    commands(_ref) {
        let schema = _ref.schema;
        return (attrs) => {
            return replaceText(null, schema.nodes.file, attrs);
        };
    }
}