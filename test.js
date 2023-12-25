function getFirstAndLastName(name) {
    const nameParts = name.split(/[\s-]+/);
    if (nameParts.length === 2) {
        return name;
    } else {
        return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
    }
}


// const newname = getFirstAndLastName("Delia-Manuela Garbacea")
const newname = getFirstAndLastName("Edward J Ahrens")
console.log(newname);