const cds = require('@sap/cds');
const { DELETE } = cds.ql;
const { handleMemoryBeforeRagCall, handleMemoryAfterRagCall } = require('./memory-helper');

const tableName = 'SAP_TISCE_DEMO_DOCUMENTCHUNK'; 
const embeddingColumn  = 'EMBEDDING'; 
const contentColumn = 'TEXT_CHUNK';
const aiCoreUtil = require('./utils/ai-core');

const systemPrompt = 
`Your task is to answer queries using the grounding data provided.\n
`;

const genericRequestPrompt = 
'You are a chatbot. Answer the user question based only on the context, delimited by triple backticks\n ';
;

const taskCategory = {
    "generic-query" : genericRequestPrompt
}

function getFormattedDate (timeStamp)
{
    const timestamp = Number(timeStamp);
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'GMT',
      }).format(date);
}

module.exports = function () {

    this.on('getChatRagResponse', async (req) => {
        try {
            //request input data
            const { conversationId, messageId, message_time, user_id, user_query } = req.data;
            const { Conversation, Message, Files } = this.entities;
            const loggedInUserID = cds.context.user.id;
            
            //handle memory before the RAG LLM call
            const memoryContext = await handleMemoryBeforeRagCall (conversationId , messageId, message_time, user_id , user_query, Conversation, Message );
            
            /*Single method to perform the following :
            - Embed the input query
            - Perform similarity search based on the user query 
            - Construct the prompt based on the system instruction and similarity search
            - Call chat completion model to retrieve relevant answer to the user query
            */

            const promptCategory  = {
                "generic-query" : genericRequestPrompt
            }
            //get filenames for logged in user
            const fileList = await SELECT.from(Files).columns("fileName").where({ "CREATEDBY": loggedInUserID });
            let fileNames = "(";
            if (fileList.length > 0) {
                fileList.forEach(file => {
                    fileNames += `'${file.fileName}',`
                });
            }
            fileNames = fileNames.slice(0,fileNames.length-1)
            fileNames += ")"

            const ragResponse = await aiCoreUtil.getRagResponse(
                user_query,
                tableName,
                embeddingColumn,
                contentColumn,
                genericRequestPrompt ,
                memoryContext .length > 0 ? memoryContext : undefined,
                3,
                fileNames
            );
            
            let additionalContent = "\n";
            const metadata = ragResponse.metadata;
            if(metadata && metadata.length){
                metadata.forEach((item, index) => {
                    additionalContent += ` ${index+1}. File name : ${item.fileName} , Page number : ${item.pageNumber} \n`
                })
            }
            const chatRagResponse = {
                "role":"assistant",
                "content":ragResponse.completion.content,
                "additionalContent": additionalContent
            }


            //handle memory after the RAG LLM call
            const responseTimestamp = new Date().toISOString();
            await handleMemoryAfterRagCall (conversationId , responseTimestamp, chatRagResponse, Message, Conversation);

            const response = {
                "role" : chatRagResponse.role,
                "content" : chatRagResponse.content,
                "messageTime": responseTimestamp,
                "additionalContent": chatRagResponse.additionalContent
            };

            return response;
        }
        catch (error) {
            // Handle any errors that occur during the execution
            console.log('Error while generating response for user query:', error);
            throw error;
        }

    })


    this.on('deleteChatData', async () => {
        try {
            const { Conversation, Message } = this.entities;
            await DELETE.from(Conversation);
            await DELETE.from(Message);
            return "Success!"
        }
        catch (error) {
            // Handle any errors that occur during the execution
            console.log('Error while deleting the chat content in db:', error);
            throw error;
        }
    })

}