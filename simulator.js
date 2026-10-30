
const URL = 'http://localhost:3000/api/readings';

console.log('Simulator sensor dimulai...');

setInterval(async () => {
    const data = {
        device_id: 'GH-01',
        suhu: +(25 + Math.random() * 12).toFixed(1),
        kelembapan: +(60 + Math.random() * 25).toFixed(1)
    };

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Data berhasil dikirim:', result.data);
        } else {
            console.log('Gagal mengirim data:', result);
        }

    } catch (error) {
        console.error('Kesalahan koneksi:', error.message);
    }

}, 5000);
