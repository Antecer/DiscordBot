const Discord = require("discord.js");
module.exports.run = async (bot, message, args) => {
    let cmdlist = [
        "!help(alias='?')  // Print this help list",
        "!ping  // Print the robot's network status",
        "!serverinfo    // Print server info",
        "!userinfo [@user]  // Print user's info"
    ];

    let cmdhelp = new Discord.RichEmbed()
        .setColor("#FFFFFF")
        .setAuthor(`${bot.user.username}#${bot.user.discriminator}`, bot.user.avatarURL, bot.user.displayAvatarURL)
        .setTitle(`Command List:`)
        // .addField("!ping", `Print the robot's network status`)
        // .addField("!serverinfo", `Print server info`)
        // .addField("!userinfo <@username>", `Print user's info`)
        .setDescription(cmdlist.join("\n"))
        ;
    
    message.channel.send({embed: cmdhelp});
}

module.exports.help = {
    name: "help",
    alias: "?"
}