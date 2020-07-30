const readline = require('readline');
const fs = require('fs');

function readLineByLine(file, getItemCallback) {
    let results = [];

    return new Promise(resolve => {
        const readInterface = readline.createInterface({
            input: fs.createReadStream(file),
            output: false,
            console: false
        });

        readInterface.on('line', (line) => {
            let item = getItemCallback(line);
            if (item !== false && results.indexOf(item) === -1) {
                results.push(item);
            }
        });

        readInterface.on('close', () => resolve(results));
    });
}

function filterNameItemsByCount(line) {
    let item = JSON.parse(line);

    if (item.count > 10) {
        return item.text.toLocaleLowerCase();
    }

    return false;
}

function getCityNames() {
    let cities = JSON.parse( fs.readFileSync('russian-cities.json') );
    return cities.map( city => city.name.toLocaleLowerCase() );
}

(async () => {
    let firstNames = await readLineByLine(__dirname+'/russiannames_db_jsonl/names.jsonl', filterNameItemsByCount);
    let surNames = await readLineByLine(__dirname+'/russiannames_db_jsonl/midnames.jsonl', filterNameItemsByCount);
    let familyNames = await readLineByLine(__dirname+'/russiannames_db_jsonl/surnames.jsonl', filterNameItemsByCount);
    let cities = getCityNames();

    let config = {firstNames, surNames, familyNames, cities};
    fs.writeFileSync('config.js', 'module.exports = '+JSON.stringify(config));
})();
