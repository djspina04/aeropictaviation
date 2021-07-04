// abstract syntax tree
//
// ast is list of nodes.
// each node is expression
// for example, keyword "scenario N1" is node in syntax tree
// some expressions are not just keywords but more complex, like "a OR b AND c"
// such expression treated as tree like this:
//
//       OR
//     /   \
//   a     AND
//         / \
//        b   c
//
// because of AND has higher priority, it located lower in syntax tree
// lowest nodes computed firs, highest computed later
//
// top node in tree is container which has many children.  each children is expression in script
// each node has ist own function responsible for its logic.  all arguments of operator are children
// sub nodes.

// abstract ast node class
function AstNode(name) {
    this.name = name;
    this.children = [];
    this.parent = null;
    this.priority = 1;
    this.toText = function() {
        return "";
    };
    this.addChildren = function(children) {
        children.parent = this;
        this.children.push(children);
    }
}

// expression node class
// expression node contains some expression which needed to be tested
// if expression evals to true of false.  if expression evals to true script will move to next expression or action part
// expression node may is tree of operators and conditions
function ExprNode(subnode) {
    AstNode.call(this, "expr");
    this.addChildren(subnode)

    this.toText = function() {
        var res = "";
        for (var i = 0; i < this.children.length; i++) {
            if (res.length)
                res += " ";
            res += this.children[i].toText();
        }
        return res + "\n";
    };

    this.initContext = function() {
        this.children.forEach(function (node) { node.initContext() });
    };

    this.calculate = function () {
        for (var i = 0; i < this.children.length; i++) {
            if (! this.children[i].calculate())
                return false;
        }
        return true;
    }
}
ExprNode.prototype = Object.create(AstNode.prototype);
ExprNode.prototype.constructor = ExprNode;


// just name of scenario
function ScenarioNode(name) {
    AstNode.call(this, "scenario");
    this.arg = name;

    this.toText = function() {
        return "scenario " + this.arg + "\n";
    }
}
ScenarioNode.prototype = Object.create(AstNode.prototype);
ScenarioNode.prototype.constructor = ScenarioNode;


// initiates failure
function FailNode(failure, description) {
    AstNode.call(this, "fail");
    this.failure = failure;
    this.description = description;

    this.toText = function() {
        return "initiate failure " + this.failure + ': "' + description + '"\n';
    }
}
ScenarioNode.prototype = Object.create(AstNode.prototype);
ScenarioNode.prototype.constructor = ScenarioNode;


// actually tests condition.  This is leaf, no children allowed
function ConditionNode(condition, args) {
    AstNode.call(this, condition.name);
    this.condition = condition;
    this.args = args;

    this.toText = function() {
        return this.condition.toText(this.args);
    };

    this.initContext = function() {
        this.context = {};
    };

    this.calculate = function () {
        if (this.condition.testFunc) {
            switch (this.args.length) {
                case 0: return this.condition.testFunc.call(this.context);
                case 1: return this.condition.testFunc.call(this.context, this.args[0]);
                case 2: return this.condition.testFunc.call(this.context, this.args[0], this.args[1]);
                default: return this.condition.testFunc.call(this.context, this.args);
            }
        }
        else
            return false;
    };
}
ConditionNode.prototype = Object.create(AstNode.prototype);
ConditionNode.prototype.constructor = ConditionNode;


// this is operator.  supported operators are OR and AND
// always has two children.  each children may be OperatorNode, NotNode or ConditionNode
function OperatorNode(name) {
    AstNode.call(this, name);

    this.printChild = function(child) {
        if ((child instanceof OperatorNode) || (child instanceof NotNode))
            return "(" + child.toText() + ")";
        else
            return child.toText();
    };

    this.toText = function() {
        return this.printChild(this.children[0]) + " " + this.name + " " + this.printChild(this.children[1]);
    };

    this.initContext = function () {
        this.children.forEach(function (node) { node.initContext() });
    };

    this.calculate = function () {
        if ("AND" === name)
            return this.children[0].calculate() && this.children[1].calculate();
        else if ("OR" === name)
            return this.children[0].calculate() || this.children[1].calculate();
        else
            return false;
    }
}
OperatorNode.prototype = Object.create(AstNode.prototype);
OperatorNode.prototype.constructor = OperatorNode;


// NOT operation.  has only one children.  children may be NotNode, OperatorNode or ConditionNode
function NotNode(value) {
    AstNode.call(this, "not");
    this.addChildren(value);

    this.toText = function() {
        if (this.parent)
            return "(NOT " + this.children[0].toText() + ")";
        else
            return "NOT " + this.children[0].toText();
    };

    this.initContext = function () {
        this.children[0].initContext();
    };

    this.calculate = function () {
        return ! this.children[0].calculate();
    };
}
NotNode.prototype = Object.create(AstNode.prototype);
NotNode.prototype.constructor = NotNode;


