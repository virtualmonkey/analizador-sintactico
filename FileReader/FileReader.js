import last from 'lodash/last.js';
import first from 'lodash/first.js';
import join from 'lodash/join.js';
import trim from 'lodash/trim.js';
import reverse from 'lodash/reverse.js';
import { constants } from '../utils/constants.js';
import { functions } from '../utils/functions.js';

export function CHR(index){
  if (index === 9){
    return String.fromCharCode(0x2192);
  }
  return String.fromCharCode(index);
}

function tokenStringToAutomataString(tokenAsString){
  let currentTokenLine = "";
  
  const tokenAsArray = tokenAsString.split("");
  if (last(tokenAsArray) === ".") tokenAsArray.pop();

  currentTokenLine = trim(tokenAsArray.join(""));

  const currentTokenTest = currentTokenLine.split("=");
  const currentTokenName = trim(currentTokenTest[0]);
  let currentTokenValue = trim(currentTokenTest[1]);

  const tokenWithPositiveClosures = functions.convertAddedStrings(currentTokenValue);
  const tokenWithOrs = functions.convertOr(tokenWithPositiveClosures);
  const tokenWithConcats = functions.convertConcat(tokenWithOrs);
  const tokenWithParenthesis = functions.convertParenthesis(tokenWithConcats);
  const tokenWithKleenClosure = functions.convertKleenClosure(tokenWithParenthesis);
  currentTokenValue = tokenWithKleenClosure;

  const addedSubstrings = currentTokenValue.match(/(?![".&"])(?<=\+\+).*?(?=\+)/gs);

  if (addedSubstrings && addedSubstrings.length > 0){
    for (let addedSubstring of addedSubstrings){
      const addedSubstringJoined = join(addedSubstring.split(""),"&");
      currentTokenValue = currentTokenValue.replaceAll(`+${addedSubstring}`, `+&'${addedSubstringJoined}'`);
    }
  }

  const currentTokenAutomataString = `${currentTokenName} = ${currentTokenValue}`

  return currentTokenAutomataString;
}

function tokenHasExceptions(tokenAsArray){
  if (
    tokenAsArray.at(-2) === "EXCEPT" &&
    tokenAsArray.at(-1) === "KEYWORDS"
    ){
    return true;
  }

  return false;
}

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

export function getCharactersAutomatas(characterStatements){
  const characterStatementsAutomatas = {};
  for (let characterStatement in characterStatements){
    characterStatements[characterStatement] = characterStatements[characterStatement].replaceAll(".", "");
    let currentCharacterString = "";
    let automataString = currentCharacterString;
    let finishedParsingSubstring = false;

    for(let currentCharacter = 0; currentCharacter < characterStatements[characterStatement].length; currentCharacter++){
      if (characterStatements[characterStatement][currentCharacter] === constants.DOUBLE_QUOTE 
          || characterStatements[characterStatement][currentCharacter] === constants.SINGLE_QUOTE){
        finishedParsingSubstring = !finishedParsingSubstring;
        if(!!finishedParsingSubstring) currentCharacterString += constants.OPEN_PARENTHESIS;
        else { 
          automataString = currentCharacterString.substring(0, currentCharacterString.length - 1) + constants.CLOSING_PARENTHESIS;
          currentCharacterString = "";
        }
      } else if (!!finishedParsingSubstring) {
        currentCharacterString += characterStatements[characterStatement][currentCharacter] + constants.OR;
      } else if (currentCharacterString + characterStatements[characterStatement][currentCharacter] in characterStatementsAutomatas){
        automataString += characterStatementsAutomatas[currentCharacterString+characterStatements[characterStatement][currentCharacter]]
        currentCharacterString = ""; 
      } else if (characterStatements[characterStatement][currentCharacter] === constants.PLUS) automataString += constants.OR;
        else if (functions.isChar(currentCharacterString)){
        let unicodeInteger = "";
        while (currentCharacter < characterStatements[characterStatement].length){
          if (characterStatements[characterStatement][currentCharacter] === constants.CLOSING_PARENTHESIS) break; 
          else unicodeInteger += characterStatements[characterStatement][currentCharacter];
          currentCharacter++;
        }
        automataString += `'${CHR(parseInt(unicodeInteger))}'`;
        currentCharacterString = "";
      } else currentCharacterString += characterStatements[characterStatement][currentCharacter];
    }
    characterStatementsAutomatas[characterStatement] = constants.OPEN_PARENTHESIS + automataString + constants.CLOSING_PARENTHESIS;
  }

  return characterStatementsAutomatas;
}

export function getKeywordsAutomatas(keywordStatements){
  const keywordStatementsAutomatas = {};

  for (let keywordStatement in keywordStatements){
    keywordStatements[keywordStatement] = keywordStatements[keywordStatement].replaceAll(".", "");
    let currentKeywordString = "";
    let finishedParsingSubstring = false

    for (let currentCharacter = 0; currentCharacter < keywordStatements[keywordStatement].length; currentCharacter++){
      if (keywordStatements[keywordStatement][currentCharacter] === constants.DOUBLE_QUOTE){
        finishedParsingSubstring = !finishedParsingSubstring;
        if (!finishedParsingSubstring) currentKeywordString = currentKeywordString.substring(0, currentKeywordString.length - 1) + constants.CLOSING_PARENTHESIS;
        else currentKeywordString += constants.OPEN_PARENTHESIS;
      } else {
        currentKeywordString += keywordStatements[keywordStatement][currentCharacter] + constants.NEW_CONCAT;
      }
    }

    keywordStatementsAutomatas[keywordStatement] = currentKeywordString;
  }

  return keywordStatementsAutomatas;
}

