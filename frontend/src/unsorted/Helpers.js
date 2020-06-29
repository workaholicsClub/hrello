function zeroPad(num) {
    return num < 10 ? '0'+num : num;
}
function sortByIndex(items) {
    if (typeof (items) === 'undefined') {
        return [];
    }
    let itemsCopy = items.concat();

    return itemsCopy.sort((a, b) => a.sort - b.sort);
}
function clone(object) {
    return JSON.parse(JSON.stringify(object));
}
function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
}

function getDefaultColors() {
    return [
        {text: '', value: 'green', color: '#519839', isEditing: false, defaultName: 'Зеленый'},
        {text: '', value: 'yellow', color: '#f2d600', isEditing: false, defaultName: 'Желтый'},
        {text: '', value: 'orange', color: '#ff9f1a', isEditing: false, defaultName: 'Оранжевый'},
        {text: '', value: 'red', color: '#eb5a46', isEditing: false, defaultName: 'Красный'},
        {text: '', value: 'purple', color: '#c377e0', isEditing: false, defaultName: 'Фиолетовый'},
        {text: '', value: 'blue', color: '#0079bf', isEditing: false, defaultName: 'Синий'}
    ];
}
function getFieldTypes() {
    return [
        {text: 'Задача', value: 'task', icon: 'mdi-clipboard-check-outline', fieldName: 'Новая задача', buttonText: 'Добавить задачу'},
        {text: 'Текст', value: 'text', icon: 'mdi-cursor-text', fieldName: 'Новое информационное поле', buttonText: 'Добавить информацию'},
        {text: 'Галочка', value: 'checkbox', icon: 'mdi-checkbox-marked-outline', fieldName: 'Новый чеклист', buttonText: 'Добавить чеклист'},
        {text: 'Оценка', value: 'mark', icon: 'mdi-emoticon-happy-outline', fieldName: 'Новая оценка', buttonText: 'Добавить оценку'},
        {text: 'Файл', value: 'file', icon: 'mdi-paperclip', fieldName: 'Новый файл', buttonText: 'Добавить файл'},
        {text: 'Тэги', value: 'color', icon: 'mdi-palette', fieldName: 'Новое поле с тегами', buttonText: 'Добавить теги'},
        {text: 'Резюме', value: 'file', icon: 'mdi-file-account-outline', fieldName: 'Резюме', fieldType: 'file', buttonText: 'Добавить резюме', template: true}
    ];
}

function getFilteredRecords(cards, searchRecord) {
    return cards.reduce( (acc, card) => {
        if (card.content) {
            card.content.forEach((iteratedRecord) => {
                let isNeededRecord = searchRecord.linkToDefaultById
                    ? searchRecord.linkToDefaultById === iteratedRecord.linkToDefaultById
                    : searchRecord.name === iteratedRecord.name;

                if (isNeededRecord) {
                    acc.push(iteratedRecord);
                }
            });
        }

        return acc;
    }, []);
}

function getUnique(items) {
    return items.filter( (item, index) => items.indexOf(item) === index );
}

function compareTags(tag1, tag2) {
    return  (tag1.color === tag2.color) &&
            (tag1.icon === tag2.icon) &&
            (tag1.text === tag2.text);
}

function getUniqueTags(tags) {
    return tags.filter( (item, currentIndex) => {
        let foundIndex = tags.findIndex(indexItem => compareTags(item, indexItem));
        return foundIndex === currentIndex;
    } );
}

function getCardTags(card, tagname) {
    if (!card.content) {
        return [];
    }
    
    return card.content.reduce( (collection, item) => {
        if (item.fieldType === 'smartComment' && item.data && item.data[tagname] && item.data[tagname].length > 0) {
            return collection.concat( item.data[tagname] );
        }

        return collection;
    }, []);
}

export {
    zeroPad,
    sortByIndex,
    clone,
    isValidDate,
    getDefaultColors,
    getFieldTypes,
    getFilteredRecords,
    getUnique,
    getUniqueTags,
    getCardTags
}
