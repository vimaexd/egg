import Discord from "discord.js";
import { YarnGlobals } from "../utils/types.bot";

// there are 2 clients because we provide our own
// should probably refactor this at some point
export default (_: Discord.Client, client: Discord.Client, globals: YarnGlobals) => {
  globals.log.log(`Connected to Discord!`)
}