import { ButtonInteraction, CommandInteraction, InteractionCollector, MessageActionRow } from "discord.js";
import { deleteBtn, noBtn } from "./buttons";

interface IYesNoCollectorOptions {
  interaction: CommandInteraction;
  question: string;
  onYes: (interaction: ButtonInteraction) => any;
}

const YesNoCollector = async (config: IYesNoCollectorOptions) =>  {
  const collector = new InteractionCollector(config.interaction.client, { 
    componentType: "BUTTON"
  })
    
  collector.on('collect', async (newInteraction) => {
    if(!newInteraction.isButton) return;
    
    const btnInteraction = (newInteraction as ButtonInteraction);
    if(!btnInteraction.message.interaction) return;
    if(config.interaction.id != btnInteraction.message.interaction.id) return;
    if(btnInteraction.member.user.id != config.interaction.member.user.id) return btnInteraction.reply({"content": "You can't push that!", ephemeral: true})
    
    switch(btnInteraction.customId){
      case "no":
        await config.interaction.deleteReply();
        break;
      
      case "yes":
        config.onYes(btnInteraction);
        collector.stop()
        break;
    }
  })
  
  await config.interaction.reply({
    content: config.question,
    components: [new MessageActionRow().addComponents([deleteBtn, noBtn])]
  })
}

export default YesNoCollector;