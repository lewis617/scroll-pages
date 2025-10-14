// app.js - 主应用逻辑
import { songs } from './songs.js';

class GuitarChartApp {
    constructor() {
        this.currentView = 'list';
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderSongsList();
    }

    bindEvents() {
        const backBtn = document.getElementById('backBtn');
        backBtn.addEventListener('click', () => this.showSongsList());
    }

    renderSongsList() {
        const songsListElement = document.getElementById('songsList');
        const songDisplayElement = document.getElementById('songDisplay');
        
        // 隐藏歌曲显示，显示歌曲列表
        songDisplayElement.style.display = 'none';
        songsListElement.parentElement.style.display = 'block';
        
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
        
        card.addEventListener('click', () => this.showSong(song));
        
        return card;
    }

    showSong(song) {
        const songsListElement = document.getElementById('songsList');
        const songDisplayElement = document.getElementById('songDisplay');
        const songTitleElement = document.getElementById('songTitle');
        const songArtistElement = document.getElementById('songArtist');
        const songContentElement = document.getElementById('songContent');
        
        // 隐藏歌曲列表，显示歌曲内容
        songsListElement.parentElement.style.display = 'none';
        songDisplayElement.style.display = 'block';
        
        // 设置歌曲信息
        songTitleElement.textContent = song.title;
        songArtistElement.textContent = `演唱者: ${song.artist}`;
        songContentElement.textContent = song.content;
        
        this.currentView = 'song';
    }

    showSongsList() {
        this.renderSongsList();
        this.currentView = 'list';
    }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new GuitarChartApp();
});

// 也可以直接初始化，因为我们使用了module类型
// new GuitarChartApp();