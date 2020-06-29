import { Node } from 'tiptap';
import { nodeInputRule, replaceText } from 'tiptap-commands';
import DateTimeNodeView from "./DateTimeNodeView";
import moment from "moment";

export default class DateTimeNode extends Node {
    get name() {
        return 'datetime';
    }

    get schema() {
        return {
            attrs: {
                edit: {
                    default: true
                },
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
                    'data-edit': node.attrs.edit ? 1 : 0,
                }, moment(node.attrs.value).format('DD.MM.YYYY, HH:mm')];
            },
            parseDOM: [{
                tag: 'span.date-time-container',
                class: 'date-time-container',
                getAttrs(dom) {
                    let parsedDate = moment(dom.innerText, 'DD.MM.YYYY, HH:mm').toDate();
                    let edit = dom.getAttribute('data-edit') === '1';

                    return {
                        edit,
                        value: parsedDate
                    };
                }
            }],

        }
    }

    commands(_ref) {
        let schema = _ref.schema;
        return (attrs) => {
            return replaceText(null, schema.nodes.datetime, attrs);
        };
    }

    get view() {
        return DateTimeNodeView;
    }

    inputRules({ type }) {
        let daysOfWeek = ['воскресенье', 'понедельник', 'вторник', 'сред[ау]', 'четверг', 'пятниц[ау]', 'суббот[ау]'];
        let relativeDates = ['вчера', 'сегодня', 'завтра'];

        let daysOfWeekRegexp = new RegExp('(' + daysOfWeek.join('|') + ')', 'i');
        let relativeDatesRegexp = new RegExp('(' + relativeDates.join('|') + ')', 'i');

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
            nodeInputRule(daysOfWeekRegexp, type, (match) => {
                let dayName = match[1].toLowerCase();
                dayName = dayName.replace('/(а|у)$/', '[ау]');

                let nextDayIndex = daysOfWeek.indexOf(dayName);
                let nextDate = moment().day(nextDayIndex).toDate();

                return {value: nextDate};
            }),
            nodeInputRule(relativeDatesRegexp, type, (match) => {
                let relativeName = match[1].toLowerCase();
                let relativeIndex = relativeDates.indexOf(relativeName);
                let daysShift = relativeIndex-1;

                let relativeDate = moment()
                    .add(daysShift, 'd')
                    .add(1, 'h')
                    .startOf('hour')
                    .toDate();

                return {value: relativeDate};
            }),
        ]
    }
}