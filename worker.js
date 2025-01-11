const { Client, GatewayIntentBits } = require('discord.js');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg-static');
const { env } = require('process');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    // Don't let the bot respond to itself
    if (message.author.bot) return;

    const args = message.content.trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    // Play command
    if (command === '!play') {
        if (!message.member.voice.channel) {
            return message.reply('You need to join a voice channel first!');
        }

        const connection = await message.member.voice.channel.join();
        const url = args[0];

        if (!ytdl.validateURL(url)) {
            return message.reply('Please provide a valid YouTube URL!');
        }

        const stream = ytdl(url, { filter: 'audioonly' });

        connection.play(stream, { type: 'opus' })
            .on('start', () => {
                message.channel.send('Now playing: ' + ytdl.getBasicInfo(url).then(info => info.videoDetails.title));
            })
            .on('error', (err) => {
                console.error(err);
                message.channel.send('There was an error while trying to play the audio.');
            });

    }

    // Stop command
    if (command === '!stop') {
        if (!message.member.voice.channel) {
            return message.reply('I am not connected to a voice channel.');
        }

        message.member.voice.channel.leave();
        message.reply('Disconnected from the voice channel.');
    }

    // Pause command
    if (command === '!pause') {
        const connection = message.guild.voiceConnection;
        if (connection && connection.dispatcher) {
            connection.dispatcher.pause();
            message.reply('Paused the song.');
        } else {
            message.reply('Nothing is playing right now.');
        }
    }

    // Resume command
    if (command === '!resume') {
        const connection = message.guild.voiceConnection;
        if (connection && connection.dispatcher) {
            connection.dispatcher.resume();
            message.reply('Resumed the song.');
        } else {
            message.reply('No song is paused.');
        }
    }
});

client.login(env.BOT_TOKEN);
