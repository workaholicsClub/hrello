import { Node } from 'tiptap';
import { nodeInputRule } from 'tiptap-commands';
import DateTimeNodeView from "./DateTimeNodeView";
import moment from "moment";

export default class DateTimeNode extends Node {
    get name() {
        return 'datetime';
    }

    get schema() {
        return {
            attrs: {
                value: {
                    default: null,
                },
            },
            group: 'inline',
            inline: true,
            selectable: true,
            showGapCursor: true,
            atom: true,
            toDOM(node) {
                return ['span', {
                    class: 'date-time-container',
                }, moment(node.attrs.value).format('DD.MM.YYYY, HH:mm')];
            },
            parseDOM: [{
                tag: 'span',
                class: 'date-time-container',
                getAttrs(dom) {
                    let parsedDate = moment(dom.innerText, 'DD.MM.YYYY, HH:mm').toDate();
                    return {
                        value: parsedDate
                    };
                }
            }],

        }
    }

    get view() {
        return DateTimeNodeView;
    }

    inputRules({ type }) {
        return [
            nodeInputRule(/(\d{2}\.\d{2}\.\d{4})/, type, (match) => {
                let enteredDate = match[1];
                let parsedDate = moment(enteredDate, "DD.MM.YYYY").toDate();
                return {value: parsedDate};
            }),
            nodeInputRule(/(\d{2}:\d{2})/, type, (match) => {
                let enteredDate = match[1];
                let parsedDate = moment(enteredDate, "HH:mm").toDate();
                return {value: parsedDate};
            }),
        ]
    }
}