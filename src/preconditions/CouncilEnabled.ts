import { Precondition } from "@sapphire/framework"
import { CommandInteraction } from "discord.js"
import Votum from "../Votum"

export class CouncilEnabledPrecondition extends Precondition {
  // for Slash Commands
  public override async chatInputRun(interaction: CommandInteraction) {
    if (interaction.commandName !== "council")
      return this.checkCouncilEnabled(interaction.channelId)
    return this.ok()
  }
  private async checkCouncilEnabled(channelId: string) {
    const council = Votum.getCouncil(channelId)
    console.log(council.name, council.enabled)
    if (council.enabled === false) {
      return this.error({
        message:
          "This is not a council channel. To turn into a council channel please use `/council create` command",
      })
    }
    return this.ok()
  }
}

declare module "@sapphire/framework" {
  interface Preconditions {
    CouncilEnabled: never
  }
}
