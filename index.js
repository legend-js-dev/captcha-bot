console.clear();
console.log('[INFO]: Loading...');
//captcha bot coded by legend & ant >:D
const { Client, Collection } = require('discord.js');
const discord = require('discord.js');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
//dont touch the credits or i will find you and u will have to commit die >:D
const client = new Client({
	disableMentions: 'everyone'
});
const db = require('quick.db');
const Canvas = require('canvas');
Canvas.registerFont('fonts/Roboto.ttf', { family: 'Roboto' });
Canvas.registerFont('fonts/sans.ttf', { family: 'Sans' });

client.commands = new Collection();
client.aliases = new Collection();

['command'].forEach(handler => {
	require(`./handlers/${handler}`)(client);
});

client.captcha = function() {
	const canvas = Canvas.createCanvas(400, 180);
	const ctx = canvas.getContext('2d');
	const num = 5;
	const cords = [];
	const colors = ['blue', 'red', 'green', 'yellow', 'black', 'white'];
	let string = '';
	const particles = Math.floor(Math.random() * 101);
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const charactersLength = characters.length;
	// Random code generation
	for (var i = 0; i < 5; i++) {
		string += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	ctx.font = 'bold 100px Roboto';
	ctx.lineWidth = 7.5;
	let textPos = 45;
	// Captcha text
	for (var i = 0; i < string.length; i++) {
		const char = string.charAt(i);
		const color = colors[Math.floor(Math.random() * colors.length)];
		ctx.fillStyle = color;
		ctx.fillText(char, textPos, 120);
		textPos += 65;
	}
	// Paticles
	for (var i = 0; i < particles; i++) {
		const pos = {
			width: Math.floor(Math.random() * canvas.width),
			height: Math.floor(Math.random() * canvas.height)
		};
		const color = colors[Math.floor(Math.random() * colors.length)];
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(pos.width, pos.height, 3.5, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	}
	// Get the cords
	let x = 0;
	for (var i = 0; i < num + 1; i++) {
		const l = Math.floor(Math.random() * canvas.height);
		if (i != 0) x += canvas.width / num;
		cords.push([x, l]);
	}
	// Strokes
	for (var i = 0; i < cords.length; i++) {
		const cord = cords[i];
		const nextCord = cords[i + 1];
		const color = colors[Math.floor(Math.random() * colors.length)];
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(cord[0], cord[1]);
		if (nextCord) ctx.lineTo(nextCord[0], nextCord[1]);
		ctx.stroke();
	}
	return { buffer: canvas.toBuffer(), text: string };
};

console.log('-------------------------------------');
console.log(`
██╗     ███████╗ ██████╗ ███████╗███╗   ██╗██████╗         ██╗███████╗
██║     ██╔════╝██╔════╝ ██╔════╝████╗  ██║██╔══██╗        ██║██╔════╝
██║     █████╗  ██║  ███╗█████╗  ██╔██╗ ██║██║  ██║        ██║███████╗
██║     ██╔══╝  ██║   ██║██╔══╝  ██║╚██╗██║██║  ██║   ██   ██║╚════██║
███████╗███████╗╚██████╔╝███████╗██║ ╚████║██████╔╝██╗╚█████╔╝███████║
╚══════╝╚══════╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═════╝ ╚═╝ ╚════╝ ╚══════╝
`);
console.log('-------------------------------------');
//this took me some time so dont you dare remove credits, if u do remove credits then you will have copy right issues.
client.on('ready', () => {
	console.log(`[INFO]: Ready on client (${client.user.tag})`);
	client.user.setActivity('captcha bot by ANT and legend :D', {
		type: 'WATCHING'
	});
});

client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.guild) return;
	if (!message.content.startsWith(prefix)) return;
	if (!message.member)
		message.member = await message.guild.fetchMember(message);

	const args = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/g);
	const cmd = args.shift().toLowerCase();

	if (cmd.length === 0) return;

	let command = client.commands.get(cmd);
	if (!command) command = client.commands.get(client.aliases.get(cmd));
	if (command) command.run(client, message, args, db);
});
client.on('guildMemberAdd', async member => {
	let toggle = db.get(`autokick_${member.guild.id}`);
	if (toggle === null) toggle = false;
	let captchaLogsID = db.get(`logs_${member.guild.id}`);
	let captchaLogs = client.channels.cache.get(captchaLogsID);
	let invalid = 0;
	const captcha = client.captcha();
	console.log(captcha.text);
	const { buffer } = captcha;
	let channelID = db.get(`verifyChannel_${member.guild.id}`);
	if (channelID === null) return console.log('no fking channel bruh');
	let channel = member.guild.channels.cache.get(channelID);
	if (!channel) return console.log('no fking channel bruh');
	channel.send(`${member.user.toString()}`, {
		files: [
			{
				name: 'captcha.png',
				attachment: buffer
			}
		]
	});
	let pog = db.get(`verifyRole_${member.guild.id}`);
	let filter = m => m.author.id === member.user.id;

	let collector = new Discord.MessageCollector(channel, filter, {
		max: 11,
		time: 60000
	});
	let fuckterval = setInterval(() => {
		if (!member.guild.members.cache.get(member.user.id)) collector.stop();
	}, 3000);

	collector.on('collect', async message => {
		if (!message.content) return;
		let num = 1;
		let time = num++;
		if (message.content != captcha.text) {
			invalid++;
			if (invalid > 9 && toggle === true) {
				if (member.kickable) {
					message.channel.send(
						':x: | **Too many invalid captcha attempts, kicking user.**'
					);
					member.kick('Too many invalid captcha attempts');
					let embed = new Discord.MessageEmbed()
						.setTitle('**captcha logs**')
						.setAuthor(
							member.user.tag,
							member.user.displayAvatarURL({ dynamic: true })
						)
						.setColor('#FF0000')
						.setFooter(message.guild.name, message.guild.iconURL())
						.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
						.setDescription('Captcha failed')
						.addField('**User**', member.user.tag)
						.addField('**Status**', 'failed')
						.addField('**Reason**', 'Too many Attempts failed');
					if (captchaLogs) {
						captchaLogs.send({ embed: embed });
					}
					return;
				}
				collector.stop();
				return;
			} else if (toggle === false && invalid > 9) {
				let embed = new Discord.MessageEmbed()
					.setTitle('**captcha logs**')
					.setAuthor(
						member.user.tag,
						member.user.displayAvatarURL({ dynamic: true })
					)
					.setColor('#FF0000')
					.setFooter(message.guild.name, message.guild.iconURL())
					.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
					.setDescription('Captcha failed')
					.addField('**User**', member.user.tag)
					.addField('**Status**', 'failed')
					.addField('**Reason**', 'Too many Attempts failed');
				message.channel.send(':x: | **Too many invalid Attempts.**');
				if (captchaLogs) {
					captchaLogs.send({ embed: embed });
				}
				collector.stop()
				return;
			}
			message.channel.send(
				`:x: | **Invalid code. Try again. Attempts left: ${10 - invalid}**`
			);
		}
		if (message.content === captcha.text) {
			try {
				message.channel.send('✅ | **Verified**');
				message.member.roles.add(pog);
				let embed = new Discord.MessageEmbed()
					.setTitle('**captcha logs**')
					.setAuthor(
						member.user.tag,
						member.user.displayAvatarURL({ dynamic: true })
					)
					.setColor('GREEN')
					.setFooter(message.guild.name, message.guild.iconURL())
					.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
					.setDescription('Captcha passed')
					.addField('**User**', member.user.tag)
					.addField('**Status**', 'Passed');
				if (captchaLogs) {
					captchaLogs.send({ embed: embed });
				}
				collector.stop();
			} catch {
				collector.stop();
				message.channel.send(':x: | **an Error Occured**');
			}
		}
	});
	collector.on('end', async (collected, reason) => {
		clearInterval(fuckterval);
		if (reason === 'time' && toggle === true) {
			if (member.kickable) {
				channel.send(
					`**The user has been kicked for not responding in time.**`
				);
				member.kick('didnt reply in time');
				let embed = new Discord.MessageEmbed()
					.setTitle('**captcha logs**')
					.setAuthor(
						member.user.tag,
						member.user.displayAvatarURL({ dynamic: true })
					)
					.setColor('#FF0000')
					.setFooter(message.guild.name, message.guild.iconURL())
					.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
					.setDescription('Captcha failed')
					.addField('**User**', member.user.tag)
					.addField('**Status**', 'failed')
					.addField('**Reason**', 'Didnt reply in time.');
				if (captchaLogs) {
					captchaLogs.send({ embed: embed });
				}
				return;
			}
			return;
		} else if (toggle === false && reason === 'time') {
			let embed = new Discord.MessageEmbed()
				.setTitle('**captcha logs**')
				.setAuthor(
					member.user.tag,
					member.user.displayAvatarURL({ dynamic: true })
				)
				.setColor('#FF0000')
				.setFooter(message.guild.name, message.guild.iconURL())
				.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
				.setDescription('Captcha failed')
				.addField('**User**', member.user.tag)
				.addField('**Status**', 'failed')
				.addField('**Reason**', 'Didnt reply in time.');
			message.channel.send(':x: | **You Didnt reply in time**');
			if (captchaLogs) {
				captchaLogs.send({ embed: embed });
			}
		}
	});
	//prettify your phucking code it looks so dam ugly ew :vomiting:
	//prettify'd bababoey
});

client.login(token).catch(err => {
	console.log('[ERROR]: Invalid Token Provided');
});
