import axios from "axios";
import path from 'path';
import Discord, { ButtonInteraction, Constants, GuildMember, MessageAttachment, MessageEmbed, Util } from "discord.js"
import Command from "../../../classes/commands/Command"
import { createCanvas, registerFont, Image, Canvas, loadImage } from 'canvas';
import getGuildMember from "../../../db/utils/getGuildMember";
import Xp from '../../../classes/features/Xp';
import Big from "big.js";
import getGuild from "../../../db/utils/getGuild";
import Utils from "../../../classes/Utils";
import { stringyId } from "../../../static/fluteGang";
import betaTesters from "../../../static/betaTesters";
import { handleErr } from "../../../utils/ErrorHandler";
import "@sentry/tracing";
import * as Sentry from "@sentry/node";

const badgeLevels = [
  0, 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80
]


registerFont(
  path.join(__dirname, "../../../../assets/fonts/Metropolis-Regular.otf"), 
  {
    family: "Metropolis",
    weight: "400",
  }
)

registerFont(
  path.join(__dirname, "../../../../assets/fonts/Metropolis-ExtraBold.otf"), 
  {
    family: "Metropolis",
    weight: "800",
  }
)

// https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-using-html-canvas
function roundRect(ctx: any, x: number, y: number, width: number, height: number, radius: any, fill?: boolean, stroke?: boolean) {
  if (typeof stroke === 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    let defaultRadius: any = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}

// https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
const nFormatter = new Utils().nFormatter

function truncateString(str: string, n: number){
  return (str.length > n) ? str.substr(0, n-1) + '...' : str;
};

const roundPfp = (img: Image) => {
  const temp = createCanvas(64, 64);
  const ctx = temp.getContext('2d');
  ctx.beginPath()
  ctx.arc(32, 32, 32, 0, Math.PI * 2, true)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, 0, 0, 64, 64)
  return temp
}

