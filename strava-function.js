// Get the arguments from the request config
const stravaUsername = args[0]; // e.g. 'stravaUsername'
const ethereumAddress = args[1]; // e.g. '0x1234567890123456789012345678901234567890'
// The string that must be included in the latest activities of the user for the verification to pass
const requiredStringIncluded = Verifying my Strava account for ${ethereumAddress};
// How many activities to check (min 1, max 200)
const MAX_RESULTS = 10;

// Initialize the result to -1 (error)
let result = -1;

// Get the client ID and secret from the environment variables
if (!secrets.clientId || !secrets.clientSecret) {
throw Error(
'STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET environment variables not set for Strava API. Get one: https://developers.strava.com/docs/getting-started/#account',
);
}

// Don't even try if the username or address is empty
if (!stravaUsername || !ethereumAddress) {
throw Error('Strava username or Ethereum address is empty');
}

// Prepare the API requests
const stravaRequest = {
// Get the athlete ID from the provided username
athleteIdByUsername: () =>
Functions.makeHttpRequest({
url: https://www.strava.com/api/v3/athletes/${stravaUsername},
headers: { Authorization: Bearer ${secrets.clientId}:${secrets.clientSecret} },
}),
// Get the latest n activities from the athlete (n = MAX_RESULTS)
latestActivitiesByAthleteId: (athleteId) =>
Functions.makeHttpRequest({
url: https://www.strava.com/api/v3/athlete/activities?per_page=${MAX_RESULTS}&athlete_id=${athleteId},
headers: { Authorization: Bearer ${secrets.clientId}:${secrets.clientSecret} },
}),
};

// First, request the athlete id from their username
const idRes = await new Promise((resolve, reject) => {
stravaRequest.athleteIdByUsername().then((res) => {
if (!res.error) {
resolve(res);
} else {
reject(res);
}
});
});

if (idRes.error) {
throw Error('Strava API request failed - could not get athlete id');
}

// Grab the athlete id
const athleteId = idRes.data.id || null;

// Let's be extra careful and make sure the athlete id is not null
if (!athleteId) {
throw Error('Strava API request failed - athlete id is null');
}

// Then, request the latest activities
const activitiesRes = await new Promise((resolve, reject) => {
stravaRequest.latestActivitiesByAthleteId(athleteId).then((res) => {
if (!res.error) {
resolve(res);
} else {
reject(res);
}
});
});

if (activitiesRes.error) {
throw Error('Strava API request failed - could not get activities');
}

// It'll only get here if the request was successful
const activities = activitiesRes.data;
const activityDescriptions = activities.map((activity) => activity.name);
// Check if any of these activities include the required string
const res = activityDescriptions.some((text) =>
text.toLowerCase().includes(requiredStringIncluded.toLowerCase()),
);
// If it found the string, return 1, otherwise 0
result = res ? 1
