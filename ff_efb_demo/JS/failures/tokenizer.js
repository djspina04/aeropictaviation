
// convert single words to composite tokens
// this is kind of preprocessor which dramatically reduces syntax analyzer complexity
function Tokenizer() {

    var tokens = [];
    var tableReady = true;

    // add token to tokens table.
    // token may be single word or composite token.
    // composite token is token which consists of multiple words
    // for example "in random time with average" is composite token
    // multiple variations of token is also supported, for example "minutes|minute"
    this.addToken = function(descr, numFirstTokens, original) {
        var alt = descr.indexOf('|');
        if (alt !== -1) {
            this.addToken(descr.substr(0, alt), numFirstTokens, original ? original : descr);
            this.addToken(descr.substr(alt + 1), numFirstTokens, original ? original : descr);
            return;
        }
        tokens.push({words: descr.split(' '), numFirstTokens: numFirstTokens, original: original ? original : descr});
        tableReady = false;
    };

    // finalize tokens table
    // actually sorts tokens table by size of tokens.
    // tokens consists of more words has higher priority
    this.buildTable = function() {
        tokens.sort(function(a, b) { return b.words.length - a.words.length; });
    };

    // returns true if lexemes
    var isTokenMatched = function(token, lexemes, offset) {
        if (offset + token.words.length > lexemes.length)
            return false;
        for (var i = 0; i < token.words.length; i++)
            if ((token.words[i] !== lexemes[offset + i].value.toLowerCase()) || (lexemes[offset + i].type !== LexemeType.TOKEN))
                return false;
        return true;
    };

    // convert list of lexemes to list of lexemes and tokens
    this.tokenize = function(lexemes) {
        if (! tableReady) {
            this.buildTable();
            tableReady = true;
        }
        var res = [];
        for (var i = 0; i < lexemes.length; i++) {
            var tokenFound = false;
            for (var j = 0; j < tokens.length; j++) {
                if (isTokenMatched(tokens[j], lexemes, i)) {
                    var l = new Lexeme(tokens[j].original, LexemeType.TOKEN, lexemes[i].line, lexemes[i].position);
                    l.original = lexemes[i].value;
                    i += tokens[j].words.length - 1;
                    if (tokens[j].numFirstTokens) {
                        res.splice(res.length - tokens[j].numFirstTokens, 0, l);
                    } else
                        res.push(l);
                    tokenFound = true;
                    break;
                }
            }
            if (! tokenFound)
                res.push(lexemes[i]);
        }
        return res;
    };

}

