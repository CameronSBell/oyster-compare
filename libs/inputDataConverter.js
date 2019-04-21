class InputRowConverter {
    constructor(journey) {
        this.date = journey.Date;
        this.startTimeInHoursAndMinutes = journey['Start Time'];
        this.endTimeInHoursAndMinutes = journey['End Time'];
        this.journeyDescription = journey['Journey/Action'];
        this.charge = journey.Charge;
        this.credit = journey.Credit;
        this.balance = journey.Balance;
        this.note = journey.Note;
    }

    getStationType() {
        let stationType = new RegExp(/\[(?<stationType>.+?)\]/);
        return this.journeyDescription.match(stationType) ? this.journeyDescription.match(stationType).groups.stationType : null;
    }

    getDateTime(time) {
        if (!time) {
            return null;
        }
        let splitDate = this.date.match(/(?<day>\d{2})-(?<monthAbbreviation>\w{3})-(?<year>\d{4})/).groups;
        let splitTime = time.match(/(?<hour>\d{2}):(?<minute>\d{2})/).groups;
        return new Date(splitDate.year, monthDictionary[splitDate.monthAbbreviation], splitDate.day, splitTime.hour, splitTime.minute);
    }

}

class RailJourneyInputRowConverter extends InputRowConverter {
    constructor(journey) {
        super(journey);
        this.startJourneyDescription = this.journeyDescription.split(/ to /)[0];
        this.endJourneyDescription = this.journeyDescription.split(/ to /)[1];
    }

    getStartTime() {
        return super.getDateTime(this.startTimeInHoursAndMinutes);
    }

    getEndTime() {
        return super.getDateTime(this.endTimeInHoursAndMinutes);
    }

    getStartStationType() {
        return this.parseJourneyDescription(this.startJourneyDescription).stationType;
    }

    getStartStation() {
        return this.parseJourneyDescription(this.endJourneyDescription).station;
    }

    getEndStationType() {
        return this.parseJourneyDescription(this.startJourneyDescription).stationType;
    }

    getEndStation() {
        return this.parseJourneyDescription(this.startJourneyDescription).station;
    }

    parseJourneyDescription(description) {
        if (!description) {
            return null;
        }
        description = description.replace(/(\(.*?\))/, ""); //remove any round brackets and their contents
        if (description.match(/\[(?<station>No touch-in)\]/)) {
            return {
                station: 'No touch-in',
                stationType: null
            }
        }
        let stationAndStationTypeMatch = description.match(/(?<station>.+?)\s*(?:\[(?<stationType>.*?)\])?$/i);
        return stationAndStationTypeMatch ? stationAndStationTypeMatch.groups : null;//pick up station and transport method from each half
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

module.exports = { RailJourneyInputRowConverter, BusJourneyInputRowConverter, TopUpEventInputRowConverter, SeasonTicketInputRowConverter
}