import type { ChatInputCommandDeniedPayload, Events } from "@sapphire/framework"
import { Listener, UserError } from "@sapphire/framework"

export class UserEvent extends Listener<typeof Events.ChatInputCommandDenied> {
  public async run(
    { message: content }: UserError,
    { interaction }: ChatInputCommandDeniedPayload
  ) {
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply({
        content,
        allowedMentions: { users: [interaction.user.id], roles: [] },
      })
    }

    return interaction.reply({
      content,
      allowedMentions: { users: [interaction.user.id], roles: [] },
      ephemeral: true,
    })
  }
}
