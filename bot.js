const botSettings = require(`./botsettings.json`);
const Discord = require(`discord.js`);
const fs = require("fs");

const prefix = botSettings.prefix;

const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
    if(err) console.error(err);

    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if(jsfiles.length <= 0){
        console.log("No command load!");
        return;
    }

    console.log(`Loading ${jsfiles.length} commands!`);

    jsfiles.forEach((f, i) => {
        let props = require(`./commands/${f}`);
        console.log(`${i + 1}: ${f} loaded!`);
        let command = props.help.name;
        if(command) bot.commands.set(command, props);
        let alias = props.help.alias;
        if(alias instanceof Array){
            alias.forEach(function(x){
                bot.commands.set(x, props);
            });
        } 
    });
});

bot.on("ready", async ()=>{
    console.log(`${bot.user.username} is ready!`);  // 打印机器人就绪信息
    console.log(bot.commands);                      // 打印命令列表到日志
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

bot.on("guildMemberAdd", async GuildMember => {
    let user = GuildMember.user;
    let msgWelcome = new Discord.RichEmbed()
        .setColor(0xFF00FF)
        .setAuthor(`${user.username}#${user.discriminator}`, user.avatarURL, user.displayAvatarURL)
        .addField("Welcome!","Please set your nickname to osu! name.")
        .setDescription("Input _!help_ to get command list.");
    GuildMember.guild.defaultChannel.send(msgWelcome);
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