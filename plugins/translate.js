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
        if(message.member.nickname != null){
            info.setAuthor(message.member.nickname, message.author.avatarURL);
        }
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
    new Promise(function (resolve, reject) {
        let req = http.request(options, function(res) {
            let html = "";
            res.on('data', chunk => {
                html += chunk;
            });
            res.on('end', () => {
                resolve(html);
            });
            res.on("error", (error) => {
                reject(error);
            });
        });
        req.on('error', (error) => {
            reject(error);
        });
        req.end();
    })
    .then(html =>{
        let chinese = "";
        JSON.parse(html)[0].forEach(t => { chinese += t[0]; });
        info.setAuthor(message.member.nickname, message.author.avatarURL)
            .setTitle("Google Translate To:zh-CN")
            .setDescription(chinese);
        msg.edit(info);
    })
    .catch(error => {
        info.setDescription(`Translate Failed:\r\n${error.message}`);
        msg.edit(info);
    });
};

module.exports.help = {
    name: "GoogleTranslate"
}