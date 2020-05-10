const { Util } = require("discord.js");
const twilio = require('twilio');
const twilio_client = new twilio();

module.exports = {
  name: "call",
  description: "Connect call to the phone number",
  async execute(message) {
    try {
      const args = message.content.split(" ");
      const queue = message.client.queue;
      const serverQueue = message.client.queue.get(message.guild.id);
      const phoneNumber = args[1];

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

      try {
        var connection = await voiceChannel.join();
   
        this.makeCall(message, phoneNumber);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } catch (error) {
      console.log(error);
      message.channel.send(error.message);
    }
  },
  makeCall(message, phoneNumber){
  twilio_client.calls.create({
    url: 'http://ced922f1.ngrok.io/voice',
    to: phoneNumber,
    from: '+12064660655',
    statusCallback: 'http://ced922f1.ngrok.io/events',
    statusCallbackMethod: 'POST',
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
  }, (err, call) => {
    if(err) { console.log(err); return err; }
    process.stdout.write(call.sid);
  });
},
};
