import Discord, { MessageEmbed } from "discord.js"
import Command from "../../classes/Command"

const Cmd = new Command({
    enabled: true,
    name: "help",
    trigger: ["help"],
    description: "Get a list of commands that the bot has",
    usage: "help <command>",
    category: "Tools"
}, async (client, message, args, globals) => {
    if(args[0]){
        let embed = new MessageEmbed()
            .setTitle("Command Info")
            .setColor(globals.config.embedColors.default)
            .setFooter("Egg", client.user.displayAvatarURL())

        let cmd = globals.commands.get(args[0])
        if(!cmd) return message.channel.send("That command does not exist.")

        embed.addField("Command Name", cmd.meta.name)
        embed.addField("Description", cmd.meta.description)
        embed.addField("Category", cmd.meta.category)
        embed.addField("Usage", `!!${cmd.meta.usage}`)
        embed.addField("Aliases", cmd.meta.trigger.map(a => (`\`${a}\``)).join(" "))
        message.channel.send({embed: embed})
    } else {
        let categories: Array<string> = []
        globals.commands.forEach((v: Command, k: string) => {
            if(v.meta.category == "dev") return;
            if(v.meta.category == "perserver") return;
            (categories.indexOf(v.meta.category) !== -1) ? void(0) : categories.push(v.meta.category)
        })
    
        let desc = `:pushpin: Check the channel pins for an explanation on what each command does.
        :innocent: Please follow the channel rules! Mods can revoke access if they are not followed.
        `
        let embed = new MessageEmbed()
            .setTitle("Command List")
            .setColor(globals.config.embedColors.default)
            .setFooter("Egg - Bot made by Stringy", client.user.displayAvatarURL())
            // .setDescription("type !!help [command] to get info on a certain command")
            .setDescription(desc)

        let names: Array<string> = []
        globals.commands.forEach((v: Command, k: string) => { names.push(v.meta.name) })
        embed.addField("Commands", names.map(n => `\`${n}\``).join(" "), true)
        
        message.channel.send({embed: embed})
    }
})

export default Cmd