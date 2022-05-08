import { Guild, Message } from 'discord.js';
import getGuild from '../db/utils/getGuild';
import getGuildMember from '../db/utils/getGuildMember';
import dayjs from 'dayjs';
import { bot } from '../index'; 
import Big from 'big.js';
import { GuildXPBlacklistedChannel } from '@prisma/client';
import Log from './Log';
import achievements, { AchievementEvent } from './Achievements';

const log = new Log({ prefix: "XP" })

const getProperty = (obj: any, key: any) => {
  if(!obj) return undefined;
  if(!obj.hasOwnProperty(key)) return undefined;
  else return obj[key];
}

interface IGuildStore<T> {
  [guildId: string]: T;
}

interface IGuildUserStore<T> {
  [guildId: string]: {
    [userId: string]: T;
  }
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
  
  constructor() {
    this.guildPrefs = {};
    this.cooldownStore = {};
    this.msgCooldownStore = {};
    this.lastMsgStore = {};
    this.activityCache = {};
  }

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

  getRecentActivityCombo(guildId: string, userId: string) {
    const prefs = this.guildPrefs[guildId]
    const activeDays = this.getRecentActivity(guildId, userId)
    return activeDays * prefs.xpStreakCombo
  }

  async getRank(userXp: bigint, guildId: string) {
    return await bot.globals.db.guildMember.count({
      where: {
        guildId: guildId,
        xp: {
          gt: userXp
        }
      }
    }) + 1
  }

  async getGuildPrefs(guild: Guild) {
    if (!this.guildPrefs[guild.id]) {
      this.lastMsgStore[guild.id]     = {};
      this.msgCooldownStore[guild.id] = {};
      this.cooldownStore[guild.id]    = {};
      this.activityCache[guild.id]    = {};
      await this.cachePreferences(guild)
    }
    return this.guildPrefs[guild.id]
  }

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

    return await bot.globals.db.guildMember.updateMany({
      where: {
        userId,
        guildId: guild.id
      },
      data
    })
  }

  calculateLevel(xp: Big) {
    return xp.div(40).sqrt().round(0, 0).toNumber()
    // return Math.floor(Math.sqrt(xp / 40))
  }
  
  calculateMinXpRequired(level: Big){
    return level.pow(2).round(0, 0).mul(40)
    // return 40 * Math.floor(Math.pow(level, 2))
  }

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
      await bot.globals.db.guildMember.updateMany({
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

    (prefs.xpRoleRewards as any[]).forEach((r: any) => {
      if(r.level <= level) {
        try {
          message.member.roles.add(r.roleId)
        } catch(err) {
          console.log(`failed to add xp role reward - ${err}`)
        }
      }
    })

    await achievements.updateFilteredByEvent(message.member, AchievementEvent.XPGAIN);
  }
}

const xp = new XP();
export default xp;