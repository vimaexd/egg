import * as Discord from "discord.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { YarnGlobals, YarnCommandObject } from "./utils/types"
import omelettes from "./utils/omelettes";
import config from "../config/conf.json";
import { Feedback } from "./db/models";
import Command from "./classes/Command";

dotenv.config()
const client: Discord.Client = new Discord.Client()

let token: string | undefined;
let globals: YarnGlobals = {}

globals.commands = new Map;
globals.aliases = new Map;

globals.config = config
if(process.env.NODE_ENV === "production"){
    token = process.env.PRODTOKEN
    globals.prefix = config.defaultPrefix.production
    globals.env = "production"
} else {
    token = process.env.BETATOKEN
    globals.prefix = config.defaultPrefix.development
    globals.env = "development"
}

// Init DB
const db = require("./db/db")

// Load commands
function loadCommands(directory: string): void {
    fs.readdir(directory, {withFileTypes: true}, async (err, files: fs.Dirent[]) => {
        if(err) throw err;
        if(files.length < 0) return console.log(`No files to load in ${directory}`)

        files.forEach((f: fs.Dirent) => {
            let fileExtension = f.name.split(".")[f.name.split(".").length - 1]
            let moduleName = f.name.replace(".js", "")

            if(f.isDirectory()) return loadCommands(path.join(__dirname, path.join('commands', f.name)))
            if(!f.name.endsWith(".js") && !f.name.endsWith(".ts")) return;

            let relativePath = directory.split(path.sep).slice(directory.split(path.sep).indexOf("commands")).join("/")

            import("./" + path.join(relativePath, moduleName))
                .then((cmd: YarnCommandObject) => {
                    globals.commands.set(cmd.default.meta.name, cmd.default)
                    cmd.default.meta.trigger.forEach(c => {
                        globals.aliases.set(c, cmd.default.meta.name)
                    })
                    console.log(`⭐ - Loaded command ${f.name}`)
                })
        })
    })
}

console.log("🥚 - Loading commands..")
loadCommands(path.join(__dirname, 'commands'))

client.on('ready', () => {
    let guildAmount = client.guilds.cache.size
    client.user?.setActivity(`Ping! - ${globals.prefix}help`, {type: 'WATCHING'})
    console.log(`✅ - Eggbot is up. - ${globals.env} env`)
})

client.on('message', (message: Discord.Message) => {
    if(omelettes.includes(message.content.toLowerCase())) return message.react(":no_omelette_zone:806549873037934613")
    if(!message.content.startsWith(globals.prefix)) return;
    if(message.author.bot) return;
    if(message.channel.type == "dm") return;

    let msg: string = message.content;
    let commandName: string = msg.replace(globals.prefix, "").split(" ")[0]
    let args: Array<string> = msg.split(" ").slice(1)

    let cmd: Command;
    globals.aliases.forEach((name: string, a: string) => {
        if(a == commandName) cmd = globals.commands.get(name)
    })

    if(!cmd) return;
    if(!cmd.meta.enabled) return;
    cmd.run(client, message, args, globals)
})

client.on('messageUpdate', async (message) => {
    if(omelettes.includes(message.content.toLowerCase())) return message.react(":no_omelette_zone:806549873037934613")
})

client.on('messageDelete', async (message) => {
    if(message.channel.id == "812526505187344424") {
        let entry = await Feedback.findOne({
            where: { messageId: message.id }
        })
        if(!entry) return;
        await entry.destroy();
    }
})

client.login(token)