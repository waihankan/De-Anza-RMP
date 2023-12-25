const instructorIndex = 14;
const rmpIndex = instructorIndex + 1;
let profSet;

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

window.onload = () => {
    addLoadingRating();
    profSet = scrapeInstructors(instructorIndex);
    chrome.runtime.sendMessage({type: "ProfessorSets", data: Array.from(profSet)}, () => {
        console.log("professor set sent from content to background");
    });
}


chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "ProfessorRatings") {
        const professorRatings = message.data;

        console.log(professorRatings);

        updateRatings(professorRatings);
    }
});

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
        const rating = professorRatings[profName]?.avgRating || "can't find";
        rows[i].cells[rmpIndex].textContent = rating;
    }

    console.log("GETTING DATA FROM BACKGROUND");
    console.log(professorRatings);
}

