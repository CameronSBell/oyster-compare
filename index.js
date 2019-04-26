const { RailJourneyInputRowConverter, BusJourneyInputRowConverter, TopUpEventInputRowConverter, SeasonTicketInputRowConverter } = require('./libs/inputDataConverter');
const defaults = require('./libs/defaults');
const metrics = require('./metrics');

; (async function process() {
    let inputArray = await defaults.convertCsvToJSON();
    inputArray.reverse();

    //console.log(inputArray);
    railwayJourneyList = [];
    busJourneyList = [];
    seasonTicketAdditionList = [];
    topUpEventList = [];
    for (inputRow of inputArray) {
        if (defaults.getEventType(inputRow) == "railJourney") {
            const railJourneyEntry = new RailJourneyInputRowConverter(inputRow).convert();
            railwayJourneyList.push(railJourneyEntry);
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
    defaults.writeAllDataToFile(railwayJourneyList, busJourneyList, topUpEventList, seasonTicketAdditionList);
    let travelcardPeriods = metrics.calculateTravelcardPeriods(railwayJourneyList);
    console.log("Periods of time where a travelcard is active: ")
    console.log(travelcardPeriods);
    console.log("Total amount spent on journeys outside travelcard zones (£): " + metrics.calculateMoneySpentOutsideTravelCardZones(railwayJourneyList));
    console.log("Amount spent on journeys outside travelcard zones per 28 days (£): ")
    console.log("Total rail journey travel time (hours): " + metrics.calculateTotalDuration(railwayJourneyList));
})();