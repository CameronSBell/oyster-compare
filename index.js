const { RailJourneyInputRowConverter, BusJourneyInputRowConverter, TopUpEventInputRowConverter, SeasonTicketInputRowConverter } = require('./libs/inputDataConverter');
const { InputRowEventChecker } = require('./libs/inputRowEventChecker')
const defaults = require('./libs/defaults');
const metrics = require('./libs/metrics');
const config = require('./config');
const globals = require('./globals');

; (async function process() {
    let rawOysterHistoryWithDuplicates = await defaults.convertCsvToJSON();
    let completeOysterHistory = defaults.removeDuplicatesFromArray(rawOysterHistoryWithDuplicates);

    console.log(`You supplied ${completeOysterHistory.length} unique oyster history entries.`); 
    console.log(`${rawOysterHistoryWithDuplicates.length - completeOysterHistory.length} duplicates were removed.`);

    railJourneyList = [];
    busJourneyList = [];
    seasonTicketAdditionList = [];
    topUpEventList = [];
    for (inputRow of completeOysterHistory) {
        let check = new InputRowEventChecker(inputRow);
        if (check.isRailJourney()) {
            const entry = new RailJourneyInputRowConverter(inputRow).convert();
            railJourneyList.push(entry);
        }
        else if (check.isBusJourney()) {
            const entry = new BusJourneyInputRowConverter(inputRow).convert();
            busJourneyList.push(entry);
        }
        else if (check.isTopUp()) {
            const entry = new TopUpEventInputRowConverter(inputRow).convert();
            topUpEventList.push(entry);
        }
        else if (check.isSeasonTicketAddition()) {
            const entry = new SeasonTicketInputRowConverter(inputRow).convert();
            seasonTicketAdditionList.push(entry);
        }
    };

    railJourneyList.sort(defaults.compareJourneys);
    busJourneyList.sort(defaults.compareJourneys);
    topUpEventList.sort(defaults.compareEvents);
    seasonTicketAdditionList.sort(defaults.compareEvents);

    defaults.writeAllDataToFile(railJourneyList, busJourneyList, topUpEventList, seasonTicketAdditionList);

    let railJourneyMetrics = new metrics.RailJourneyMetrics(railJourneyList);
    railJourneyMetrics.calculate().print();
})();