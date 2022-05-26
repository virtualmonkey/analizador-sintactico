export default class Token {
  constructor(type, value) {
    this.type = type || null;
    this.value = value || null;
  }

  getToken() {
    return "< " + this.type + "," + this.value + " >";
  }
}
