import { Guild, Message } from 'discord.js';
import getGuild from '../../db/utils/getGuild';
import getGuildMember from '../../db/utils/getGuildMember';
import dayjs from 'dayjs';
import { Haylin as Haylin } from '../../index'; 
import Big from 'big.js';
import { GuildXPBlacklistedChannel, GuildXPRoleReward } from '@prisma/client';
import Log from '../system/Log';
import achievements, { AchievementEvent } from '../system/Achievements';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { handleErr } from '../../utils/ErrorHandler';
import { IGuildStore, IGuildUserStore } from '../../utils/types.store';

const log = new Log({ prefix: "XP" })

const getProperty = (obj: any, key: any) => {
  if(!obj) return undefined;
  if(!obj.hasOwnProperty(key)) return undefined;
  else return obj[key];
}
interface IXpChangeCache {
  time: number
  amount: number
};

class XP {
  guildPrefs: IGuildStore<any>;
  cooldownStore: IGuildUserStore<number>;
  msgCooldownStore: IGuildUserStore<number>;
  lastMsgStore: IGuildUserStore<string>;

  activityCache: IGuildUserStore<IXpChangeCache[]>;
  activityFile: string;
  
  constructor() {
    this.guildPrefs = {};
    this.cooldownStore = {};
    this.msgCooldownStore = {};
    this.lastMsgStore = {};
    this.activityCache = {};

    this.activityFile = path.join(__dirname, '../../../../data/bot/activityCache.json');
    if(!existsSync(this.activityFile)){
      mkdirSync(path.dirname(this.activityFile), { recursive: true })
      writeFileSync(this.activityFile, JSON.stringify({}), { encoding: "utf-8" });
    }

    try {
      const f = readFileSync(this.activityFile, { encoding: "utf-8" })
      this.activityCache = JSON.parse(f);
    } catch(e) {
      handleErr(e)
      console.error("Error reading activity file from disk!");
    }
  }

  async saveActivityCacheToDisk() {
    try {
      writeFileSync(this.activityFile, JSON.stringify(this.activityCache), { encoding: "utf-8" })
    } catch(e) {
      handleErr(e)
      console.error("Error writing activity cache to disk!");
    }
  }

  /**
   * Cache preferences from the Database to the bot
   * @param target Guild to cache preferences for
   */
  async cachePreferences(target: Guild) {
    const guild: any = await getGuild(target);
    const prefKeys = Object.keys(guild).filter(k => k.startsWith("xp"));
    const prefs = prefKeys.reduce((obj: any, cur: string) => ({...obj, [cur]: guild[cur]}), {})
    this.guildPrefs[guild.id] = prefs;
  }

  private async cleanupActivityCache(guildId: string, userId: string) {
    const userCache = getProperty(this.activityCache[guildId], userId);
    if(!userCache) return;

    userCache.forEach((u: IXpChangeCache) => {
      if(dayjs.unix(u.time).isBefore(dayjs().subtract(5, 'day'))){
        this.activityCache[guildId][userId].splice(this.activityCache[guildId][userId].indexOf(u), 1)
      }
    })
  }

  /**
   * Get the amount of days a member was marked active for
   * @param guildId The guild ID of the member
   * @param userId The user ID of the member
   * @returns number
   */
  getRecentActivity(guildId: string, userId: string) {
    const prefs = this.guildPrefs[guildId]
    if(!(userId in this.activityCache[guildId])) return 0;

    const activity = this.activityCache[guildId][userId];
    if(!activity) return 0;
    if(activity.length == 0) return 0;

    let last5d = [];
    for(let i = 0; i < 4; i++){
      last5d.push(dayjs().subtract(1 + i, 'day').unix())
    };

    let didPassThreshold = last5d.map((ts) => {
      let filteredActivity = activity
      .filter((a) => ts < a.time)
      .filter((a) => a.time < dayjs.unix(ts).add(1, 'day').unix())

      if(filteredActivity.length >= prefs.xpStreakMsgReq) {
        return true
      } else {
        return false
      }
    })

    return didPassThreshold.filter((d) => d == true).length
  }

