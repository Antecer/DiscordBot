//const Discord = module.require("discord.js");
module.exports.run = async (bot, message, args) => {
    let msg = await message.channel.send("Query running, please wait..");

    if(!message.guild.iconURL) return msg.edit("This server does not have an icon!")
    await message.channel.send({files: [
        {
            attachment: message.guild.iconURL,
            name: "icon.png"
        }
    ]});

    msg.delete();
}

module.exports.help = {
    name: "icon"
}