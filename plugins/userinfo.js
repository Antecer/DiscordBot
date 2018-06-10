const Discord = module.require("discord.js");
const fs = require("fs");

module.exports.run = async (bot, message, args) => {
    let user = message.mentions.users.first();
    if(!user) user = message.author;
    
    let embed = new Discord.RichEmbed()
        .setColor("#9B59B6")
        .setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL, user.displayAvatarURL)
        .addField("ID", user.id)
        .addField("Create At",user.createdAt);

    message.channel.send({embed: embed});
}

module.exports.help = {
    name: "userinfo"
}