const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const { Mimetype } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const { hidePrivateData } = require("../utils/utils");
// const {React}  = require('react');
// const fs = require("fs");
const cron = require("node-cron");

const store = {};
let globalSock;

const getMessage = (key) => {
  const { id } = key;
  if (store[id]) {
    return store[id].message;
  }
};

const getText = (message) => {
  try {
    return message.conversation || message.extendedTextMessage?.text;
  } catch (e) {
    console.log("Error While getting text: ", e);
    return "";
  }
};

const sendMessage = async (jid, message) => {
  try {
    let finalMessage;
    if (message.type == "text") {
      finalMessage = { text: message.content };
    } else if (message.type == "document") {
      finalMessage = {
        document: { url: message.content },
        mimetype: "application/pdf",
        filename: "Bakery Detail Sample.pdf",
      };
    } else if (message.type == "image") {
      finalMessage = {
        image: { url: message.content },
      };
    } else if (message.type == "audio") {
      (finalMessage = {
        audio: { url: message.content },
        mimetype: "audio/mp4",
      }),
        { url: message.content };
    }

    const sent = await globalSock?.sendMessage(jid, finalMessage);
    store[sent.key.id] = sent;
  } catch (e) {
    console.log("Error is Sending Message : ", e);
  }
};

const ReplyMessage = async (msg) => {
  const { key, message } = msg;
  const text = getText(message);

  const prefix = "need";

  if (!text?.toLowerCase().startsWith(prefix)) return;

  const replyMessage = {
    //for Text
    type: "text",
    content: "آپ کی ادائیگی 2000 روپے موصول آپ کے بقایا جات 1500 روپے ہیں۔",

    //for Docmument
    // type: 'document',
    // content: './dummy.pdf',

    //for Image
    // type: 'image',
    // content: './logo.jpeg',

    //for Audio
    // type: 'audio',
    // content: './voice.ogg',
  };
  console.log("120363026085704523@g.us", key.remoteJid);
  sendMessage(key.remoteJid, replyMessage); //923435339100@s.whatsapp.net //key.remoteJid,
};

//Below code segment is used for periodically send message

// const task = cron.schedule("0 29 18 * * *", () => {
//   const dailyMessage = {
//     type: "text",
//     content: "آپ کی ادائیگی 2000 روپے موصول آپ کے بقایا جات 1500 روپے ہیں۔",
//     // type: 'audio',
//     // content: './sample.mp3',
//   };
//   sendMessage("923000603149-1598644280@g.us", dailyMessage); //120363026085704523@g.us

//   console.log("Time message");
// });

async function ChatToWhatsApp({ setIsConnected }) {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    getMessage,
  });
  globalSock = sock;

  sock.ev.process(async (events) => {
    if (events["connection.update"]) {
      const { connection, lastDisconnect } = events["connection.update"];
      if (connection === "close") {
        setIsConnected(false);
        if (
          lastDisconnect?.error?.output?.statusCode !==
          DisconnectReason.loggedOut
        ) {
          ChatToWhatsApp();
        } else {
          console.log("Disconnected! You are Logout");
        }
      } else {
        setIsConnected(true);
      }
    }

    if (events["creds.update"]) {
      await saveCreds();
    }

    if (events["messages.upsert"]) {
      const { messages } = events["messages.upsert"];

      messages.forEach((message) => {
        console.log(message);
        if (!message.message) return;
        console.log(hidePrivateData(message));
        // ReplyMessage(message);
      });
    }
  });
}

ChatToWhatsApp();

// const MainApp = () => {
//   const [isConnected, setIsConnected] = React.useState < boolean > false;
//   React.useEffect(() => {
//     ChatToWhatsApp((setIsConnected = { setIsConnected }));
//   });

//   return (
//     <div>
//       <div>
//         <text>Connection Status = {isConnected}</text>
//         <button>Start</button>
//         <button>Stop</button>
//         <button>Resume</button>
//       </div>
//     </div>
//   );
// };

// export default MainApp;
