import { Node } from 'tiptap';
import { replaceText } from 'tiptap-commands';
import { Suggestions } from "tiptap-extensions";

export default class TagListNode extends Node {
    get name() {
        return 'taglist';
    }

    get defaultOptions() {
        return {
            matcher: {
                char: '@',
                allowSpaces: true,
                startOfLine: false
            },
            appendText: '',
            tagClass: 'taglist',
            suggestionClass: 'taglist-suggestion'
        };
    }

    get schema() {
        return {
            attrs: {
                text: {}
            },
            group: 'inline',
            inline: true,
            selectable: false,
            atom: true,
            toDOM: (node) => {
                return ['span', {
                    class: this.options.tagClass,
                    'data-text': true
                }, this.options.matcher.char + node.attrs.text];
            },
            parseDOM: [{
                tag: 'span[data-text]',
                getAttrs(dom) {
                    let text = dom.innerText.replace(this.options.matcher.char, '');
                    return {text};
                }
            }]
        };
    }

    get plugins() {
        return [
            Suggestions({
                command: ({range, attrs, schema}) => {
                    return replaceText(range, schema.nodes[this.name], attrs);
                },
                appendText: this.options.appendText,
                matcher: this.options.matcher,
                items: this.options.items,
                onEnter: this.options.onEnter,
                onChange: this.options.onChange,
                onExit: this.options.onExit,
                onKeyDown: this.options.onKeyDown,
                onFilter: this.options.onFilter,
                suggestionClass: this.options.suggestionClass
            })
        ];
    }


}
