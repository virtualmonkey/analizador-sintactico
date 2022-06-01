import * as fs from 'fs';
import trim from 'lodash/trim.js'
import { constants } from '../utils/constants.js'

export function generateLexicalFile(headerArray, tableOfAutomatas){
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
  outputFileLines.push(`console.log("los tokens se han guardado exitosamente en  tokens/tokens.json");`);

  return outputFileLines;
}

export function generateParserFileHeader(string){
  let newString = string;

  newString += "# The structure of this file was taken from https://gist.github.com/ascv/5022712\n"
  newString += "# Also from https://gist.github.com/urielha/6c11c29073dddbb9a0b9a1b92c1af3be\n"
  newString += "import json\n\n"

  newString += "def getTokens(fileRelativePath):\n"
  newString += "\ttokens = []\n"
  newString += "\tf = open(fileRelativePath)\n"
  newString += "\ttokens = json.load(f)\n"
  newString += "\treturn tokens\n\n"

  newString += "class Parser:\n"

  newString += "\tdef __init__(self, tokens):\n"
  newString += "\t\tself.tokens = tokens\n"
  newString += "\t\tself.i = 0\n"
  newString += "\t\tself.current = tokens[0]\n"
  newString += "\t\tself.lastToken = None\n\n"

  newString += "\tdef next(self):\n"
  newString += "\t\tself.i += 1\n"
  newString += "\t\tif self.i < len(self.tokens):\n"
  newString += "\t\t\tself.current = self.tokens[self.i]\n"
  newString += "\t\t\tself.lastToken = self.tokens[self.i - 1]\n\n"

  newString += "\tdef exp(self, function, arguments = None):\n"
  newString += "\t\tcurrentToken = self.i\n"
  newString += "\t\tcanContinue = False\n"
  newString += "\t\tif function != None:\n"
  newString += "\t\t\ttry:\n"
  newString += "\t\t\t\tfunctionReturnValue = function() if arguments == None else function(arguments)\n"
  newString += "\t\t\t\tcanContinue = functionReturnValue if type(functionReturnValue) == bool else True\n"
  newString += "\t\t\texcept:\n"
  newString += "\t\t\t\tcanContinue = False\n"
  newString += "\t\tself.i = currentToken\n"
  newString += "\t\ttry: self.current = self.tokens[self.i]\n"
  newString += "\t\texcept: exit()\n"
  newString += "\t\tself.lastToken = self.tokens[self.i - 1]\n"
  newString += "\t\treturn canContinue\n\n"

  newString += "\tdef scan(self, token, hasType = False):\n"
  newString += "\t\tif hasType:\n"
  newString += `\t\t\tif self.current["type"] == token:\n`
  newString += "\t\t\t\tself.next()\n"
  newString += "\t\t\t\treturn True\n"
  newString += "\t\t\treturn False\n"
  newString += "\t\telse:\n"
  newString += `\t\t\tif self.current["value"] == token:\n`
  newString += "\t\t\t\tself.next()\n"
  newString += "\t\t\t\treturn True\n"
  newString += "\t\t\treturn False\n\n"

  return newString;
}

export function expFixFunctionCall(string){
  let lines = string.split("\n");
  let finalString = "";

  for (let line of lines){
    if (line.includes("self.exp(") && !line.includes("while")){
      let lineWithOpenParenthesis = line.replace("(", "?").split("?");
      finalString += lineWithOpenParenthesis[0] +  "(";
      let funcArgs = lineWithOpenParenthesis[1].replace("(", "?").split("?");
      let secondArg = funcArgs[1].replaceAll(")", "");
      secondArg = secondArg.replaceAll(":", "");
      finalString += funcArgs[0] + "," + secondArg + "):\n"
    }

    else if (line.includes("self.exp(") && line.includes("while")){
      let arraySeparatedByOr = line.split("or");
      for (let ortSide of arraySeparatedByOr){
        let lineWithOpenParenthesis = ortSide.replace("(", "?").split("?");
        finalString += lineWithOpenParenthesis[0] +  "(";
        let funcArgs = lineWithOpenParenthesis[1].replace("(", "?").split("?");
        let secondArg = funcArgs[1].replaceAll(")", "");
        finalString += funcArgs[0] + "," + secondArg.substring(0, secondArg.length - 1) + ") or";
      }

      finalString = finalString.substring(0, finalString.length - 2) + ":\n"
    }

    else finalString += line + "\n"
  }

  return finalString;
}

