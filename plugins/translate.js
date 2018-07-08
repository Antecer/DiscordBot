const Discord = require("discord.js");
const http = require('http');
const langs = require(`./translate/languagesupport.json`);
const tprefix = "tl-";

module.exports.run = async (bot, message) => {
    // 排除特定消息文本
    if(message.content.startsWith(bot.configs.get("prefix"))) return;
    // 获取消息发送人的用户名或昵称
    let authorname = message.member.nickname ? message.member.nickname : message.author.username;
    // 缓存频道集合
    let allc = message.guild.channels;
    // 遍历所有频道
    for(let msgc of allc.values()){
        // 排除不符合要求的频道
        if(!msgc.name.startsWith(tprefix)) continue;
        // 排除当前频道
        if(msgc.name === message.channel.name) continue;
        // 查找频道对应的语言
        let msgclang = msgc.name.slice(tprefix.length);
        for(let lang in langs)
        {
            if(lang.toLowerCase() === msgclang)
            {
                let tlang = langs[lang];
                let info = new Discord.RichEmbed()
                    .setAuthor(authorname, message.author.avatarURL)
                    .setTitle(`Google Translate To:${tlang}`)
                    .setDescription(message.content)
                    .setFooter(`translate...`);
                msgc.send(info)
                    .then(msg => {
                        let options = {
                            hostname: 'translate.google.com',
                            port: 80,
                            path: encodeURI(`/translate_a/single?client=gtx&sl=auto&tl=${tlang}&ie=UTF-8&oe=UTF-8&dt=t&q=${message.content}`),
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
                            let data = "";
                            JSON.parse(html)[0].forEach(t => { data += t[0]; });
                            data = data.replace(/！/g, "!");
                            info.setDescription(
                                `*${message.content}*`+
                                `\n====================\n`+
                                `${data}`)
                                .setFooter(`From: #${message.channel.name}`);
                            msg.edit(info);
                        })
                        .catch(error => {
                            info.setFooter(`Translate Failed:${error}`);
                            msg.edit(info);
                        });
                    })
                    .catch(err => {
                        info.setFooter(`Translate Failed:${error}`);
                        msg.edit(info);
                        console.error(`[TranslateError]${err.message}`);
                    });
            }
        }
    };

    // let translateChannels = ["tl-chinese", "tl-english"];
    // if(message.member){ // 创建翻译频道
    //     translateChannels.forEach(cname => {
    //         if(!message.guild.channels.find(c => c.name === cname)){
    //             message.guild.createChannel(cname, 'text')
    //                 .then(console.log(`[info]创建频道: ${cname}`))
    //                 .catch(console.error);
    //         }
    //     });
    // }
};

module.exports.help = {
    name: "GoogleTranslate"
}