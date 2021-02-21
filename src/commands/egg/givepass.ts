import Discord from "discord.js"
import Command from "../../classes/Command"
import { User, Feedback } from '../../db/models';

const Cmd = new Command({
    enabled: true,
    name: "givepass",
    trigger: ["givepass"],
    description: "Give passes to people. Staff only",
    usage: "givepass [mention] [amount]",
    category: "dev"
}, async (client, message, args, config) => {
    // TODO: make configurable
    if(!message.member.roles.cache.has('660914705170169857')) return message.channel.send("No permission.")

    let usr = message.mentions.members.first()
    if(!usr) return message.reply("Please mention a user to give passes to. &givepass [mention] [amount]")
    if(!args[1]) return message.reply("Please specify an amount of passes. &givepass [mention] [amount]")
    if(isNaN(parseInt(args[1]))) return message.reply("That's not a number you egg. &givepass [mention] [amount]")

    let egg = await User.findOne({ where: { userId: usr.user.id } })
    if(!egg) egg = await User.create({ userId: usr.user.id, points: 0, lifetime: 0 })

    egg.points += args[1];
    await egg.save()

    message.channel.send(`Gave ${usr.user.tag} ${args[1]} license! They now have ${egg.points} licenses.`)
})


export default Cmd