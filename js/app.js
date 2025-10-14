// app.js - 主应用逻辑
import { songs } from './songs.js';

class GuitarChartApp {
    constructor() {
        this.currentView = 'list';
        this.scrolling = false;
        this.scrollSpeed = 1; // 保持1.0x显示
        this.scrollInterval = null;
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

        backBtn.addEventListener('click', () => this.showSongsList());
        playPauseBtn.addEventListener('click', () => this.toggleScroll());
        speedUpBtn.addEventListener('click', () => this.changeSpeed(0.2));
        slowDownBtn.addEventListener('click', () => this.changeSpeed(-0.2));
        
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
            <p>演唱者: ${song.artist}</p>
            <p>点击查看吉他谱</p>
        `;
        
        card.addEventListener('click', () => this.showSong(song, true)); // true表示更新URL
        
        return card;
    }

    showSong(song, updateURL = true) {
        const songsListView = document.getElementById('songsListView');
        const songDisplayElement = document.getElementById('songDisplay');
        const songTitleElement = document.getElementById('songTitle');
        const songArtistElement = document.getElementById('songArtist');
        const songContentElement = document.getElementById('songContent');
        
        // 隐藏歌曲列表，显示歌曲内容
        songsListView.style.display = 'none';
        songDisplayElement.style.display = 'block';
        
        // 设置歌曲信息
        songTitleElement.textContent = song.title;
        songArtistElement.textContent = `演唱者: ${song.artist}`;
        songContentElement.textContent = song.content;
        
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
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new GuitarChartApp();
});