export function getTokenAutomatas(tokensArray, characterAutomatas){
  const tokenNames = [];
  const tokenValues = [];
  if (tokensArray.at(-1).includes("END")) tokensArray.pop();

  const tokenAuomatas = {};
  for (let currentToken of tokensArray){
    const currentAutomataString = tokenStringToAutomataString(currentToken);
    
    let currentTokenArray = currentAutomataString.split(" ");

    if (tokenHasExceptions(currentTokenArray)){
      currentTokenArray.pop();
      currentTokenArray.pop();
      tokenValues.push(first(currentTokenArray));
    } else tokenValues.push(first(currentTokenArray));

    // This means we have spaces on the value of the current token
    if (currentTokenArray.length > 3){
      let finalValue = "";
      for (let index = 2; index < currentTokenArray.length; index++){
        if (index === 2){
          finalValue += currentTokenArray[index];
        } else {
          finalValue += "/"+currentTokenArray[index];
        }
      }

      currentTokenArray = [currentTokenArray[0], currentTokenArray[1], finalValue]
    }

    const noSpacesCurrentTokenString = currentTokenArray.join("").replaceAll("&", "");

    const clutteredCurrentTokenArray = noSpacesCurrentTokenString.split("=");

    let clutteredTokenName = clutteredCurrentTokenArray[0];
    let clutteredTokenValue = clutteredCurrentTokenArray[1];

    tokenNames.push(clutteredTokenName);

    // start cleaning the clutteredTokenValue
    clutteredTokenValue = functions.addConcatBetweenGroupedTerms(clutteredTokenValue);

    // Remove + sign from start and finish
    if (first(clutteredTokenValue) === "+") clutteredTokenValue = clutteredTokenValue.replace("+","");
    if (last(clutteredTokenValue) === "+") clutteredTokenValue = clutteredTokenValue.slice(0, -1);

    // if penultimate has an empty value then remove it
    let clutteredTokenValueArray = clutteredTokenValue.split("");
    if (clutteredTokenValueArray.at(-2) === "&"){
      let lastCharacter = clutteredTokenValueArray.pop();
      clutteredTokenValueArray.pop();
      clutteredTokenValueArray.push(lastCharacter)
    }

    // Add a concat after a dot (for decimals)
    const newTokenValueArray = [];
    for (let newToken of clutteredTokenValueArray){
      if(newToken === ".") newTokenValueArray.push(...[newToken, "&"]);
      else newTokenValueArray.push(newToken);
    }

    clutteredTokenValue = newTokenValueArray.join("");

    clutteredTokenValue = clutteredTokenValue.replaceAll(`"+/`, `"+`);
    const tokenValueWithoutDuplicatedOps = functions.clearDuplicatedOperators(clutteredTokenValue);
    const tokenValueClean = functions.cleanFinalString(tokenValueWithoutDuplicatedOps);
    const tokenValueWithoutFwdSlash = functions.handleForwardSlash(tokenValueClean);
    clutteredTokenValue = tokenValueWithoutFwdSlash;

    const addedSubstrings = clutteredTokenValue.match(/(?<=').*?(?=')/gs);

    if (addedSubstrings && addedSubstrings.length > 0){
      for (let addedSubstring of addedSubstrings){
        const addedSubstringJoined = join(addedSubstring.split(""),"&");
        clutteredTokenValue = clutteredTokenValue.replaceAll(`+ '${addedSubstring}'`, `+ (${addedSubstringJoined})`);
      }
    }

    const addedSubstringsZeroOrOne = clutteredTokenValue.match(/(?<=\[).*?(?=\])/gs);

    if (addedSubstringsZeroOrOne && addedSubstringsZeroOrOne.length > 0){
      for (let addedSubstring of addedSubstringsZeroOrOne){
        const addedSubstringJoined = join(addedSubstring.split(""),"&");
        clutteredTokenValue = clutteredTokenValue.replaceAll(`+ [${addedSubstring}]`, `+ (${addedSubstringJoined})?`);
      }
    }

    clutteredTokenValue = clutteredTokenValue.replaceAll(`(+)`, ` + `);
    clutteredTokenValue = clutteredTokenValue.replaceAll(`&((`, `&(`);
    clutteredTokenValue = clutteredTokenValue.replaceAll(`)*)`, `)*`);
    clutteredTokenValue = clutteredTokenValue.replaceAll(`)*)&`, `)*&`);
    clutteredTokenValue = clutteredTokenValue.replaceAll(`"`, ``);
    clutteredTokenValue = clutteredTokenValue.replaceAll(` `, ``);
    clutteredTokenValue = clutteredTokenValue.replaceAll(`+`, ``);

    tokenAuomatas[clutteredTokenName] = clutteredTokenValue;
  }

  const characterKeys = reverse(Object.keys(characterAutomatas).sort((a,b) => a.length - b.length));

  for (let currentToken in tokenAuomatas){
    for (let characterKey of characterKeys){
      tokenAuomatas[currentToken] = tokenAuomatas[currentToken].replaceAll(characterKey, characterAutomatas[characterKey]) 
    }
  }

  return tokenAuomatas;
}