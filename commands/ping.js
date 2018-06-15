const Discord = require("discord.js");
module.exports.run = async (bot, message, args) => {
    let route = bot.configs.get("route");
    let ping = Math.round(bot.ping);
    let color = 0x000000;
    if(ping < 2000) color = 0xFF0000;
    if(ping < 500) color = 0xFF8000;
    if(ping < 100) color = 0x00FF00;
    let info = new Discord.RichEmbed()
        .setDescription(
        `${message.member}\r\n` +
        `**Route From**: _${route}_\r\n` +
        `**Bot Latency**: _${ping}ms_\r\n`+
        `**Response**:    _..._`)
        .setColor(color);
    let msg = await message.channel.send(info);

    let response = msg.createdTimestamp - message.createdTimestamp;
    if(response > 100) color = 0xFF8000;
    if(response > 500) color = 0xFF0000;
    if(response > 2000) color = 0x000000;
    info.setDescription(
        `${message.member}\r\n` +
        `**Route From**: _${route}_\r\n` +
        `**Bot Latency**: _${ping}ms_\r\n`+
        `**Response**:    _${response}ms_`)
        .setColor(color);
    msg.edit(info)
        .then(msg => {
            setTimeout(() => {
                msg.delete();
            }, 5000);
        });
}

module.exports.help = {
    name: "ping"
}