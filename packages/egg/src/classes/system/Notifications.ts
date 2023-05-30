import { GuildMember, MessageEmbed } from "discord.js";
import { Haylin as Haylin } from "../..";
import { handleErr } from "../../utils/ErrorHandler";
import Log from "./Log";

class Notifications {
  private log: Log
  constructor() {
    this.log = new Log({ prefix: "Notification" })
  }

  async send(member: GuildMember, title: string, body: string) {
    const NotifEmbed = new MessageEmbed()
      .setTitle(title)
      .setDescription(body)
      .setFooter({ text: `From ${member.guild.name}`, iconURL: member.guild.iconURL({ format: "png" })})

    try {
      await member.send({ embeds: [NotifEmbed] })
    } catch(err: any) { 
      if("code" in err){
        if(err.code === 50013) return; // DMs disabled
      }
      this.log.log("Error pushing notification");
      handleErr(err);
     }
  }
}
const notifications = new Notifications();

export default notifications