let config = require('../config');
const csv = require('csvtojson');
const fs = require('fs');

async function convertCsvToJSON() {
    let completeInputJSON = [];

    let promise = new Promise(function (resolve, reject) {
        fs.readdir(config.csvDirectoryPath, function (err, filenames) {
            if (err)
                reject(err);
            else
                resolve(filenames);
        });
    });

    return promise.then(async (files) => {
        for (let file of files) {
            let json = await csv(config.csvParserParameters).fromFile(config.csvDirectoryPath + "\\" + file);
            completeInputJSON.push(...json);
        }
        console.log(`Names of input files supplied: ${files}`);
        return completeInputJSON;
    }).catch(error => {
        throw error
    });
}

function removeDuplicatesFromArray(array) {
    return array.filter((obj1, index) => {
        return index === array.findIndex(obj2 => {
            return JSON.stringify(obj1) === JSON.stringify(obj2);
        })
    });
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

function writeAllDataToFile(railJourneyList, busJourneyList, topUpEventList, seasonTicketAdditionList) {
    let railJourneyData = JSON.stringify(railJourneyList, null, 2);
    fs.writeFileSync(config.railJourneysFilePath, railJourneyData)

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
    removeDuplicatesFromArray,
    getEventType,
    writeAllDataToFile
}