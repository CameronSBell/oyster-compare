class InputRowEventChecker {
    constructor(inputRow) {
        this.journeyDescription = inputRow['Journey/Action'];
    }

    isBusJourney() {
        return (this.journeyDescription && this.journeyDescription.match(/Bus journey/) ? true : false);
    }

    isSeasonTicketAddition() {
        return (this.journeyDescription && this.journeyDescription.match(/Season ticket/)) ? true : false;
    }

    isTopUp() {
        return (this.journeyDescription && this.journeyDescription.match(/Topped-up/)) ? true : false;
    }

    isRailJourney() {
        return (this.journeyDescription && this.journeyDescription.match(/ to /)) ? true : false;
    }
}

module.exports = { InputRowEventChecker }