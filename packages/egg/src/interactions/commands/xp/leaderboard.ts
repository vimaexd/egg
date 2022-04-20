import axios from "axios";
import Discord, { ButtonInteraction, Constants, GuildMember, MessageEmbed } from "discord.js"
import Command from "../../../classes/Commands/Command"

const Cmd = new Command({
    enabled: true,
    name: "leaderboard",
    description: "View the XP leaderboard",
    options: [
    ]
}, async (client, interaction, globals) => {
  interaction.reply("todo")
})

export default Cmd