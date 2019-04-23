const csvFilePath = 'data/input/test1.csv'

const railwayJourneysFilePath = 'data/intermediate/railwayJourneys.json'
const busJourneysFilePath = 'data/intermediate/busJourneys.json'
const topUpEventsFilePath = 'data/intermediate/topUpEvents.json'
const seasonTicketAdditionsFilePath = 'data/intermediate/seasonTicketAdditions.json'

const csvParserParameters = {
    checkType: true,
    ignoreEmpty: true
}

module.exports = { 
    csvFilePath,
    csvParserParameters,
    railwayJourneysFilePath,
    busJourneysFilePath,
    topUpEventsFilePath,
    seasonTicketAdditionsFilePath
}