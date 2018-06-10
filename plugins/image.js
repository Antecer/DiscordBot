module.exports.run = async (bot, message, args) => {
    let msg = await message.channel.send("Query running, please wait..");

    await message.channel.send({files: [
        {
            attachment: `./skins/default/beatmapBG.jpg`,
            name: "beatmapBG.jpg"
        }
    ]});

    msg.delete();
}

module.exports.help = {
    name: "image",
    alias: "test"
}