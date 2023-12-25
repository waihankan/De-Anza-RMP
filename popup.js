
chrome.runtime.sendMessage({type: "GET_PROFESSOR_RATINGS"}, response => {
    ratings = response;
    console.log("professor ratings received!");
    displayProfessorNames(ratings);
});