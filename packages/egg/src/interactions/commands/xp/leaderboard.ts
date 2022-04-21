import Big from "big.js"
import Discord, { ButtonInteraction, CommandInteraction, Constants, GuildMember, InteractionCollector, MessageEmbed } from "discord.js"
import Command from "../../../classes/Commands/Command"
import Utils from "../../../classes/Utils"
import xp from "../../../classes/Xp"
import { YarnGlobals } from "../../../utils/types"

const utils = new Utils()
const createPageContent = async (interaction: CommandInteraction, globals: YarnGlobals, page: number): Promise<any> => {
  const take = 10
  const userCount = await globals.db.guildMember.count({where: { guildId: interaction.guildId }})
  const totalPages = Math.ceil(userCount / take)

  const data = await globals.db.guildMember.findMany({
    where: {
      guildId: interaction.guildId,
      xp: {
        gt: 0
      }
    },
    orderBy: {
      xp: "desc"
    },
    select: {
      xp: true,
      userId: true
    },
    take,
    skip: page * take
  })

  let mappedDesc: any = data.map(async (d: any) => 
    `#${await xp.getRank(d.xp, interaction.guild.id)} - <@${d.userId}> -  **LVL ${xp.calculateLevel(new Big(d.xp.toString()))}** (${utils.nFormatter(new Big(d.xp.toString()).toNumber(), 3)} XP)`
  )
  mappedDesc = await Promise.all(mappedDesc);

  const finalData: Discord.InteractionReplyOptions = {
    embeds: [
      new MessageEmbed()
        .setAuthor({ name: `XP Leaderboard for ${interaction.guild.name}`, url: interaction.guild.iconURL({ format: "png" }) })
        .setFooter({ text: `Page ${page + 1}/${totalPages}` })
        .setDescription(mappedDesc.join("\n"))
        .setColor(0xff0b17)
    ]
  }
  return {
    content: finalData,
    isLastPage: (data.length < take)
  };
}

const Cmd = new Command({
    enabled: true,
    name: "leaderboard",
    description: "View the XP leaderboard",
    options: [
    ]
}, async (client, interaction, globals) => {
  let page = 0;
  let hasReplied = false;

  const doTheFunny = async () => {
    const content = await createPageContent(interaction, globals, page)

    const backBtn = new Discord.MessageButton()
      .setCustomId(`back`)
      .setLabel(`<- Page ${page}`)
      .setStyle("PRIMARY")
      .setDisabled((page == 0))

    const nextBtn = new Discord.MessageButton()
      .setCustomId("next")
      .setLabel(`Page ${page + 2} ->`)
      .setStyle("PRIMARY")
      .setDisabled(content.isLastPage)

    let message;
    if(!hasReplied) {
      message = await interaction.reply({...content.content, components: [new Discord.MessageActionRow().addComponents([backBtn, nextBtn])]})
      hasReplied = true
    } else {
      message = await interaction.editReply({...content.content, components: [new Discord.MessageActionRow().addComponents([backBtn, nextBtn])]})
    }

    const collector = new InteractionCollector(client, {
      guild: interaction.guild,
      message: message,
      time: 20000
    })

    collector.on('collect', async (collectedInteraction) => {
      if(!collectedInteraction.isButton()) return;
      if(collectedInteraction.user.id != interaction.user.id) return;

      switch(collectedInteraction.customId){
        case "next":
          if(content.isLastPage) return;
          page++;
          break;

        case "back":
          if(page == 0) return;
          page--;
          break;
      }

      await collectedInteraction.update({});

      collector.stop();
      doTheFunny()
    })

    collector.on('end', async (collected) => {
      if(collected.size == 0) {

        const dummyBackBtn = new Discord.MessageButton()
          .setCustomId("back_dummy")
          .setLabel(`<- Page ${page}`)
          .setStyle("PRIMARY")
          .setDisabled(true)
  
        const dummyNextBtn = new Discord.MessageButton()
          .setCustomId("next_dummy")
          .setLabel(`Page ${page + 2} ->`)
          .setStyle("PRIMARY")
          .setDisabled(true)
  
        await interaction.editReply({
          ...content.content, components: [new Discord.MessageActionRow().addComponents([dummyBackBtn, dummyNextBtn])]
        })
      }
    })
  }

  doTheFunny();
})

export default Cmd