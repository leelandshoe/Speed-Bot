const botSettings = require("./botsettings.json");
const Discord = require("discord.js");
const fs = require("fs");

const prefix = botSettings.prefix;

const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

fs.readdir("./cmds/", (err, files) => {
	if(err) console.error(err);

	let jsfiles = files.filter(f => f.split(".").pop() === "js");
	if(jsfiles.length <= 0){
	console.log("No commands to load!");
	return;
	}

	console.log(`Loading ${jsfiles.length}commands!`);

	jsfiles.forEach((f, i) => {
       let props = require(`./cmds/${f}`);
       console.log(`${i + 1} ${f} loaded!`);
       bot.commands.set(props.help.name, props);
	});
});

bot.on("ready", async () => {
	console.log(`Bot is ready! ${bot.user.username}`);
	console.log(bot.commands);
    bot.user.setActivity("!cmds")

    try {
	     let link = await bot.generateInvite(["ADMINISTRATOR"]);
	     console.log(link);
	} catch(e) {
	     console.log(e.stack);
	}
});

bot.on("message", async message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);

    if(!command.startsWith(prefix)) return;

    let cmd = bot.commands.get(command.slice(prefix.length));
    if(cmd) cmd.run(bot, message, args);

if(command === `${prefix}mute`) {
   if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You do not have permission!");

	let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
	if(!toMute) return message.channel.send("You did not specify a user mention or ID!");

	if(toMute.id === message.author.id) return message.channel.send("You cannot mute yourself.");
	if(toMute.highestRole.position >= message.member.highestRole.position) return message.channel.send("You cannot mute this user.");

    let role = message.guild.roles.find(r => r.name === "Speed Bot Muted"); 
    if(!role) {
   try{
         role = await message.guild.createRole({
            name: "Speed Bot Muted",
            color: "#000000",
            permissions: []
         });

         message.guild.channels.forEach(async (channel,id) => {
             await channel.overwritePermissions(role, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false
             });
         });
    }catch(e) {
    console.log(e.stack);
    }
    }

    if(toMute.roles.has(role.id)) return message.channel.send("This user is already muted!");

    await toMute.addRole(role);
    message.channel.send("User is muted.")
    let kUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    message.guild.member(kUser).send("You have been muted.");
    
	return;
    }

    if(command === `${prefix}unmute`) {
   if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You do not have permission!");

	let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
	if(!toMute) return message.channel.send("You did not specify a user mention or ID!");

    let role = message.guild.roles.find(r => r.name === "Speed Bot Muted"); 
    
    if(!role || !toMute.roles.has(role.id)) return message.channel.send("This user is not muted!");

    await toMute.removeRole(role);
    message.channel.send("User is unmuted.")
    
	return;
    }

if(command === `${prefix}test`) {
    let embed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setDescription("Test complete!")
    .setColor("#329FB0")

    message.channel.send(embed);

    return;
    }

    if(command === `${prefix}cmds`) {
    message.channel.send("Here are the bots commands!");
    let embed = new Discord.RichEmbed()
    .setTitle("Commands")
    .setDescription("!userinfo, !test, !cmds, !mute, !unmute, !leelandshoe, !avatar, !ukrainiangayshit, !kick, !ban, !botinfo, !dm, !warn, !nick, !fixname, !8ball, !pp, !meme, !purge ")
    .setColor("#329FB0");
    message.channel.send(embed);

    return;
    }

     if(command === `${prefix}leelandshoe`) {
    let embed = new Discord.RichEmbed()
    .setDescription(" leelandshoe#5993 is my dad ")
    .setColor("#329FB0");
    message.channel.send(embed);

    return;
    }



});

bot.login(process.env.BOT_TOKEN);
