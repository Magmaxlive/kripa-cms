import RefreshAuthToken from './refresh_auth';

// export const baseURL = "https://server-v2.gravit-ex.com"
const ApiUrl = process.env.NEXT_PUBLIC_API_URL
export const baseAppURL = "http://localhost:3000";
export const baseURL = `${ApiUrl}/api/admin`;

export const app_id = 'YTkldctcTPoOUEVRYSLmYnwfpg3pRhQG21qBceGM';
export const app_secret = 'KPPJKcxWNebxl7haTl7Po9zMf7RGupoVwMxUUYBKSAbM71fEhjqTNIJTPOW7Aqt8bMO1Qd4SROuJPatQqsyhdrjQnssKvjluwjytwHFSbz1BM1qanlY7zRG7LG9U6ofR';

// export const app_id = 'MgeBsVxFcI2vc5qulydqE7UGjoYcaD5I5ezyhNFZ';
// export const app_secret = 'SfsdiO4ixlZ9ti0V8pcvjGAGLQgoMAQkeatpBT50oPXpgeVWEJM9VNgzw4O0FRy5SfRI1sfrZUySdDBRNdzcABxONogwkkyuVPYWM6EHzb7olYz3iKuTQA7foHfLSk8d';



export const authToken = GetToken();
export const authUserId = GetUserId();
export const authUserProfileId = GetUserProfileId();
export const authUserEmail = GetUserEmail();
export const hyperLink = "http://"


// export { UserLogout };
export { isUserLogged };

const getAccessToken = async () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
    }
};

export { CheckRefreshToken }
// CheckRefreshToken();
async function CheckRefreshToken() {
    let token = await getAccessToken();
    if (!token) { return "No access token" }
    else {
        var token__convert_url = baseURL + '/users/UserProfileListView';
        fetch(token__convert_url, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        }).then(async data => await data.json())
            .then(
                async data => {
                    let detail = 'Authentication credentials were not provided.';
                    if (data.detail === detail) {
                        RefreshAuthToken();
                    }
                    return true;
                }
            )
            .catch(error => {
                RefreshAuthToken()
            });
    }
}


function GetToken() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
    }
}
function GetUserId() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('UserAuthID');
    }
}
function GetUserProfileId() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('UserProfileAuthID');
    }
}
function GetUserEmail() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('UserAuthEmail');
    }
}
// function UserLogout() {
//     if (typeof window !== 'undefined') {
//         localStorage.clear();
//         window.location.href = "/login";
//     }
// }

function isUserLogged() {
    if (authToken === null) {
        //window.location.href = "/login";
    }
}