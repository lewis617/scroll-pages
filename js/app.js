// app.js - 主应用逻辑
import { songs } from './songs.js';

class GuitarChartApp {
    constructor() {
        this.currentView = 'list';
        this.scrolling = false;
        this.scrollSpeed = 1; // 保持1.0x显示
        this.scrollInterval = null;
        this.showingNumerals = false; // 是否显示级数
        this.currentSong = null; // 当前歌曲
        this.originalContent = ''; // 原始和弦内容
        this.init();
    }

    init() {
        this.bindEvents();
        // 检查URL参数，如果有歌曲ID则显示对应歌曲，否则显示列表
        this.handleInitialRoute();
    }

    handleInitialRoute() {
        const urlParams = new URLSearchParams(window.location.search);
        const songId = urlParams.get('song');
        
        if (songId) {
            const song = this.findSongById(songId);
            if (song) {
                this.showSong(song, false); // false表示不更新URL
                return;
            }
        }
        
        // 如果没有找到歌曲或没有songId参数，显示列表
        this.renderSongsList();
    }

    findSongById(songId) {
        return songs.find(song => this.generateSongId(song) === songId);
    }

    generateSongId(song) {
        // 生成基于歌曲标题和艺术家的唯一ID
        return encodeURIComponent(`${song.title}-${song.artist}`.replace(/\s+/g, '-').toLowerCase());
    }

    updateURL(songId) {
        const newURL = songId ? 
            `${window.location.pathname}?song=${songId}` : 
            window.location.pathname;
        window.history.pushState(null, '', newURL);
    }

    bindEvents() {
        const backBtn = document.getElementById('backBtn');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const speedUpBtn = document.getElementById('speedUpBtn');
        const slowDownBtn = document.getElementById('slowDownBtn');
        const chordToggleBtn = document.getElementById('chordToggleBtn');

        backBtn.addEventListener('click', () => this.showSongsList());
        playPauseBtn.addEventListener('click', () => this.toggleScroll());
        speedUpBtn.addEventListener('click', () => this.changeSpeed(0.2));
        slowDownBtn.addEventListener('click', () => this.changeSpeed(-0.2));
        chordToggleBtn.addEventListener('click', () => this.toggleChordDisplay());
        
        // 处理浏览器的后退/前进按钮
        window.addEventListener('popstate', () => {
            this.handleInitialRoute();
        });
    }

    renderSongsList() {
        const songsListView = document.getElementById('songsListView');
        const songsListElement = document.getElementById('songsList');
        const songDisplayElement = document.getElementById('songDisplay');
        
        // 隐藏歌曲显示，显示歌曲列表
        songDisplayElement.style.display = 'none';
        songsListView.style.display = 'block';
        
        // 停止滚动
        this.stopScroll();
        
        songsListElement.innerHTML = '';
        
        songs.forEach(song => {
            const songCard = this.createSongCard(song);
            songsListElement.appendChild(songCard);
        });
    }

