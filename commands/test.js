const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    // 禁止非测试服务器响应此命令
    if(bot.configs.get('route') != 'Test Server') return;
    // 获取消息发送人的用户名或昵称
    let authorname = message.member.nickname ? message.member.nickname : message.author.username;
    // 生成消息内容
    let info = new Discord.RichEmbed()
        .setAuthor(authorname, message.author.avatarURL)
        .setTitle(`This is a test!`)
        .setDescription('```MarkDown\n#test markdown\n```');
    message.channel.send(info)
        .then(msg => {
            // setTimeout(() => {
            //     info.setFooter('');
            //     msg.edit(info);
            // }, 6000);



            let time = 10;
            let timer = setInterval(() => {
                if(--time > 0)
                {
                    info.setFooter(time);
                    msg.edit(info);
                }else{
                    msg.delete();
                    //message.delete(); //慎用，若消息作者在Bot前面删除本条消息将导致Bot崩溃
                    clearInterval(timer);
                }

            }, 1000);
        });
}

module.exports.help = {
    name: "test"
}