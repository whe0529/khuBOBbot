var express = require('express');
const request = require('request');
const PUSH_TARGET_URL = 'https://api.line.me/v2/bot/message/push'
const REPLY_TARGET_URL = 'https://api.line.me/v2/bot/message/reply'
const TOKEN = 'Zd+BLpi6wLHMngB3EK74S1W7ApnAXuYZ86xGIi60JKrSW0xI0JyXlCzpunYxk9fxtOkH4y2/CNrb6K7WYldpXBwUkCKNIyEQ04AUpQKQ1EzS6C3qm6y5sBm0zs/Gmzn6n1v1jLfmSpxyLir7VqHk5wdB04t89/1O/w1cDnyilFU='
const fs = require('fs');
const path = require('path');
const HTTPS = require('https');
const domain = "osschatbot.tk"
const sslport = 23023;

const bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
let language = ""
let guideMessageText = {};


const food_menu_arr = [
    {index : 1, kr_name: "한식", en_name: 'korean'}, 
    {index : 2, kr_name: "중식", en_name: 'chinese'}, 
    {index : 3, kr_name: "양식", en_name: 'western'}, 
    {index : 4, kr_name: "일식", en_name: 'japanese'}, 
    {index : 5, kr_name: "분식", en_name: 'snack'}, 
    {index : 6, kr_name: "아시안", en_name: 'asian'}, 
    {index : 7, kr_name: "패스트푸드", en_name: 'fast food'}, 
    {index : 8, kr_name: "학식", en_name: 'school food'},
    {index : 9, kr_name: "카페", en_name : 'cafe'}
];
const message_object = {
    request_error :[
        "음식을 다시 입력 해주세요.",
        "Please enter the food again"
    ],
    food_name_version : [
        "kr_name",
        "en_name"
    ]
}


let language_index = 0;

app.post('/hook', function (req, res){
    var eventObj = req.body.events[0];
    var source = eventObj.source;
    var message = eventObj.message;

    // request log
    console.log('======================', new Date() ,'======================');
    console.log('[request]', req.body);
    console.log('[request source] ', eventObj.source);
    console.log('[request message]', eventObj.message);
    
    language = detect_language(message.text);
    if (language == "Koeran") language_index = 0;
    else if (language == "English") language_index = 1;


    var food = food_menu_arr.find(element => element.index ==  message.text || element.kr_name == message.text || element.en_name == message.text.toLowerCase());
    
    if (message.text == "메뉴" || message.text.toLowerCase() == "menu"){    
        request.post(
            {
                url: REPLY_TARGET_URL,
                headers: {
                    'Authorization': `Bearer ${TOKEN}`
                },
                json: {
                    "replyToken": eventObj.replyToken,
                    "messages":[
                        {
                            "type": "flex",
                            "altText": "this is a flex message",
                            "contents": {
                                "type": "bubble",
                                "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                        {
                                            "type":"box",
                                            "layout":"horizontal",
                                            "contents":[
                                                food_layout_row(food_menu_arr[0][message_object.food_name_version[language_index]]),
                                                food_layout_row(food_menu_arr[1][message_object.food_name_version[language_index]]),
                                                food_layout_row(food_menu_arr[2][message_object.food_name_version[language_index]])
                                            ]
                                        },
                                        {
                                            "type":"box",
                                            "layout":"horizontal",
                                            "contents":[
                                                food_layout_row(food_menu_arr[3][message_object.food_name_version[language_index]]),
                                                food_layout_row(food_menu_arr[4][message_object.food_name_version[language_index]]),
                                                food_layout_row(food_menu_arr[5][message_object.food_name_version[language_index]])    
                                            ]
                                        },
                                        {
                                            "type":"box",
                                            "layout":"horizontal",
                                            "contents":[
                                                food_layout_row(food_menu_arr[6][message_object.food_name_version[language_index]]),
                                                food_layout_row(food_menu_arr[7][message_object.food_name_version[language_index]]),
                                                food_layout_row(food_menu_arr[8][message_object.food_name_version[language_index]])
                                            ]
                                    }
                                    ]
                                  }
                              }
                        }
                            
                          
                    ]
                  }
            }, (error, response, body) => {
                console.log(body);
            }
        )
    } 
    else if (food !=  undefined){
        request.post(
            {
                url: REPLY_TARGET_URL,
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                },
                json: {
                    "replyToken":eventObj.replyToken,
                    "messages":[
                        {
                            "type": "location",
                            "title": "my location",
                            "address": "1-6-1 Yotsuya, Shinjuku-ku, Tokyo, 160-0004, Japan",
                            "latitude": 37.5666805,
                            "longitude": 126.9784147139
                        }
                    ]
                }
            },(error, response, body) => {
                console.log(body)
            });
    }
    else{
        request.post(
            {
                url:REPLY_TARGET_URL,
                headers:{
                    'Authorization' :`Bearer ${TOKEN}`
                },
                json:{
                    "replyToken": eventObj.replyToken,
                    "messages":[
                        {
                            "type" : "text",
                            "text": message_object.request_error[language_index]
                        },
                    ]
                }
            }    
        )
    }
    
    res.sendStatus(200);
});

function detect_language(message){
    if (message.match(/^[a-z|A-Z]+$/)){
        return "English"
    }
    else if (message.match(/^[가-힣]+$/)){
        return "Korean"
    }
}

function food_row_layout(food){
    return {
        "type": "button",
        "action": {
        "type": "message",
        "label": food,
        "text": food
        },
        "style": "secondary",
        "color": "#EEEEEE"
    }
}

try {
    const option = {
        ca: fs.readFileSync('/etc/letsencrypt/live/' + domain +'/fullchain.pem'),
        key: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/privkey.pem'), 'utf8').toString(),
        cert: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + domain +'/cert.pem'), 'utf8').toString(),
    };
    
    HTTPS.createServer(option, app).listen(sslport, () => {
        console.log(`[HTTPS] Server is started on port ${sslport}`);
    });
    } catch (error) {
    console.log('[HTTPS] HTTPS 오류가 발생하였습니다. HTTPS 서버는 실행되지 않습니다.');
    console.log(error);
    }