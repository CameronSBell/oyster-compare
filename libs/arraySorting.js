function compareJourneys(a, b) {
    let compareCondition;
    if (a.startTime && b.startTime) {
        compareCondition = a.startTime.getTime() - b.startTime.getTime();
    }
    else if (a.endTime && b.endTime) {
        compareCondition = a.endTime.getTime() - b.endTime.getTime();
    }
    else if (a.startTime && b.endTime) {
        compareCondition = a.startTime.getTime() - b.endTime.getTime();
    }
    else if (a.endTime && b.startTime) {
        compareCondition = a.endTime.getTime() - b.startTime.getTime();
    }
    else {
        throw new Error(`Neither a startTime nor endTime was found for the following two journeys: ${a} ${b}`);
    }
    return compareCondition;
}

function compareEvents(a, b) {
    return a.time.getTime() - b.time.getTime();
}

module.exports = {
    compareJourneys,
    compareEvents
}