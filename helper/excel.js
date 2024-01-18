const xl = require('excel4node');
const ExcelJS = require('exceljs');


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


    // Obtém o buffer do arquivo Excel
    const buffer =await workbook.writeToBuffer();
    // Converte o buffer para uma string base64
    const base64String = buffer.toString('base64');
    return base64String;
  } catch (error) {
    throw error;
  }
}



async function getXLSBase64ExcelJs(sheetName, header, data) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Estiliza o cabeçalho
    const headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: '000000' }, size: 12 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
    });

    // Adiciona os dados
    data.forEach((rowData) => {
      worksheet.addRow(Object.values(rowData));
    });

    // Obtém o buffer do arquivo Excel
    const buffer = await workbook.xlsx.writeBuffer();

    // Converte o buffer para uma string base64
    const base64String = buffer.toString('base64');
    return base64String;
  } catch (error) {
    throw error;
  }
}
module.exports = { writeXLS,getXLSBase64,getXLSBase64ExcelJs };
