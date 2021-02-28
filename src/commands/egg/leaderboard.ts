import Discord, { MessageEmbed } from "discord.js"
import { Op } from "sequelize";
import Command from "../../classes/Command"
import { Feedback, User } from '../../db/models';
import { YarnGlobals } from "../../utils/types";

const getLbEmoji = async (placement: string): Promise<string> => {
    switch(placement) {
        case "1":
            return ":first_place:"
        case "2":
            return ":second_place:"
        case "3":
            return ":third_place:"
        default:
            return ""
    }
}

const getLbEmbed = async (client: Discord.Client, config: YarnGlobals, users: any, page: number, guildName: string): Promise<MessageEmbed> => {
    let mbed = new Discord.MessageEmbed()
    .setTitle(`Leaderboard in ${guildName}`)
    .setColor(config.config.embedColors.default)
    .setDescription(`Page ${page + 1}`)

    for(let i = 0; i < users.length; i++){
        let pog = users[i]
        if(!pog) return;

        let usr = await client.users.fetch(pog.userId)
        let placement = (i + 1) + (page * 5)
        let lbEmoji;
        (page == 0) ? lbEmoji = await getLbEmoji(placement.toString()) : lbEmoji = "";
        
        mbed.addField(`${lbEmoji ? lbEmoji : placement} - ${usr.tag}`, `Gave ${pog.lifetime} feedbacks`)
    }
    return mbed;
}

const Cmd = new Command({
    enabled: true,
    name: "leaderboard",
    trigger: ["lb", "leaderboard"],
    description: "View the top 5 people giving feedback",
    usage: "leaderboard",
    category: "Egg"
}, async (client, message, args, config) => {
    message.channel.startTyping()

    // Parse page
    let page: number;
    if(!args[0]) page = 0;
    else if(isNaN(+args[0])) page = 0;
    else page = +args[0]

    let users = await User.findAll({
        limit: 5,
        order: [ ['lifetime', 'DESC'] ],
        offset: page * 5
    })
    if(users.length == 0) message.channel.send("No one has sent feedback yet!")

    let mbed = await getLbEmbed(client, config, users, page, message.guild.name);
    let botMsg = await message.channel.send({embed: mbed})
    message.channel.stopTyping()

    botMsg.react("◀")
    botMsg.react("▶")

    const filter = (user: Discord.User) => { return true; };
    const collector = botMsg.createReactionCollector(filter, { time: 60000 });

    collector.on('collect', async (reaction, user) => {
        if(user.id != message.author.id) return;
        if(reaction.emoji.name == "◀") {
            if((page - 1) == -1) return reaction.users.remove(message.author.id);
            page--;
        }
        if(reaction.emoji.name == "▶") page++;

        users = await User.findAll({ limit: 5, order: [ ['lifetime', 'DESC'] ], offset: page * 5, where: { lifetime: { [Op.gt]: 0 }} })
        if(users.length == 0) {
            reaction.users.remove(message.author.id)
            return page--;
        }

        mbed = await getLbEmbed(client, config, users, page, message.guild.name);

        await botMsg.edit({embed: mbed})
        reaction.users.remove(message.author.id)
    });

    collector.on('end', async collected => { await message.reactions.removeAll() });
})

export default Cmd