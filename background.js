const AUTH_TOKEN = 'dGVzdDp0ZXN0';
const schoolID = 'U2Nob29sLTE5Njc='; // De Anza College ID

let professorRatingMap = new Map();
let professors;
let classData;


/**
 * Listens for messages from the content scripts.
 * Performs actions based on the type of message received.
 */
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "ProfessorSets") {
        professors = Object.values(message.data);
        Promise.all(professors.map(async (prof) => {
            const modifiedName = getFirstAndLastName(prof);

            const professor = await searchProfessorOnRmp(modifiedName, schoolID);
            if (professor && professor.length > 0) {
                const professorRating = await getProfessor(professor[0].id);
                professorRatingMap.set(prof, {
                    "avgRating": professorRating.avgRating,
                    "avgDifficulty": professorRating.avgDifficulty,
                    "takeAgain": professorRating.wouldTakeAgainPercent,
                    "link": professorRating.legacyId
                });
            }
        })).then(() => {
            const professorRatingObj = Object.fromEntries(professorRatingMap);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { type: "ProfessorRatings", data: professorRatingObj });
            });
        });
    }

    else if (message.type === "ClassData") {
        Promise.all(professors.map(async (prof) => {
            const modifiedName = getFirstAndLastName(prof);
            const professor = await searchProfessorOnRmp(modifiedName, schoolID);
            if (professor && professor.length > 0) {
                const professorRating = await getProfessor(professor[0].id);
                professorRatingMap.set(prof, {
                    "avgRating": professorRating.avgRating,
                    "avgDifficulty": professorRating.avgDifficulty,
                    "takeAgain": professorRating.wouldTakeAgainPercent,
                    "link": professorRating.legacyId
                });
            }
        })).then(() => {
            classData = new Map(message.data);
            classData.forEach((value, key) => {
                const name = value.profName;
                const rating = professorRatingMap.get(name);
                if (rating) {
                    value.avgRating = rating.avgRating;
                    value.avgDifficulty = rating.avgDifficulty;
                    value.takeAgain = rating.takeAgain;
                    value.link = rating.link;
                }
                else {
                    value.avgRating = "N/A";
                    value.avgDifficulty = "N/A";
                    value.takeAgain = "N/A";
                    value.link = "undefined";
                }
            });
        })
    }
});

/**
 * Listens for messages from the popup.js.
 * Send the data when received a request.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_PROFESSOR_RATINGS_AND_CLASS_DATA") {
        sendResponse(Array.from(classData));
    }
});


// HELPER FUNCTIONS

/**
 * Searches for a professor on RateMyProfessors.com using the provided name and school ID.
 * @param {string} name - The name of the professor to search for.
 * @param {string} schoolID - The ID of the school where the professor is affiliated.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of professor objects found on RateMyProfessors.com.
 */
async function searchProfessorOnRmp(name, schoolID) {
    const response = await fetch(
        `https://www.ratemyprofessors.com/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${AUTH_TOKEN}`,
            },
            body: JSON.stringify({
                query: `query NewSearchTeachersQuery($text: String!, $schoolID: ID!) {
            newSearch {
                teachers(query: {text: $text, schoolID: $schoolID}) {
                edges {
                    cursor
                    node {
                    id
                    firstName
                    lastName
                    school {
                        name
                        id
                    }
                    }
                }
                }
            }
            }`,
                variables: {
                    text: name,
                    schoolID,
                },
            }),
        }
    );

    const json = await response.json();
    if (json.data.newSearch.teachers.edges.length > 0) {
        return json.data.newSearch.teachers.edges.map((edge) => edge.node);
    } else {
        console.log("Can't find professor: " + name);
        return [];
    }
}


/**
 * Retrieves professor information from RateMyProfessors API.
 * @param {string} id - The ID of the professor.
 * @returns {Promise<Object>} - A promise that resolves to the professor information.
 */
const getProfessor = async (id) => {
    const response = await fetch(
        // self hosted proxy
        `https://www.ratemyprofessors.com/graphql`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${AUTH_TOKEN}`,
            },
            body: JSON.stringify({
                query: `query TeacherRatingsPageQuery($id: ID!) {
          node(id: $id) {
            ... on Teacher {
              id
              firstName
              lastName
              school {
                name
                id
                city
                state
              }
              avgDifficulty
              avgRating
              department
              numRatings
              legacyId
              wouldTakeAgainPercent
            }
            id
          }
        }`,
                variables: {
                    id,
                },
            }),
        }
    );
    const json = await response.json();
    return json.data.node;
};

/**
 * Returns the first and last name from a given full name.
 * @param {string} name - The full name.
 * @returns {string} - The first and last name.
 */
function getFirstAndLastName(name) {
    const nameParts = name.split(/[\s-]+/);
    if (nameParts.length === 2) {
        return name;
    } else {
        return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
    }
}
