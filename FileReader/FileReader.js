import trim from 'lodash/trim.js';
import { CHR } from '../utils/functions.js'

export function removeComments(linesArray){
  let foundMultilineComment = false;
  const indexesOfCommentedLines = [];

  let index = 0;

  while (index < linesArray.length){
    if (linesArray[index].includes("/*")){
      foundMultilineComment = true;
      indexesOfCommentedLines.push(index);
    } else if (linesArray[index].includes("*/")){
      foundMultilineComment = false;
      indexesOfCommentedLines.push(index);
    } else {
      if (foundMultilineComment === true){
        indexesOfCommentedLines.push(index)
      }
    }
    index++;
  }

  const linesWithoutMultilineComments = linesArray.filter((line, i) => !indexesOfCommentedLines.includes(i))

  const linesWithoutOneLineComments = [];

  linesWithoutMultilineComments.forEach((line) => {
    let preComment = "";
    if (line.includes("//") === true){
      preComment = line.split("//")[0];
      if (preComment.length !== 0) linesWithoutOneLineComments.push(preComment);
    } else {
      linesWithoutOneLineComments.push(line);
    }
  })

  return linesWithoutOneLineComments;
}

export function getCharacterStatements(charactersArray){
  const characterStatements = {};

  charactersArray.forEach((character) => {
    const characterName = trim(character.split("=")[0]).replaceAll(" ", "");
    const characterValue = trim(character.split("=")[1]).replaceAll(" ", "");

    characterStatements[characterName] = characterValue;
  });

  return characterStatements;
}

export function getKeywordStatements(keywordsArray){
  const keywordStatements = {};

  keywordsArray.forEach((keyword) => {
    const keywordName = trim(keyword.split("=")[0]).replaceAll(" ", "");
    const keywordValue = trim(keyword.split("=")[1]).replaceAll(" ", "");

    keywordStatements[keywordName] = keywordValue;
  });

  return keywordStatements;
}

export function getTokenStatements(tokensArray){
  const tokenStatements = {};

  tokensArray.forEach((keyword) => {
    const tokenName = trim(keyword.split("=")[0]).replaceAll(" ", "");
    const tokenValue = trim(keyword.split("=")[1]).replaceAll(" ", "");

    tokenStatements[tokenName] = tokenValue;
  });

  return tokenStatements;
}

export function getProductionStatements(productionsArray){
  const productionStatements = {};

  const arrayWithReplacedDots = productionsArray.map((item) => {
    if (item === ".") return item.replace(".", "π");
    else return item + "Π";
  });

  const joinedString = arrayWithReplacedDots.join("@");
  const arrayOfGroupedProductions =  joinedString.split("@π@");

  const arrayOfCleanGroupedProductions = arrayOfGroupedProductions.map(productionString => {
    let newProductionString = productionString.replaceAll("@", "");
    newProductionString = newProductionString.replaceAll("π", "");
    newProductionString = newProductionString.replace("=", " EQUALS ");
    newProductionString = newProductionString.replaceAll("(. ", "(.");
    newProductionString = newProductionString.replaceAll(" .)", ".)");
    newProductionString = newProductionString.replaceAll(" >", ">");
    newProductionString = newProductionString.replaceAll("<ref int ", "<");
    newProductionString = newProductionString.replaceAll(" < ", "<");
    newProductionString = newProductionString.replaceAll("< ref", "<");
    newProductionString = newProductionString.replaceAll("<ref ", "<");
    newProductionString = newProductionString.replaceAll("<ref", "<");
    newProductionString = newProductionString.replaceAll(" <", "<");
    newProductionString = newProductionString.replaceAll(`";"`, `(";")`);
    newProductionString += ".";

    if (newProductionString.includes("Π]Π(")){
      const divided = newProductionString.split("Π]Π");
      const divided2 = divided[1].split("(.")
      let edited = "";

      for (let i = 0; i < divided2[0].length; i++){
        if (divided2[0][i]  !== "\t" &&  divided2[0][i]  !== "Π"){
          edited += divided2[0][i]
        }
      }

      let finalString = divided[0] + "Π]Π" + edited + "(." + divided2[1] + "(." + divided2[2]
      finalString = finalString.replace("|", " |")
      finalString = finalString.replace(`")"Π`, `")"`)
      newProductionString = finalString

    }
    return newProductionString;
  })

  arrayOfCleanGroupedProductions.forEach(groupedProduction => {
    const productionName = trim(groupedProduction.split("EQUALS")[0]);
    const productionValue = trim(groupedProduction.split("EQUALS")[1]);

    productionStatements[productionName] = productionValue;
  })

  return productionStatements;
}