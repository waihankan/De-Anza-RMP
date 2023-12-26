
chrome.runtime.sendMessage({ type: "GET_PROFESSOR_RATINGS" }, response => {
    ratings = response;
    console.log("professor ratings received!");
    displayProfessorNames(ratings);
});

const fakeData = new Map();
fakeData.set("12345", {
    "name": "Jeffrey L West",
    "avgRating": 4.5,
    "avgDifficulty": 3.5,
    "openSeats": 20,
});

fakeData.set("12346", {
    "name": "Andrew L East",
    "avgRating": 3,
    "avgDifficulty": 3.5,
    "openSeats": 20,
});

fakeData.set("12347", {
    "name": "Johnathan L North",
    "avgRating": 2,
    "avgDifficulty": 3.5,
    "openSeats": 20,
});

console.log(fakeData);

// modify the table in popup.html using this fake data
// Assuming your table has an id of 'myTable'
let table = document.getElementsByClassName('table')[0];

fakeData.forEach((value, key) => {
    let row = table.insertRow(-1);

    let crn = row.insertCell(0);
    let name = row.insertCell(1);
    let rating = row.insertCell(2);
    let difficulty = row.insertCell(3);
    let openSeats = row.insertCell(4);

    crn.innerHTML = key;
    name.innerHTML = value.name;
    rating.innerHTML = `<span class="rating">${value.avgRating}</span>`;
    difficulty.innerHTML = value.avgDifficulty;
    openSeats.innerHTML = value.openSeats;

    if (value.avgRating >= 4) {
        // add rating class to the span inside this element
        rating.querySelector('span').classList.add('rating-high');
    } else if (value.avgRating >= 2.9) {
        rating.querySelector('span').classList.add('rating-mid');
    } else {
        rating.querySelector('span').classList.add('rating-low');
    }
});