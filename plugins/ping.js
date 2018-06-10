const Discord = require("discord.js");
module.exports.run = async (bot, message, args) => {
    let ping = Math.round(bot.ping);
    let color = "#FFFFFF";
    if(ping < 100) color = "#00FF00";
    else if(100 <= ping && ping <500) color = "#FF8000";
    else if(500 <= ping && ping <2000) color = "#FF0000";
    else color = "#000000"
    let embed = new Discord.RichEmbed();
    embed.setDescription(
        `${message.author.toString()}\r\n` +
        `**Bot Latency**: _${ping}ms_\r\n`+
        `**Response**:    _..._`)
        .setColor(color);
    let msg = await message.channel.send({embed: embed});

    let response = msg.createdTimestamp - message.createdTimestamp;
    if(response < 100) color = "#00FF00";
    else if(100 <= response && response <500) color = "#FF8000";
    else if(500 <= response && response <2000) color = "#FF0000";
    else color = "#000000"
    embed.setDescription(
        `${message.author.toString()}\r\n` +
        `**Bot Latency**: _${ping}ms_\r\n`+
        `**Response**:    _${response}ms_`)
        .setColor(color);
    msg.edit(embed);
}

module.exports.help = {
    name: "ping"
}