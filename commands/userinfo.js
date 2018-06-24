const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let user = message.mentions.users.first();
    if(!user) user = message.author;
    
    let info = new Discord.RichEmbed()
        .setColor("#9B59B6")
        .setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL, user.displayAvatarURL)
        .addField("ID:", user.id)
        .addField("Create At:", user.createdAt)
        .addField("Join Us At:", message.member.joinedAt)
        ;

    message.channel.send({embed: info});
}

module.exports.help = {
    name: "userinfo"
}