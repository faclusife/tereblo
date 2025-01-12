const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const play = require('play-dl');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Load cookies for play-dl
play.setToken({
    youtube: {
        cookie: 'YOUR_YOUTUBE_COOKIES_HERE', // Replace this with your cookie string or load it dynamically from a file.
    },
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {

    if (message.content === ('А коля чмо?')) return message.reply('Ще й яке!');

    if (!message.content.startsWith('!play') || message.author.bot) return;

    const args = message.content.split(' ');
    if (args.length < 2) {
        return message.reply('Please provide a YouTube link or a search term!');
    }

    const query = args.slice(1).join(' ');
    const voiceChannel = message.member?.voice.channel;

    if (!voiceChannel) {
        return message.reply('You need to join a voice channel first!');
    }

    try {
        // Search for YouTube video or get stream
        const stream = await play.stream(query);
        const resource = createAudioResource(stream.stream, { inputType: stream.type });

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);

        message.reply(`Now playing: ${query}`);
        player.on('error', (error) => console.error(`Audio player error: ${error}`));
    } catch (error) {
        console.error(error);
        message.reply('Failed to play the requested audio. Ensure the video is not restricted.');
    }
});

client.login(process.env.BOT_TOKEN);

module.exports = (req, res) => {
    res.send('Hello, Vercel!');
};