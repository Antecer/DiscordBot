const Discord = require("discord.js");
const https = require('https');

const osumods = {
    "0": "osu!standard",
    "1": "osu!taiko",
    "2": "osu!catch",
    "3": "osu!mania"
};

async function get_user(apikey, userid, mode, type){
    return new Promise(function (resolve, reject) {
        let url = `https://osu.ppy.sh/api/get_user?&k=${apikey}&u=${userid}&m=${mode}&type=${type}&event_days=${"1"}`;
        https.get(url, res => {
            let data = '';
            res.on("data", chunk => {
                data += chunk;
            });
            res.on("end", () => {
                if (data === "[]") { reject(`Error: Username \`${userid}\` does not exist!`) }
                else { resolve(data); }
            });
            res.on("error", err => {
                reject(err);
            });
        }).on('error', function (err) {
            reject(err);
        });
    }).then(result => {
        let osuinfo = JSON.parse(result);
        let osu_name = osuinfo[0]["username"];
        let osu_avatar = `http://a.ppy.sh/${osuinfo[0]["user_id"]}?.jpg`;
        let osu_userpage = `http://osu.ppy.sh/users/${osuinfo[0]["user_id"]}`;
        let osu_rank = osuinfo[0]["pp_rank"];
        let osu_acc = osuinfo[0]["accuracy"];
        if(osu_acc != null) osu_acc = osu_acc.replace(/(\d+\.\d{1,2}).*/,"$1%");
        let osu_level = osuinfo[0]["level"];
        if(osu_level != null) osu_level = osu_level.replace(/(\d+)\.(\d{2})(\d{0,2}).*/,"$1($2.$3%)").replace(/\(0(\d\.)/,"($1");
        let osu_pp = osuinfo[0]["pp_raw"];
        let info = new Discord.RichEmbed()
            .setColor(0x0080FF)
            .setAuthor(osu_name, osu_avatar, osu_userpage)
            .setTitle(osumods[mode])
            .setDescription(
                `**Rank**: #${osu_rank}\r\n`+
                `**Accuracy**: ${osu_acc}\r\n`+
                `**Level**: ${osu_level}\r\n`+
                `**PP_RAW**: ${osu_pp}`)
            ;
        return info;
    }).catch(err => {
        let info = new Discord.RichEmbed()
            .setColor(0xFF0000)
            .setTitle(err);
        return info;
    });
}

module.exports = {
    get_user
}