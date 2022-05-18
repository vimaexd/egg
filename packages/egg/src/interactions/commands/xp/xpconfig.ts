import Discord, { ButtonInteraction, Constants, GuildMember, MessageEmbed } from "discord.js"
import Command from "../../../classes/Commands/Command"
import Utils from "../../../classes/Utils";
import xp from "../../../classes/Xp";
import { YarnGlobals } from "../../../utils/types";
import getGuildMember from "../../../db/utils/getGuildMember";
import YesNoCollector from "../../../utils/YesNoCollector";
import { handleErr } from "../../../utils/ErrorHandler";

const utils = new Utils()
const configKeys: any = [
  {
    name: "XP Enabled",
    value: 'xpenabled',
    description: "Set if the XP system is enabled or disabled",
    dbKey: "xpEnabled",
    responseType: "boolean",
    responses: [
      { value: "true", name: "Yes" },
      { value: "false", name: "No" }
    ]
  },
  {
    name: "Minimum characters",
    value: 'minchar',
    description: "Sets the minimum characters required for a message to give XP",
    dbKey: "xpMinChar",
    responseType: "number",
    responses: []
  },
  {
    name: "Max messages per minute",
    value: 'maxmsgpermin',
    description: "Sets the maximum amount of messages that can earn XP per minute",
    dbKey: "xpMaxMsgPerMin",
    responseType: "number",
    responses: []
  },
  {
    name: "XP Boost enabled",
    value: 'boostenabled',
    description: "Sets if users should get an XP boost every X messages",
    dbKey: "xpBoostEnabled",
    responseType: "boolean",
    responses: [
      { value: "true", name: "Yes" },
      { value: "false", name: "No" }
    ]
  },
  {
    name: "XP Boost message interval",
    value: 'boostmsg',
    description: "Sets how many messages are required for an XP boost to be triggered",
    dbKey: "xpBoostMsgAmnt",
    responseType: "number",
    responses: []
  },
  {
    name: "XP Boost minimum",
    value: 'boostmin',
    description: "Sets the minimum amount of random XP that will be given as a boost",
    dbKey: "xpBoostMin",
    responseType: "number",
    responses: []
  },
  {
    name: "XP Boost maximum",
    value: 'boostmax',
    description: "Sets the maximum amount of random XP that will be given as a boost",
    dbKey: "xpBoostMax",
    responseType: "number",
    responses: []
  },
  {
    name: "Ratio Battle XP Enabled",
    value: 'ratioenabled',
    description: "Set if users will get XP for winning a Ratio Battle",
    dbKey: "xpRbEnabled",
    responseType: "boolean",
    responses: [
      { value: "true", name: "Yes" },
      { value: "false", name: "No" }
    ]
  },
  {
    name: "Ratio Battle XP Amount",
    value: 'ratioamount',
    description: "Set how much XP users will get for winning a Ratio Battle",
    dbKey: "xpRbAmount",
    responseType: "number",
    responses: []
  },
  {
    name: "Server XP multiplier",
    value: 'guildxpmult',
    description: "Sets the multiplier for all XP earned in this server.",
    dbKey: "xpGuildMult",
    responseType: "float",
    responses: []
  },
  {
    name: "Activity streak minimum messages",
    value: "activityminmsg",
    description: "Set the minimum messages required for a day to be marked active on a user streak",
    dbKey: "xpStreakMsgReq",
    responseType: "number",
    responses: []
  },
  {
    name: "Activity streak combo amount",
    value: "activitycombo",
    description: "Set the XP combo granted for each active day",
    dbKey: "xpStreakCombo",
    responseType: "float",
    responses: []
  },
];

const handleKvSetting = async (interaction: Discord.CommandInteraction, globals: YarnGlobals) => {
  let k = interaction.options.getString('key');

  const targetKey = configKeys.find((ke: any) => (ke.value == k))
  if(!targetKey) return interaction.reply("Invalid configuration key!")


  switch(interaction.options.getSubcommand()){
    case "set": 
      let v: any = interaction.options.getString("value");
      if(
        targetKey.responseType == "enum"
        && !targetKey.responses.includes()
      ){
        return interaction.reply("Value is not in allowed value list!")
      }
    
      if(targetKey.responseType == "boolean")
        if(v != "true" && v != "false") return interaction.reply("Value must be `true` or `false`")
        if(v == "true") v = true;
        if(v == "false") v = false;
    
      if(targetKey.responseType == "number") {
        if(!utils.isNumeric(v)) return interaction.reply("Value must be a number")
        v = parseInt(v);
      }

      if(targetKey.responseType == "float") {
        if(!utils.isFloat(v)) return interaction.reply("Value must be a float (number with a decimal point)")
        v = parseFloat(v);
      }
    
      await globals.db.guild.updateMany({
        where: {
          id: interaction.guild.id
        },
        data: {
          [targetKey.dbKey]: {
            set: v
          },
        }
      })
      xp.cachePreferences(interaction.guild);
      interaction.reply(`${targetKey.name} has been set to ${v}`)
      break;

    case "get":
      const dbValue: any = await globals.db.guild.findFirst({
        where: {
          id: interaction.guild.id,
          
        },
        select: {
          [targetKey.dbKey]: true
        }
      })
      interaction.reply(`**${targetKey.name}** (${targetKey.value}) \`\`(${targetKey.dbKey})\`\` \`\`\` ${dbValue[targetKey.dbKey]}\`\`\` `)
      break;
  }
}

