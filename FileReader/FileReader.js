import trim from 'lodash/trim.js';

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

  const linesWithoutOneLineComments = linesWithoutMultilineComments.map((line) => {
    let preComment = "";
    (line.includes("//")) ? preComment = line.split("//")[0] : preComment = line; 
    return preComment;
  })

  return linesWithoutOneLineComments;
}

function getCharacterStatements(charactersArray){
  const characterStatements = {};

  charactersArray.forEach((character) => {
    const characterName = trim(character.split("=")[0]).replaceAll(" ", "");
    const characterValue = trim(character.split("=")[1]).replaceAll(" ", "");

    characterStatements[characterName] = characterValue;
  });

  return characterStatements;
}

function getKeywordStatements(keywordsArray){
  const keywordStatements = {};

  keywordsArray.forEach((keyword) => {
    const keywordName = trim(keyword.split("=")[0]).replaceAll(" ", "");
    const keywordValue = trim(keyword.split("=")[1]).replaceAll(" ", "");

    keywordStatements[keywordName] = keywordValue;
  });

  return keywordStatements;
}

function getTokenStatements(tokensArray){
  const tokenStatements = {};

  tokensArray.forEach((keyword) => {
    const tokenName = trim(keyword.split("=")[0]).replaceAll(" ", "");
    const tokenValue = trim(keyword.split("=")[1]).replaceAll(" ", "");

    tokenStatements[tokenName] = tokenValue;
  });

  return tokenStatements;
}

function getProductionStatements(productionsArray){
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
    newProductionString += ".";
    return newProductionString;
  })

  arrayOfCleanGroupedProductions.forEach(groupedProduction => {
    const productionName = trim(groupedProduction.split("EQUALS")[0]);
    const productionValue = trim(groupedProduction.split("EQUALS")[1]);

    productionStatements[productionName] = productionValue;
  })

  return productionStatements;
}

export function getStatements(charactersArray, keywordsArray, tokensArray, productionsArray){
  return {
    characterStatements: getCharacterStatements(charactersArray),
    keywordStatements: getKeywordStatements(keywordsArray),
    tokenStatements: getTokenStatements(tokensArray),
    productionStatements: getProductionStatements(productionsArray)
  }
}