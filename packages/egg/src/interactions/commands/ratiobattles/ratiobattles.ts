import axios from "axios";
import Discord, { ButtonInteraction, Constants, GuildMember, MessageEmbed } from "discord.js"
import Command from "../../../classes/Commands/Command"
import dayjs from "dayjs";
import getGuild from "../../../db/utils/getGuild";
import { deleteBtn, noBtn } from "../../../utils/buttons";
import { lastRatioTimestamp, ratioCooldown } from "../../../utils/ratio";
import { PermissionGroup } from "../../../utils/fgstatic";

const Cmd = new Command({
    enabled: true,
    name: "ratiobattles",
    description: "Configure Ratio battles",
    restrict: true,
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
        !lastRatioTimestamp.get(interaction.guild.id) 
        || interaction.createdTimestamp - lastRatioTimestamp.get(interaction.guild.id) > ratioCooldown
      ) {
        return interaction.reply(`✅ The ratio cooldown has expired! Waiting on a Ratio Battle message...`)
      } else {
        const cooldownUnixSec = Math.floor((lastRatioTimestamp.get(interaction.guild.id) + ratioCooldown) / 1000)
        interaction.reply(`🕒 The ratio cooldown expires <t:${cooldownUnixSec}:R> (<t:${cooldownUnixSec}>)`)
      }
      break;
    case "reset":
      const collector = new Discord.InteractionCollector(client, { componentType: "BUTTON" })
    
      collector.on('collect', async (newInteraction) => {
        if(!newInteraction.isButton) return;
        
        const btnInteraction = (newInteraction as ButtonInteraction);
        if(!btnInteraction.message.interaction) return;
        if(interaction.id != btnInteraction.message.interaction.id) return;
        if(btnInteraction.member.user.id != interaction.member.user.id) return btnInteraction.reply({"content": "You can't push that!", ephemeral: true})
        
        switch(btnInteraction.customId){
          case "no":
            await interaction.deleteReply();
            break;
          
          case "yes":
            lastRatioTimestamp.set(interaction.guild.id, 0)
            btnInteraction.update({ 
              content: `:white_check_mark: The cooldown has been reset.`, 
              components: []
            })
        }
      })
      await interaction.reply({
        content: `Are you sure you want to reset the ratio battle cooldown?`,
        components: [new Discord.MessageActionRow().addComponents([deleteBtn, noBtn])]
      })
      break;

  
    default:
      interaction.reply(`nah it brokey`)

  }
})

export default Cmd