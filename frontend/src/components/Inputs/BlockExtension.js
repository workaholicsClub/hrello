import {Plugin, PluginKey} from "prosemirror-state"
import { Node } from 'tiptap';

function BlockPlugin(editable) {
    return new Plugin({
        name: new PluginKey('blockedit'),
        filterTransaction(transaction, state) {
            let a = console;
            a.log(transaction, state);
            return editable;
        }
    });
}

export default class BlockExtension extends Node {
    constructor(isEditable) {
        super();
        this.isEditable = isEditable;
    }

    get plugins() {
        return [
            new BlockPlugin(this.isEditable),
        ]
    }
}