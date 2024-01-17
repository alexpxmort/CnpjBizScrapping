const xl = require('excel4node');

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

module.exports = { writeXLS };
