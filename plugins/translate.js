const Discord = require("discord.js");
const http = require('http');

module.exports.run = async (bot, message) => {
    let translateChannels = ["translate-to-chinese", "translate-to-english"];

    let info = new Discord.RichEmbed()
        .setAuthor(message.author.username, message.author.avatarURL)
        .setTitle("Google Translate To:zh-CN")
        .setDescription("translate...");
    let msg;
    if(message.member)
    {
        translateChannels.forEach(cname => {
            if(!message.guild.channels.find(c => c.name === cname))
            {
                message.guild.createChannel(cname, 'text')
                    .then(console.log(`[info]创建频道: ${cname}`))
                    .catch(console.error);
            }
        });
        if(message.member.nickname) info.setAuthor(message.member.nickname, message.author.avatarURL);
        msg = await message.guild.channels.find(c => c.name === `translate-to-chinese`).send(info);
    }
    else
    {
        msg = await message.channel.send(info);
    }
    
    let options = {
        hostname: 'translate.google.com',
        port: 80,
        path: encodeURI(`/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${message.content}`),
        method: 'GET'
    }

    let data = "";
    try {
        await http.request(options, function(res) {
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
                // setTimeout(() => {
                //     msg.delete();
                // }, 10000);
            });
            res.on("error", (e) => {
                info.setDescription(`Translate Failed:\r\n${e.message}`);
                msg.edit(info);
            });
        }).on('error', (e) => {
            info.setDescription(`Translate Failed:\r\n${e.message}`);
            msg.edit(info);
        }).end();
    } catch (e) {
        info.setDescription(`Translate Failed:\r\n${e.message}`);
        msg.edit(info);
    }
};

module.exports.help = {
    name: "GoogleTranslate"
}