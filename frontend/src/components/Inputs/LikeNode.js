import { Node } from 'tiptap';
import { replaceText } from 'tiptap-commands';
import LikeNodeView from "./LikeNodeView";

export default class LikeNode extends Node {
    get name() {
        return 'like';
    }

    get view() {
        return LikeNodeView;
    }

    get schema() {
        return {
            attrs: {
                emojisCollection: {
                    default: 'basic'
                },
                value: {
                    default: ''
                },
            },
            group: 'inline',
            inline: true,
            selectable: true,
            showGapCursor: true,
            atom: true,
            toDOM(node) {
                return ['span', {
                    'data-emoji': node.attrs.emojisCollection,
                    'data-value': node.attrs.value,
                }, ''];
            },
            parseDOM: [{
                tag: 'span[data-emoji]',
                getAttrs(dom) {
                    let value = dom.getAttribute('data-value');
                    if (value !== '') {
                        value = parseInt(value);
                    }

                    return {
                        emojisCollection: dom.getAttribute('data-emoji'),
                        value: value,
                    };
                }
            }],

        }
    }

    commands(_ref) {
        let schema = _ref.schema;
        return (attrs) => {
            return replaceText(null, schema.nodes.like, attrs);
        };
    }
}