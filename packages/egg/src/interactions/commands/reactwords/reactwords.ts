import Discord, { ButtonInteraction, Constants, GuildMember, MessageEmbed } from "discord.js"
import Command from "../../../classes/commands/Command"
import getGuild from "../../../db/utils/getGuild";

const Cmd = new Command({
    enabled: true,
    name: "reactwords",
    description: "Configure reaction words",
    restrict: true,
    options: [
      {
        name: "toggle",
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        description: "Toggle reaction words from being picked up"
      },
      // {
      //   name: "toggle-dadjoke",
      //   type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      //   description: "Toggle the \"I am X\" reaction word from being picked up"
      // },
    ]
}, async (client, interaction, globals) => {
  const guild = await getGuild(interaction.guild);

  let newState;
  switch(interaction.options.getSubcommand()){
    case "toggle":
      newState = !guild.rwEnabled
      await globals.db.guild.update({
        where: { id: guild.id },
        data: {
          rwEnabled: {
            set: newState
          }
        }
      })
      interaction.reply(`✅ Reaction words are now ${(newState) ? "enabled": "disabled"}`)
      break;
    // case "toggle-dadjoke":
    //   newState = !guild.rwDjEnabled
    //   await globals.db.guild.update({
    //     where: { id: guild.id },
    //     data: {
    //       rwDjEnabled: {
    //         set: newState
    //       }
    //     }
    //   })
    //   interaction.reply(`✅ Dad joke reaction word is now ${(newState) ? "enabled": "disabled"}`)
    //   break;
    default:
      interaction.reply(`nah it brokey`)
  }
})

export default Cmd