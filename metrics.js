function calculateTotalDuration(journeyList) {
    let totalDurationMs = 0;
    for (journey of journeyList) {
        if (journey.endTime && journey.startTime) {
            duration = journey.endTime - journey.startTime;
            //console.log(duration);
            totalDurationMs += duration;
        }
    }
    let totalDurationInHours = totalDurationMs / (1000 * 60 * 60);
    console.log("Total rail journey travel time: " + totalDurationInHours);
};

module.exports = {
    calculateTotalDuration
}