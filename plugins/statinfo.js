const Discord = require("discord.js");
var http = require('http');
const OsuAPI = require("../osuapi/queryinfo.js");

module.exports.run = async (bot, message, args) => {
    var msg = await message.channel.send("Query running, please wait..");
    let senddata = await OsuAPI.get_user(args.join(" ").replace('"'), "0", "string");
    http.get(senddata, function(res){
        var json = '';
        res.on('data', function(d){
            json += d;
        });
        res.on('end', function(){
            let StdInfo = JSON.parse(json);
            let osu_name = StdInfo[0]["username"];
            let osu_avatar = `http://a.ppy.sh/${StdInfo[0]["user_id"]}?.jpg`;
            let osu_userpage = `http://osu.ppy.sh/users/${StdInfo[0]["user_id"]}`;
            let osu_rank = StdInfo[0]["pp_rank"];
            let osu_acc = StdInfo[0]["accuracy"].replace(/(\d+\.\d{1,2}).*/,"$1%");
            let osu_level = StdInfo[0]["level"].replace('.','(').replace(/(\d{2})$/,".$1%)");
            let statInfo = new Discord.RichEmbed()
                .setColor("#0080FF")
                .setAuthor(osu_name, osu_avatar, osu_userpage)
                .setTitle(`osu!standard`)
                .setDescription(`**Rank**: #${osu_rank}\r\n**Accuracy**: ${osu_acc}\r\n**Level**: ${osu_level}`)
                ;
            message.channel.send({embed: statInfo});
            msg.delete();
        });
    }).on('error', function(e){
        console.error(e);
    });
}

module.exports.help = {
    name: "stat",
    alias: "s"
}