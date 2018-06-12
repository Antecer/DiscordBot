const Discord = require("discord.js");
const http = require('http');
const qs = require('querystring');

const apiKey = "66c7d763525ff6c9f8c4b2a4417c69535e92d8d2";

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
    switch(mode)
    {
        default:
        case "0": mode = "osu!standard"; break;
        case "1": mode = "osu!taiko"; break;
        case "2": mode = "osu!catch"; break;
        case "3": mode = "osu!mania"; break;
    }

    let data = '';
    return new Promise(function (resolve, reject) {
        let req = http.request(get_user, function(res) {
            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                if(data.startsWith("[]"))
                {
                    let info = new Discord.RichEmbed()
                        .setColor(0xFF0000)
                        .setTitle(`[Error]Username <${userid}> does not exist!`);
                    resolve(info);
                }
                else
                {
                    let StdInfo = JSON.parse(data);
                    let osu_name = StdInfo[0]["username"];
                    let osu_avatar = `http://a.ppy.sh/${StdInfo[0]["user_id"]}?.jpg`;
                    let osu_userpage = `http://osu.ppy.sh/users/${StdInfo[0]["user_id"]}`;
                    let osu_rank = StdInfo[0]["pp_rank"];
                    let osu_acc = StdInfo[0]["accuracy"];
                    if(osu_acc != null) osu_acc = osu_acc.replace(/(\d+\.\d{1,2}).*/,"$1%");
                    let osu_level = StdInfo[0]["level"];
                    if(osu_level != null) osu_level = osu_level.replace(/(\d+)\.(\d{2})(\d{0,2}).*/,"$1($2.$3%)").replace(/\(0(\d\.)/,"($1");
                    let osu_pp = StdInfo[0]["pp_raw"];
                    let info = new Discord.RichEmbed()
                        .setColor(0x0080FF)
                        .setAuthor(osu_name, osu_avatar, osu_userpage)
                        .setTitle(`${mode}`)
                        .setDescription(
                            `**Rank**: #${osu_rank}\r\n`+
                            `**Accuracy**: ${osu_acc}\r\n`+
                            `**Level**: ${osu_level}\r\n`+
                            `**PP_RAW**: ${osu_pp}`)
                        ;
                    resolve(info);
                }
            });
            res.on("error", (e) => {
                let info = new Discord.RichEmbed()
                    .setColor(0xFF0000)
                    .setTitle(`[Error] ${e.message}`);
                resolve(info);
            });
        });
        req.on('error', (e) => {
            let info = new Discord.RichEmbed()
                .setColor(0xFF0000)
                .setTitle(`[Error] ${e.message}`);
            resolve(info);
        });
        req.end();
    });
}

module.exports = {
    get_user
}