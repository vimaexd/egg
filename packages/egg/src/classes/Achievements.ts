import dayjs from "dayjs";
import { GuildMember as DiscordGuildMember, Message } from "discord.js";
import EventEmitter from "events";
import { bot } from "..";
import getGuildMember, { GuildMemberExtras } from '../db/utils/getGuildMember';
import { badgeAchEasy, badgeAchHard, badgeAchImpossible, exylId } from "../utils/fgstatic";
import Log from "./Log";
import xp from "./Xp";

interface IAchievement<T> {
  id: string;
  name: string;
  description: string;
  badge?: string;
  invisible?: boolean;
  
  eventType: T;
  check: AchievementFunction;
}

type AchievementFunction = (member: DiscordGuildMember) => Promise<boolean>;
enum AchievementEvent {
  NONE = 0,
  RATIO = 1,
  // REACTIONWORD = 2,
  XPGAIN = 3,
  XPCOMBOCALC = 4,
  LEVELCHANGE = 5
}

const DummyAchievement: IAchievement<AchievementEvent> = {
  id: "eggbot:dummy",
  name: "Unknown Achievement",
  description: "This achievement does not exist",
  eventType: AchievementEvent.NONE,
  badge: ":grey_question:",
  check: () => { return new Promise(r => r(false)) },
}

class Achievements {
  private log: Log
  data: IAchievement<AchievementEvent>[];
  events: EventEmitter
  
  constructor() {
    this.data = [];
    this.events = new EventEmitter();
    this.log = new Log({ prefix: "Achievements" })
  }

  /**
   * Assign an achievement to a user
   * @param user GuildMemberExtras The user to give the achievement to
   * @param achievementId The id of the achievement to give
   * @returns void
   */
  async giveAchievement(user: GuildMemberExtras, achievementId: string) {
    const exists = await bot.globals.db.guildMemberAchievement.findFirst({
      where: {memberId: user.id, achId: achievementId}
    })

    if(!exists) {
      await bot.globals.db.guildMemberAchievement.create({
        data: { memberId: user.id, achId: achievementId }
      })

      let discordUser;
      try {
        discordUser = await bot.client.guilds.cache.get(user.guildId).members.fetch(user.userId);
      } catch(err) { return }

      this.events.emit('achievementGet', discordUser, achievementId)
      this.log.log(`${achievementId} given to ${user.userId} in ${user.guildId}`);
    }
  }

  /**
   * Remove an achievement from a user
   * @param user GuildMemberExtras The user to remove the achievement from
   * @param achievementId The id of the achievement to remove
   * @returns void
   */
  async removeAchievement(user: GuildMemberExtras, achievementId: string) {
    const exists = await bot.globals.db.guildMemberAchievement.findFirst({
      where: {memberId: user.id, achId: achievementId}
    })

    if(exists) {
      await bot.globals.db.guildMemberAchievement.delete({
        where: { id: exists.id }
      })

      let discordUser;
      try {
        discordUser = await bot.client.guilds.cache.get(user.guildId).members.fetch(user.userId);
      } catch(err) { return }

      this.events.emit('achievementRemove', user, achievementId)
      this.log.log(`${achievementId} removed from ${user.userId} in ${user.guildId}`);
    }
  }
  
  /**
   * Update the achievements for a user based on an event
   * @param member GuildMemberExtras The user to update the achievements for
   * @param eventType The event to filter the achievements by
   */
  async updateFilteredByEvent(member: DiscordGuildMember, eventType: AchievementEvent) {
    const toCheck = this.data.filter((a) => (a.eventType == eventType));
    const toCheckFns = toCheck.map((a) => (a.check(member)));

    let checks: {id: string; has: boolean;}[] | boolean[] = await Promise.all(toCheckFns);
    checks = checks.map((e, i) => {
      const target = toCheck[i]
      return {
        id: target.id,
        has: e
      }
    });

    const profile = await getGuildMember(member);
    checks.forEach(c => {
      if(c.has && !profile.achievements.find(ch => ch.achId == c.id)){
        this.giveAchievement(profile, c.id)
      }
    })
  }

