import Discord from "discord.js"
import Command from "../../classes/Command"
import { Feedback, User } from '../../db/models';

const Cmd = new Command({
    enabled: true,
    name: "recent",
    trigger: ["r", "recent"],
    description: "Find recent submissions",
    usage: "recent",
    category: "Egg"
}, async (client, message, args, config) => {
    let isRecent;
    let recents = await Feedback.findAll({
        limit: 5,
        where: {
            given: false,
            guildId: message.guild.id
        },
        order: [
            ['updatedAt', 'DESC'],
        ],
    })

    if(recents.length == 0 || args[0] == "all") {
        isRecent = true;
        recents = await Feedback.findAll({ limit: 5, order: [['updatedAt', 'DESC']], where: { guildId: message.guild.id } })
    } else {
        isRecent = false;
    }

    let recentText = "Showing recent submissions";
    isRecent ? recentText = "Showing recent submissions" : recentText = "Showing recent submissions with no feedback";

    let mbed = new Discord.MessageEmbed()
        .setTitle(`Latest submissions in ${message.guild.name}`)
        .setColor(config.config.embedColors.default)
        .setDescription(recentText)

    try {
        for(let i = 0; i < 5; i++){
            let pog = recents[i]
            if(!pog) return;
    
            let ch = message.channel
            let msg = await ch.messages.fetch(pog.messageId)
            let url = `https://discord.com/channels/${message.guild.id}/${ch.id}/${pog.messageId}`
            mbed.addField(`Submission from ${msg.author.tag}`, `[Click here to view](${url}) | ID: ${pog.messageId}`)
        }
    } finally {
        message.channel.send({embed: mbed})
    }
})

export default Cmd