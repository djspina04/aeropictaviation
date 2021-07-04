
// Create new failure description
// propName name of property variable in simulator
// shortName name of failure in UI
// descr description of value in UI
// propValue value to store to simulator variable propName to trigger failure
function Failure(propName, shortName, descr, propValue) {
    this.propSpec = propName;
    this.shortName = shortName;
    this.descr = descr;
    this.failureValue = propValue;

    this.specToProp = function() {
        if ((! this.propSpec) || (this.failureObj))
            return;
        var idx = this.propSpec.lastIndexOf('.');
        try {
            this.failureObj = eval(this.propSpec.substr(0, idx));
            this.failureProp = this.propSpec.substr(idx + 1);
        } catch (e) {
            log("Invalid prop spec " + this.propSpec);
            log(e.stack)
        }
    };

    // activate failure
    this.activate = function() {
        this.specToProp();
        if (this.failureObj) {
            this.failureObj[this.failureProp] = this.failureValue;
        } else {
            var idx = Math.floor(Math.random() * (failures.length - 2)) + 1;
            log('activating random failure ' + idx);
            this.randomFailure = failures[idx];
            this.randomFailure.specToProp();
            if (this.randomFailure.failureObj)
                this.randomFailure.failureObj[this.randomFailure.failureProp] = this.randomFailure.failureValue;
            else
                log('failure object ' + this.randomFailure.propSpec + " doesn't exists");
        }
    };

    // test if failure is active
    this.isActive = function() {
        if (typeof Aircraft === "undefined")
            return false;
        this.specToProp();
        if (this.failureObj)
            return this.failureObj[this.failureProp] !== 0;
        else
            return false;
    };

    // deactivate failure
    this.deactivate = function() {
        this.specToProp();
        if (this.failureObj)
            this.failureObj[this.failureProp] = 0;
        else if (this.randomFailure)
            this.randomFailure.deactivate();
    };

}


function CompoundFailure(props, shortName, descr)
{
    this.shortName = shortName;
    this.descr = descr;
    this.props = [];

    for (var i = 0; i < props.length; i++) {
        if (typeof props[i] == "string")
            this.props.push(new Failure(props[i], "", "", 1));
        else
            this.props.push(new Failure(props[i].name, "", "", props[i].value))
    }

    this.activate = function() {
        for (var i = 0; i < this.props.length; i++)
            this.props[i].activate();
    };

    this.deactivate = function() {
        for (var i = 0; i < this.props.length; i++)
            this.props[i].deactivate();
    };

    this.isActive = function() {
        for (var i = 0; i < props.length; i++)
            if (! this.props[i].isActive())
                return false;
        return true;
    };
}


// build map of failres for faster lookup
function buildFailuresList(arr) {
    var res = {};
    arr.forEach(function (a) {
        res[a.shortName] = a;
    });
    return res;
}


// create event structure
// name name of event
// condition functions which returns true if condition occures.
function Event(name, condition) {
    return { name: name, condition: condition };
}

// build events map for faster lookup
function buildEventsList(arr) {
    var res = {};
    arr.forEach(function (a) {
        res[a.name] = a;
    });
    return res;
}


// convert events to list of keywords separated by |
function eventsToKeywords(events)
{
    var res = "";
    for (var i = 0; i < events.length; i++) {
        if (res.length)
            res += "|";
        res += events[i].name.toLowerCase();
    }
    return res;
}

function syntaxToGuiArgs(syntax, labels) {
    if (! labels)
        return [];

    var parsedArgs = [ ];
    var argIdx = 0;
    for (var i = 0; i < syntax.length; i++) {
        var s = syntax[i];
        if (Array.isArray(s)) {
            if ((s.length === 1) && (s[0] === eventsKeyword)) {
                parsedArgs.push({label: labels[argIdx++], type: "event"});
            } else
                for (var j = 0; j < s.length; j++) {
                    var k = s[j];
                    if (typeof k === "number") {
                        if (k === LexemeType.NUMBER)
                            parsedArgs.push({label: labels[argIdx++], type: "number"});
                        else if (k === LexemeType.STRING)
                            parsedArgs.push({label: labels[argIdx++], type: "failure"});
                    }
                }
        }
    }
    return parsedArgs;
}


// condition descriptor
function Condition(name, testFunc, syntax, labels) {
    this.name = name;
    this.testFunc = testFunc;
    this.syntax = syntax.slice();
    this.originalSyntax = syntax.slice();
    this.hasPrefixArgument = ((typeof this.syntax[0]) !== "string");
    if (this.hasPrefixArgument) {
        this.syntax[0] = this.originalSyntax[1];
        this.syntax[1] = this.originalSyntax[0];
    }
    this.guiArgs = syntaxToGuiArgs(syntax, labels);

    // convert condition back to string
    this.toText = function(args) {
        var res = "";
        var syn = this.originalSyntax;
        var argNo = 0;
        for (var i = 0; i < syn.length; i++) {
            var s = syn[i];
            if (res.length)
                res += " ";
            if (typeof(s) === "string") {
                res += s;
            } else if (Array.isArray(s)) {
                for (var j = 0; j < s.length; j++) {
                    if (j !== 0)
                        res += " ";
                    var a = s[j];
                    if (typeof a === "string") {
                        if (s.length === 1)
                            res += args[argNo++];
                        else {
                            var alt = a.indexOf('|');
                            if (alt !== -1)
                                res += a.substr(0, alt);
                            else
                                res += a;
                        }
                    } else {
                        if (a === LexemeType.NUMBER)
                            res += args[argNo++];
                        else
                            res += '"' + args[argNo++] + '"';
                    }
                }
            }
        }
        return res;
    }
}

// exception thrown when parser detects error
function ParserError(text, line, position) {
    this.name = "ParserError";
    this.text = text;
    this.line = line;
    this.position = position;
    this.message = text + " at " + line + ":" + position;
    // Use V8's native method if available, otherwise fallback
    if ("captureStackTrace" in Error)
        Error.captureStackTrace(this, ParserError);
    else
        this.stack = (new Error()).stack;
}


// convert conditions to list of tokens
function createTokens(tokenizer, arr) {
    for (var i = 0; i < arr.length; i++) {
        var obj = arr[i];
        for (var j = 0; j < obj.syntax.length; j++) {
            var s = obj.syntax[j];
            if (typeof(s) === "string")
                tokenizer.addToken(s, obj.hasPrefixArgument ? 2 : 0);
            else if (Array.isArray(s)) {
                for (var k = 0; k < s.length; k++)
                    if (typeof s[k] === "string")
                        tokenizer.addToken(s[k]);
            }
        }
    }
}

// build alphabet of scripting language
function createTokensTable()
{
    var tokenizer = new Tokenizer();
    createTokens(tokenizer, conditions);
    tokenizer.addToken("scenario");
    tokenizer.addToken("initiate failure");
    tokenizer.addToken("and");
    tokenizer.addToken("or");
    tokenizer.addToken("not");
    return tokenizer;
}

// parse scenario
function parseScenario(textToParse) {
    var lexemes = doLexicalAnalyse(textToParse);
    var tokens = tokenizer.tokenize(lexemes);
    var astTree = parseScript(conditions, tokens);
    var scenario = new Scenario(astTree);
    scenario.text = textToParse;
    return scenario;
}
