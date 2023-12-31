const instructorIndex = 14;
const rmpIndex = instructorIndex + 1;
let profSet;
let classData = new Map();


/**
 * Main function that runs when the page loads.
 * Scrape Data -> Send Data to Background -> Send Data to Content
 */
window.onload = () => {
    addLoadingRating();
    profSet = scrapeInstructors(instructorIndex);
    classData = scrapeRows();
    if (profSet !== null || classData !== null) {
        chrome.runtime.sendMessage({ type: "ProfessorSets", data: Array.from(profSet) }, () => {
            // console.log("professor set sent from content to background");
        });
        chrome.runtime.sendMessage({ type: "ClassData", data: Array.from(classData) }, () => {
            // console.log("class data sent from content to background");
        });
    }
}


/**
 * Listens for a message from the background script containing professor ratings.
 * This message is used to update the ratings column in the table.
 */
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "ProfessorRatings") {
        const professorRatings = message.data;
        updateRatings(professorRatings);
    }
});

/**
 * Scrapes the instructors' names from a table and returns a set of unique names.
 * 
 * @param {number} instructorIndex - The index of the column containing the instructor names.
 * @returns {Set<string> | null} - A set of unique instructor names, or null if no rows are found.
 */
function scrapeInstructors(instructorIndex) {
    const rows = document.querySelectorAll('.datadisplaytable tbody tr');
    let profSet = new Set();

    if (!rows || rows.length === 0) {
        return null;
    }

    rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (instructorIndex < cells.length) {
            // clean up professor name
            const profName = cells[instructorIndex].textContent.trim().replace(/\(P\)|\(T\)/g, '')
                .replace(/\s\s+/g, ' ').replace(/\s\(/g, '(').trim();
            if (profName !== null && profName !== undefined) {
                profSet.add(profName);
            }
        }
    })
    return profSet;
}

// scrape CRN, Rem, WL Rem
/**
 * Scrapes the rows of a table and returns a map of course information.
 * @returns {Map<string, { profName: string, rem: string, wlRem: string }>} A map containing course information
 * with CRN as the key and an object with professor name, remaining seats, and waitlist remaining seats as the value.
 */
function scrapeRows() {
    const rows = document.querySelectorAll('.datadisplaytable tbody tr');
    if (!rows || rows.length === 0) {
        return null;
    }

    const tempMap = new Map();
    rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length === 20) {
            const crn = cells[1].textContent.trim();
            const rem = cells[12].textContent.trim();
            const wlRem = cells[13].textContent.trim();
            const profName = cells[instructorIndex].textContent.trim().replace(/\(P\)|\(T\)/g, '')
                .replace(/\s\s+/g, ' ').replace(/\s\(/g, '(').trim();
            if (crn !== null && crn !== undefined && crn !== "") {
                tempMap.set(crn, { profName, rem, wlRem })
            }
        }
    })
    return tempMap;
}

/**
 * Adds a loading rating column to the table.
 */
function addLoadingRating() {
    const rows = document.querySelectorAll('.datadisplaytable tbody tr');

    if (!rows || rows.length === 0) {
        return;
    }

    for (let i = 1; i < rows.length; i++) {
        if (rows[i].cells.length <= 3) {
            return;
        }
        const ratingIndex = rows[i].cells.length < instructorIndex + 1 ? rows[i].cells.length : 15;
        const newCell = rows[i].insertCell(ratingIndex);
        if (i === 1) {
            newCell.classList.add('ddheader');
            newCell.textContent = "RMP Rating";
        } else {
            newCell.classList.add('dddefault');
            newCell.textContent = "N/A";
        }
    }
}

/**
 * Updates the ratings of professors in a table based on the provided professor ratings.
 * 
 * @param {Object} professorRatings - The object containing the ratings of professors.
 */
function updateRatings(professorRatings) {
    const rows = document.querySelectorAll('.datadisplaytable tbody tr');

    if (!rows || rows.length === 0) {
        return;
    }

    for (let i = 2; i < rows.length; i++) {
        if (rows[i].cells.length <= 3 || instructorIndex >= rows[i].cells.length) {
            continue;
        }
        const profName = rows[i].cells[instructorIndex].textContent.trim().replace(/\(P\)|\(T\)/g, '')
            .replace(/\s\s+/g, ' ').replace(/\s\(/g, '(').trim();
        // const rating = professorRatings[profName]?.avgRating || "can't find";
        // rows[i].cells[rmpIndex].textContent = rating;

        // const rating = professorRatings[profName]?.avgRating || "can't find";
        // const ratingElement = document.createElement('a');
        // ratingElement.href = `https://www.ratemyprofessors.com/professor/${professorRatings[profName]?.link}`
        // ratingElement.style.color = "black !important";
        // ratingElement.style.textDecoration = "none";
        // ratingElement.textContent = rating;
        // rows[i].cells[rmpIndex].innerHTML = '';
        // rows[i].cells[rmpIndex].appendChild(ratingElement);


        const style = document.createElement('style');
        style.textContent = `
        .rating-low {
            background-color: rgba(246, 43, 43, 0.736);
            color: white;
            padding: 2px 7px;
            border-radius: 5px;
        }

        .rating-mid {
            background-color: orange;
            color: white;
            padding: 2px 7px;
            border-radius: 5px;
        }

        .rating-low:hover, .rating-mid:hover, .rating-high:hover {
            opacity: 0.8;
        }

        .not-found {
            background-color: rgba(208, 201, 189, 0.821);
            color: rgb(89, 88, 88);
            padding: 2px 7px;
            border-radius: 5px;
            pointer-events: none
        }

        .rating-high {
            background-color: rgba(10, 192, 10, 0.83);
            color: white;
            padding: 2px 7px;
            border-radius: 5px;
        }

        td a:link, a:visited {
            color: white !important;
            text-decoration: none;
        }

        .rating-align {
            text-align: center !important;
            vertical-align: middle;
        }

        .black-link {
            color: black !important;
            text-decoration: none;
        }`

        document.head.appendChild(style);


        const rating = professorRatings[profName]?.avgRating || "N/A";
        const ratingElement = document.createElement('a');
        ratingElement.href = `https://www.ratemyprofessors.com/professor/${professorRatings[profName]?.link}`
        ratingElement.target = "_blank";
        ratingElement.classList.add('black-link');

        const spanWrapper = document.createElement('span');
        spanWrapper.textContent = rating;
        if (rating === "N/A") {
            spanWrapper.classList.add('not-found');
            ratingElement.style.fontSize = "11px";
            ratingElement.style.color = "gray";
            ratingElement.style.pointerEvents = "none";
        }
        else if (professorRatings[profName].avgRating >= 4) {
            spanWrapper.classList.add('rating-high');
        } else if (professorRatings[profName].avgRating >= 2.9) {
            spanWrapper.classList.add('rating-mid');
        } else {
            spanWrapper.classList.add('rating-low');
        }
        ratingElement.appendChild(spanWrapper);

        rows[i].cells[rmpIndex].innerHTML = '';
        rows[i].cells[rmpIndex].classList.add('rating-align');
        rows[i].cells[rmpIndex].appendChild(ratingElement);
    }
}
