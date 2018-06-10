var http = require('http');
var qs = require('querystring');

const apiKey = "66c7d763525ff6c9f8c4b2a4417c69535e92d8d2";
var JsonData;

async function get_user(userid, mode, type){
    let get_user_data = {
        k: `${apiKey}`,
        u: `${userid}`,
        m: `${mode}`,
        type: `${type}`,
        event_days: "1"
    }
    let get_user = {
        hostname: 'osu.ppy.sh',
        port: 80,
        path: '/api/get_user?' + qs.stringify(get_user_data),
        method: 'GET'
    }
    return get_user;
}

module.exports = {
    get_user
}