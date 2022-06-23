import Big from "big.js"
import Discord, { ButtonInteraction, Client, CommandInteraction, Constants, GuildMember, InteractionCollector, MessageEmbed } from "discord.js"
import achievements, { DummyAchievement, parseAchievementBadge } from "../../../classes/system/Achievements"
import Command from "../../../classes/commands/Command"
import Utils from "../../../classes/Utils"
import xp from "../../../classes/features/Xp"
import getGuildMember, { GuildMemberExtras } from "../../../db/utils/getGuildMember"
import { YarnGlobals } from "../../../utils/types.bot"

const utils = new Utils()
const createPageContent = async (interaction: CommandInteraction, globals: YarnGlobals, page: number, profile: GuildMemberExtras): Promise<any> => {
  const user = interaction.options.getUser("user") || interaction.user;
  const take = 10
  const totalPages = Math.ceil(profile.achievements.length / take)
  const data = profile.achievements.slice(take * page, take * (page + 1))

  let mappedDesc: any = data.map(async (d) => {
    let isDummy = false;
    let target = achievements.data.find((a) => (a.id == d.achId));
    if(!target) {
      target = DummyAchievement;
      isDummy = true;
    }

    return `${parseAchievementBadge(target.badge, interaction.guild.id) || ":trophy:"} ${(isDummy) ? `\`${d.achId}\`` : `**${target.name}**`} - ${target.description}`
  })
  mappedDesc = await Promise.all(mappedDesc);

  const finalData: Discord.InteractionReplyOptions = {
    embeds: [
      new MessageEmbed()
        .setAuthor({ name: ` ${user.username}'s achievements`, url: interaction.user.avatarURL({ format: "png" }) })
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

export default async (client: Client, interaction: CommandInteraction, globals: YarnGlobals) => {
  const user = interaction.options.getUser("user") || interaction.user;

  let member;
  try {
    member = await interaction.guild.members.fetch(user);
  } catch(err) {
    interaction.reply("Error fetching member!");
    return;
  }

  const profile = await getGuildMember(member);

  let page = 0;
  let hasReplied = false;

  const doTheFunny = async () => {
    const content = await createPageContent(interaction, globals, page, profile)

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
  };

  doTheFunny();
};
