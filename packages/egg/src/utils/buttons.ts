import Discord from 'discord.js';

const deleteBtn = new Discord.MessageButton()
.setStyle("DANGER")
.setLabel("Yes")
.setEmoji("✅")
.setCustomId("yes")

const noBtn = new Discord.MessageButton()
.setStyle("SECONDARY")
.setLabel("No!")
.setEmoji("❎")
.setCustomId("no")

export {
  deleteBtn,
  noBtn
}