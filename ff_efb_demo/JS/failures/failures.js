
// list of available parts
var failures = [ ];
var lowLevelFailures = [ ];
var failuresById;


function fromPlainList(list) {
    var res = [];
    for (var i = 0; i < list.length; i+= 2) {
        res.push({propName: list[i], descr: list[i + 1]});
    }
    return res;
}


function initHighLevelFailures() {
    failures = [];
    for (var i = 1; i <= 6; i++) {
        failures.push(new Failure("Aircraft.Cockpit.DU" + i + ".FailureDisplay", "DU" + i + ".Failure", "Display " + i + " Failure", 1));
        failures.push(new Failure("Aircraft.Cockpit.DU" + i + ".FailureDisplayFreeze", "DU" + i + ".Freeze", "Display " + i + " Freeze", 1));
    }
    failures.push(new Failure("Aircraft.Cockpit.MCDU1.FailureDisplay", "MCDU1.DsiplayFailure", "MCDU 1 display failure", 1));
    failures.push(new Failure("Aircraft.Cockpit.MCDU1.FailureDisplayFreeze", "MCDU1.DisplayFreeze", "MCDU 1 display freeze", 1));
    failures.push(new Failure("Aircraft.Cockpit.MCDU2.FailureDisplay", "MCDU2.DsiplayFailure", "MCDU 2 display failure", 1));
    failures.push(new Failure("Aircraft.Cockpit.MCDU2.FailureDisplayFreeze", "MCDU2.DisplayFreeze", "MCDU 2 display freeze", 1));
    failures.push(new Failure("Aircraft.PowerPlant.APU.FailureFire", "APU.Fire", "APU fire", 1));
    failures.push(new Failure("Aircraft.PowerPlant.FDU3.FailureLoopFireA", "APU.FireLoopA", "APU fire loop A", 1));
    failures.push(new Failure("Aircraft.PowerPlant.FDU3.FailureLoopFireB", "APU.FireLoopB", "APU fire loop B", 1));
    failures.push(new Failure("Aircraft.PowerPlant.EngineL.FailureDamage", "ENG_L.Damage", "Left engine damage", 100));
    failures.push(new Failure("Aircraft.PowerPlant.EngineR.FailureDamage", "ENG_R.Damage", "Right engine damage", 100));
    failures.push(new Failure("Aircraft.PowerPlant.EngineL.FailureFire", "ENG_L.Fire", "Left engine fire", 1));
    failures.push(new Failure("Aircraft.PowerPlant.EngineR.FailureFire", "ENG_R.Fire", "Right engine fire", 1));
    failures.push(new Failure("Aircraft.PowerPlant.FDU1.FailureLoopFireA", "ENG_L.FireLoopA", "Left engine fire loop A", 1));
    failures.push(new Failure("Aircraft.PowerPlant.FDU1.FailureLoopFireB", "ENG_L.FireLoopB", "Left engine fire loop B", 1));
    failures.push(new Failure("Aircraft.PowerPlant.FDU2.FailureLoopFireA", "ENG_R.FireLoopA", "Right engine fire loop A", 1));
    failures.push(new Failure("Aircraft.PowerPlant.FDU2.FailureLoopFireB", "ENG_R.FireLoopB", "Right engine fire loop B", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.ElevatorL.Servojack1.FailureBlocked", "ElevatorL.Servo1", "Left elevator servo 1 blocked", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.ElevatorL.Servojack2.FailureBlocked", "ElevatorL.Servo2", "Left elevator servo 2 blocked", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.ElevatorR.Servojack1.FailureBlocked", "ElevatorR.Servo1", "Right elevator servo 1 blocked", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.ElevatorR.Servojack2.FailureBlocked", "ElevatorR.Servo2", "Right elevator servo 2 blocked", 1));
    failures.push(new Failure("Aircraft.Control.ELAC1.FailurePitch", "ELAC1.Pitch", "ELAC 1 pitch failure", 1));
    failures.push(new Failure("Aircraft.Control.ELAC2.FailurePitch", "ELAC2.Pitch", "ELAC 2 pitch failure", 1));
    failures.push(new CompoundFailure(["Aircraft.Control.ELAC1.FailureRollA", "Aircraft.Control.ELAC1.FailureRollB"], "ELAC1.Roll", "ELAC 1 roll failure", 1));
    failures.push(new CompoundFailure(["Aircraft.Control.ELAC2.FailureRollA", "Aircraft.Control.ELAC2.FailureRollB"], "ELAC2.Roll", "ELAC 2 roll failure", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.Slats.FailureFPPU1", "Slats1.Locked", "Slats 1 locked", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.Slats.FailureFPPU2", "Slats2.Locked", "Slats 2 locked", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.Slats.FailureValve1L", "Slats1.Failure", "Slats 1 failure", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.Slats.FailureValve1R", "Slats2.Failure", "Slats 2 failure", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.Slats.FailureBrake1L", "Slats.Brake", "Slats tip brake failure", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.Flaps.FailureFPPU1", "Flaps1.Locked", "Flaps 1 locked", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.Flaps.FailureFPPU2", "Flaps2.Locked", "Flaps 2 locked", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.Flaps.FailureValve1L", "Flaps1.Failure", "Flaps 1 failure", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.Flaps.FailureValve1R", "Flaps2.Failure", "Flaps 2 failure", 1));
    failures.push(new Failure("Aircraft.Control.Surfaces.Flaps.FailureBrake1L", "Flaps.Brake", "Flaps tip brake failure", 1));
    failures.push(new Failure("Aircraft.Gears.LGCIU1.FailureFlapsAttchmentSensor1", "Flaps.AttachSensorNormalL", "Left flaps norm attach sensor", 1));
    failures.push(new Failure("Aircraft.Gears.LGCIU2.FailureFlapsAttchmentSensor2", "Flaps.AttachSensorNormalR", "Right flaps norm attach sensor", 1));
    failures.push(new Failure("Aircraft.Gears.LGCIU1.FailureFlapsAttchmentSensor3", "Flaps.AttachSensorCompL", "Left flaps comp attach sensor", 1));
    failures.push(new Failure("Aircraft.Gears.LGCIU2.FailureFlapsAttchmentSensor4", "Flaps.AttachSensorCompR", "Right flaps comp attach sensor", 1));
    failures.push(new Failure("Aircraft.Gears.LGCIU1.FailureFlapsAttchment1", "Flaps.AttachL", "Left flaps attachment", 1));
    failures.push(new Failure("Aircraft.Gears.LGCIU2.FailureFlapsAttchment2", "Flaps.AttachR", "Right flaps attachment", 1));
    failures.push(new CompoundFailure(["Aircraft.Control.Surfaces.AileronL.Servojack1.FailureBlocked", "Aircraft.Control.Surfaces.AileronL.Servojack2.FailureBlocked"], "AileronL.Servos", "Left aileron servos fault", 1));
    failures.push(new CompoundFailure(["Aircraft.Control.Surfaces.AileronR.Servojack1.FailureBlocked", "Aircraft.Control.Surfaces.AileronR.Servojack2.FailureBlocked"], "AileronR.Servos", "Right aileron servos fault", 1));
    failures.push(new Failure("Aircraft.Electric.Generator1.Alternator.FailureDamaged", "Gen1.Alt", "Generator 1 alternator", 1));
    failures.push(new Failure("Aircraft.Electric.Generator2.Alternator.FailureDamaged", "Gen2.Alt", "Generator 2 alternator", 1));
    failures.push(new Failure("Aircraft.Electric.BCL1.FailureCPU", "Battery1", "Battery 1", 1));
    failures.push(new Failure("Aircraft.Electric.BCL2.FailureCPU", "Battery2", "Battery 2", 1));
    failures.push(new Failure("Aircraft.Fuel.WingPumpL1.Motor.FailureDamaged", "Fuel.Wing.Pump.L1", "Left wing fuel pump 1", 1));
    failures.push(new Failure("Aircraft.Fuel.WingPumpL2.Motor.FailureDamaged", "Fuel.Wing.Pump.L2", "Left wing fuel pump 2", 1));
    failures.push(new Failure("Aircraft.Fuel.WingPumpR1.Motor.FailureDamaged", "Fuel.Wing.Pump.R1", "Right wing fuel pump 1", 1));
    failures.push(new Failure("Aircraft.Fuel.WingPumpR2.Motor.FailureDamaged", "Fuel.Wing.Pump.R2", "Right wing fuel pump 2", 1));

    failures.push(new Failure("Aircraft.Hydraulic.ReservoirY.FailureLeakage", "Hyd.LeakageY", "Hydraulic leakage Y", 1));
    failures.push(new Failure("Aircraft.Hydraulic.ReservoirG.FailureLeakage", "Hyd.LeakageG", "Hydraulic leakage G", 1));
    failures.push(new Failure("Aircraft.Hydraulic.ReservoirB.FailureLeakage", "Hyd.LeakageB", "Hydraulic leakage B", 1));
    failures.push(new Failure("Aircraft.Hydraulic.ElecPumpY.Motor.FailureDamaged", "Hyd.MotorY", "Hydraulic pump motor Y", 1));
    failures.push(new Failure("Aircraft.Hydraulic.ElecPumpB.Motor.FailureDamaged", "Hyd.MotorB", "Hydraulic pump motor B", 1));
    failures.push(new Failure("Aircraft.Navigation.ADIRS.ADIRU1.ADR.FailureCPU", "adirs.adr1", "ADR 1", 1));
    failures.push(new Failure("Aircraft.Navigation.ADIRS.ADIRU2.ADR.FailureCPU", "adirs.adr2", "ADR 2", 1));
    failures.push(new Failure("Aircraft.Navigation.ADIRS.ADIRU3.ADR.FailureCPU", "adirs.adr3", "ADR 3", 1));

    failures.sort(function(a, b) { return a.shortName.localeCompare(b.shortName); });
    failures.unshift(new Failure(null, 'RANDOM', 'Random failure'));
    failuresById = buildFailuresList(failures);
}

function initFailures(failuresList) {
    if (! failuresList.length)
        return;
    if (typeof failuresList[0] === "string")
        failuresList = fromPlainList(failuresList);
    initHighLevelFailures();
    lowLevelFailures = [ ];
    for (item of failuresList) {
        //var betterShortName = extractUniquePart(item.propName) + item.shortName;
        lowLevelFailures.push(new Failure(item.propName, item.propName, item.descr, 1));
    }
}


function isInAir() {
    return (Aircraft.Gears.MLGL.Compressed === 0) && (Aircraft.Gears.MLGR.Compressed === 0) &&
        (Aircraft.Gears.NLG.Compressed === 0);
}

function isOnLand() {
    return ! isInAir();
}


function areEnginedRunning() {
    return (Aircraft.PowerPlant.EngineL.Engine_RateHP > 0.5) && (Aircraft.PowerPlant.EngineR.Engine_RateHP > 0.5);
}

// list of available events
var events = [
    Event("Takeoff", isInAir),
    Event("Landing", isOnLand),
    Event("Engine start", areEnginedRunning)
];
var eventsById = buildEventsList(events);

// events keywords
var eventsKeyword = eventsToKeywords(events);


function atOrAboveSpeed(speed)
{
    return Aircraft.AirSpeed * 1.94384 >= speed;
}

function atOrBelowSpeed(speed)
{
    return Aircraft.AirSpeed * 1.94384 <= speed;
}

function atOrAboveAltitude(alt)
{
    return Aircraft.Altitude >= alt * 3.28084;
}

function atOrBelowAltitude(alt)
{
    return Aircraft.Altitude <= alt * 3.28084;
}

function inTime(time)
{
    var now = new Date().getTime();
    if (! this.startTime)
        this.startTime = now;
    return now >= this.startTime + time * 60000;
}

function inTimeWithAverage(avgTime)
{
    var now = new Date().getTime();
    if (! this.endTime) {
        this.endTime = now + Math.random() * avgTime * 120000;
    }
    return now >= this.endTime;
}

function inTimeAfterEvent(time, eventName)
{
    var event = eventsById[eventName];
    if  (! event.condition()) {
        this.startTime = null;
        return false;
    } else {
        var now = new Date().getTime();
        if (! this.startTime)
            this.startTime = now;
        return now >= this.startTime + time * 60000;
    }
}


function isCaseOfFailure(failure) {
    var failure = failuresById[failure];
    return failure.isActive();
}

// description of condition
var conditions = [
    new Condition("immediately", function() { return true; }, [ "immediately" ]),
    new Condition("in time", inTime, [ "in", [LexemeType.NUMBER, "minutes|minute"] ], [ "minutes" ]),
    new Condition("in random time with average", inTimeWithAverage, [ "in random time with average", [LexemeType.NUMBER, "minutes|minute"]], ["minutes"]),
    new Condition("in time after event", inTimeAfterEvent, [ [LexemeType.NUMBER, "minutes|minute"], "after", [eventsKeyword] ], [ "minutes", "after" ]),
    new Condition("at or above altitude", atOrAboveAltitude, [ "at or above", [LexemeType.NUMBER, "feet"] ], [ "feet" ]),
    new Condition("at or below altitude", atOrBelowAltitude, [ "at or below", [LexemeType.NUMBER, "feet"] ], [ "feet" ]),
    new Condition("at or above speed", atOrAboveSpeed, [ "at or above", [LexemeType.NUMBER, "knots|knot"] ], [ "knots" ]),
    new Condition("at or below speed", atOrBelowSpeed, [ "at or below", [LexemeType.NUMBER, "knots|knot"] ], [ "knots" ]),
    new Condition("in case of failure", isCaseOfFailure, [ "in case of failure", [LexemeType.STRING] ], [ "" ])
];


// list of tokens
var tokenizer = createTokensTable();


// convert list of failures to string of comma-separated properties and save it to Simulation.ActiveFailures
function setActiveFailures(failuresList) {
    var str = '';
    for (i = 0; i < failuresList.length; i++) {
        if (failuresList[i].isActive()) {
            if (str.length > 0)
                str += ',';
            str += failuresList[i].propSpec;
        }
    }
    Simulation.ActiveFailures = str;
}

var lastProcessedFailure = 0;
var activeFailures = [];


// update list of active failures
// updates only few failures per frame to keep performance smooth
// saves comma-separated list of actives failures in Simulation.ActiveFailures variable.
function updateActiveFailures() {
    var lastFailure = lastProcessedFailure + 50;
    var allProcessed = false;
    if (lastFailure >= lowLevelFailures.length) {
        lastFailure = lowLevelFailures.length;
        allProcessed = true;
    }
    for (var i = lastProcessedFailure; i < lastFailure; i++) {
        if (lowLevelFailures[i].isActive())
            activeFailures.push(lowLevelFailures[i]);
    }
    if (allProcessed) {
        setActiveFailures(activeFailures);
        lastProcessedFailure = 0;
        activeFailures = [];
    } else
        lastProcessedFailure = lastFailure;
}

initHighLevelFailures();
