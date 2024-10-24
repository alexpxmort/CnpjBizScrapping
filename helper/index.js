const csvtojson = require('csvtojson');

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const fs = require('fs');



let lowercaseArray = (originalArray) => originalArray.map(obj => (
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key.toLowerCase(), value])
  )
));

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
      
        const paragraphs = await page.evaluate(el => {
          const parent = el.parentElement; // Pega o elemento pai
          const childParagraphs = parent.querySelectorAll('p'); // Seleciona todos os <p> filhos
  
          // Extrai o texto de todos os parágrafos filhos
          return Array.from(childParagraphs).map(p => p.textContent.trim());
        }, link);

        paragraphs?.forEach((val)=>{
          resultLinks.push(val?.split('-')?.[0]?.trim());
        })

          
      }
  }

  return resultLinks;
};

const visitPagesSequentially = async (result,saveFile = undefined) => {
  const results  = [ ]
  for (const item of result) {
      try {

          const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath:
            puppeteer.executablePath(),
  
          });

          const page = await browser.newPage();

          // Configurar o agente de usuário personalizado
          await page.setUserAgent(USER_AGENT);

          if(!item?.link ||  !isURLValid(item?.link ?? '')){
            console.log('erro invalid link')
            return
          }

          await page.goto(item?.link , { waitUntil: 'domcontentloaded' });

          const socios = await extractDataFromParagraph(page, 'label');
          let links = await extractDataFromLinks(page, 'a');
          links = links?.filter((link) => link.includes('phone='));
          const phone = links.map((link) => link.split('phone=')[1])?.[0];

          const title = await page.title();
          console.log(`Título da página: ${title}`);

          item.phone = phone;
          item.whatsLink =  links[0];
          item.socio = socios[0];

          if (!item.whatsLink) {
            console.log('noZap')
            console.log(item)
              item.whatsLink = null;
              item.noZap = true;
              await browser.close();
              continue;
          }
          console.log('item')
          console.log(item)

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


module.exports ={convertCsvToJson,delay,removeDuplicatesWithPriority,removerMascaraCNPJ,isURLValid,visitPagesSequentially,lowercaseArray}