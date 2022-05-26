import DFA from '../DFA/DFA.js';
import Token from '../Token/Token.js';

export function getTokens(inputFileLines, tableOfAutomatas){
  const tokens = [];
  const dfasArray = [];

  for (let automata in tableOfAutomatas) {
    const dfaInstance = new DFA();
    const dfa = dfaInstance.getDirectDFA(tableOfAutomatas[automata], automata)
    dfasArray.push({
      [automata]: dfaInstance
    });
  }

  for (let lineIndex = 0; lineIndex < inputFileLines.length; lineIndex++){
    const arrayToAnalize = inputFileLines[lineIndex].split(" ");
    for (let allegedToken of arrayToAnalize){
      let wasAnalized = false;
      for (let dfa of dfasArray){
        if (wasAnalized === false){
          const result = dfa[Object.keys(dfa)[0]].validateString(allegedToken)
          if (result === true){
            tokens.push(new Token(Object.keys(dfa)[0], allegedToken))
            wasAnalized = false;
          }
        }
      }
    }
  }

  return tokens;
}
