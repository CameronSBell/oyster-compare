const { RailJourneyInputRowConverter, BusJourneyInputRowConverter, TopUpEventInputRowConverter, SeasonTicketInputRowConverter } = require('./libs/inputDataConverter');
const defaults = require('./libs/defaults');
const metrics = require('./libs/metrics');
const config = require('./config');
const globals = require('./globals');

; (async function process() {
    let rawOysterHistory = await defaults.convertCsvToJSON();
    let completeOysterHistory = defaults.removeDuplicatesFromArray(rawOysterHistory);

    console.log(`You supplied ${completeOysterHistory.length} unique oyster history entries.`); 
    console.log(`${rawOysterHistory.length - completeOysterHistory.length} duplicates were removed.`);

    railJourneyList = [];
    busJourneyList = [];
    seasonTicketAdditionList = [];
    topUpEventList = [];
    for (inputRow of completeOysterHistory) {
        if (defaults.getEventType(inputRow) == "railJourney") {
            const entry = new RailJourneyInputRowConverter(inputRow).convert();
            railJourneyList.push(entry);
        }
        if (defaults.getEventType(inputRow) == "busJourney") {
            const entry = new BusJourneyInputRowConverter(inputRow).convert();
            busJourneyList.push(entry);
        }
        if (defaults.getEventType(inputRow) == "topUp") {
            const entry = new TopUpEventInputRowConverter(inputRow).convert();
            topUpEventList.push(entry);
        }
        if (defaults.getEventType(inputRow) == "seasonTicketAddition") {
            const entry = new SeasonTicketInputRowConverter(inputRow).convert();
            seasonTicketAdditionList.push(entry);
        }
    };

    defaults.writeAllDataToFile(railJourneyList, busJourneyList, topUpEventList, seasonTicketAdditionList);

    let metric = new metrics.RailJourneyMetrics(railJourneyList);
    let totalNoOfTravelcardMonths = metric.getTotalNumberOfTravelcardMonths();
    let totalAmountSpentOutsideTravelcardZones = metric.getMoneySpentOutsideTravelCardZones();
    let totalRailJourneyTravelTime = metric.getTotalTravelDuration();
    let yearlyTravelcardPrice = globals.yearlyTravelcardDictionary[config.currentTravelcardZones.start][config.currentTravelcardZones.end];
    let yearlyTravelcardSaving = (12 * (totalAmountSpentOutsideTravelcardZones + 130)) - yearlyTravelcardPrice;

    console.log("These values are based on the oyster card history you supplied:\n");
    console.log(`Total number of travelcard months: ${totalNoOfTravelcardMonths}`);
    console.log(`Total amount spent on journeys outside travelcard zones (£): ${totalAmountSpentOutsideTravelcardZones}`);
    console.log("Amount spent on journeys outside travelcard zones per travelcard month (£/month): " + totalAmountSpentOutsideTravelcardZones/totalNoOfTravelcardMonths);
    console.log(`\nTotal rail journey travel time (hours): ${totalRailJourneyTravelTime}\n`);
    console.log(`Cost of yearly travelcard for Zones ${config.currentTravelcardZones.start}-${config.currentTravelcardZones.end} (£): ${globals.yearlyTravelcardDictionary[config.currentTravelcardZones.start][config.currentTravelcardZones.end]}`);
    console.log(`Yearly saving with yearly travelcard over monthly travelcard, based on currently monthly costs (£):  ${yearlyTravelcardSaving}`);
    console.log(`Monthly saving with yearly travelcard: ${yearlyTravelcardSaving/12}`);
})();