import React from "react";
import { app_id, app_secret, baseURL } from "./auth";
import axios from "axios";

export { getAccessToken };
const getAccessToken = async () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
    }
};

FetchAuthUser();
export { FetchAuthUser };
async function FetchAuthUser() {
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
        return false;
    }).catch(err => console.log(err));
}


async function RefreshAuthToken() {
    let refreshToken;
    if (typeof window !== 'undefined') {
        refreshToken =  localStorage.getItem('refresh_token');
    }
    var refreshData = JSON.stringify({
        grant_type: "refresh_token",
        client_id: app_id,
        client_secret: app_secret,
        refresh_token: refreshToken,
    });
    var refresh_url = baseURL + '/auth/token';
    fetch(refresh_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: refreshData
    }).then(async data => data.json())
        .then(async data => {
                localStorage.clear();
                if (typeof window !== 'undefined') {
                    localStorage.setItem('access_token', data.access_token)
                    // localStorage.setItem('AuthAccessToken', data.access_token)
                    // localStorage.setItem('AuthRefreshToken', data.refresh_token)
                    localStorage.setItem('refresh_token', data.refresh_token)
                }
                let user = await FetchAuthUser();
                let currentDate = new Date()
                let currentHour = currentDate.setHours(currentDate.getHours() + 1);
                localStorage.setItem('refresh_time', currentHour)
                return false;
            }
        )
        .catch(error => console.log(error));
}
export default RefreshAuthToken;