
require('dotenv').config();

require('fs')


const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);



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



