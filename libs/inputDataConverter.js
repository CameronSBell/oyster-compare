let globals = require('../globals');

class InputRowConverter {
    constructor(inputRow) {
        this.date = inputRow.Date;
        this.startTimeInHoursAndMinutes = inputRow['Start Time'];
        this.endTimeInHoursAndMinutes = inputRow['End Time'];
        this.journeyDescription = inputRow['Journey/Action'];
        this.charge = inputRow.Charge;
        this.credit = inputRow.Credit;
        this.balance = inputRow.Balance;
        this.note = inputRow.Note;
    }

    getStationType() {
        let stationType = new RegExp(/\[(?<stationType>.+?)\]/);
        return this.journeyDescription.match(stationType) ? this.journeyDescription.match(stationType).groups.stationType : null;
    }

    getDateTime(time) {
        let splitDate = this.date.match(/(?<day>\d{2})-(?<monthAbbreviation>\w{3})-(?<year>\d{4})/).groups;
        let splitTime = time.match(/(?<hour>\d{2}):(?<minute>\d{2})/).groups;
        return new Date(splitDate.year, globals.monthDictionary[splitDate.monthAbbreviation], splitDate.day, splitTime.hour, splitTime.minute);
    }

}

class RailJourneyInputRowConverter extends InputRowConverter {
    constructor(journey) {
        super(journey);
        this.startJourneyDescription = this.journeyDescription.split(/ to /)[0];
        this.endJourneyDescription = this.journeyDescription.split(/ to /)[1];
    }

    getStartTime() {
        return this.startTimeInHoursAndMinutes ? super.getDateTime(this.startTimeInHoursAndMinutes) : null;
    }

    getEndTime() {
        return this.endTimeInHoursAndMinutes ? super.getDateTime(this.endTimeInHoursAndMinutes) : null;
    }

    getStartStationType() {
        return this.parseJourneyDescription(this.startJourneyDescription).stationType;
    }

    getStartStation() {
        return this.parseJourneyDescription(this.startJourneyDescription).stationName;
    }

    getEndStationType() {
        return this.parseJourneyDescription(this.endJourneyDescription).stationType;
    }

    getEndStation() {
        return this.parseJourneyDescription(this.endJourneyDescription).stationName;
    }

    parseJourneyDescription(description) {
        if (!description) {
            return undefined;
        }
        description = description.replace(/(\(.*?\))/, ""); //remove any round brackets and their contents
        if (description.match(/\[(?<stationName>No touch-in)\]/)) {
            return {
                stationName: 'No touch-in',
                stationType: undefined
            }
        }
        let stationAndStationTypeMatch = description.match(/(?<stationName>.+?)\s*(?:\[(?<stationType>.*?)\])?$/i);
        return stationAndStationTypeMatch ? stationAndStationTypeMatch.groups : null;//pick up station and transport method from each half
    }

    isTravelcardActive() {
        let isTravelcardActive;
        if (this.isJourneyOutsideTravelCardZones() || (this.charge == 0 && !this.isDailyCapReached())) {
            isTravelcardActive = true;
        }
        else {
            isTravelcardActive = false;
        }
        return isTravelcardActive;
    }

    isDailyCapReached() {
        let message = "This journey was cheaper or free today because you reached a daily cap";
        return (this.note && this.note.match(message)) ? true : false;
    }

    isJourneyOutsideTravelCardZones() {
        let message = "You have been charged for travelling in zones not covered by your Travelcard.";
        return (this.note && this.note.match(message)) ? true : false;
    }

    convert() {
        return {
            startTime: this.getStartTime(),
            endTime: this.getEndTime(),
            journeyDescription: this.journeyDescription,
            startStationName: this.getStartStation(),
            startStationType: this.getStartStationType(),
            endStationName: this.getEndStation(),
            endStationType: this.getEndStationType(),
            isTravelcardActive: this.isTravelcardActive(),
            isJourneyOutsideTravelCardZones: this.isTravelcardActive() ? this.isJourneyOutsideTravelCardZones() : undefined,
            isDailyCapReached: this.isDailyCapReached(),
            charge: this.charge,
            balance: this.balance
        }
    }
}

class BusJourneyInputRowConverter extends InputRowConverter {
    constructor(journey) {
        super(journey);
    }

    getBusRoute() {
        let busRoute = new RegExp(/(?:Bus journey).*(?:route)\s{1}(?<busRoute>\w+)/);
        return this.journeyDescription.match(busRoute) ? this.journeyDescription.match(busRoute).groups.busRoute : null;
    }

    isHopperFare() {
        let hopperFareMessage = "You have not been charged for this journey as it is viewed as a continuation of your previous journey"
        let isHopperFare;
        if (this.note) {
            isHopperFare = this.note.match(hopperFareMessage) ? true : false;
        }
        else {
            isHopperFare = false;
        }
        return isHopperFare;
    }

    convert() {
        return {
            startTime: super.getDateTime(this.startTimeInHoursAndMinutes),
            journeyDescription: this.journeyDescription,
            route: this.getBusRoute(),
            isHopperFare: this.isHopperFare(),
            charge: this.charge,
            balance: this.balance
        }
    }
}

class TopUpEventInputRowConverter extends InputRowConverter {
    constructor(journey) {
        super(journey)
    }

    getLocation() {
        let location = new RegExp(/Topped-up on touch in(?:\,\s)(?<station>.+?)(?:(?:\s\[.+?\])|\s)$/);
        return this.journeyDescription.match(location) ? this.journeyDescription.match(location).groups.station : null;
        //"Topped-up on touch in, Cannon Street [National Rail]"
    }

    convert() {
        return {
            time: super.getDateTime(this.startTimeInHoursAndMinutes),
            location: this.getLocation(),
            stationType: super.getStationType(),
            topUpAmount: this.credit,
            balance: this.balance
        }
    }
}

class SeasonTicketInputRowConverter extends InputRowConverter {
    constructor(row) {
        super(row);
    }

    getLocation() {
        //"Season ticket added on touch in, Cannon Street [National Rail]"
        let location = new RegExp(/Season ticket added on touch in(?:\,\s)(?<station>.+?)(?:(?:\s\[.+?\])|\s)$/);
        return this.journeyDescription.match(location) ? this.journeyDescription.match(location).groups.station : null;
    }

    convert() {
        return {
            time: super.getDateTime(this.startTimeInHoursAndMinutes),
            location: this.getLocation(),
            stationType: super.getStationType(),
            balance: this.balance
        }
    }
}

module.exports = {
    RailJourneyInputRowConverter, BusJourneyInputRowConverter, TopUpEventInputRowConverter, SeasonTicketInputRowConverter
}