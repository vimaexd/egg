import Discord from "discord.js"
import Command from "../../classes/Command"
import { User, Feedback } from '../../db/models';
import getUser from "../../utils/eggRetrievalService";

const Cmd = new Command({
    enabled: true,
    name: "submit",
    trigger: ["g", "getfeedback", "get", "submit"],
    description: "Get feedback from people and submit links.",
    usage: "points",
    category: "Egg"
}, async (client, message, args, config) => {
    if(!args[0]) return message.channel.send("Please provide a link to get feedback on! &getfeedback [url]")
    
    let egg = await getUser(message.author.id, message.guild.id)

    // License check
    if(!message.member.roles.cache.has('672831766733783055') && egg.points - 1 < 0){
        message.delete();
        return message.reply("*You got a loicense for that you egg?!* <:moai_law:695179043867197490>")
    }

    // Url validation (regex yoinked straight outta stackoverflow)
    let urlRE = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?")
    if(!urlRE.test(args.join(" "))) return message.channel.send("Submit a link, you egg <:moai_law:695179043867197490> Ideally use unlisted Soundcloud, Imgur, & YouTube links for music, drawings, and videos respectively.")

    Feedback.create({ messageId: message.id, given: false, guildId: message.guild.id })
    if(!message.member.roles.cache.has('672831766733783055')) egg.points--;
    await egg.save()

    message.channel.send(`Your post has been added to the feedback list! ID: \`${message.id}\` `)
})


export default Cmd