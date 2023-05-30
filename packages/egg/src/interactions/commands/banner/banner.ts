import axios from "axios";
import dayjs from "dayjs";
import Discord, { Constants, Permissions } from "discord.js"
import { Haylin } from "../../../index";
import Command from "../../../classes/commands/Command"
import { updateBannerForGuild } from "../../../jobs/JobSetBanner";
import getGuild from "../../../db/utils/getGuild";
import { imgur } from "../../../utils/apis";


const Cmd = new Command({
    enabled: true,
    name: "banner",
    description: "Change the banner dynamically with an Imgur album",
    restrict: true,
    options: [
      {
        name: "toggle",
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        description: "Toggle Dynamic Banner from being made"
      },
      {
        name: "setalbumid",
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        description: "Set the Imgur album ID for Dynamic Banner",
        options: [
          {
            name: "albumid",
            type: Constants.ApplicationCommandOptionTypes.STRING,
            description: "The Imgur album ID",
            required: true
          }
        ]
      }
    ]
}, async (client, interaction, globals) => {
  const guild = await getGuild(interaction.guild);

  switch(interaction.options.getSubcommand()){
    case "toggle":
      let newState = !guild.bannerEnabled
      await globals.db.guild.update({
        where: { id: guild.id },
        data: {
          bannerEnabled: {
            set: newState
          }
        }
      })
      interaction.reply(`✅ Dynamic Banner is now ${(newState) ? "enabled": "disabled"}`)
      break;

    case "setalbumid":
      const albumId = interaction.options.getString("albumid", true)

      const res = await imgur.get(`https://api.imgur.com/3/album/${albumId}/images`)

      if(res.status !== 200) {
        return interaction.reply(`❌ There was an error fetching the album`)
      }

      const albumImages = res.data.data

      if(albumImages.length === 0) {
        return interaction.reply(`❌ The album is empty`)
      }

      await globals.db.guild.update({
        where: { id: guild.id },
        data: {
          bannerEnabled: {
            set: true
          },
          bannerAlbumId: {
            set: albumId
          }
        }
      })

      await updateBannerForGuild(interaction.guild)

      interaction.reply(`✅ Dynamic Banner has been set to the album ${albumId}`)
      break;
  }
})


export default Cmd