  /**
   * Register a new achievement
   * @param ach The achievement to register
   */
  register(ach: IAchievement<AchievementEvent>) {
    this.data.push(ach);
  }
}
const achievements = new Achievements()

achievements.register({
  id: "eggbot:reactall",
  name: "The Legendary Message",
  description: "Obtain all bot emoji reactions on one message",
  eventType: AchievementEvent.NONE,
  badge: badgeAchEasy,
  async check(member: DiscordGuildMember) { return false }
})

achievements.register({
  id: "eggbot:grind",
  name: "The Grind",
  description: "Gain 9000XP in under 3 hours",
  eventType: AchievementEvent.XPGAIN,
  badge: badgeAchImpossible,
  async check(member: DiscordGuildMember) { 
    if(!(member.guild.id in xp.activityCache)) return;
    if(!(member.user.id in xp.activityCache[member.guild.id])) return;

    const ts = dayjs().subtract(3, 'hour').unix();

    let userActivity = xp.activityCache[member.guild.id][member.user.id]
      .filter((a) => ts > a.time)
      .filter((a) => ts < dayjs().unix())
    
    const totalXpGained = userActivity.reduce((v, c) => (v += c.amount), 0);
    return (totalXpGained >= 9000)
  }
})

achievements.register({
  id: "eggbot:ghosted",
  name: "Ghosted",
  description: "Participate in a ratio battle where nobody votes",
  eventType: AchievementEvent.NONE,
  badge: badgeAchEasy,
  async check(member: DiscordGuildMember) { return false }
})

achievements.register({
  id: "eggbot:twitter",
  name: "Twitter User",
  description: "Win ratio battles against 5 different people",
  eventType: AchievementEvent.RATIO,
  badge: badgeAchEasy,
  async check(member: DiscordGuildMember) { 
    const group = await bot.globals.db.ratioBattleResult.groupBy({
      by: ["loserId"],
      where: {
        guildId: member.guild.id,
        winnerId: member.id
      }
    })  

    return (group.length >= 5)
  }
})

achievements.register({
  id: "eggbot:wtfhow",
  name: "No way",
  description: "Ratio Exyl",
  eventType: AchievementEvent.RATIO,
  badge: badgeAchImpossible,
  async check(member: DiscordGuildMember) {
    const data = await bot.globals.db.ratioBattleResult.count({
      where: {
        guildId: member.guild.id,
        loserId: exylId,
        winnerId: member.id
      }
    })
    console.log(data)
    if(data > 0) return true;
    else return false;
  }
})

achievements.register({
  id: "eggbot:fc",
  name: "Full Combo",
  description: "Reach the maximum XP combo",
  badge: badgeAchEasy,
  eventType: AchievementEvent.XPGAIN,
  async check(member: DiscordGuildMember) {
    return (xp.getRecentActivity(member.guild.id, member.user.id) == 5)
  }
})

achievements.register({
  id: "eggbot:alivechat",
  name: "Alive Chat",
  description: "Break the chat's silence after it being silent for atleast 20 minutes",
  eventType: AchievementEvent.NONE,
  badge: badgeAchHard,
  async check(member: DiscordGuildMember) { return false }
})

achievements.register({
  id: "eggbot:happyday",
  name: "Happy Day",
  description: "Get 5 XP boost rewards in one day",
  badge: badgeAchHard,
  eventType: AchievementEvent.XPGAIN,
  async check(member: DiscordGuildMember) {
    const prefs = await xp.getGuildPrefs(member.guild);
    if(!prefs.xpBoostEnabled) return;
    
    if(!(member.guild.id in xp.activityCache)) return;
    if(!(member.user.id in xp.activityCache[member.guild.id])) return;

    const ts = dayjs().subtract(1, 'day').unix();
    let userActivity = xp.activityCache[member.guild.id][member.user.id]
      .filter((a) => ts > a.time)
      .filter((a) => ts < dayjs().unix())
    const totalXpGained = userActivity.reduce((v, c) => (v += c.amount), 0);
    
    // i fucking suck
    return (Math.floor(totalXpGained / parseInt(prefs.xpBoostMsgAmnt.toString())) >= 5)
  }
})

export default achievements;
export {
  AchievementEvent,
  DummyAchievement
}