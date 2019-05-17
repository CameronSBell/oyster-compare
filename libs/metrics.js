const globals = require("../globals");
const config = require("../config");

class RailJourneyMetrics {
    constructor(journeyList) {
        this.journeyList = journeyList;
        this.yearlyTravelcardPrice = globals.yearlyTravelcardPriceDictionary[config.currentTravelcardZones.start][config.currentTravelcardZones.end];
        this.monthlyTravelcardPrice = globals.monthlyTravelcardPriceDictionary[config.currentTravelcardZones.start][config.currentTravelcardZones.end];
    }

    calculate() {
        this.totalNoOfTravelcardMonths = this._getTotalNumberOfTravelcardMonths();
        this.totalAmountSpentOutsideTravelcardZones = this._getMoneySpentOutsideTravelCardZones();
        this.totalRailJourneyTravelTime = this._getTotalTravelDuration();
        this.yearlyTravelcardSaving = this._getYearlyTravelcardSaving();
        this.monthlyTravelcardSaving = this.yearlyTravelcardSaving/12;
        this.amountSpentperTravelcardMonth = this.totalAmountSpentOutsideTravelcardZones/this.totalNoOfTravelcardMonths;
        return this;
    }

    print() {
        console.log("These values are based on the oyster card history you supplied:\n");
        console.log(`Total number of travelcard months: ${this.totalNoOfTravelcardMonths}`);
        console.log(`Total amount spent on journeys outside travelcard zones (£): ${this.totalAmountSpentOutsideTravelcardZones}`);
        console.log("Amount spent on journeys outside travelcard zones per travelcard month (£/month): " + this.amountSpentperTravelcardMonth);
        console.log(`\nTotal rail journey travel time (hours): ${this.totalRailJourneyTravelTime}\n`);
        console.log(`Cost of yearly travelcard for Zones ${config.currentTravelcardZones.start}-${config.currentTravelcardZones.end} (£): ${this.yearlyTravelcardPrice}`);
        console.log(`Yearly saving with yearly travelcard over monthly travelcard, based on currently monthly costs (£):  ${this.yearlyTravelcardSaving}`);
        console.log(`Monthly saving with yearly travelcard (£): ${this.monthlyTravelcardSaving}`);
    }

    _getYearlyTravelcardSaving() {
        let effectiveMonthlyCost = (this.totalAmountSpentOutsideTravelcardZones/this.totalNoOfTravelcardMonths) + this.monthlyTravelcardPrice;
        return (12 * (effectiveMonthlyCost)) - this.yearlyTravelcardPrice;
    }

    _getTotalTravelDuration() {
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

    _getMoneySpentOutsideTravelCardZones() {
        let totalAmountSpent = 0;
        this.journeyList.forEach(journey => {
            if (journey.isJourneyOutsideTravelcardZones) {
                totalAmountSpent += journey.charge;
            }
        });
        return totalAmountSpent;
    }

    _getTotalNumberOfTravelcardMonths() {
        let totalDurationMs = 0;
        let travelCardPeriods = this._getTravelcardPeriods();
        travelCardPeriods.forEach(period => {
            totalDurationMs += Math.abs(period.endDatetime.getTime() - period.startDatetime.getTime());
        });
        const months = totalDurationMs / (1000 * 60 * 60 * 24 * 30.44)
        return months;
    }

    _getTravelcardPeriods() {
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