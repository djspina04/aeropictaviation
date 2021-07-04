// lexical analyzer
// converts text to list of lexemes

if (typeof log === "undefined")
    log = console.log;

// types of lexemes
var LexemeType = Object.freeze({
    TOKEN: 0,
    STRING: 1,
    NUMBER: 2,
    BRACKET: 3,
    COLON: 4
});


// create new lexeme description
function Lexeme(value, type, line, position) {
    this.value = value;
    this.type = type;
    this.line = line;
    this.position = position;
}


// lexical stram class
function Stream(text) {

    // current line number
    var line = 1;

    // current position in line
    var position = 0;

    // index of next character
    var index = 0;

    var updatePosition = function(ch) {
        if (ch === '\n') {
            line++;
            position = 0;
        } else
            position++;
        index++;
    };

    // returns next character and updates position
    var getNextChar = function() {
        var ch = text.charAt(index);
        updatePosition(ch);
        return ch;
    };

    // returns true is character is space, tab or line end
    var isWhiteSpace = function (ch) {
        return (' ' === ch) || ('\t' === ch) || ('\r' === ch) || ('\n' === ch);
    };

    // returns true if character is digit
    var isDigit = function(ch) {
        return ('0' <= ch) && ('9' >= ch);
    };

    var isQuote = function(ch) {
        return ('"' === ch) || ("'" === ch);
    };

    // returns true if character is ( or )
    var isBracket = function(ch) {
        return ('(' === ch) || (')' === ch);
    };

    // skip all spaces characters until non-space character will be found
    var skipSpaces = function() {
        while (index < text.length) {
            var ch = text.charAt(index);
            if (! isWhiteSpace(ch))
                return;
            updatePosition(ch);
        }
    };

    // read all characters until bracket, quotation symbol, bracket or space
    var readToken = function() {
        var res = '';
        while (index < text.length) {
            var ch = text.charAt(index);
            if (isBracket(ch) || isWhiteSpace(ch) || isQuote(ch) || (':' === ch))
                return res;
            res += ch;
            updatePosition(ch);
        }
        return res;
    };

    // reads number from text.  both integer and floating point numbers are OK.  comma conveted to do automatically
    var readNumber = function() {
        var res = '';
        var dotCnt = 0;
        while (index < text.length) {
            var ch = text.charAt(index);
            if (! isDigit(ch)) {
                if (('.' === ch) || (',' === ch)) {
                    if (dotCnt)
                        throw new ParserError("Invalid number", line, position);
                    dotCnt++;
                    if (',' === ch)
                        ch = '.';
                } else
                    return res;
            }
            res += ch;
            updatePosition(ch);
        }
        return res;
    };

    // read string in quotes.  quote symbol passed as argument
    var readString = function(quoteSym) {
        var res = '';
        while (index < text.length) {
            var ch = getNextChar();
            if (ch === quoteSym)
                return res;
            res += ch;
        }
        return res;
    };

    // returns next lexeme from text or null if end of text reached
    this.nextLexeme = function() {
        skipSpaces();
        if (index >= text.length)
            return null;
        var ch = getNextChar();
        var res = new Lexeme(null, null, line, position);
        if (isQuote(ch)) {
            res.type = LexemeType.STRING;
            res.value = readString(ch);
        } else if (isDigit(ch)) {
            res.type = LexemeType.NUMBER;
            res.value = ch + readNumber();
        } else if (isBracket(ch)) {
            res.type = LexemeType.BRACKET;
            res.value = ch;
        } else if (':' === ch) {
            res.type = LexemeType.COLON;
            res.value = ch;
        } else {
            res.type = LexemeType.TOKEN;
            res.value = ch + readToken();
        }
        return res;
    }
}


// do lexical analyse
// returns array of lexemes
function doLexicalAnalyse(text) {
    var reader = new Stream(text);
    var res = [];
    var lex = reader.nextLexeme();
    while (null != lex) {
        res.push(lex);
        lex = reader.nextLexeme();
    }
    return res;
}
