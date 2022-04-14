/**
Crosby BOT v1.0.0 | Developed by Maestro ALvardo

Fakta unik: Crosby diambil dari nama teman sekelas saya yaitu Oky Crosby dan BOT juga berujuk pada cara 
bermain dia saat bermain game Mobile Legends seperti BOT cuma bisa pake dirot anjg.

Silahkan dikembangkan gayn, fitur nya masih sedikit jadi gak pusing buat nambahin fitur nya.
Kalau bisa gayn fork github ini kalau gayn udah kembangin dan kasih fitur lain.
Jangan lupa fork ya, dan juga kasih star nya.

Btw keyboard gw keras banget tombol nya njir, baru beli kemarin merk VOXY yang murah.
Donasi buat beli keyboard yang bagus: GOPAY,OVO,DANA(0812-6394-5322): A/N Maestro Alvardo

Spesial Trimakasih untuk:
    - Oky Crosby
    - Fery Anggriawan
**/

// Module yang diperlukan import dulu
const qrcode = require('qrcode-terminal');
const urlencode = require('urlencode');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs')
const { error } = require('qrcode-terminal');
const {
    Client,
    LegacySessionAuth,
    List,
    Buttons,
    MessageAck,
    MessageMedia
} = require('whatsapp-web.js');

// Nah ini untuk tempat menyimpan session login nya
const SESSION_FILE_PATH = './session.json';

// Muat data dari session jika ada
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

// Menggunakan data dari session yang tersimpan
const client = new Client({
    authStrategy: new LegacySessionAuth({
        session: sessionData
    })
});

// Menyimpan nilai session setelah autentikasi berhasil
client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});

// Membuat qr code di terminal
client.on('qr', qr => {
    console.log('Silahkan di scan menggunakan aplikasi WhatsApp kamu!');
    qrcode.generate(qr, {small: true});
});

// Mengatakan jika berhasil
client.on('ready', () => {
    console.log('Autentikasi berhasil!');
});

client.on('group_join', async (notification) => {
    // seseorang telah masuk ke grup
    console.log('join', notification);
    const botno = notification.chatId.split('@')[0];
    let number = await notification.id.remote;
    const medias = MessageMedia.fromFilePath('./img/welcome.png'); // bisa di ganti sesuai kesukaan agan, foto selamat datang di grub untuk member baru masuk.
    client.sendMessage(number, medias, {caption: `Hai perkenalkan aku Crosby BOT, selamat datang di group ini, patuhi peraturan grup ya :)`});
    const chats = await client.getChats();

    // mendapatkan pesan di grub
    for (i in chats) {
        if (number == chats[i].id._serialized) {
            chat = chats[i];
        }
    }
    var participants = {};
    var admins = {};
    var i;
    for (let participant of chat.participants) {
        if (participant.id.user == botno) { continue; }
        //participants.push(participant.id.user);
        const contact = await client.getContactById(participant.id._serialized);
        participants[contact.pushname] = participant.id.user;
        // participant needs to send a message for it to be defined
        if (participant.isAdmin) {
            //admins.push(participant.id.user);
            admins[contact.pushname] = participant.id.user;
            client.sendMessage(participant.id._serialized, 'Hai admin, ada member baru di group mu');
            //const media = MessageMedia.fromFilePath('./img/welcome.png');
            //client.sendMessage(participant.id._serialized, media);
        }
    }
    console.log('Group Details');
    console.log('Name: ', chat.name);
    console.log('Participants: ', participants);
    console.log('Admins: ', admins);
    //notification.reply('Halo.'); // sends message to self
});