    createSongCard(song) {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
            <p>调性: ${song.key || '未知'}</p>
            <p>点击查看吉他谱</p>
        `;
        
        card.addEventListener('click', () => this.showSong(song, true)); // true表示更新URL
        
        return card;
    }

    showSong(song, updateURL = true) {
        const songsListView = document.getElementById('songsListView');
        const songDisplayElement = document.getElementById('songDisplay');
        const songTitleElement = document.getElementById('songTitle');
        const songKeyInfoElement = document.getElementById('songKeyInfo');
        const songContentElement = document.getElementById('songContent');
        const chordToggleBtn = document.getElementById('chordToggleBtn');
        
        // 隐藏歌曲列表，显示歌曲内容
        songsListView.style.display = 'none';
        songDisplayElement.style.display = 'block';
        
        // 保存当前歌曲和原始内容
        this.currentSong = song;
        this.originalContent = song.content;
        
        // 设置歌曲信息
        songTitleElement.textContent = `${song.title} - ${song.artist}`;
        songKeyInfoElement.textContent = `调性: ${song.key || '未知'}`;
        songContentElement.textContent = song.content;
        
        // 重置和弦显示状态
        this.showingNumerals = false;
        chordToggleBtn.textContent = '级数';
        chordToggleBtn.classList.remove('active');
        
        // 重置滚动状态
        this.stopScroll();
        this.scrollSpeed = 1; // 重置为1.0x显示
        this.updateSpeedDisplay();
        
        // 滚动到顶部
        songContentElement.scrollTop = 0;
        
        this.currentView = 'song';
        
        // 更新URL
        if (updateURL) {
            const songId = this.generateSongId(song);
            this.updateURL(songId);
        }
    }

    showSongsList() {
        this.stopScroll();
        this.renderSongsList();
        this.currentView = 'list';
        // 清除URL参数
        this.updateURL(null);
    }

    toggleScroll() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        const songContent = document.getElementById('songContent');
        
        if (this.scrolling) {
            this.stopScroll();
            playPauseBtn.textContent = '▶';
            playPauseBtn.classList.remove('playing');
        } else {
            this.startScroll();
            playPauseBtn.textContent = '⏸';
            playPauseBtn.classList.add('playing');
        }
    }

    startScroll() {
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
        }
        
        const songContent = document.getElementById('songContent');
        this.scrolling = true;
        
        this.scrollInterval = setInterval(() => {
            if (songContent.scrollTop < songContent.scrollHeight - songContent.clientHeight) {
                // 使用2作为基础速度，让1.0x更慢
                songContent.scrollTop += (this.scrollSpeed * 2);
            } else {
                // 滚动到底部后停止
                this.stopScroll();
                const playPauseBtn = document.getElementById('playPauseBtn');
                playPauseBtn.textContent = '▶';
                playPauseBtn.classList.remove('playing');
            }
        }, 1000);
    }

    stopScroll() {
        this.scrolling = false;
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
    }

    changeSpeed(delta) {
        this.scrollSpeed = Math.max(0.2, Math.min(3, this.scrollSpeed + delta));
        this.updateSpeedDisplay();
    }

    updateSpeedDisplay() {
        const speedDisplay = document.getElementById('speedDisplay');
        speedDisplay.textContent = `速度: ${this.scrollSpeed.toFixed(1)}x`;
    }

    toggleChordDisplay() {
        if (!this.currentSong) return;
        
        const chordToggleBtn = document.getElementById('chordToggleBtn');
        const songContentElement = document.getElementById('songContent');
        
        this.showingNumerals = !this.showingNumerals;
        
        if (this.showingNumerals) {
            // 转换为级数显示
            const numeralContent = this.convertChordsToNumerals(this.originalContent, this.currentSong.key);
            songContentElement.textContent = numeralContent;
            chordToggleBtn.textContent = '和弦';
            chordToggleBtn.classList.add('active');
        } else {
            // 显示原始和弦
            songContentElement.textContent = this.originalContent;
            chordToggleBtn.textContent = '级数';
            chordToggleBtn.classList.remove('active');
        }
    }

    convertChordsToNumerals(content, key) {
        if (!key) return content;
        
        // 定义各调的和弦对应的级数
        const chordToNumeral = this.getChordToNumeralMapping(key);
        
        // 使用正则表达式匹配和弦
        // 匹配常见的和弦格式：大写字母开头，可能包含#、b、m、7、maj7等
        const chordRegex = /\b([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9]*(?:\/[A-G][#b]?)?)\b/g;
        
        return content.replace(chordRegex, (match, chord) => {
            const numeral = chordToNumeral[chord];
            return numeral || match; // 如果找不到对应的级数，保持原和弦
        });
    }

    getChordToNumeralMapping(key) {
        // 定义所有调的和弦到级数的映射
        const keyMappings = {
            'C': {
                'C': 'I', 'Dm': 'ii', 'Em': 'iii', 'F': 'IV', 'G': 'V', 'Am': 'vi', 'Bdim': 'vii°',
                'C7': 'I7', 'Dm7': 'ii7', 'Em7': 'iii7', 'F7': 'IV7', 'G7': 'V7', 'Am7': 'vi7',
                'Cmaj7': 'Imaj7', 'Fmaj7': 'IVmaj7'
            },
            'G': {
                'G': 'I', 'Am': 'ii', 'Bm': 'iii', 'C': 'IV', 'D': 'V', 'Em': 'vi', 'F#dim': 'vii°',
                'G7': 'I7', 'Am7': 'ii7', 'Bm7': 'iii7', 'C7': 'IV7', 'D7': 'V7', 'Em7': 'vi7',
                'Gmaj7': 'Imaj7', 'Cmaj7': 'IVmaj7'
            },
            'D': {
                'D': 'I', 'Em': 'ii', 'F#m': 'iii', 'G': 'IV', 'A': 'V', 'Bm': 'vi', 'C#dim': 'vii°',
                'D7': 'I7', 'Em7': 'ii7', 'F#m7': 'iii7', 'G7': 'IV7', 'A7': 'V7', 'Bm7': 'vi7',
                'Dmaj7': 'Imaj7', 'Gmaj7': 'IVmaj7'
            },
            'A': {
                'A': 'I', 'Bm': 'ii', 'C#m': 'iii', 'D': 'IV', 'E': 'V', 'F#m': 'vi', 'G#dim': 'vii°',
                'A7': 'I7', 'Bm7': 'ii7', 'C#m7': 'iii7', 'D7': 'IV7', 'E7': 'V7', 'F#m7': 'vi7',
                'Amaj7': 'Imaj7', 'Dmaj7': 'IVmaj7'
            },
            'E': {
                'E': 'I', 'F#m': 'ii', 'G#m': 'iii', 'A': 'IV', 'B': 'V', 'C#m': 'vi', 'D#dim': 'vii°',
                'E7': 'I7', 'F#m7': 'ii7', 'G#m7': 'iii7', 'A7': 'IV7', 'B7': 'V7', 'C#m7': 'vi7',
                'Emaj7': 'Imaj7', 'Amaj7': 'IVmaj7'
            },
            'B': {
                'B': 'I', 'C#m': 'ii', 'D#m': 'iii', 'E': 'IV', 'F#': 'V', 'G#m': 'vi', 'A#dim': 'vii°',
                'B7': 'I7', 'C#m7': 'ii7', 'D#m7': 'iii7', 'E7': 'IV7', 'F#7': 'V7', 'G#m7': 'vi7',
                'Bmaj7': 'Imaj7', 'Emaj7': 'IVmaj7'
            },
            'F': {
                'F': 'I', 'Gm': 'ii', 'Am': 'iii', 'Bb': 'IV', 'C': 'V', 'Dm': 'vi', 'Edim': 'vii°',
                'F7': 'I7', 'Gm7': 'ii7', 'Am7': 'iii7', 'Bb7': 'IV7', 'C7': 'V7', 'Dm7': 'vi7',
                'Fmaj7': 'Imaj7', 'Bbmaj7': 'IVmaj7'
            }
        };
        
        return keyMappings[key] || {};
    }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new GuitarChartApp();
});