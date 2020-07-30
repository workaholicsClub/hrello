const {parseDir} = require('./parser');

(async () => {
    console.log('Поехали');

    let results = await parseDir(__dirname + '/uploads', (result) => {
        console.log(result);
    }, (error) => {
        console.error(error);
    });

    fs.writeFileSync('results.json', JSON.stringify(results));
})();

