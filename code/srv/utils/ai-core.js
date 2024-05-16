const cds = require("@sap/cds");

CHAT_MODEL_DESTINATION_NAME = cds.env.requires["GENERATIVE_AI_HUB"]["CHAT_MODEL_DESTINATION_NAME"]
CHAT_MODEL_DEPLOYMENT_URL = cds.env.requires["GENERATIVE_AI_HUB"]["CHAT_MODEL_DEPLOYMENT_URL"]
CHAT_MODEL_RESOURCE_GROUP = cds.env.requires["GENERATIVE_AI_HUB"]["CHAT_MODEL_RESOURCE_GROUP"]
CHAT_MODEL_API_VERSION = cds.env.requires["GENERATIVE_AI_HUB"]["CHAT_MODEL_API_VERSION"]
EMBEDDING_MODEL_DESTINATION_NAME = cds.env.requires["GENERATIVE_AI_HUB"]["EMBEDDING_MODEL_DESTINATION_NAME"]
EMBEDDING_MODEL_DEPLOYMENT_URL = cds.env.requires["GENERATIVE_AI_HUB"]["EMBEDDING_MODEL_DEPLOYMENT_URL"]
EMBEDDING_MODEL_RESOURCE_GROUP = cds.env.requires["GENERATIVE_AI_HUB"]["EMBEDDING_MODEL_RESOURCE_GROUP"]
EMBEDDING_MODEL_API_VERSION = cds.env.requires["GENERATIVE_AI_HUB"]["EMBEDDING_MODEL_API_VERSION"]
const retryCount = 3;

