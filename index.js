require("dotenv").config();
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const MEDIA_CHANNEL_ID = "1004292945282879540"; 
const CHAT_CHANNEL_ID = "1004292944938938459";  
const MEME_CHANNEL_ID = "1340192779271143424";   

const mediaUsage = new Map();
const sayCooldowns = new Map(); // ✅ Cooldown tracker for !rrgsay

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    client.user.setActivity("Genshin Impact", {
        type: ActivityType.Streaming,
        url: "https://www.twitch.tv/rajromeogaming"
    });
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const channelId = message.channel.id;
    const userId = message.author.id;
    const currentTime = Date.now();
    let userData = mediaUsage.get(userId) || { 
        attachmentCount: 0, 
        nonAttachmentCount: 0, 
        lastMessageTime: 0,
        lastAttachmentTime: 0 
    };

    const hasAttachment = message.attachments.size > 0;

    // ✅ Command: rrgsay <message> (10s cooldown)
    if (message.content.startsWith("rrgsay ")) {
        const sayMessage = message.content.slice(6).trim(); 
        const lastUsed = sayCooldowns.get(userId) || 0;
        const remainingCooldown = Math.max(0, 10000 - (currentTime - lastUsed));

        // Check cooldown
        if (remainingCooldown > 0) {
            await message.delete().catch(console.error);
            return message.channel.send({
                content: `${message.author}, please wait **${Math.ceil(remainingCooldown / 1000)} seconds** before using \`rrgsay\` again! ⏳`
            }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        // Prevent role mentions, channel mentions, and links
        if (
            sayMessage.includes("@") || 
            sayMessage.includes("<#") || 
            /https?:\/\/|discord\.gg/i.test(sayMessage)
        ) {
            await message.delete().catch(console.error);
            return message.channel.send({
                content: `${message.author}, you cannot mention roles, channels, or post links in the \`rrgsay\` command! 🚫`
            }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }

        if (sayMessage.length > 0) {
            await message.delete().catch(console.error);
            sayCooldowns.set(userId, currentTime); // ✅ Start 10s cooldown
            return message.channel.send(sayMessage);
        }
    }

    // ✅ Media Channel Logic
    if (channelId === MEDIA_CHANNEL_ID) {
        let remainingCooldown = 0;

        if (hasAttachment) {
            remainingCooldown = Math.max(0, 10000 - (currentTime - userData.lastAttachmentTime));

            if (remainingCooldown > 0) {
                await message.delete().catch(console.error);
                return message.channel.send({
                    content: `${message.author}, please wait **${Math.ceil(remainingCooldown / 1000)} seconds** before uploading another media file! ⏳`
                }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
            }
        }

        if (!hasAttachment) {
            remainingCooldown = Math.max(0, 20000 - (currentTime - userData.lastMessageTime));

            if (remainingCooldown > 0) {
                await message.delete().catch(console.error);
                return message.channel.send({
                    content: `${message.author}, please wait **${Math.ceil(remainingCooldown / 1000)} seconds** before sending another message! ⏳`
                }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
            }
        }

        if (hasAttachment) {
            userData.attachmentCount++;
            userData.nonAttachmentCount = 0; 
            userData.lastAttachmentTime = currentTime; 
        } else {
            userData.nonAttachmentCount++;
        }

        userData.lastMessageTime = currentTime;

        if (userData.nonAttachmentCount > 1 || userData.attachmentCount > 2) {
            await message.delete().catch(console.error);
            await message.channel.send({
                content: `${message.author}, this is a **media-only** channel! Please continue chatting in <#${CHAT_CHANNEL_ID}> 🚫`
            }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

            mediaUsage.set(userId, { 
                attachmentCount: 0, 
                nonAttachmentCount: 0, 
                lastMessageTime: currentTime,
                lastAttachmentTime: userData.lastAttachmentTime
            });
        } else {
            mediaUsage.set(userId, userData);
        }
    }

    if (channelId === MEME_CHANNEL_ID) {
        const isYouTubeLink = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/\S+/gi.test(message.content);

        if (!hasAttachment && !isYouTubeLink) {
            await message.delete().catch(console.error);
            return message.channel.send({
                content: `${message.author}, only **attachments** and **YouTube links** are allowed here! 🚫`
            }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
        }
    }
});

// ✅ Express Server for Web Hosting
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