export function generateParserFile(productionStatements, keywordStatements, tokenStatements){
  let string = "";
  string += generateParserFileHeader(string)
  let firstFunc = "";
  const possibleOperands = [constants.OPEN_BRACKET, constants.OPEN_CURLY, constants.OR, constants.OPEN_PARENTHESIS];

  for (let productionIndex in productionStatements){
    let nameOfProduction = productionIndex;
    let valueOfProduction = productionStatements[productionIndex].replaceAll("Π", "\n");

    nameOfProduction = nameOfProduction.replaceAll(" ", "");

    let functionName = nameOfProduction.split("<")[0];
    if (functionName === Object.keys(productionStatements)[0]){ firstFunc = functionName }
    string += `\tdef ${functionName}(self`;

    if (nameOfProduction.includes("<")){
      let functionParameters = nameOfProduction.split("<")[1];
      string += `, ${functionParameters.substring(0, functionParameters.length-1)}`
    }
    string += `):\n`;

    let charIndex = 0;
    let value = "";
    let indents = "\t\t";
    let conditional = false;
    let currentlyInIf = false;

    while (charIndex < valueOfProduction.length){

      // If we find open bracket
      if (valueOfProduction[charIndex] == "{"){
        let next = charIndex + 1;
        let control = 0;

        while (possibleOperands.includes(valueOfProduction[next]) === false && control !== 2){
          if (valueOfProduction[next] === " ") {}
          else if (valueOfProduction[next] === '"'){
            control += 1;
            value += valueOfProduction[next];
          }
          else value += valueOfProduction[next];

          next += 1;
        }

        if (value.includes("<")){
          if (conditional){
            value = "self.exp('" +value+ "'):";
            conditional = false;
          }
          const tempName = value.replace("<", "?").split("?")[0];
          const tempArg = value.replace("<", "?").split("?")[1];
          let funcName = tempName;
          let funcArgument = tempArg.substring(0, tempArg.length - 1);
          value = "self."+ funcName + "(" + funcArgument + ")"
        }

        else if (value.includes('"')) value = "self.scan("+ value + ")";
        else value = "self." + value + "()";

        string += indents + "while self.exp(" + value + "):\n";
        value = "";
        indents += "\t";
      }

      // If we find closing bracket we just remove one indent
      else if(valueOfProduction[charIndex] === "}") {
        indents = indents.replace("\t", "");
        if (currentlyInIf === true) indents = indents.replace("\t", "");
      }

      // if we find a (. .) just add what's inside as a new line
      else if (valueOfProduction[charIndex] === "(" && valueOfProduction[charIndex+1] === ".") {
        charIndex += 2;
        while (valueOfProduction[charIndex] !== "." || valueOfProduction[charIndex+1] !== ")"){
          value += valueOfProduction[charIndex];
          charIndex += 1;
        }
        charIndex += 1;
        string += indents + value + "\n";
        value = "";
      } 
      // else if we find a special char "-" or "+" for example
      else if (valueOfProduction[charIndex] === '"'){
        charIndex += 1;
        while (valueOfProduction[charIndex] != '"'){
          value += valueOfProduction[charIndex];
          charIndex += 1;
        }

        if (conditional === true){
          string += "self.exp(self.scan('" + value + "')):\n"
          conditional = false;
        }

        string += indents + 'self.scan("' + value + '")\n';
        value = "";
      } 
      
      else if (valueOfProduction[charIndex] === "(") {}
      
      // If we find a closingparenthesis we just remove one indent
      else if (valueOfProduction[charIndex] === ")"){
        if (currentlyInIf === true){
          indents = indents.replace("\t", "");
        }
      } 
      
      // If we find a [, that means we begin a conditional, we also add an indent
      else if (valueOfProduction[charIndex] === "["){
        string += indents + "if ";
        conditional = true;
        indents += "\t";
      } 

      // If we find a ], that means we close a conditional, we also remove an indent
      else if (valueOfProduction[charIndex] === "]"){
        indents = indents.replace("\t", "");
        if (currentlyInIf === true){
          indents = indents.replace("\t", "");
        }
      }
      
      // if we find an or | we need to divide the expression in two conditionals
      else if (valueOfProduction[charIndex] === "|"){
        let next = charIndex - 1;
        while (next > 0){
          if (valueOfProduction[next] === " " || valueOfProduction[next] === "\n"){}
          else if (valueOfProduction[next] === "." && valueOfProduction[next-1] === "(") next -=1;
          else if (possibleOperands.includes(valueOfProduction[next])) break;
          next -= 1;
        }

        if (valueOfProduction[next] === "{"){
          let part = string.lastIndexOf("while");
          while (string[part] !== ":") part += 1;

          let control = 0;
          let i = charIndex + 1;
          while (possibleOperands.includes(valueOfProduction[i]) === false && control != 2){
            if (valueOfProduction[i] == " "){}
            else if (valueOfProduction[i] === '"'){
              control += 1;
              value += valueOfProduction[i];
            }

            else value += valueOfProduction[i];
            
            i += 1;
          }

          if (value.includes("<")){
            if (conditional){
              string += "self.exp('" + value + "'):";
              conditional = false;
            }

            const tempName = value.replace("<", "?").split("?")[0];
            const tempArg = value.replace("<", "?").split("?")[1];
            let funcName = tempName;
            let funcArgument = tempArg.substring(0, tempArg.length - 1);
            value = "self."+ funcName + "(" + funcArgument + ")"
          }

          else if (value.includes('"')) value = "self.scan(" + value +")";
          else value = "self."+ value + "()";

          let firstIfStatement = string.substring(part+2).split("\n")[0];
          let dividedString = string.substring(part+1);

          string = string.substring(0, part) +" or self.exp("+ value + ")" + ":\n";
          firstIfStatement = firstIfStatement.replace("\t", "");
          string += indents + "if self.exp(" + firstIfStatement + "):"

          const lines = dividedString.split("\n");
          for (let line of lines) string += "\t"  + line + "\n";
        }
        else if (valueOfProduction[next] === "("){
          let i = next + 1;
          let control = 0;

          while (possibleOperands.includes(valueOfProduction[i]) !== true && control != 2){
            if (valueOfProduction[i] === " "){}
            else if (valueOfProduction[i] === '"'){
              control += 1;
              value += valueOfProduction[i];
            }

            else value += valueOfProduction[i];
            i +=1;
          }

          if (value.includes("<")){
            if (conditional){
              string += "self.exp('" + value + "'):";
              conditional = false;
            }

            const tempName = value.replace("<", "?").split("?")[0];
            const tempArg = value.replace("<", "?").split("?")[1];
            let funcName = tempName;
            let funcArgument = tempArg.substring(0, tempArg.length - 1);
            value = funcArgument + "=self."+ funcName + "(" + funcArgument + ")"
          }

          else if (value.includes('"')) value = "self.scan(" + value +")";
          else value = "self."+ value + "()";

          const previous = string.lastIndexOf(value);
          let dividedString = string.substring(previous);

          let argumentsToReceive = "";
          if (value.includes("=")) argumentsToReceive = value.split("=")[1];
          else argumentsToReceive = value;

          string = string.substring(0, previous) + "if self.exp(" + argumentsToReceive +"):\n";

          const lines = dividedString.split("\n");
          for (let line of lines) string += indents + "\t"+ line + "\n"

          value = ""
        }

        else if (valueOfProduction[next] === "|"){}

        value = "";
        currentlyInIf = true;
        let i = charIndex +1;
        let control = 0
        let isInDoubleQuotes = false;

        while ((possibleOperands.includes(valueOfProduction[i]) === false || isInDoubleQuotes === false) && control != 2){
          if (valueOfProduction[i] === ")" && isInDoubleQuotes === false) break;
          if (valueOfProduction[i] === " "){}

          else if (valueOfProduction[i] === '"'){
            control += 1;
            value += valueOfProduction[i];
          }

          else value += valueOfProduction[i];
          i += 1;
        }

        if (value.includes("<")){
          if (conditional){
            string += "self.exp('" + value + "'):"
            conditional = false;
          }

          const tempName = value.replace("<", "?").split("?")[0];
          const tempArg = value.replace("<", "?").split("?")[1];
          let funcName = tempName;
          let funcArgument = tempArg.substring(0, tempArg.length - 1);
          value = "self."+ funcName + "(" + funcArgument + ")"
        }

        else if (value.includes('"')) value = "self.scan(" + value +")";
        else value = "self."+ value + "()";

        string += indents + "elif self.exp(" + value + "):\n"
        indents += "\t"
        value = ""
      } 
      
      // If it's an empty space, a new line or a tab
      else if (valueOfProduction[charIndex] == " " || valueOfProduction[charIndex] == "\n" || valueOfProduction[charIndex] == "\t"){
        if (value !== ""){
          const arrayOfTokenKeys = [];
          const arrayOfKeywordsKeys = [];

          for (let tokenIndex in tokenStatements) arrayOfTokenKeys.push(tokenIndex);
          for (let keywordIndex in keywordStatements) arrayOfKeywordsKeys.push(keywordIndex);

          if (arrayOfTokenKeys.includes(value) || arrayOfKeywordsKeys.includes(value)){
            string += indents + "self.scan('" + value + "', True)\n"
          }

          else if (value.includes("<")){
            if (conditional){
              string += "self.exp('" + value + "'):\n"
              conditional = false
            }

            const tempName = value.replace("<", "?").split("?")[0];
            const tempArg = value.replace("<", "?").split("?")[1];
            let funcName = tempName;
            let funcArgument = tempArg.substring(0, tempArg.length - 1);
            string += indents + funcArgument.replace(" ", "") + "=self."+ funcName + "(" + funcArgument + ")\n"
          } else {
            if (conditional === true){
              string += "self.exp('" + value + "'):\n";
              conditional = false;
            }

            string += indents + "self."+ value + "()\n"
          }

          value = "";
        } else {}
      } else value += valueOfProduction[charIndex];
      charIndex += 1;
    }

    string += "\n"
  }

  let newString = expFixFunctionCall(string)

  newString += `tokens = getTokens("tokens/tokens.json")\n`;
  newString += `parser = Parser(tokens)\n`;
  newString += `parser.${firstFunc}()`;

  return newString;
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