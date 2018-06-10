const Discord = module.require("discord.js");
module.exports.run = async (bot, message, args) => {
    let cmdlist = [
        "[!ping] //Print the robot's network status",
        "[!userinfo <@username>] //Print the user's info",
        "[!ico] //Print server icon"
    ]
    let cmdhelp = new Discord.RichEmbed()
        .setColor("#FFFFFF")
        .setAuthor(`${bot.user.username}#${bot.user.discriminator}`, bot.user.avatarURL, bot.user.displayAvatarURL)
        .setTitle(`Command List:`)
        .addField("!ping", `Print the robot's network status`)
        .addField("!ico", `Print server icon`)
        .addField("!userinfo <@username>", `Print the user's info`)
        ;
    
    message.channel.send({embed: cmdhelp});
}

module.exports.help = {
    name: "help"
}