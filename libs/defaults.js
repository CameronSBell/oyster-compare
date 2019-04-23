let config = require('../config');
const csv = require('csvtojson');
const fs = require('fs');

async function convertCsvToJSON() {
    return jsonArray = await csv(config.csvParserParameters).fromFile(config.csvFilePath);
}

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

function writeAllDataToFile(railwayJourneyList, busJourneyList, topUpEventList, seasonTicketAdditionList) {
    let railwayJourneyData = JSON.stringify(railwayJourneyList, null, 2);
    fs.writeFileSync(config.railwayJourneysFilePath, railwayJourneyData)

    let busJourneyData = JSON.stringify(busJourneyList, null, 2);
    fs.writeFileSync(config.busJourneysFilePath, busJourneyData)

    let topUpEventData = JSON.stringify(topUpEventList, null, 2);
    fs.writeFileSync(config.topUpEventsFilePath, topUpEventData)

    let seasonTicketAdditionData = JSON.stringify(seasonTicketAdditionList, null, 2);
    fs.writeFileSync(config.seasonTicketAdditionsFilePath, seasonTicketAdditionData)
}

const journeyRow = {
    Date: '07-Mar-2019',
    'Start Time': '17:49',
    'End Time': '18:09',
    'Journey/Action':
        'Waterloo (platforms 12-19) [National Rail] to Putney [National Rail]',
    Charge: 0,
    Balance: 6.8
}

module.exports = {
    convertCsvToJSON,
    getEventType,
    writeAllDataToFile
}