const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
	console.log('OsuInfoBot is ready!');
});

client.on('message', message => {
	if(message.content === '!ping'){
		message.reply('pong');
	}
});

client.login(process.env.BOT_TOKEN);