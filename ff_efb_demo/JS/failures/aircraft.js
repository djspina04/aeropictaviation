// run failures scripts in aircraft context

exec("HTML/JS/failures/lexer.js");
exec("HTML/JS/failures/tokenizer.js");
exec("HTML/JS/failures/ast.js");
exec("HTML/JS/failures/scenario.js");
exec("HTML/JS/failures/jsparser.js");

exec("HTML/JS/failures/failures.js");

// because btoa function missing in aircraft context, here is replacement implementation
if (typeof btoa === "undefined") {
    var _PADCHAR = "=";
    var _ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    var _getbyte64 = function(s, i) {
        var idx = _ALPHA.indexOf( s.charAt( i ) );

        if ( idx === -1 ) {
            throw "Cannot decode base64";
        }

        return idx;
    };

    btoa = function(s) {
        var pads = 0,
            i,
            b10,
            imax = s.length,
            x = [];

        s = String(s);

        if (imax === 0)
            return s;

        if (imax % 4 !== 0)
            throw "Cannot decode base64";

        if (s.charAt(imax - 1) === _PADCHAR) {
            pads = 1;
            if (s.charAt(imax - 2) === _PADCHAR)
                pads = 2;
            // either way, we want to ignore this last block
            imax -= 4;
        }

        for (i = 0; i < imax; i += 4) {
            b10 = (_getbyte64(s, i) << 18) | (_getbyte64( s, i + 1) << 12) | (_getbyte64(s, i + 2) << 6) | _getbyte64(s, i + 3);
            x.push(String.fromCharCode(b10 >> 16, (b10 >> 8) & 0xff, b10 & 0xff));
        }

        switch (pads) {
            case 1:
                b10 = (_getbyte64(s, i) << 18) | (_getbyte64( s, i + 1) << 12 ) | (_getbyte64(s, i + 2) << 6);
                x.push( String.fromCharCode( b10 >> 16, ( b10 >> 8 ) & 0xff ) );
                break;

            case 2:
                b10 = (_getbyte64(s, i) << 18) | (_getbyte64(s, i + 1) << 12);
                x.push(String.fromCharCode(b10 >> 16));
                break;
        }

        return x.join("");
    }
}

(function () {

    // time before next update
    var lastTime = 1;

    // last received data store
    var lastStoreString;

    // loaded scenarios mapped by name
    var loadedScenarios = new Map();

    initFailures(JSON.parse(Simulation.FailuresList));

    // called when dataStore changed
    var onNewDataReceived = function(storedFailures) {
        if ((! storedFailures) || (! storedFailures.scenarios) || (! storedFailures.loaded))
            return;
        var unparsedMap = new Map();
        storedFailures.scenarios.forEach(function(value) {
            unparsedMap.set(value.name, value.text);
        });

        // remove scenarios not present in new map
        var toRemove = [];
        loadedScenarios.forEach(function (value, key) { if (! unparsedMap.has(key)) toRemove.push(key); });
        toRemove.forEach(function (value) { loadedScenarios.delete(value); });

        // replace updated scenarios and add new scenarios
        storedFailures.loaded.forEach(function(key) {
            var loaded = loadedScenarios.get(key);
            var value = unparsedMap.get(key);
            if ((! loaded) || (loaded.text !== value)) {
                var scenario = parseScenario(value);
                if (scenario) {
                    loadedScenarios.set(key, scenario);
                    scenario.start();
                }
            }
        });
    };

    // run all loaded scenarios
    var executeScenarios = function () {
        loadedScenarios.forEach(function (value, key) {
            value.update();
        });
    };

    // called once per second
    var onSecondPassed = function() {
        var currentDs = Simulation.DataStore;
        if (currentDs !== lastStoreString) {
            lastStoreString = currentDs;
            var s = btoa(currentDs);
            if (s && (s.length > 0)) {
                var parsed = JSON.parse(s);
                onNewDataReceived(parsed['failures']);
            }
        }
        executeScenarios();
    };

    // called on every flight simulator loop
    var onUpdateStep = function(dt) {
        try {
            lastTime -= dt;
            if (0 > lastTime) {
                onSecondPassed();
                lastTime = 1;
            }
            updateActiveFailures();
        } catch (e) {
            log("Error updating failures");
            log(e.stack);
        }
    };

    setUpdateStep(onUpdateStep);
})();

