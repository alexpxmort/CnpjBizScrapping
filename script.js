const {  removeDuplicatesWithPriority } = require('./helper');
const fs = require('fs');

(async () => {

  let result = fs.readFileSync('output.json','utf-8')
  result = JSON.parse(result)

  result = removeDuplicatesWithPriority(result, 'cnpj','whatsLink');

  fs.writeFileSync('output.json',JSON.stringify(result,null,2))
 
})();
