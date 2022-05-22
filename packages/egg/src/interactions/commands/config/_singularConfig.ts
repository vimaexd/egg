import { Channel, CommandInteraction, Formatters, GuildBasedChannel, Role } from "discord.js";
import { YarnGlobals } from "../../../utils/types";

import { Haylin as Haylin } from '../../../index';

type TSingularConfigType = "role" | "channel"

export default async (interaction: CommandInteraction, settingText: string, type: TSingularConfigType, dbKey: string) => {
  switch(interaction.options.getSubcommand()) {
    case "clear":
      await Haylin.globals.db.guild.updateMany({
        where: {
          id: interaction.guild.id
        },
        data: {
          [dbKey]: ""
        }
      })
      interaction.reply(`:white_check_mark: ${settingText} ${type} has been removed`)
      break;

    case "set":
      let target: any;

      switch(type) {
        case "role":
          target = interaction.options.getRole('role');
          break;
    
        case "channel":
          target = interaction.options.getChannel('channel');
          break;
      }

      if(!target.id) interaction.reply("Error: Invalid channel ID found, please try again later");

      await Haylin.globals.db.guild.updateMany({
        where: {
          id: interaction.guild.id
        },
        data: {
          [dbKey]: target.id
        }
      })
      interaction.reply(`:white_check_mark: ${settingText} ${type} has been set to ` + Formatters.bold(target.name))
      break;
  }
}