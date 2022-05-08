import Discord, { Guild, Message, ReactionEmoji, TextChannel, User } from "discord.js"
import dayjs from "dayjs";
import { YarnGlobals } from "./types";
import getGuild from "../db/utils/getGuild";
import Log from "../classes/Log";
import ratioInsults from './ratioInsults';
import xp from "../classes/Xp";
import achievements, { AchievementEvent } from "../classes/Achievements";
import getGuildMember from "../db/utils/getGuildMember";

const ratioLog = new Log({prefix: "RatioBattles"})
const ratioEmoji = "👍"
const ratioCooldown = 30 * 60 * 1000; // 30m
let lastRatioTimestamp: Map<string, number> = new Map<string, number>();

const prompt_words = [
  "ratio",
  "cope",
  "counter ratio",
  "counter-ratio",
  "counter"
]

/**
 * Detect ratios
 */
export default async (message: Discord.Message, client: Discord.Client, globals: YarnGlobals) => {
  if (!message.channel.isText) return;
  if (message.author.bot) return;
  if ((message.channel as TextChannel).name !== "chat") return;

  if (!prompt_words.some(w => message.content.toLowerCase().startsWith(w))) return;
  if (!message.reference) return;

  const counter = await message.fetchReference();
  if (message.createdTimestamp - counter.createdTimestamp > 5 * 60000) return;
  if (counter.author.bot) return;
  if (counter.author.id == message.author.id) return;
  if (!prompt_words.some(w => counter.content.toLowerCase().startsWith(w))) return;


  if (
    lastRatioTimestamp.has(message.guild.id) &&
    message.createdTimestamp - lastRatioTimestamp.get(message.guild.id) < ratioCooldown
  ) return;

  const guild = await getGuild(message.guild);
  if(!guild.rbEnabled) return;

  message.react(ratioEmoji);
  counter.react(ratioEmoji);

  lastRatioTimestamp.set(message.guild.id, dayjs().valueOf());
  const promptMessage = await message.channel.send(`**Ratio battle started!** Declare the winner by reacting with :+1:`);

  const declareWinner = async () => {
    try {
      await promptMessage.delete();
    } catch(err) {
      console.log(err)
    }
    
    const originalRatios = message.reactions.resolve(ratioEmoji).count;
    const counterRatios = counter.reactions.resolve(ratioEmoji).count;

    if(originalRatios == 1 && counterRatios == 1) {
      const profile1 = await getGuildMember(counter.member);
      const profile2 = await getGuildMember(message.member);
      await achievements.giveAchievement(profile1, 'eggbot:ghosted');
      await achievements.giveAchievement(profile2, 'eggbot:ghosted');
    }

    let loser = (originalRatios > counterRatios) ? counter : message;
    let winner = (originalRatios > counterRatios) ? message : counter;

    // rigging code: DO NOT UNCOMMENT
    // let rigged = false;
    // if(loser.author.id == "577743466940071949") {
    //   let temp = winner;
    //   winner = loser;
    //   loser = temp;
    //   rigged = true;
    // }

    const theFunnyNumber = Math.round(Math.random() * 7) + 1;

    let insultArr = ratioInsults.slice(); // clone array 
    let insults = '';
    
    for(let i = 0; i < theFunnyNumber; i++){
      let insult = insultArr[Math.floor(Math.random()*insultArr.length)];
      insults += ` + ${insult}`
      insultArr.splice(insultArr.indexOf(insult), 1)
    }

    loser.reply({content: `ratio${insults}`})

    // if(rigged) return;
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

export {
  lastRatioTimestamp,
  ratioCooldown
}