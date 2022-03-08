import Discord, { AutocompleteInteraction, CommandInteraction, GuildMember, Interaction, User } from "discord.js"
import { YarnGlobals } from "../../utils/types"

export enum PermissionGroup {
  NONE = "none",
  ALL_STAFF = "staff",
  MODERATOR = "mods",
  ADMIN = "admin",
  OWNER = "owner",
  BOT_OWNER = "mae"
}

type TPermissionRoles = {[key: string]: string[]};
let PermissionRoles: TPermissionRoles = {};

PermissionRoles[PermissionGroup.MODERATOR] = [
  "661408853589753866"   // Moderator role
];
PermissionRoles[PermissionGroup.ADMIN] = [
  "660914705170169857"   // Admin role
];
PermissionRoles[PermissionGroup.OWNER] = [
  "660914458365001756",  // Exyl role
  "696895749350490194"   // Dalux role
];
PermissionRoles[PermissionGroup.BOT_OWNER] = [
  "675431621452759050"   // Yarn:tm: role
];
PermissionRoles[PermissionGroup.ALL_STAFF] = [].concat(
  PermissionRoles[PermissionGroup.MODERATOR],
  PermissionRoles[PermissionGroup.ADMIN],
  PermissionRoles[PermissionGroup.OWNER]
)

export interface CommandMeta {
    name: string,
    enabled: boolean,
    description: string,
    options?: Discord.ApplicationCommandOptionData[],
    type?: Discord.ApplicationCommandType,
    usage?: string,
    restrict?: PermissionGroup,
    autocomplete?: (interaction: AutocompleteInteraction, client: Discord.Client, globals: object) => any;
}

export default class Command {
    meta: CommandMeta
    run: (client: Discord.Client, interaction: CommandInteraction, globals: object) => any
    checkPermission: (interaction: CommandInteraction, group: PermissionGroup) => Promise<boolean>;

    constructor(meta: CommandMeta, run: (client: Discord.Client, interaction: CommandInteraction, globals: YarnGlobals) => any){
        this.meta = meta

        this.checkPermission = async (interaction, group) => {
          // bypass perm check in dev server
          if(interaction.guild.id == "606089486660534296") return true;
          
          if(
            !group
            || PermissionRoles[group].length == 0
          ) return false;

          let member: GuildMember;
          try {
            member = await interaction.guild.members.fetch(interaction.user.id);
          } catch(err) {
            throw err;
          }

          // 😈
          if(member.roles.cache.has(PermissionRoles[PermissionGroup.BOT_OWNER][0])){
            return true;
          };

          PermissionRoles[group].forEach((roleId) => {
            if(member.roles.cache.has(roleId)) return true;
          });

          return false;
        }

        this.run = async (client, interaction, globals) => {
          if(this.meta.restrict){
            try {
              let isAllowedToRun = await this.checkPermission(interaction, this.meta.restrict)
              if(!isAllowedToRun){
                return interaction.reply(`You are not allowed to run this command! You must be part of the group \`${this.meta.restrict}\` to run this command.`)
              }
            } catch(err) {
              console.log(err)
              return interaction.reply("*\"skill issue\"* - Oops! Something went wrong")
            }
          }

          run(client, interaction, globals);
        }
    }
}