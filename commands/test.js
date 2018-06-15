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
        .setDescription(`This is the test content\n====================`)
        .setFooter(`This is the test result`);
    message.channel.send(info)
        .then(msg => {
            setTimeout(() => {
                info.setFooter('');
                msg.edit(info);
            }, 6000);



            setTimeout(() => {
                msg.delete();
                message.delete();
            }, 10000);
        });
}

module.exports.help = {
    name: "test"
}