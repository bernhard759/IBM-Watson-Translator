// imoort
const express = require("express");
const dotenv = require("dotenv");

// configure dotenv
dotenv.config();

// app
const app = new express();

// port
const port = process.env.PORT || 3000;

// global mw
app.use(express.static("public"));


// get ibm watson language translator
function getLanguageTranslator() {
    let api_key = process.env.API_KEY;
    let api_url = process.env.API_URL;

    const LanguageTranslatorV3 = require("ibm-watson/language-translator/v3");
    const { IamAuthenticator } = require("ibm-watson/auth");

    const languageTranslator = new LanguageTranslatorV3({
        version: "2018-05-01",
        authenticator: new IamAuthenticator({
            apikey: api_key,
        }),
        serviceUrl: api_url,
    });
    return languageTranslator;
}

// translate text
function translateR(textToTranslate, res) {
    let languageTranslator = getLanguageTranslator();

    const translateParams = {
        text: textToTranslate,
        modelId: "en-de",
    };

    // return promise
    languageTranslator.translate(translateParams)
        .then(translationResult => {
            res.send(translationResult.result.translations[0].translation);
        }).catch(err => {
            res.send(err.toString());
        });
}

// get languages
function getLanguages(res) {
    let languageTranslator = getLanguageTranslator();
    languageTranslator.listModels()
        .then(translationModels => {
            let models = translationModels.result.models;
            let modelNames = models.map((model) => {
                return model.name
            });
            res.send(modelNames);
        })
        .catch(err => {
            res.send(err.toString());
        });
}


// route
app.get("/", (req, res) => {
    res.sendFile('public/translate.html', { root: __dirname });
});


// route
app.get("/translate", (req, res) => {
    let textToTranslate = req.query.textToTranslate;
    translateR(textToTranslate, res);
});

// route
app.get("/translators", (req, res) => {
    getLanguages(res);
});

// listen
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`)
})