const goValid = require('../lib/validation');
const getData = require('../lib/getData');
const md5 = require('md5');
const Jwt = require('@hapi/jwt');
const { v4: uuidv4 } = require('uuid');

//Temporary Storage
let temp_storage = [{
    email: "test@gmail.com",
    password: "cc03e747a6afbbcbf8be7668acfebee5"
}];

exports.register = (server, options, next) => {
    //Register
    server.route({
        method: 'POST',
        path: '/register',
        options: {
            auth: false
        },
        handler: (req, h) => {
            let pl = req.payload;
            let user_check = true;
            let userData = {};
            if(goValid.isRegValid(JSON.stringify(pl))){
                temp_storage.forEach(item => {
                    if(item.email == pl.email){
                        user_check = false;
                    }
                })
                if(user_check){
                    for (var key in pl){
                        if(key == "password"){
                            userData[key] = md5(pl[key]);
                        }else{
                            userData[key] = pl[key];
                        }
                    }
                    userData["id"] = uuidv4();
                    let createTime = new Date().toISOString();
                    userData["createdAt"] = createTime;
                    temp_storage.push(userData);
                    return h.response({
                        statusCode: 201,
                        message: "Registration Success"
                    }).code(201);
                }else{
                    return h.response({
                        statusCode: 400,
                        message: "User Already Exists"
                    }).code(400);
                }
            }else{
                return h.response({
                    statusCode: 400,
                    message: "Invalid Payload"
                }).code(400);
            }

        }
    });
    // Login
    server.route({
        method: 'POST',
        path: '/login',
        options: {
            auth: false
        },
        handler: function (req, h) {
            let pl = req.payload;
            let userData;
            temp_storage.forEach(item => {
                if(item.email == pl.email){
                    if(item.password == md5(pl.password)){
                        userData = item;
                    }
                }
            })
            if(userData){
                let token = Jwt.token.generate({
                        aud: 'urn:audience:test',
                        iss: 'urn:issuer:test',
                        user: userData.email,
                        group: 'tech_task'
                    }, {
                        key: 'secret_test_task',
                        algorithm: 'HS512'
                    },
                    {
                        ttlSec: 14400
                    })
                return h.response({
                    statusCode: 200,
                    message: "Login Success",
                    token: token
                }).code(200);
            }else{
                return h.response({
                    statusCode: 400,
                    message: "Invalid Credential"
                }).code(400);
            }
        }
    });

    // Get the list of all posts
    server.route({
        method: 'GET',
        path: '/posts',
        handler: async (req, h) => {
            let url = "https://dinotest.wpengine.com/wp-json/wp/v2/posts";
            let posts = await getData.getPost(url);
            if(posts.status == 200){
                let post_list = [];
                posts.data.forEach(item => {
                    post_list.push({
                        id: item.id,
                        title: item.title
                    })
                })
                return h.response({
                    statusCode: 200,
                    data: post_list
                }).code(200);
            }else{
                return h.response({
                    statusCode: 400,
                    message: "Request Failed"
                }).code(400);
            }
        }
    });

    //Get post by id
    server.route({
        method: 'GET',
        path: '/posts/{id}',
        handler: async (req, h) => {
            let url = "https://dinotest.wpengine.com/wp-json/wp/v2/posts";
            let posts = await getData.getPost(url);
            let id = req.params.id;
            if(posts.status == 200){
                let post_detail;
                posts.data.forEach(item => {
                    if(item.id == id){
                        post_detail = item;
                    }
                })
                if(post_detail){
                    return h.response({
                        statusCode: 200,
                        data: post_detail
                    }).code(200);
                }else{
                    return h.response({
                        statusCode: 404,
                        data: "Not Found Post"
                    }).code(404);
                }
            }else{
                return h.response({
                    statusCode: 400,
                    message: "Request Failed"
                }).code(400);
            }
        }
    });
};

exports.register.attributes = {
    pkg: require('./package.json')
};