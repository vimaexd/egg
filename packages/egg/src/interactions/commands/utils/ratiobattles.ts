import axios from "axios";
import Discord, { ButtonInteraction, Constants, GuildMember, MessageEmbed } from "discord.js"
import Command from "../../../classes/Commands/Command"
import dayjs from "dayjs";
import getGuild from "../../../db/utils/getGuild";
import { deleteBtn, noBtn } from "../../../utils/buttons";
import { lastRatioTimestamp, ratioCooldown } from "../../../utils/ratio";

const Cmd = new Command({
    enabled: true,
    name: "ratiobattles",
    description: "Configure Ratio battles",
    options: [
    {
      name: "toggle",
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      description: "Toggle Ratio Battles from being triggered"
    },
    {
      name: "cooldown",
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
      description: "Configure the cooldown for Ratio Battles",
      options: [
        {
          name: "view",
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          description: "View the current cooldown for Ratio Battles"
        },
        {
          name: "reset",
          type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
          description: "Reset the cooldown for Ratio Battles"
        }
      ]
    }
    ]
}, async (client, interaction, globals) => {
  if(!(interaction.member as Discord.GuildMember).permissions.has("MANAGE_GUILD"))
    return interaction.reply({"content": ":x: You must have the **Manage Guild** permission to use this command!"})

  const guild = await getGuild(interaction.guild);

  switch(interaction.options.getSubcommand()){
    case "toggle":
      let newState = !guild.rbEnabled
      await globals.db.guild.update({
        where: { id: guild.id },
        data: {
          rbEnabled: {
            set: newState
          }
        }
      })
      interaction.reply(`✅ Ratio battles are now ${(newState) ? "enabled": "disabled"}`)
      break;
    case "view":
      if(
        !lastRatioTimestamp.get(interaction.guild) 
        || interaction.createdTimestamp - lastRatioTimestamp.get(interaction.guild) > ratioCooldown
      ) {
        return interaction.reply(`✅ The ratio cooldown has expired! Waiting on a Ratio Battle message...`)
      } else {
        interaction.reply(`🕒 The ratio cooldown expires <t:${lastRatioTimestamp.get(interaction.guild) + ratioCooldown}:R> (<t:${lastRatioTimestamp.get(interaction.guild) + ratioCooldown}>)`)
      }
      break;
    case "reset":
      const collector = new Discord.InteractionCollector(client, { componentType: "BUTTON" })
    
      collector.on('collect', async (newInteraction) => {
        if(!newInteraction.isButton) return;
        
        const btnInteraction = (newInteraction as ButtonInteraction);
        if(!btnInteraction.message.interaction) return;
        if(interaction.id != btnInteraction.message.interaction.id) return;
        if(btnInteraction.member.user.id != interaction.member.user.id) return btnInteraction.reply("You can't push that!")
        
        switch(btnInteraction.customId){
          case "no":
            await interaction.deleteReply();
            break;
          
          case "yes":
            lastRatioTimestamp.set(interaction.guild, 0)
            btnInteraction.update({ 
              content: `:white_check_mark: The cooldown has been reset.`, 
              components: []
            })
        }
      })
      await interaction.reply({
        content: `Are you sure you want to do remove this role button?`,
        components: [new Discord.MessageActionRow().addComponents([deleteBtn, noBtn])]
      })
      break;

  
    default:
      interaction.reply(`nah it brokey`)

  }
})

export default Cmd