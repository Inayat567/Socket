const { app, BrowserWindow } = require("electron");
const mainApp = require('./Twilio/src/sendMessage/start');

const createWindow = () => {
  const window = new BrowserWindow({
    title: "WhatsApp",
    backgroundColor: "green",
    icon: "./Twilio/src/assets/Images/Inayat.JPG",
    titleBarOverlay: {
      color: "#2f3241",
      symbolColor: "#74b1be",
      height: 60,
    },
    width: 800,
    height: 600,
  });
  window.loadFile('index.html');  //mainApp
};

app.on("ready", () => createWindow());

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
