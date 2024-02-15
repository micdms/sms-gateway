import { SerialPort } from 'serialport';
import { customAlphabet } from 'nanoid';
import fs from 'fs/promises';

const port = new SerialPort({
    path: 'COM3',
    baudRate: 115200
});

// Menuliskan perintah 'AT' ke port serial

const sendATCommand = async (command) => {
    return new Promise((resolve, reject) => {
        port.write(command + '\r\n', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const delay = (milliseconds) => {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
};



// Buat fungsi untuk membuat string acak dengan nanoid
const generateToken = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const nanoid = customAlphabet(alphabet, 21); // Panjang string yang dihasilkan adalah 10 karakter
    return nanoid();
};


const OTP = async (telephone) => {
    const token = generateToken()
    try {
        await sendATCommand('AT+CMGF=1'); // Mengatur mode teks untuk SMS
        console.log('SMS mode set successfully');
        await delay(1000);
        await sendATCommand(`AT+CMGS="${telephone}"`); // Mengatur nomor penerima
        console.log('Recipient number set successfully');
        await delay(1000);
        await sendATCommand('test');
        // Isi SMS yang akan dikirim
        // await sendATCommand('Gunakan URL ini'); // Isi SMS yang akan dikirim
        // await sendATCommand('Untuk memverifikasi Anda');
        // await sendATCommand(`https://deltamas-solusindo.com/verifikasi/${token}`);
        // await sendATCommand('');
        // await sendATCommand('Hanya berlaku 5 menit');
        // await sendATCommand('PT DELTAMAS SOLUSINDO');
        console.log('SMS content sent successfully');
        await delay(1000);
        await sendATCommand(String.fromCharCode(26)); // Mengirim karakter Ctrl+Z untuk mengakhiri SMS
        console.log('Ctrl+Z sent successfully');
    } catch (error) {
        console.error('Error:', error);
    }

    return [telephone, token];
};

port.on('open', async () => {
    // Membaca SMS yang masuk
    port.write('AT+CMGF=1\r\n'); // Mengatur mode teks
    delay(1000);
    while (true) {
        port.write('AT+CMGL="REC UNREAD"\r\n'); // Membaca SMS yang belum dibaca
        await delay(60000);
    };
});
// Event listener untuk menerima data dari port serial


// Membuat objek untuk menyimpan data
let receivedDataArray = [];

// Mendengarkan data yang masuk dari port
port.on('data', (data) => {
    const receivedData = data.toString();
    console.log(`Received data: ${receivedData}`);

    // Menambahkan data ke dalam array
    receivedDataArray.push({
        receivedData: receivedData,
        timestamp: new Date().toISOString()
    });

    // Menyimpan data ke dalam file JSON
    saveDataToJson();
});

// Fungsi untuk menyimpan data ke dalam file JSON
function saveDataToJson() {
    const fileName = 'smsData.json';
    const jsonData = JSON.stringify(receivedDataArray);

    fs.writeFile(fileName, jsonData, (err) => {
        if (err) {
            console.error('Gagal menyimpan file:', err);
            return;
        }
        console.log('Data berhasil disimpan ke dalam file', fileName);
    });
}


export { OTP };