import * as fs from 'fs';
import trim from 'lodash/trim.js'

export function generateOutputFile(headerArray, tableOfAutomatas, keywordStatements, tokenStatements){
  const outputFileLines = [];

  outputFileLines.push(`import promptSync from "prompt-sync";`);
  outputFileLines.push("\n");
  outputFileLines.push(`import { readTestFile } from "../FileGenerator/FileGenerator.js";`);
  outputFileLines.push("\n");
  outputFileLines.push(`import { getTokens } from "../LexicalAnalizer/LexicalAnalizer.js";`);
  outputFileLines.push("\n")
  outputFileLines.push(`import { CHR } from "../utils/functions.js";`);
  outputFileLines.push("\n");
  outputFileLines.push(`const prompt = promptSync();`);
  outputFileLines.push("\n");
  outputFileLines.push("import * as fs from 'fs';")
  outputFileLines.push("\n");
  outputFileLines.push("\n");
  outputFileLines.push("// FILENAME");
  outputFileLines.push("\n");
  outputFileLines.push(`let fileName = "${headerArray[0]}";`);
  outputFileLines.push("\n");
  outputFileLines.push("\n");
  outputFileLines.push("// TOKENS");
  outputFileLines.push("\n");
  outputFileLines.push("const tokenAutomatas = {");
  outputFileLines.push("\n");

  // write the tableofAutomatas to the other file
  for (let token in tableOfAutomatas){
    outputFileLines.push("\t");
    outputFileLines.push(`${token} : ${tableOfAutomatas[token]},`);
    outputFileLines.push("\n");
  }
  outputFileLines.push("}");
  outputFileLines.push("\n");
  outputFileLines.push("\n");
  outputFileLines.push(`console.log("tokenAutomatas -> ", tokenAutomatas);`);
  outputFileLines.push("\n");
  outputFileLines.push("\n");
  outputFileLines.push(`const testFileRelativePath = prompt("Ingrese el path relativo del archivo .txt que desea evaluar (revise la carpeta llamada txts) >> ");`);
  outputFileLines.push("\n");
  outputFileLines.push("\const testFileLines = readTestFile(testFileRelativePath);");
  outputFileLines.push("\n");
  outputFileLines.push("\n");
  outputFileLines.push(`const tokens = getTokens(testFileLines, tokenAutomatas);`);
  outputFileLines.push("\n");
  outputFileLines.push("\n");
  outputFileLines.push(`// console.log("tokens -> ", tokens);`);
  outputFileLines.push("\n");
  outputFileLines.push("\n");
  outputFileLines.push(`const jsonOfTokens = JSON.stringify(tokens)`);
  outputFileLines.push("\n");
  outputFileLines.push("\n");
  outputFileLines.push(`fs.writeFileSync('./tokens/tokens.json', jsonOfTokens, 'utf8')`);
  outputFileLines.push("\n");
  outputFileLines.push("\n");
  outputFileLines.push(`console.log("los tokens se han guardado exitosamente en  '/tokens/tokens.js'");`);

  return outputFileLines;
}

export function readTestFile(testFileRelativePath){
  const testFileLines = [];

  const readFile = fs.readFileSync(testFileRelativePath, "utf-8");

  readFile.split(/\r?\n/).forEach(line =>  {
    if (trim(line).length !== 0){
      testFileLines.push(trim(line).replaceAll("\t", "→"));
    }
  });

  return testFileLines;
}