const handleRoleRewardSetting = async (interaction: Discord.CommandInteraction, globals: YarnGlobals) => {
  switch(interaction.options.getSubcommand()){
    case "add":
      const targetRole = interaction.options.getRole('role');
      const targetLevel = interaction.options.getNumber('level');
      let alreadyExists: any = await globals.db.guildXPRoleReward.count({
        where: {
          guildId: interaction.guild.id,
          roleId: targetRole.id
        }
      })
      if(alreadyExists != 0) return interaction.reply("A role reward already exists with this role")

      await globals.db.guildXPRoleReward.create({
        data: {
          guildId: interaction.guild.id,
          roleId: targetRole.id,
          level: targetLevel
        }
      })
      xp.cachePreferences(interaction.guild);
      return interaction.reply(":white_check_mark: XP role reward created")
      break;
    
    case "remove":
      const toBeDeleted = interaction.options.getRole('role');
      let deletedExists: any = await globals.db.guildXPRoleReward.count({
        where: {
          guildId: interaction.guild.id,
          roleId: toBeDeleted.id
        }
      })
      if(deletedExists == 0) return interaction.reply("A role reward with this role dosen't exist!")

      await globals.db.guildXPRoleReward.deleteMany({
        where: {
          guildId: interaction.guild.id,
          roleId: toBeDeleted.id
        }
      })
      xp.cachePreferences(interaction.guild);
      return interaction.reply(":white_check_mark: XP role reward removed")
      break;    
    case "view":
      let data = await globals.db.guildXPRoleReward.findMany({
        where: {
          guildId: interaction.guild.id
        }
      })

      if (data.length == 0) return interaction.reply("You haven't set any XP Role rewards")

      const embed = new MessageEmbed()
        .setTitle(`XP Role Rewards in ${interaction.guild.name}`)
        .setDescription(data.map((d: any) => (`LVL ${d.level} - <@&${d.roleId}>`)).join("\n"))
      interaction.reply({embeds: [embed]})
      break;
  }
}

const handleBlacklistedChannelsSetting = async (interaction: Discord.CommandInteraction, globals: YarnGlobals) => {
  switch(interaction.options.getSubcommand()){
    case "add":
      const targetChannel = interaction.options.getChannel('channel');
      let alreadyExists: any = await globals.db.guildXPBlacklistedChannel.count({
        where: {
          guildId: interaction.guild.id,
          channelId: targetChannel.id
        }
      })
      if(alreadyExists != 0) return interaction.reply("This channel is already blacklisted!")

      await globals.db.guildXPBlacklistedChannel.create({
        data: {
          guildId: interaction.guild.id,
          channelId: targetChannel.id,
        }
      })
      xp.cachePreferences(interaction.guild);
      return interaction.reply(":white_check_mark: Channel is now blacklisted from gaining XP")
      break;
    
    case "remove":
      const toBeDeleted = interaction.options.getChannel('channel');
      let deletedExists: any = await globals.db.guildXPBlacklistedChannel.count({
        where: {
          guildId: interaction.guild.id,
          channelId: toBeDeleted.id
        }
      })
      if(deletedExists == 0) return interaction.reply("This channel isn't blacklisted!")

      await globals.db.guildXPBlacklistedChannel.deleteMany({
        where: {
          guildId: interaction.guild.id,
          channelId: toBeDeleted.id
        }
      })
      xp.cachePreferences(interaction.guild);
      return interaction.reply(":white_check_mark: Channel is now unblacklisted")
      break;    
    case "view":
      let data = await globals.db.guildXPBlacklistedChannel.findMany({
        where: {
          guildId: interaction.guild.id
        }
      })

      if (data.length == 0) return interaction.reply("You haven't set any channels as Blacklisted")

      const embed = new MessageEmbed()
        .setTitle(`Blacklisted channels in ${interaction.guild.name}`)
        .setDescription(data.map((d) => (`<#${d.channelId}> (${d.channelId})`)).join("\n"))
      interaction.reply({embeds: [embed]})
      break;
  }
}

