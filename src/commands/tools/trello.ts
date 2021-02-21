import Discord, { MessageEmbed } from "discord.js"
import Command from "../../classes/Command"

const Cmd = new Command({
    enabled: true,
    name: "trello",
    trigger: ["trello"],
    description: "View the Trello Board",
    usage: "trello",
    category: "Tools"
}, async (client, message, args, globals) => {
    message.channel.send("You can view the Trello here - https://trello.com/b/rCFSihdb/eggbot")
})

export default Cmd