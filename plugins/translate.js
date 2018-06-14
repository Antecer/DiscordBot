const Discord = require("discord.js");
const http = require('http');
const Gunzip = require('zlib');

module.exports.run = async (bot, message) => {
    let translateChannels = ["translate-to-chinese", "translate-to-english"];
    if(message.member){ // 创建翻译频道
        translateChannels.forEach(cname => {
            if(!message.guild.channels.find(c => c.name === cname)){
                message.guild.createChannel(cname, 'text')
                    .then(console.log(`[info]创建频道: ${cname}`))
                    .catch(console.error);
            }
        });
    }
    let authorname = message.member.nickname == "null" ? message.author.username : message.member.nickname;

    if(message.channel.name != "translate-to-chinese")
    {
        let info = new Discord.RichEmbed()
            .setAuthor(authorname, message.author.avatarURL)
            .setTitle("Google Translate To:zh-CN")
            .setDescription("translate...");
        let msg = await message.guild.channels.find(c => c.name === `translate-to-chinese`).send(info);
        let options = {
            hostname: 'translate.google.com',
            port: 80,
            path: encodeURI(`/translate_a/single?client=gtx&sl=auto&tl=zh-CN&dt=t&q=${message.content}`),
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
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
            info.setDescription(data);
            msg.edit(info);
        })
        .catch(error => {
            info.setDescription(`Translate Failed:\r\n${error.message}`);
            msg.edit(info);
        });
    }

    if(message.channel.name != "translate-to-english")
    {
        let info = new Discord.RichEmbed()
            .setAuthor(authorname, message.author.avatarURL)
            .setTitle("Google Translate To:en")
            .setDescription("translate...");
        let msg = await message.guild.channels.find(c => c.name === `translate-to-english`).send(info);
        let options = {
            hostname: 'translate.google.com',
            port: 80,
            path: encodeURI(`/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${message.content}`),
            method: 'GET'
        }
        new Promise(function (resolve, reject) {
            let req = http.request(options, (res) => {
                let html = "", output;
                if(res.headers['content-encoding']=='gzip'){
                    let gzip = Gunzip.createGunzip();
                    res.pipe(gzip);
                    output=gzip;
                }else{
                    output=res;
                }
                output.on('data',(data)=>{
                    data=data.toString('utf-8');
                    html+=data;
                });
                output.on('end',()=>{
                    resolve(html);
                });
                output.on('error',(error) => {
                    reject(error);
                });
                // res.on('data', chunk => {
                //     html += chunk;
                // });
                // res.on('end', () => {
                //     resolve(html);
                // });
                // res.on("error", (error) => {
                //     reject(error);
                // });
            });
            req.on('error', (error) => {
                reject(error);
            });
            req.end();
        })
        .then(html =>{
            message.channel.send(`Test:\r\n${html}`);
            let data = "";
            JSON.parse(html)[0].forEach(t => { data += t[0]; });
            info.setDescription(data);
            msg.edit(info);
        })
        .catch(error => {
            info.setDescription(`Translate Failed:\r\n${error.message}`);
            msg.edit(info);
        });
    }
};

module.exports.help = {
    name: "GoogleTranslate"
}