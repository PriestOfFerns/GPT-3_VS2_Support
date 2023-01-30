require('dotenv').config();

const { Configuration, OpenAIApi } = require("openai");




const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


const prefix = `Answer the question as truthfully as possible using the provided text, and if the answer is not contained within the text below answer that you don't know. Make sure to vary your answers so it doesn't sound robotic."

Context:
Optifine shouldn't be used. Optifine is an awful optimization mod. It messes with rendering and it's closed source nature prevents people from making compat for it. Rubidium should be used instead of Optifine

Q:`

client.on('messageCreate', async msg => {

  if (msg.channel.id ==  "1069715100434432100" && msg.author.bot == false) {
    console.log(msg.content)
    const completion = await openai.createCompletion({
      model: "text-curie-001",
      prompt: prefix +msg.content+"\n" + "A:",
      temperature: 0.05,
      max_tokens: 120
    });
    console.log(completion.data.choices)
    msg.reply(completion.data.choices[0].text)
  }
    
});


client.login(process.env.DISCORD_TOKEN);
