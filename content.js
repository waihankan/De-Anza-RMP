
function scrapeInstructors() {
    const instructorIndex = 14;
    const rows = document.querySelectorAll('.datadisplaytable tbody tr');
    let profSet = new Set();

    if (!rows || rows.length === 0) {
        return null;
    }

    rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (instructorIndex < cells.length) {
            // clean up professor name
            const profName = cells[instructorIndex].textContent.trim().replace(/\(P\)|\(T\)/g, '').replace(/\s\s+/g, ' ').replace(/\s\(/g, '(').trim();
            if (profName !== null && profName !== undefined) {
                profSet.add(profName);
            }
        }
    })

    console.log(profSet);
}

scrapeInstructors();