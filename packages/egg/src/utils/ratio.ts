import Discord, { Guild, Message, ReactionEmoji, TextChannel, User } from "discord.js"
import dayjs from "dayjs";
import { YarnGlobals } from "./types";
import getGuild from "../db/utils/getGuild";
import Log from "../classes/Log";

const RATIO_INSULTS = [
  "Probably subscribed to Dalux",
  "Bozo", 
  "You fell off", 
  "You're\*", 
  "Genshinner",
  "Take a shower",
  "💀",
  "Das why yo momma ded",
  "Ratio^2",
  "L",
  "Seethe",
  "Mald",
  "Cope",
  "2 Followers",
  "Source?",
  "Go Outside",
  "Any Askers?",
  "Beaned",
  "Admin-chan isn't real",
  "Not funny, didn't laugh",
  "Banned",
  "Skill Issue",
  "Marwan's Idea",
  "eateing chips chrongch cronc mm",
  "Dalux Blob",
  "Yamm did it better",
  "Ratio failure",
  "DND on",
  "Take a bath",
  "Probably doesn't listen to Creo",
  "Anime pfp",
  "Can't join VIP vc",
  "Omelette eater",
  "ok and?",
  "touch grass",
  "dosen't follow Dalux News",
  "cancelled on Dalux News",
  "cancelled on Twitter dot com",
  "bonk",
  "Blocked",
  "Banned",
  "Reported",
  "Uncollabed",
  "Unfollowed"
]

const ratioLog = new Log({prefix: "RatioBattles"})
const ratioEmoji = "👍"
const ratioCooldown = 30 * 60 * 1000; // 30m
let lastRatioTimestamp: Map<Guild, number> = new Map<Guild, number>();

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
    lastRatioTimestamp.has(message.guild) &&
    message.createdTimestamp - lastRatioTimestamp.get(message.guild) < ratioCooldown
  ) return;

  const guild = await getGuild(message.guild);
  if(!guild.rbEnabled) return;

  message.react(ratioEmoji);
  counter.react(ratioEmoji);

  lastRatioTimestamp.set(message.guild, dayjs().valueOf());
  const promptMessage = await message.channel.send(`**Ratio battle started!** Declare the winner by reacting with :+1:`);

  const declareWinner = async () => {
    try {
      await promptMessage.delete();
    } catch(err) {
      console.log(err)
    }
    
    const originalRatios = message.reactions.resolve(ratioEmoji).count;
    const counterRatios = counter.reactions.resolve(ratioEmoji).count;
    let rigged = false;


    let loser = (originalRatios > counterRatios) ? counter : message;
    let winner = (originalRatios > counterRatios) ? message : counter;

    // rigging code
    // if(loser.author.id == "577743466940071949") {
    //   let temp = winner;
    //   winner = loser;
    //   loser = temp;
    //   rigged = true;
    // }

    const theFunnyNumber = Math.round(Math.random() * 7) + 1;

    let V_RATIO_INSULTS = RATIO_INSULTS.slice(); // clone array 
    let insults = '';
    
    for(let i = 0; i < theFunnyNumber; i++){
      let insult = V_RATIO_INSULTS[Math.floor(Math.random()*V_RATIO_INSULTS.length)];
      insults += ` + ${insult}`
      V_RATIO_INSULTS.splice(V_RATIO_INSULTS.indexOf(insult), 1)
    }

    loser.reply({content: `ratio${insults}`})

    if(rigged) return;
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
  }

  setTimeout(declareWinner, 10 * 1000)
}

export {
  lastRatioTimestamp,
  ratioCooldown
}