import Discord from "discord.js"
import Command from "../../classes/Command"
import { User } from '../../db/models';
import getUser from "../../utils/eggRetrievalService";

const Cmd = new Command({
    enabled: true,
    name: "license",
    trigger: ["p", "pass", "points", "license", "licence", "licences", "licenses", "l"],
    description: "Get your pass status.",
    usage: "license",
    category: "Egg"
}, async (client, message, args, config) => {
    if(message.member.roles.cache.has('672831766733783055')) return message.channel.send(`You have infinite licenses, you egg.`)
    
    let egg = await getUser(message.author.id)
    return message.channel.send(`You have \`${egg.points}\` license(s)!`)
})

export default Cmd