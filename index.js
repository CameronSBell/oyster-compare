const { RailJourneyInputRowConverter, BusJourneyInputRowConverter, TopUpEventInputRowConverter, SeasonTicketInputRowConverter } = require('./libs/inputDataConverter');
const { OysterHistoryConverter } = require("./libs/oysterHistoryConverter");
const { InputRowEventChecker } = require('./libs/inputRowEventChecker');
const defaults = require('./libs/defaults');
const arraySorting = require('./libs/arraySorting');
const metrics = require('./libs/metrics');

; (async function process() {
    let rawOysterHistoryWithDuplicates = await defaults.convertCsvToJSON();
    let oysterHistory = new OysterHistoryConverter(rawOysterHistoryWithDuplicates);
    oysterHistory.removeDuplicates();

    railJourneyList = [];
    busJourneyList = [];
    seasonTicketAdditionList = [];
    topUpEventList = [];
    for (inputRow of oysterHistory.getList()) {
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

    railJourneyList.sort(arraySorting.compareJourneys);
    busJourneyList.sort(arraySorting.compareJourneys);
    topUpEventList.sort(arraySorting.compareEvents);
    seasonTicketAdditionList.sort(arraySorting.compareEvents);

    defaults.writeAllDataToFile(railJourneyList, busJourneyList, topUpEventList, seasonTicketAdditionList);

    let railJourneyMetrics = new metrics.RailJourneyMetrics(railJourneyList);
    railJourneyMetrics.calculate().print();
})();