async function retryService(destService,query,data,headers,retryCount,attemptNumber){
  try{
    console.log("Calling retry service attempt : "+ attemptNumber)
    if(attemptNumber<= retryCount){
      const response = await destService.send({
        query: query,
        data: data,
        headers: headers,
      });
      return response;
    }
  } catch(err){
    console.log('Error while calling retry service attempt : '+ attemptNumber +' : ', err);
    if(attemptNumber>= retryCount){
      throw err;
    } else {
      const aNumber = attemptNumber + 1;
      const res = await retryService(destService,query,data,headers,retryCount,aNumber);
      return res;
    }
  }
}


  /**
  * get vector embeddings.
  * @param {object} input - The input string to be embedded.
  * @returns {object} - Returns the vector embeddings.
  */
  async function getEmbedding(input) {
    try {
      const destService = await cds.connect.to(`${EMBEDDING_MODEL_DESTINATION_NAME}`);
      const payload = {
        input: input
      };
      const headers = {
        "Content-Type": "application/json",
        "AI-Resource-Group": `${EMBEDDING_MODEL_RESOURCE_GROUP}`,
      };
      console.log("post",`POST ${EMBEDDING_MODEL_DEPLOYMENT_URL}/embeddings?api-version=${EMBEDDING_MODEL_API_VERSION}`)
      console.log("header:", headers)

      const response = await retryService(destService,`POST ${EMBEDDING_MODEL_DEPLOYMENT_URL}/embeddings?api-version=${EMBEDDING_MODEL_API_VERSION}`,
                              payload, headers, 3, 1);
      
      /*destService.send({
        //"POST /v2/inference/deployments/deploymentId/embeddings?api-version=2023-05-15",
        query: `POST ${EMBEDDING_MODEL_DEPLOYMENT_URL}/embeddings?api-version=${EMBEDDING_MODEL_API_VERSION}`,
        data: payload,
        headers: headers,
      });
      */
      if (response && response.data) {
        //{data: [ { embedding: [Array], index: 0, object: 'embedding' } ]}
        return response.data[0].embedding;
      }
      else {
        // Handle case where response or response.data is empty
        error_message = 'Empty response or response data.';
        console.log(error_message);
        throw new Error(error_message);
      }
    }
    catch (error) {
      // Handle any errors that occur during the execution
      console.log('Error getting embedding response:', error);
      throw error;
    }
  }



  /**
  * Perform Chat Completion.
  * @param {object} payload - The payload for the chat completion model.
  * @returns {object} - The chat completion results from the model.
  */

  async function getChatCompletion(
    payload
  ) {
    try {
      const destService = await cds.connect.to(`${CHAT_MODEL_DESTINATION_NAME}`);
      const headers = {
        "Content-Type": "application/json",
        "AI-Resource-Group": `${CHAT_MODEL_RESOURCE_GROUP}`
      };

      const response = await retryService(destService,`POST ${CHAT_MODEL_DEPLOYMENT_URL}/chat/completions?api-version=${CHAT_MODEL_API_VERSION}`,
                    payload, headers, 3, 1);
      
      /*await destService.send({
        query: `POST ${CHAT_MODEL_DEPLOYMENT_URL}/chat/completions?api-version=${CHAT_MODEL_API_VERSION}`,
        data: payload,
        headers: headers,
      });
      */

      if (response && response.choices) {
        return response.choices[0].message;
      } else {
        // Handle case where response or response.data is empty
        error_message = 'Empty response or response data.';
        throw new Error(error_message);
      }
    } catch (error) {
      // Handle any errors that occur during the execution
      console.log('Error getting chat completion response:', error);
      throw error;
    }
  }

  /**
    * Retrieve RAG response from LLM.
    * @param {string} input - User input.
    * @param {string} tableName - The full name of the SAP HANA Cloud table which contains the vector embeddings.
    * @param {string} embeddingColumnName - The full name of the SAP HANA Cloud table column which contains the embeddings.
    * @param {string} contentColumn - The full name of the SAP HANA Cloud table column which contains the page content.
    * @param {string} chatInstruction - The custom prompt user can pass in. Important: Ensure that the prompt contains the message "content which is enclosed in triple quotes".
    * @param {object} context - Optional.The chat history.
    * @param {string} algoName - Optional.The algorithm of similarity search. Currently only COSINE_SIMILARITY and L2DISTANCE are accepted. The default is 'COSINE_SIMILARITY'.
    * @param {number} topK - Optional.The number of the entries you want to return. Default value is 3.
    * @param {string} fileNames - The names of files to restrict the search.
    * @param {object} chatParams - Optional.The other chat model params.

    * @returns {object} Returns the response from LLM.
    */
  async function getRagResponse(
    input,
    tableName,
    embeddingColumnName, 
    contentColumn,
    chatInstruction,
    context,
    topK = 3,
    fileNames,
    algoName = 'COSINE_SIMILARITY',
    chatParams,
  ) {
    try {
      const queryEmbedding = await this.getEmbedding(input);
      const similaritySearchResults = await this.similaritySearch(tableName, embeddingColumnName, contentColumn, queryEmbedding, algoName, topK, fileNames);
      const similarContent = similaritySearchResults.map(obj => obj.PAGE_CONTENT);
      const metadata = similaritySearchResults.map(obj => {
        return {
          score: obj.SCORE,
          pageNumber: obj.PAGENUMBER,
          fileID: obj.FILEID,
          fileName: obj.FILENAME
        }
      });
      let messagePayload = [
        {
          "role": "system",
          "content": ` ${chatInstruction} \`\`\` ${similarContent} \`\`\` `
        }
      ]

      const userQuestion = [
        {
          "role": "user",
          "content": `${input}`
        }
      ]

      if (typeof context !== 'undefined' && context !== null && context.length > 0) {
        console.log("Using the context parameter passed.")
        messagePayload.push(...context);
      }

      messagePayload.push(...userQuestion);

      let payload = {
        "messages": messagePayload
      };
      if (chatParams !== null && chatParams !== undefined && Object.keys(chatParams).length > 0) {
        console.log("Using the chatParams parameter passed.")
        payload = Object.assign(payload, chatParams);
      }
      console.log("payload is", payload);
      const chatCompletionResp = await this.getChatCompletion(payload);

      const ragResp = {
       "completion" : chatCompletionResp,
       "metadata" : metadata,
      };

      return ragResp;
    }
    catch (error) {
      // Handle any errors that occur during the execution
      console.log('Error during execution:', error);
      throw error;
    }
  }

  /**
    * Perform Similarity Search.
    * @param {string} tableName - The full name of the SAP HANA Cloud table which contains the vector embeddings.
    * @param {string} embeddingColumnName - The full name of the SAP HANA Cloud table column which contains the embeddings.
    * @param {string} contentColumn -  The full name of the SAP HANA Cloud table column which contains the page content.
    * @param {number[]} embedding - The input query embedding for similarity search.
    * @param {string} algoName - The algorithm of similarity search. Currently only COSINE_SIMILARITY and L2DISTANCE are accepted.
    * @param {number} topK - The number of entries you want to return.
    * @param {string} fileNames - The names of files to restrict the search
    * @returns {object} The highest match entries from DB.
    */
  async function similaritySearch(tableName, embeddingColumnName, contentColumn, embedding, algoName, topK, fileNames) {
    try {

      // Ensure algoName is valid
      const validAlgorithms = ['COSINE_SIMILARITY', 'L2DISTANCE'];
      const embedding_str = `[${embedding.toString()}]`;
      const selectStmt = `SELECT * FROM (SELECT TOP ${topK}
        TO_NVARCHAR(${contentColumn}) as "PAGE_CONTENT",
        ${algoName}(${embeddingColumnName}, TO_REAL_VECTOR('${embedding_str}')) as "SCORE",
        FILEID,
        FILENAME,
        PAGENUMBER
        FROM ${tableName} where FILENAME in ${fileNames}
        ORDER BY SCORE DESC) as results where SCORE > 0.75`;
      const result = await cds.db.run(selectStmt);
      if (result) return result;
    } catch (e) {
        console.log(
          `Similarity Search failed for entity ${tableName} on attribute ${embeddingColumnName}`,
          e
        );
        throw e;
      }
  }

  module.exports = {
    getEmbedding: getEmbedding,
    similaritySearch:similaritySearch,
    getRagResponse:getRagResponse,
    getChatCompletion:getChatCompletion
  }