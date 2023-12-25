const AUTH_TOKEN = 'dGVzdDp0ZXN0';

const schoolID = 'U2Nob29sLTE5Njc='; // De Anza College ID

let professorRatingMap = new Map();

let professors;
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "ProfessorSets") {
        professors = Object.values(message.data);
        Promise.all(professors.map(async (prof) => {
            const modifiedName = getFirstAndLastName(prof);
            const professor = await searchProfessorOnRmp(modifiedName, schoolID);
            if (professor && professor.length > 0) {
                const professorRating = await getProfessor(professor[0].id);
                professorRatingMap.set(prof, {
                    "avgRating" : professorRating.avgRating,
                    "avgDifficulty" : professorRating.avgDifficulty,
                    "takeAgain" : professorRating.wouldTakeAgainPercent
                });
            }
        })).then(() => {
            const professorRatingObj = Object.fromEntries(professorRatingMap);
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {type: "ProfessorRatings", data: professorRatingObj});
            });
        });
    }
});













// helper functions
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


// async function run() {
//     const test = professors[0];
//     console.log("searching name: " + test);
//     const professor = await searchProfessorOnRmp(test, schoolID);

//     if (professor && professor.length > 0) {
//         const professorRating = await getProfessor(professor[0].id);
//         console.log(test + "'s rating: " + professorRating);
//     }

// }

// run();


// Listen for requests from the popup script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === "GET_PROFESSOR_RATINGS") {
        console.log(professorRatingMap.get("Jeffrey L West"));
        // const test = professors[0];
        // console.log("searching name: " + test);
        // const newname = getFirstAndLastName(test);
        // console.log(newname);
        // const professor = await searchProfessorOnRmp(newname, schoolID);

        // if (professor && professor.length > 0) {
        //     const professorRating = await getProfessor(professor[0].id);
        //     console.log(test + "'s rating: " + professorRating.avgRating);
        // }
    }
});

function getFirstAndLastName(name) {
    const nameParts = name.split(/[\s-]+/);
    if (nameParts.length === 2) {
        return name;
    } else {
        return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
    }
}
