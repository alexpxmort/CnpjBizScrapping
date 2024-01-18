const express = require('express');
const multer = require('multer');
const csvtojson = require('csvtojson');
const path = require('path');
const app = express();

const dotenv = require('dotenv');
const { visitPagesSequentially } = require('../helper');
const { writeXLS } = require('../helper/excel');

dotenv.config();

const port = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const puppeteer = require('puppeteer');

const scrapeLogic = async (res) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();

    await page.goto("https://developer.chrome.com/");

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Type into search box
    await page.type(".search-box__input", "automate beyond recorder");

    // Wait and click on first result
    const searchResultSelector = ".search-box__link";
    await page.waitForSelector(searchResultSelector);
    await page.click(searchResultSelector);

    // Locate the full title with a unique string
    const textSelector = await page.waitForSelector(
      "text/Customize and automate"
    );
    const fullTitle = await textSelector.evaluate((el) => el.textContent);

    // Print the full title
    const logStatement = `The title of this blog post is ${fullTitle}`;
    console.log(logStatement);
    res.send(logStatement);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};


const processFiles = async function* (data) {
  for (const row of data) {
    try {
      // Your processing logic here
      console.log('Processing row:', row);
      const result = await visitPagesSequentially([row]); // Assuming visitPagesSequentially returns a promise

      // Simulate some asynchronous processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      yield { status: 'success', result, row };
    } catch (error) {
      console.log(error);
      yield { status: 'error', error, row };
    }
  }
};

app.post('/upload', upload.single('csvFile'), async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).send('Nenhum arquivo foi enviado.');
    }

    const buffer = req.file.buffer;

    // Convertendo o conteúdo do arquivo CSV para JSON
    const jsonResult = await csvtojson().fromString(buffer.toString());

    let result = [];
    const processor = processFiles(jsonResult.slice(0,2));

    // Iterate over the generator function
    for await (const processedData of processor) {
      result.push(processedData.result.map((data) =>data));
    }

result = result.flat()
    
   result = result.map(({cnpj,nome,phone,whatsLink,socio}) =>({
    cnpj,
    nome,
    phone,
    whatsLink,
    socio:socio?.trim()?.split('-')?.[0] ?? `${nome}`
   }))

   const xlsFileName = 'contatos-pagina-1-teste.xls';
  const xlsSheetName = 'Planilha1';
  const xlsHeader = ['Cnpj','Nome','Phone','WhatsLink','Socio'];


// Chamada da função helper
  await writeXLS(xlsFileName, xlsSheetName, xlsHeader,  result.flat());

  const filePath = path.join(__dirname, xlsFileName);

  res.download(filePath, 'output.xlsx', (error) => {
    if (error) {
      console.error('Erro ao enviar o arquivo para o cliente:', error);
      res.status(500).send('Erro ao enviar o arquivo.');
    } else {
      console.log('Arquivo enviado com sucesso.');
       fs.unlinkSync(filePath);
    }
  });

  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao processar o arquivo CSV.');
  }
});
app.get("/scrape", (req, res) => {
  scrapeLogic(res);
});

app.listen(port, async() => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  
});
