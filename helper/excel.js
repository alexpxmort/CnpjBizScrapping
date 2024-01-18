const xl = require('excel4node');
const { promisify } = require('util');


// Função helper para escrever em um arquivo Excel (.xls)
async function writeXLS(fileName, sheetName, header, data) {
  return new Promise((resolve, reject) => {
    try {
      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // Estiliza o cabeçalho
      const headerStyle = workbook.createStyle({
        font: {
          bold: true,
          color: '000000',
          size: 12,
        },
        fill: {
          type: 'pattern',
          patternType: 'solid',
          fgColor: 'FFFF00',
        },
      });

      // Adiciona o cabeçalho com estilo
      header.forEach((item, colIndex) => {
        worksheet.cell(1, colIndex + 1).string(item).style(headerStyle);
      });

      // Adiciona os dados
      data.forEach((rowData, rowIndex) => {
        Object.keys(rowData).forEach((key, colIndex) => {
          worksheet.cell(rowIndex + 2, colIndex + 1).string(rowData[key]?.toString() ?? '');
        });
      });

      // Salva o arquivo Excel
      workbook.write(fileName, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}






// Função helper para obter uma string base64 de um arquivo Excel (.xls)
async function getXLSBase64(sheetName, header, data) {
  return await new Promise((resolve, reject) => {
    try {
      console.log('aqui')
      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // Estiliza o cabeçalho
      const headerStyle = workbook.createStyle({
        font: {
          bold: true,
          color: '000000',
          size: 12,
        },
        fill: {
          type: 'pattern',
          patternType: 'solid',
          fgColor: 'FFFF00',
        },
      });

      // Adiciona o cabeçalho com estilo
      header.forEach((item, colIndex) => {
        worksheet.cell(1, colIndex + 1).string(item).style(headerStyle);
      });

      // Adiciona os dados
      data.forEach((rowData, rowIndex) => {
        Object.keys(rowData).forEach((key, colIndex) => {
          worksheet.cell(rowIndex + 2, colIndex + 1).string(rowData[key]?.toString() ?? '');
        });
      });

      // Obtém o buffer do arquivo Excel
      workbook.writeToBuffer((error, buffer) => {
        if (error) {
          console.log('err')
          console.log(error)
          reject(error);
        } else {
          // Converte o buffer para uma string base64
          const base64String = buffer.toString('base64');
          resolve(base64String);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

ChatGPT
O código parece bem estruturado, mas algumas otimizações podem ser implementadas. Aqui estão algumas sugestões:

Async/Await Consistente: Você já está usando async/await na função, mas considere remover o async na declaração da função, pois você está usando await em uma única promessa. Isso simplifica a leitura do código.
javascript
Copy code
function getXLSBase64(sheetName, header, data) {
  return new Promise((resolve, reject) => {
    try {
      // ... restante do código ...
    } catch (error) {
      reject(error);
    }
  });
}
Utilização de Promise.promisify: Em vez de usar um construtor de promessas manualmente, você pode considerar o uso de Promise.promisify do módulo util para converter funções de callback em funções de promessa.
javascript
Copy code
const { promisify } = require('util');
const writeToBufferAsync = promisify(workbook.writeToBuffer.bind(workbook));

// ...

await writeToBufferAsync()
  .then((buffer) => {
    const base64String = buffer.toString('base64');
    resolve(base64String);
  })
  .catch((error) => reject(error));
Uso de Operador Nullish Coalescing: Em vez de usar o operador lógico OR (||) para fornecer um valor padrão quando rowData[key] é nulo ou indefinido, considere usar o operador nullish coalescing (??), pois ele é mais preciso ao verificar nulidade ou indefinição.
javascript
Copy code
worksheet.cell(rowIndex + 2, colIndex + 1).string(rowData[key]?.toString() ?? '');
Essas são apenas algumas sugestões para melhorar a clareza e a eficiência do seu código. Certifique-se de testar qualquer alteração para garantir que não afete o comportamento esperado.




User
Melhore todo código 

ChatGPT
Vamos refatorar o código para melhorar sua legibilidade e eficiência:

javascript
Copy code
const xl = require('excel4node');
const { promisify } = require('util');

function getXLSBase64(sheetName, header, data) {
  return new Promise(async (resolve, reject) => {
    try {
      const workbook = new xl.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);

      // Estiliza o cabeçalho
      const headerStyle = workbook.createStyle({
        font: {
          bold: true,
          color: '000000',
          size: 12,
        },
        fill: {
          type: 'pattern',
          patternType: 'solid',
          fgColor: 'FFFF00',
        },
      });

      // Adiciona o cabeçalho com estilo
      header.forEach((item, colIndex) => {
        worksheet.cell(1, colIndex + 1).string(item).style(headerStyle);
      });

      // Adiciona os dados
      data.forEach((rowData, rowIndex) => {
        Object.keys(rowData).forEach((key, colIndex) => {
          worksheet.cell(rowIndex + 2, colIndex + 1).string(rowData[key]?.toString() ?? '');
        });
      });

      const writeToBufferAsync = promisify(workbook.writeToBuffer.bind(workbook));

      try {
        // Obtém o buffer do arquivo Excel
        const buffer = await writeToBufferAsync();
        // Converte o buffer para uma string base64
        const base64String = buffer.toString('base64');
        resolve(base64String);
      } catch (error) {
        reject(error);
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Exemplo de uso:
// const sheetName = 'Sheet1';
// const header = ['Column1', 'Column2', 'Column3'];
// const data = [{ Column1: 'A1', Column2: 'B1', Column3: 'C1' }, { Column1: 'A2', Column2: 'B2', Column3: 'C2' }];
// getXLSBase64(sheetName, header, data)
//   .then(base64 => console.log(base64))
//   .catch(error => console.error(error));
Essas melhorias incluem uma estrutura mais organizada, a utilização de promisify para transformar a função writeToBuffer em uma versão assíncrona e o uso de try...catch para lidar com erros de maneira mais eficaz. Certifique-se de adaptar o exemplo de uso com os dados reais do seu aplicativo.




User
Ela seja async

ChatGPT
Peço desculpas pela confusão anterior. Vamos ajustar a função para usar async/await corretamente:

javascript
Copy code
const xl = require('excel4node');
const { promisify } = require('util');

async function getXLSBase64(sheetName, header, data) {
  try {
    const workbook = new xl.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Estiliza o cabeçalho
    const headerStyle = workbook.createStyle({
      font: {
        bold: true,
        color: '000000',
        size: 12,
      },
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: 'FFFF00',
      },
    });

    // Adiciona o cabeçalho com estilo
    header.forEach((item, colIndex) => {
      worksheet.cell(1, colIndex + 1).string(item).style(headerStyle);
    });

    // Adiciona os dados
    data.forEach((rowData, rowIndex) => {
      Object.keys(rowData).forEach((key, colIndex) => {
        worksheet.cell(rowIndex + 2, colIndex + 1).string(rowData[key]?.toString() ?? '');
      });
    });

    const writeToBufferAsync = promisify(workbook.writeToBuffer.bind(workbook));

    // Obtém o buffer do arquivo Excel
    const buffer = await writeToBufferAsync();
    // Converte o buffer para uma string base64
    const base64String = buffer.toString('base64');
    return base64String;
  } catch (error) {
    throw error;
  }
}

module.exports = { writeXLS,getXLSBase64 };
