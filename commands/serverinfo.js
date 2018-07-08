const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let msg = await message.channel.send("Query running, please wait..");
    let username = message.member.nickname ? message.member.nickname : message.author.username;

    let serverinfo = new Discord.RichEmbed()
        .setColor("#A0A0A0")
        .setAuthor(message.guild.name, message.guild.iconURL, message.guild.iconURL)
        .addField("Server Created On:", message.guild.createdAt)
        .addField(`${username} Joined At:`, message.member.joinedAt)
        .addField("Total Members:", message.guild.memberCount)
        ;
    await message.channel.send(serverinfo);

    msg.delete();
}

module.exports.help = {
    name: "serverinfo"
}