const Cmd = new Command({
    enabled: true,
    name: "rank",
    description: "See your rank",
    options: [
      {
        name: "user",
        type: Constants.ApplicationCommandOptionTypes.USER,
        description: "The user you would like to see the rank of",
        required: false
      },
    ]
}, async (client, interaction, globals) => {
  
  const _target = interaction.options.getUser("user") || interaction.user

  let target;
  try {
    target = await interaction.guild.members.fetch(_target);
  } catch(err) {
    handleErr(err);
    return interaction.reply(`Error fetching your server profile!`)
  }

  const guildProfile = await getGuild(interaction.guild)
  if(!guildProfile.xpEnabled) return interaction.reply(`XP is currently disabled`)

  const transaction = Sentry.startTransaction({
    op: "rankcardgen",
    name: "Rank Card Generation",
    data: {
      interaction: interaction.toJSON()
    },
  })

  const targetProfile = await getGuildMember(target);
  const level = Xp.calculateLevel(new Big(targetProfile.xp.toString()));

  const leaderboardPos = await Xp.getRank(targetProfile.xp, interaction.guild.id)

  const rankCard = createCanvas(1000, 210);
  const ctx = rankCard.getContext('2d');

  let fontFamily = "Metropolis";

  // bg
  ctx.fillStyle = "#0f0f0f"
  roundRect(ctx, 0, 0, 1000, 210, 8, true)

  // pfp
  let pfpSrc = target.displayAvatarURL({ size: 64, format: "png" });
  // if(target.id == stringyId) {
  //   pfpSrc = path.join(__dirname, "../../../../assets/misc/sweeney.png");
  // }
  const pfp = await loadImage(pfpSrc)
  ctx.drawImage(roundPfp(pfp), 32, 32, 64, 64)
  
  // username
  ctx.fillStyle = "#fff"
  if(betaTesters.includes(target.id)) {
    ctx.fillStyle = "#E698FF"
  }

  ctx.font = `800 50px ${fontFamily}`
  const usernameMeasure = ctx.measureText(truncateString(target.user.username, 14));
  const usernameY = 32 + (64 / 2) + (32 / 2)
  ctx.fillText(truncateString(target.user.username, 14), 32 + 64 + 16, usernameY, 480)
  
  // discrim
  ctx.fillStyle = "#CECECE"
  ctx.font = `400 36px ${fontFamily}`
  const discrimMeasure = ctx.measureText("#" + target.user.discriminator);
  ctx.fillText("#" + target.user.discriminator, 32 + 64 + 16 + usernameMeasure.width + 4, usernameY)
  
  // rank num
  switch(leaderboardPos){
    case 1:
      ctx.fillStyle = "#DFB63F"
      break;
    case 2:
      ctx.fillStyle = "#9C9C9C"
      break;
    case 3:
      ctx.fillStyle = "#dd5f44"
      break;
    default: 
      ctx.fillStyle = "#fff"
      break;
  }

  ctx.font = `800 50px ${fontFamily}`
  const rankMeasure = ctx.measureText(leaderboardPos.toString());
  const rankWidth = rankCard.width - 32 - rankMeasure.width - 8;
  ctx.fillText(leaderboardPos.toString(), rankCard.width - 32 - rankMeasure.width, usernameY)
  
  // rank #
  ctx.font = `400 50px ${fontFamily}`
  const hashMeasure = ctx.measureText("#");
  const hashWidth = rankWidth - hashMeasure.width - 2
  ctx.fillText("#", hashWidth, usernameY)
  
  // level num
  ctx.fillStyle = "#fff"
  ctx.font = `800 50px ${fontFamily}`
  const lvlNumMeasure = ctx.measureText(level.toString());
  const lvlNumWidth = hashWidth - 42 - lvlNumMeasure.width;
  ctx.fillText(level.toString(), lvlNumWidth, usernameY)
  
  // level LVL
  ctx.font = `400 50px ${fontFamily}`
  const lvlTextMeasure = ctx.measureText("LVL");
  const lvlTextWidth = lvlNumWidth - 10 - lvlTextMeasure.width;
  ctx.fillText("LVL", lvlTextWidth, usernameY)

  // badge (48*48)
  // const badgeWidth = lvlTextWidth - 12 - 48
  // const normalizedLevel = level - 2 // idfk why it's broken either
  // const closestLevel = badgeLevels
  //   .sort((a, b) => {
  //       return Math.abs(normalizedLevel - a) - Math.abs(normalizedLevel - b);
  //   })
  //   [0]

  // if(closestLevel != 0) {
  //   const badge = await loadImage(path.join(__dirname, `../../../../assets/level_badges/LVL_${closestLevel}.png`))
  //   ctx.drawImage(badge, badgeWidth, usernameY - 48 + 5, 48, 48)
  // }

  const badge = await loadImage(path.join(__dirname, `../../../../assets/blob.png`))
  const badgeWidth = lvlTextWidth - 12 - 48
  ctx.drawImage(badge, badgeWidth, usernameY - 48 + 5, 48, 48)
  
  // base bar
  ctx.fillStyle = "#242424"
  roundRect(ctx, 32, rankCard.height - 100, 935, 64, 40, true)
  
  // filled bar
  let xpPercent = new Big(targetProfile.xp.toString()).minus(Xp.calculateMinXpRequired(new Big(level)))
  .div(
    Xp.calculateMinXpRequired(new Big(level).add(1))
      .minus(Xp.calculateMinXpRequired(new Big(level)))
  )
  .toNumber()

  xpPercent = Math.max(xpPercent, 0.1)
  
  const filledBarWidth = xpPercent * 935

  const gradient = ctx.createLinearGradient(0, 0, filledBarWidth, 0);

  gradient.addColorStop(1, "#f5a5d5")
  gradient.addColorStop(0.63, "#f38db8")
  gradient.addColorStop(0.36, "#f37b83")
  gradient.addColorStop(0.17, "#f7855f")
  gradient.addColorStop(0, "#da6943")

  ctx.fillStyle = gradient
  roundRect(ctx, 32, rankCard.height - 100, filledBarWidth, 64, 40, true)
  
  // XP amount
  let xpAmount = nFormatter(new Big(targetProfile.xp.toString()).toNumber(), 2)
  ctx.fillStyle = "#fff"
  ctx.font = `800 36px ${fontFamily}`
  const xpAmountMeasure = ctx.measureText(xpAmount);
  ctx.fillText(xpAmount, 32 + 26, rankCard.height - 100 + 34 + 10)
  
  // XP text
  ctx.font = `400 36px ${fontFamily}`
  ctx.fillText("XP", 32 + 26 + xpAmountMeasure.width + 8, rankCard.height - 100 + 34 + 10)

  // Required text
  ctx.font = `400 36px ${fontFamily}`
  ctx.fillText("XP", 32 + 26 + xpAmountMeasure.width + 8, rankCard.height - 100 + 34 + 10)

  // Required text
  ctx.font = `400 18px ${fontFamily}`
  const requiredMeasure = ctx.measureText("Required")
  ctx.fillText("required", rankCard.width - 32 - requiredMeasure.width - 26, rankCard.height - 100 + 34 + 5)

  // Required XP
  let requiredXp = Xp.calculateMinXpRequired(new Big(level).add(1)).sub(new Big(targetProfile.xp.toString()))
  let formattedRequired = nFormatter(requiredXp.toNumber(), 2)
  ctx.font = `800 18px ${fontFamily}`
  const requireXpMeasure = ctx.measureText(formattedRequired)
  ctx.fillText(formattedRequired, rankCard.width - 32 - requiredMeasure.width - requireXpMeasure.width - 30, rankCard.height - 100 + 34 + 5)


  const file = new MessageAttachment(rankCard.toBuffer());
  transaction.finish()

  interaction.reply({
    files: [file]
  });

})

export default Cmd