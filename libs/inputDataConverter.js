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

    _getStationType() {
        let stationTypeRegExp = new RegExp(/\[(?<stationType>.+?)\]/);
        return this.journeyDescription.match(stationTypeRegExp) ? this.journeyDescription.match(stationTypeRegExp).groups.stationType : null;
    }

    _getDateTime(time) {
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

    convert() {
        return {
            startTime: this._getStartTime(),
            endTime: this._getEndTime(),
            journeyDescription: this.journeyDescription,
            startStationName: this._getStartStation().stationName,
            startStationType: this._getStartStation().stationType,
            endStationName: this._getEndStation().stationName,
            endStationType: this._getEndStation().stationType,
            isTravelcardActive: this._isTravelcardActive(),
            isJourneyOutsideTravelcardZones: this._isTravelcardActive() ? this._isJourneyOutsideTravelcardZones() : undefined,
            isDailyCapReached: this._isDailyCapReached(),
            charge: this.charge,
            balance: this.balance
        }
    }

    _getStartTime() {
        return this.startTimeInHoursAndMinutes ? super._getDateTime(this.startTimeInHoursAndMinutes) : null;
    }

    _getEndTime() {
        return this.endTimeInHoursAndMinutes ? super._getDateTime(this.endTimeInHoursAndMinutes) : null;
    }

    _getStartStation() {
        return this._getStation(this.startJourneyDescription);
    }

    _getEndStation() {
        return this._getStation(this.endJourneyDescription);
    }

    _getStation(description) {
        description = description.replace(/(\(.*?\))/, ""); //remove any round brackets and their contents
        let noTouchMatch = description.match(/\[(?<stationName>No touch-.+?)\]/);
        if (noTouchMatch) {
            return noTouchMatch.groups;
        }
        let stationAndStationTypeMatch = description.match(/(?<stationName>.+?)\s*(?:\[(?<stationType>.*?)\])?$/i);
        return stationAndStationTypeMatch ? stationAndStationTypeMatch.groups : null;//pick up station and transport method from each half
    }

    _isTravelcardActive() {
        let isTravelcardActive;
        if (this._isJourneyOutsideTravelcardZones() || (this.charge == 0 && !this._isDailyCapReached())) {
            isTravelcardActive = true;
        }
        else {
            isTravelcardActive = false;
        }
        return isTravelcardActive;
    }

    _isJourneyOutsideTravelcardZones() {
        let message = "You have been charged for travelling in zones not covered by your Travelcard.";
        return (this.note && this.note.match(message)) ? true : false;
    }

    _isDailyCapReached() {
        let message = "This journey was cheaper or free today because you reached a daily cap";
        return (this.note && this.note.match(message)) ? true : false;
    }
}

class BusJourneyInputRowConverter extends InputRowConverter {
    constructor(journey) {
        super(journey);
    }

    convert() {
        return {
            startTime: super._getDateTime(this.startTimeInHoursAndMinutes),
            journeyDescription: this.journeyDescription,
            route: this._getBusRoute(),
            isHopperFare: this._isHopperFare(),
            charge: this.charge,
            balance: this.balance
        }
    }

    _getBusRoute() {
        let busRoute = new RegExp(/(?:Bus journey).*(?:route)\s{1}(?<busRoute>\w+)/);
        return this.journeyDescription.match(busRoute) ? this.journeyDescription.match(busRoute).groups.busRoute : null;
    }

    _isHopperFare() {
        let hopperFareMessage = "You have not been charged for this journey as it is viewed as a continuation of your previous journey"
        return (this.note && this.note.match(hopperFareMessage)) ? true : false;
    }
}

class TopUpEventInputRowConverter extends InputRowConverter {
    constructor(journey) {
        super(journey)
    }

    convert() {
        return {
            time: super._getDateTime(this.startTimeInHoursAndMinutes),
            location: this._getLocation(),
            stationType: super._getStationType(),
            topUpAmount: this.credit,
            balance: this.balance
        }
    }

    _getLocation() {
        //"Topped-up on touch in, Cannon Street [National Rail]"
        let location = new RegExp(/Topped-up on touch in(?:\,\s)(?<station>.+?)(?:(?:\s\[.+?\])|\s)$/);
        return this.journeyDescription.match(location) ? this.journeyDescription.match(location).groups.station : null;
    }
}

class SeasonTicketInputRowConverter extends InputRowConverter {
    constructor(row) {
        super(row);
    }

    convert() {
        return {
            time: super._getDateTime(this.startTimeInHoursAndMinutes),
            location: this._getLocation(),
            stationType: super._getStationType(),
            balance: this.balance
        }
    }

    _getLocation() {
        //"Season ticket added on touch in, Cannon Street [National Rail]"
        let location = new RegExp(/Season ticket added on touch in(?:\,\s)(?<station>.+?)(?:(?:\s\[.+?\])|\s)$/);
        return this.journeyDescription.match(location) ? this.journeyDescription.match(location).groups.station : null;
    }
}

module.exports = {
    RailJourneyInputRowConverter, BusJourneyInputRowConverter, TopUpEventInputRowConverter, SeasonTicketInputRowConverter
}