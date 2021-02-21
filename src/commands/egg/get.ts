import Discord from "discord.js"
import Command from "../../classes/Command"
import { User, Feedback } from '../../db/models';

const Cmd = new Command({
    enabled: true,
    name: "submit",
    trigger: ["g", "getfeedback", "get", "submit"],
    description: "Get feedback from people and submit links.",
    usage: "points",
    category: "Egg"
}, async (client, message, args, config) => {
    if(!args[0]) return message.channel.send("Please provide a link to get feedback on! &getfeedback [url]")
    
    let egg = await User.findOne({ where: { userId: message.author.id } })
    if(!egg) egg = await User.create({ userId: message.author.id, points: 0, lifetime: 0 })

    // License check
    if(!message.member.roles.cache.has('672831766733783055') && egg.points - 1 < 0){
        message.delete();
        return message.reply("*You got a loicense for that you egg?!* <:moai_law:695179043867197490>")
    }

    Feedback.create({ messageId: message.id, given: false })
    if(!message.member.roles.cache.has('672831766733783055')) egg.points--;
    await egg.save()

    message.channel.send(`Your post has been added to the feedback list! ID: \`${message.id}\` `)
})


export default Cmd