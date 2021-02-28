import { Message, MessageReaction, PartialMessage } from "discord.js";

/** 
    An array of omelettes. What the fuck did you expect?
*/
let omelettes: String[] = [
    "omelette", 
    "omelete", 
    "ommelete", 
    "ommelett", 
    "omelet", 
    "omlet", 
    "omlette", 
    "omlete", 
    "ommlete", 
    "omlett", 
    "ommlett"
]

/**
 * Function to detect if message contains the word "omelette" in many variations
 * @param {Message} Message object 
*/
const detectEasterEgg = (message: Message | PartialMessage) => {
    let haha_no = message.content
        .replace("*", "")
        .replace("_", "")
        .replace(">", "")
        .replace("`", "")
        .replace(" ", "")
        .toLowerCase()
    
    omelettes.forEach((o: String) => {
        let thisOmelette: string = String(o) // haha typescript
        if(haha_no.includes(thisOmelette)) message.react(":no_omelette_zone:806549873037934613")
    })
}

export default detectEasterEgg;