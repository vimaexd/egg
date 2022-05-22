import Discord, { ButtonInteraction, Constants, Formatters, GuildMember, MessageEmbed } from "discord.js"
import Command from "../../../classes/Commands/Command"
import Utils from "../../../classes/Utils";
import xp from "../../../classes/Xp";
import { YarnGlobals } from "../../../utils/types";
import getGuildMember from "../../../db/utils/getGuildMember";
import YesNoCollector from "../../../utils/YesNoCollector";
import { handleErr } from "../../../utils/ErrorHandler";

import subRoleCnf from './_singularConfig';

const utils = new Utils()

const Cmd = new Command({
    enabled: true,
    name: "config",
    restrict: true,
    description: "Configure the bot",
    options: [
      {
        type: "SUB_COMMAND_GROUP",
        name: "autoassign",
        description: "Auto assign a role when a user joins",
        options: [
          {
            type: "SUB_COMMAND",
            name: "clear",
            description: "Stop assigning a role when a user joins",
          },
          {
            type: "SUB_COMMAND",
            name: "set",
            description: "Set a role to be assigned when a user joins",
            options: [
              {
                type: "ROLE", 
                name: "role",
                description: "The role to be assigned when a user joins",
                required: true
              },
            ]
          }
        ]
      },
      // {
      //   type: "SUB_COMMAND_GROUP",
      //   name: "log_react",
      //   description: "Log server reactions to a channel",
      //   options: [
      //     {
      //       type: "SUB_COMMAND",
      //       name: "clear",
      //       description: "Stop logging server reactions to a channel",
      //     },
      //     {
      //       type: "SUB_COMMAND",
      //       name: "set",
      //       description: "Set a channel to log server reactions to",
      //       options: [
      //         {
      //           type: "CHANNEL",
      //           channelTypes: ["GUILD_TEXT"], 
      //           name: "channel",
      //           description: "The channel for reactions to be logged to",
      //           required: true
      //         },
      //       ]
      //     }
      //   ]
      // },
      // {
      //   type: "SUB_COMMAND_GROUP",
      //   name: "log_join",
      //   description: "Log server joins to a channel",
      //   options: [
      //     {
      //       type: "SUB_COMMAND",
      //       name: "clear",
      //       description: "Stop logging server joins to a channel",
      //     },
      //     {
      //       type: "SUB_COMMAND",
      //       name: "set",
      //       description: "Set a channel to log server joins to",
      //       options: [
      //         {
      //           type: "CHANNEL",
      //           channelTypes: ["GUILD_TEXT"], 
      //           name: "channel",
      //           description: "The channel for joins to be logged to",
      //           required: true
      //         },
      //       ]
      //     }
      //   ]
      // },
    ],
}, async (client, interaction, globals) => {
  switch(interaction.options.getSubcommandGroup()) {
    case "autoassign":
      subRoleCnf(interaction, "Auto assign", "role", "aaRoleId");
      break;
    
    case "log_react":
      subRoleCnf(interaction, "Reaction log", "channel", "lgChReact");
      break;

    case "log_join":
      subRoleCnf(interaction, "Join log", "channel", "lgChJoin");
      break;

  }
})

export default Cmd