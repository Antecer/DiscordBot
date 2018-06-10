const botSettings = require(`./botsettings.json`);
const Discord = require(`discord.js`);
const fs = require("fs");

const prefix = botSettings.prefix;

const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

fs.readdir("./plugins/", (err, files) => {
    if(err) console.error(err);

    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if(jsfiles.length <= 0){
        console.log("No plugins load!");
        return;
    }

    console.log(`Loading ${jsfiles.length} commands!`);

    jsfiles.forEach((f, i) => {
        let props = require(`./plugins/${f}`);
        console.log(`${i + 1}: ${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });
});

bot.on("ready", async ()=>{
    console.log(`${bot.user.username} is ready!`);
    //console.log(bot.commands);    //禁止打印命令列表到后台
    try {
        let link = await bot.generateInvite(["ADMINISTRATOR"]);
        console.log(`ClickToJoinBot: ${link}`);
    } catch (e) {
        console.log(e.stack);
    }
});

bot.on("message", async message => {
    if(message.author.bot) return;
    //if(message.channel.type === "dm") return; // 取消注释以禁止私聊命令

    let messageArray = message.content.split(" ");
    let command= messageArray[0];
    let args = messageArray.slice(1);

    if(!command.startsWith(prefix)) return;

    let cmd = bot.commands.get(command.slice(prefix.length));
    if(cmd) cmd.run(bot, message, args);
});

bot.on("guildMemberAdd", async guid => {
    let user = guid.user;
    let msgWelcome = new Discord.RichEmbed()
        .setColor("#FF00FF")
        .setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL, user.displayAvatarURL)
        .addField("Welcome!","Please set your nickname to osu! name.")
        .setDescription("Input _!help_ to get command list.");
    message.channel.send({embed: msgWelcome});
});

fs.exists("./debugdata.json", exists => {
    if(exists)
    {
        const debugdata = require(`./debugdata.json`);
        bot.login(debugdata.token);
    }
    else
    {
        bot.login(process.env.token);
    }
});