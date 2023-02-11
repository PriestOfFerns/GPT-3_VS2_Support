require('dotenv').config();

require('fs')


const { Configuration, OpenAIApi } = require("openai");

const { Client, GatewayIntentBits, SlashCommandSubcommandBuilder } = require('discord.js');
const { readFileSync, fstat, writeFileSync } = require('fs');



const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


const prefix = `You are a Q&A bot named "Sup Port" and answer questions regarding the Minecraft Mod "Valkyrien Skies 2" which is about building Airships. The official Valkyrien Skies Website is "https://www.valkyrienskies.org/". The download website for "Valkyrien Skies 2" is "https://www.curseforge.com/minecraft/mc-mods/valkyrien-skies". This is only the download for Valkyrien Skies 2, not for Clockwork or Takeoff or similar. The wiki Website is "https://wiki.valkyrienskies.org/wiki/Main_Page" and the faq website is "https://wiki.valkyrienskies.org/wiki/FAQ".

Answer the question as truthfully as possible using the provided text, and if the answer is not contained within the text below, say "I don't know". Do not include unnecessary details 

Context:  Make sure you are using the latest version of Valkyrien Skies 2 and of your mod loader. \n\r`


client.on('messageCreate', async msg => {

  console.log(msg.channel.parentId)
  if (msg.channel.parentId ==  "1071387850022584320" && msg.author.bot == false) {

    const ConJSON =  JSON.parse(readFileSync("Context.json"))
    const Ordered = await order_document_sections_by_query_similarity(msg.content, Embeds) 
    console.log(Ordered)

    let Context = ""

    for (x in Ordered) {
      const EmbOrdered = Ordered[x][1]
      const Points = Ordered[x][0]
      
      if (Points < 0.26) {
        break
      }
      
      for (x of ConJSON) {
      
        if  (x.Header == EmbOrdered) {
          Context+=x.Content+"\n\r"
          break
          
        } 
      }
    }

    if (Context != "") {
      await msg.channel.sendTyping()
      console.log(msg.content)
      const pref = prefix + Context  + "\r\nQuestion: "+msg.channel.name+". " +msg.content +"\r\nAnswer:"
      console.log(pref)
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: pref,
        temperature: 0.05,
        max_tokens: 300
      });
      
      msg.reply(completion.data.choices[0].text)
    }
  }
    
});

MODEL_NAME = "davinci"

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
      Dic[ object["Header"] ] = object["Vectors"]
    }

    return Dic
}

async function create_embeddings(df) {
  const docEmb = await compute_doc_embeddings(df)
  Final = []
  for (x in docEmb) {
    Final[x] = {
      
      "Header":df[x]["Header"],
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

/*
create_embeddings(data).then(Embs=>{
  Jfile = JSON.stringify(Embs)
  writeFileSync("ContextEmbedding.json",Jfile)
  console.log("done")
})
*/


client.login(process.env.DISCORD_TOKEN);