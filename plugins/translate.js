const Discord = require("discord.js");
const http = require('http');

module.exports.run = async (bot, message) => {
    //"http://translate.google.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=test"
    let info = new Discord.RichEmbed()
        .setAuthor(message.member.nickname, message.author.avatarURL)
        .setTitle("Google Translate To:zh-CN")
        .setDescription("translate...");
    let msg = await message.channel.send(info);

    let options = {
        hostname: 'translate.google.com',
        port: 80,
        path: '/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=' + message.content,
        method: 'GET'
    }

    let data = "";
    http.request(options, function(res) {
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on('end', function() {
            let Tresult = JSON.parse(data);
            let chinese = "";
            Tresult[0].forEach(e => {
                chinese += e[0];
            });
            info.setAuthor(message.member.nickname, message.author.avatarURL)
                .setTitle("Google Translate To:zh-CN")
                .setDescription(chinese);
            msg.edit(info);
            setTimeout(() => {
                msg.delete();
            }, 5000)
        });
        res.on("error", (e) => {
            info.setDescription(`Translate Failed:\r\n${e.message}`);
            msg.edit(info);
            setTimeout(() => {
                msg.delete();
            }, 5000)
            console.error(e.message);
        });
    }).on('error', (e) => {
        info.setDescription(`Translate Failed:\r\n${e.message}`);
        msg.edit(info);
        setTimeout(() => {
            msg.delete();
        }, 5000)
        console.error(e.message);
    }).end();
};


module.exports.help = {
    name: "GoogleTranslate"
}