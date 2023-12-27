let tableData = new Map();


let tips = document.getElementsByClassName('tips')[0];
let table = document.getElementsByClassName('scrollable-table')[0];
if (tips) {
    tips.classList.add('hidden');
}

if (table) {
    table.classList.add('hidden');
}

// add a tips section
let wrongPage = document.createElement('div');
wrongPage.classList.add('not-working');
wrongPage.innerHTML = `
    <ul>
        <li>The extension works only on FHDA registration page.</li>
        <li>Please refresh if you're on FHDA registration page and seeing this message.</li>
        <li>For other issues, please click on the "Feedback & Issues" below.</li>
    </ul>
`;
document.getElementsByClassName('container')[0].appendChild(wrongPage);




chrome.runtime.sendMessage({ type: "GET_PROFESSOR_RATINGS_AND_CLASS_DATA" }, response => {
    tableData = new Map(response);

    // sort tableData by avgRating and then +value.rem + +value.wlRem
    tableData = new Map([...tableData.entries()].sort((a, b) => {
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
    if (tableData !== undefined) {
        document.getElementsByClassName('not-working')[0].classList.add('hidden');
        document.getElementsByClassName('tips')[0].classList.remove('hidden');
        document.getElementsByClassName('scrollable-table')[0].classList.remove('hidden');
        manipulateDOM();
    }
});


function manipulateDOM() {
    let table = document.getElementsByClassName('table')[0];

    tableData.forEach((value, key) => {
        let row = table.insertRow(-1);

        let crn = row.insertCell(0);
        let name = row.insertCell(1);
        let rating = row.insertCell(2);
        let difficulty = row.insertCell(3);
        let openSeats = row.insertCell(4);
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
