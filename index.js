const { RailJourneyInputRowConverter, BusJourneyInputRowConverter, TopUpEventInputRowConverter, SeasonTicketInputRowConverter } = require('./libs/inputDataConverter');
const defaults = require('./libs/defaults');
const metrics = require('./libs/metrics');
const config = require('./config');
const globals = require('./globals');

; (async function process() {
    let inputArray = await defaults.convertCsvToJSON();
    inputArray.reverse();

    //console.log(inputArray);
    railJourneyList = [];
    busJourneyList = [];
    seasonTicketAdditionList = [];
    topUpEventList = [];
    for (inputRow of inputArray) {
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

    console.log("These values are based on the oyster card data you supplied:\n");
    console.log(`Total number of travelcard months: ${totalNoOfTravelcardMonths}`);
    console.log(`Total amount spent on journeys outside travelcard zones (£): ${totalAmountSpentOutsideTravelcardZones}`);
    console.log("Amount spent on journeys outside travelcard zones per travelcard month (£/month): " + totalAmountSpentOutsideTravelcardZones/totalNoOfTravelcardMonths);
    console.log(`\nTotal rail journey travel time (hours): ${totalRailJourneyTravelTime}\n`);
    console.log(`Cost of yearly travelcard for Zones ${config.currentTravelcardZones.start}-${config.currentTravelcardZones.end} (£): ${globals.yearlyTravelcardDictionary[config.currentTravelcardZones.start][config.currentTravelcardZones.end]}`);
})();