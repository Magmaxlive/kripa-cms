import axios from "axios";
import { baseURL } from "./auth";

var my_profile_name;
var my_profile_id;
var google_auth_token;

var nToken;
var refreshToken;
var loginChecker = 0;

let invalidGrant = "0";

const getToken = async () => {
    if (typeof window !== 'undefined') {
        nToken = localStorage.getItem('access_token');
        refreshToken = localStorage.getItem('refresh_token');
    }
};

export { getAccessToken };
const getAccessToken = async () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
    }
};


export { FetchUser };
async function FetchUser() {
    let token = await getAccessToken();
    if (!token) { return "No access token" }
    var token__convert_url = baseURL + '/users/user';
    fetch(token__convert_url, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token },
    }).then(async data => await data.json())
        .then(
            async data => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('UserAuthID', data[0].id)
                    localStorage.setItem('UserAuthEmail', data[0].email)
                }
                setTimeout(() => {
                    window.location.href = "/"
                }, 2000);
                return false;
                //let profile = await createSuperUser(token, data[0].id)
            }
        )
        .catch(error => console.log(error));
}

async function createSuperUser(accessToken, userId) {
    let userProfileUrl = baseURL + "/users/createAppProfile";
    let form_data = new FormData();
    form_data.append("user_id", userId)
    axios.post(userProfileUrl, form_data, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer ' + accessToken
        },
    }).then(res => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('UserProfileAuthID', res.data.response.id);
        }
        setTimeout(() => {
            window.location.href = "/"
        }, 2000);
        return false;
    }).catch(err => console.log(err));
}


async function FetchAuth(username, password) {
    console.log(username , password);
    console.log("username" , "password");
    var newData = {
        grant_type: "password",
        client_id: app_id,
        client_secret: app_secret,
        username: username,
        password: password,
    };
    var token__convert_url = baseURL + '/auth/token';
    await fetch(token__convert_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
    }).then(async data => data.json())
        .then(async data => {
            console.log(data);
            if (data.error){ loginChecker = 1 }
            else { loginChecker = 0 };
            if (typeof window !== 'undefined') {
                localStorage.setItem('access_token', data.access_token)
                localStorage.setItem('refresh_token', data.refresh_token)
            }
            let user = await FetchUser();
            let currentDate = new Date()
            let currentHour = currentDate.setHours(currentDate.getHours() + 1);
            localStorage.setItem('refresh_time', currentHour);
            return data;
            // setTimeout(() => {
            //     window.location.href = "/"
            // }, 2000);
        }
        )
        .catch(error => { console.log(error); return error });
}

export default FetchAuth;
export { nToken };
export { refreshToken };
export { baseURL };
export { my_profile_name };
export { my_profile_id };
export { google_auth_token };
export { invalidGrant };
export { loginChecker};
