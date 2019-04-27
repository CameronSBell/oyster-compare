function calculateTotalDuration(journeyList) {
    let totalDurationMs = 0;
    for (journey of journeyList) {
        if (journey.endTime && journey.startTime) {
            duration = journey.endTime.getTime() - journey.startTime.getTime();
            totalDurationMs += duration;
        }
    }
    let totalDurationInHours = totalDurationMs / (1000 * 60 * 60);
    return totalDurationInHours;
};

function calculateTravelcardPeriods(journeyList) {
    let startDatetime;
    let endDatetime;
    let travelCardPeriodList = [];
    for (let i = 0; i < journeyList.length; i++) {
        if (journeyList[i].isTravelcardActive && !startDatetime) {
            startDatetime = journeyList[i].startTime ? journeyList[i].startTime : journeyList[i].endTime;
        }
        if (journeyList[i].isTravelcardActive) {
            endDatetime = journeyList[i].startTime ? journeyList[i].startTime : journeyList[i].endTime;
        }
        if (!journeyList[i].isTravelcardActive && startDatetime && endDatetime) {
            travelCardPeriodList.push({ startDatetime, endDatetime });
            startDatetime = null;
            endDatetime = null;
        }
        if(journeyList[i].isTravelcardActive && (i == journeyList.length - 1)) {
            endDatetime = journeyList[i].startTime ? journeyList[i].startTime : journeyList[i].endTime;
            travelCardPeriodList.push({ startDatetime, endDatetime });
        }
    }
    return travelCardPeriodList;
};

function calculateMoneySpentOutsideTravelCardZones(journeyList) {
    let totalAmountSpent = 0;
    for(journey of journeyList) {
        if(journey.isJourneyOutsideTravelcardZones) {
            totalAmountSpent += journey.charge;
        }
    }
    return totalAmountSpent;
}

function calculateTotalNumberOfTravelcardMonths(travelCardPeriodList) {
    let totalDurationMs = 0;
    for(period of travelCardPeriodList) {
        totalDurationMs += Math.abs(period.endDatetime.getTime() - period.startDatetime.getTime());
    }
    const months = totalDurationMs / (1000 * 60 * 60 * 24 * 30.44)
    return months;
}

module.exports = {
    calculateTotalDuration,
    calculateTravelcardPeriods,
    calculateMoneySpentOutsideTravelCardZones,
    calculateTotalNumberOfTravelcardMonths
}