const fs = require('fs')

const { writeXLS } = require('./helper/excel');


(async () => {
  
  //let result = await convertCsvToJson(csvFilePath)
  let result = fs.readFileSync('output.json','utf-8')
  result = JSON.parse(result)
   result = result.filter((val) => val?.whatsLink)


   result = result.map(({cnpj,nome,phone,whatsLink}) =>({
    cnpj,
    nome,
    phone,
    whatsLink
   }))

   const xlsFileName = 'contatos-pagina-1.xls';
const xlsSheetName = 'Planilha1';
const xlsHeader = ['Cnpj','Nome','Phone','WhatsLink'];


// Chamada da função helper
await writeXLS(xlsFileName, xlsSheetName, xlsHeader, result);

})();
