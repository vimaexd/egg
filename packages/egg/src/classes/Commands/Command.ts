import Discord, { AutocompleteInteraction, CommandInteraction, GuildMember, Interaction, User } from "discord.js"
import { YarnGlobals } from "../../utils/types"

import { getPermissionRoles, PermissionGroup } from "../../utils/fgstatic";
const PermissionRoles = getPermissionRoles();

export interface CommandMeta {
    name: string,
    enabled: boolean,
    description: string,
    options?: Discord.ApplicationCommandOptionData[],
    type?: Discord.ApplicationCommandType,
    usage?: string,
    restrict?: boolean, /* PermissionGroup */
    autocomplete?: (interaction: AutocompleteInteraction, client: Discord.Client, globals: object) => any;
}

export default class Command {
    meta: CommandMeta
    run: (client: Discord.Client, interaction: CommandInteraction, globals: object) => any
    checkPermission: (interaction: CommandInteraction, group: PermissionGroup) => Promise<boolean>;

    constructor(meta: CommandMeta, run: (client: Discord.Client, interaction: CommandInteraction, globals: YarnGlobals) => any){
        this.meta = meta

        // this.checkPermission = async (interaction, group) => {
        //   // bypass perm check in dev server for mae
        //   if(interaction.guild.id == "606089486660534296" && interaction.user.id == "577743466940071949") return true;
          
        //   if(
        //     !group
        //     || PermissionRoles[group].length == 0
        //   ) return false;

        //   let member: GuildMember;
        //   try {
        //     member = await interaction.guild.members.fetch(interaction.user.id);
        //   } catch(err) {
        //     throw err;
        //   }

        //   // 😈
        //   if(member.roles.cache.has(PermissionRoles[PermissionGroup.BOT_OWNER][0])){
        //     return true;
        //   };

        //   return PermissionRoles[group].some((target) => {
        //     if(member.roles.cache.some((r) => r.id == target)) {
        //       return true;
        //     }
        //   });

        // }

        this.run = async (client, interaction, globals) => {
          // if(this.meta.restrict){
          //   try {
          //     let isAllowedToRun = await this.checkPermission(interaction, this.meta.restrict)
          //     if(!isAllowedToRun){
          //       return interaction.reply(`You are not allowed to run this command! You must be part of the group \`${this.meta.restrict}\` to run this command.`)
          //     }
          //   } catch(err) {
          //     console.log(err)
          //     return interaction.reply("*\"skill issue\"* - Oops! Something went wrong")
          //   }
          // }

          run(client, interaction, globals);
        }
    }
}