import axios from "axios";
import Discord, { ButtonInteraction, Constants, GuildMember, MessageEmbed } from "discord.js"
import _ from "lodash";
import Command from "../../../classes/Commands/Command"
import Utils from "../../../classes/Utils";
import xp from "../../../classes/Xp";
import { PermissionGroup } from "../../../utils/fgstatic";

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
  }
];

const Cmd = new Command({
    enabled: true,
    name: "xpconfig",
    restrict: PermissionGroup.ADMIN,
    description: "Configure the XP system",
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
    ],
    autocomplete(interaction, client, globals) {
      const key = interaction.options.getString('key')
      interaction.respond(
        configKeys.find((k: any) => (k.value == key)).responses
      )
    },
}, async (client, interaction, globals) => {
  let k = interaction.options.getString('key');
  let v: any = interaction.options.getString("value");

  const targetKey = configKeys.find((ke: any) => (ke.value == k))
  if(!targetKey) return interaction.reply("Invalid configuration key!")
  if(
    targetKey.responseType != "boolean"
    && targetKey.responseType != "number"
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
})

export default Cmd