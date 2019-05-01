const csvFilePath = 'data/input/test1.csv'

const railJourneysFilePath = 'data/intermediate/railJourneys.json'
const busJourneysFilePath = 'data/intermediate/busJourneys.json'
const topUpEventsFilePath = 'data/intermediate/topUpEvents.json'
const seasonTicketAdditionsFilePath = 'data/intermediate/seasonTicketAdditions.json'
const currentTravelcardZones = {
    start: 1,
    end: 2
}

const csvParserParameters = {
    checkType: true,
    ignoreEmpty: true
}

module.exports = { 
    csvFilePath,
    csvParserParameters,
    railJourneysFilePath,
    busJourneysFilePath,
    topUpEventsFilePath,
    seasonTicketAdditionsFilePath,
    currentTravelcardZones: currentTravelcardZones
}