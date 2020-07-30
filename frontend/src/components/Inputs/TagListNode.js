import { Node } from 'tiptap';
import { replaceText } from 'tiptap-commands';
import { Suggestions } from "tiptap-extensions";
import TagEditView from "./TagEditView";

export default class TagListNode extends Node {
    get name() {
        return this.options.name;
    }

    get defaultOptions() {
        return {
            name: 'taglist',
            matcher: {
                char: '@',
                allowSpaces: true,
                startOfLine: false
            },
            appendText: '',
            tagClass: 'taglist',
            suggestionClass: 'taglist-suggestion',
            isExtended: false
        };
    }

    get view() {
        return TagEditView;
    }

    get schema() {
        return {
            attrs: {
                icon: {},
                color: {},
                text: {},
                edit: {},
                tagClass: {'default': this.options.tagClass},
                matcherChar: {'default': this.options.matcher.char || ''},
            },
            group: 'inline',
            inline: true,
            selectable: true,
            atom: true,
            toDOM: (node) => {
                let isExtendedChip = Boolean(node.attrs.icon);

                let chipClass = isExtendedChip
                    ? ' tag-chip'
                    : '';

                let iconClass = isExtendedChip
                    ? ' mdi ' + node.attrs.icon
                    : '';

                let nodeText = isExtendedChip
                    ? node.attrs.text
                    : this.options.matcher.char + node.attrs.text;

                return ['span', {
                    class: node.attrs.tagClass + chipClass + iconClass,
                    'data-icon': node.attrs.icon || '',
                    'data-color': node.attrs.color || '',
                    'data-text': node.attrs.text,
                    'data-edit': node.attrs.edit ? 1 : 0,
                    'data-char': node.attrs.matcherChar,
                    'style': `background-color: ${node.attrs.color}`
                }, nodeText];
            },
            parseDOM: [{
                tag: 'span[data-text]',
                getAttrs(dom) {
                    let text = dom.getAttribute('data-text');
                    let icon = dom.getAttribute('data-icon');
                    let color = dom.getAttribute('data-color');
                    let matcherChar = dom.getAttribute('data-char');
                    let edit = dom.getAttribute('data-edit') === '1';

                    let tagClasses = dom.getAttribute('class').toLocaleLowerCase();
                    let utilityClasses = ['tag-chip', 'mdi', icon, 'text-white'];
                    for (const classToRemove of utilityClasses) {
                        tagClasses = tagClasses.replace(classToRemove, '');
                    }
                    tagClasses = tagClasses.replace(/^ +/g, '').replace(/ +$/g, '');

                    let tagClass = tagClasses.split(' ')[0];
                    return {icon, color, text, edit, matcherChar, tagClass};
                }
            }]
        };
    }

    commands(_ref) {
        let schema = _ref.schema;
        return (attrs) => {
            return replaceText(null, schema.nodes[this.name], attrs);
        };
    }

    get plugins() {
        let extension = this;

        return [
            Suggestions({
                command: ({range, attrs, schema}) => {
                    return replaceText(range, schema.nodes[extension.name], attrs);
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
