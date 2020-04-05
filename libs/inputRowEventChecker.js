class InputRowEventChecker {
    constructor(inputRow) {
        this.journeyDescription = inputRow['Journey/Action'];
    }

    isBusJourney() {
        return this.checkForString("Bus journey");
    }

    isSeasonTicketAddition() {
        return this.checkForString("Season ticket")
    }

    isTopUp() {
        return this.checkForString("Topped-up")
    }

    isRailJourney() {
        return this.checkForString(" to ");
    }

    checkForString(string) {
        return (this.journeyDescription && this.journeyDescription.match(string)) ? true : false;
    }
}

module.exports = { InputRowEventChecker }