const csvtojson = require('csvtojson');

const fs = require('fs');

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';


const delay = async (milliseconds) => {
  return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
  });
};
// Função para remover duplicatas de um array de objetos com base em uma chave
const removeDuplicatesWithPriority = (array, key, priorityProp) => {
  const uniqueKeys = new Set();
  const uniqueObjects = [];

  array.forEach(item => {
      const keyValue = item[key];
      const hasPriorityProp = item.hasOwnProperty(priorityProp);

      if (!uniqueKeys.has(keyValue)) {
          uniqueKeys.add(keyValue);
          uniqueObjects.push(item);
      } else if (hasPriorityProp) {
          // Substitui o objeto existente se o novo tiver a propriedade de prioridade
          const index = uniqueObjects.findIndex(obj => obj[key] === keyValue);
          if (index !== -1) {
              uniqueObjects[index] = item;
          }
      }
  });

  return uniqueObjects;
};


// Função para converter CSV para JSON
const convertCsvToJson = async (csvFilePath) => {
    try {
      const jsonArray = await csvtojson({
        delimiter:',',
        ignoreEmpty:true
      }).fromFile(csvFilePath);
      return jsonArray;
    } catch (error) {
        throw new Error(error.message || error);
    }
};

function removerMascaraCNPJ(cnpj) {
  // Remove caracteres que não são dígitos
  const cnpjSemMascara = cnpj.replace(/\D/g, '');

  // Verifica se o CNPJ possui a quantidade correta de dígitos
  if (cnpjSemMascara.length !== 14) {
      throw new Error("CNPJ deve conter 14 dígitos após a remoção da máscara");
  }

  return cnpjSemMascara;
}

function isURLValid(url) {
  // Expressão regular para verificar se a string se parece com uma URL
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

  return urlRegex.test(url);
}


const extractDataFromLinks = async (page, linksSelector) => {
  const links = await page.$$(linksSelector);
  let resultLinks = [];

  for (const link of links) {
      const linkHref = await page.evaluate(el => el.href, link);

      if (linkHref.includes('whats')) {
          resultLinks.push(linkHref);
      }
  }

  return resultLinks;
};

const extractDataFromParagraph = async (page, linksSelector) => {
  const links = await page.$$(linksSelector);
  let resultLinks = [];

  for (const link of links) {
      const linkText = await page.evaluate(el => el.textContent, link);

      if (linkText.toLowerCase().includes('sócio')) {
          resultLinks.push(linkText);
      }
  }

  return resultLinks;
};

const visitPagesSequentially = async (result,saveFile = undefined) => {
  const results  = [ ]
  for (const item of result) {
      try {

        let options = {};

        if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
          options = {
            args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: 'new',
            ignoreHTTPSErrors: true,
          };
        }
          const browser = await puppeteer.launch(options);

          const page = await browser.newPage();

          // Configurar o agente de usuário personalizado
          await page.setUserAgent(USER_AGENT);

          await page.goto(isURLValid(item.link) ?item.link: `https://cnpj.biz/${removerMascaraCNPJ(item.cnpj)}`, { waitUntil: 'domcontentloaded' });

          const socios = await extractDataFromParagraph(page, 'p');
          let links = await extractDataFromLinks(page, 'a');
          links = links?.filter((link) => link.includes('phone='));
          const phone = links.map((link) => link.split('phone=')[1])?.[0];

          const title = await page.title();
          console.log(`Título da página: ${title}`);

          item.phone = phone;
          item.whatsLink = links[0];
          item.socio = socios[0];

          if (!item.whatsLink) {
              item.whatsLink = null;
              item.noZap = true;
              await browser.close();
              continue;
          }

          results.push(item)

          if(saveFile!=undefined){
            saveFile(result.filter((item) => item.whatsLink))

          }


          
          await browser.close();
      } catch (err) {
          console.error(err);
      }

  }
  return results

};


module.exports ={convertCsvToJson,delay,removeDuplicatesWithPriority,removerMascaraCNPJ,isURLValid,visitPagesSequentially}