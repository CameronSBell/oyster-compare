const csv = require('csvtojson')
const parserParameters = {
    checkType: true,
    ignoreEmpty: true
}

async function convertToJSON() {
    const csvFilePath = 'data/test.csv'
    return jsonArray = await csv(parserParameters).fromFile(csvFilePath);
}

monthDictionary = {
    "Jan": 0,
    "Feb": 1,
    "Mar": 2,
    "Apr": 3,
    "May": 4,
    "Jun": 5,
    "Jul": 6,
    "Aug": 7,
    "Sep": 8,
    "Oct": 9,
    "Nov": 10,
    "Dec": 11
}

journeyRow = {
    Date: '07-Mar-2019',
    'Start Time': '17:49',
    'End Time': '18:09',
    'Journey/Action':
        'Waterloo (platforms 12-19) [National Rail] to Putney [National Rail]',
    Charge: 0,
    Balance: 6.8
}

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


}

class RailJourneyInputRowConverter {
    constructor(journey) {
        this.date = journey.Date;
        this.startTimeInHoursAndMinutes = journey['Start Time'];
        this.endTimeInHoursAndMinutes = journey['End Time'];
        this.journeyDescription = journey['Journey/Action'];
        this.charge = journey.Charge;
        this.balance = journey.Balance;
    }

    get startTime() {
        return this.getDateTime(this.startTimeInHoursAndMinutes);
    }

    get endTime() {
        return this.getDateTime(this.endTimeInHoursAndMinutes);
    }

    get startTransportMethod() {
        return this.parseJourneyDescription(this.journeyDescription.split(/ to /)[0]).transportMethod;
    }

    get startPoint() {
        return this.parseJourneyDescription(this.journeyDescription.split(/ to /)[0]).station;
    }

    get endTransportMethod() {
        return this.parseJourneyDescription(this.journeyDescription.split(/ to /)[1]).transportMethod;
    }

    get endPoint() {
        return this.parseJourneyDescription(this.journeyDescription.split(/ to /)[1]).station;
    }

    getDateTime(time) {
        if (!time) {
            return null;
        }
        let splitDate = this.date.match(/(?<day>\d{2})-(?<monthAbbreviation>\w{3})-(?<year>\d{4})/).groups;
        let splitTime = time.match(/(?<hour>\d{2}):(?<minute>\d{2})/).groups;
        return new Date(splitDate.year, monthDictionary[splitDate.monthAbbreviation], splitDate.day, splitTime.hour, splitTime.minute);
    }

    parseJourneyDescription(description) {
        if (!description) {
            return null;
        }
        description = description.replace(/(\(.*?\))/, ""); //remove any round brackets and their contents
        if (description.match(/\[(?<station>No touch-in)\]/)) {
            return {
                station: 'No touch-in',
                transportMethod: null
            }
        }
        return description.match(/(?<station>.+?)\s*(?:\[(?<transportMethod>.*?)\])?$/i).groups;//pick up station and transport method from each half
    }
}

class BusJourneyConverter extends InputRowConverter {
    constructor(journey) {
        super(journey);
    }

    getBusRoute() {
        return super.journeyDescription.match(/(?:Bus journey).*(?:route)\s{1}(?<busRoute>\w+)/).groups.busRoute;
    }

    isHopperFare() {
        if (super.journeyDescription.match(/You have not been charged for this journey as it is viewed as a continuation of your previous journey/)) {
            return true;
        }
        else {
            return false;
        }
    }

    convert() {
        return {
            startTime: super.getDateTime(super.startTimeInHoursAndMinutes),
            journeyDescription: super.journeyDescription,
            route: getBusRoute(),
            isHopperFare: isHopperFare(),
            charge: super.charge,
            balance: super.balance
        }
    }
}

class TopUpEventConverter extends InputRowConverter{
    constructor(journey) {
        super(journey)
    }

    getLocation() {
        return journeyDescription.match(/Topped-up on touch in.+?(\w+?)? /)
        "Topped-up on touch in, Cannon Street [National Rail]"
    }



    convert() {
        return {
            time: super.getDateTime(super.startTimeInHoursAndMinutes),
            location: this.getLocation() ? this.getLocation : null,
            stationType: super.getStationType(),
            topUpAmount: 10,
            balance: 10.40
        }
    }
}

(async function process() {
    inputArray = await convertToJSON();

    console.log(inputArray);
    endResult = [];
    for (journeyRow of inputArray) {
        const convert = new RailJourneyInputRowConverter(journeyRow);
        journeyEntry = {
            startTime: convert.startTime,
            endTime: convert.endTime,
            journeyDescription: convert.journeyDescription,
            startPoint: convert.startPoint,
            startTransportMethod: convert.startTransportMethod ? convert.startTransportMethod : null,
            endPoint: convert.endPoint,
            endTransportMethod: convert.endTransportMethod ? convert.endTransportMethod : null,
            charge: convert.charge,
            balance: convert.balance
        }
        endResult.push(journeyEntry);
    };

    console.log(endResult);
    return endResult;
})();

//  (async function calculateTotalDuration() {
//     let totalDuration=0;
//     results = await process();
//     for(journey of results) {
//         duration = journey.endTime - journey.startTime;
//         console.log(duration);
//         totalDuration += duration;
//     }
//     console.log(totalDuration/(1000*60*60));
//  })();

async function identifyEvent(journeyRow) {
    if (journeyRow['Journey/Action'].match(/Bus journey/)) {
        journeyRow.eventType = "busJourney"
    }
    else if (journeyRow['Journey/Action'].match(/Season ticket/)) {
        journeyRow.eventType = "seasonTicketAddition"
    }
    else if (journeyRow['Journey/Action'].match(/Topped-up/)) {
        journeyRow.eventType = "topUp"
    }
    else {
        journeyRow.eventType = "railJourney"
    }
    return journeyRow;
}