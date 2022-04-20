import axios from "axios";
import path from 'path';
import Discord, { ButtonInteraction, Constants, GuildMember, MessageAttachment, MessageEmbed } from "discord.js"
import Command from "../../../classes/Commands/Command"
import { createCanvas, registerFont, Image, Canvas, loadImage } from 'canvas';
import getGuildMember from "../../../db/utils/getGuildMember";
import Xp from '../../../classes/Xp';
import Big from "big.js";
import getGuild from "../../../db/utils/getGuild";

registerFont(
  path.join(__dirname, "../../../../assets/fonts/Montserrat-Regular.ttf"), 
  {
    family: "Montserrat",
    weight: "400",
  }
)

registerFont(
  path.join(__dirname, "../../../../assets/fonts/Montserrat-ExtraBold.ttf"), 
  {
    family: "Montserrat",
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
function nFormatter(num: number, digits: number) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

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
    console.log(err)
    return interaction.reply(`Error fetching your server profile!`)
  }

  const guildProfile = await getGuild(interaction.guild)
  if(!guildProfile.xpEnabled) return interaction.reply(`XP is currently disabled`)
  const targetProfile = await getGuildMember(target);
  const level = Xp.calculateLevel(new Big(targetProfile.xp.toString()));

  // globals.db.guildMember.findMany({
  //   where: {
  //     guildId: interaction.guild.id
  //   }
  // })

  const rankCard = createCanvas(1000, 210);
  const ctx = rankCard.getContext('2d');

  // bg
  ctx.fillStyle = "#000"
  roundRect(ctx, 0, 0, 1000, 210, 8, true)

  // pfp
  const pfp = await loadImage(target.displayAvatarURL({ size: 64, format: "png" }))
  ctx.drawImage(roundPfp(pfp), 32, 32, 64, 64)
  
  // username
  ctx.fillStyle = "#fff"
  ctx.font = '800 50px Montserrat'
  const usernameMeasure = ctx.measureText(target.user.username);
  const usernameY = 32 + (64 / 2) + (32 / 2)
  ctx.fillText(target.user.username, 32 + 64 + 16, usernameY)
  
  // discrim
  ctx.fillStyle = "#CECECE"
  ctx.font = '400 36px Montserrat'
  const discrimMeasure = ctx.measureText("#" + target.user.discriminator);
  ctx.fillText("#" + target.user.discriminator, 32 + 64 + 16 + usernameMeasure.width + 4, usernameY)
  
  // rank num
  let dummyRank = "000"
  ctx.fillStyle = "#fff"
  ctx.font = '800 50px Montserrat'
  const rankMeasure = ctx.measureText(dummyRank);
  const rankWidth = rankCard.width - 32 - rankMeasure.width;
  ctx.fillText(dummyRank, rankCard.width - 32 - rankMeasure.width, usernameY)
  
  // rank #
  ctx.font = '400 50px Montserrat'
  const hashMeasure = ctx.measureText("#");
  const hashWidth = rankWidth - hashMeasure.width - 2
  ctx.fillText("#", hashWidth, usernameY)
  
  // level num
  ctx.font = '800 50px Montserrat'
  const lvlNumMeasure = ctx.measureText(level.toString());
  const lvlNumWidth = hashWidth - 42 - lvlNumMeasure.width;
  ctx.fillText(level.toString(), lvlNumWidth, usernameY)
  
  // level LVL
  ctx.font = '400 50px Montserrat'
  const lvlTextMeasure = ctx.measureText("LVL");
  const lvlTextWidth = lvlNumWidth - 10 - lvlTextMeasure.width;
  ctx.fillText("LVL", lvlTextWidth, usernameY)
  
  // base bar
  ctx.fillStyle = "#242424"
  roundRect(ctx, 32, rankCard.height - 100, 935, 64, 40, true)
  
  // filled bar
  let xpPercent = new Big(targetProfile.xp.toString())
  .div(
    Xp.calculateMinXpRequired(
      new Big(level).add(1)
    )
  )
  .toNumber()

  xpPercent = Math.max(xpPercent, 0.1)
  
  const filledBarWidth = xpPercent * 935

  const exylGradient = ctx.createLinearGradient(0, 0, filledBarWidth, 0);
  exylGradient.addColorStop(0, "#FF5B03")
  exylGradient.addColorStop(1, "#FF0B17")
  ctx.fillStyle = exylGradient
  roundRect(ctx, 32, rankCard.height - 100, filledBarWidth, 64, 40, true)
  
  // XP amount
  let xpAmount = nFormatter(new Big(targetProfile.xp.toString()).toNumber(), 3)
  ctx.fillStyle = "#fff"
  ctx.font = '800 36px Montserrat'
  const xpAmountMeasure = ctx.measureText(xpAmount);
  ctx.fillText(xpAmount, 32 + 26, rankCard.height - 100 + 34 + 10)
  
  // XP text
  ctx.font = '400 36px Montserrat'
  ctx.fillText("XP", 32 + 26 + xpAmountMeasure.width + 8, rankCard.height - 100 + 34 + 10)

  // Required text
  ctx.font = '400 36px Montserrat'
  ctx.fillText("XP", 32 + 26 + xpAmountMeasure.width + 8, rankCard.height - 100 + 34 + 10)

  // Required text
  ctx.font = '400 18px Montserrat'
  const requiredMeasure = ctx.measureText("Required")
  ctx.fillText("required", rankCard.width - 32 - requiredMeasure.width - 26, rankCard.height - 100 + 34 + 5)

  // Required XP
  let requiredXp = Xp.calculateMinXpRequired(new Big(level).add(1)).sub(new Big(targetProfile.xp.toString()))
  let formattedRequired = nFormatter(requiredXp.toNumber(), 3)
  ctx.font = '800 18px Montserrat'
  const requireXpMeasure = ctx.measureText(formattedRequired)
  ctx.fillText(formattedRequired, rankCard.width - 32 - requiredMeasure.width - requireXpMeasure.width - 30, rankCard.height - 100 + 34 + 5)


  const file = new MessageAttachment(rankCard.toBuffer());

  interaction.reply({
    files: [file]
  });

})

export default Cmd