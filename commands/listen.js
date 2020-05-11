const fs = require("fs");
const { getUserFromMention } = require("../util/getUser");

module.exports = {
  name: "listen",
  description: "listen to user",
  async execute(message, client) {
    try {

      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel)
        return message.channel.send(
          "You need to be in a voice channel to connect to a call"
        );
      const permissions = voiceChannel.permissionsFor(message.client.user);
      if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
          "I need the permissions to join and speak in your voice channel!"
        );
      }

      var connection = await voiceChannel.join();

      const audio = connection.receiver.createStream(message.member, { mode: "pcm", end : "manual" },);

      audio.pipe(fs.createWriteStream("user_audio"));
    } catch (err) {
      console.log(err);
      return message.channel.send(err);
    }
  },
};
