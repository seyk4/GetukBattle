// Database Karakter
const karakterDB = {
    coklat: { id: 'coklat', nama: "Getuk Coklat", warna: "#8B4513", topping: "#3e2723", senjata: "🍴", skill1: "Tabrak Garpu", skill2: "Lompat Geprek" },
    matcha: { id: 'matcha', nama: "Getuk Matcha", warna: "#6B8E23", topping: "#F5F5DC", senjata: "🥢", skill1: "Lempar Sumpit", skill2: "Bantingan Hijau" },
    kelapa: { id: 'kelapa', nama: "Getuk Kelapa", warna: "#DEB887", topping: "#FFF8DC", senjata: "🥄", skill1: "Geprek Sendok", skill2: "Lemparan Kelapa" }
};

function buatChibiHTML(kar, isPlayer2 = false) {
    let weaponStyle = isPlayer2 ? "right: auto; left: -25px; transform: scaleX(-1) rotate(15deg);" : "";
    return `
        <div class="chibi" style="background: ${kar.warna};">
            <div class="topping" style="background: ${kar.topping};"></div>
            <div class="face">
                <div class="eye left"></div>
                <div class="eye right"></div>
                <div class="blush left"></div>
                <div class="blush right"></div>
                <div class="mouth"></div>
            </div>
            <div class="weapon" style="${weaponStyle}">${kar.senjata}</div>
            <div class="shadow-floor"></div>
        </div>
    `;
}

const charGrid = document.getElementById('char-grid');
Object.values(karakterDB).forEach(kar => {
    let card = document.createElement('div');
    card.className = 'char-card';
    card.style.borderColor = kar.warna;
    card.innerHTML = buatChibiHTML(kar) + `<div class="name">${kar.nama}</div>`;
    card.onclick = () => chooseCharacter(kar.id);
    charGrid.appendChild(card);
});

let playerMemilih = 1; 
let p1Karakter = null, p2Karakter = null;
let hpP1 = 100, hpP2 = 100;
let isPlayer1Turn = true, isAnimating = false;

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function goToSelectScreen() {
    playerMemilih = 1;
    document.getElementById('select-title').innerText = "Player 1, Pilih Jagoanmu!";
    document.getElementById('select-title').style.color = "#ff4757";
    showScreen('screen-select');
}

function chooseCharacter(idKarakter) {
    if (playerMemilih === 1) {
        p1Karakter = karakterDB[idKarakter];
        playerMemilih = 2;
        document.getElementById('select-title').innerText = "Player 2, Pilih Jagoanmu!";
        document.getElementById('select-title').style.color = "#1e90ff"; 
    } else {
        p2Karakter = karakterDB[idKarakter];
        mulaiBattle();
    }
}

function mulaiBattle() {
    hpP1 = 100; hpP2 = 100;
    isPlayer1Turn = true; isAnimating = false;
    document.getElementById('popup').style.display = 'none';

    document.getElementById('player1').innerHTML = buatChibiHTML(p1Karakter, false);
    document.getElementById('hp-text-p1').innerText = "P1: " + p1Karakter.nama;
    document.getElementById('hp-bar-p1').style.width = '100%';

    document.getElementById('player2').innerHTML = buatChibiHTML(p2Karakter, true);
    document.getElementById('hp-text-p2').innerText = "P2: " + p2Karakter.nama;
    document.getElementById('hp-bar-p2').style.width = '100%';

    renderButtons();
    showScreen('screen-battle');
}

function renderButtons() {
    const btnArea = document.getElementById('action-buttons');
    const statText = document.getElementById('status');
    
    let charActive = isPlayer1Turn ? p1Karakter : p2Karakter;
    statText.innerText = `Giliran ${isPlayer1Turn ? 'P1' : 'P2'}: ${charActive.nama}`;
    statText.style.color = charActive.warna;
    
    let pName = isPlayer1Turn ? 'p1' : 'p2';
    // Angka 15 dan 25 di bawah ini sekarang adalah BASE DAMAGE (Damage Rata-rata)
    btnArea.innerHTML = `
        <button class="skill-btn" style="background:${charActive.warna};" onclick="attack('${pName}', 'maju', 15)">${charActive.senjata} ${charActive.skill1}</button>
        <button class="skill-btn" style="background:${charActive.warna};" onclick="attack('${pName}', 'lompat', 25)">💥 ${charActive.skill2}</button>
    `;
}

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function attack(attacker, skillType, baseDamage) {
    if (isAnimating) return; 
    isAnimating = true;
    document.getElementById('action-buttons').innerHTML = ""; 

    // Rumus: Base Damage ditambah angka acak dari -5 sampai +5
    // Contoh: Jika Base 15, damage akhir berkisar antara 10 s/d 20
    let randomDamage = baseDamage + Math.floor(Math.random() * 11) - 5;

    let attackerEl = attacker === 'p1' ? document.getElementById('player1') : document.getElementById('player2');
    let targetHitEl = attacker === 'p1' ? document.getElementById('hit-p2') : document.getElementById('hit-p1');
    let animClass = attacker === 'p1' ? `p1-${skillType}` : `p2-${skillType}`;
    const statText = document.getElementById('status'); 

    // Animasi Maju
    attackerEl.classList.add(animClass);
    await delay(400); 

    // Efek Ledakan Muncul
    targetHitEl.classList.add('hit-show');
    
    // Kurangi HP & Tampilkan Notifikasi Damage di layar
    if (attacker === 'p1') {
        hpP2 = Math.max(0, hpP2 - randomDamage);
        document.getElementById('hp-bar-p2').style.width = hpP2 + '%';
        statText.innerText = `Terkena ${randomDamage} Damage!`;
        statText.style.color = "#ff4757"; // Berubah merah saat kena hit
    } else {
        hpP1 = Math.max(0, hpP1 - randomDamage);
        document.getElementById('hp-bar-p1').style.width = hpP1 + '%';
        statText.innerText = `Terkena ${randomDamage} Damage!`;
        statText.style.color = "#ff4757";
    }

    // Jeda sedikit lebih lama agar pemain sempat membaca angka damagenya
    await delay(600); 

    // Karakter Mundur
    targetHitEl.classList.remove('hit-show');
    attackerEl.classList.remove(animClass);
    await delay(400); 

    // Cek Kemenangan
    if (hpP1 === 0 || hpP2 === 0) {
        munculkanPemenang();
        return; 
    }

    // Ganti Giliran
    isPlayer1Turn = !isPlayer1Turn;
    renderButtons(); // Teks status akan kembali normal menampilkan nama giliran
    isAnimating = false;
}

function munculkanPemenang() {
    document.getElementById('popup').style.display = 'block';
    let winnerTeks = document.getElementById('winner-text');
    
    // --- DISKON ACAK KHUSUS 10, 20, 30 ---
    const pilihanDiskon = [10, 20, 30];
    const diskonAcak = pilihanDiskon[Math.floor(Math.random() * pilihanDiskon.length)];
    
    document.getElementById('discount-code').innerText = diskonAcak + "%";
    
    if (hpP2 === 0) {
        winnerTeks.innerText = 'Player 1 Menang!';
        winnerTeks.style.color = p1Karakter.warna;
    } else {
        winnerTeks.innerText = 'Player 2 Menang!';
        winnerTeks.style.color = p2Karakter.warna;
    }
}

function resetGame() { goToSelectScreen(); }