db = db.getSiblingDB('sample_db');
db.createCollection('sample_collection');


const CRUD = {
    insertOne: function (org, filter, addrs) {
        db.sample_collection.insertOne({
            org: org,
            filter: filter,
            addrs: addrs
        },)
    }
}



function resetData() {
    db.sample_collection.deleteMany({})
}

function initializeData() {


    db.sample_collection.insertMany([
        {
            org: 'helpdev',
            filter: 'EVENT_A',
            addrs: 'http://rest_client_1:8080/wh'
        },
        {
            org: 'helpdev',
            filter: 'EVENT_B',
            addrs: 'http://rest_client_2:8081/wh'
        },
        {
            org: 'github',
            filter: 'EVENT_C',
            addrs: 'http://rest_client_3:8082/wh'
        }
    ]);

}



function init() {
    // db = db.getSiblingDB('sample_db');
    // db.createCollection('sample_collection');
    resetData()
    initializeData()
    CRUD.insertOne('aaaa', 'NEW_FILTER', 'http://supperaddr.com')
}

init()