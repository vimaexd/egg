import { GuildMember, MessageEmbed } from "discord.js";
import { Haylin as Haylin } from "..";
import achievements, { DummyAchievement, parseAchievementBadge } from "../classes/Achievements";
import { handleErr } from "../utils/ErrorHandler";
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

achievements.events.on('achievementGet', async (member: GuildMember, achievementId) => {
  let targetAch = achievements.data.find((a) => a.id == achievementId);
  if(!targetAch) targetAch = DummyAchievement;

  await notifications.send(
    member, 
    `:trophy: Achievement unlocked!`, 
    `${parseAchievementBadge(targetAch.badge, member.guild.id) || ":crown:"} **${targetAch.name}**
    *${targetAch.description}*
    `
  )
})

export default notifications