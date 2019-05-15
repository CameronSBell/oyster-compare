const csvInputDirectoryPath ='data/input';

const intermediateDataDirectoryPath = 'data/intermediate';
const railJourneysFileName = 'railJourneys.json'
const busJourneysFileName = 'busJourneys.json'
const topUpEventsFileName = 'topUpEvents.json'
const seasonTicketAdditionsFileName = 'seasonTicketAdditions.json'
const currentTravelcardZones = {
    start: 1,
    end: 2
}

const csvParserParameters = {
    checkType: true,
    ignoreEmpty: true
}

module.exports = {
    intermediateDataDirectoryPath,
    csvInputDirectoryPath,
    csvParserParameters,
    railJourneysFileName,
    busJourneysFileName,
    topUpEventsFileName,
    seasonTicketAdditionsFileName,
    currentTravelcardZones: currentTravelcardZones
}