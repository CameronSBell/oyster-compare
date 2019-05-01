class RailJourneyMetrics {
    constructor(journeyList) {
        this.journeyList = journeyList;
    }

    getTotalTravelDuration() {
        let totalDurationMs = 0;
        this.journeyList.forEach(journey => {
            if (journey.endTime && journey.startTime) {
                let duration = Math.abs(journey.endTime.getTime() - journey.startTime.getTime());
                totalDurationMs += duration;
            }
        });
        let totalDurationInHours = totalDurationMs / (1000 * 60 * 60);
        return totalDurationInHours;
    };

    getMoneySpentOutsideTravelCardZones() {
        let totalAmountSpent = 0;
        this.journeyList.forEach(journey => {
            if (journey.isJourneyOutsideTravelcardZones) {
                totalAmountSpent += journey.charge;
            }
        });
        return totalAmountSpent;
    }

    getTotalNumberOfTravelcardMonths() {
        let totalDurationMs = 0;
        let travelCardPeriods = this.getTravelcardPeriods();
        travelCardPeriods.forEach(period => {
            totalDurationMs += Math.abs(period.endDatetime.getTime() - period.startDatetime.getTime());
        });
        const months = totalDurationMs / (1000 * 60 * 60 * 24 * 30.44)
        return months;
    }

    getTravelcardPeriods() {
        let startDatetime;
        let endDatetime;
        let travelCardPeriodList = [];
        this.journeyList.forEach((journey, index, array) => {
            if (journey.isTravelcardActive && !startDatetime) {
                startDatetime = journey.startTime ? journey.startTime : journey.endTime;
            }
            if (journey.isTravelcardActive) {
                endDatetime = journey.startTime ? journey.startTime : journey.endTime;
            }
            if (!journey.isTravelcardActive && startDatetime && endDatetime) {
                travelCardPeriodList.push({ startDatetime, endDatetime });
                startDatetime = null;
                endDatetime = null;
            }
            if (journey.isTravelcardActive && (index == array.length - 1)) {
                endDatetime = journey.startTime ? journey.startTime : journey.endTime;
                travelCardPeriodList.push({ startDatetime, endDatetime });
            }
        });
        return travelCardPeriodList;
    };
}

module.exports = { RailJourneyMetrics }