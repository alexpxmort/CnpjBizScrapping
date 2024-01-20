const express = require('express');
const multer = require('multer');
const csvtojson = require('csvtojson');
const app = express();
const cors = require('cors')
const dotenv = require('dotenv');
const { visitPagesSequentially, lowercaseArray } = require('../helper');
const {  getXLSBase64ExcelJs } = require('../helper/excel');

dotenv.config();

const port = process.env.PORT || 3000;

const upload = multer();


const puppeteer = require('puppeteer');
const { arrayObjectToCSVBuffer } = require('../helper/csv');

const scrapeLogic = async (res) => {
  const browser = await puppeteer.launch({
  headless: 'new',
          args: ['--no-sandbox'],
    executablePath:
        puppeteer.executablePath(),

  });
  try {
    const page = await browser.newPage();

    await page.goto("https://github.com");

    

    
    const fullTitle = await page.title()

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
      // await new Promise((resolve) => setTimeout(resolve, 800));

      yield { status: 'success', result, row };
    } catch (error) {
      console.log(error);
      yield { status: 'error', error, row };
    }
  }
};

app.use(cors())
app.post('/data-house',upload.single('data'),async(req,res)=>{

  const buffer = req.file.buffer;
  let json  = JSON.parse(buffer.toString())
  const cnpjs = json.data.cnpj?.map(({cnpj,nome_fantasia,razao_social}) => ({
    cnpj,
    nome: razao_social !="" ? razao_social : nome_fantasia,
    link:`http://cnpj.biz/${cnpj}`
  }))
 
  const data = await arrayObjectToCSVBuffer(cnpjs)
  return res.json({data})

  
})

app.post('/upload/:limit', upload.single('csvFile'), async (req, res) => {
  try {
    const {limit} = req.params
    console.log('limit',limit)
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).send('Nenhum arquivo foi enviado.');
    }

    const buffer = req.file.buffer;


  
    // Convertendo o conteúdo do arquivo CSV para JSON
    let jsonResult = await csvtojson().fromString(buffer.toString());
    jsonResult = lowercaseArray(jsonResult)

    jsonResult = jsonResult.filter((val) => !val?.whatslink)
    jsonResult = jsonResult.slice(0,limit)

    let result = [];
    const processor = processFiles(jsonResult);

    // Iterate over the generator function
    for await (const processedData of processor) {
      result.push(processedData.result.map((data) =>data));
    }

result = result.flat()
    

   result = result.map(({cnpj,nome,phone,whatsLink}) =>({
    cnpj,
    nome,
    phone,
    whatsLink
   }))

  const xlsSheetName = 'Planilha1';
  const xlsHeader = ['Cnpj','Nome','Phone','WhatsLink','Socio'];




  if(result.flat().length > 0){
    console.log('result')
    console.log(result.flat())
    const data = await getXLSBase64ExcelJs(xlsSheetName,xlsHeader,result.flat())
    return res.json({data})
  }else{
    return res.json({data:[]})
  }
  
 

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
