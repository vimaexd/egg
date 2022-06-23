import { PrismaClient } from "@prisma/client";
import Command from "../classes/commands/Command"
import Log from "../classes/system/Log";
import Notifications from "../classes/system/Notifications";

export interface YarnGlobals {
  prefix?: string;
  config?: any;
  db?: PrismaClient;
  env?: string;
  commands?: Map<string, Command>;
  aliases?: Map<string, string>
  log?: Log;
  shardId?: number;
  notifications?: typeof Notifications;
}

export enum YarnShardMessageType {
  GET_SHARD_ID = "yarn/getShardId"
}
export interface YarnShardMessage {
  t: YarnShardMessageType;
  d: any;
}