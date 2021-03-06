const OPEN_CURLY = "{";
const CLOSING_CURLY = "}";
const OPEN_BRACKET = "[";
const CLOSING_BRACKET = "]";
const PLUS = "+"
const EXTRA = "#";
const SINGLE_QUOTE = "'";
const DOUBLE_QUOTE = `"`;


const OPEN_PARENTHESIS = "(";
const CLOSING_PARENTHESIS = ")";
const CONCAT = ".";
const OR = "|";
const KLEEN_CLOSURE = "*";
const POSITIVE_CLOSURE = "+";
const ZERO_OR_ONE = "?"
const EPSILON = "ε";

const NEW_OPEN_PARENTHESIS = "{";
const NEW_CLOSING_PARENTHESIS = "}";
const NEW_CONCAT = "&";
// OR stays the same
const NEW_KLEEN_CLOSURE = "Δ"
const NEW_POSITIVE_CLOSURE = "Σ"

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
  OPEN_BRACKET,
  CLOSING_BRACKET,
  OR,
  PLUS,
  POSITIVE_CLOSURE,
  EXTRA,
  NEW_OPEN_PARENTHESIS,
  NEW_CLOSING_PARENTHESIS,
  NEW_KLEEN_CLOSURE,
  NEW_POSITIVE_CLOSURE,
  KLEEN_CLOSURE,
  CONCAT,
  NEW_CONCAT,
  ZERO_OR_ONE,
  EPSILON,
  SINGLE_QUOTE,
  DOUBLE_QUOTE,
  LETTERS,
  OR_s,
  CONCAT_s,
  OPEN_PARENTHESIS_s,
  CLOSING_PARENTHESIS_s,
  KLEEN_CLOSURE_OPEN_s,
  KLEEN_CLOSURE_CLOSE_s
}