// converts lexemes list to AST
function ScriptParser(expressions, lexemes, conditions) {

    // test if lexemes at specified position matches argument syntax
    var isArgMatched = function(argument, pos) {
        for (var i = 0; i < argument.length; i++) {
            var s = argument[i];
            var l = lexemes[pos + i];
            if ((typeof s) === "string") {
                if ((l.type !== LexemeType.TOKEN) || (l.value !== s))
                    return false;
            } else
                if (l.type !== s)
                    return false;
        }
        return true;
    };

    var parseArgs = function(operator, pos) {
        var res = [];
        var p = pos.value;
        for (var i = 1; i < operator.syntax.length; i++) {
            var arg = operator.syntax[i];
            if (isArgMatched(arg, p)) {
                res.push(lexemes[p].original ? lexemes[p].original : lexemes[p].value);
                p += arg.length;
            } else
                return null;
        }
        pos.value = p;
        return res;
    };

    var parseCondition = function(lexeme, pos) {
        for (var i = 0; i < conditions.length; i++) {
            var cond = conditions[i];
            if ((cond.syntax[0] === lexeme.value)) {
                var args = parseArgs(cond, pos);
                if (args)
                    return new ConditionNode(cond, args);
            }
        }
        throw new ParserError("Unknown condition " + lexeme.value, lexeme.line, lexeme.position);
    };

    // parse value in boolean expression
    // if '(' detected, value is another expression
    // if 'NOT' detected, use negative function
    // else value is condition
    var parseValue = function(pos) {
        var lexeme = lexemes[pos.value++];
        if (! lexeme)
            throw new ParserError("Unexpected end of expression", lexemes[lexemes.length - 1].line,
                lexemes[lexemes.length - 1].position);

        if ((lexeme.type === LexemeType.BRACKET) && ('(' === lexeme.value))
            return parseExpression(pos, true);
        if (lexeme.type !== LexemeType.TOKEN)
            throw new ParserError("Unexpected end of expression", lexeme.line, lexeme.position);
        if (lexeme.value === "not")
            return new NotNode(parseValue(pos));
        return parseCondition(lexeme, pos);
    };

    var createOperator = function(lexeme) {
        if (lexeme.type !== LexemeType.TOKEN)
            throw new ParserError("Logical operator expected but not found", lexeme.line, lexeme.position);
        var node = new OperatorNode(lexeme.value.toUpperCase());
        if (node.name === "AND")
            node.priority = 3;
        else if (node.name === "OR")
            node.priority = 2;
        else
            throw new ParserError("Invalid operator " + lexeme.value, lexeme.line, lexeme.position);
        return node;
    };

    var parseExpression = function(pos, untilBracket) {
        var leftNode = parseValue(pos);
        var topNode = leftNode;
        var currentNode = null;

        while (true) {
            if (pos.value >= lexemes.length) {
                if (untilBracket)
                    throw new ParserException("')' expected but end of expression found",
                        lexemes[lexemes.length - 1].line, lexemes[lexemes.length - 1].position);
                else
                    return topNode;
            }
            var l = lexemes[pos.value++];

            if ((l.type === LexemeType.BRACKET) && (")" === l.value) && untilBracket)
                return topNode;
            if ((! untilBracket) && (l.line !== lexemes[pos.value - 2].line)) {
                pos.value--;
                return topNode;
            }

            if (! ((l.type === LexemeType.TOKEN) && ((l.value === "and") || (l.value === "or"))))
                throw new ParserError("Operator expected, '" + l.value + "' found", l.line, l.position);

            var rightNode = parseValue(pos);
            var operator = createOperator(l);

            if (null == currentNode) {
                operator.children[0] = leftNode;
                leftNode.parent = operator;
                operator.children[1] = rightNode;
                rightNode.parent = operator;
                topNode = operator;
            } else {
                if (currentNode.priority < operator.priority) {
                    operator.children[0] = currentNode.children[1];
                    operator.children[0].parent = operator;
                    operator.children[1] = rightNode;
                    operator.children[1].parent = operator;
                    currentNode.children[1] = operator;
                    operator.parent = currentNode;
                } else {
                    var n = currentNode.parent;
                    while ((null !== n) && (n.priority >= operator.priority)) {
                        currentNode = n;
                        n = n.parent;
                    }
                    if (null === n)
                        topNode = operator;
                    operator.parent = n;
                    if (null !== n) {
                        operator.children[0] = n.children[1];
                        operator.children[0].parent = operator;
                        n.children[1] = operator;
                        n.children[1].parent = n;
                    } else {
                        operator.children[0] = currentNode;
                        operator.children[0].parent = operator;
                    }
                    operator.children[1] = rightNode;
                    operator.children[1].parent = operator;
                }
            }
            currentNode = operator;
        }
    };

    this.parse = function() {
        var pos = { value: 0 };
        var nodes = [ ];
        while (pos.value < lexemes.length) {
            var l = lexemes[pos.value];
            if ((l.type === LexemeType.TOKEN) && (l.value === "scenario")) {
                if (lexemes.length <= pos.value + 2)
                    throw new ParserError("Unexpected end of file", l.line, l.position);
                nodes.push(new ScenarioNode(lexemes[pos.value + 1].value));
                pos.value += 2;
            } else if ((l.type === LexemeType.TOKEN) && (l.value === "initiate failure")) {
                if (lexemes.length < pos.value + 4)
                    throw new ParserError("Unexpected end of file", l.line, l.position);
                nodes.push(new FailNode(lexemes[pos.value + 1].value, lexemes[pos.value + 3].value));
                pos.value += 4;
            } else
                nodes.push(new ExprNode(parseExpression(pos, false)));
        }
        return nodes;
    };
}


// convert script to AST nodes
function parseScript(conditions, lexemes) {
    var parser = new ScriptParser(null, lexemes, conditions);
    return parser.parse();
}

'';
