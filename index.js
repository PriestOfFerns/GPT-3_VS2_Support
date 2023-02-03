require('dotenv').config();

require('fs')


const { Configuration, OpenAIApi } = require("openai");

const { Client, GatewayIntentBits, SlashCommandSubcommandBuilder } = require('discord.js');
const { readFileSync, fstat, writeFileSync } = require('fs');
const { off } = require('process');


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


const prefix = `You are a Q&A bot named "Sup Port" and answer questions regarding the Minecraft Mod "Valkyrien Skies 2". 
Your task is to answer the question below as truthfully as possible using the provided context, and if the answer is not contained within the text below answer that you don't know. Do not give unnecessary details about information not asked for.
Context: `



client.on('messageCreate', async msg => {

 

  if (msg.channel.id ==  "1069715100434432100" && msg.author.bot == false) {

    const ConJSON =  JSON.parse(readFileSync("Context.json"))
    const Ordered = await order_document_sections_by_query_similarity(msg.content, Embeds) 


    let Context = "\n"
    const MaxP = Ordered[0][0]
    for (x in Ordered) {
      const EmbOrdered = Ordered[x][1].split(",")
      const Points = Ordered[x][0]
      console.log(Points)
   
      if (Points < 0.3) {
        break
      }
      
      for (x of ConJSON) {
      
        if  ( x.Title == EmbOrdered[0] && x.Header == EmbOrdered[1]) {
          Context+=x.Content+"\n\r"
          break
          
        } 
      }
    }
    
    
    console.log(msg.content)
    const pref = prefix + Context + "\r\nQuestion: " +msg.content +"\r\nAnswer:"
    console.log(pref)
    const completion = await openai.createCompletion({
      model: "text-curie-001",
      prompt: pref,
      temperature: 0,
      max_tokens: 120
    });
    
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
  let Dic = {}


  for(x in df) {

    Dic[x] = await get_doc_embedding(df[x]["Content"])
    
  }
  return Dic
}


function load_embeddings(EmbeddingPath) {
    df = JSON.parse(readFileSync(EmbeddingPath))
    let Dic = {}
    for (x in df) {
      const object = df[x]
      Dic[ [object["Title"],object["Header"]] ] = object["Vectors"]
    }

    return Dic
}

async function create_embeddings(df) {
  const docEmb = await compute_doc_embeddings(df)
  Final = []
  for (x in docEmb) {
    Final[x] = {
      "Header":df[x]["Header"],
      "Title":df[x]["Title"],
      "Vectors":docEmb[x]
    }
  }
  return Final
}



function vector_similarity(x, y) {
    
    return x.map((a, i) => x[i] * y[i]).reduce((m, n) => m + n);
}



async function order_document_sections_by_query_similarity(query, contexts){
    
    const query_embedding = await get_query_embedding(query)
    
    let document_similarities = []
    
    for (const [key, value] of Object.entries(contexts)) {
      document_similarities.push( [vector_similarity(query_embedding, value),key] )
    }
    document_similarities.sort(function(a,b) {
      return b[0]-a[0]
    })
    
    /*sorted([
        (vector_similarity(query_embedding, doc_embedding), doc_index) for doc_index, doc_embedding in contexts.items()
    ], reverse=True)
    */
    return document_similarities
}

const data = JSON.parse(readFileSync("Context.json"))
const Embeds = load_embeddings("ContextEmbedding.json")



 // Creates a "ContextEmbedding.json" file"


create_embeddings(data).then(Embs=>{
  Jfile = JSON.stringify(Embs)
  writeFileSync("ContextEmbedding.json",Jfile)
})



client.login(process.env.DISCORD_TOKEN);