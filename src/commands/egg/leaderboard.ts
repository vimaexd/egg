import Discord from "discord.js"
import Command from "../../classes/Command"
import { Feedback, User } from '../../db/models';

const Cmd = new Command({
    enabled: true,
    name: "leaderboard",
    trigger: ["lb", "leaderboard"],
    description: "View the top 5 people giving feedback",
    usage: "leaderboard",
    category: "Egg"
}, async (client, message, args, config) => {
    let users = await User.findAll({
        limit: 5,
        order: [ ['lifetime', 'DESC'] ]
    })
    if(users.length == 0) message.channel.send("No one has sent feedback yet!")

    let mbed = new Discord.MessageEmbed()
        .setTitle("Leaderboard")
        .setColor(config.config.embedColors.default)
        .setDescription("Showing the lifetime top 5 users")

    try {
        for(let i = 0; i < 5; i++){
            let pog = users[i]
            if(!pog) return;
            let usr = await client.users.fetch(pog.userId)
            mbed.addField(`${i + 1} - ${usr.tag}`, `Gave ${pog.lifetime} feedbacks`)
        }
    } catch(err) {
        console.log(err)
    } finally {
        message.channel.send({embed: mbed})
    }
})

export default Cmd