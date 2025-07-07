document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTS ---
    const allElements = {
        carousel: document.querySelector('.main-carousel'),
        screenContainer: document.querySelector('.screen-container'),
        appIcons: document.querySelectorAll('.icon-button'),
        sideButton: document.querySelector('.side-button'),
        appLayer: document.querySelector('.app-layer'),
        timeDisplay: document.querySelector('.time-display'),
        dateHeader: document.querySelector('.date-header'),
        calcDisplay: document.querySelector('.calculator-display'),
        calcButtons: document.querySelectorAll('.calc-btn'),
        flashlightContent: document.querySelector('#flashlight-app .flashlight-content'),
        music: {
            app: document.getElementById('music-app'),
            albumArt: document.querySelector('#music-app .album-art'),
            songTitle: document.querySelector('#music-app .song-title'),
            songArtist: document.querySelector('#music-app .song-artist'),
            progressContainer: document.querySelector('#music-app .progress-container'),
            progress: document.querySelector('#music-app .progress'),
            currentTimeEl: document.querySelector('#music-app .current-time'),
            totalTimeEl: document.querySelector('#music-app .total-time'),
            prevBtn: document.getElementById('prev-btn'),
            playPauseBtn: document.querySelector('.play-pause-btn'),
            nextBtn: document.getElementById('next-btn'),
            audioPlayer: document.getElementById('audio-player')
        }
    };

    // --- STATE ---
    let currentIndex = 0, isDragging = false;
    let startPos = 0, currentTranslate = 0, prevTranslate = 0;

    // --- 1. REAL-TIME CLOCK ---
    function updateTime() { const now = new Date(); allElements.timeDisplay.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']; allElements.dateHeader.textContent = `${months[now.getMonth()]} ${now.getDate()} ${days[now.getDay()]}`; }
    setInterval(updateTime, 1000); updateTime();

    // --- 2. SWIPE NAVIGATION ---
    function dragStart(e) { isDragging = true; startPos = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX; allElements.carousel.style.transition = 'none'; allElements.screenContainer.style.cursor = 'grabbing'; }
    function drag(e) { if (!isDragging) return; const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX; currentTranslate = prevTranslate + currentPosition - startPos; allElements.carousel.style.transform = `translateX(${currentTranslate}px)`; }
    function dragEnd() { if (!isDragging) return; isDragging = false; const movedBy = currentTranslate - prevTranslate; if (movedBy < -50 && currentIndex === 0) currentIndex = 1; if (movedBy > 50 && currentIndex === 1) currentIndex = 0; updateCarouselPosition(); allElements.screenContainer.style.cursor = 'grab'; }
    function updateCarouselPosition() { const screenWidth = allElements.screenContainer.clientWidth; currentTranslate = -currentIndex * screenWidth; prevTranslate = currentTranslate; allElements.carousel.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'; allElements.carousel.style.transform = `translateX(${currentTranslate}px)`; }
    allElements.screenContainer.addEventListener('mousedown', dragStart); allElements.screenContainer.addEventListener('mousemove', drag); window.addEventListener('mouseup', dragEnd);
    allElements.screenContainer.addEventListener('touchstart', dragStart, { passive: true }); allElements.screenContainer.addEventListener('touchmove', drag, { passive: true }); allElements.screenContainer.addEventListener('touchend', dragEnd);

    // --- 3. APP MANAGEMENT ---
    function openApp(appId) { closeAllApps(); const appToShow = document.getElementById(appId); if (appToShow) appToShow.classList.add('visible'); }
    function closeAllApps() { document.querySelectorAll('.app-screen.visible').forEach(app => app.classList.remove('visible')); if (allElements.music.audioPlayer && !allElements.music.audioPlayer.paused) allElements.music.audioPlayer.pause(); }
    allElements.appIcons.forEach(icon => icon.addEventListener('click', () => openApp(icon.dataset.app)));
    allElements.sideButton.addEventListener('click', () => { if (allElements.appLayer.querySelector('.app-screen.visible')) { closeAllApps(); } else { currentIndex = (currentIndex === 1) ? 0 : 1; updateCarouselPosition(); } });

    // --- 4. CALCULATOR ---
    let firstValue = '', operator = '', shouldResetDisplay = false;
    function calculate(n1, op, n2) { const num1 = parseFloat(n1), num2 = parseFloat(n2); if (op === '+') return num1 + num2; if (op === '-') return num1 - num2; if (op === '×') return num1 * num2; if (op === '÷') return num2 === 0 ? 'Error' : num1 / num2; }
    allElements.calcButtons.forEach(button => { button.addEventListener('click', (e) => { const value = e.target.innerText; const type = e.target.classList.contains('operator') ? 'operator' : e.target.classList.contains('utility') ? 'utility' : 'number'; if (type === 'number' || value === '.') { if (shouldResetDisplay || allElements.calcDisplay.textContent === 'Error') { allElements.calcDisplay.textContent = ''; shouldResetDisplay = false; } if (allElements.calcDisplay.textContent === '0' && value !== '.') allElements.calcDisplay.textContent = value; else if (!(value === '.' && allElements.calcDisplay.textContent.includes('.'))) allElements.calcDisplay.textContent += value; } if (type === 'operator' && value !== '=') { if (firstValue && operator && !shouldResetDisplay) { const result = calculate(firstValue, operator, allElements.calcDisplay.textContent); allElements.calcDisplay.textContent = result; firstValue = result; } else { firstValue = allElements.calcDisplay.textContent; } operator = value; shouldResetDisplay = true; } if (value === '=') { if (!operator || !firstValue) return; allElements.calcDisplay.textContent = calculate(firstValue, operator, allElements.calcDisplay.textContent); firstValue = ''; operator = ''; shouldResetDisplay = true; } if (type === 'utility') { if (value === 'C') { firstValue = ''; operator = ''; allElements.calcDisplay.textContent = '0'; } else if (value === '%') allElements.calcDisplay.textContent = parseFloat(allElements.calcDisplay.textContent) / 100; else if (value === '±') allElements.calcDisplay.textContent = parseFloat(allElements.calcDisplay.textContent) * -1; } }); });

    // --- 5. ADVANCED MUSIC PLAYER ---
    const playlist = [{ title: 'Blinding Lights', artist: 'GordXRohit', src: 'songs/1.mp3', art: '1.jpg' },
    { title: 'Die With Smile', artist: 'GordXRohit', src: 'songs/2.mp3', art: '2.jpg' },
    { title: 'Shape of You ', artist: 'GordXRohit', src: 'songs/3.mp3', art: '3.jpg' }];
    let songIndex = 0;
    function loadSong(song) { allElements.music.songTitle.textContent = song.title; allElements.music.songArtist.textContent = song.artist; allElements.music.audioPlayer.src = song.src; allElements.music.albumArt.style.backgroundImage = `url(${song.art})`; }
    function playSong() { allElements.music.audioPlayer.play().catch(error => console.error("Play failed:", error)); }
    function pauseSong() { allElements.music.audioPlayer.pause(); }
    function nextSong() { songIndex = (songIndex + 1) % playlist.length; loadSong(playlist[songIndex]); playSong(); }
    function prevSong() { songIndex = (songIndex - 1 + playlist.length) % playlist.length; loadSong(playlist[songIndex]); playSong(); }
    function updateProgress(e) { const { duration, currentTime } = e.srcElement; const progressPercent = (currentTime / duration) * 100; allElements.music.progress.style.width = `${progressPercent}%`; const formatTime = (time) => { const minutes = Math.floor(time / 60); const seconds = Math.floor(time % 60); return `${minutes}:${String(seconds).padStart(2, '0')}`; }; if (duration) allElements.music.totalTimeEl.textContent = formatTime(duration); allElements.music.currentTimeEl.textContent = formatTime(currentTime); }
    function setProgress(e) { const width = this.clientWidth; const clickX = e.offsetX; const duration = allElements.music.audioPlayer.duration; if (duration) allElements.music.audioPlayer.currentTime = (clickX / width) * duration; }
    allElements.music.playPauseBtn.addEventListener('click', () => { const isPlaying = !allElements.music.audioPlayer.paused; if (isPlaying) pauseSong(); else playSong(); });
    allElements.music.nextBtn.addEventListener('click', nextSong);
    allElements.music.prevBtn.addEventListener('click', prevSong);
    allElements.music.audioPlayer.addEventListener('timeupdate', updateProgress);
    allElements.music.audioPlayer.addEventListener('ended', nextSong);
    allElements.music.progressContainer.addEventListener('click', setProgress);
    allElements.music.audioPlayer.addEventListener('play', () => allElements.music.playPauseBtn.classList.replace('fa-play', 'fa-pause'));
    allElements.music.audioPlayer.addEventListener('pause', () => allElements.music.playPauseBtn.classList.replace('fa-pause', 'fa-play'));
    loadSong(playlist[songIndex]); // Initial load

    // --- 6. FLASHLIGHT ---
    let isFlashlightOn = true;
    allElements.flashlightContent.addEventListener('click', () => { isFlashlightOn = !isFlashlightOn; allElements.flashlightContent.style.backgroundColor = isFlashlightOn ? 'white' : '#222'; allElements.flashlightContent.style.color = isFlashlightOn ? 'black' : 'white'; allElements.flashlightContent.querySelector('p').textContent = `Flashlight ${isFlashlightOn ? 'On' : 'Off'}`; });
});
