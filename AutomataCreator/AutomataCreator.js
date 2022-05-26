import last from 'lodash/last.js';
import first from 'lodash/first.js';
import join from 'lodash/join.js';
import trim from 'lodash/trim.js';
import reverse from 'lodash/reverse.js';
import { constants } from '../utils/constants.js';
import { functions, CHR } from '../utils/functions.js';
import DFA from '../DFA/DFA.js';

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
        if(!!finishedParsingSubstring) currentCharacterString += constants.NEW_OPEN_PARENTHESIS;
        else { 
          automataString = currentCharacterString.substring(0, currentCharacterString.length - 1) + constants.NEW_CLOSING_PARENTHESIS;
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
          if (characterStatements[characterStatement][currentCharacter] === constants.NEW_CLOSING_PARENTHESIS) break; 
          else unicodeInteger += characterStatements[characterStatement][currentCharacter];
          currentCharacter++;
        }
        automataString += `'${CHR(parseInt(unicodeInteger))}'`;
        currentCharacterString = "";
      } else currentCharacterString += characterStatements[characterStatement][currentCharacter];
    }
    characterStatementsAutomatas[characterStatement] = constants.NEW_OPEN_PARENTHESIS + automataString + constants.NEW_CLOSING_PARENTHESIS;
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
        if (!finishedParsingSubstring) currentKeywordString = currentKeywordString.substring(0, currentKeywordString.length - 1) + constants.NEW_CLOSING_PARENTHESIS;
        else currentKeywordString += constants.NEW_OPEN_PARENTHESIS;
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

    

    clutteredTokenValue = clutteredTokenValue.replaceAll(`"+/`, `"+`);

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
    clutteredTokenValue = clutteredTokenValue.replaceAll(`R&(`, `R(`);

    tokenAuomatas[clutteredTokenName] = clutteredTokenValue;
  }

  const characterKeys = reverse(Object.keys(characterAutomatas).sort((a,b) => a.length - b.length));

  for (let currentToken in tokenAuomatas){
    for (let characterKey of characterKeys){
      tokenAuomatas[currentToken] = tokenAuomatas[currentToken].replaceAll(characterKey, characterAutomatas[characterKey]) 
    }
    // tokenAuomatas[currentToken] = tokenAuomatas[currentToken].replaceAll(constants.OPEN_PARENTHESIS, constants.NEW_OPEN_PARENTHESIS);
    // tokenAuomatas[currentToken] = tokenAuomatas[currentToken].replaceAll(constants.CLOSING_PARENTHESIS, constants.NEW_CLOSING_PARENTHESIS);
    // tokenAuomatas[currentToken] = tokenAuomatas[currentToken].replaceAll(constants.KLEEN_CLOSURE, constants.NEW_KLEEN_CLOSURE);
    // tokenAuomatas[currentToken] = tokenAuomatas[currentToken].replaceAll(constants.POSITIVE_CLOSURE, constants.NEW_POSITIVE_CLOSURE);
  }

  return tokenAuomatas;
}

export function getProductionAdditionalTokens(productionStatements){
  const productionTokens = [];
  for (let productionString in productionStatements){
    let newToken = "";
    for (let currProductionCharacter = 0; currProductionCharacter < productionStatements[productionString].length; currProductionCharacter++){
      if (productionStatements[productionString][currProductionCharacter] === `"`){
        currProductionCharacter += 1;
        while (productionStatements[productionString][currProductionCharacter] !== `"`){
          newToken += productionStatements[productionString][currProductionCharacter];
          currProductionCharacter += 1;
        }

        if(!productionTokens.includes(newToken) && newToken.length === 1) productionTokens.push(newToken);
        newToken = "";
      }
    }
  }

  return productionTokens;
}

export function getAdditionalTokenAutomatas(additionalTokensArray){  
  const additionalTokensAutomatas = {};

  const string = constants.NEW_OPEN_PARENTHESIS + constants.NEW_OPEN_PARENTHESIS + additionalTokensArray.join("|") + constants.NEW_CLOSING_PARENTHESIS + constants.NEW_CLOSING_PARENTHESIS;

  additionalTokensAutomatas["additional"] = string;
  return additionalTokensAutomatas;
}

export function getTableOfAutomatas(keywordAutomatas, tokenAutomatas, additionalTokenAutomatas){
  const tableOfAutomatas = {};

  for (let keyword in keywordAutomatas){
    const dfaInstance = new DFA();
    const keywordAutomata = dfaInstance.getDirectDFA(keywordAutomatas[keyword]);
    tableOfAutomatas[keyword] = keywordAutomata;
  }

  for (let token in tokenAutomatas){
    const dfaInstance = new DFA();
    const tokenAutomata = dfaInstance.getDirectDFA(tokenAutomatas[token]);
    tableOfAutomatas[token] = tokenAutomata;
  }

  for (let additionalToken in additionalTokenAutomatas){
    const dfaInstance = new DFA();
    const additionalTokenAutomata = dfaInstance.getDirectDFA(additionalTokenAutomatas[additionalToken]);
    tableOfAutomatas[additionalToken] = additionalTokenAutomata;
  }

  return tableOfAutomatas;
}

getAdditionalTokenAutomatas([])