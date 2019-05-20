let arrayFunctions = require("./arrayFunctions");

class OysterHistoryConverter {
    constructor(rawOysterHistory) {
        this.list = rawOysterHistory;
    }

    removeDuplicates() {
        let lengthBeforeRemovingDuplicates = this.list.length;
        this.list = arrayFunctions.removeDuplicatesFromArray(this.list);

        console.log(`You supplied ${this.length} unique oyster history entries.`);
        console.log(`${lengthBeforeRemovingDuplicates - this.length} duplicates were removed.`);
    }

    getList() {
        return this.list
    }
}

module.exports = { OysterHistoryConverter }