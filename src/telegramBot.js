const TelegramBot = require('node-telegram-bot-api');

const emoji = require('node-emoji').emoji;

const token = require('./enviroment').token;

const bot = new TelegramBot(token, { polling: true });

const mongo = require('./infra/mongo');

const scrapper = require('./scrapper');

let vetorIds = [];

bot.onText(/\/echo (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const resp = match[1];

    bot.sendMessage(chatId, resp);
});


bot.on('message', async (msg) => {

    const chatId = msg.chat.id;

    if (msg.text === "/echo") {
        bot.sendMessage(chatId, "Pensamento do dia: quem nasceu primeiro, o ovo ou a galinha?");
    } else if (msg.text === "/subscribe") {
        try {
            let client = await mongo.conectarMongoDB();
            let db = client.db("projetoBot");
            let collection = db.collection("users");
            let users = await collection.find({}).toArray();

            for (user of users) {
                if (chatId == user.telegramId) {
                    bot.sendMessage(chatId, "Você já está inscrito!");
                    await mongo.desconectarMongoDB(client);
                    return;
                }
            }
            let newUser = {
                telegramId: chatId,
                firtName: msg.chat.first_name,
                lastName: msg.chat.last_name,
                registerDate: new Date()
            }
            collection.insertOne(newUser, async (err, result) => {
                if (err) {
                    console.log(err);
                    return;
                }
                bot.sendMessage(chatId, "Inscrição realizada!");
                await mongo.desconectarMongoDB(client);
            });
        } catch (e) {
            bot.sendMessage(chatId, "Não foi possível realizar a inscrição!");
            console.log(e);
        }

    } else if (msg.text === "/unsubscribe") {
        try {
            let client = await mongo.conectarMongoDB();
            let db = client.db("projetoBot");
            let collection = db.collection("users");

            await collection.deleteOne({ telegramId: chatId }, async (err, result) => {
                if (err) {
                    console.log(err);
                    bot.sendMessage(chatId, "Erro ao desinscrever você ...");
                } else {
                    bot.sendMessage(chatId, "Desinscrição realizada com sucesso!");
                }
                await mongo.desconectarMongoDB(client);
            });
        } catch (e) {
            console.log(e);
        }
    } else {
        bot.sendMessage(chatId, `Olá, eu sou o projetoBot ${emoji.robot_face}. Estou aqui para auxiliá-lo com seu agendamento.\nAs opções possíveis são:\n\t\t/echo -> Interagir comigo\n\t\t/subscribe -> Você se inscreve para receber atualizações de agendamentos\n\t\t/unsubscribe -> Você para de receber minhas mensagens chatas\nEstou ansioso para interagir com você!`);
    }
});

async function analisaSubscricoesAtualizaDados() {

    let dados = await scrapper();

    try {
        let client = await mongo.conectarMongoDB();
        let db = client.db("projetoBot");
        let collection = db.collection("users");
        let users = await collection.find({}).toArray();

        for (let user of users) {
            bot.sendMessage(user.telegramId, JSON.stringify(dados));
        }
        await mongo.desconectarMongoDB(client);
    } catch (e) {
        console.log(e);
    }
}

const interval = setInterval(analisaSubscricoesAtualizaDados, 30000);
