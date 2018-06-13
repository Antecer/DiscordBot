const Discord = require("discord.js");
module.exports.run = async (bot, message, args) => {
    let route = "Test Server";
    if(process.env.ROUTE) route = process.env.ROUTE;

    let ping = Math.round(bot.ping);
    let color = "#FFFFFF";
    if(ping < 100) color = "#00FF00";
    else if(100 <= ping && ping <500) color = "#FF8000";
    else if(500 <= ping && ping <2000) color = "#FF0000";
    else color = "#000000"
    let info = new Discord.RichEmbed();
    info.setDescription(
        `${message.member}\r\n` +
        `**Route From**: _${route}_\r\n` +
        `**Bot Latency**: _${ping}ms_\r\n`+
        `**Response**:    _..._`)
        .setColor(color);
    let msg = await message.channel.send(info);

    let response = msg.createdTimestamp - message.createdTimestamp;
    if(response < 100) color = "#00FF00";
    else if(100 <= response && response <500) color = "#FF8000";
    else if(500 <= response && response <2000) color = "#FF0000";
    else color = "#000000"
    info.setDescription(
        `${message.member}\r\n` +
        `**Route From**: _${route}_\r\n` +
        `**Bot Latency**: _${ping}ms_\r\n`+
        `**Response**:    _${response}ms_`)
        .setColor(color);
    msg.edit(info);
}

module.exports.help = {
    name: "ping"
}