client.on('message', async (message ) => {
    const chat = await  message.getChat();
    if(message.body == "reply"){
        message.reply('ini pesan reply');
    }else if(message.body == "noreply"){
        client.sendMessage(message.from, 'ini pesan no reply');
    }else if(message.body == "/help1"){
        var PESAN_HELP = "Hai selamat datang, aku Crosby BOT!\ns";
        client.sendMessage(message.from, PESAN_HELP);
    }else if(message.body === '/tagall'){
        //const chat = await message.getChat();
        
        let text = "";
        let mentions = [];

        for(let participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            
            mentions.push(contact);
            text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
    }
});

client.on('message', async message => {
    const chat = await message.getChat();
    const content = message.body
    if(content=="hai"){
        client.sendMessage(message.from, `hai juga @${message.from}`)
    }else if (content === '/help') {
        const chat = await message.getChat();
        let button = new Buttons('*/help* = menampilkan pesan bantuan\n*/katakan* _text_ = mengatakan sesuatu\n*/artinama* _namakamu_ = menampilkan arti dari nama kamu\n*/animepic* = mengirim foto anime secara random\n*/animeh* = mengirim rahasia negara gayn, jangan coba\n\n',[{body:'PEMILIK'},{body:'REKAN'}],'Crosby BOT v1.0.0','Powered by Maestro Alvardo');
        client.sendMessage(message.from, button);
    }else if(content==="PEMILIK"){
        client.sendMessage(message.from, 'Pemilik BOT ini adalah Maestro Alvardo\nBisa dicek profile nya di https://maestroal.me');
    }else if(message.body==="REKAN"){
        client.sendMessage(message.from, 'Rekan, Oky Crosby');
    }else if(message.body.startsWith('/katakan ')){
        client.sendMessage(message.from, message.body.slice(9));
    }else if(message.body.startsWith("/artinama ")){
        var reName = message.body.split("/artinama ")[1];
        var pecah = urlencode(reName.replace(/ /g,"+"));
        var url = 'http://www.primbon.com/arti_nama.php?nama1='+ pecah +'&proses=+Submit%21+';
        axios.get(url)
            .then((result) => {
                let $ = cheerio.load(result.data);
                var y = $.html().split('arti:')[1];
                var t = y.split('method="get">')[1];
                var f = y.replace(t ," ");
                var x = f.replace(/<br\s*[\/]?>/gi, "\n");
                var h  = x.replace(/<[^>]*>?/gm, '');
                console.log(""+h);
                message.reply(`Arti nama *${reName}*\n${h}`);
            });
    }else if(content=="/animepic"){
        const fetch = require("node-fetch");
        const imageToBase64 = require('image-to-base64');
        fetch('https://raw.githubusercontent.com/pajaar/grabbed-results/master/pajaar-2020-gambar-anime.txt')
            .then(res => res.text())
            .then(body => {
                let tod = body.split("\n");
                let pjr = tod[Math.floor(Math.random() * tod.length)];
                imageToBase64(pjr)
                    .then(
                        (response) => {
                            const media = new MessageMedia('image/jpeg', response);
                            client.sendMessage(message.from, media, {
                                caption: `Simpen baik baik ya,`
                            });
                        }
                ).catch(
                    (error) => {
                        console.log(error);
                    }
            );
        });
    }else if(content=="/animepic"){
        const fetch = require("node-fetch");
        const imageToBase64 = require('image-to-base64');
        fetch('https://raw.githubusercontent.com/pajaar/grabbed-results/master/pajaar-2020-gambar-anime.txt')
            .then(res => res.text())
            .then(body => {
                let tod = body.split("\n");
                let pjr = tod[Math.floor(Math.random() * tod.length)];
                imageToBase64(pjr)
                    .then(
                        (response) => {
                            const media = new MessageMedia('image/jpeg', response);
                            client.sendMessage(message.from, media, {
                                caption: `Simpen baik baik ya,`
                            });
                        }
                ).catch(
                    (error) => {
                        console.log(error);
                    }
            );
        });
    }else if(content=="/animeh"){
        var request = require("request")
        var url = "https://api.waifu.pics/nsfw/waifu"
        const imageToBase64 = require('image-to-base64')
        request({
            url: url,
            json: true
        }, function (error, response, body) {

            if (!error && response.statusCode === 200) {
                imageToBase64(body['url'])
                    .then(
                        (response) => {
                            const media = new MessageMedia('image/jpeg', response);
                            client.sendMessage(message.from, media, {
                                caption: `Rahasia negara nih`
                            })
                        }
                    ).catch(
                        (error) => {
                            console.log(error);
                        }
                    )
                console.log(body['url']) // Print the json response
            }
        })
    }else if(content=="/animehen"){
        const fetch = require("node-fetch");
        let settings = {method: "Get"};
        const imageToBase64 = require('image-to-base64');
        fetch('https://api.waifu.pics/nsfw/waifu', settings)
            .then(res => res.json())
            .then(body => {
                let tod = body.split("\n");
                imageToBase64(body)
                    .then(
                        (response) => {
                            const media = new MessageMedia('image/jpeg', response);
                            client.sendMessage(message.from, media, {
                                caption:`Jangan sebarin rahasia negara ya sayang.`
                            })
                        }
                    ).catch(
                        (error) => {
                            console.log(error);
                        }
                    )
            })
    }else if (message.body.startsWith('/gsubject ')) {
        // Change the group subject
        let chat = await message.getChat();
        if (chat.isGroup) {
            let newSubject = message.body.slice(9);
            chat.setSubject(newSubject);
        } else {
            message.reply('Gabisa!');
        }
    }else if(message.body.startsWith('/masukkan ')){
        if(chat.isGroup){
            let numnya = message.body.slice(10);
            if(numnya.indexOf('62')==-1){
                chat.addParticipants([`${numnya.replace('0', '62')}@c.us`]);
                message.reply('Menambahkan...');
            }else{
                message.reply('Gunakan 08xxxxx ya sayang');
            }
            //chat.addParticipants([`${numnya}@c.us`]);
            //message.reply('Menambahkan...');
        }else{
            message.reply('Hanya bisa di grup');
        }
    }else if(message.body.startsWith('/kick ')){
        let target = message.mentionedIds
        if(message.body.slice(6)=="@6281263945322"){
            message.reply('Yang ini jangan dong sayang');
        }else{
            chat.removeParticipants([...target]);
            console.log(target)
        }
        //console.log(message.body.slice(6))
    }
	console.log(message.from,':', message.body);
});
client.on('message', async (msg) => {
    const mentions = await msg.getMentions();
    
    for(let contact of mentions) {
        console.log(`${contact.pushname} was mentioned`);
    }
});


client.initialize();
