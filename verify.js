module.exports = {
  name: "verify",
  run: async (client, message, args) => {
    client.emit("guildMemberAdd", message.member)
  }
}