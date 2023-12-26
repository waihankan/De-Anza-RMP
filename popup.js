
let fakeData = new Map();

chrome.runtime.sendMessage({ type: "GET_PROFESSOR_RATINGS_AND_CLASS_DATA" }, response => {
    fakeData = new Map(response);

    // sort fakeData by avgRating and then +value.rem + +value.wlRem
    fakeData = new Map([...fakeData.entries()].sort((a, b) => {
        if (a[1].avgRating === "N/A" && b[1].avgRating === "N/A") {
            return +a[1].rem + +a[1].wlRem < +b[1].rem + +b[1].wlRem ? 1 : -1;
        } else if (a[1].avgRating === "N/A") {
            return 1;
        } else if (b[1].avgRating === "N/A") {
            return -1;
        } else {
            return a[1].avgRating < b[1].avgRating ? 1 : -1;
        }
    }));

    console.log(fakeData);
    manipulateDOM();
});


function manipulateDOM() {
    console.log("Here it is in popup.js");
    console.log(fakeData);

    let table = document.getElementsByClassName('table')[0];

    fakeData.forEach((value, key) => {
        let row = table.insertRow(-1);

        let crn = row.insertCell(0);
        let name = row.insertCell(1);
        let rating = row.insertCell(2);
        let difficulty = row.insertCell(3);
        let openSeats = row.insertCell(4);
        console.log(value);
        let link = "https://www.ratemyprofessors.com/professor/" + value.link;

        crn.innerHTML = key;
        name.innerHTML = `<a style="color: #333" target="_blank" href="${link}">${value.profName}</a>`;
        rating.innerHTML = `<span class="rating">${value.avgRating}</span>`;
        difficulty.innerHTML = `<span class="rating">${value.avgDifficulty}</span>`;
        openSeats.innerHTML = +value.rem + +value.wlRem;

        if (value.avgRating === "N/A" || value.avgRating === 0) {
            rating.innerHTML = `<span class="rating">N/A</span>`
            rating.querySelector('span').classList.add('not-found');
        } else if (value.avgRating >= 4) {
            // add rating class to the span inside this element
            rating.querySelector('span').classList.add('rating-high');
        } else if (value.avgRating >= 2.9) {
            rating.querySelector('span').classList.add('rating-mid');
        } else {
            rating.querySelector('span').classList.add('rating-low');
        }


        if (value.avgDifficulty === "N/A" || value.avgDifficulty === 0) {
            difficulty.innerHTML = `<span class="rating">N/A</span>`
            difficulty.querySelector('span').classList.add('not-found');
        }
    });
}