  /**
   * Get the multiplier for a user based on their recent activity days
   * @param guildId The guild ID of the member
   * @param userId The user ID of the member
   * @returns float
   */
  getRecentActivityCombo(guildId: string, userId: string) {
    const prefs = this.guildPrefs[guildId]
    const activeDays = this.getRecentActivity(guildId, userId)
    return activeDays * prefs.xpStreakCombo
  }

  /**
   * Get the placement of a user on the leaderboard based on how much XP they have
   * @param userXp The amount of XP the user has
   * @param guildId The guild to check rank in
   * @returns 
   */
  async getRank(userXp: bigint, guildId: string) {
    return await Haylin.globals.db.guildMember.count({
      where: {
        guildId: guildId,
        xp: {
          gt: userXp
        }
      }
    }) + 1
  }

  /**
   * Get all cached server preferences and cache if not already cached
   * @param guild The target guild to get preferences for
   * @returns guildPrefs
   */
  async getGuildPrefs(guild: Guild) {
    if (!this.guildPrefs[guild.id]) {
      this.lastMsgStore[guild.id]     = {};
      this.msgCooldownStore[guild.id] = {};
      this.cooldownStore[guild.id]    = {};
      if(!(guild.id in this.activityCache)) this.activityCache[guild.id] = {};
      await this.cachePreferences(guild)
    }
    return this.guildPrefs[guild.id]
  }

  /**
   * Give XP to a user
   * @param guild The guild to give XP in
   * @param userId The user to give XP to
   * @param xpAmount The amount of XP to give
   * @param incrementMessages Whever to increment the "messages" counter
   * @returns payload
   */
  async giveXp(guild: Guild, userId: string, xpAmount: number, incrementMessages?: boolean) {
    const prefs = await this.getGuildPrefs(guild)

    // Update activity cache
    if(!(userId in this.activityCache[guild.id])) {
      this.activityCache[guild.id][userId] = []
    }
    await this.cleanupActivityCache(guild.id, userId);

    let allMultipliers = prefs.xpGuildMult + this.getRecentActivityCombo(guild.id, userId)
    let xpToAdd = Math.round(xpAmount * allMultipliers)
    this.activityCache[guild.id][userId].push({time: dayjs().unix(), amount: xpToAdd })
    this.saveActivityCacheToDisk()

    let data: any = {
      xp: {
        increment: xpToAdd
      }
    }

    if(incrementMessages){
      data["xpMessages"] = {
        increment: 1
      }
    }

    if(process.env.NODE_ENV != "production")
      log.log(`${userId} awarded +${data.xp.increment} in ${guild.id} (${allMultipliers}x multiplier)`)

    return await Haylin.globals.db.guildMember.updateMany({
      where: {
        userId,
        guildId: guild.id
      },
      data
    })
  }

  /**
   * Calculate the level of a user based on how much XP they have
   * @param xp The amount of XP the user has as a BigJS number
   * @returns number
   */
  calculateLevel(xp: Big) {
    return xp.div(40).sqrt().round(0, 0).toNumber()
    // return Math.floor(Math.sqrt(xp / 40))
  }
  
  /**
   * Calculate minimum XP required to reach a certain level
   * @param level The target level as a BigJS number
   * @returns BigJS number
   */
  calculateMinXpRequired(level: Big){
    return level.pow(2).round(0, 0).mul(40)
    // return 40 * Math.floor(Math.pow(level, 2))
  }

