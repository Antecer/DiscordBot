const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    const channel = message.guild.channels.find(c => c.name === "amusingkeypad");
    if(!channel) return;
    let msgWelcome = new Discord.RichEmbed()
        .setColor(0xFF00FF)
        .setDescription(
            `Welcome to the server, ${message.member}`
            +`\r\nPlease set your _nickname_ to osu! name.`
            +`\r\nInput _!help_ to get my command list.`
        );
    let msg = await channel.send(msgWelcome);
    setTimeout(() => {
        msg.delete();
    }, 10000);

    // let msg = await message.channel.send("Query running, please wait..");
    // await message.channel.send({files: [
    //     {
    //         attachment: `./skins/default/beatmapBG.jpg`,
    //         name: "beatmapBG.jpg"
    //     }
    // ]});
    // msg.delete();
}

module.exports.help = {
    name: "test"
}