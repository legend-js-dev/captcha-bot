module.exports = {
  name: "config",
  run: async (client, message, args, db) => {
    let config = args[0]
    if (!config) return message.channel.send(":x: | **Provide Your Option**")
    if (!["channel", "role", "logs", "autokick"].includes(config)) return message.channel.send(":x: | **The only options are channel, role, logs & autokick**")
    switch (config) {
      case "channel":
        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1])
        if (!channel) { return message.channel.send(":x: | **Channel Not Found**") }
        db.set(`verifyChannel_${message.guild.id}`, channel.id)
        return message.channel.send("✅ | **The verification channel has been set to "+channel.toString()+"**")
        break;
      case "role":
        let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1])
        if (!role) { return message.channel.send(":x: | **Role Not Found**") }
        db.set(`verifyRole_${message.guild.id}`, role.id)
        return message.channel.send("✅ | **The verification role has been set to "+role.toString()+"**")
        break;
      case "autokick":
        let yesnt = args[1]
        if (!yesnt) return message.channel.send(":x: | **specify if you want to enable or disable autokick**")
        if (!["enable", "disable"].includes(yesnt)) { return message.channel.send(":x: | **The options are enable or disable**")}
        let tog;
        if (yesnt === "enable") tog = true;
        if (yesnt === "disable") tog = false;
        let yes = tog === true ? "enabled**":"disabled**"
        db.set(`autokick_${message.guild.id}`, tog)
        message.channel.send("✅ | **The autokick has been " + yes)
        break;
      case "logs":
        let channell = message.mentions.channels.first()
        if (!channell) return message.channel.send(":x: | **Mention The Channel!**")
        db.set(`logs_${message.guild.id}`, channell.id)
        message.channel.send("✅ | **The logs channel has been set to " + channell.toString() + "**")
        break;
    }
  }
}