  /**
   * Run all XP checks and give XP if necessary
   * @param message Discord message to check
   * @returns void
   */
  async runXp(message: Message) {
    if (!message.channel.isText) return;
    if (message.author.bot) return;

    // Cache guild preferences if not already cached
    const prefs = await this.getGuildPrefs(message.guild)

    /*
      CHECK 1
      Guild disable check
    */
    if(!prefs.xpEnabled) return;
    
    /*
      CHECK 2
      Message length minimum
    */
    // Replace emojis with a single character
    const customEmojiRegex = /<a?:.+?:.+?>/gm
    const cleanContent: string = message.content.replace(customEmojiRegex, "E")
    if(cleanContent.length < prefs.xpMinChar) return;

    /*
      CHECK 3
      Repeat message
    */
    const lastMsg = getProperty(this.lastMsgStore[message.guild.id], message.member.id)
    if(lastMsg){
      if(lastMsg == message.content.toLowerCase()) return;
    }

    /*
      CHECK 4
      Messages per minute limit + cooldown
    */
    const timeCooldown = getProperty(this.cooldownStore[message.guild.id], message.member.id) || 0
    const msgCooldown = getProperty(this.msgCooldownStore[message.guild.id], message.member.id) || 0
    if(msgCooldown > prefs.xpMaxMsgPerMin && timeCooldown > dayjs().unix()) return;

    /*
      CHECK 5
      Ban check
    */
    let member = await getGuildMember(message.member);
    if(member.xpBanned) return;

    /*
      CHECK 6
      Blacklisted channel check
    */
    let isBlacklisted = false;
    prefs.xpBListChan.forEach((c: GuildXPBlacklistedChannel) => {
      if(c.channelId == message.channel.id) {
        isBlacklisted = true;
      };
    })
    if(isBlacklisted) return;

    // Assign new XP
    await this.giveXp(message.guild, message.author.id, 10, true)

    // Update cooldowns
    if(timeCooldown < dayjs().unix()){
      this.msgCooldownStore[message.guild.id][message.member.id] = 0
      this.cooldownStore[message.guild.id][message.member.id] = dayjs().add(1, "minute").unix()
    }
    this.msgCooldownStore[message.guild.id][message.member.id] += 1
    
    // See if a user is eligible for an XP boost
    if((member.xpMessages + 1n) % BigInt(prefs.xpBoostMsgAmnt) == 0n && prefs.xpBoostEnabled){
      const xpBoostAmount = Math.floor(Math.random() * prefs.xpBoostMax) + prefs.xpBoostMin;
      await Haylin.globals.db.guildMember.updateMany({
        where: {
          userId: message.member.id,
          guildId: message.guild.id
        },
        data: {
          xp: {
            increment: xpBoostAmount
          }
        }
      })

      message.react("🍰")
    }

    // update member data
    member = await getGuildMember(message.member);
    const level = this.calculateLevel(new Big(member.xp.toString()));

    // find roles that the user is eligible for
    const rolesIsEligible = prefs.xpRoleRewards.map((r: GuildXPRoleReward) => {
      return {
        eligible: (level >= r.level),
        ...r
      }
    })

    if(rolesIsEligible.filter((r: any) => r.eligible).length > 0){
      const highestEligibleRole = rolesIsEligible
        .filter((r: any) => r.eligible)
        .sort((a: any, b: any) => b.level - a.level)[0]

      // remove past level roles
      // TODO: make this configurable
      rolesIsEligible.forEach((r: any) => {
        if(r.roleId == highestEligibleRole.roleId) return;

        if(message.member.roles.cache.has(r.roleId)){
          message.member.roles.remove(r.roleId)
        }
      })

      // add eligible role if user dosent have
      if(!message.member.roles.cache.has(highestEligibleRole.roleId)) {
        try {
          await message.member.roles.add(highestEligibleRole.roleId)
        } catch(err) {
          handleErr(err)
          console.log(`failed to add xp role reward - ${err}`)
        }
      }
    }

    await achievements.updateFilteredByEvent(message.member, AchievementEvent.XPGAIN);
  }
}

const xp = new XP();
export default xp;