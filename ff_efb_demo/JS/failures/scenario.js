// code generator
// get AST as input and generates scenraio object
// just run start() method on generated scenario to activate it
// and call update() method when needed.
// to test if scenario is finished use isFinished method.
//

function Scenario(ast) {
    this.name = "";

    var currentFailure = 0;

    if (ast) {
        this.parts = [ {} ];
        for (var i = 0; i < ast.length; i++) {
            var node = ast[i];
            switch (node.name) {
                case "scenario":
                    this.name = node.arg;
                    break;

                case "expr":
                    if (!this.parts[currentFailure].conditions)
                        this.parts[currentFailure].conditions = [];
                    this.parts[currentFailure].conditions.push(node);
                    break;

                case "fail":
                    this.parts[currentFailure].action = {
                        failure: failuresById[node.failure],
                        descr: node.description
                    };
                    currentFailure++;
                    this.parts.push({});
                    break;
            }
        }

        if (! this.parts[currentFailure].action) {
            this.parts.pop();
        }
    } else
        this.parts = [ ];

    // start execution of scenario
    this.start = function () {
        this.parts.forEach(function (failure) {
            failure.currentCondition = 0;
            failure.conditions.forEach(function (condition) { condition.initContext(); });
        });
        currentFailure = 0;
    };

    // execute scenario
    this.update = function() {
        var changed;
        do {
            changed = false;
            if (currentFailure >= this.parts.length)
                return;
            var part = this.parts[currentFailure];
            if (part.currentCondition >= part.conditions.length) {
                currentFailure++;
                return;
            }
            if (part.conditions[part.currentCondition].calculate()) {
                part.currentCondition++;
                if (part.currentCondition >= part.conditions.length) {
log('activating failure: ' + part.action.descr);
                    currentFailure++;
                    part.action.failure.activate();
                }
                changed = true;
            }
        } while (changed);
    };

    this.toText = function() {
        var res = 'scenario "' + this.name + '"\n';
        this.parts.forEach(function(part) {
            res += "\n";
            part.conditions.forEach(function(condition) {
                res += condition.toText() + "\n";
            });
            res += 'initiate failure "' + part.action.failure.shortName + '": "' + part.action.descr + '"\n\n';
        });
        return res;
    }
}
