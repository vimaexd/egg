import Command from "../../../classes/commands/Command"
import Discord, { Client, CommandInteraction, MessageEmbed } from 'discord.js';
import getGuildMember from "../../../db/utils/getGuildMember";
import xp from "../../../classes/features/Xp";
import Big from "big.js";
import _ from 'lodash';
import { YarnGlobals } from "../../../utils/types.bot";

import subCmdAchievements from './_achievements';
import { handleErr } from "../../../utils/ErrorHandler";
const subCmdStats = async (client: Client, interaction: CommandInteraction, globals: YarnGlobals) => {
  const _target = interaction.options.getUser("user") || interaction.user

  let target;
  try {
    target = await interaction.guild.members.fetch(_target);
  } catch(err) {
    handleErr(err)
    return interaction.reply(`Error fetching your server profile!`)
  }

  const prefs = await xp.getGuildPrefs(interaction.guild);
  const profile = await getGuildMember(target);
  const placementInLb = await xp.getRank(profile.xp, interaction.guild.id);

  const embed = new MessageEmbed();
  embed.setAuthor({ name: `User information for ${target.user.username}` });
  embed.setThumbnail(`https://cdn.discordapp.com/avatars/${target.user.id}/${target.user.avatar}.png`);
  embed.setColor(target.displayColor);

  // Basic info
  embed.addField("Username", `${target.user.username}#${target.user.discriminator}`);
  embed.addField(`Joined ${interaction.guild.name}`, `<t:${Math.floor(target.joinedTimestamp / 1000)}> (<t:${Math.floor(target.joinedTimestamp / 1000)}:R>)`, true);
  embed.addField(`Joined Discord`, `<t:${Math.floor(target.user.createdTimestamp / 1000)}> (<t:${Math.floor(target.user.createdTimestamp / 1000)}:R>)`, true);

  // XP
  if(prefs.xpEnabled) {
    embed.addField(
      `XP`, 
      `**#${placementInLb}** in ${interaction.guild.name}
      \`${profile.xp.toLocaleString()}\` XP - LVL ${xp.calculateLevel(new Big(profile.xp.toString()))}
      `,
      true
    )
    
    embed.addField(
      `XP Combo`, 
      `Currently at ${xp.getRecentActivityCombo(interaction.guild.id, target.id) + prefs.xpGuildMult}x`,
      true
    )
  
    let daysActive = xp.getRecentActivity(interaction.guild.id, target.id)
    embed.addField(
      `Recent Activity`, 
      `${`█`.repeat(daysActive)}${`▒`.repeat(5 - daysActive)}
      **${daysActive}**/5 past days active
      Gain XP ${prefs.xpStreakMsgReq} times in a day to get a ${prefs.xpStreakCombo}x boost to all XP earnt!
      `,
      true
    )
  }

  embed.setFooter({ text: target.user.id });
  (target.user.id == "210347599578791936") && embed.addField("Marwan", ":FlushedMarwan:") 
  interaction.reply({embeds: [embed]})
};

const Cmd = new Command({
    enabled: true,       
    name: "stats",
    description: "View your user information!",
    options: [
      {
        type: "SUB_COMMAND",
        name: "info",
        description: "View a user's basic information",
        options: [{
          name: "user",
          type: Discord.Constants.ApplicationCommandOptionTypes.USER,
          description: "The user you would like to see info of",
          required: false
        }]
      },
      {
        type: "SUB_COMMAND",
        name: "achievements",
        description: "View a user's achievements",
        options: [{
          name: "user",
          type: Discord.Constants.ApplicationCommandOptionTypes.USER,
          description: "The user you would like to see achievements of",
          required: false
        }]
      }
    ]
}, async (...args) => {
  const interaction = args[1];
  switch(interaction.options.getSubcommand()){
    case "achievements":
      subCmdAchievements(...args)
      break;
    default:
      subCmdStats(...args)
      break;
  }
})

export default Cmd;