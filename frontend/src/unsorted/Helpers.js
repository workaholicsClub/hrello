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
function getCardFieldValue(field, card) {
    if (!field) {
        return undefined;
    }

    let hasValue =
        typeof (card['statusData']) != 'undefined' &&
        typeof (card.statusData[field.id]) != 'undefined';

    return hasValue ? card.statusData[field.id] : undefined;
}
function getCardFieldPluginData(card, pluginId, fieldId) {
    if (!card['pluginData']) {
        return undefined;
    }

    if (!card['pluginData'][pluginId]) {
        return undefined;
    }

    return card['pluginData'][pluginId][fieldId];
}
function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

function getGlobalFieldData(fieldId, card) {
    let globalData = card.globalValues
        ? card.globalValues.reduce( (foundData, iteratedData) => {
            if (iteratedData.fieldId === fieldId) {
                return iteratedData;
            }

            return foundData;
        }, false)
        : false;

    return globalData
        ? globalData
        : null;
}
function getGlobalFieldValue(fieldId, card) {
    let globalData = getGlobalFieldData(fieldId, card);
    return globalData
        ? globalData.value
        : false;
}
function getGlobalField(fieldId, fields) {
    return fields.reduce( (found, current) => current.id === fieldId ? current : found, false);
}


export {zeroPad, sortByIndex, getCardFieldValue, getCardFieldPluginData, clone, getGlobalFieldData, getGlobalFieldValue, getGlobalField}
