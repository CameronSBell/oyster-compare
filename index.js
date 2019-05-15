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

    let railJourneys = new metrics.RailJourneyMetrics(railJourneyList);
    let totalNoOfTravelcardMonths = railJourneys.getTotalNumberOfTravelcardMonths();
    let totalAmountSpentOutsideTravelcardZones = railJourneys.getMoneySpentOutsideTravelCardZones();
    let totalRailJourneyTravelTime = railJourneys.getTotalTravelDuration();
    let yearlyTravelcardPrice = globals.yearlyTravelcardPriceDictionary[config.currentTravelcardZones.start][config.currentTravelcardZones.end];
    let monthlyTravelcardPrice = globals.monthlyTravelcardPriceDictionary[config.currentTravelcardZones.start][config.currentTravelcardZones.end];
    let yearlyTravelcardSaving = (12 * (totalAmountSpentOutsideTravelcardZones/totalNoOfTravelcardMonths + monthlyTravelcardPrice)) - yearlyTravelcardPrice;

    console.log("These values are based on the oyster card history you supplied:\n");
    console.log(`Total number of travelcard months: ${totalNoOfTravelcardMonths}`);
    console.log(`Total amount spent on journeys outside travelcard zones (£): ${totalAmountSpentOutsideTravelcardZones}`);
    console.log("Amount spent on journeys outside travelcard zones per travelcard month (£/month): " + totalAmountSpentOutsideTravelcardZones/totalNoOfTravelcardMonths);
    console.log(`\nTotal rail journey travel time (hours): ${totalRailJourneyTravelTime}\n`);
    console.log(`Cost of yearly travelcard for Zones ${config.currentTravelcardZones.start}-${config.currentTravelcardZones.end} (£): ${globals.yearlyTravelcardPriceDictionary[config.currentTravelcardZones.start][config.currentTravelcardZones.end]}`);
    console.log(`Yearly saving with yearly travelcard over monthly travelcard, based on currently monthly costs (£):  ${yearlyTravelcardSaving}`);
    console.log(`Monthly saving with yearly travelcard (£): ${yearlyTravelcardSaving/12}`);
})();