const Cmd = new Command({
    enabled: true,
    name: "xpconfig",
    restrict: true,
    description: "Configure the XP system",
    options: [
      {
        type: "SUB_COMMAND_GROUP",
        name: "settings",
        description: "Basic settings for the XP system",
        options: [
          {
            type: "SUB_COMMAND",
            name: "set",
            description: "Set a basic setting for the XP system",
            options: [
              {
                type: "STRING", 
                name: "key",
                description: "The XP config you would like to set",
                choices: configKeys,
                required: true
              },
              {
                type: "STRING",
                name: "value",
                description: "The value of the config option you would like to set",
                autocomplete: true,
                required: true,
              }
            ]
          },
          {
            type: "SUB_COMMAND",
            name: "get",
            description: "Get the value of a basic setting for the XP system",
            options: [
              {
                type: "STRING", 
                name: "key",
                description: "The XP config you would like to set",
                choices: configKeys,
                required: true
              },
            ]
          }
        ]
      },
      {
        type: "SUB_COMMAND_GROUP",
        name: "rolereward",
        description: "Configure role rewards for reaching a certain level",
        options: [
          {
            type: "SUB_COMMAND",
            name: "add",
            description: "Set a role reward for reaching a certain level",
            options: [
              {
                type: "ROLE", 
                name: "role",
                description: "The role that should be rewarded",
                required: true
              },
              {
                type: "NUMBER",
                name: "level",
                description: "The level that is required to reach this role",
                required: true,
              }
            ]
          },
          {
            type: "SUB_COMMAND",
            name: "remove",
            description: "Remove a level role reward",
            options: [
              {
                type: "ROLE", 
                name: "role",
                description: "The role associated with the level",
                required: true
              },
            ]
          },
          {
            type: "SUB_COMMAND",
            name: "view",
            description: "See all role rewards",
          },
        ]
      },
      {
        type: "SUB_COMMAND_GROUP",
        name: "blacklisted_channels",
        description: "Configure blacklisted channels",
        options: [
          {
            type: "SUB_COMMAND",
            name: "add",
            description: "Add a blacklisted channel",
            options: [
              {
                type: "CHANNEL",
                channelTypes: ["GUILD_TEXT"],
                name: "channel",
                description: "The channel that should be blacklisted",
                required: true
              }
            ]
          },
          {
            type: "SUB_COMMAND",
            name: "remove",
            description: "Remove a blacklisted channel",
            options: [
              {
                type: "CHANNEL",
                channelTypes: ["GUILD_TEXT"],
                name: "channel",
                description: "The channel that should be unblacklisted",
                required: true
              }
            ]
          },
          {
            type: "SUB_COMMAND",
            name: "view",
            description: "See all blacklisted channels",
          },
        ]
      },
      {
        type: "SUB_COMMAND_GROUP",
        name: "user",
        description: "Configure users' XP",
        options: [
          {
            type: "SUB_COMMAND",
            name: "set",
            description: "Set a user's XP amount",
            options: [
              {
                type: "USER", 
                name: "user",
                description: "The user you would like to set the XP amount of",
                required: true
              },
              {
                type: "NUMBER",
                name: "amount",
                description: "The amount of XP this user should have",
                required: true,
              }
            ]
          },
          {
            type: "SUB_COMMAND",
            name: "resetall",
            description: "⚠️ RESET ALL XP SERVER WIDE ⚠️",
            options: [
              {
                type: "STRING", 
                name: "confirm",
                description: "Are you sure?",
                choices: [{
                  name: "I acknowledge this is non-reversible", value: "confirm"
                }],
                required: true
              },
            ]
          }
        ]
      },
    ],
    autocomplete(interaction, client, globals) {
      const key = interaction.options.getString('key')
      if(!key) return interaction.respond([])
      interaction.respond(
        configKeys.find((k: any) => (k.value == key)).responses
      )
    },
}, async (client, interaction, globals) => {
  switch(interaction.options.getSubcommandGroup()) {
    case "settings":
      await handleKvSetting(interaction, globals);
      break;
    
    case "rolereward":
      await handleRoleRewardSetting(interaction, globals);
      break;

    case "blacklisted_channels":
      await handleBlacklistedChannelsSetting(interaction, globals);
      break;

    case "user":
      switch(interaction.options.getSubcommand()) {
        case "set":
          let _target = interaction.options.getUser("user");

          let target;
          try {
            target = await interaction.guild.members.fetch(_target);
          } catch(err) {
            handleErr(err)
            return interaction.reply(`Error fetching your server profile!`)
          }

          const profile = await getGuildMember(target);
          await globals.db.guildMember.updateMany({
            where: {
              guildId: interaction.guild.id,
              userId: target.id
            },
            data: {
              xp: interaction.options.getNumber('amount')
            }
          })
          interaction.reply(":white_check_mark: XP set")
          break;
        
        case "resetall":
          await YesNoCollector({
            interaction,
            question: "Are you sure you want to wipe all XP? **This is irreversable!**",
            onYes: async (btn) => {
              await globals.db.guildMember.updateMany({
                where: {
                  guildId: interaction.guild.id
                },
                data: {
                  xp: 0
                }
              })
              btn.update({ content: ":white_check_mark: It's all gone.", components: [] })
            }
          })
          break;
      }
      break;

  }
})

export default Cmd