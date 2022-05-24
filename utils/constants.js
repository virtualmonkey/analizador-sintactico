
const OPEN_PARENTHESIS = "(";
const CLOSING_PARENTHESIS = ")";
const OPEN_CURLY = "{";
const CLOSING_CURLY = "}";
const OR = "|";
const POSITIVE_CLOSURE = "+";
const KLEEN_CLOSURE = "*";
const CONCAT = ".";
const NEW_CONCAT = "&";
const ZERO_OR_ONE = "?"
const EPSILON = "ε";
const LETTERS =["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","X","Y","Z"];

const OR_s = `+"${OR}"+`;
const CONCAT_s = `"${CONCAT}"`;
const OPEN_PARENTHESIS_s = `+"${OPEN_PARENTHESIS}"+`;
const CLOSING_PARENTHESIS_s = `+"${CLOSING_PARENTHESIS}"`;
const KLEEN_CLOSURE_OPEN_s = `+"${OPEN_PARENTHESIS}${OPEN_PARENTHESIS}"+`;
const KLEEN_CLOSURE_CLOSE_s = `+"${CLOSING_PARENTHESIS}${KLEEN_CLOSURE}${CLOSING_PARENTHESIS}"+`;

export const constants = {
  OPEN_PARENTHESIS,
  CLOSING_PARENTHESIS,
  OPEN_CURLY,
  CLOSING_CURLY,
  OR,
  POSITIVE_CLOSURE,
  KLEEN_CLOSURE,
  CONCAT,
  NEW_CONCAT,
  ZERO_OR_ONE,
  EPSILON,
  LETTERS,
  OR_s,
  CONCAT_s,
  OPEN_PARENTHESIS_s,
  CLOSING_PARENTHESIS_s,
  KLEEN_CLOSURE_OPEN_s,
  KLEEN_CLOSURE_CLOSE_s  
}