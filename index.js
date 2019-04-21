const { RailJourneyInputRowConverter, BusJourneyInputRowConverter, TopUpEventInputRowConverter, SeasonTicketInputRowConverter } = require('./libs/inputDataConverter');

const csv = require('csvtojson');
const parserParameters = {
    checkType: true,
    ignoreEmpty: true
}

async function convertToJSON() {
    const csvFilePath = 'data/test1.csv'
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


;(async function process() {
    let inputArray = await convertToJSON();

    console.log(inputArray);
    railwayJourneyList = [];
    busJourneyList = [];
    seasonTicketAdditionList = [];
    topUpEventList = [];
    for (inputRow of inputArray) {
        if (getEventType(inputRow) == "railJourney") {
            const railJourneyEntry = new RailJourneyInputRowConverter(inputRow).convert();
            railwayJourneyList.push(railJourneyEntry);
        }
        if (getEventType(inputRow) == "busJourney") {
            const entry = new BusJourneyInputRowConverter(inputRow).convert();
            busJourneyList.push(entry);
        }
        if (getEventType(inputRow) == "topUp") {
            const entry = new TopUpEventInputRowConverter(inputRow).convert();
            topUpEventList.push(entry);
        }
        if (getEventType(inputRow) == "seasonTicketAddition") {
            const entry = new SeasonTicketInputRowConverter(inputRow).convert();
            seasonTicketAdditionList.push(entry);
        }
    };

    console.log(topUpEventList);
    return railwayJourneyList;
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

function getEventType(inputRow) {
    let eventType;
    if (inputRow['Journey/Action'].match(/Bus journey/)) {
        eventType = "busJourney"
    }
    else if (inputRow['Journey/Action'].match(/Season ticket/)) {
        eventType = "seasonTicketAddition"
    }
    else if (inputRow['Journey/Action'].match(/Topped-up/)) {
        eventType = "topUp"
    }
    else {
        eventType = "railJourney"
    }
    return eventType;
}