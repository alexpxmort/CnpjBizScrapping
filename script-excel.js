const fs = require('fs')

const { writeXLS } = require('./helper/excel');


(async () => {
  
  //let result = await convertCsvToJson(csvFilePath)
  let result = fs.readFileSync('output.json','utf-8')
  result = JSON.parse(result)
   result = result.filter((val) => val?.whatsLink)


   result = result.map(({cnpj,nome,phone,whatsLink,socio}) =>({
    cnpj,
    nome,
    phone,
    whatsLink,
    socio:socio?.trim()?.split('-')?.[0] ?? `${nome}`
   }))

   const xlsFileName = 'contatos-pagina-1.xls';
const xlsSheetName = 'Planilha1';
const xlsHeader = ['Cnpj','Nome','Phone','WhatsLink','Socio'];


// Chamada da função helper
await writeXLS(xlsFileName, xlsSheetName, xlsHeader, result);

})();
