const Discord = require("discord.js");
module.exports.run = async (bot, message, args) => {
    let cmdlist = [
        `!help(alias='?')   // Print this help list`,
        `!ping  // Print the robot's network status`,
        `!serverinfo    // Print server info`,
        `!userinfo [@user]  // Print user's info`,
        `!stat__s__tandard <"name" | id>  // Statistics osu!standard data`,
        `!stat__t__aiko <"name" | id>  // Statistics osu!taiko data`,
        `!stat__c__atch <"name" | id>  // Statistics osu!catch data`,
        `!stat__m__ania <"name" | id>  // Statistics osu!mania data`
    ];

    let cmdhelp = new Discord.RichEmbed()
        .setColor("#FFFFFF")
        .setAuthor(`${bot.user.username}#${bot.user.discriminator}`, bot.user.avatarURL, bot.user.displayAvatarURL)
        .setTitle(`Command List:`)
        .setDescription(cmdlist.join("\n"))
        ;
    
    message.channel.send({embed: cmdhelp});
}

module.exports.help = {
    name: "help",
    alias: [
        "?"
    ]
}