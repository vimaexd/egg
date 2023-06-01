import type { IGuildStore } from "@blob/utils/types.store";
import { PortalRelationship } from "@prisma/client";
import { Haylin } from "@blob/index";
import { CommandInteraction, Guild, Message, MessageAttachment, TextBasedChannel } from "discord.js";
import dayjs from "dayjs";

interface MessagePairCache {
  from: {
    message: string;
    channel: string;
    guild: string;
  };
  to: {
    message: string;
    webhookId: string;
  }
  expires: dayjs.Dayjs;
};

class Portal {
  relationshipCache: PortalRelationship[];
  messagePairCache: MessagePairCache[];
  linkCodes: {[code: string]: {
    fromServerId: string;
    fromChannelId: string;
    expires: dayjs.Dayjs;
  };} // code: channelID

  constructor() {
    this.linkCodes = {};
    this.messagePairCache = [];
    this.updateCache();

    setInterval(() => {
      this._removeExpiredLinkcodes();
      this._removeExpiredMessagePair();
    }, 120000) // 2m
  }

  private async _removeExpiredLinkcodes() {
    const now = dayjs();
    Object.keys(this.linkCodes)
      .forEach((code) => {
        if(this.linkCodes[code].expires.isBefore(now)) {
          delete this.linkCodes[code];
        }
      });
  }

  private async _removeExpiredMessagePair() {
    const now = dayjs();
    this.messagePairCache
      .forEach((pair) => {
        if(pair.expires.isBefore(now)) {
          this.messagePairCache.splice(this.messagePairCache.indexOf(pair), 1);
        }
      });
  }

  async updateCache() {
    this.relationshipCache = await Haylin.globals.db.portalRelationship.findMany();
  }

  async onMessage(message: Message) {
    if(message.webhookId) return; // Ignore webhooks (self)


    const relationships = this.relationshipCache.filter((relationship) => (
       (relationship.channelA == message.channelId && relationship.guildIdA == message.guildId)
       || (relationship.channelB == message.channelId && relationship.guildIdB == message.guildId)
    ));

    if(relationships.length == 0) return;

    relationships.forEach(async (relationship) => {
      let relationshipRole: "A"|"B" = (relationship.channelA == message.channelId) ? "A" : "B";
      let linkedChannelData: {[key: string]: any} = {
        guildId: (relationshipRole == "A") ? relationship.guildIdB : relationship.guildIdA,
        channelId: (relationshipRole == "A") ? relationship.channelB : relationship.channelA,
      }
      
      linkedChannelData["guild"] = message.client.guilds.cache.get(linkedChannelData.guildId)
      linkedChannelData["channel"] = linkedChannelData.guild.channels.cache.get(linkedChannelData.channelId)

      if(!linkedChannelData.guild || !linkedChannelData.channel)
        return;
      
      if(!(linkedChannelData["guild"] as Guild).me.permissionsIn(linkedChannelData["channel"]).has("MANAGE_WEBHOOKS"))
        return;

      const webhooks = await (linkedChannelData.channel as Guild).fetchWebhooks();
      let webhook = webhooks.find((webhook: any) => webhook.name == "Blob Portal");
      if(!webhook) {
        webhook = await linkedChannelData.channel.createWebhook("Blob Portal", {
          avatar: message.client.user.displayAvatarURL({ format: "png" })
        });
      }
      
      let messagePrep: any = {
        username: `${message.author.username} (from ${message.guild.name})`,
        embeds: message.embeds,
        files: message.attachments.map((attachment) => new MessageAttachment(attachment.url)),
        avatarURL: message.author.displayAvatarURL({ format: "png" }),
      }

      if(message.content) 
        messagePrep.content = message.content;

      webhook.send(messagePrep)
        .then((msg) => {
          this.messagePairCache.push({
            from: {
              message: message.id,
              channel: message.channel.id,
              guild: message.guild.id,
            },
            to: {
              message: msg.id,
              webhookId: webhook.id
            },
            expires: dayjs().add(8, "hour"),
          })
        })
    })
  }

  async onEdit(oldMessage: Message, newMessage: Message) {
    const pair = this.messagePairCache.find((pair) => pair.from.message == oldMessage.id);
    if(!pair) return;

    let webhook;
    try {
      webhook = await newMessage.client.fetchWebhook(pair.to.webhookId);
    } catch(_) {
      // oh no! anyway,
      return;
    }

    let messagePrep: any = {
      embeds: newMessage.embeds,
      files: newMessage.attachments.map((attachment) => new MessageAttachment(attachment.url)),
    }

    if(newMessage.content) 
      messagePrep.content = newMessage.content;

    await webhook.editMessage(pair.to.message, messagePrep);
  }
}

export default new Portal();