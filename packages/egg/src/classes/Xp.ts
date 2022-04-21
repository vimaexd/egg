import { Guild, Message } from 'discord.js';
import getGuild from '../db/utils/getGuild';
import getGuildMember from '../db/utils/getGuildMember';
import dayjs from 'dayjs';
import { bot } from '../index'; 
import Big from 'big.js';
import { GuildXPBlacklistedChannel } from '@prisma/client';

const undefinedKeyValueUtil = (obj: any, key: any) => {
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

class XP {
  guildPrefs: IGuildStore<any>;
  cooldownStore: IGuildUserStore<number>;
  msgCooldownStore: IGuildUserStore<number>;
  lastMsgStore: IGuildUserStore<string>;
  
  constructor() {
    this.guildPrefs = {};
    this.cooldownStore = {};
    this.msgCooldownStore = {};
    this.lastMsgStore = {};
  }

  async cachePreferences(target: Guild) {
    const guild: any = await getGuild(target);
    const prefKeys = Object.keys(guild).filter(k => k.startsWith("xp"));
    const prefs = prefKeys.reduce((obj: any, cur: string) => ({...obj, [cur]: guild[cur]}), {})
    this.guildPrefs[guild.id] = prefs;
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
    if (!this.guildPrefs[message.guild.id]) {
      this.lastMsgStore[message.guild.id]     = {};
      this.msgCooldownStore[message.guild.id] = {};
      this.cooldownStore[message.guild.id]    = {};
      await this.cachePreferences(message.guild)
    }

    const prefs = this.guildPrefs[message.guild.id]

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
    const lastMsg = undefinedKeyValueUtil(this.lastMsgStore[message.guild.id], message.member.id)
    if(lastMsg){
      if(lastMsg == message.content.toLowerCase()) return;
    }

    /*
      CHECK 4
      Messages per minute limit + cooldown
    */
    const timeCooldown = undefinedKeyValueUtil(this.cooldownStore[message.guild.id], message.member.id) || 0
    const msgCooldown = undefinedKeyValueUtil(this.msgCooldownStore[message.guild.id], message.member.id) || 0
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
    await bot.globals.db.guildMember.updateMany({
      where: {
        userId: message.member.id,
        guildId: message.guild.id
      },
      data: {
        xp: {
          increment: 10
        },
        xpMessages: {
          increment: 1
        }
      }
    })

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
  }
}

const xp = new XP();
export default xp;