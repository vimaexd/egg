import Command from "@blob/classes/commands/Command"
import Portal from "@blob/classes/features/Portal";
import dayjs from "dayjs";
import { Constants, InteractionCollector, MessageActionRow, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from "discord.js";

const genRandomCode = (length = 6) => {
  let code = "";
  for(let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}


const Cmd = new Command({
    enabled: true,       
    name: "portal",
    description: "Configure a server portal from one channel to another.",
    restrict: true,
    options: [
      {
        name: "setup",
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        description: "Setup a portal.",
        options: [
          {
            name: "from",
            type: Constants.ApplicationCommandOptionTypes.CHANNEL,
            description: "The channel to portal from.",
            required: true
          },
        ]
      },
      {
        name: "link",
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        description: "Link a portal with a link code",
        options: [
          {
            name: "linkcode",
            type: Constants.ApplicationCommandOptionTypes.STRING,
            description: "The link code you got from the /portal setup command.",
            required: true
          },
          {
            name: "to",
            type: Constants.ApplicationCommandOptionTypes.CHANNEL,
            description: "The channel to portal to.",
            required: true
          }
        ]
      },
      {
        name: "unlink",
        type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
        description: "Open an interactive prompt to remove a portal link",
        options: []
      },
    ]
}, async (client, interaction, globals) => {
  const allowedChannelTypes: string[] = [
    "GUILD_TEXT",
    "GUILD_NEWS"
  ]

  switch (interaction.options.getSubcommand()) {
    case "setup":
      const _from = interaction.options.getChannel("from");
      
      let from;
      try {
        from = interaction.guild.channels.cache.get(_from.id);
      } catch(err) {
        return interaction.reply({ content: "⚠️ Error fetching the channel to portal from! Did you enter a valid channel?", ephemeral: true });
      }

      if(!allowedChannelTypes.includes(from.type)) 
        return interaction.reply({ content: "❌ The channel you provided is not a text or announcement channel.", ephemeral: true });

      if(!from.permissionsFor(interaction.guild.members.me).has("VIEW_CHANNEL")) {
        return interaction.reply({ 
          content: "📃 I can't view that channel! Please give me the View Channel permission or pick a different channel.", 
          ephemeral: true 
        });
      }

      if(!from.permissionsFor(interaction.guild.members.me).has("MANAGE_WEBHOOKS")) {
        return interaction.reply({ 
          content: "📃 I can't send messages in that channel! Please give me the Manage Webhooks permission or pick a different channel.", 
          ephemeral: true 
        });
      }

      const amountChannel = await globals.db.portalRelationship.findMany({
        where: {
          OR: [
            {
              guildIdA: from.guild.id,
              channelA: from.id,
            },
            {
              guildIdB: from.guild.id,
              channelB: from.id,
            }
          ]
        }
      })

      if(amountChannel.length > 15){
        return interaction.reply({
          content: "❌ You can't link more than 15 portals to a single channel! Please remove a link and try again",
          ephemeral: true
        })
      }

      let code = "";
      while(code == "") {
        const potential_code = genRandomCode();
        if(code in Portal.linkCodes) continue;
        code = potential_code;
      }

      Portal.linkCodes[code] = {
        fromChannelId: from.id,
        fromServerId: from.guild.id,
        expires: dayjs().add(5, "minutes")
      };

      const setupEmbed = new MessageEmbed()
        .setTitle("Portal Setup")
        .setDescription(`⏭️ Your link code is \`${code}\`. Please run /portal link <linkcode> <to> in the channel/server you want to link to.`)
        .setColor("BLURPLE")

      return interaction.reply({ embeds: [setupEmbed], ephemeral: true });
      break;

    case "link":
      const linkcode = interaction.options.getString("linkcode");
      const _to = interaction.options.getChannel("to");

      let to;
      try {
        to = interaction.guild.channels.cache.get(_to.id);
      } catch(err) {
        return interaction.reply({ content: "⚠️ Error fetching the channel to portal to! Did you enter a valid channel?", ephemeral: true });
      }
      
      if(!allowedChannelTypes.includes(to.type)) 
        return interaction.reply({ content: "❌ The channel you provided is not a text or announcement channel.", ephemeral: true });

      if(!to.permissionsFor(interaction.guild.me).has("VIEW_CHANNEL")) {
        return interaction.reply({ 
          content: "📃 I can't view that channel! Please give me the View Channel permission or pick a different channel.", 
          ephemeral: true 
        });
      }

      if(!to.permissionsFor(interaction.guild.me).has("MANAGE_WEBHOOKS")) {
        return interaction.reply({ 
          content: "📃 I can't manage webhooks in that channel! Please give me the Manage Webhooks permission or pick a different channel.", 
          ephemeral: true 
        });
      }

      if(!Portal.linkCodes.hasOwnProperty(linkcode))
        return interaction.reply({ content: "❌ That link code is invalid! Please make sure you entered it correctly.", ephemeral: true });
      
      const linkFrom = interaction.client.guilds.cache.get(Portal.linkCodes[linkcode].fromServerId).channels.cache.get(Portal.linkCodes[linkcode].fromChannelId);
      if(!linkFrom) return interaction.reply({ content: "❌ That link code is invalid! Please make sure you entered it correctly.", ephemeral: true });


      //
      // from here, the linkcode is delete in the Portal.linkCodes object
      // DO NOT DO ANYTHING THAT WOULD REQUIRE THE LINKCODE AFTER THIS POINT
      //
      delete Portal.linkCodes[linkcode];
      
      if(!linkFrom.permissionsFor(interaction.guild.me).has("MANAGE_WEBHOOKS")) {
        return interaction.reply({ 
          content: "📃 I can't manage webhooks in the channel you're trying to link **from**! \
          Please give me the send messages permission or generate a new link code with a different channel.", 
          ephemeral: true 
        });
      }

      const amountLinkedToChannel = await globals.db.portalRelationship.findMany({
        where: {
          OR: [
            {
              guildIdA: linkFrom.guild.id,
              channelA: linkFrom.id,
            },
            {
              guildIdB: linkFrom.guild.id,
              channelB: linkFrom.id,
            }
          ]
        }
      })

      if(amountLinkedToChannel.length > 15){
        return interaction.reply({
          content: "❌ You can't link more than 15 portals to a single channel! Please remove a link and try again",
          ephemeral: true
        })
      }

      const portalExists = await globals.db.portalRelationship.findFirst({
        where: {
          OR: [
            {
              guildIdA: linkFrom.guild.id,
              channelA: linkFrom.id,
              guildIdB: interaction.guild.id,
              channelB: to.id
            },
            {
              guildIdB: linkFrom.guild.id,
              channelB: linkFrom.id,
              guildIdA: interaction.guild.id,
              channelA: to.id
            }
          ]
        }
      })

      if(portalExists)
        return interaction.reply({ content: "❌ A portal between these two channels already exists!", ephemeral: true });

      await globals.db.portalRelationship.create({
        data: {
          guildIdA: linkFrom.guild.id,
          channelA: linkFrom.id,
          guildIdB: interaction.guild.id,
          channelB: to.id
        }
      })

      Portal.updateCache()

      const linkedEmbed = new MessageEmbed()
      .setTitle("Portal Setup")
      .setDescription(`✅ Portal linked! Messages from each channel will now be posted in the channel it is linked to.`)
      .setColor(0x57F287);

      return interaction.reply({ embeds: [linkedEmbed], ephemeral: true });
      break;

    case "unlink":
      const linksToServer = await globals.db.portalRelationship.findMany({
        where: {
          OR: [
            {
              guildIdA: interaction.guild.id,
            },
            {
              guildIdB: interaction.guild.id,
            }
          ]
        }
      })

      if(linksToServer.length == 0) {
        return interaction.reply({ content: "❌ There are no portals linked to channels in this server!", ephemeral: true });
      }
      

      const menu = new MessageSelectMenu()
        .setCustomId("unlink_portal")
        .setPlaceholder("Select a portal to unlink")
        .addOptions(linksToServer.map((link) => {
          const guildA = interaction.client.guilds.cache.get(link.guildIdA);
          const channelA = guildA.channels.cache.get(link.channelA);

          const guildB = interaction.client.guilds.cache.get(link.guildIdB);
          const channelB = guildB.channels.cache.get(link.channelB);
          
          return {
            label: `#${channelA.name} <--> #${channelB.name}`,
            value: link.id
          }
        }))

      const collector = new InteractionCollector(interaction.client, { 
        componentType: "SELECT_MENU",
        channel: interaction.channel,
        filter: (i) => i.user.id == interaction.user.id,
        time: 30000
      })

      collector.on("collect", async (i: SelectMenuInteraction) => {
        if(!i.isSelectMenu) return;
        if(i.customId != "unlink_portal") return;
        
        // delete from db
        await globals.db.portalRelationship.delete({
          where: {
            id: i.values[0]
          }
        })
        Portal.updateCache()

        const unlinkedEmbed = new MessageEmbed()
          .setTitle("Unlink a portal")
          .setDescription(`🗑️ Portal unlinked! Messages from each channel will no longer be posted in the channel it was linked to.`)
          .setColor("RED");
        
        i.update({ embeds: [unlinkedEmbed], components: [] })
      })

      const linksList = linksToServer.map((link) => {
        const guildA = interaction.client.guilds.cache.get(link.guildIdA);
        const channelA = guildA.channels.cache.get(link.channelA);

        const guildB = interaction.client.guilds.cache.get(link.guildIdB);
        const channelB = guildB.channels.cache.get(link.channelB);

        const boldIfA = (guildA.id == interaction.guild.id) ? "**" : ""
        const boldIfB = (guildB.id == interaction.guild.id) ? "**" : ""
        
        return `#${channelA.name} in ${boldIfA + guildA.name + boldIfA} <--> #${channelB.name} in ${boldIfB + guildB.name + boldIfB}`
      })

      const linksEmbed = new MessageEmbed()
        .setTitle("Unlink a portal")
        .setDescription("Select a portal to unlink from the dropdown below. Clicking an option will **immediately** unlink the portal.")
        .addField("Portals linked to this server:", linksList.join("\n"))
        .setColor("RED")
        
      interaction.reply({ embeds: [linksEmbed], components: [new MessageActionRow().addComponents(menu)] })
      break;
  }
})

export default Cmd;