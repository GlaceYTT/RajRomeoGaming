require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder , ActivityType } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


const ALLOWED_CHANNEL_ID = "1340192779271143424";


const userCooldowns = new Map();

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
        client.user.setActivity("Genshin Impact", {
            type: ActivityType.Streaming,
            url: "https://www.twitch.tv/rajromeogaming" 
        });

});

client.on("messageCreate", async (message) => {
   
    if (message.author.bot) return;

   
    if (message.channel.id !== ALLOWED_CHANNEL_ID) return;

    
    const hasAttachment = message.attachments.size > 0;
    const isYouTubeLink = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/\S+/gi.test(message.content);


    if (hasAttachment || isYouTubeLink) return;

  
    await message.delete().catch(console.error);

   
    const lastWarnTime = userCooldowns.get(message.author.id);
    const currentTime = Date.now();

    if (lastWarnTime && currentTime - lastWarnTime < 10000) return;

   
    userCooldowns.set(message.author.id, currentTime);

   
    const warning = await message.channel.send({
        content: `${message.author}, only **attachments** and **YouTube links** are allowed here! 🚫`,
    });

    setTimeout(() => warning.delete().catch(() => {}), 5000);
});


const express = require("express");
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});
app.listen(port, () => {
    console.log(`🔗 Listening to GlaceYT : http://localhost:${port}`);
});
client.login(process.env.TOKEN);
