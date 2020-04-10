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

export {
    zeroPad,
    sortByIndex,
    clone,
    isValidDate,
    getDefaultColors,
    getFieldTypes,
    getFilteredRecords
}
