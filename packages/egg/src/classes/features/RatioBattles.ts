import Discord, { Guild, Message, ReactionEmoji, TextChannel, User } from "discord.js"
import dayjs from "dayjs";
import { YarnGlobals } from "../../utils/types.bot";
import getGuild from "../../db/utils/getGuild";
import Log from "../system/Log";
import ratioInsults from '../../static/ratioInsults';
import xp from "./Xp";
import achievements, { AchievementEvent } from "../system/Achievements";
import getGuildMember from "../../db/utils/getGuildMember";
import { handleErr } from "../../utils/ErrorHandler";

const ratioLog = new Log({prefix: "RatioBattles"})
const ratioCooldown = 30 * 60 * 1000; // 30m
const ratioEmoji = "👍"
const ratioPromptWords = [
  "ratio",
  "cope",
  "counter ratio",
  "counter-ratio",
  "counter"
]

class Ratio {
  recentTimestamp: Map<string, number>;

  constructor() {
    this.recentTimestamp = new Map<string, number>();
  }

  async runRatio(message: Discord.Message, client: Discord.Client, globals: YarnGlobals) {
      if (!message.channel.isText) return;
      if (message.author.bot) return;
      if ((message.channel as TextChannel).name !== "chat") return;
    
      if (!ratioPromptWords.some(w => message.content.toLowerCase().startsWith(w))) return;
      if (!message.reference) return;
    
      const counter = await message.fetchReference();
      if (message.createdTimestamp - counter.createdTimestamp > 5 * 60000) return;
      if (counter.author.bot) return;
      if (counter.author.id == message.author.id) return;
      if (!ratioPromptWords.some(w => counter.content.toLowerCase().startsWith(w))) return;
    
    
      if (
        this.recentTimestamp.has(message.guild.id) &&
        message.createdTimestamp - this.recentTimestamp.get(message.guild.id) < ratioCooldown
      ) return;
    
      const guild = await getGuild(message.guild);
      if(!guild.rbEnabled) return;
    
      message.react(ratioEmoji);
      counter.react(ratioEmoji);
    
      this.recentTimestamp.set(message.guild.id, dayjs().valueOf());
      const promptMessage = await message.channel.send(`**Ratio battle started!** Declare the winner by reacting with :+1:`);
    
      const declareWinner = async () => {
        try {
          await promptMessage.delete();
        } catch(err) {
          handleErr(err)
          message.channel.send("Unfortunately, the bot ran into an error and the ratio battle had to be cancelled :(")
        }
        
        const originalRatios = message.reactions.resolve(ratioEmoji).count;
        const counterRatios = counter.reactions.resolve(ratioEmoji).count;
    
        if(originalRatios == 1 && counterRatios == 1) {
          await achievements.giveAchievement(await getGuildMember(counter.member), 'eggbot:ghosted');
          await achievements.giveAchievement(await getGuildMember(message.member), 'eggbot:ghosted');
        }
    
        let loser = (originalRatios > counterRatios) ? counter : message;
        let winner = (originalRatios > counterRatios) ? message : counter;

        const theFunnyNumber = Math.round(Math.random() * 7) + 1;
    
        let insultArr = ratioInsults.slice(); // clone array 
        let insults = '';
        
        for(let i = 0; i < theFunnyNumber; i++){
          let insult = insultArr[Math.floor(Math.random()*insultArr.length)];
          insults += ` + ${insult}`
          insultArr.splice(insultArr.indexOf(insult), 1)
        }
    
        loser.reply({content: `ratio${insults}`})
    
        await globals.db.guild.update({
          where: { id: guild.id },
          data: {
            rbResults: {
              create: {
                messageId: winner.id.toString(),
                winnerId: winner.author.id.toString(),
                loserId: loser.author.id.toString(),
                insults: theFunnyNumber,
                timestamp: new Date()
              }
            }
          }
        })
        ratioLog.log(`Ratio won by ${winner.author.username}#${winner.author.discriminator} (${winner.author.id}) and lost by ${loser.author.username}#${loser.author.discriminator} (${loser.author.id}) (message ${winner.id})`)
        
        if(guild.xpRbEnabled) {
          await xp.giveXp(message.guild, winner.author.id, guild.xpRbAmount)
        }
    
        await achievements.updateFilteredByEvent(winner.member, AchievementEvent.RATIO);
      }
    
      setTimeout(declareWinner, 10 * 1000)
  }
}


const ratioBattles = new Ratio();

export {
  ratioBattles,
  ratioCooldown,
  ratioEmoji,
  ratioPromptWords
}