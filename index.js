import promptSync from 'prompt-sync';
import reverse from 'lodash/reverse.js';
import trim from 'lodash/trim.js';
import * as fs from 'fs';

import { removeComments, getCharacterStatements, getKeywordStatements, getProductionStatements, getTokenStatements } from './FileReader/FileReader.js';
import { getCharactersAutomatas, getKeywordsAutomatas, getProductionAdditionalTokens, getTokenAutomatas, getTableOfAutomatas, getAdditionalTokenAutomatas } from './AutomataCreator/AutomataCreator.js';
import { generateLexicalFile, generateParserFile } from './FileGenerator/FileGenerator.js';


const prompt = promptSync();

console.log("\n-------------------------------------------");
console.log("        +++ Analizador Sintáctico +++          ");
console.log("-------------------------------------------");
console.log("\nEste analizador funciona de la siguiente forma \n");
console.log("\n1. Se le solicitará el path(relativo) de el archivo con extensión .ATG que desea analizar (los archivos de prueba se encuentran en la carpeta /in)");
console.log("\n2. Se generará un archivo compilable con el mismo nombre pero con extensión .js en la carpeta /out");
console.log("\n3. Usted deberá correr el archivo que se generó ingresando en la terminal -> node ./out/[nombre-archivo].js");
console.log("\n4. Las instrucciones para ejecutar dicho archivo serán provistas una vez que lo ejecute");
console.log("");

const header = [];
const characters = [];
const keywords = [];
const tokens = [];
const productions = [];
const end = [];

const fileRelativePath = prompt("Ingrese el path relativo del archivo >> ");
// const fileRelativePath = "in/ArchivoPrueba0.atg"

const rawInputFileLines = []

const readFile = fs.readFileSync(fileRelativePath, "utf-8");

readFile.split(/\r?\n/).forEach(line =>  {
  if (trim(line).length !== 0){
    rawInputFileLines.push(trim(line));
  }
});

const inputFileLines = removeComments(rawInputFileLines);

for (let lineIndex = 0; lineIndex < inputFileLines.length; lineIndex++){
  if (inputFileLines[lineIndex].includes("COMPILER")){
    header.push(inputFileLines[lineIndex].split(" ")[1])
  }

  else if (inputFileLines[lineIndex].includes("CHARACTERS")){
    for (let currIndex = lineIndex + 1; currIndex < inputFileLines.length; currIndex++){
      if (inputFileLines[currIndex].includes("KEYWORDS") || inputFileLines[currIndex].includes("KEYWORDS")){
        break
      } else {
        characters.push(inputFileLines[currIndex])
      }
    }
  }

  else if (inputFileLines[lineIndex].includes("KEYWORDS") && !inputFileLines[lineIndex].includes("EXCEPT")){
    for (let currIndex = lineIndex + 1; currIndex < inputFileLines.length; currIndex++){
      if (inputFileLines[currIndex].includes("TOKENS")){
        break;
      } else {
        keywords.push(inputFileLines[currIndex])
      }
    }
  }

  else if (inputFileLines[lineIndex].includes("TOKENS")){
    for (let currIndex = lineIndex + 1; currIndex < inputFileLines.length; currIndex++){
      if (inputFileLines[currIndex].includes("PRODUCTIONS")){
        break
      } else {
        tokens.push(inputFileLines[currIndex])
      }
    }
  }

  else if (inputFileLines[lineIndex].includes("PRODUCTIONS")){
    for (let currIndex = lineIndex + 1; currIndex < inputFileLines.length; currIndex++){
      if (inputFileLines[currIndex].includes("END")){
        break
      } else {       
        productions.push(inputFileLines[currIndex])
      }
    }
  }

  else if (inputFileLines[lineIndex].includes("END")){
    end.push(inputFileLines[lineIndex].split(" ")[1])
  }
}


// SEPARATE PARTS OF FILE INTO STATEMENTS
const characterStatements = getCharacterStatements(characters);
const tokenStatements = getTokenStatements(tokens)
const keywordStatements = getKeywordStatements(keywords);
const productionStatements = getProductionStatements(productions);
const additionalTokens = getProductionAdditionalTokens(productionStatements)

// GET AUTOMATAS OF EACH COMPONENT
const characterAutomatas = getCharactersAutomatas(characterStatements);
const keywordAutomatas = getKeywordsAutomatas(keywordStatements);
const tokenAutomatas = getTokenAutomatas(reverse(tokens), characterAutomatas);
const additionalTokenAutomatas = getAdditionalTokenAutomatas(additionalTokens);

const tableOfAutomatas = getTableOfAutomatas(keywordAutomatas, tokenAutomatas, additionalTokenAutomatas);

const lexicalFileLines = generateLexicalFile(header, tableOfAutomatas);
const writeStreamLexical = fs.createWriteStream(`./outLexical/${header[0]}.js`);
lexicalFileLines.forEach((line) => writeStreamLexical.write(line));
console.log(`Se generó el archivo de análisis léxico -----> ./outLexical/${header[0]}.js`);

const syntacticFileLines = generateParserFile(productionStatements, keywordStatements, tokenStatements);
const writeStreamSyntactic = fs.createWriteStream(`./outSyntactic/${header[0]}.py`);
writeStreamSyntactic.write(syntacticFileLines)
console.log(`Se generó el archivo de análisis sintáctico -----> ./outSyntactic/${header[0]}.py`);