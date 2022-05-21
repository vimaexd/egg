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
    ],
}, async (client, interaction, globals) => {
  switch(interaction.options.getSubcommandGroup()) {
    case "autoassign":
      return subRoleCnf(interaction, "Auto assign", "role", "aaRoleId");

  }
})

export default Cmd