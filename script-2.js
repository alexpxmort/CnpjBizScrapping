const puppeteer = require('puppeteer');
const {   removeDuplicatesWithPriority, removerMascaraCNPJ, isURLValid, visitPagesSequentially } = require('./helper');
const fs = require('fs');


(async () => {
    try {
        let result = fs.readFileSync('output.json','utf-8')
        result = JSON.parse(result)
        //result = removeDuplicatesWithPriority(result, 'cnpj', 'whatsLink');
        //fs.writeFileSync('output.json', JSON.stringify(result, null, 2));

        result = result.filter((val) => !val?.hasOwnProperty('whatsLink'));
        const saveFile = (result) => {
            const jsonString = JSON.stringify(result, null, 2);
            fs.writeFileSync('output2.json', jsonString);
        };
        
        await visitPagesSequentially(result,saveFile);
    } catch (error) {
      
    }
})();



