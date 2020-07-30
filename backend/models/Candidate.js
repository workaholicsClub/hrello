module.exports = class Candidate {
    constructor(fields) {
        this.fields = fields;

        if (this.fields['_id']) {
            delete this.fields['_id'];
        }
    }

    name() {
        return this.fields.name || false;
    }

    getCardFields() {
        let fieldsWithValues = [];

        if (this.fields.salary) {
            fieldsWithValues.push({name: 'Желаемая зарплата', value: this.fields.salary.value+' '+this.fields.salary.currency});
        }

        let fieldMappings = [
            {name: 'Желаемая позиция', key: ['position']},
            {name: 'Город', key: ['city']},
            {name: 'Возраст', key: ['age']},
            {name: 'Email', key: ['contacts', 'email']},
            {name: 'Телефон', key: ['contacts', 'phone']},
            {name: 'Skype', key: ['contacts', 'skype']},
            {name: 'Telegram', key: ['contacts', 'telegram']},
            {name: 'WhatsApp', key: ['contacts', 'whatsapp']},
            {name: 'Facebook', key: ['social', 'facebook']},
            {name: 'VK', key: ['social', 'vk']},
            {name: 'LinkedIn', key: ['social', 'linkedin']},
            {name: 'GitHub', key: ['social', 'github']},
        ]

        for (const fieldMapping of fieldMappings) {
            let value = fieldMapping.key.reduce( (result, key) => {
                if (result && result[key]) {
                    return result[key];
                }
                else {
                    return false;
                }
            }, this.fields);

            if (value) {
                if (value instanceof Array) {
                    value = value.join(', ');
                }
                fieldsWithValues.push({
                    name: fieldMapping.name,
                    fieldType: fieldMapping.fieldType || 'text',
                    value
                });
            }
        }

        return fieldsWithValues;
    }
}