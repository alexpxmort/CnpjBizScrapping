const {  removeDuplicatesWithPriority } = require('./helper');
const fs = require('fs');
const { readExcel } = require('./helper/excel');

(async () => {

  let result = fs.readFileSync('docs/contatos-planilha-pagina-1.xlsx')

  const jsonArr = await readExcel(result);

 
  const resultJson = {
    data:{
      cnpj:jsonArr.map((val) => ({
        cnpj:val.Cnpj,
        razao_social:val.Nome,
      }))
    }
  }
console.log(resultJson.data.cnpj.length)
  //fs.writeFileSync('companies.json',JSON.stringify(resultJson,null,2))
 
})();
