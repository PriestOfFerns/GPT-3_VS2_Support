require('dotenv').config();

require('fs')


const { Configuration, OpenAIApi } = require("openai");

const { Client, GatewayIntentBits } = require('discord.js');
const { readFileSync } = require('fs');


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


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

MODEL_NAME = "curie"

DOC_EMBEDDINGS_MODEL = "text-search-"+MODEL_NAME+"-doc-001"
QUERY_EMBEDDINGS_MODEL = "text-search-"+MODEL_NAME+"-query-001"

async function get_embedding(text, model){
  const result = await openai.createEmbedding({
    "model": model,
    "input": text
  })
   
   return result["data"]["data"][0]["embedding"]
}

function get_doc_embedding(text){
    return get_embedding(text, DOC_EMBEDDINGS_MODEL)
}
function get_query_embedding(text){
    return get_embedding(text, QUERY_EMBEDDINGS_MODEL)
}

async function compute_doc_embeddings(df) { 
  const Dic = {}


  for(x in df) {

    Dic[x] = await get_doc_embedding(df[x]["Content"])
    
  }
  return Dic
}

const data = JSON.parse(readFileSync("Context.json"))

compute_doc_embeddings(data).then(Dic=>{console.log(Dic)})

//client.login(process.env.DISCORD_TOKEN);