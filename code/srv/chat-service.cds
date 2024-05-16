using {sap.tisce.demo as db} from '../db/schema';

service ChatService @(requires: 'authenticated-user') {

    entity Conversation @(restrict: [{
        grant: ['READ','WRITE', 'DELETE'],
        where: 'userID = $user'
    }])                 as projection on db.Conversation;
    entity Message      as projection on db.Message;

    entity Files @(restrict: [{
        grant: [
            'READ'
        ],
        where: 'createdBy = $user'
    }]) as projection on db.Files;

    type RagResponse {
        role               : String;
        content            : String;
        messageTime        : String;
        additionalContent : String;
    }

    action   getChatRagResponse(conversationId : String, messageId : String, message_time : Timestamp, user_id : String, user_query : String) returns RagResponse;
    function deleteChatData() returns String;
}
