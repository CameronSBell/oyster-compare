function removeDuplicatesFromArray(array) {
    return array.filter((obj1, index) => {
        return index === array.findIndex(obj2 => {
            return JSON.stringify(obj1) === JSON.stringify(obj2);
        })
    });
}

module.exports = { removeDuplicateObjectsFromArray: removeDuplicatesFromArray }